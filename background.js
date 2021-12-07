chrome.runtime.onInstalled.addListener(() => {

  chrome.tabs.onUpdated.addListener(
    (tabId, changeInfo) => {

      if (changeInfo.status === 'complete') {

        // There ought to be only one alarm for each tab
        if (alarmReferences[tabId]) {
          chrome.alarms.clear(alarmReferences[tabId])
          delete alarmReferences[tabId]
        }
        chrome.tabs.sendMessage(tabId, {
          message: 'tab_updated',
          tabId
        })
      }
    }
  )

  const alarmReferences = {}

  chrome.runtime.onMessage.addListener((request) => {
    if (request.message === 'build_completed') {

      const map = {
        passed: {
          iconUrl: 'images/check-mark.png',
          message: 'Build has passed',
          audio: 'audio/passed.mp3'
        },
        failed: {
          iconUrl: 'images/cross-mark.png',
          message: 'Build has failed',
          audio: 'audio/failed.mp3'
        },
        canceled: {
          iconUrl: 'images/exclamation-mark.png',
          message: 'Build has canceled',
          audio: 'audio/canceled.mp3'
        },
        blocked: {
          iconUrl: 'images/paused-mark.png',
          message: 'Build is blocked',
          audio: 'audio/blocked.mp3'
        }
      }

      const { iconUrl, message, audio } = map[request.result]

      chrome.notifications.create(`${request.buildId}-${request.tabId}`, {
        message,
        title: atob(request.branch),
        type: 'basic',
        iconUrl,
        requireInteraction: true
      })

      const tone = new Audio(audio)
      tone.play()
    } else if (request.message === 'create_alarm') {
      const { buildId, branch, tabId } = request
      const alarmName = `${buildId}-${branch}-${tabId}`
      chrome.storage.sync.get('thresholdInMinutes', ({ thresholdInMinutes: delayInMinutes }) => {
        if (delayInMinutes > 0) {
          chrome.alarms.create(alarmName, { delayInMinutes })
          alarmReferences[tabId] = alarmName
        }
      })
    } else if (request.message === 'clear_alarm') {
      const { buildId, branch, tabId } = request
      const alarmName = `${buildId}-${branch}-${tabId}`
      chrome.alarms.clear(alarmName)
      delete alarmReferences[tabId]
    }
  })

  chrome.notifications.onClicked.addListener((notificationId) => {
    // `notificationId` has format `${buildId}-${tabId}`
    // Note that parseInt is mandatory here.
    // Chrome extension has a strict data type check.
    // Passing string of number to a number parameter will result in an error.
    const tabId = parseInt(notificationId.split('-')[1])

    // Focus on the tab which initiated the notification
    chrome.tabs.update(parseInt(tabId), {
      active: true
    }, (tab) => {
      // Chrome is a multi-window application hence we need to focus on the window as well
      chrome.windows.update(tab.windowId, { focused: true }, () => {
        chrome.notifications.clear(notificationId)
      })
    })
  })

  chrome.alarms.onAlarm.addListener((alarm) => {
    const [buildId, branch, tabId] = alarm.name.split('-')
    chrome.notifications.create(`${buildId}-${tabId}`, {
      message: 'Build timed out',
      title: atob(branch),
      type: 'basic',
      iconUrl: 'images/sand-clock.png',
      requireInteraction: true
    })

    const tone = new Audio('audio/timedout.mp3')
    tone.play()
  })

  chrome.storage.sync.set({ thresholdInMinutes: 35, autoBypassBlockedSteps: false })

  chrome.declarativeContent.onPageChanged.removeRules(undefined, () => {
    chrome.declarativeContent.onPageChanged.addRules([{
      conditions: [new chrome.declarativeContent.PageStateMatcher({
        pageUrl: { urlMatches: 'buildkite.com/' },
      })],
      actions: [new chrome.declarativeContent.ShowPageAction()]
    }])
  })
})

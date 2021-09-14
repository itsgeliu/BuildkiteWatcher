chrome.runtime.onInstalled.addListener(() => {
  chrome.tabs.onUpdated.addListener(
    function(tabId, changeInfo, tab) {
      console.log('background: on update')

      if (changeInfo.status === 'complete') {
        console.log('background: on update completed')
        chrome.tabs.sendMessage(tabId, {
          message: 'tab_updated',
          tabId
        })
      }
    }
  )

  chrome.runtime.onMessage.addListener((request) => {
    if (request.message === 'build_completed') {
      console.log('build_completed message received:', request)

      const map = {
        passed: {
          iconUrl: 'images/check-mark.png',
          message: 'Build has passed'
        },
        failed: {
          iconUrl: 'images/cross-mark.png',
          message: 'Build has failed'
        },
        canceled: {
          iconUrl: 'images/exclamation-mark.png',
          message: 'Build has canceled'
        }
      }

      const { iconUrl, message } = map[request.result]

      chrome.notifications.create(`${request.buildId}-${request.tabId}`, {
        message,
        title: request.branch,
        type: 'basic',
        iconUrl,
        requireInteraction: true
      })

      const tone = new Audio('audio/finish-tone.wav')
      tone.play()
    }
  })

  chrome.notifications.onClicked.addListener((notificationId) => {
    console.log(`clicked ${notificationId}`)
    // `notificationId` has format `${buildId}-${tabId}`
    // Note that parseInt is mandatory here.
    // Chrome extension has a strict data type check.
    // Passing string of number to a number parameter will result in an error.
    const tabId = parseInt(notificationId.split('-')[1])

    // Focus on the tab which initiated the notification
    chrome.tabs.update(parseInt(tabId), {
      active: true
    }, (tab) => {
      console.log(`windowId: ${tab.windowId}`)
      // Chrome is a multi-window application hence we need to focus on the window as well
      chrome.windows.update(tab.windowId, { focused: true }, () => {
        chrome.notifications.clear(notificationId)
      })
    })

    // another solution:
    // chrome.tabs.get(tabId, function(tab) {
    //   chrome.tabs.highlight({ tabs: tab.index, windowId: tab.windowId }, () => {
    //     chrome.notifications.clear(notificationId)
    //   })
    // })
  })
})
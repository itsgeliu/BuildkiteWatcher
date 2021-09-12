console.log('log init')

chrome.runtime.onInstalled.addListener(() => {
  chrome.tabs.onUpdated.addListener(
    function(tabId, changeInfo, tab) {
      console.log('on update')
      console.log(tabId)

      if (changeInfo.status === 'complete') {
        console.log('on update completed')
        chrome.tabs.sendMessage(tabId, {
          message: 'TabUpdated',
          tabId
        })
      }
    }
  )

  chrome.runtime.onMessage.addListener((request) => {
    if (request.message === 'build_completed') {
      console.log('build_completed message received:', request)

      const iconUrl = request.result === 'passed' ? 'images/check-mark.png' : 'images/cross-mark.png'
      const message = request.result === 'passed' ? 'Build has passed' : 'Build has failed'
      chrome.notifications.create(`${request.commit}-${request.tabId}`, {
        message,
        title: request.branch,
        type: 'basic',
        iconUrl,
        requireInteraction: true
      })
    }
  })

  chrome.notifications.onClicked.addListener((notificationId) => {
    console.log(`clicked ${notificationId}`)
    // notificationId has format `${commit}-${tabId}`
    const tabId = notificationId.split('-')[1]

    // Focus on the tab which initiated the notification
    // Note that parseInt is mandatory here.
    // Chrome extension has a strict data type check.
    // Type coercion will result in an error.
    chrome.tabs.update(parseInt(tabId), {
      active: true
    }, () => {
      // clear notification after user clicks on it
      chrome.notifications.clear(notificationId)
    })
  })
})
* Reason not using manifest v3

Manifest v3 is using service worker instead of background pages in v2. Service worker is great except that [it terminates when idle and restarts when needed](https://developer.chrome.com/docs/extensions/mv3/migrating_to_service_workers/). In our case, we creat a MutationObserver in content script. It will fire the callback when the build comes to an end, whether passed, failed and canceled. But there is no way we can activate the service worker from content script if the service worker is inactive when the time comes. Hence, I fallback to Manifest v2.

Thoughts: can the [chrome.alarms](https://developer.chrome.com/docs/extensions/reference/alarms/) keep the service worker from being inactive?

Can the [long-lived connections](https://developer.chrome.com/docs/extensions/mv3/messaging/#connect) help?

A great explanation of service worker being inactive [here](https://stackoverflow.com/questions/29741922/prevent-service-worker-from-automatically-stopping)

* Another way to implement the notification

Instead of runnnig code directly in content script, we can [inject script](https://developer.chrome.com/docs/extensions/mv3/content_scripts/#functionality) into the web page. And use [Notification API](https://developer.mozilla.org/en-US/docs/Web/API/notification) to show notifications:

```
const notification = new Notification('Notification title', {
  icon: 'http://cdn.sstatic.net/stackexchange/img/logos/so/so-icon.png',
  body: 'Hey there! You\'ve been notified!',
  requireInteraction: true, // keep the notification long lasting
});
notification.onclick = function() {
  window.focus();
  notification.close();
};
```

* Further improvement

Have a good look at the [permissions](https://developer.chrome.com/docs/extensions/mv3/declare_permissions/) in the manifest.

* Good learning resource

https://betterprogramming.pub/building-chrome-extensions-communicating-between-scripts-75e1dbf12bb7

https://medium.com/@divakarvenu/lets-create-a-simple-chrome-extension-to-interact-with-dom-7bed17a16f42

[Adding modules support](https://stackoverflow.com/questions/48104433/how-to-import-es6-modules-in-content-script-for-chrome-extension)
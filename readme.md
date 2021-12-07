## How to use

### Installation

* Clone the repo to your local.
* Open the Extension management page by navigating to `chrome://extensions`.
* Enable Developer mode by clicking the toggle switch next to `Developer mode` at the top right corner.
* Click the `Load unpacked` button and select the extension directory.

Now you should see our `Buildkite watcher` in the extension list.

Next code and commit the code and open up its build page. Leave the tab open and instead of waiting for the build you can carry on your work at hand. You will get notified once the build is done. Clicking on the notification will lead you to the very tab which initialised the build.

### Settings

By clicking the extension icon to the right of the location bar a small popup will show allowing you to do settings. Currently two features are supported:

* **time out threshold**, default 35 minutes.
* **auto bypass blocked steps**, default `false`.

![Popup](../assets/popup.png)

Note that the popup only shows when current tab is a `buildkite.com` page.
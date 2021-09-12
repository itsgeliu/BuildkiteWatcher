chrome.runtime.onMessage.addListener((request) => {
  console.log('message received from backgroundjs')
  if (request.message === 'TabUpdated') {
    console.log('TabUpdated message received from backgroundjs')

    const $build = document.querySelector('.build-panel')

    console.log('build')
    console.log($build)

    if ($build) {
      const classNames = $build.className.split(' ')
      let result = null
      if (classNames.includes('build-state-failed')) {
        result = 'failed'
      } else if (classNames.includes('build-state-passed')) {
        result = 'passed'
      }

      if (result) {
        const commit = $build.querySelector('.commit a').innerText
        const branch = $build.querySelector('.branch a').innerText
        chrome.runtime.sendMessage({
          message: 'build_completed',
          tabId: request.tabId,
          result,
          commit,
          branch
        })
      }
    }

    const failedStateClassName = 'build-state-failed'
    const passedStateClassName = 'build-state-passed'

    if ($build) {
      const classNames = $build.className.split(' ')

      // Only watch for pending builds
      if (!classNames.includes(failedStateClassName) && !classNames.includes(passedStateClassName)) {
        var observer = new MutationObserver(() => {
          console.log('observer callback')
          const classNames = $build.className.split(' ')

          let result = null
          if (classNames.includes(failedStateClassName)) {
            result = 'failed'
          } else if (classNames.includes(passedStateClassName)) {
            result = 'passed'
          }

          if (result) {
            const commit = $build.querySelector('.commit a').innerText
            const branch = $build.querySelector('.branch a').innerText
            chrome.runtime.sendMessage({
              message: 'build_completed',
              title: document.location.href,
              tabId: request.tabId,
              result,
              commit,
              branch
            })
          }
        })
        observer.observe($build, { attributes: true })
      }

    }
  }

})
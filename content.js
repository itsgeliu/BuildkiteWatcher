chrome.runtime.onMessage.addListener((request) => {
  if (request.message === 'tab_updated') {
    console.log('tab_updated message received from backgroundjs')

    const $build = document.querySelector('.build-panel')

    console.log($build)

    const failedStateClassName = 'build-state-failed'
    const passedStateClassName = 'build-state-passed'
    const canceledStateClassName = 'build-state-canceled'
    const resultMapping = {
      [failedStateClassName]: 'failed',
      [passedStateClassName]: 'passed',
      [canceledStateClassName]: 'canceled'
    }

    // debug purpose
    // if ($build) {
    //   const classNames = $build.className.split(' ')
    //   let result = null
    //   Object.keys(resultMapping).forEach(state => {
    //     if (classNames.includes(state)) {
    //       result = resultMapping[state]
    //     }
    //   })

    //   if (result) {
    //     const branch = $build.querySelector('.branch a').innerText
    //     const commit = $build.querySelector('.commit a').innerText
    //     const buildId = $build.querySelector('.number').innerText.replace(/\D/g, '')
    //     chrome.runtime.sendMessage({
    //       message: 'build_completed',
    //       tabId: request.tabId,
    //       result,
    //       buildId,
    //       commit,
    //       branch
    //     })
    //   }
    // }

    if ($build) {
      const classNames = $build.className.split(' ')

      // Only watch for pending builds
      if (!classNames.includes(failedStateClassName)
        && !classNames.includes(passedStateClassName)
        && !classNames.includes(canceledStateClassName)) {
        var observer = new MutationObserver(() => {
          console.log('observer callback')

          const classNames = $build.className.split(' ')
          let result = null
          Object.keys(resultMapping).forEach(state => {
            if (classNames.includes(state)) {
              result = resultMapping[state]
            }
          })

          if (result) {
            const branch = $build.querySelector('.branch a').innerText
            const commit = $build.querySelector('.commit a').innerText
            const buildId = $build.querySelector('.number').innerText.replace(/\D/g, '')
            chrome.runtime.sendMessage({
              message: 'build_completed',
              tabId: request.tabId,
              result,
              buildId,
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
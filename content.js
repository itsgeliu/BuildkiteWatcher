const failedStateClassName = 'build-state-failed'
const passedStateClassName = 'build-state-passed'
const canceledStateClassName = 'build-state-canceled'
const resultMapping = {
  [failedStateClassName]: 'failed',
  [passedStateClassName]: 'passed',
  [canceledStateClassName]: 'canceled'
}

const getBuildInfo = ($build) => {
  return {
    // We don't want non alphanumerical characters in the branch name
    // 'cause the branch name is gonna be part of some IDs like notification ID and alarm ID.
    branch: btoa($build.querySelector('.branch a').innerText),
    commit: $build.querySelector('.commit a').innerText,
    buildId: $build.querySelector('.number').innerText.replace(/\D/g, '')
  }
}

/**
 *
 * @param {*} $build
 * @returns State of current build. Note that it is not a 1:1 map with buildkite
 * Buildkite has `scheduled` and `started` state. Those two will be mapped to `pending` in our cace
 * 'cause we don't care about the difference of them.
 */
const getResult = ($build) => {
  const classNames = $build.className.split(' ')
  let result = 'pending'
  Object.keys(resultMapping).forEach(state => {
    if (classNames.includes(state)) {
      result = resultMapping[state]
    }
  })

  return result
}

chrome.runtime.onMessage.addListener((request) => {
  if (request.message === 'tab_updated') {
    console.log('tab_updated message received from backgroundjs')

    const $build = document.querySelector('.build-panel')
    const { tabId } = request

    console.log($build)

    if ($build) {
      let result = getResult($build)
      const buildInfo = getBuildInfo($build)

      if (result === 'pending') {
        console.log('creating an alarm')
        chrome.runtime.sendMessage({ message: 'create_alarm', ...buildInfo, tabId})
      } else {
        // debug purpose
        // chrome.runtime.sendMessage({
        //   message: 'build_completed',
        //   tabId,
        //   result,
        //   ...buildInfo
        // })
      }

      const observer = new MutationObserver((records) => {
        console.log('observer callback')
        console.log(records)

        console.log('now the $build')
        console.log($build)

        const currentResult = getResult($build)
        const buildInfo = getBuildInfo($build)

        if (result === 'pending') {
          if (currentResult !== 'pending') {

            // from building to built
            chrome.runtime.sendMessage({
              message: 'build_completed',
              tabId: tabId,
              result: currentResult,
              ...buildInfo
            })

            chrome.runtime.sendMessage({ message: 'clear_alarm', ...buildInfo, tabId})
          }
        } else {
          // from built to building
          console.log('creating an alarm')
          chrome.runtime.sendMessage({ message: 'create_alarm', ...buildInfo, tabId})
        }

        result = currentResult
      })
      observer.observe($build, { attributes: true })
    }
  }

})

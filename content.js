const failedStateClassName = 'build-state-failed'
const passedStateClassName = 'build-state-passed'
const canceledStateClassName = 'build-state-canceled'
const blockedStateClassName = 'build-state-blocked'
const resultMapping = {
  [failedStateClassName]: 'failed',
  [passedStateClassName]: 'passed',
  [canceledStateClassName]: 'canceled',
  [blockedStateClassName]: 'blocked'
}

const pendingResult = 'pending'
const blockedResult = 'blocked'

const getFromStorage = (key) => {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get(key, (data) => {
      if (data.hasOwnProperty(key)) {
        resolve(data[key])
      } else {
        reject(new Error(`Key ${key} not found in storage`))
      }
    })
  })
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
  let result = pendingResult
  Object.keys(resultMapping).forEach(state => {
    if (classNames.includes(state)) {
      result = resultMapping[state]
    }
  })

  return result
}

chrome.runtime.onMessage.addListener((request) => {
  if (request.message === 'tab_updated') {

    const $build = document.querySelector('.build-panel')
    const { tabId } = request

    if ($build) {
      let previousResult = getResult($build)
      const buildInfo = getBuildInfo($build)

      if (previousResult === pendingResult) {
        chrome.runtime.sendMessage({ message: 'create_alarm', ...buildInfo, tabId})
      }

      const observer = new MutationObserver(async (records) => {

        const currentResult = getResult($build)
        const buildInfo = getBuildInfo($build)

        if (previousResult === pendingResult) {

          // from building to built
          // for simplicity, blocked state is regarded as a `completed` state
          if (currentResult !== pendingResult) {

            const shouldBypassBlockedSteps = currentResult === blockedResult && await getFromStorage('autoBypassBlockedSteps')
            let bypassedStepCount = 0
            if (shouldBypassBlockedSteps) {
              document.querySelectorAll('.build-pipeline-state-blocked').forEach(el => el.click())

              await new Promise((resolve) => {
                setTimeout(() => {
                  document.querySelectorAll('.Dialog__Box').forEach(el => {
                    el.querySelector('input[value="yes"]').click()
                    el.querySelector('button[type="submit"]').click()
                    bypassedStepCount += 1
                  })
                  resolve()
                }, 3000)
              })
            }

            // If shouldBypassBlockedSteps && bypassedStepCount === 0, it means we are unable to bypass the blocked steps.
            // So we fall back to `complete` state and notify the user.
            if (!shouldBypassBlockedSteps || bypassedStepCount === 0) {
              chrome.runtime.sendMessage({
                message: 'build_completed',
                tabId: tabId,
                result: currentResult,
                ...buildInfo
              })

              chrome.runtime.sendMessage({ message: 'clear_alarm', ...buildInfo, tabId})
            }
          }
        } else {
          // from built to building (most likely user clicked `retry`)
          chrome.runtime.sendMessage({ message: 'create_alarm', ...buildInfo, tabId})
        }

        previousResult = currentResult
      })

      observer.observe($build, { attributes: true })
    }
  }

})

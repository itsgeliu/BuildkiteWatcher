window.onload = () => {

  const $thresholdInput = document.querySelector('[name=thresholdInMinutes]')
  const $autoBypassBlockedSteps = document.querySelector('[name=autoBypassBlockedSteps')

  chrome.storage.sync.get(
    [
      'thresholdInMinutes',
      'autoBypassBlockedSteps'
    ],
    ({ thresholdInMinutes, autoBypassBlockedSteps }) => {
    $thresholdInput.value = thresholdInMinutes
    $autoBypassBlockedSteps.checked = autoBypassBlockedSteps
  })

  $thresholdInput.addEventListener('input', (e) => {
    const newThreshold = parseFloat(e.target.value)

    if (!isNaN(newThreshold)) {
      chrome.storage.sync.set({ thresholdInMinutes: newThreshold }, () => {
      })
    }
  })

  $autoBypassBlockedSteps.addEventListener('change', (e) => {
    chrome.storage.sync.set({ autoBypassBlockedSteps: e.target.checked })
  })
}
window.onload = () => {

  const $thresholdInput = document.querySelector('[name=threshouldInMinutes]')

  chrome.storage.sync.get('thresholdInMinutes', ({ thresholdInMinutes }) => {
    $thresholdInput.value = thresholdInMinutes
  })

  document.querySelector('[name=threshouldInMinutes]').addEventListener('input', (e) => {
    const newThreshold = parseFloat(e.target.value)

    if (!isNaN(newThreshold)) {
      chrome.storage.sync.set({ thresholdInMinutes: newThreshold }, () => {
      })
    }
  })
}
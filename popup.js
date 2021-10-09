window.onload = () => {

  const $thresholdInput = document.querySelector('[name=thresholdInMinutes]')

  chrome.storage.sync.get('thresholdInMinutes', ({ thresholdInMinutes }) => {
    $thresholdInput.value = thresholdInMinutes
  })

  document.querySelector('[name=thresholdInMinutes]').addEventListener('input', (e) => {
    const newThreshold = parseFloat(e.target.value)

    if (!isNaN(newThreshold)) {
      chrome.storage.sync.set({ thresholdInMinutes: newThreshold }, () => {
      })
    }
  })
}
(() => {
  fetch('/web-vitals-optimization/api/preload', {
    credentials: 'include',
    mode: 'no-cors',
  }).then((res) => {
    return res.json()
  }).then((data) => {
    document.getElementById('preload').innerText = JSON.stringify(data)
  })

  fetch('/web-vitals-optimization/api/no-preload', {
    credentials: 'include',
    mode: 'no-cors',
  }).then((res) => {
    return res.json()
  }).then((data) => {
    document.getElementById('no-preload').innerText = JSON.stringify(data)
  })
})()

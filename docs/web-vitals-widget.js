(function () {

  const root = document.createElement('div')
  root.style.position = 'fixed'
  root.style.bottom = '0'
  root.style.left = '0'
  root.style.width = '100vw'
  root.style.backgroundColor = 'rgba(0, 0, 0, 0.75)'
  root.style.padding = '2px'
  root.style.color = 'white'
  root.style.boxSizing = 'border-box'
  document.body.appendChild(root)

  const vitalsValues = {
    FCP: null,
    LCP: null,
    CLS: null,
  }

  function setupVitals() {
    const script = document.createElement('script')
    script.src = '/web-vitals-optimization/output/web-vitals.umd.js'
    document.head.appendChild(script)

    const vitals = document.createElement('div')
    vitals.style.fontSize = '12px'
    vitals.style.display = 'inline-block'
    root.appendChild(vitals)

    function format(value, n = 2) {
      return typeof value === 'number' ? `${value.toFixed(n)}` : '?'
    }

    root.addEventListener('render', () => {
      vitals.innerText = `FCP: ${format(vitalsValues.FCP)}ms | LCP: ${format(vitalsValues.LCP)}ms | CLS: ${format(vitalsValues.CLS, 4)}`
    })

    script.onload = function () {
      webVitals.getCLS((e) => {
        vitalsValues.CLS = e.value
        root.dispatchEvent(new Event('render'))
      }, true)
      webVitals.getLCP((e) => {
        vitalsValues.LCP = e.value
        root.dispatchEvent(new Event('render'))
      }, true)
      webVitals.getFCP((e) => {
        vitalsValues.FCP = e.value
        root.dispatchEvent(new Event('render'))
      }, true)
    }
  }

  function setupTiming() {
    root.addEventListener('render', () => {
      const lines = getTiming()
      render(lines)
    })

    const toggle = document.createElement('button')
    toggle.innerText = 'View Timing'
    root.appendChild(toggle)

    const timing = document.createElement('div')
    root.appendChild(timing)

    const graph = document.createElement('div')
    graph.style.display = 'none'
    graph.style.fontSize = '12px'
    graph.style.maxHeight = '80vh'
    graph.style.overflowY = 'auto'
    timing.appendChild(graph)

    toggle.addEventListener('click', () => {
      if (graph.style.display === 'none') {
        graph.style.display = 'block'
        toggle.innerText = 'Close Timing'
      } else {
        graph.style.display = 'none'
        toggle.innerText = 'View Timing'
      }
    })


    const observer = new PerformanceObserver(function () {
      root.dispatchEvent(new Event('render'))
    })

    observer.observe({ entryTypes: ['navigation', 'resource'] })

    function getTiming() {
      const lines = []
      const entries = performance.getEntries()

      if (vitalsValues.FCP) {
        lines.push({
          name: 'FCP',
          type: 'vital',
          start: vitalsValues.FCP,
          end: vitalsValues.FCP,
        })
      }

      if (vitalsValues.LCP) {
        lines.push({
          name: 'LCP',
          type: 'vital',
          start: vitalsValues.LCP,
          end: vitalsValues.LCP,
        })
      }

      for (const entry of entries) {
        if (entry instanceof PerformanceNavigationTiming) {
          lines.push({
            name: 'navigation',
            type: 'navigation',
            start: entry.startTime,
            end: entry.loadEventEnd,
          })
        }

        if (entry instanceof PerformanceResourceTiming) {
          const u = new URL(entry.name)
          if (u.pathname.includes('web-vitals-widget.js') || u.pathname.includes('web-vitals.umd.js')) {
            continue
          }
          const p = u.pathname.replace('/web-vitals-optimization', '')
          lines.push({
            type: 'resource',
            name: p + u.search,
            start: entry.startTime,
            end: entry.responseEnd,
          })
        }
      }

      lines.sort((a, b) => a.start - b.start)

      return lines
    }

    const colorMap = {
      navigation: 'blue',
      resource: 'red',
      vital: 'green'
    }

    function render(lines) {
      if (!lines.length) {
        return
      }
      const content = []
      let start = lines[0].start
      let end = 0
      for (const line of lines) {
        if (line.end > end) {
          end = line.end
        }
      }

      const total = end - start

      for (const line of lines) {
        const d = line.end - line.start
        content.push(`<div>${line.name}</div><div style="width: ${d / total * 100}%;margin-left: min(${line.start / total * 100}%, calc(${line.start / total * 100}% - 2px));height: 4px; background-color: ${colorMap[line.type]}; min-width: 2px"></div>`)
      }

      graph.innerHTML = content.join('')
    }
  }

  setupVitals()
  setupTiming()
}())

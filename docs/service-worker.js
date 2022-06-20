const resourceList = [
  '/assets/cat-01.jpg',
  '/assets/bogdan-farca-CEx86maLUSc-unsplash.jpg',
  '/assets/kabo-sR0cTmQHPug-unsplash.jpg',
  '/assets/loan-7AIDE8PrvA0-unsplash.jpg',
  '/assets/remi-remino-E9kVmtiqqGE-unsplash.jpg',
  '/assets/Pacifico-Regular.ttf?sleep=2000',
  '/output/web-vitals.umd.js',
  '/pages/01-showing.html',
  '/pages/02-timing.html',
  '/pages/03-lazyload.html',
  '/pages/04-preload.html',
  '/pages/05-swr.html',
  '/pages/06-cls.html',
  '/pages/lazyload.js?sleep=2000',
  '/pages/lazyload-img.html',
  '/pages/lazyload-js.html',
  '/pages/preload.html',
  '/pages/preload-app.js?sleep=3000',
  '/pages/showing.html?type=header',
  '/pages/showing.html?type=skeleton',
  '/pages/showing.html?type=text',
  '/pages/swr.html',
  '/pages/timing.css?sleep=2000',
  '/pages/timing.html?sleep=1000',
  '/web-vitals-widget.js',
]

function sleep(time) {
  return new Promise((resolve) => {
    setTimeout(resolve, time)
  })
}

self.addEventListener('message', async (event) => {
  const { type } = event.data

  if (type === 'refresh') {
    caches.keys().then((keys) => Promise.all(keys.map((key) => caches.delete(key)))).then(() => {
      addResourcesToCache(resourceList)
    })
  }
})

self.addEventListener('install', function (event) {
  event.waitUntil(
    addResourcesToCache(resourceList)
  );
})

const addResourcesToCache = async (resources) => {
  const cache = await caches.open('v1');
  await cache.addAll(resources.map((d) => `/web-vitals-optimization${d}`));
};

const putInCache = async (request, response) => {
  const cache = await caches.open('v1');
  await cache.put(request, response);
};

const enableNavigationPreload = async () => {
  if (self.registration.navigationPreload) {
    // Enable navigation preloads!
    await self.registration.navigationPreload.enable();
  }
};

self.addEventListener('activate', (event) => {
  event.waitUntil(enableNavigationPreload());
});


const cacheFirst = async ({ request, preloadResponsePromise, fallbackUrl }) => {
  const url = new URL(request.url)
  if (url.pathname === '/web-vitals-optimization/api/preload') {
    await sleep(2000)
    return new Response(JSON.stringify({ msg: '这个数据来自用 Service Worker 模拟的接口，有 2000ms 的延迟，使用 preload 加载' }), {
      headers: { 'Content-Type': 'text/json' }
    })
  }

  if (url.pathname === '/web-vitals-optimization/api/no-preload') {
    await sleep(2000)
    return new Response(JSON.stringify({ msg: '这个数据来自用 Service Worker 模拟的接口，有 2000ms 的延迟，没有 preload' }), {
      headers: { 'Content-Type': 'text/json' }
    })
  }

  if (url.pathname === '/web-vitals-optimization/api/slow') {
    await sleep(5000)
    const d = new Date()
    return new Response(JSON.stringify({ msg: `这是个很慢的接口，响应生成于：${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}` }), {
      headers: {
        'Content-Type': 'text/json',
        'Cache-Control': 'public, max-age=10, stale-while-revalidate=30'
      }
    })
  }

  // // First try to get the resource from the cache
  const responseFromCache = await caches.match(request);
  if (responseFromCache) {
    return responseFromCache;
  }

  // Next try to use the preloaded response, if it's there
  const preloadResponse = await preloadResponsePromise;
  if (preloadResponse) {
    putInCache(request, preloadResponse.clone());
    return preloadResponse;
  }

  // Next try to get the resource from the network
  try {
    const responseFromNetwork = await fetch(request);
    // response may be used only once
    // we need to save clone to put one copy in cache
    // and serve second one
    putInCache(request, responseFromNetwork.clone());
    return responseFromNetwork;
  } catch (error) {
    const fallbackResponse = await caches.match(fallbackUrl);
    if (fallbackResponse) {
      return fallbackResponse;
    }
    // when even the fallback response is not available,
    // there is nothing we can do, but we must always
    // return a Response object
    return new Response('Network error happened', {
      status: 408,
      headers: { 'Content-Type': 'text/plain' },
    });
  }
};



self.addEventListener('fetch', async function(event) {
  const url = new URL(event.request.url)

  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    event.respondWith(
      fetch(event.request).catch(() => {})
    )
    return
  }

  const time = parseInt(url.searchParams.get('sleep')) || 0

  if (time) {
    event.respondWith(
      sleep(time).then(() => {
        return cacheFirst({
          request: event.request,
          preloadResponsePromise: event.preloadResponse,
        })
      })
    );
  } else {
    event.respondWith(
      cacheFirst({
        request: event.request,
        preloadResponsePromise: event.preloadResponse,
      })
    );
  }
});

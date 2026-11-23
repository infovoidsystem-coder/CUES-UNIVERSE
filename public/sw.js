const prefix = 'austral-manga-'
const cacheName = prefix + 'v1'
const shell = ['./', './manifest.webmanifest', './icons/austral-192.png', './icons/austral-512.png']
self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(cacheName)
    const response = await fetch('./', {cache: 'reload'})
    if (!response.ok) throw new Error('Inicio no disponible')
    const html = await response.clone().text()
    const assets = [...html.matchAll(/(?:src|href)="(\.\/assets\/[^"]+)"/g)].map(match => match[1])
    await cache.addAll([...shell.slice(1), ...assets])
    await cache.put('./', response)
    await self.skipWaiting()
  })())
})
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const names = await caches.keys()
    await Promise.all(names.filter(name => name.startsWith(prefix) && name !== cacheName).map(name => caches.delete(name)))
    await self.clients.claim()
  })())
})
self.addEventListener('fetch', event => {
  const request = event.request
  if (request.method !== 'GET' || !request.url.startsWith(self.registration.scope)) return
  if (request.mode === 'navigate') {
    event.respondWith(fetch(request).catch(() => caches.open(cacheName).then(cache => cache.match('./'))))
    return
  }
  if (!['image','script','style'].includes(request.destination)) return
  event.respondWith((async () => {
    const cache = await caches.open(cacheName)
    const cached = await cache.match(request)
    if (cached) return cached
    const response = await fetch(request)
    if (response.ok) await cache.put(request, response.clone())
    return response
  })())
})

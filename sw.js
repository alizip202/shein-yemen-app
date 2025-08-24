// Service Worker for SHEIN Yemen PWA
const CACHE_NAME = 'shein-yemen-v1.0.0';
const API_CACHE_NAME = 'shein-yemen-api-v1.0.0';

// Files to cache for offline functionality
const STATIC_CACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  // External resources
  'https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

// API endpoints to cache
const API_CACHE_URLS = [
  '/api/products',
  '/api/products/search'
];

// Install event - cache static resources
self.addEventListener('install', event => {
  console.log('🔧 Service Worker: Installing...');
  
  event.waitUntil(
    Promise.all([
      // Cache static files
      caches.open(CACHE_NAME).then(cache => {
        console.log('📦 Service Worker: Caching static files');
        return cache.addAll(STATIC_CACHE_URLS.map(url => new Request(url, {
          cache: 'reload'
        })));
      }),
      
      // Skip waiting to activate immediately
      self.skipWaiting()
    ])
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('✅ Service Worker: Activating...');
  
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== CACHE_NAME && cacheName !== API_CACHE_NAME) {
              console.log('🗑️ Service Worker: Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      
      // Take control of all clients
      self.clients.claim()
    ])
  );
});

// Fetch event - handle network requests
self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Handle API requests
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(request));
    return;
  }
  
  // Handle static file requests
  event.respondWith(handleStaticRequest(request));
});

// Handle API requests with network-first strategy
async function handleApiRequest(request) {
  const cache = await caches.open(API_CACHE_NAME);
  
  try {
    // Try network first
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Cache successful responses
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('🌐 Service Worker: Network failed, trying cache for:', request.url);
    
    // Fallback to cache
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline fallback for API requests
    return new Response(JSON.stringify({
      success: false,
      error: 'لا يوجد اتصال بالإنترنت',
      offline: true,
      cached_data: null
    }), {
      status: 503,
      statusText: 'Service Unavailable',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-cache'
      }
    });
  }
}

// Handle static requests with cache-first strategy
async function handleStaticRequest(request) {
  const cache = await caches.open(CACHE_NAME);
  
  // Try cache first
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    // Update cache in background
    fetch(request).then(response => {
      if (response.ok) {
        cache.put(request, response.clone());
      }
    }).catch(() => {
      // Ignore network errors for background updates
    });
    
    return cachedResponse;
  }
  
  // Try network
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Cache successful responses
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('🌐 Service Worker: Network failed for:', request.url);
    
    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
      return cache.match('/index.html');
    }
    
    // Return generic offline response
    return new Response('المحتوى غير متاح بدون اتصال', {
      status: 503,
      statusText: 'Service Unavailable',
      headers: {
        'Content-Type': 'text/plain; charset=utf-8'
      }
    });
  }
}

// Handle background sync
self.addEventListener('sync', event => {
  console.log('🔄 Service Worker: Background sync triggered:', event.tag);
  
  if (event.tag === 'background-sync-orders') {
    event.waitUntil(syncPendingOrders());
  }
});

// Sync pending orders when back online
async function syncPendingOrders() {
  try {
    // Get pending orders from IndexedDB or localStorage
    const pendingOrders = await getPendingOrders();
    
    for (const order of pendingOrders) {
      try {
        const response = await fetch('/api/orders/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(order)
        });
        
        if (response.ok) {
          // Remove from pending orders
          await removePendingOrder(order.id);
          console.log('✅ Service Worker: Order synced successfully:', order.id);
        }
      } catch (error) {
        console.log('❌ Service Worker: Failed to sync order:', order.id, error);
      }
    }
  } catch (error) {
    console.log('❌ Service Worker: Background sync failed:', error);
  }
}

// Helper functions for pending orders (simplified)
async function getPendingOrders() {
  // In a real app, this would use IndexedDB
  return JSON.parse(localStorage.getItem('pending_orders') || '[]');
}

async function removePendingOrder(orderId) {
  const pending = await getPendingOrders();
  const filtered = pending.filter(order => order.id !== orderId);
  localStorage.setItem('pending_orders', JSON.stringify(filtered));
}

// Handle push notifications
self.addEventListener('push', event => {
  console.log('📱 Service Worker: Push notification received');
  
  const options = {
    body: 'لديك تحديث جديد في طلبك',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [200, 100, 200],
    data: {
      url: '/#orders'
    },
    actions: [
      {
        action: 'view',
        title: 'عرض الطلب',
        icon: '/icons/icon-96x96.png'
      },
      {
        action: 'dismiss',
        title: 'إغلاق',
        icon: '/icons/icon-96x96.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('شين اليمن', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', event => {
  console.log('🔔 Service Worker: Notification clicked');
  
  event.notification.close();
  
  if (event.action === 'view') {
    event.waitUntil(
      clients.openWindow(event.notification.data.url || '/')
    );
  }
});

// Handle messages from main thread
self.addEventListener('message', event => {
  console.log('💬 Service Worker: Message received:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({
      version: CACHE_NAME
    });
  }
});

// Periodic background sync (if supported)
self.addEventListener('periodicsync', event => {
  console.log('⏰ Service Worker: Periodic sync triggered:', event.tag);
  
  if (event.tag === 'update-products') {
    event.waitUntil(updateProductsCache());
  }
});

// Update products cache in background
async function updateProductsCache() {
  try {
    const cache = await caches.open(API_CACHE_NAME);
    const response = await fetch('/api/products');
    
    if (response.ok) {
      await cache.put('/api/products', response.clone());
      console.log('✅ Service Worker: Products cache updated');
    }
  } catch (error) {
    console.log('❌ Service Worker: Failed to update products cache:', error);
  }
}

console.log('🚀 Service Worker: Loaded successfully');


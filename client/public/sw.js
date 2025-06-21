// Service Worker for Push Notifications
const CACHE_NAME = 'socialx-v1';

// Install event
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  event.waitUntil(self.clients.claim());
});

// Push event for push notifications
self.addEventListener('push', (event) => {
  console.log('Push event received:', event);
  
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body || 'Message sent',
      icon: '/logo192.png',
      badge: '/logo192.png',
      tag: 'sent-message',
      renotify: true,
      requireInteraction: false,
      actions: [
        {
          action: 'open',
          title: 'Open Chat'
        }
      ]
    };

    event.waitUntil(
      self.registration.showNotification(data.title || 'Message Sent', options)
    );
  }
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);
  
  event.notification.close();
  
  if (event.action === 'open') {
    event.waitUntil(
      self.clients.matchAll({ type: 'window' }).then((clientList) => {
        if (clientList.length > 0) {
          clientList[0].focus();
        } else {
          self.clients.openWindow('/');
        }
      })
    );
  }
});

// Background sync for offline support
self.addEventListener('sync', (event) => {
  console.log('Background sync event:', event);
  if (event.tag === 'send-message') {
    event.waitUntil(sendPendingMessages());
  }
});

// Function to send pending messages when back online
async function sendPendingMessages() {
  // This would handle sending messages that were queued while offline
  console.log('Sending pending messages...');
} 
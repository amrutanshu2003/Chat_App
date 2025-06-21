const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  showNotification: (options) => ipcRenderer.invoke('show-notification', options),
  showPushNotification: (options) => ipcRenderer.invoke('show-push-notification', options),
  notificationsSupported: () => ipcRenderer.invoke('notifications-supported')
}); 
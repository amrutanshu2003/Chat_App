const { app, BrowserWindow, Notification, ipcMain } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
  });
  win.loadFile(path.join(__dirname, 'build', 'index.html'));
}

// Handle notification requests from renderer process
ipcMain.handle('show-notification', async (event, { title, body, icon, silent = false }) => {
  if (Notification.isSupported()) {
    const notification = new Notification({
      title: title || 'New Message',
      body: body || 'You have received a new message',
      icon: icon || path.join(__dirname, 'build', 'logo192.png'),
      silent: silent,
      requireInteraction: false,
      urgency: 'normal',
      // Enable push notification behavior
      actions: [],
      badge: path.join(__dirname, 'build', 'logo192.png'),
      tag: 'chat-message',
      renotify: true
    });
    
    notification.show();
    
    // Handle notification click
    notification.on('click', () => {
      // Focus the window when notification is clicked
      const windows = BrowserWindow.getAllWindows();
      if (windows.length > 0) {
        windows[0].focus();
      }
    });
    
    // Handle notification close
    notification.on('close', () => {
      console.log('Notification closed');
    });
    
    return true;
  }
  return false;
});

// Handle push notification requests specifically for sent messages
ipcMain.handle('show-push-notification', async (event, { title, body, icon, silent = false }) => {
  if (Notification.isSupported()) {
    const notification = new Notification({
      title: title || 'Message Sent',
      body: body || 'Your message has been sent',
      icon: icon || path.join(__dirname, 'build', 'logo192.png'),
      silent: silent,
      requireInteraction: false,
      urgency: 'low',
      // Push notification specific settings
      actions: [],
      badge: path.join(__dirname, 'build', 'logo192.png'),
      tag: 'sent-message',
      renotify: true,
      // Make it appear in notification center
      timeoutType: 'default'
    });
    
    notification.show();
    
    // Handle notification click
    notification.on('click', () => {
      // Focus the window when notification is clicked
      const windows = BrowserWindow.getAllWindows();
      if (windows.length > 0) {
        windows[0].focus();
      }
    });
    
    return true;
  }
  return false;
});

// Check if notifications are supported
ipcMain.handle('notifications-supported', async () => {
  return Notification.isSupported();
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
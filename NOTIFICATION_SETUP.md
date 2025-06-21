# Notification Setup Guide

This guide explains how to set up and use the notification feature in the Social X chat application.

## Features

- **Desktop Notifications**: Receive notifications when new messages arrive
- **Notification Settings**: Control notification preferences
- **Sound Support**: Optional notification sounds
- **Message Preview**: Show/hide message content in notifications
- **Group Message Notifications**: Notifications for group messages
- **Smart Unread Counts**: Unread message counts that reset when you open a chat

## Setup Instructions

### 1. Install Dependencies

First, install the required dependencies:

```bash
cd client
npm install
```

### 2. Build the Application

Build the React application:

```bash
npm run build
```

### 3. Run the Electron App

Start the Electron application:

```bash
npm run electron
```

Or for development mode:

```bash
npm run electron-dev
```

## How to Use Notifications

### 1. Enable Notifications

1. Log in to the application
2. Click on your profile avatar in the sidebar
3. Select "Settings" from the menu
4. Click on "Notification" to open notification settings
5. Toggle "Enable Notifications" to turn on desktop notifications

### 2. Configure Notification Settings

In the notification settings dialog, you can configure:

- **Enable Notifications**: Turn notifications on/off
- **Notification Sound**: Enable/disable notification sounds
- **Show Message Preview**: Show/hide message content in notifications

### 3. Notification Behavior

- Notifications appear when:
  - You receive a new message from someone
  - You receive a new group message
  - The chat window is not focused
  - The specific chat is not currently open

- Notifications include:
  - Sender's name
  - Message preview (if enabled)
  - App icon
  - Sound (if enabled)

### 4. Clicking Notifications

- Click on a notification to focus the application window
- The notification will automatically open the relevant chat

### 5. Unread Message Counts

- **Automatic Reset**: When you click on a chat, the unread count for that user/group automatically resets to zero
- **Real-time Updates**: Unread counts update in real-time as new messages arrive
- **Smart Counting**: Counts only increment when the chat is not currently open
- **Persistent Storage**: Unread counts are saved and restored between sessions

## Technical Details

### Electron Integration

The application uses Electron's native notification API for desktop notifications:

- `main.js`: Handles notification creation and IPC communication
- `preload.js`: Safely exposes notification API to renderer process
- `App.js`: Manages notification logic and user preferences

### Browser Fallback

If running in a browser (not Electron), the application falls back to the Web Notifications API.

### Notification Settings Storage

Notification preferences are stored in localStorage and persist between sessions.

### Unread Count Management

- Unread counts are managed in real-time using socket events
- Counts are automatically reset when a chat is opened
- Counts are persisted to localStorage for session restoration
- Both individual and group message counts are supported

## Troubleshooting

### Notifications Not Working

1. **Check Permissions**: Ensure the application has notification permissions
2. **Check Settings**: Verify notifications are enabled in the settings
3. **Check Focus**: Notifications only appear when the window is not focused
4. **Check Electron**: Ensure you're running the Electron version, not just the web version

### Sound Not Working

1. **Check System Volume**: Ensure your system volume is not muted
2. **Check Settings**: Verify "Notification Sound" is enabled in settings
3. **Check Browser**: Some browsers may block notification sounds

### Unread Counts Not Resetting

1. **Check Chat Selection**: Ensure you're clicking on the correct chat
2. **Check Network**: Verify socket connection is active
3. **Refresh App**: Try refreshing the application if counts seem stuck

### Development Notes

- Notifications work best in the Electron version
- Browser notifications require HTTPS in production
- Test notifications by sending messages between different user accounts
- Unread counts are managed through socket events and localStorage

## File Structure

```
client/
├── main.js                    # Electron main process with notification handlers
├── preload.js                 # Preload script for safe API exposure
├── src/
│   ├── App.js                 # Main app with notification logic and unread count management
│   └── NotificationSettingsDialog.js  # Notification settings UI
```

## API Reference

### Electron API (window.electronAPI)

- `showNotification(options)`: Show a desktop notification
- `notificationsSupported()`: Check if notifications are supported

### Notification Options

```javascript
{
  title: string,      // Notification title
  body: string,       // Notification body text
  icon: string,       // Icon URL
  silent: boolean     // Whether to play sound
}
```

### Notification Settings

```javascript
{
  enabled: boolean,       // Whether notifications are enabled
  sound: boolean,         // Whether to play notification sounds
  showPreview: boolean    // Whether to show message preview
}
```

### Unread Count Management

The application automatically manages unread counts through:

1. **Socket Events**: Real-time updates when messages arrive
2. **Chat Selection**: Automatic reset when opening a chat
3. **localStorage**: Persistence between sessions
4. **UI Updates**: Real-time badge updates in the sidebar 
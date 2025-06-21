import React, { useState, useEffect, useRef } from 'react';
import { Container, Box, TextField, Button, Typography, List, ListItem, Paper, Avatar, Dialog, DialogTitle, DialogContent, DialogActions, Checkbox, FormControlLabel, Switch, ListItemText, Tooltip } from '@mui/material';
import axios from 'axios';
import { io } from 'socket.io-client';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import VideoCallModal from './VideoCallModal';
import SendIcon from '@mui/icons-material/Send';
import VideocamIcon from '@mui/icons-material/Videocam';
import CallIcon from '@mui/icons-material/Call';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import GroupIcon from '@mui/icons-material/Group';
import PersonIcon from '@mui/icons-material/Person';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import IconButton from '@mui/material/IconButton';
import Sidebar from './Sidebar';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import PushPinIcon from '@mui/icons-material/PushPin';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import UserProfileDialog from './UserProfileDialog';
import NotificationSettingsDialog from './NotificationSettingsDialog';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import Divider from '@mui/material/Divider';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import StarIcon from '@mui/icons-material/Star';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import Cropper from 'react-easy-crop';
import Slider from '@mui/material/Slider';
import AddIcCallIcon from '@mui/icons-material/AddIcCall';
import MicIcon from '@mui/icons-material/Mic';
import SocialXIcon from './SocialXIcon';
import VideocamOutlinedIcon from '@mui/icons-material/VideocamOutlined';
import CallOutlinedIcon from '@mui/icons-material/CallOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import BlockIcon from '@mui/icons-material/Block';
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import DownloadIcon from '@mui/icons-material/Download';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import Drawer from '@mui/material/Drawer';
import ImageIcon from '@mui/icons-material/Image';
import AudiotrackIcon from '@mui/icons-material/Audiotrack';
import MovieIcon from '@mui/icons-material/Movie';
import DescriptionIcon from '@mui/icons-material/Description';
import Picker from '@emoji-mart/react';
import { Document, Page, pdfjs } from 'react-pdf';
import { renderAsync } from 'docx-preview';
import DeleteIcon from '@mui/icons-material/Delete';
import PauseIcon from '@mui/icons-material/Pause';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import AudioWaveform from './AudioWaveform'; // <-- Import the new component

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

const API_URL = 'http://localhost:5000/api';
const SOCKET_URL = 'http://localhost:5000';

const getFullUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return `http://localhost:5000${url}`;
};

function App() {
  // Register service worker for push notifications
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('Service Worker registered successfully:', registration);
          console.log('Service Worker scope:', registration.scope);
          
          // Check if service worker is active
          if (registration.active) {
            console.log('Service Worker is active');
          } else {
            console.log('Service Worker is not active yet');
          }
        })
        .catch((error) => {
          console.log('Service Worker registration failed:', error);
        });
    } else {
      console.log('Service Worker not supported in this browser');
    }
  }, []);

  const [page, setPage] = useState('login');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || null);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [socket, setSocket] = useState(null);
  const [avatar, setAvatar] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [groupMessages, setGroupMessages] = useState([]);
  const [groupMessage, setGroupMessage] = useState('');
  const [groupDialogOpen, setGroupDialogOpen] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [groupAvatar, setGroupAvatar] = useState('');
  const [groupMembers, setGroupMembers] = useState([]);
  const [groupTypingUsers, setGroupTypingUsers] = useState([]);
  const [darkMode, setDarkMode] = useState(() => {
    const stored = localStorage.getItem('darkMode');
    return stored ? JSON.parse(stored) : false;
  });
  const [error, setError] = useState('');
  const [callOpen, setCallOpen] = useState(false);
  const [callIncoming, setCallIncoming] = useState(false);
  const [callAccepted, setCallAccepted] = useState(false);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [peerConnection, setPeerConnection] = useState(null);
  const [callFrom, setCallFrom] = useState(null);
  const [audioOnly, setAudioOnly] = useState(false);
  const [nav, setNav] = useState('chats');
  const [search, setSearch] = useState('');
  const [pinned, setPinned] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [userStatusMap, setUserStatusMap] = useState({});
  const [isBlocked, setIsBlocked] = useState(false);
  const filteredUsers = users.filter(u => u.username.toLowerCase().includes(search.toLowerCase()));
  const pinnedChats = filteredUsers.filter(u => pinned.includes(u._id));
  const unpinnedChats = filteredUsers.filter(u => !pinned.includes(u._id));
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [profileDialogUser, setProfileDialogUser] = useState(null);
  const [filterMenuAnchor, setFilterMenuAnchor] = useState(null);
  const [expanded, setExpanded] = useState(true);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [cropImageSrc, setCropImageSrc] = useState(null);
  const [cropDialogOpen, setCropDialogOpen] = useState(false);
  const [unreadCounts, setUnreadCounts] = useState(() => {
    try {
      const stored = localStorage.getItem('unreadCounts');
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  }); // { userId: count }
  const [lastMessages, setLastMessages] = useState(() => {
    try {
      const stored = localStorage.getItem('lastMessages');
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  }); // { userId: lastMessage }
  // Ref for messages container
  const messagesContainerRef = useRef(null);
  const messagesEndRef = useRef(null);
  // Ref to track current selected user for socket events
  const selectedUserRef = useRef(null);
  const selectedGroupRef = useRef(null);
  // State for 3-dot menu anchor
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  // State for clear chat dialog
  const [clearChatDialogOpen, setClearChatDialogOpen] = useState(false);
  // Add state for image dialog
  const [openImageDialog, setOpenImageDialog] = useState(false);
  const [dialogImageUrl, setDialogImageUrl] = useState('');
  // Add state for zoom
  const [imageZoom, setImageZoom] = useState(1);
  // Add state for drawer and file type
  const [attachDrawerOpen, setAttachDrawerOpen] = useState(false);
  const [fileInputType, setFileInputType] = useState('');
  // Add state for menu anchor
  const [attachMenuAnchor, setAttachMenuAnchor] = useState(null);
  // Add state for emoji menu anchor
  const [emojiMenuAnchor, setEmojiMenuAnchor] = useState(null);
  const [pdfViewerOpen, setPdfViewerOpen] = useState(false);
  const [docxViewerOpen, setDocxViewerOpen] = useState(false);
  const [documentUrl, setDocumentUrl] = useState('');
  const docxContainerRef = useRef(null);
  
  // Notification settings state
  const [notificationSettings, setNotificationSettings] = useState(() => {
    try {
      const stored = localStorage.getItem('notificationSettings');
      return stored ? JSON.parse(stored) : { enabled: true, sound: true, showPreview: true, sentMessageNotifications: true };
    } catch {
      return { enabled: true, sound: true, showPreview: true, sentMessageNotifications: true };
    }
  });
  
  // Notification settings dialog state
  const [notificationSettingsDialogOpen, setNotificationSettingsDialogOpen] = useState(false);

  // Voice recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioChunks, setAudioChunks] = useState([]);
  const [recordingTimer, setRecordingTimer] = useState(null);
  const [isPaused, setIsPaused] = useState(false);

  const handleSeek = (msgId, time) => {
    const audio = audioRefs.current[msgId];
    if (audio && Number.isFinite(time)) {
      audio.currentTime = time;
    }
  };

  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      ...(darkMode
        ? {
            background: {
              default: '#000',
              paper: '#111',
            },
            text: {
              primary: '#fff',
              secondary: '#aaa',
            },
            primary: {
              main: '#1976d2',
            },
            secondary: {
              main: '#90caf9',
            },
          }
        : {
            background: {
              default: '#f5f5f5',
              paper: '#fff',
            },
            text: {
              primary: '#222',
              secondary: '#555',
            },
            primary: {
              main: '#1976d2',
            },
            secondary: {
              main: '#1976d2',
            },
          }),
    },
  });

  const [audioStates, setAudioStates] = useState({});
  const audioRefs = useRef({});

  const handlePlayPause = (msgId) => {
    if (!user || !user.id) return;
    Object.values(audioRefs.current).forEach(audio => {
      if (audio.id !== msgId && !audio.paused) {
        audio.pause();
      }
    });

    const audio = audioRefs.current[msgId];
    if (audio) {
      if (audio.paused) {
        audio.play();
      } else {
        audio.pause();
      }
    }
  };

  useEffect(() => {
    messages.forEach(msg => {
      let fileData;
      try {
        fileData = JSON.parse(msg.content);
      } catch (e) {
        return;
      }

      if (fileData && fileData.type === 'audio') {
        const audio = audioRefs.current[msg._id];
        if (audio) {
          const updateState = () => {
            setAudioStates(prev => ({
              ...prev,
              [msg._id]: {
                isPlaying: !audio.paused,
                currentTime: audio.currentTime,
                duration: audio.duration,
              }
            }));
          };

          audio.addEventListener('play', updateState);
          audio.addEventListener('pause', updateState);
          audio.addEventListener('ended', updateState);
          audio.addEventListener('timeupdate', updateState);
          audio.addEventListener('loadedmetadata', updateState);

          return () => {
            audio.removeEventListener('play', updateState);
            audio.removeEventListener('pause', updateState);
            audio.removeEventListener('ended', updateState);
            audio.removeEventListener('timeupdate', updateState);
            audio.removeEventListener('loadedmetadata', updateState);
          };
        }
      }
    });
  }, [messages]);

  // Save last selected chat to localStorage
  useEffect(() => {
    if (selectedUser) {
      localStorage.setItem('lastSelectedChat', JSON.stringify({ type: 'user', id: selectedUser._id }));
    } else if (selectedGroup) {
      localStorage.setItem('lastSelectedChat', JSON.stringify({ type: 'group', id: selectedGroup._id }));
    }
  }, [selectedUser, selectedGroup]);

  // Initialize socket after login
  useEffect(() => {
    if (user && token) {
      const s = io(SOCKET_URL);
      if (user?.id) s.emit('join', user.id);
      // Emit userOnline as soon as socket connects
      if (user?.id) s.emit('userOnline', user.id);
      // Re-emit userOnline on window focus/visibilitychange
      const handleOnline = () => { if (user?.id) s.emit('userOnline', user.id); };
      window.addEventListener('focus', handleOnline);
      document.addEventListener('visibilitychange', handleOnline);
      s.on('receiveMessage', (msg) => {
        console.log('receiveMessage event triggered:', msg);
        console.log('Current user ID:', user?.id);
        console.log('Message sender:', msg.sender);
        console.log('Is this a message from myself?', user?.id === msg.sender);
        console.log('Current selectedUser:', selectedUserRef.current?._id);
        
        // Only add message to messages state if it's relevant to the current conversation
        if (selectedUserRef.current && 
            (msg.sender === selectedUserRef.current._id || msg.sender === user?.id)) {
          setMessages((prev) => [...prev, { sender: msg.sender, content: msg.content, read: false, createdAt: msg.createdAt }]);
        }
        
        setUnreadCounts(prev => {
          if (selectedUserRef.current && selectedUserRef.current._id === msg.sender) {
            return prev;
          }
          return { ...prev, [msg.sender]: (prev[msg.sender] || 0) + 1 };
        });
        setLastMessages(prev => {
          if (!msg.sender) return prev;
          return { ...prev, [msg.sender]: msg };
        });

        // Show notification for new message (but not for messages sent by current user)
        if (user?.id !== msg.sender) {
          showMessageNotification(msg);
        } else {
          console.log('Skipping notification for message sent by current user');
        }
      });
      // Typing indicator events
      s.on('typing', ({ sender }) => {
        setTypingUsers((prev) => [...new Set([...prev, sender])]);
      });
      s.on('stopTyping', ({ sender }) => {
        setTypingUsers((prev) => prev.filter(id => id !== sender));
      });
      // Read receipt event
      s.on('readMessages', ({ sender }) => {
        setMessages((prev) => prev.map(m => (user?.id && m.sender === user.id) ? { ...m, read: true } : m));
      });
      // Group message events
      s.on('receiveGroupMessage', (msg) => {
        setGroupMessages((prev) => [...prev, { sender: msg.sender, content: msg.content, read: false, createdAt: msg.createdAt }]);
        
        // Update unread count for group messages
        setUnreadCounts(prev => {
          if (selectedGroupRef.current && selectedGroupRef.current._id === msg.groupId) return prev;
          return { ...prev, [msg.groupId]: (prev[msg.groupId] || 0) + 1 };
        });
        
        // Show notification for new group message
        showGroupMessageNotification(msg);
      });
      setSocket(s);
      return () => {
        window.removeEventListener('focus', handleOnline);
        document.removeEventListener('visibilitychange', handleOnline);
        s.disconnect();
      };
    }
  }, [user, token]);

  // Function to show notification for new messages
  const showMessageNotification = async (msg) => {
    // Check if notifications are enabled
    if (!notificationSettings.enabled) return;
    
    // Don't show notification if the chat is currently open
    if (selectedUserRef.current && selectedUserRef.current._id === msg.sender) return;
    
    // Don't show notification if the window is focused (commented out for testing)
    // if (document.hasFocus()) return;

    try {
      // Try to use Electron notifications first
      if (window.electronAPI) {
        const senderName = users.find(u => u._id === msg.sender)?.username || 'Unknown User';
        const messageContent = notificationSettings.showPreview 
          ? (msg.content.length > 50 ? msg.content.substring(0, 50) + '...' : msg.content)
          : 'New message received';
        
        await window.electronAPI.showNotification({
          title: `New message from ${senderName}`,
          body: messageContent,
          icon: '/logo192.png',
          silent: !notificationSettings.sound
        });
      } else {
        // Fallback to browser notifications
        if ('Notification' in window && Notification.permission === 'granted') {
          const senderName = users.find(u => u._id === msg.sender)?.username || 'Unknown User';
          const messageContent = notificationSettings.showPreview 
            ? (msg.content.length > 50 ? msg.content.substring(0, 50) + '...' : msg.content)
            : 'New message received';
          
          new Notification(`New message from ${senderName}`, {
            body: messageContent,
            icon: '/logo192.png',
            badge: '/logo192.png',
            silent: !notificationSettings.sound
          });
        }
      }
    } catch (error) {
      console.error('Failed to show notification:', error);
    }
  };

  // Function to show notification for new group messages
  const showGroupMessageNotification = async (msg) => {
    // Check if notifications are enabled
    if (!notificationSettings.enabled) return;
    
    // Don't show notification if the group chat is currently open
    if (selectedGroupRef.current && selectedGroupRef.current._id === msg.groupId) return;
    
    // Don't show notification if the window is focused
    if (document.hasFocus()) return;

    try {
      // Try to use Electron notifications first
      if (window.electronAPI) {
        const senderName = users.find(u => u._id === msg.sender)?.username || 'Unknown User';
        const groupName = selectedGroupRef.current?.name || 'Group';
        const messageContent = notificationSettings.showPreview 
          ? (msg.content.length > 50 ? msg.content.substring(0, 50) + '...' : msg.content)
          : 'New group message received';
        
        await window.electronAPI.showNotification({
          title: `${senderName} in ${groupName}`,
          body: messageContent,
          icon: '/logo192.png',
          silent: !notificationSettings.sound
        });
      } else {
        // Fallback to browser notifications
        if ('Notification' in window && Notification.permission === 'granted') {
          const senderName = users.find(u => u._id === msg.sender)?.username || 'Unknown User';
          const groupName = selectedGroupRef.current?.name || 'Group';
          const messageContent = notificationSettings.showPreview 
            ? (msg.content.length > 50 ? msg.content.substring(0, 50) + '...' : msg.content)
            : 'New group message received';
          
          new Notification(`${senderName} in ${groupName}`, {
            body: messageContent,
            icon: '/logo192.png',
            badge: '/logo192.png',
            silent: !notificationSettings.sound
          });
        }
      }
    } catch (error) {
      console.error('Failed to show group notification:', error);
    }
  };

  // Function to request notification permissions
  const requestNotificationPermission = async () => {
    try {
      // Check if we're in Electron environment
      if (window.electronAPI) {
        const supported = await window.electronAPI.notificationsSupported();
        if (supported) {
          console.log('Electron notifications are supported');
          return true;
        }
      }
      
      // Request push notification permission
      if ('Notification' in window) {
        if (Notification.permission === 'default') {
          const permission = await Notification.requestPermission();
          return permission === 'granted';
        }
        return Notification.permission === 'granted';
      }
      
      // Request push notification permission for service worker
      if ('serviceWorker' in navigator && 'PushManager' in window) {
        try {
          const registration = await navigator.serviceWorker.ready;
          const permission = await Notification.requestPermission();
          if (permission === 'granted') {
            // Get push subscription
            const subscription = await registration.pushManager.subscribe({
              userVisibleOnly: true,
              applicationServerKey: 'BEl62iUYgUivxIkv69yViEuiBIa1l9aTvkV8AGjfHXgBxGBAF8mxbINk6OnO6ceA6e7Oj8Hm1GQj2lL3aBMfqY'
            });
            console.log('Push subscription:', subscription);
            return true;
          }
        } catch (error) {
          console.error('Push notification setup failed:', error);
        }
      }
      
      return false;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  };

  // Function to update notification settings
  const updateNotificationSettings = (newSettings) => {
    const updatedSettings = { ...notificationSettings, ...newSettings };
    setNotificationSettings(updatedSettings);
    try {
      localStorage.setItem('notificationSettings', JSON.stringify(updatedSettings));
    } catch (error) {
      console.error('Failed to save notification settings:', error);
    }
  };

  // Function to show notification for sent messages
  const showSentMessageNotification = async (content, receiverId) => {
    console.log('=== SENT MESSAGE NOTIFICATION DEBUG ===');
    console.log('showSentMessageNotification called with:', { content, receiverId });
    console.log('Notification settings:', notificationSettings);
    console.log('Notifications enabled:', notificationSettings.enabled);
    console.log('Sent message notifications enabled:', notificationSettings.sentMessageNotifications);
    
    // Check if notifications are enabled and sent message notifications are enabled
    if (!notificationSettings.enabled || !notificationSettings.sentMessageNotifications) {
      console.log('❌ Notifications disabled or sent message notifications disabled');
      return;
    }
    
    console.log('✅ Notification checks passed, proceeding...');
    
    // Add a small delay to make it feel more natural (like WhatsApp)
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Don't show notification if the window is focused (commented out for testing)
    // if (document.hasFocus()) return;

    try {
      // Try to use Electron push notifications first
      if (window.electronAPI) {
        const receiverName = users.find(u => u._id === receiverId)?.username || 'Unknown User';
        
        // Determine message content for notification
        let messageContent = 'Message sent';
        if (typeof content === 'string') {
          try {
            // Check if it's a file message
            const fileData = JSON.parse(content);
            if (fileData.file && fileData.type) {
              switch (fileData.type) {
                case 'image':
                  messageContent = '📷 Image sent';
                  break;
                case 'video':
                  messageContent = '🎥 Video sent';
                  break;
                case 'audio':
                  messageContent = '🎵 Audio sent';
                  break;
                default:
                  messageContent = `📎 ${fileData.name || 'File'} sent`;
                  break;
              }
            } else {
              messageContent = notificationSettings.showPreview 
                ? (content.length > 50 ? content.substring(0, 50) + '...' : content)
                : 'Message sent';
            }
          } catch {
            // Regular text message
            messageContent = notificationSettings.showPreview 
              ? (content.length > 50 ? content.substring(0, 50) + '...' : content)
              : 'Message sent';
          }
        }
        
        // Use push notification API for sent messages
        await window.electronAPI.showPushNotification({
          title: `✓ Message sent to ${receiverName}`,
          body: messageContent,
          icon: '/logo192.png',
          silent: !notificationSettings.sound
        });
        
        // Also try service worker push notification for better device support
        if ('serviceWorker' in navigator && 'PushManager' in window) {
          try {
            const registration = await navigator.serviceWorker.ready;
            await registration.showNotification(`✓ Message sent to ${receiverName}`, {
              body: messageContent,
              icon: '/logo192.png',
              badge: '/logo192.png',
              tag: 'sent-message',
              renotify: true,
              requireInteraction: false,
              silent: !notificationSettings.sound
            });
            console.log('Service Worker push notification sent successfully');
          } catch (error) {
            console.error('Service Worker push notification failed:', error);
          }
        }
      } else {
        // Fallback to browser notifications
        if ('Notification' in window && Notification.permission === 'granted') {
          const receiverName = users.find(u => u._id === receiverId)?.username || 'Unknown User';
          
          // Determine message content for notification
          let messageContent = 'Message sent';
          if (typeof content === 'string') {
            try {
              // Check if it's a file message
              const fileData = JSON.parse(content);
              if (fileData.file && fileData.type) {
                switch (fileData.type) {
                  case 'image':
                    messageContent = '📷 Image sent';
                    break;
                  case 'video':
                    messageContent = '🎥 Video sent';
                    break;
                  case 'audio':
                    messageContent = '🎵 Audio sent';
                    break;
                  default:
                    messageContent = `📎 ${fileData.name || 'File'} sent`;
                    break;
                }
              } else {
                messageContent = notificationSettings.showPreview 
                  ? (content.length > 50 ? content.substring(0, 50) + '...' : content)
                  : 'Message sent';
              }
            } catch {
              // Regular text message
              messageContent = notificationSettings.showPreview 
                ? (content.length > 50 ? content.substring(0, 50) + '...' : content)
                : 'Message sent';
            }
          }
          
          // Use browser push notification
          const notification = new Notification(`✓ Message sent to ${receiverName}`, {
            body: messageContent,
            icon: '/logo192.png',
            badge: '/logo192.png',
            silent: !notificationSettings.sound,
            tag: 'sent-message',
            renotify: true,
            requireInteraction: false
          });
          
          // Handle notification click
          notification.onclick = () => {
            window.focus();
            notification.close();
          };
        }
      }
    } catch (error) {
      console.error('Failed to show sent message notification:', error);
    }
  };

  // Temporary test function to manually reset unread counts
  const testResetUnreadCount = () => {
    console.log('Testing manual reset of unread counts');
    console.log('Current selectedUser:', selectedUser);
    console.log('Current unreadCounts:', unreadCounts);
    if (selectedUser && selectedUser._id) {
      setUnreadCounts(prev => {
        const updated = { ...prev, [selectedUser._id]: 0 };
        console.log('Manually updated unread counts:', updated);
        try {
          localStorage.setItem('unreadCounts', JSON.stringify(updated));
        } catch (error) {
          console.error('Failed to save unread counts:', error);
        }
        return updated;
      });
    }
  };

  // Test function to manually trigger sent message notification
  const testSentMessageNotification = () => {
    console.log('Testing sent message notification...');
    if (selectedUser && selectedUser._id) {
      showSentMessageNotification('Test message from debug function', selectedUser._id);
    } else {
      console.log('No selected user to test with');
    }
  };

  // Test function to manually trigger push notification
  const testPushNotification = async () => {
    console.log('Testing push notification...');
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      try {
        const registration = await navigator.serviceWorker.ready;
        await registration.showNotification('Test Push Notification', {
          body: 'This is a test push notification',
          icon: '/logo192.png',
          badge: '/logo192.png',
          tag: 'test-push',
          renotify: true,
          requireInteraction: false
        });
        console.log('Push notification sent successfully');
      } catch (error) {
        console.error('Failed to send push notification:', error);
      }
    } else {
      console.log('Push notifications not supported');
    }
  };

  // Debug function to test all notification methods
  const debugNotifications = async () => {
    console.log('=== DEBUGGING NOTIFICATIONS ===');
    console.log('Notification settings:', notificationSettings);
    console.log('window.electronAPI available:', !!window.electronAPI);
    console.log('serviceWorker available:', 'serviceWorker' in navigator);
    console.log('PushManager available:', 'PushManager' in window);
    console.log('Notification available:', 'Notification' in window);
    console.log('Notification permission:', Notification.permission);
    
    // Test Electron notifications
    if (window.electronAPI) {
      try {
        await window.electronAPI.showNotification({
          title: 'Debug: Electron Test',
          body: 'Testing Electron notifications',
          icon: '/logo192.png'
        });
        console.log('✅ Electron notification test successful');
      } catch (error) {
        console.error('❌ Electron notification test failed:', error);
      }
    }
    
    // Test Service Worker notifications
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.ready;
        await registration.showNotification('Debug: Service Worker Test', {
          body: 'Testing Service Worker notifications',
          icon: '/logo192.png',
          badge: '/logo192.png',
          tag: 'debug-sw',
          renotify: true
        });
        console.log('✅ Service Worker notification test successful');
      } catch (error) {
        console.error('❌ Service Worker notification test failed:', error);
      }
    }
    
    // Test Browser notifications
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        const notification = new Notification('Debug: Browser Test', {
          body: 'Testing browser notifications',
          icon: '/logo192.png',
          badge: '/logo192.png',
          tag: 'debug-browser',
          renotify: true
        });
        console.log('✅ Browser notification test successful');
      } catch (error) {
        console.error('❌ Browser notification test failed:', error);
      }
    }
    
    console.log('=== END DEBUGGING ===');
  };

  // Fetch users after login
  useEffect(() => {
    if (token) {
      axios.get(`${API_URL}/messages/users/all`, { headers: { Authorization: `Bearer ${token}` } })
        .then(res => setUsers(res.data))
        .catch(() => setUsers([]));
    }
  }, [token]);

  // Restore last selected chat from localStorage
  useEffect(() => {
    const lastChat = localStorage.getItem('lastSelectedChat');
    if (lastChat && users.length > 0) {
      try {
        const { type, id } = JSON.parse(lastChat);
        if (type === 'user') {
          const userToSelect = users.find(u => u._id === id);
          if (userToSelect) {
            setSelectedUser(userToSelect);
          }
        }
        // Note: Group restoration is not fully supported yet as groups are not fetched on startup.
      } catch (e) {
        console.error("Failed to restore last chat:", e);
        localStorage.removeItem('lastSelectedChat');
      }
    }
  }, [users]);

  // Fetch messages when a user is selected
  useEffect(() => {
    if (token && selectedUser) {
      axios.get(`${API_URL}/messages/${selectedUser._id}`, { headers: { Authorization: `Bearer ${token}` } })
        .then(res => setMessages(res.data))
        .catch(() => setMessages([]));
    }
  }, [token, selectedUser]);

  // Typing indicator logic
  useEffect(() => {
    if (!socket || !selectedUser) return;
    if (isTyping) {
      if (user?.id) socket.emit('typing', { sender: user.id, receiver: selectedUser._id });
      const timeout = setTimeout(() => {
        setIsTyping(false);
        if (user?.id) socket.emit('stopTyping', { sender: user.id, receiver: selectedUser._id });
      }, 2000);
      return () => clearTimeout(timeout);
    } else {
      if (user?.id) socket.emit('stopTyping', { sender: user.id, receiver: selectedUser._id });
    }
  }, [isTyping, socket, selectedUser, user]);

  // Mark messages as read when chat is opened or new messages arrive
  useEffect(() => {
    if (!user || !token || !selectedUser || !messages.some(m => m.sender === selectedUser._id && !m.read)) return;
    axios.post(`${API_URL}/messages/read/${selectedUser._id}`, {}, { headers: { Authorization: `Bearer ${token}` } });
    if (socket && user?.id) socket.emit('readMessages', { sender: user.id, receiver: selectedUser._id });
  }, [token, selectedUser, messages, socket, user]);

  // Reset unread count when a user chat is selected
  useEffect(() => {
    if (selectedUser && selectedUser._id) {
      setUnreadCounts(prev => {
        const updated = { ...prev, [selectedUser._id]: 0 };
        try {
          localStorage.setItem('unreadCounts', JSON.stringify(updated));
        } catch (error) {
          console.error('Failed to save unread counts:', error);
        }
        return updated;
      });
    }
  }, [selectedUser]);

  // Update refs when selectedUser changes
  useEffect(() => {
    selectedUserRef.current = selectedUser;
  }, [selectedUser]);

  // Reset unread count when a group chat is selected
  useEffect(() => {
    if (selectedGroup && selectedGroup._id) {
      setUnreadCounts(prev => {
        const updated = { ...prev, [selectedGroup._id]: 0 };
        try {
          localStorage.setItem('unreadCounts', JSON.stringify(updated));
        } catch (error) {
          console.error('Failed to save unread counts:', error);
        }
        return updated;
      });
    }
  }, [selectedGroup]);

  // Update refs when selectedGroup changes
  useEffect(() => {
    selectedGroupRef.current = selectedGroup;
  }, [selectedGroup]);

  // Mark group messages as read
  useEffect(() => {
    if (!user || !token || !selectedGroup || !groupMessages.some(m => (user?.id && m.sender !== user.id && !m.read))) return;
    axios.post(`${API_URL}/messages/group/read/${selectedGroup._id}`, {}, { headers: { Authorization: `Bearer ${token}` } });
    if (socket && user?.id) socket.emit('groupReadMessages', { sender: user.id, groupId: selectedGroup._id });
  }, [token, selectedGroup, groupMessages, socket, user]);

  // Error alert
  useEffect(() => {
    if (error) {
      const timeout = setTimeout(() => setError(''), 4000);
      return () => clearTimeout(timeout);
    }
  }, [error]);

  // WebRTC and signaling logic
  useEffect(() => {
    if (!socket) return;
    // Handle incoming call
    socket.on('callUser', async ({ from, signal }) => {
      setCallIncoming(true);
      setCallOpen(true);
      setCallFrom(from);
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setLocalStream(stream);
      const pc = new RTCPeerConnection();
      stream.getTracks().forEach(track => pc.addTrack(track, stream));
      pc.ontrack = (event) => {
        setRemoteStream(event.streams[0]);
      };
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit('iceCandidate', { to: from, candidate: event.candidate });
        }
      };
      await pc.setRemoteDescription(new RTCSessionDescription(signal));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socket.emit('answerCall', { to: from, signal: answer });
      setPeerConnection(pc);
    });
    // Handle call accepted
    socket.on('callAccepted', async ({ signal }) => {
      if (peerConnection) {
        await peerConnection.setRemoteDescription(new RTCSessionDescription(signal));
      }
      setCallAccepted(true);
    });
    // Handle ICE candidates
    socket.on('iceCandidate', async ({ candidate }) => {
      if (peerConnection) {
        try {
          await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (e) {}
      }
    });
    // Handle call end
    socket.on('endCall', () => {
      endCall();
    });
    return () => {
      socket.off('callUser');
      socket.off('callAccepted');
      socket.off('iceCandidate');
      socket.off('endCall');
    };
  }, [socket, peerConnection]);

  // Listen for userStatusChange events
  useEffect(() => {
    if (!socket) return;
    const handleStatusChange = ({ userId, status, lastSeen }) => {
      setUserStatusMap(prev => ({ ...prev, [userId]: { status, lastSeen } }));
    };
    socket.on('userStatusChange', handleStatusChange);
    return () => {
      socket.off('userStatusChange', handleStatusChange);
    };
  }, [socket]);

  // Helper to get user status (online/offline/lastSeen)
  const getUserStatus = (u) => {
    const statusObj = userStatusMap[u._id || u.id];
    if (statusObj) return statusObj;
    return { status: null, lastSeen: null };
  };

  // Fetch lastSeen for a user if not online and not in map
  const fetchLastSeenIfNeeded = async (u) => {
    const id = u._id || u.id;
    if (!userStatusMap[id] || userStatusMap[id].status !== 'online') {
      try {
        const res = await axios.get(`${API_URL}/last-seen/${id}`);
        setUserStatusMap(prev => ({ ...prev, [id]: { status: 'offline', lastSeen: res.data.lastSeen } }));
      } catch {}
    }
  };

  const startCall = async (audio = false) => {
    if (!user?.id || !selectedUser) return;
    setCallOpen(true);
    setCallIncoming(false);
    setCallAccepted(false);
    setAudioOnly(audio);
    const stream = await navigator.mediaDevices.getUserMedia({ video: !audio, audio: true });
    setLocalStream(stream);
    const pc = new RTCPeerConnection();
    stream.getTracks().forEach(track => pc.addTrack(track, stream));
    pc.ontrack = (event) => {
      setRemoteStream(event.streams[0]);
    };
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('iceCandidate', { to: selectedUser.id || selectedUser._id, candidate: event.candidate });
      }
    };
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    if (user?.id) socket.emit('callUser', { to: selectedUser.id || selectedUser._id, from: user.id, signal: offer });
    setPeerConnection(pc);
  };

  const acceptCall = () => {
    setCallAccepted(true);
  };

  const endCall = () => {
    setCallOpen(false);
    setCallIncoming(false);
    setCallAccepted(false);
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
    }
    if (remoteStream) {
      remoteStream.getTracks().forEach(track => track.stop());
      setRemoteStream(null);
    }
    if (peerConnection) {
      peerConnection.close();
      setPeerConnection(null);
    }
    if (socket && user && (selectedUser || callFrom)) {
      socket.emit('endCall', { to: (callFrom || selectedUser?.id || selectedUser?._id) });
    }
    setUnreadCounts(prev => {
      const updated = { ...prev, [selectedUser._id]: 0 };
      try {
        localStorage.setItem('unreadCounts', JSON.stringify(updated));
      } catch {}
      return updated;
    });
    setLastMessages(prev => {
      const updated = { ...prev };
      delete updated[selectedUser._id];
      try {
        localStorage.setItem('lastMessages', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const handleRegister = async () => {
    try {
      await axios.post(`${API_URL}/auth/register`, { username, email, password, avatar });
      setPage('login');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  const handleLogin = async () => {
    try {
      const res = await axios.post(`${API_URL}/auth/login`, { email, password });
      setToken(res.data.token);
      setUser(res.data.user);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      setPage('chat');
      
      // Request notification permissions after successful login
      await requestNotificationPermission();
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  const handleSend = async () => {
    if (!message.trim() || !selectedUser) return;
    console.log('handleSend called with message:', message, 'to user:', selectedUser._id);
    try {
      await axios.post(`${API_URL}/messages`, { to: selectedUser._id, content: message }, { headers: { Authorization: `Bearer ${token}` } });
      // Emit real-time
      if (socket && user?.id) socket.emit('sendMessage', { sender: user.id, receiver: selectedUser._id, content: message });
      const newCreatedAt = new Date().toISOString();
      setMessages((prev) => [...prev, { sender: user?.id, content: message, read: false, createdAt: newCreatedAt }]);
      setLastMessages(prev => {
        if (!selectedUser?._id) return prev;
        return { ...prev, [selectedUser._id]: { content: message, createdAt: newCreatedAt } };
      });
      setMessage('');
      setUnreadCounts(prev => {
        const updated = { ...prev, [selectedUser._id]: 0 };
        try {
          localStorage.setItem('unreadCounts', JSON.stringify(updated));
        } catch {}
        return updated;
      });
      
      // Show notification for sent message
      console.log('Calling showSentMessageNotification...');
      showSentMessageNotification(message, selectedUser._id);
    } catch (err) {
      if (err.response && err.response.status === 403) {
        setError('You cannot send messages to this user because you are blocked.');
      } else {
        setError('Failed to send message.');
      }
    }
  };

  const handleLogout = () => {
    if (socket && user?.id) {
      socket.emit('userStatusChange', { userId: user.id, status: 'offline', lastSeen: new Date() });
    }
    setToken('');
    setUser(null);
    setUserStatusMap(prev => {
      const newMap = { ...prev };
      if (user?.id) delete newMap[user.id];
      return newMap;
    });
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setPage('login');
  };

  const openGroupDialog = () => {
    setGroupDialogOpen(true);
  };

  const handleProfileEdit = async (profile) => {
    try {
      const res = await axios.put(`${API_URL}/auth/profile`, { id: user?.id, ...profile });
      setUser(res.data);
      localStorage.setItem('user', JSON.stringify(res.data));
      setError('Profile updated!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    }
  };

  // Fetch latest user info before opening profile dialog
  const handleOpenProfileDialog = async (userOrGroup) => {
    if (userOrGroup && userOrGroup._id && !userOrGroup.members) {
      // Fetch latest user info
      try {
        const res = await axios.get(`${API_URL}/messages/users/${userOrGroup._id}`, { headers: { Authorization: `Bearer ${token}` } });
        setProfileDialogUser(res.data);
      } catch {
        setProfileDialogUser(userOrGroup);
      }
    } else {
      setProfileDialogUser(userOrGroup);
    }
    setProfileDialogOpen(true);
  };

  const handleFilterMenuOpen = (event) => setFilterMenuAnchor(event.currentTarget);
  const handleFilterMenuClose = () => setFilterMenuAnchor(null);

  // Helper for cropping
  const onCropComplete = (croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(prev => {
      // Only update if the value actually changes
      if (!prev || prev.x !== croppedAreaPixels.x || prev.y !== croppedAreaPixels.y || prev.width !== croppedAreaPixels.width || prev.height !== croppedAreaPixels.height) {
        return croppedAreaPixels;
      }
      return prev;
    });
  };

  const getCroppedImg = async (imageSrc, cropPixels) => {
    const image = new window.Image();
    image.src = imageSrc;
    await new Promise((resolve) => { image.onload = resolve; });
    const canvas = document.createElement('canvas');
    canvas.width = cropPixels.width;
    canvas.height = cropPixels.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(
      image,
      cropPixels.x,
      cropPixels.y,
      cropPixels.width,
      cropPixels.height,
      0,
      0,
      cropPixels.width,
      cropPixels.height
    );
    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve(reader.result);
        };
        reader.readAsDataURL(blob);
      }, 'image/jpeg');
    });
  };

  const handleCropSave = async () => {
    try {
      if (!cropImageSrc || !croppedAreaPixels) return;
      const croppedDataUrl = await getCroppedImg(cropImageSrc, croppedAreaPixels);
      setAvatar(croppedDataUrl);
      setCropDialogOpen(false);
      setCropImageSrc(null);
    } catch (err) {
      setError('Failed to crop image');
    }
  };

  const handleCropCancel = () => {
    setCropDialogOpen(false);
    setCropImageSrc(null);
  };

  useEffect(() => {
    if (nav === 'status' && token) {
      axios.get(`${API_URL}/status`, { headers: { Authorization: `Bearer ${token}` } })
        .then(res => setStatuses(res.data))
        .catch(() => setStatuses([
          { userId: '1', username: 'Alice', avatar: '', text: 'Enjoying the day!' },
          { userId: '2', username: 'Bob', avatar: '', text: 'Working on a project.' }
        ]));
    }
  }, [nav, token]);

  // Fetch last seen for selectedUser if needed (chat header)
  useEffect(() => {
    if (selectedUser && getUserStatus(selectedUser).status !== 'online') {
      fetchLastSeenIfNeeded(selectedUser);
    }
    // eslint-disable-next-line
  }, [selectedUser]);

  // Calculate unread chats count for sidebar badge
  const unreadChatsCount = Object.entries(unreadCounts)
    .filter(([userId, count]) => count > 0 && (!selectedUser || selectedUser._id !== userId))
    .length;

  // Persist unreadCounts to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('unreadCounts', JSON.stringify(unreadCounts));
    } catch {}
  }, [unreadCounts]);

  // Persist lastMessages to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('lastMessages', JSON.stringify(lastMessages));
    } catch {}
  }, [lastMessages]);

  // Scroll to bottom of chat messages only (not the whole page)
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages, selectedUser]);

  useEffect(() => {
    if (!socket) return;
    const handleChatDeleted = ({ from }) => {
      if (selectedUser && selectedUser._id === from) {
        setMessages([]);
        setUnreadCounts(prev => {
          const updated = { ...prev, [from]: 0 };
          try { localStorage.setItem('unreadCounts', JSON.stringify(updated)); } catch {}
          return updated;
        });
        setLastMessages(prev => {
          const updated = { ...prev };
          delete updated[from];
          try {
            localStorage.setItem('lastMessages', JSON.stringify(updated));
          } catch {}
          return updated;
        });
      }
    };
    socket.on('chatDeletedForEveryone', handleChatDeleted);
    return () => {
      socket.off('chatDeletedForEveryone', handleChatDeleted);
    };
  }, [socket, selectedUser]);

  // Fetch block status when opening a chat
  useEffect(() => {
    const fetchBlockStatus = async () => {
      if (!selectedUser || !token) return setIsBlocked(false);
      try {
        const res = await axios.get(`${API_URL}/messages/is-blocked/${selectedUser._id}`, { headers: { Authorization: `Bearer ${token}` } });
        setIsBlocked(res.data.isBlocked);
      } catch {
        setIsBlocked(false);
      }
    };
    fetchBlockStatus();
  }, [selectedUser, token]);

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file || !selectedUser) return;
    console.log('handleFileChange called with file:', file.name, 'to user:', selectedUser._id);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const uploadRes = await axios.post(`${API_URL}/messages/upload`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      // Send a message with the file info
      const { url, type, name } = uploadRes.data;
      const messageResponse = await axios.post(`${API_URL}/messages`, {
        to: selectedUser._id,
        content: JSON.stringify({ file: url, type, name }),
      }, { headers: { Authorization: `Bearer ${token}` } });
      
      const returnedMessage = messageResponse.data;

      if (socket && user?.id) socket.emit('sendMessage', returnedMessage);

      setMessages((prev) => [...prev, returnedMessage]);
      
      setLastMessages(prev => {
        if (!selectedUser?._id) return prev;
        return { ...prev, [selectedUser._id]: returnedMessage };
      });
      
      setUnreadCounts(prev => {
        const updated = { ...prev, [selectedUser._id]: 0 };
        try { localStorage.setItem('unreadCounts', JSON.stringify(updated)); } catch {}
        return updated;
      });
      
      // Show notification for sent file
      console.log('Calling showSentMessageNotification for file...');
      showSentMessageNotification(JSON.stringify({ file: url, type, name }), selectedUser._id);
    } catch (err) {
      setError('Failed to upload file.');
    }
  };

  // Add this function in the App component:
  const handleDownload = async () => {
    try {
      const response = await fetch(dialogImageUrl, { mode: 'cors' });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = dialogImageUrl.split('/').pop() || 'image.jpg';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError('Failed to download image.');
    }
  };

  // Voice recording functions
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      recorder.onstop = async () => {
        if (recorder.shouldSend) {
          const audioBlob = new Blob(chunks, { type: 'audio/webm' });
          await sendVoiceMessage(audioBlob);
        }
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setAudioChunks(chunks);
      setIsRecording(true);
      setIsPaused(false);
      setRecordingTime(0);

      // Start timer
      const timer = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      setRecordingTimer(timer);
    } catch (err) {
      setError('Failed to start recording. Please allow microphone access.');
    }
  };

  const stopRecording = (shouldSend = true) => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.shouldSend = shouldSend;
      mediaRecorder.stop();
      setIsRecording(false);
      setIsPaused(false);
      if (recordingTimer) {
        clearInterval(recordingTimer);
        setRecordingTimer(null);
      }
    }
  };

  const cancelRecording = () => {
    stopRecording(false);
  };

  const handlePauseRecording = () => {
    if (mediaRecorder && mediaRecorder.state === "recording") {
      mediaRecorder.pause();
      setIsPaused(true);
      clearInterval(recordingTimer);
      setRecordingTimer(null);
    }
  };

  const handleResumeRecording = () => {
    if (mediaRecorder && mediaRecorder.state === "paused") {
      mediaRecorder.resume();
      setIsPaused(false);
      const timer = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      setRecordingTimer(timer);
    }
  };

  const stopAndSendRecording = () => {
    stopRecording(true);
  };

  const sendVoiceMessage = async (audioBlob) => {
    if (!selectedUser && !selectedGroup) return;

    try {
      // First upload the audio file
      const formData = new FormData();
      formData.append('file', audioBlob, 'voice-message.webm');

      const uploadResponse = await axios.post(`${API_URL}/messages/upload`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      const { url, type, name } = uploadResponse.data;

      // Then send the message with the file URL
      const messageData = {
        to: selectedUser?._id || selectedGroup?._id,
        content: JSON.stringify({ file: url, type, name })
      };

      const response = await axios.post(`${API_URL}/messages`, messageData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const newMessage = response.data;
      
      if (selectedUser) {
        setMessages(prev => [...prev, newMessage]);
        setLastMessages(prev => ({ ...prev, [selectedUser._id]: newMessage }));
        if (socket) {
          socket.emit('sendMessage', {
            to: selectedUser._id,
            content: newMessage.content,
            type: 'audio',
            file: url
          });
        }
        showSentMessageNotification('Voice message', selectedUser._id);
      } else if (selectedGroup) {
        setGroupMessages(prev => [...prev, newMessage]);
        setLastMessages(prev => ({ ...prev, [selectedGroup._id]: newMessage }));
        if (socket) {
          socket.emit('sendGroupMessage', {
            to: selectedGroup._id,
            content: newMessage.content,
            type: 'audio',
            file: url
          });
        }
      }
    } catch (err) {
      console.error('Voice message error:', err);
      setError('Failed to send voice message.');
    }
  };

  const formatRecordingTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatAudioTime = (timeInSeconds) => {
    if (isNaN(timeInSeconds)) return "0:00";
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${String(seconds).padStart(2, '0')}`;
  };

  // Render docx file when viewer is open
  useEffect(() => {
    if (docxViewerOpen && documentUrl && docxContainerRef.current) {
      docxContainerRef.current.innerHTML = ""; // Clear previous content
      fetch(getFullUrl(documentUrl))
        .then(response => response.blob())
        .then(blob => {
          renderAsync(blob, docxContainerRef.current)
            .then(x => console.log("docx rendered."));
        });
    }
  }, [docxViewerOpen, documentUrl]);

  const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes
  const inactivityTimerRef = useRef(null);

  const resetInactivityTimer = () => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }
    inactivityTimerRef.current = setTimeout(() => {
      handleLogout();
      setError('Logged out due to inactivity.');
    }, INACTIVITY_TIMEOUT);
  };

  useEffect(() => {
    if (!token || !user) return;

    const activityEvents = ['mousemove', 'keydown', 'mousedown', 'touchstart', 'scroll'];
    const handleActivity = resetInactivityTimer;

    activityEvents.forEach(event => window.addEventListener(event, handleActivity));
    resetInactivityTimer();

    return () => {
      activityEvents.forEach(event => window.removeEventListener(event, handleActivity));
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
    };
  }, [token, user]);

  // Helper to get sender info for a message
  function getSenderInfo(senderId) {
    if (user && user.id === senderId) {
      return { avatar: user.avatar, username: user.username };
    }
    const found = users.find(u => u._id === senderId);
    return { avatar: found?.avatar || user.avatar, username: found?.username || user.username };
  }

  if (!token || !user) {
    return (
      <ThemeProvider theme={theme}>
        <Container maxWidth="xs">
          <Box mt={8} p={4} component={Paper}>
            <Typography variant="h5" align="center" gutterBottom>
              {page === 'login' ? 'Login' : 'Register'}
            </Typography>
            {page === 'register' && (
              <>
                {/* Centered round upload button with camera icon or avatar */}
                <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" my={2}>
                  {avatar ? (
                    <Button
                      variant="outlined"
                      component="label"
                      sx={{
                        borderRadius: '50%',
                        minWidth: 72,
                        minHeight: 72,
                        width: 72,
                        height: 72,
                        p: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative',
                        overflow: 'hidden',
                        transition: 'background 0.2s',
                        background: '#fff',
                        '&:hover': {
                          background: '#e0e0e0',
                        },
                      }}
                    >
                      <Avatar src={avatar} sx={{ width: 72, height: 72 }} />
                      <input
                        type="file"
                        accept="image/*"
                        hidden
                        onChange={e => {
                          const file = e.target.files[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = () => {
                              setCropImageSrc(reader.result);
                              setCropDialogOpen(true);
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </Button>
                  ) : (
                    <Button
                      variant="outlined"
                      component="label"
                      sx={{
                        borderRadius: '50%',
                        minWidth: 72,
                        minHeight: 72,
                        width: 72,
                        height: 72,
                        p: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative',
                        overflow: 'hidden',
                        transition: 'background 0.2s',
                        background: '#fff',
                        '&:hover': {
                          background: '#e0e0e0',
                        },
                      }}
                    >
                      <CameraAltIcon sx={{ fontSize: 32, color: '#555' }} />
                      <input
                        type="file"
                        accept="image/*"
                        hidden
                        onChange={e => {
                          const file = e.target.files[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = () => {
                              setCropImageSrc(reader.result);
                              setCropDialogOpen(true);
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </Button>
                  )}
                </Box>
                {/* Crop Dialog for register avatar */}
                <Dialog open={cropDialogOpen} onClose={handleCropCancel} maxWidth="xs" fullWidth>
                  <DialogTitle>Crop Image</DialogTitle>
                  <DialogContent>
                    {cropImageSrc && (
                      <Box position="relative" width="100%" height={300} bgcolor="#333">
                        <Cropper
                          image={cropImageSrc}
                          crop={crop}
                          zoom={zoom}
                          aspect={1}
                          onCropChange={setCrop}
                          onZoomChange={setZoom}
                          onCropComplete={onCropComplete}
                        />
                      </Box>
                    )}
                    <Slider
                      value={zoom}
                      min={1}
                      max={3}
                      step={0.1}
                      onChange={(e, z) => setZoom(z)}
                      sx={{ mt: 2 }}
                    />
                  </DialogContent>
                  <DialogActions>
                    <Button onClick={handleCropCancel}>Cancel</Button>
                    <Button onClick={handleCropSave} variant="contained">Save</Button>
                  </DialogActions>
                </Dialog>
                <TextField label="Username" fullWidth margin="normal" value={username} onChange={e => setUsername(e.target.value)} />
                <TextField label="Email" fullWidth margin="normal" value={email} onChange={e => setEmail(e.target.value)} />
                <TextField label="Password" type="password" fullWidth margin="normal" value={password} onChange={e => setPassword(e.target.value)} />
              </>
            )}
            {page === 'login' && (
              <>
                <TextField label="Email" fullWidth margin="normal" value={email} onChange={e => setEmail(e.target.value)} />
                <TextField label="Password" type="password" fullWidth margin="normal" value={password} onChange={e => setPassword(e.target.value)} />
              </>
            )}
            <Button variant="contained" color="primary" fullWidth sx={{ mt: 2 }} onClick={page === 'login' ? handleLogin : handleRegister}>
              {page === 'login' ? 'Login' : 'Register'}
            </Button>
            <Button color="secondary" fullWidth sx={{ mt: 1 }} onClick={() => setPage(page === 'login' ? 'register' : 'login')}>
              {page === 'login' ? 'No account? Register' : 'Have an account? Login'}
            </Button>
          </Box>
          {error && (
            <Box position="fixed" top={16} left={0} right={0} zIndex={9999} display="flex" justifyContent="center">
              <Paper sx={{ p: 2, bgcolor: 'error.main', color: '#fff' }}>{error}</Paper>
            </Box>
          )}
        </Container>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      {/* Top Navbar with Social X */}
      <Box width="100vw" position="fixed" top={0} left={0}
        bgcolor={darkMode ? undefined : '#f5f5f5'}
        sx={{
          height: 56,
          display: 'flex',
          alignItems: 'center',
          boxShadow: darkMode ? 4 : 2,
          borderRadius: 0,
          background: darkMode ? '#000' : undefined,
          // pl: { xs: 7, sm: 7 }, // removed to start icon from left
          transition: 'background 0.2s',
        }}
      >
        <Box display="flex" alignItems="center" gap={1}>
          <SocialXIcon size={32} color="#25d366" style={{ marginLeft: 12 }} />
          <Typography variant="h6" fontWeight={700} color={darkMode ? '#fff' : '#000'} sx={{ pl: 1, letterSpacing: 1 }}>
            Social X
          </Typography>
        </Box>
      </Box>
      <Box display="flex" width="100vw" bgcolor={darkMode ? '#000' : '#e9eaf0'} sx={{ height: 'calc(100vh - 56px)', width: '100vw', minWidth: '100vw', overflow: 'hidden', '::-webkit-scrollbar': { display: 'none' }, scrollbarWidth: 'none', msOverflowStyle: 'none', borderRadius: 0, boxShadow: 2, mt: 7 }} style={{ scrollBehavior: 'auto' }}>
        <Sidebar user={user} darkMode={darkMode} setDarkMode={setDarkMode} onNav={setNav} nav={nav} onLogout={handleLogout} onProfileEdit={handleProfileEdit} unreadChatsCount={unreadChatsCount} onNotificationSettings={() => setNotificationSettingsDialogOpen(true)} sx={{ width: 56, minWidth: 56, height: '100%', bgcolor: darkMode ? '#000' : '#fff', borderRadius: 0, boxShadow: 0, mt: 0, '::-webkit-scrollbar': { display: 'none' }, scrollbarWidth: 'none', msOverflowStyle: 'none' }} />
        {/* Chat List Panel */}
        {nav === 'status' ? (
          <Box width={{ xs: '100vw', sm: 320 }} minWidth={{ xs: '100vw', sm: 260 }} maxWidth={400} bgcolor={darkMode ? '#000' : '#fff'} p={{ xs: 1, sm: 2 }} boxShadow={0} display="flex" flexDirection="column" height="100%" borderRadius={0} sx={{ mt: 0, overflowY: 'auto', borderRadius: 0, borderTopLeftRadius: 0, borderTop: 0, position: 'relative', '::-webkit-scrollbar': { display: 'none' }, scrollbarWidth: 'none', '-ms-overflow-style': 'none' }}>
            <Typography variant="h5" fontWeight={900} sx={{ mt: 2, mb: 2, color: darkMode ? '#fff' : '#222', letterSpacing: 1 }}>Status</Typography>
            {/* My Status Card */}
            <Paper sx={{ display: 'flex', alignItems: 'center', p: 2, mb: 2, borderRadius: 3, bgcolor: darkMode ? '#000' : '#fff', '&:hover': { bgcolor: darkMode ? '#111' : '#f0f0f0' } }}>
              <Avatar src={user?.avatar} sx={{ width: 48, height: 48, mr: 2 }} />
              <Box>
                <Typography fontWeight={700} sx={{ color: darkMode ? '#fff' : '#222' }}>My status</Typography>
                <Typography variant="body2" color="textSecondary">
                  {statuses.find(s => s.userId === user?.id) ? statuses.find(s => s.userId === user?.id).text : 'No updates'}
                </Typography>
              </Box>
            </Paper>
            <Typography variant="subtitle2" color="textSecondary" mb={1}>Recent updates</Typography>
            <List sx={{ width: '100%', maxWidth: 400, bgcolor: darkMode ? '#000' : '#fff', borderRadius: 2, mb: 2 }}>
              {statuses.filter(s => s.userId !== user?.id).map(status => (
                <ListItem key={status.userId} sx={{ borderRadius: 2, mb: 1, bgcolor: darkMode ? '#000' : '#fff', '&:hover': { bgcolor: darkMode ? '#111' : '#f0f0f0' } }}>
                  <Avatar
                    src={status.avatar}
                    sx={{
                      width: 44,
                      height: 44,
                      mr: 2,
                      border: status.hasStatus ? '2px solid #25d366' : '2px solid transparent'
                    }}
                  />
                  <Box>
                    <Typography fontWeight={700} sx={{ color: darkMode ? '#fff' : '#222' }}>{status.username}</Typography>
                    <Typography variant="body2" color="textSecondary">{status.time}</Typography>
                  </Box>
                </ListItem>
              ))}
            </List>
          </Box>
        ) : nav === 'calls' ? (
          <Box width={{ xs: '100vw', sm: 320 }} minWidth={{ xs: '100vw', sm: 260 }} maxWidth={400} bgcolor={darkMode ? '#000' : '#fff'} p={{ xs: 1, sm: 2 }} boxShadow={0} display="flex" flexDirection="column" height="100%" borderRadius={0} sx={{ mt: 0, overflowY: 'auto', borderRadius: 0, borderTopLeftRadius: 0, borderTop: 0, position: 'relative', '::-webkit-scrollbar': { display: 'none' }, scrollbarWidth: 'none', '-ms-overflow-style': 'none' }}>
            <Typography variant="h5" fontWeight={900} sx={{ position: 'absolute', top: 20, left: 24, color: darkMode ? '#fff' : '#222', letterSpacing: 1 }}>Calls</Typography>
            <IconButton color="primary" sx={{ position: 'absolute', top: 16, right: 16, bgcolor: 'transparent', borderRadius: 0, width: 'auto', height: 'auto', boxShadow: 'none', p: 0, '&:hover': { bgcolor: 'transparent', color: darkMode ? '#1976d2' : '#1976d2' } }}>
              <AddIcCallIcon sx={{ fontSize: 24, color: darkMode ? '#fff' : '#222' }} />
            </IconButton>
            <Box height={40} />
            <List sx={{ width: '100%', maxWidth: 400, bgcolor: darkMode ? '#000' : '#fff', borderRadius: 2, mb: 2 }}>
              {/* Example call history items */}
              <ListItem sx={{ borderRadius: 2, mb: 1, bgcolor: darkMode ? '#000' : '#fff', '&:hover': { bgcolor: darkMode ? '#111' : '#f0f0f0' } }}>
                <Avatar sx={{ mr: 2 }}>A</Avatar>
                <ListItemText primary={<Typography fontWeight={600} sx={{ color: darkMode ? '#fff' : 'inherit' }}>Alice</Typography>} secondary={<Typography variant="body2" color="textSecondary" sx={{ color: darkMode ? '#bbb' : 'textSecondary.main' }}>Missed Call - 2 hours ago</Typography>} />
              </ListItem>
              <ListItem sx={{ borderRadius: 2, mb: 1, bgcolor: darkMode ? '#000' : '#fff', '&:hover': { bgcolor: darkMode ? '#111' : '#f0f0f0' } }}>
                <Avatar sx={{ mr: 2 }}>B</Avatar>
                <ListItemText primary={<Typography fontWeight={600} sx={{ color: darkMode ? '#fff' : 'inherit' }}>Bob</Typography>} secondary={<Typography variant="body2" color="textSecondary" sx={{ color: darkMode ? '#bbb' : 'textSecondary.main' }}>Outgoing Call - Yesterday</Typography>} />
              </ListItem>
              {/* Add more call items as needed */}
            </List>
          </Box>
        ) : (
          <Box width={{ xs: '100vw', sm: 320 }} minWidth={{ xs: '100vw', sm: 260 }} maxWidth={400} bgcolor={darkMode ? '#000' : '#fff'} p={{ xs: 1, sm: 2 }} boxShadow={0} display="flex" flexDirection="column" height="100%" borderRadius={0} sx={{ mt: 0, overflowY: 'auto', borderRadius: 0, borderTopLeftRadius: 0, borderTop: 0, position: 'relative' }}>
            <Box display="flex" alignItems="center" mb={2} gap={1}>
              <Box flex={1} display="flex" alignItems="center" bgcolor={darkMode ? '#111' : '#f5f5f5'} px={1} sx={{ border: darkMode ? '1.5px solid #222e35' : '1.5px solid #e0e0e0', borderRadius: '50px' }}>
                <SearchIcon sx={{ color: darkMode ? '#aebac1' : '#555' }} />
                <input
                  type="text"
                  placeholder="Search or start a new chat"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  style={{ border: 'none', outline: 'none', background: 'transparent', padding: 8, flex: 1, color: darkMode ? '#fff' : '#222', fontSize: 16 }}
                />
              </Box>
              <IconButton onClick={handleFilterMenuOpen} sx={{ color: darkMode ? '#aebac1' : '#555' }}><FilterListIcon /></IconButton>
              <Menu
                anchorEl={filterMenuAnchor}
                open={Boolean(filterMenuAnchor)}
                onClose={handleFilterMenuClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                PaperProps={{ sx: { minWidth: 180, borderRadius: 2, boxShadow: 3, bgcolor: darkMode ? '#111' : '#fff' } }}
              >
                <MenuItem onClick={() => { setProfileDialogUser(user); setProfileDialogOpen(true); handleFilterMenuClose(); }} sx={{ gap: 1 }}>
                  <PersonIcon fontSize="small" sx={{ color: darkMode ? '#fff' : '#000', mr: 1 }} />
                  Profile
                </MenuItem>
                <MenuItem onClick={handleFilterMenuClose} sx={{ gap: 1 }}>
                  <PushPinIcon fontSize="small" sx={{ color: darkMode ? '#bbb' : '#555' }} />
                  Pin/Unpin
                </MenuItem>
                <MenuItem onClick={handleFilterMenuClose} sx={{ gap: 1 }}>
                  <StarIcon fontSize="small" sx={{ color: darkMode ? '#bbb' : '#555' }} />
                  Favorite
                </MenuItem>
                {/* <MenuItem
                  onClick={() => {
                    // Dummy search handler
                    setMenuAnchorEl(null);
                  }}
                >
                  <SearchIcon sx={{ color: darkMode ? '#fff' : '#000', mr: 1 }} />
                  Search
                </MenuItem> */}
                <MenuItem
                  onClick={() => {
                    setClearChatDialogOpen(true);
                    setMenuAnchorEl(null);
                  }}
                  sx={{ color: '#e53935', fontWeight: 700 }}
                >
                  <DeleteOutlineIcon sx={{ color: darkMode ? '#ff7961' : '#e53935', mr: 1 }} />
                  Clear Chat
                </MenuItem>
                {!isBlocked ? (
                  <MenuItem
                    onClick={async () => {
                      try {
                        await axios.post(`${API_URL}/messages/block/${selectedUser._id}`, {}, { headers: { Authorization: `Bearer ${token}` } });
                        setIsBlocked(true);
                        // Refetch user info to update avatar and username
                        const res = await axios.get(`${API_URL}/messages/users/${selectedUser._id}`, { headers: { Authorization: `Bearer ${token}` } });
                        setSelectedUser(res.data);
                      } catch {}
                      setMenuAnchorEl(null);
                    }}
                    sx={{ color: '#e53935', fontWeight: 700 }}
                  >
                    <BlockIcon sx={{ color: darkMode ? '#ff7961' : '#e53935', mr: 1 }} />
                    Block
                  </MenuItem>
                ) : (
                  <MenuItem
                    onClick={async () => {
                      try {
                        await axios.post(`${API_URL}/messages/unblock/${selectedUser._id}`, {}, { headers: { Authorization: `Bearer ${token}` } });
                        setIsBlocked(false);
                        // Refetch user info to update avatar and username
                        const res = await axios.get(`${API_URL}/messages/users/${selectedUser._id}`, { headers: { Authorization: `Bearer ${token}` } });
                        setSelectedUser(res.data);
                      } catch {}
                      setMenuAnchorEl(null);
                    }}
                    sx={{ color: '#43a047', fontWeight: 700 }}
                  >
                    <LockOpenIcon sx={{ color: darkMode ? '#43a047' : '#43a047', mr: 1 }} />
                    Unblock
                  </MenuItem>
                )}
              </Menu>
            </Box>
            {pinnedChats.length > 0 && (
              <>
                <Typography variant="subtitle2" color="textSecondary" mb={1} mt={1}>Pinned</Typography>
                <List sx={{ mb: 2 }}>
                  {pinnedChats.map(u => {
                    const unreadCount = unreadCounts[u._id] || 0;
                    const isOnline = getUserStatus(u).status === 'online';
                    const lastMsgObj = lastMessages[u._id];
                    
                    let fileData = null;
                    let lastMsgContent = (lastMsgObj && typeof lastMsgObj === 'object' ? lastMsgObj.content : lastMsgObj) || '';
                    try {
                      const parsed = JSON.parse(lastMsgContent);
                      if (parsed && parsed.file) {
                        fileData = parsed;
                        if (fileData.type === 'image') lastMsgContent = 'Image';
                        else if (fileData.type === 'video') lastMsgContent = 'Video';
                        else if (fileData.type === 'audio') lastMsgContent = 'Voice message';
                        else lastMsgContent = fileData.name || 'File';
                      }
                    } catch {}

                    const lastMsgTimestamp = (lastMsgObj && typeof lastMsgObj === 'object' ? lastMsgObj.createdAt : null);
                    return (
                      <Tooltip title={lastMsgContent} placement="right">
                        <ListItem button key={u._id} selected={selectedUser?._id === u._id} onClick={() => { setSelectedUser(u); setSelectedGroup(null); }} sx={{ borderRadius: 2, mb: 1 }}>
                          <Box position="relative" display="inline-block" mr={1}>
                            <Avatar src={u.avatar} />
                            {isOnline && (
                              <Box position="absolute" bottom={2} right={2} width={8} height={8} bgcolor="#25d366" borderRadius="50%" border={`2px solid ${darkMode ? '#000' : '#fff'}`} />
                            )}
                            {(unreadCount > 0 && (!isOnline || selectedUser?._id !== u._id)) && (
                              <Box position="absolute" top={-2} right={-2} bgcolor="#25d366" color="#fff" borderRadius="50%" minWidth={18} height={18} display="flex" alignItems="center" justifyContent="center" fontSize={12} fontWeight={700} px={0.5} boxShadow={2}>
                                {unreadCount}
                              </Box>
                            )}
                          </Box>
                          <Box flex={1} minWidth={0} mr={1.5}>
                            <Typography fontWeight={600} sx={{ color: darkMode ? '#fff' : 'inherit', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {u.username}
                            </Typography>
                            {typingUsers.includes(u._id) ? (
                              <Typography variant="body2" sx={{ fontStyle: 'italic', fontSize: 13, color: '#25d366' }}>typing...</Typography>
                            ) : (
                              <Box display="flex" alignItems="center">
                                {fileData && fileData.type === 'image' && <ImageIcon sx={{ fontSize: 16, mr: 0.5, color: darkMode ? '#bbb' : 'textSecondary.main' }} />}
                                {fileData && fileData.type === 'video' && <VideocamIcon sx={{ fontSize: 16, mr: 0.5, color: darkMode ? '#bbb' : 'textSecondary.main' }} />}
                                {fileData && fileData.type === 'audio' && <AudiotrackIcon sx={{ fontSize: 16, mr: 0.5, color: darkMode ? '#bbb' : 'textSecondary.main' }} />}
                                {fileData && !['image', 'video', 'audio'].includes(fileData.type) && <DescriptionIcon sx={{ fontSize: 16, mr: 0.5, color: darkMode ? '#bbb' : 'textSecondary.main' }} />}
                                <Typography variant="body2" color="textSecondary" sx={{ color: darkMode ? '#bbb' : 'textSecondary.main', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                  {lastMsgContent}
                                </Typography>
                              </Box>
                            )}
                          </Box>
                          {lastMsgTimestamp && <Typography variant="caption" color="textSecondary" sx={{ color: darkMode ? '#bbb' : 'textSecondary.main' }}>
                            {new Date(lastMsgTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </Typography>}
                          <IconButton onClick={e => { e.stopPropagation(); setPinned(p => p.filter(id => id !== u._id)); }} size="small">
                            <PushPinIcon fontSize="small" color="primary" sx={{ ml: 1 }} />
                          </IconButton>
                        </ListItem>
                      </Tooltip>
                    );
                  })}
                </List>
              </>
            )}
            <Typography variant="subtitle2" color="textSecondary" mb={1}>All Chats</Typography>
            <Box flex={1} sx={{ overflowY: 'auto', '::-webkit-scrollbar': { display: 'none' }, scrollbarWidth: 'none', '-ms-overflow-style': 'none' }}>
              <List sx={{ flex: 1 }}>
                {unpinnedChats.map(u => {
                  const unreadCount = unreadCounts[u._id] || 0;
                  const isOnline = getUserStatus(u).status === 'online';
                  const lastMsgObj = lastMessages[u._id];

                  let fileData = null;
                  let lastMsgContent = (lastMsgObj && typeof lastMsgObj === 'object' ? lastMsgObj.content : lastMsgObj) || '';
                  try {
                    const parsed = JSON.parse(lastMsgContent);
                    if (parsed && parsed.file) {
                      fileData = parsed;
                      if (fileData.type === 'image') lastMsgContent = 'Image';
                      else if (fileData.type === 'video') lastMsgContent = 'Video';
                      else if (fileData.type === 'audio') lastMsgContent = 'Voice message';
                      else lastMsgContent = fileData.name || 'File';
                    }
                  } catch {}

                  const lastMsgTimestamp = (lastMsgObj && typeof lastMsgObj === 'object' ? lastMsgObj.createdAt : null);
                  return (
                    <Tooltip title={lastMsgContent} placement="right">
                      <ListItem button key={u._id} selected={selectedUser?._id === u._id} onClick={() => { setSelectedUser(u); setSelectedGroup(null); }} sx={{ borderRadius: 2, mb: 1 }}>
                        <Box position="relative" display="inline-block" mr={1}>
                          <Avatar src={u.avatar} />
                          {isOnline && (
                            <Box position="absolute" bottom={2} right={2} width={8} height={8} bgcolor="#25d366" borderRadius="50%" border={`2px solid ${darkMode ? '#000' : '#fff'}`} />
                          )}
                          {(unreadCount > 0 && (!isOnline || selectedUser?._id !== u._id)) && (
                            <Box position="absolute" top={-2} right={-2} bgcolor="#25d366" color="#fff" borderRadius="50%" minWidth={18} height={18} display="flex" alignItems="center" justifyContent="center" fontSize={12} fontWeight={700} px={0.5} boxShadow={2}>
                              {unreadCount}
                            </Box>
                          )}
                        </Box>
                        <Box flex={1} minWidth={0} mr={1.5}>
                          <Typography fontWeight={600} sx={{ color: darkMode ? '#fff' : 'inherit', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {u.username}
                          </Typography>
                          {typingUsers.includes(u._id) ? (
                            <Typography variant="body2" sx={{ fontStyle: 'italic', fontSize: 13, color: '#25d366' }}>typing...</Typography>
                          ) : (
                            <Box display="flex" alignItems="center">
                              {fileData && fileData.type === 'image' && <ImageIcon sx={{ fontSize: 16, mr: 0.5, color: darkMode ? '#bbb' : 'textSecondary.main' }} />}
                              {fileData && fileData.type === 'video' && <VideocamIcon sx={{ fontSize: 16, mr: 0.5, color: darkMode ? '#bbb' : 'textSecondary.main' }} />}
                              {fileData && fileData.type === 'audio' && <AudiotrackIcon sx={{ fontSize: 16, mr: 0.5, color: darkMode ? '#bbb' : 'textSecondary.main' }} />}
                              {fileData && !['image', 'video', 'audio'].includes(fileData.type) && <DescriptionIcon sx={{ fontSize: 16, mr: 0.5, color: darkMode ? '#bbb' : 'textSecondary.main' }} />}
                              <Typography variant="body2" color="textSecondary" sx={{ color: darkMode ? '#bbb' : 'textSecondary.main', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {lastMsgContent}
                              </Typography>
                            </Box>
                          )}
                        </Box>
                        {lastMsgTimestamp && <Typography variant="caption" color="textSecondary" sx={{ color: darkMode ? '#bbb' : 'textSecondary.main' }}>
                          {new Date(lastMsgTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Typography>}
                        <IconButton onClick={e => { e.stopPropagation(); handleOpenProfileDialog(u); }}><PersonIcon /></IconButton>
                      </ListItem>
                    </Tooltip>
                  );
                })}
              </List>
            </Box>
          </Box>
        )}
        <Box sx={{ width: '2px', height: 'calc(100vh - 0px)', backgroundColor: darkMode ? '#222' : '#e0e0e0', borderRadius: 0, mx: 0, my: 2 }} />
        {/* Chat Window */}
        <Box flex={1} display="flex" flexDirection="column" p={0} borderRadius={0} boxShadow={0} bgcolor={darkMode ? '#000' : '#fff'} height="100%" minWidth={0} overflow="hidden" sx={{ 
          width: 'auto', 
          maxWidth: '100vw', 
          overflow: 'hidden', 
          '::-webkit-scrollbar': { display: 'none' }, 
          scrollbarWidth: 'none', 
          msOverflowStyle: 'none', 
          borderRadius: 0, 
          boxShadow: 0, 
          mt: 0,
          position: 'relative',
        }}>
          {/* If no chat is selected, show SocialXIcon centered */}
          {!(selectedUser || selectedGroup) && (
            <Box flex={1} display="flex" flexDirection="column" alignItems="center" justifyContent="center" sx={{ 
              minHeight: 0, 
              minWidth: 0,
              bgcolor: darkMode ? '#000' : '#fff'
            }}>
              <SocialXIcon size={120} color="#888" style={{ marginBottom: 24 }} />
              <Typography variant="h5" color="textSecondary" align="center" sx={{ fontWeight: 600 }}>
                Welcome to Social X
              </Typography>
              <Typography variant="body1" color="textSecondary" align="center" sx={{ mt: 1 }}>
                Select a conversation or start a new one
              </Typography>
            </Box>
          )}
          {/* Top Bar */}
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            px={3}
            py={2}
            {...((selectedUser || selectedGroup) && {
              borderBottom: 1,
              borderColor: darkMode ? '#222' : '#eee',
            })}
          >
            <Box display="flex" alignItems="center">
              {(selectedUser || selectedGroup) && (
                <IconButton onClick={() => {
                  setSelectedUser(null);
                  setSelectedGroup(null);
                  setMessages([]);
                  setGroupMessages([]);
                  setMessage('');
                }} sx={{ mr: 1 }}>
                  <ArrowBackIcon />
                </IconButton>
              )}
              {selectedUser && !isBlocked && (
                <Box display="flex" alignItems="center" sx={{ cursor: 'pointer' }} onClick={() => { handleOpenProfileDialog(selectedUser); }}>
                  <Box position="relative" display="inline-block" mr={2}>
                    <Avatar src={selectedUser.avatar || undefined}>
                      {!selectedUser.avatar && selectedUser.username ? selectedUser.username[0] : null}
                    </Avatar>
                    {/* Only show online indicator if NOT blocked */}
                    {!isBlocked && selectedUser.avatar && getUserStatus(selectedUser).status === 'online' && (
                      <Box position="absolute" bottom={2} right={2} width={8} height={8} bgcolor="#25d366" borderRadius="50%" border={`2px solid ${darkMode ? '#000' : '#fff'}`} />
                    )}
                  </Box>
                  <Box>
                    <Typography fontWeight={600} sx={{ color: darkMode ? '#fff' : 'inherit' }}>{selectedUser.username}</Typography>
                    {/* Only show online/last seen if NOT blocked */}
                    {!isBlocked && selectedUser.avatar && (
                      getUserStatus(selectedUser).status === 'online'
                        ? <Typography variant="caption" color="textSecondary">Online</Typography>
                        : <Typography variant="caption" color="textSecondary">
                            {getUserStatus(selectedUser).lastSeen ? `Last seen ${new Date(getUserStatus(selectedUser).lastSeen).toLocaleString()}` : 'Offline'}
                          </Typography>
                    )}
                  </Box>
                </Box>
              )}
              {selectedGroup && (
                <Box display="flex" alignItems="center">
                  <Avatar src={selectedGroup.avatar} sx={{ mr: 2, cursor: 'pointer' }} onClick={() => { handleOpenProfileDialog(selectedGroup); }} />
                  <Box>
                    <Typography fontWeight={600} sx={{ color: darkMode ? '#fff' : 'inherit' }}>{selectedGroup.name}</Typography>
                    <Typography variant="caption" color="textSecondary">Group</Typography>
                  </Box>
                </Box>
              )}
            </Box>
            <Box>
              {(selectedUser || selectedGroup) && (
                <Box display="flex" alignItems="center" sx={{ gap: 0.5 }}>
                  <IconButton
                    onClick={() => startCall(false)}
                    sx={{
                      color: darkMode ? '#aebac1' : '#222',
                      width: 40,
                      height: 40,
                      borderRadius: 2,
                      background: 'none',
                      boxShadow: 0,
                      p: 0,
                      m: 0,
                    }}
                  >
                    <VideocamOutlinedIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    onClick={() => startCall(true)}
                    sx={{
                      color: darkMode ? '#aebac1' : '#222',
                      width: 40,
                      height: 40,
                      borderRadius: 2,
                      background: 'none',
                      boxShadow: 0,
                      p: 0,
                      m: 0,
                    }}
                  >
                    <CallOutlinedIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    sx={{
                      color: darkMode ? '#aebac1' : '#222',
                      width: 40,
                      height: 40,
                      borderRadius: 2,
                      background: 'none',
                      boxShadow: 0,
                      p: 0,
                      m: 0,
                    }}
                    onClick={e => setMenuAnchorEl(e.currentTarget)}
                  >
                    <MoreVertIcon fontSize="small" />
                  </IconButton>
                  <Menu
                    anchorEl={menuAnchorEl}
                    open={Boolean(menuAnchorEl)}
                    onClose={() => setMenuAnchorEl(null)}
                    PaperProps={{ sx: { minWidth: 180, maxHeight: 240, overflowY: 'auto', borderRadius: 2, boxShadow: 3, bgcolor: darkMode ? '#222' : '#fff' } }}
                  >
                    <MenuItem
                      onClick={() => {
                        handleOpenProfileDialog(selectedUser);
                        setMenuAnchorEl(null);
                      }}
                    >
                      <PersonIcon sx={{ color: darkMode ? '#fff' : '#000', mr: 1 }} />
                      View Profile
                    </MenuItem>
                    <MenuItem
                      onClick={() => {
                        // Dummy search handler
                        setMenuAnchorEl(null);
                      }}
                    >
                      <SearchIcon sx={{ color: darkMode ? '#fff' : '#000', mr: 1 }} />
                      Search
                    </MenuItem>
                    {/* <MenuItem
                      onClick={() => {
                        testSentMessageNotification();
                        setMenuAnchorEl(null);
                      }}
                    >
                      <Typography sx={{ color: darkMode ? '#fff' : '#000', mr: 1 }}>📤</Typography>
                      Test Sent Notification
                    </MenuItem>
                    <MenuItem
                      onClick={() => {
                        testPushNotification();
                        setMenuAnchorEl(null);
                      }}
                    >
                      <Typography sx={{ color: darkMode ? '#fff' : '#000', mr: 1 }}>📱</Typography>
                      Test Push Notification
                    </MenuItem>
                    <MenuItem
                      onClick={() => {
                        debugNotifications();
                        setMenuAnchorEl(null);
                      }}
                    >
                      <Typography sx={{ color: darkMode ? '#fff' : '#000', mr: 1 }}>🔍</Typography>
                      Debug Notifications
                    </MenuItem> */}
                    <MenuItem
                      onClick={() => {
                        setClearChatDialogOpen(true);
                        setMenuAnchorEl(null);
                      }}
                      sx={{ color: '#e53935', fontWeight: 700 }}
                    >
                      <DeleteOutlineIcon sx={{ color: darkMode ? '#ff7961' : '#e53935', mr: 1 }} />
                      Clear Chat
                    </MenuItem>
                    {!isBlocked ? (
                      <MenuItem
                        onClick={async () => {
                          try {
                            await axios.post(`${API_URL}/messages/block/${selectedUser._id}`, {}, { headers: { Authorization: `Bearer ${token}` } });
                            setIsBlocked(true);
                            // Refetch user info to update avatar and username
                            const res = await axios.get(`${API_URL}/messages/users/${selectedUser._id}`, { headers: { Authorization: `Bearer ${token}` } });
                            setSelectedUser(res.data);
                          } catch {}
                          setMenuAnchorEl(null);
                        }}
                        sx={{ color: '#e53935', fontWeight: 700 }}
                      >
                        <BlockIcon sx={{ color: darkMode ? '#ff7961' : '#e53935', mr: 1 }} />
                        Block
                      </MenuItem>
                    ) : (
                      <MenuItem
                        onClick={async () => {
                          try {
                            await axios.post(`${API_URL}/messages/unblock/${selectedUser._id}`, {}, { headers: { Authorization: `Bearer ${token}` } });
                            setIsBlocked(false);
                            // Refetch user info to update avatar and username
                            const res = await axios.get(`${API_URL}/messages/users/${selectedUser._id}`, { headers: { Authorization: `Bearer ${token}` } });
                            setSelectedUser(res.data);
                          } catch {}
                          setMenuAnchorEl(null);
                        }}
                        sx={{ color: '#43a047', fontWeight: 700 }}
                      >
                        <LockOpenIcon sx={{ color: darkMode ? '#43a047' : '#43a047', mr: 1 }} />
                        Unblock
                      </MenuItem>
                    )}
                  </Menu>
                </Box>
              )}
            </Box>
          </Box>
          {/* Messages */}
          {(selectedUser || selectedGroup) && (
            isBlocked ? (
              <Box flex={1} display="flex" flexDirection="column" alignItems="center" justifyContent="center" sx={{ minHeight: 0, minWidth: 0 }}>
                <LockIcon sx={{ fontSize: 48, color: darkMode ? '#fff' : '#000', mb: 2 }} />
                <Typography variant="h6" color={darkMode ? '#fff' : '#000'}>You have blocked this user</Typography>
                <Typography variant="body2" color="textSecondary">You can't send messages or view their profile.</Typography>
              </Box>
            ) : (
              <Box
                ref={messagesContainerRef}
                flex={1}
                sx={{
                  overflowY: 'auto',
                  '&::-webkit-scrollbar': { display: 'none' },
                  scrollbarWidth: 'none',
                  msOverflowStyle: 'none',
                  bgcolor: darkMode ? '#0d1a21' : '#E5DDD5',
                  backgroundImage: `url('/whatsapp-doodle-bg.png')`,
                  backgroundSize: 'auto',
                  backgroundRepeat: 'repeat',
                  backgroundPosition: 'center',
                }}
                p={3}
                pb={2} // Add bottom padding to prevent overlap with input
              >
                {messages.map((msg, idx) => {
                  let fileData = null;
                  try {
                    fileData = msg.content && typeof msg.content === 'string' && msg.content.startsWith('{') ? JSON.parse(msg.content) : null;
                  } catch {}
                  // Find the last sent & read message index
                  const lastSentReadIdx = (() => {
                    for (let i = messages.length - 1; i >= 0; i--) {
                      if (messages[i].sender === user.id && messages[i].read) return i;
                    }
                    return -1;
                  })();
                  return (
                    <>
                      <Box key={idx} display="flex" flexDirection="column" alignItems={msg.sender === user.id ? 'flex-end' : 'flex-start'} width="100%" sx={{ mb: 1 }}>
                        <Box display="flex" justifyContent={msg.sender === user.id ? 'flex-end' : 'flex-start'} width="100%">
                          <Box bgcolor={msg.sender === user.id ? '#0E605A' : (darkMode ? '#222' : '#eee')} color={msg.sender === user.id ? '#fff' : (darkMode ? '#fff' : '#000')} px={2} py={1} borderRadius={3} maxWidth={"60%"} boxShadow={1} sx={{ wordBreak: 'break-word', overflowWrap: 'break-word', width: 'auto' }}>
                            {fileData && fileData.file ? (
                              fileData.type === 'audio' ? (
                                <AudioWaveform
                                  ref={el => (audioRefs.current[msg._id] = el)}
                                  audioSrc={getFullUrl(fileData.file)}
                                  profileImg={getSenderInfo(msg.sender).avatar}
                                  profileName={getSenderInfo(msg.sender).username}
                                  duration={audioStates[msg._id]?.duration || 0}
                                  isPlaying={audioStates[msg._id]?.isPlaying || false}
                                  currentTime={audioStates[msg._id]?.currentTime || 0}
                                  onPlayPause={() => handlePlayPause(msg._id)}
                                  onSeek={(time) => handleSeek(msg._id, time)}
                                />
                              ) : (
                                <Box display="flex" alignItems="center" gap={1}>
                                  <Avatar
                                    src={getSenderInfo(msg.sender).avatar}
                                    alt={getSenderInfo(msg.sender).username}
                                    sx={{ width: 32, height: 32, mr: 1 }}
                                  />
                                  <Box>
                                    {fileData.type === 'image' ? (
                                      <img
                                        src={getFullUrl(fileData.file)}
                                        alt={fileData.name}
                                        style={{ maxWidth: 200, maxHeight: 200, borderRadius: 8, cursor: 'pointer' }}
                                        onClick={() => {
                                          setDialogImageUrl(getFullUrl(fileData.file));
                                          setOpenImageDialog(true);
                                        }}
                                      />
                                    ) : fileData.type === 'video' ? (
                                      <video src={getFullUrl(fileData.file)} controls style={{ maxWidth: 200, maxHeight: 200, borderRadius: 8 }} />
                                    ) : (
                                      (() => {
                                        const fileExtension = fileData.file.split('.').pop().toLowerCase();
                                        const isPdf = fileExtension === 'pdf';
                                        const isDocx = fileExtension === 'docx';
                                        if (isPdf) {
                                          return (
                                            <Box
                                              display="flex" alignItems="center" sx={{ cursor: 'pointer' }}
                                              onClick={() => {
                                                setDocumentUrl(fileData.file);
                                                setPdfViewerOpen(true);
                                              }}
                                            >
                                              <DescriptionIcon sx={{ color: msg.sender === user.id ? '#fff' : (darkMode ? '#fff' : '#1976d2'), mr: 1 }} />
                                              <Typography variant="body2" sx={{ color: msg.sender === user.id ? '#fff' : (darkMode ? '#fff' : '#1976d2') }}>
                                                {fileData.name}
                                              </Typography>
                                            </Box>
                                          );
                                        }
                                        if (isDocx) {
                                          return (
                                            <Box
                                              display="flex" alignItems="center" sx={{ cursor: 'pointer' }}
                                              onClick={() => {
                                                setDocumentUrl(fileData.file);
                                                setDocxViewerOpen(true);
                                              }}
                                            >
                                              <DescriptionIcon sx={{ color: msg.sender === user.id ? '#fff' : (darkMode ? '#fff' : '#1976d2'), mr: 1 }} />
                                              <Typography variant="body2" sx={{ color: msg.sender === user.id ? '#fff' : (darkMode ? '#fff' : '#1976d2') }}>
                                                {fileData.name}
                                              </Typography>
                                            </Box>
                                          );
                                        }
                                        return (
                                          <a href={getFullUrl(fileData.file)} target="_blank" rel="noopener noreferrer" style={{ color: msg.sender === user.id ? '#fff' : (darkMode ? '#fff' : '#1976d2') }}>
                                            {fileData.name || 'Download file'}
                                          </a>
                                        );
                                      })()
                                    )}
                                  </Box>
                                </Box>
                              )
                            ) : (
                              msg.content
                            )}
                            <Typography variant="caption" sx={{ color: '#888', ml: 1, fontSize: 11, alignSelf: 'flex-end' }}>
                              {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </Typography>
                            {msg.sender === user.id && (
                              <Typography variant="caption" sx={{ color: '#888', ml: 0.5, fontSize: 11, alignSelf: 'flex-end' }}>
                                {msg.read ? '✓✓' : '✓'}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                        {/* Seen indicator only below the last sent & read message */}
                        {idx === lastSentReadIdx && (
                          <Typography variant="caption" sx={{ color: '#888', mt: 0.5, fontSize: 12, maxWidth: '60%', textAlign: 'right' }}>Seen</Typography>
                        )}
                      </Box>
                      {/* Typing indicator */}
                      {selectedUser && typingUsers.includes(selectedUser._id) && (
                        <Box display="flex" alignItems="center" mt={1} mb={1}>
                          <Box sx={{ display: 'flex', alignItems: 'center', height: 18 }}>
                            <span style={{
                              display: 'flex',
                              flexDirection: 'row',
                              alignItems: 'center',
                              width: 28,
                              height: 12,
                              background: 'transparent',
                            }}>
                              <span style={{
                                display: 'inline-block',
                                width: 6,
                                height: 6,
                                margin: '0 2px',
                                background: '#bbb',
                                borderRadius: '50%',
                                animation: 'typing-bounce 1s infinite',
                                animationDelay: '0s',
                              }} />
                              <span style={{
                                display: 'inline-block',
                                width: 6,
                                height: 6,
                                margin: '0 2px',
                                background: '#bbb',
                                borderRadius: '50%',
                                animation: 'typing-bounce 1s infinite',
                                animationDelay: '0.2s',
                              }} />
                              <span style={{
                                display: 'inline-block',
                                width: 6,
                                height: 6,
                                margin: '0 2px',
                                background: '#bbb',
                                borderRadius: '50%',
                                animation: 'typing-bounce 1s infinite',
                                animationDelay: '0.4s',
                              }} />
                            </span>
                            <style>{`
                              @keyframes typing-bounce {
                                0%, 80%, 100% { transform: scale(0.7); opacity: 0.7; }
                                40% { transform: scale(1); opacity: 1; }
                              }
                            `}</style>
                          </Box>
                        </Box>
                      )}
                    </>
                  );
                })}
                {/* Dummy div for scroll-to-bottom */}
                <div ref={messagesEndRef} />
              </Box>
            )
          )}
          {/* WhatsApp-style Message Input */}
          {selectedUser && !isBlocked && (
            <Box
              display="flex"
              alignItems="center"
              px={{ xs: 1, sm: 2 }}
              py={0.75}
              sx={{
                bgcolor: darkMode ? '#000' : '#f5f5f5',
                // width: '100%',
                position: 'sticky',
                bottom: 0,
                minHeight: 56,
                zIndex: 2,
                gap: 1.5,
                borderTop: `1px solid ${darkMode ? '#222' : '#e0e0e0'}`,
                pl: 0, // Remove left padding
                // Remove left padding (for extra safety)
              }}
            >
              <IconButton
                sx={{ color: darkMode ? '#fff' : '#555', p: 1.2, bgcolor: 'transparent' }}
                onClick={e => {
                  if (isRecording) {
                    cancelRecording();
                  }
                  setEmojiMenuAnchor(e.currentTarget);
                }}
              >
                <span role="img" aria-label="emoji" style={{ fontSize: 24 }}>😊</span>
              </IconButton>
              <IconButton
                sx={{ color: darkMode ? '#fff' : '#555', p: 1.2, bgcolor: 'transparent' }}
                onClick={e => {
                  if (isRecording) {
                    cancelRecording();
                  }
                  setAttachMenuAnchor(e.currentTarget);
                }}
              >
                <AttachFileIcon sx={{ fontSize: 22, color: darkMode ? '#fff' : '#555' }} />
              </IconButton>

              <input
                type="file"
                accept={
                  fileInputType === 'image' ? 'image/*' :
                  fileInputType === 'audio' ? 'audio/*' :
                  fileInputType === 'video' ? 'video/*' :
                  fileInputType === 'document' ? '.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar' : '*/*'
                }
                hidden
                id="chat-file-input"
                onChange={handleFileChange}
              />
              <Menu
                anchorEl={attachMenuAnchor}
                open={Boolean(attachMenuAnchor)}
                onClose={() => setAttachMenuAnchor(null)}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                transformOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              >
                <MenuItem onClick={() => { setFileInputType('image'); setAttachMenuAnchor(null); setTimeout(() => document.getElementById('chat-file-input').click(), 100); }}>
                  <ImageIcon fontSize="medium" sx={{ color: darkMode ? '#fff' : '#222', mr: 1 }} /> Image
                </MenuItem>
                <MenuItem onClick={() => { setFileInputType('audio'); setAttachMenuAnchor(null); setTimeout(() => document.getElementById('chat-file-input').click(), 100); }}>
                  <AudiotrackIcon fontSize="medium" sx={{ color: darkMode ? '#fff' : '#222', mr: 1 }} /> Audio
                </MenuItem>
                <MenuItem onClick={() => { setFileInputType('video'); setAttachMenuAnchor(null); setTimeout(() => document.getElementById('chat-file-input').click(), 100); }}>
                  <MovieIcon fontSize="medium" sx={{ color: darkMode ? '#fff' : '#222', mr: 1 }} /> Video
                </MenuItem>
                <MenuItem onClick={() => { setFileInputType('document'); setAttachMenuAnchor(null); setTimeout(() => document.getElementById('chat-file-input').click(), 100); }}>
                  <DescriptionIcon fontSize="medium" sx={{ color: darkMode ? '#fff' : '#222', mr: 1 }} /> Document
                </MenuItem>
              </Menu>
              <Menu
                anchorEl={emojiMenuAnchor}
                open={Boolean(emojiMenuAnchor)}
                onClose={() => setEmojiMenuAnchor(null)}
                anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
                transformOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                PaperProps={{ sx: { bgcolor: darkMode ? '#222' : '#fff', p: 0 } }}
              >
                <Picker
                  theme={darkMode ? 'dark' : 'light'}
                  onEmojiSelect={emoji => {
                    setMessage(prev => prev + emoji.native);
                  }}
                  showPreview={false}
                  showSkinTones={false}
                  style={{ border: 'none', boxShadow: 'none' }}
                />
              </Menu>

              <Box
                flex={1}
                display="flex"
                alignItems="center"
                sx={{
                  bgcolor: isRecording ? (darkMode ? '#222' : '#f0f0f0') : 'transparent',
                  px: isRecording ? 2 : 1,
                  py: isRecording ? 1 : 0.5,
                  borderRadius: 20,
                  transition: 'background-color 0.3s'
                }}
              >
                {isRecording ? (
                  <>
                    <IconButton onClick={cancelRecording} sx={{ color: darkMode ? '#fff' : '#555', p: 0.5 }}>
                      <DeleteIcon />
                    </IconButton>
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#ff4444', animation: isPaused ? 'none' : 'pulse 1.5s infinite', ml: 1 }} />
                    <Typography variant="body1" sx={{ color: darkMode ? '#fff' : '#333', minWidth: 40, ml: 1.5 }}>
                      {formatRecordingTime(recordingTime)}
                    </Typography>

                    {isPaused ? (
                      <IconButton onClick={handleResumeRecording} sx={{ color: darkMode ? '#fff' : '#555', p: 0.5, ml: 1 }}>
                        <PlayArrowIcon />
                      </IconButton>
                    ) : (
                      <IconButton onClick={handlePauseRecording} sx={{ color: darkMode ? '#fff' : '#555', p: 0.5, ml: 1 }}>
                        <PauseIcon />
                      </IconButton>
                    )}

                    <Box display="flex" alignItems="center" flex={1} height={24} overflow="hidden" ml={2}>
                      {Array.from({ length: 40 }).map((_, i) => (
                        <Box key={i} sx={{
                          width: 2,
                          height: `${Math.floor(Math.random() * (80 - 20 + 1)) + 20}%`,
                          bgcolor: '#999',
                          m: '0 1px',
                        }} />
                      ))}
                    </Box>
                  </>
                ) : (
                  <input
                    type="text"
                    placeholder="Type a message"
                    value={message}
                    onChange={e => {
                      setMessage(e.target.value);
                      setIsTyping(true);
                    }}
                    onKeyDown={e => e.key === 'Enter' && handleSend()}
                    style={{
                      border: 'none',
                      outline: 'none',
                      background: 'transparent',
                      width: '100%',
                      fontSize: 16,
                      color: darkMode ? '#fff' : '#222',
                      padding: '8px 0',
                    }}
                    disabled={isBlocked}
                  />
                )}
              </Box>

              {isRecording ? (
                <IconButton
                  onClick={stopAndSendRecording}
                  sx={{
                    bgcolor: '#25d366',
                    color: '#fff',
                    borderRadius: 2,
                    p: 1.25,
                    '&:hover': { bgcolor: '#1da851' }
                  }}
                >
                  <SendIcon sx={{ fontSize: 20 }} />
                </IconButton>
              ) : message.trim() ? (
                <IconButton
                  onClick={handleSend}
                  sx={{
                    color: '#25d366',
                    p: 2,
                    bgcolor: 'transparent',
                    '&:hover': {
                      bgcolor: darkMode ? '#111' : '#f0f0f0',
                    }
                  }}
                >
                  <SendIcon sx={{ fontSize: 24 }} />
                </IconButton>
              ) : (
                <IconButton
                  onClick={startRecording}
                  sx={{
                    color: darkMode ? '#fff' : '#555',
                    p: 2,
                    bgcolor: 'transparent',
                  }}
                >
                  <MicIcon sx={{ fontSize: 24 }} />
                </IconButton>
              )}
            </Box>
          )}
          <VideoCallModal
            open={callOpen}
            onClose={endCall}
            localStream={localStream}
            remoteStream={remoteStream}
            onAccept={acceptCall}
            onEnd={endCall}
            incoming={callIncoming}
            accepted={callAccepted}
            audioOnly={audioOnly}
          />
        </Box>
        <UserProfileDialog
          open={profileDialogOpen}
          onClose={() => setProfileDialogOpen(false)}
          user={profileDialogUser}
          onChat={member => {
            setSelectedUser(member);
            setSelectedGroup(null);
            setProfileDialogOpen(false);
          }}
          onCall={member => {
            setSelectedUser(member);
            setSelectedGroup(null);
            setProfileDialogOpen(false);
            setTimeout(() => startCall(true), 100); // Start audio call after state updates
          }}
        />
        <NotificationSettingsDialog
          open={notificationSettingsDialogOpen}
          onClose={() => setNotificationSettingsDialogOpen(false)}
          settings={notificationSettings}
          onSave={updateNotificationSettings}
        />
        <Snackbar open={!!error} autoHideDuration={4000} onClose={() => setError('')} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          sx={{ mt: 3 }}
        >
          <MuiAlert onClose={() => setError('')} severity="error" sx={{ maxWidth: 400, borderRadius: 2, mx: 'auto', boxShadow: 3 }} elevation={6} variant="filled">
            {error}
          </MuiAlert>
        </Snackbar>
        {/* Clear Chat Confirmation Dialog */}
        <Dialog open={clearChatDialogOpen} onClose={() => setClearChatDialogOpen(false)}>
          <DialogTitle>Clear Chat</DialogTitle>
          <DialogContent>
            <Typography>Do you want to delete this chat for everyone or just for you?</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={async () => {
              // Delete for everyone
              try {
                await axios.delete(`${API_URL}/messages/${selectedUser._id}`, { headers: { Authorization: `Bearer ${token}` } });
                if (socket && selectedUser) {
                  socket.emit('deleteChatForEveryone', { to: selectedUser._id });
                }
              } catch {}
              setMessages([]);
              setUnreadCounts(prev => {
                const updated = { ...prev, [selectedUser._id]: 0 };
                try {
                  localStorage.setItem('unreadCounts', JSON.stringify(updated));
                } catch {}
                return updated;
              });
              setLastMessages(prev => {
                const updated = { ...prev };
                delete updated[selectedUser._id];
                try {
                  localStorage.setItem('lastMessages', JSON.stringify(updated));
                } catch {}
                return updated;
              });
              setClearChatDialogOpen(false);
            }} color="error" variant="contained">Delete for everyone</Button>
            <Button onClick={async () => {
              // Delete for me
              try {
                await axios.delete(`${API_URL}/messages/me/${selectedUser._id}`, { headers: { Authorization: `Bearer ${token}` } });
              } catch {}
              setMessages([]);
              setUnreadCounts(prev => {
                const updated = { ...prev, [selectedUser._id]: 0 };
                try {
                  localStorage.setItem('unreadCounts', JSON.stringify(updated));
                } catch {}
                return updated;
              });
              setLastMessages(prev => {
                const updated = { ...prev };
                delete updated[selectedUser._id];
                try {
                  localStorage.setItem('lastMessages', JSON.stringify(updated));
                } catch {}
                return updated;
              });
              setClearChatDialogOpen(false);
            }} color="primary" variant="outlined">Delete for me</Button>
            <Button onClick={() => setClearChatDialogOpen(false)} variant="text">Cancel</Button>
          </DialogActions>
        </Dialog>
        {/* Image Dialog */}
        <Dialog open={openImageDialog} onClose={() => { setOpenImageDialog(false); setImageZoom(1); }} fullScreen PaperProps={{ sx: { bgcolor: 'rgba(0,0,0,0.95)' } }}>
          {/* Back icon on the left */}
          <Box sx={{ position: 'fixed', top: 16, left: 16, zIndex: 1301, display: 'flex', gap: 2 }}>
            <IconButton onClick={() => { setOpenImageDialog(false); setImageZoom(1); }} sx={{ color: darkMode ? '#fff' : '#222' }}>
              <ArrowBackIcon />
            </IconButton>
          </Box>
          {/* Save as, zoom in, zoom out icons on the right */}
          <Box sx={{ position: 'fixed', top: 16, right: 16, zIndex: 1301, display: 'flex', gap: 2 }}>
            <IconButton onClick={handleDownload} sx={{ color: darkMode ? '#fff' : '#222' }}>
              <DownloadIcon />
            </IconButton>
            <IconButton onClick={() => setImageZoom(z => Math.min(z + 0.2, 3))} sx={{ color: darkMode ? '#fff' : '#222' }}>
              <ZoomInIcon />
            </IconButton>
            <IconButton onClick={() => setImageZoom(z => Math.max(z - 0.2, 0.2))} sx={{ color: darkMode ? '#fff' : '#222' }}>
              <ZoomOutIcon />
            </IconButton>
          </Box>
          <img src={dialogImageUrl} alt="Full" style={{ maxWidth: `${imageZoom * 100}vw`, maxHeight: `${imageZoom * 100}vh`, margin: 'auto', display: 'block', transition: 'max-width 0.2s, max-height 0.2s' }} />
        </Dialog>
        {/* PDF Viewer Dialog */}
        <Dialog open={pdfViewerOpen} onClose={() => setPdfViewerOpen(false)} fullWidth maxWidth="md">
          <DialogTitle>PDF Viewer</DialogTitle>
          <DialogContent>
            <Document file={getFullUrl(documentUrl)} onLoadError={console.error}>
              <Page pageNumber={1} />
            </Document>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setPdfViewerOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog>
        {/* DOCX Viewer Dialog */}
        <Dialog open={docxViewerOpen} onClose={() => setDocxViewerOpen(false)} fullWidth maxWidth="md">
          <DialogTitle>DOCX Viewer</DialogTitle>
          <DialogContent>
            <div ref={docxContainerRef} />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDocxViewerOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </ThemeProvider>
  );
}

export default App;
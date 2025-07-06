import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Container, Box, TextField, Button, Typography, List, ListItem, Paper, Avatar, Dialog, DialogTitle, DialogContent, DialogActions, ListItemText, Tooltip, CssBaseline } from '@mui/material';
import axios from 'axios';
import { io } from 'socket.io-client';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import VideoCallModal from './Component/Chat/VideoCall';
import SendIcon from '@mui/icons-material/Send';
import VideocamIcon from '@mui/icons-material/Videocam';
import CallIcon from '@mui/icons-material/Call';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import GroupIcon from '@mui/icons-material/Group';
import PersonIcon from '@mui/icons-material/Person';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import IconButton from '@mui/material/IconButton';
import Sidebar from './Theme/Sidebar';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import PushPinIcon from '@mui/icons-material/PushPin';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import UserProfileDialog from './Component/UserProfileDialog';
import NotificationSettingsDialog from './Component/Notification/NotificationSettingsDialog';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert, { AlertProps } from '@mui/material/Alert';
import Divider from '@mui/material/Divider';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import StarIcon from '@mui/icons-material/Star';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import Cropper from 'react-easy-crop';
import Slider from '@mui/material/Slider';
import AddIcCallIcon from '@mui/icons-material/AddIcCall';
import MicIcon from '@mui/icons-material/Mic';
import SocialXIcon from './Component/HomeLogo';
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
import AudioWaveform from './Component/AudioWaveform'; // <-- Import the new component
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LoginIcon from '@mui/icons-material/Login';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import InfoIcon from '@mui/icons-material/Info';
import ChatIcon from '@mui/icons-material/Chat';
import PhoneIcon from '@mui/icons-material/Phone';
import NotificationsIcon from '@mui/icons-material/Notifications';
import EditIcon from '@mui/icons-material/Edit';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import LockScreen from './Theme/LockScreen';
import AddIcon from '@mui/icons-material/Add';
import LinkIcon from '@mui/icons-material/Link';
import DialpadIcon from '@mui/icons-material/Dialpad';
import NewCallPanel from './Component/Chat/NewCallPanel';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

const API_URL = 'http://localhost:5001/api';

// ... rest of the App.js code remains unchanged, no changes to logic or JSX ...
const SOCKET_URL = 'http://localhost:5001';

const getFullUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return `http://localhost:5001${url}`;
};

// Create a single notification audio instance to prevent conflicts
let notificationAudio = null;
let notificationTimeout = null;

function playNotificationSound() {
  try {
    // Use a single audio instance to prevent conflicts
    if (!notificationAudio) {
      notificationAudio = new window.Audio('/notification.mp3');
      notificationAudio.volume = 0.5; // Lower volume to be less intrusive
    }
    
    // Clear any existing timeout
    if (notificationTimeout) {
      clearTimeout(notificationTimeout);
    }
    
    // Reset and play
    notificationAudio.currentTime = 0;
    notificationAudio.play().then(() => {
      // Automatically pause after 200ms
      notificationTimeout = setTimeout(() => {
        if (notificationAudio && !notificationAudio.paused) {
          notificationAudio.pause();
          notificationAudio.currentTime = 0;
        }
      }, 200);
    }).catch(e => {
      console.log('Notification sound play failed:', e);
    });
  } catch (e) {
    console.log('Notification sound error:', e);
  }
}

// Add this function near the top of App.js
function saveMediaToIndexedDB(file, fileName) {
  // Use a unique key for each file
  const uniqueFileName = `${Date.now()}_${fileName}`;
  const request = indexedDB.open('media');
  request.onupgradeneeded = function(event) {
    const db = event.target.result;
    if (!db.objectStoreNames.contains('files')) {
      db.createObjectStore('files', { keyPath: 'fileName' });
    }
  };
  request.onsuccess = function(event) {
    const db = event.target.result;
    if (!db.objectStoreNames.contains('files')) {
      const newVersion = db.version + 1;
      db.close();
      const upgradeRequest = indexedDB.open('media', newVersion);
      upgradeRequest.onupgradeneeded = function(e) {
        const upgradeDb = e.target.result;
        if (!upgradeDb.objectStoreNames.contains('files')) {
          upgradeDb.createObjectStore('files', { keyPath: 'fileName' });
        }
      };
      upgradeRequest.onsuccess = function(e) {
        const upgradeDb = e.target.result;
        const tx = upgradeDb.transaction('files', 'readwrite');
        const store = tx.objectStore('files');
        store.put({ fileName: uniqueFileName, blob: file });
        tx.oncomplete = function() {
          upgradeDb.close();
        };
      };
      return;
    }
    const tx = db.transaction('files', 'readwrite');
    const store = tx.objectStore('files');
    store.put({ fileName: uniqueFileName, blob: file });
    tx.oncomplete = function() {
      db.close();
    };
  };
}

function App() {
  const { t } = useTranslation();
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
  const [confirmPassword, setConfirmPassword] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  // Safe JSON parse for user
  function getStoredUser() {
    try {
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }
  const [user, setUser] = useState(getStoredUser());
  const [users, setUsers] = useState([]); // Start with empty array, only populate from database
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
  const [seasonalTheme, setSeasonalTheme] = useState(() => {
    const stored = localStorage.getItem('seasonalTheme');
    console.log('Initializing seasonal theme from localStorage:', stored);
    return stored || 'auto'; // auto, spring, summer, autumn, winter
  });

  // Function to set seasonal theme and persist to localStorage
  const setSeasonalThemeAndPersist = (theme) => {
    setSeasonalTheme(theme);
    localStorage.setItem('seasonalTheme', theme);
    console.log('Seasonal theme persisted to localStorage:', theme);
  };

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showLogin, setShowLogin] = useState(true);
  const [snackbar, setSnackbar] = useState(null);
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
  const [showNewChatDialog, setShowNewChatDialog] = useState(false);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [newChatSearch, setNewChatSearch] = useState('');
  // Add a state to store search results from available users
  const [searchAvailableUsers, setSearchAvailableUsers] = useState([]);
  // Add a state for search results
  const [searchResults, setSearchResults] = useState([]);
  // Add this state for call search
  const [callSearch, setCallSearch] = useState("");
  const [callHistory, setCallHistory] = useState([]);
  const [showNewCallPanel, setShowNewCallPanel] = useState(false);
  const [myStatusAvatarHover, setMyStatusAvatarHover] = useState(false);
  const [shareStatusDialogOpen, setShareStatusDialogOpen] = useState(false);
  // Add at the top, after other useState hooks
  const [favorites, setFavorites] = useState(() => {
    try {
      const stored = localStorage.getItem('favorites');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Example contacts data (replace with real data as needed)
  const contacts = [
    { name: 'Alice', status: 'Hey there!', avatar: 'A' },
    { name: 'Bob', status: 'Available', avatar: 'B' },
    { name: 'Charlie', status: 'At work', avatar: 'C' },
    { name: 'David', status: 'Busy', avatar: 'D' },
  ];
  
  // Effect: When search changes and is not empty, fetch available users matching the search
  useEffect(() => {
    if (search.trim()) {
      axios.get(`${t}/messages/users/available?q=${encodeURIComponent(search)}`, {
        headers: { Authorization: `Bearer ${token}` }
      }).then(res => {
        setSearchResults(res.data);
      }).catch(() => setSearchResults([]));
    } else {
      setSearchResults([]);
    }
  }, [search, token]);
  
  // Compute merged search results
  const filteredUsers = users.filter(u => {
    // Handle cases where username might be null, undefined, or not a string
    if (!u || !u.username || typeof u.username !== 'string') {
      console.log('Skipping user with invalid username:', u);
      return false;
    }
    return u.username.toLowerCase().includes(search.toLowerCase());
  });

  // If searching, merge in available users not already in conversations
  let mergedSearchResults = filteredUsers;
  if (search.trim() && searchAvailableUsers.length > 0) {
    const existingIds = new Set(users.map(u => u._id));
    const extraUsers = searchAvailableUsers.filter(u =>
      u.username &&
      u.username.toLowerCase().includes(search.toLowerCase()) &&
      !existingIds.has(u._id)
    );
    mergedSearchResults = [...filteredUsers, ...extraUsers];
  }
  console.log('Merged search results:', mergedSearchResults); // Debug log

  const pinnedChats = mergedSearchResults.filter(u => pinned.includes(u._id));
  const unpinnedChats = mergedSearchResults.filter(u => !pinned.includes(u._id));

  // Debug logging for search functionality
  console.log('Search value:', search);
  console.log('Users array:', users);
  console.log('Filtered users:', filteredUsers);
  console.log('Pinned chats:', pinnedChats);
  console.log('Unpinned chats:', unpinnedChats);

  // Helper to get current season
  const getCurrentSeason = () => {
    const month = new Date().getMonth() + 1;
    if (month >= 3 && month <= 5) return "spring";
    if (month >= 6 && month <= 8) return "summer";
    if (month >= 9 && month <= 11) return "autumn";
    return "winter";
  };

  // Get the effective seasonal theme
  const getEffectiveSeasonalTheme = () => {
    return seasonalTheme === 'auto' ? getCurrentSeason() : seasonalTheme;
  };

  // Seasonal color palettes
  const seasonalColors = {
    spring: {
      primary: '#66bb6a',
      secondary: '#b2dfdb',
      background: '#e8f5e9',
      paper: '#f1f8e9'
    },
    summer: {
      primary: '#ffd54f',
      secondary: '#ffe082',
      background: '#fffde7',
      paper: '#fffef7'
    },
    autumn: {
      primary: '#ff8a65',
      secondary: '#ffccbc',
      background: '#fbe9e7',
      paper: '#fdf5f3'
    },
    winter: {
      primary: '#90caf9',
      secondary: '#b3e5fc',
      background: '#e3f2fd',
      paper: '#f0f8ff'
    }
  };

  const currentSeasonalColors = seasonalColors[getEffectiveSeasonalTheme()] || seasonalColors.winter;

  // Debug useEffect to monitor theme changes
  useEffect(() => {
    console.log('Seasonal theme changed to:', seasonalTheme);
    console.log('Effective seasonal theme:', getEffectiveSeasonalTheme());
    console.log('Current seasonal colors:', currentSeasonalColors);
    
    // Show a temporary notification when theme changes
    if (seasonalTheme !== 'auto') {
      const seasonNames = {
        spring: 'Spring',
        summer: 'Summer', 
        autumn: 'Autumn',
        winter: 'Winter'
      };
      const seasonName = seasonNames[seasonalTheme] || seasonalTheme;
      setSnackbar({
        message: `🎨 Theme changed to ${seasonName}! Check the app background and UI elements.`,
        severity: 'success'
      });
    }
  }, [seasonalTheme, currentSeasonalColors]);

  // Debug useEffect to monitor theme changes
  // (REMOVED: This block caused 'Cannot access theme before initialization' error)

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
  // Persist lastMessages to localStorage on every update
  useEffect(() => {
    try {
      localStorage.setItem('lastMessages', JSON.stringify(lastMessages));
    } catch (e) {
      console.error('Failed to save lastMessages:', e);
    }
  }, [lastMessages]);

  // Users are now completely database-driven - no localStorage persistence needed

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
  const [videoLoadingStates, setVideoLoadingStates] = useState({});
  const [videoErrorStates, setVideoErrorStates] = useState({});
  
  const handleSnackbarClose = () => {
    setSnackbar(null);
  };

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
  const [isAvatarHovered, setIsAvatarHovered] = useState(false);

  const [audioStates, setAudioStates] = useState({});
  const audioRefs = useRef({});
  const [currentlyPlayingAudio, setCurrentlyPlayingAudio] = useState(null);

  const handleSeek = (msgId, time) => {
    const audio = audioRefs.current[msgId];
    if (audio && Number.isFinite(time)) {
      audio.currentTime = time;
    }
  };

  const theme = useMemo(() => {
    console.log('Creating theme with seasonal theme:', seasonalTheme, 'currentSeasonalColors:', currentSeasonalColors);
    return createTheme({
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
                default: currentSeasonalColors.background,
                paper: currentSeasonalColors.paper,
              },
              text: {
                primary: '#222',
                secondary: '#555',
              },
              primary: {
                main: currentSeasonalColors.primary,
              },
              secondary: {
                main: currentSeasonalColors.secondary,
              },
            }),
      },
      components: {
        MuiTextField: {
          styleOverrides: {
            root: {
              '& .MuiOutlinedInput-root': {
                '&.Mui-focused fieldset': {
                  borderColor: darkMode ? '#25d366' : currentSeasonalColors.primary,
                },
              },
              '& label.Mui-focused': {
                color: darkMode ? '#25d366' : currentSeasonalColors.primary,
              },
              // Style for autofill
              '& input:-webkit-autofill, & input:-webkit-autofill:hover, & input:-webkit-autofill:focus, & input:-webkit-autofill:active': {
                '-webkit-box-shadow': darkMode 
                  ? '0 0 0 30px #333 inset !important' 
                  : `0 0 0 30px ${currentSeasonalColors.paper} inset !important`,
                '-webkit-text-fill-color': darkMode ? '#fff !important' : '#000 !important',
                caretColor: darkMode ? '#fff' : '#000', // Ensure cursor color matches text
                borderRadius: 'inherit', // Maintain the border radius
              },
            },
          },
        },
        MuiPaper: {
          styleOverrides: {
            root: {
              backgroundColor: darkMode ? '#222' : currentSeasonalColors.paper,
              color: darkMode ? '#fff' : '#222',
              transition: 'background-color 0.3s ease',
            },
          },
        },
        MuiButton: {
          styleOverrides: {
            root: {
              transition: 'all 0.3s ease',
            },
          },
        },
      },
    });
  }, [darkMode, seasonalTheme, currentSeasonalColors]);

  const handlePlayPause = async (msgId) => {
    if (!user || !user.id) return;

    const audio = audioRefs.current[msgId];
    if (!audio) return;

    try {
      // If this audio is currently playing, pause it
      if (currentlyPlayingAudio === msgId) {
        audio.pause();
        setCurrentlyPlayingAudio(null);
        return;
      }

      // Pause any currently playing audio
      if (currentlyPlayingAudio && audioRefs.current[currentlyPlayingAudio]) {
        const currentAudio = audioRefs.current[currentlyPlayingAudio];
        if (!currentAudio.paused) {
          currentAudio.pause();
        }
      }

      // Add a small delay to prevent rapid play/pause calls
      await new Promise(resolve => setTimeout(resolve, 50));

      // Play the new audio
      await audio.play();
      setCurrentlyPlayingAudio(msgId);
    } catch (error) {
      console.error('Audio play/pause error:', error);
      setCurrentlyPlayingAudio(null);
    }
  };

  useEffect(() => {
    const cleanupFunctions = [];

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

            // Update global playing state
            if (audio.paused && currentlyPlayingAudio === msg._id) {
              setCurrentlyPlayingAudio(null);
            } else if (!audio.paused && currentlyPlayingAudio !== msg._id) {
              setCurrentlyPlayingAudio(msg._id);
            }
          };

          // Remove existing listeners first to prevent duplicates
          audio.removeEventListener('play', updateState);
          audio.removeEventListener('pause', updateState);
          audio.removeEventListener('ended', updateState);
          audio.removeEventListener('timeupdate', updateState);
          audio.removeEventListener('loadedmetadata', updateState);

          // Add new listeners
          audio.addEventListener('play', updateState);
          audio.addEventListener('pause', updateState);
          audio.addEventListener('ended', updateState);
          audio.addEventListener('timeupdate', updateState);
          audio.addEventListener('loadedmetadata', updateState);

          // Store cleanup function
          cleanupFunctions.push(() => {
            audio.removeEventListener('play', updateState);
            audio.removeEventListener('pause', updateState);
            audio.removeEventListener('ended', updateState);
            audio.removeEventListener('timeupdate', updateState);
            audio.removeEventListener('loadedmetadata', updateState);
          });
        }
      }
    });

    // Return cleanup function
    return () => {
      cleanupFunctions.forEach(cleanup => cleanup());
    };
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
        console.log('Current selectedUserRef:', selectedUserRef.current);
        // Always update lastMessages and unreadCounts
        if (msg.from && msg.to && msg.to._id === user.id) {
          setLastMessages(prev => ({ ...prev, [msg.from._id]: msg }));
          setUnreadCounts(prev => {
            if (!selectedUserRef.current || selectedUserRef.current._id !== msg.from._id) {
              return { ...prev, [msg.from._id]: (prev[msg.from._id] || 0) + 1 };
            }
            return prev;
          });
          // If the chat with the sender is open, add the message to the chat box
          if (selectedUserRef.current && selectedUserRef.current._id === msg.from._id) {
            console.log('Adding message to chat box:', msg);
            setMessages((prev) => [...prev, msg]);
          }
          // Show notification for new message (but not for messages sent by current user)
          if (msg.from._id !== user.id) {
            showMessageNotification(msg);
          }
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
        if (notificationSettings.sound) playNotificationSound();
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
          if (notificationSettings.sound) playNotificationSound();
        }
      }
    } catch (error) {
      console.error('Failed to show notification:', error);
    }

    // In showMessageNotification and showGroupMessageNotification, after the notification is shown and if notificationSettings.sound is true, call playNotificationSound();
    // Example:
    // if (notificationSettings.sound) playNotificationSound();
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
        if (notificationSettings.sound) playNotificationSound();
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
          if (notificationSettings.sound) playNotificationSound();
        }
      }
    } catch (error) {
      console.error('Failed to show group notification:', error);
    }

    // In showMessageNotification and showGroupMessageNotification, after the notification is shown and if notificationSettings.sound is true, call playNotificationSound();
    // Example:
    // if (notificationSettings.sound) playNotificationSound();
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
  const showSentMessageNotification = async (content, senderId, receiverId) => {
    // Prevent notification on sender's own device
    if (user && (user.id === senderId || user._id === senderId)) {
      return;
    }
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
          if (notificationSettings.sound) playNotificationSound();
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

  // Fetch users after login - completely database-driven
  useEffect(() => {
    if (token) {
      console.log('Fetching users from database with token:', token);
      axios.get(`${API_URL}/messages/users/all`, { headers: { Authorization: `Bearer ${token}` } })
        .then(res => {
          console.log('Users fetched successfully from database:', res.data);
          // Set users directly from database - no localStorage fallback
          setUsers(res.data || []);
        })
        .catch((error) => {
          // console.error('Error fetching users from database:', error);
          // Keep empty array on error - no localStorage fallback
          setUsers([]);
        });
    } else {
      // Clear users when no token (logged out)
      setUsers([]);
    }
  }, [token]);

  // Clear lastSelectedChat from localStorage to prevent auto-opening last user
  useEffect(() => {
        localStorage.removeItem('lastSelectedChat');
    // Removed localStorage.removeItem('lastMessages') to keep cache for instant opening
  }, []);

  // Clear lastMessages when selectedUser changes to ensure fresh data
  useEffect(() => {
    if (selectedUser) {
      // Don't clear lastMessages here - keep cache for other users
      // The fetch messages useEffect will handle fresh data loading
    }
  }, [selectedUser]);

  // Ensure selectedUser's last message is immediately available in cache
  useEffect(() => {
    if (selectedUser && lastMessages[selectedUser._id]) {
      // The last message is already in cache, so it will show immediately
      // The fetch will update it with fresh data if needed
    }
  }, [selectedUser, lastMessages]);

  // Fetch messages when a user is selected
  useEffect(() => {
    if (token && selectedUser) {
      console.log('Fetching messages for user:', selectedUser._id, selectedUser);
      axios.get(`${API_URL}/messages/${selectedUser._id}`, { headers: { Authorization: `Bearer ${token}` } })
        .then(res => {
          console.log('Fetched messages:', res.data);
          setMessages(res.data);
          // Immediately update lastMessages with the actual last message from server
          if (res.data.length > 0) {
            const lastMessage = res.data[res.data.length - 1];
            setLastMessages(prev => ({
              ...prev,
              [selectedUser._id]: lastMessage
            }));
          } else {
            // If no messages, clear the last message for this user
            setLastMessages(prev => {
              const updated = { ...prev };
              delete updated[selectedUser._id];
              return updated;
            });
          }
        })
        .catch((err) => {
          console.error('Error fetching messages:', err);
          setMessages([]);
          // Clear last message on error
          setLastMessages(prev => {
            const updated = { ...prev };
            delete updated[selectedUser._id];
            return updated;
          });
        });
    } else {
      console.log('No token or no selectedUser, not fetching messages.');
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
      // Removed localStorage.setItem to prevent caching
      return updated;
    });
  };

  const handleRegister = async (e) => {
    if (e) e.preventDefault();
    setError('');
    setLoading(true);

    if (!username || !email || !password || !confirmPassword) {
      setError('All fields are required.');
      setLoading(false);
      return;
    }

    if (username.length < 3) {
      setError('Username must be at least 3 characters long.');
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      setLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('username', username);
      formData.append('email', email);
      formData.append('password', password);
      if (avatarFile) {
        formData.append('avatar', avatarFile);
      }

      const res = await axios.post(`${API_URL}/auth/register`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setToken(res.data.token);
      setUser(res.data.user);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
      // console.error(err);
    }
  };

  const [pendingLoginUser, setPendingLoginUser] = useState(null);
  const [pendingLoginToken, setPendingLoginToken] = useState('');
  const [showCancelDeletionDialog, setShowCancelDeletionDialog] = useState(false);
  const [deletionCountdown, setDeletionCountdown] = useState('');

  useEffect(() => {
    let interval;
    const getCountdown = (date) => {
      if (!date) return '';
      const now = new Date();
      const target = new Date(date);
      const diff = target - now;
      if (diff <= 0) return 'Scheduled for deletion soon!';
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);
      return `${days}d ${hours}h ${minutes}m ${seconds}s`;
    };
    if (showCancelDeletionDialog && (pendingLoginUser?.deletionDate || user?.deletionDate)) {
      setDeletionCountdown(getCountdown(pendingLoginUser?.deletionDate || user?.deletionDate));
      interval = setInterval(() => {
        setDeletionCountdown(getCountdown(pendingLoginUser?.deletionDate || user?.deletionDate));
      }, 1000);
    } else {
      setDeletionCountdown('');
    }
    return () => interval && clearInterval(interval);
  }, [showCancelDeletionDialog, pendingLoginUser, user]);

  // Fetch user profile from backend
  const fetchUserProfile = async (tokenToUse = token) => {
    try {
      const res = await axios.get(`${API_URL}/auth/profile`, {
        headers: { Authorization: `Bearer ${tokenToUse}` }
      });
      if (res.data && res.data.user) {
        setUser(res.data.user);
        localStorage.setItem('user', JSON.stringify(res.data.user));
      }
    } catch (err) {
      console.error('Failed to fetch user profile', err);
    }
  };

  const handleLogin = async () => {
    try {
      const res = await axios.post(`${API_URL}/auth/login`, { email, password });
      if (res.data.user.deletionScheduled) {
        setPendingLoginUser(res.data.user);
        setPendingLoginToken(res.data.token);
        setShowCancelDeletionDialog(true);
        return { pendingDeletion: true };
      } else {
        setToken(res.data.token);
        localStorage.setItem('token', res.data.token);
        await fetchUserProfile(res.data.token);
        await requestNotificationPermission();
        return { pendingDeletion: false };
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
      return { pendingDeletion: false };
    }
  };

  const handleChoose2FA = () => {
    // 2FA functionality removed
  };

  const handleChoosePasskey = async () => {
    // Passkey functionality removed
  };

  const handleVerify2FALogin = async () => {
    // 2FA verification functionality removed
  };

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
      let messageData;
      if (selectedUser) {
        messageData = {
          to: selectedUser._id,
          content: JSON.stringify({ file: url, type, name })
        };
      } else if (selectedGroup) {
        messageData = {
          group: selectedGroup._id,
          content: JSON.stringify({ file: url, type, name })
        };
      }

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
            groupId: selectedGroup._id,
            content: newMessage.content,
            type: 'audio',
            file: url
          });
        }
      }
    } catch (err) {
      // console.error('Voice message error:', err);
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
    const senderInfo = users.find(u => u._id === senderId);
    return { avatar: senderInfo?.avatar || user.avatar, username: senderInfo?.username || user.username };
  }

  const handleLogout = () => {
    setToken('');
    setUser(null);
    setSelectedUser(null);
    setSelectedGroup(null);
    setMessages([]);
    setGroupMessages([]);
    setLastMessages({});
    setUnreadCounts({});
    setPinned([]);
    setStatuses([]);
    setUserStatusMap({});
    setProfileDialogOpen(false);
    setProfileDialogUser(null);
    setCallOpen(false);
    setCallIncoming(false);
    setCallAccepted(false);
    setLocalStream(null);
    setRemoteStream(null);
    setPeerConnection(null);
    setCallFrom(null);
    setAudioOnly(false);
    setNav('chats');
    setSearch('');
    setGroups([]);
    setSelectedGroup(null);
    setGroupMessages([]);
    setGroupMessage('');
    setGroupDialogOpen(false);
    setGroupName('');
    setGroupAvatar('');
    setGroupMembers([]);
    setGroupTypingUsers([]);
    setIsBlocked(false);
    setError('');
    setMenuAnchorEl(null);
    setClearChatDialogOpen(false);
    setOpenImageDialog(false);
    setDialogImageUrl('');
    setImageZoom(1);
    setAttachDrawerOpen(false);
    setFileInputType('');
    setAttachMenuAnchor(null);
    setEmojiMenuAnchor(null);
    setPdfViewerOpen(false);
    setDocxViewerOpen(false);
    setDocumentUrl('');
    setAudioStates({});
    setCurrentlyPlayingAudio(null);
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('lastMessages');
      localStorage.removeItem('lastSelectedChat');
      localStorage.removeItem('unreadCounts');
      localStorage.removeItem('pinned');
      localStorage.removeItem('statuses');
      localStorage.removeItem('userStatusMap');
      localStorage.removeItem('notificationSettings');
    } catch (e) {
      console.error('Failed to clear localStorage:', e);
    }
    window.location.reload();
  };

  const handleProfileEdit = async (updatedUser, avatarFile) => {
    const originalUser = { ...user };
    
    // Optimistically update UI
    const localUser = { ...user, username: updatedUser.username, email: updatedUser.email };
    if (avatarFile) {
      localUser.avatar = URL.createObjectURL(avatarFile);
    } else if (updatedUser.avatar === '') {
      localUser.avatar = '';
    }
    setUser(localUser);
    localStorage.setItem('user', JSON.stringify(localUser)); // Update local storage optimistically

    try {
      const formData = new FormData();
      formData.append('username', updatedUser.username);
      formData.append('email', updatedUser.email);
            formData.append('about', updatedUser.about);
      if (avatarFile) {
        formData.append('avatar', avatarFile);
      } else if (updatedUser.avatar === '') {
        formData.append('avatar', '');
      }

      const { data } = await axios.put(`${API_URL}/auth/profile`, formData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
      });

      const serverUser = data.user;

      // Clean up blob url if it exists from an upload
      if (localUser.avatar && localUser.avatar.startsWith('blob:')) {
        URL.revokeObjectURL(localUser.avatar);
      }
      
      // If we were removing the avatar, ensure the final state reflects that.
      if (updatedUser.avatar === '') {
        serverUser.avatar = '';
      }

      // Final update from server, ensuring our optimistic change is respected
      setUser(serverUser);
      setProfileDialogUser(serverUser);
      localStorage.setItem('user', JSON.stringify(serverUser));
      setSnackbar({ open: true, message: 'Profile updated successfully!', severity: 'success' });
    } catch (err) {
      console.error('Profile edit failed', err);
      setSnackbar({ open: true, message: 'Profile update failed.', severity: 'error' });
      
      // Revert on failure
      if (localUser.avatar && localUser.avatar.startsWith('blob:')) {
        URL.revokeObjectURL(localUser.avatar);
      }
      setUser(originalUser);
      localStorage.setItem('user', JSON.stringify(originalUser)); // Revert local storage
    }
  };

  const handleFilterMenuOpen = (event) => setFilterMenuAnchor(event.currentTarget);
  const handleFilterMenuClose = () => setFilterMenuAnchor(null);

  const fetchAvailableUsers = async () => {
    try {
      const response = await axios.get(`${API_URL}/messages/users/available`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAvailableUsers(response.data);
    } catch (error) {
      console.error('Error fetching available users:', error);
    }
  };

  const [pendingSelectedUserId, setPendingSelectedUserId] = useState(null);

  const startNewChat = async (user) => {
    console.log('startNewChat called with user:', user);
    try {
      // First, add the user to contacts in database
      await axios.post(`${API_URL}/messages/users/add-contact/${user._id}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Send an initial message to start the conversation
      const messageData = {
        to: user._id,
        content: 'Hello! 👋',
        messageType: 'text'
      };
      
      await axios.post(`${API_URL}/messages`, messageData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Refresh users list from database to ensure consistency
      await fetchUsersFromServer();
      
      setPendingSelectedUserId(user._id);
      setShowNewChatDialog(false);
      setNewChatSearch('');
    } catch (error) {
      // Even if backend fails, try to refresh from database
      try {
        await fetchUsersFromServer();
      } catch (refreshError) {
        console.error('Failed to refresh users from database:', refreshError);
      }
      
      setPendingSelectedUserId(user._id);
      setShowNewChatDialog(false);
      setNewChatSearch('');
      // Show error to user
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to start chat. Please try again.',
        severity: 'error'
      });
      // console.error('Error starting new chat:', error);
    }
  };

  // Function to fetch users from database - completely database-driven
  const fetchUsersFromServer = async () => {
    try {
      const response = await axios.get(`${API_URL}/messages/users/all`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Force refreshed users from database:', response.data);
      // Set users directly from database - no localStorage fallback
      setUsers(response.data || []);
    } catch (error) {
      // console.error('Error fetching users from database:', error);
      // Keep empty array on error - no localStorage fallback
      setUsers([]);
    }
  };

  // Function to force refresh from database (for testing/debugging)
  const forceRefreshUsersFromDatabase = async () => {
    if (!token) {
      console.log('No token available for database refresh');
      return;
    }
    console.log('Force refreshing users from database...');
    await fetchUsersFromServer();
  };

  const handleOpenProfileDialog = async (userOrGroup) => {
    if (!userOrGroup) return;
    if (userOrGroup && userOrGroup._id && !userOrGroup.members) {
      // Fetch latest user info
      try {
        const res = await axios.get(`${API_URL}/users/${userOrGroup._id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProfileDialogUser(res.data);
      } catch (err) {
        console.error('Failed to fetch user profile', err);
        setProfileDialogUser(userOrGroup); // Fallback to existing data
      }
    } else {
      setProfileDialogUser(userOrGroup);
    }
    setProfileDialogOpen(true);
  };

  const onCropComplete = (croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const getCroppedImg = async (imageSrc, cropPixels) => {
    const image = new Image();
    image.src = imageSrc;
    // Wait for the image to load before drawing
    await new Promise((resolve, reject) => {
      image.onload = resolve;
      image.onerror = reject;
    });
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    canvas.width = cropPixels.width;
    canvas.height = cropPixels.height;

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

    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error('Canvas is empty'));
          return;
        }
        blob.name = 'cropped.jpeg';
        resolve(blob);
      }, 'image/jpeg');
    });
  };

  const handleCropSave = async () => {
    try {
      const croppedImageBlob = await getCroppedImg(cropImageSrc, croppedAreaPixels);
      const croppedImageFile = new File([croppedImageBlob], "avatar.jpg", { type: "image/jpeg" });
      setAvatarFile(croppedImageFile);
      setAvatar(URL.createObjectURL(croppedImageFile)); // for preview
      setCropDialogOpen(false);
    } catch (e) {
      console.error(e);
      setError('Failed to crop image.');
    }
  };

  const handleCropCancel = () => {
    setCropDialogOpen(false);
  };

  const handleSend = async () => {
    if (message.trim() && selectedUser) {
      try {
        // Save the message to the backend
        const response = await axios.post(`${API_URL}/messages`, {
          to: selectedUser._id,
          content: message,
          messageType: 'text'
        }, { headers: { Authorization: `Bearer ${token}` } });

        const savedMessage = response.data;
        setMessages(prev => [...prev, savedMessage]);
        setLastMessages(prev => ({ ...prev, [selectedUser._id]: savedMessage }));
        setMessage('');
        setUnreadCounts(prev => {
          const updated = { ...prev, [selectedUser._id]: 0 };
          try {
            localStorage.setItem('unreadCounts', JSON.stringify(updated));
          } catch {}
          return updated;
        });
        showSentMessageNotification(message, user.id, selectedUser._id);
        if (socket && user?.id) socket.emit('sendMessage', savedMessage);
      } catch (err) {
        setError('Failed to send message.');
      }
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file || (!selectedUser && !selectedGroup)) return;
    console.log('handleFileChange called with file:', file.name, 'to user:', selectedUser?._id, 'to group:', selectedGroup?._id);
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      console.log('Uploading file to:', `${API_URL}/messages/upload`);
      const uploadRes = await axios.post(`${API_URL}/messages/upload`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      
      console.log('Upload response:', uploadRes.data);
      
      // Send a message with the file info
      const { url, type, name } = uploadRes.data;
      let messageResponse;
      
      if (selectedUser) {
        messageResponse = await axios.post(`${API_URL}/messages`, {
          to: selectedUser._id,
          content: JSON.stringify({ file: url, type, name, size: file.size }),
        }, { headers: { Authorization: `Bearer ${token}` } });
      } else if (selectedGroup) {
        messageResponse = await axios.post(`${API_URL}/messages`, {
          group: selectedGroup._id,
          content: JSON.stringify({ file: url, type, name, size: file.size }),
        }, { headers: { Authorization: `Bearer ${token}` } });
      }
      
      const returnedMessage = messageResponse.data;

      if (socket && user?.id) {
        if (selectedUser) {
          socket.emit('sendMessage', returnedMessage);
        } else if (selectedGroup) {
          socket.emit('sendGroupMessage', {
            groupId: selectedGroup._id,
            content: returnedMessage.content,
            type: 'file',
            file: url
          });
        }
      }

      if (selectedUser) {
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
        showSentMessageNotification(JSON.stringify({ file: url, type, name }), user.id, selectedUser._id);
      } else if (selectedGroup) {
        setGroupMessages((prev) => [...prev, returnedMessage]);
        setLastMessages(prev => {
          if (!selectedGroup?._id) return prev;
          return { ...prev, [selectedGroup._id]: returnedMessage };
        });
      }
      
      // Clear the file input
      e.target.value = '';
      if (file) {
        saveMediaToIndexedDB(file, file.name);
      }
    } catch (err) {
      console.error('File upload error:', err);
      console.error('Error response:', err.response?.data);
      console.error('Error status:', err.response?.status);
      
      let errorMessage = 'Failed to upload file.';
      if (err.response?.status === 413) {
        errorMessage = 'File is too large. Maximum size is 50MB.';
      } else if (err.response?.status === 401) {
        errorMessage = 'Authentication failed. Please log in again.';
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      
      setError(errorMessage);
      
      // Clear the file input on error
      e.target.value = '';
    }
  };

  // Calculate unread chats count for sidebar badge
  const unreadChatsCount = Object.entries(unreadCounts)
    .filter(([userId, count]) => count > 0 && (!selectedUser || selectedUser._id !== userId))
    .length;

  // Place this with other hooks at the top of App()
  const [navMenuAnchor, setNavMenuAnchor] = useState(null);
  const [aboutDialogOpen, setAboutDialogOpen] = useState(false);
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);
  const [registerDialogOpen, setRegisterDialogOpen] = useState(false);
  const handleNavMenuOpen = (e) => setNavMenuAnchor(e.currentTarget);
  const handleNavMenuClose = () => setNavMenuAnchor(null);

  const [forgotDialogOpen, setForgotDialogOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotStep, setForgotStep] = useState(1); // 1: email, 2: token+password
  const [forgotToken, setForgotToken] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState('');
  const [forgotError, setForgotError] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState('');

  const handleForgotSubmit = async () => {
    setForgotError('');
    setForgotSuccess('');
    try {
      const res = await fetch('http://localhost:5001/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail })
      });
      const data = await res.json();
      if (!res.ok) {
        setForgotError(data.message || 'Failed to send reset link.');
      } else {
        setForgotStep(2);
        setForgotSuccess('Check your email for the reset link. (Demo: use the token below)');
        setForgotToken(data.token || '');
      }
    } catch (err) {
      setForgotError('Server error. Please try again.');
    }
  };

  const handleForgotReset = async () => {
    setForgotError('');
    setForgotSuccess('');
    if (!forgotToken || !forgotNewPassword || !forgotConfirmPassword) {
      setForgotError('All fields are required.');
      return;
    }
    if (forgotNewPassword !== forgotConfirmPassword) {
      setForgotError('Passwords do not match.');
      return;
    }
    try {
      const res = await fetch('http://localhost:5001/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: forgotToken, newPassword: forgotNewPassword })
      });
      const data = await res.json();
      if (!res.ok) {
        setForgotError(data.message || 'Failed to reset password.');
      } else {
        setForgotSuccess('Password reset successful! You can now log in.');
        setTimeout(() => setForgotDialogOpen(false), 1500);
      }
    } catch (err) {
      setForgotError('Server error. Please try again.');
    }
  };

  const [authMethodDialogOpen, setAuthMethodDialogOpen] = useState(false);
  const [pendingAuthUserId, setPendingAuthUserId] = useState('');
  const [pendingAuthEmail, setPendingAuthEmail] = useState('');
  const [authMethodError, setAuthMethodError] = useState('');

  const handleCancelAccountDeletion = async (fromLogin) => {
    try {
      const tokenToUse = fromLogin ? pendingLoginToken : localStorage.getItem('token');
      const res = await fetch('http://localhost:5001/api/auth/cancel-delete-account', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${tokenToUse}` }
      });
      const data = await res.json();
      if (res.ok) {
        if (fromLogin) {
          setToken(pendingLoginToken);
          setUser({ ...pendingLoginUser, deletionScheduled: false, deletionDate: null });
          localStorage.setItem('token', pendingLoginToken);
          localStorage.setItem('user', JSON.stringify({ ...pendingLoginUser, deletionScheduled: false, deletionDate: null }));
          setShowCancelDeletionDialog(false);
          setPendingLoginUser(null);
          setPendingLoginToken('');
          await requestNotificationPermission();
        } else {
          setUser({ ...user, deletionScheduled: false, deletionDate: null });
          localStorage.setItem('user', JSON.stringify({ ...user, deletionScheduled: false, deletionDate: null }));
          setShowCancelDeletionDialog(false);
          setSnackbar({ message: 'Account deletion cancelled.', severity: 'success' });
        }
      }
    } catch (err) {
      setSnackbar({ message: 'Failed to cancel deletion.', severity: 'error' });
    }
  };

  // App Lock Screen Component
  function AppLockScreen({ onUnlock }) {
    const [step, setStep] = useState(localStorage.getItem('applock_pin') ? 'enter' : 'set');
    const [pin, setPin] = useState('');
    const [confirmPin, setConfirmPin] = useState('');
    const [error, setError] = useState('');
    const [bioError, setBioError] = useState('');
    const [bioAvailable, setBioAvailable] = useState(false);

    useEffect(() => {
      // Check if WebAuthn is available
      setBioAvailable(window.PublicKeyCredential !== undefined);
    }, []);

    const handleSetPin = () => {
      if (pin.length !== 4 || !/^[0-9]{4}$/.test(pin)) {
        setError('PIN must be 4 digits');
        return;
      }
      if (pin !== confirmPin) {
        setError('PINs do not match');
        return;
      }
      localStorage.setItem('applock_pin', pin);
      setStep('enter');
      setPin('');
      setConfirmPin('');
      setError('');
    };

    const handleUnlock = () => {
      const stored = localStorage.getItem('applock_pin');
      if (pin === stored) {
        setError('');
        onUnlock();
      } else {
        setError('Incorrect PIN');
      }
    };

    const handleReset = () => {
      localStorage.removeItem('applock_pin');
      setStep('set');
      setPin('');
      setConfirmPin('');
      setError('');
    };

    // Biometric authentication handler
    const handleBiometric = async () => {
      setBioError('');
      try {
        // This is a demo: in real apps, you need to register a credential and verify with server
        // Here, we just check if the browser supports it and prompt for biometric
        // Biometric authentication is not implemented in this demo
        setBioError('Biometric authentication is not available in this demo.');
      } catch (e) {
        setBioError('Biometric authentication failed or was cancelled.');
      }
    };

    return (
      <Box minHeight="100vh" display="flex" flexDirection="column" alignItems="center" justifyContent="center" bgcolor="#f5f5f5">
        <Box p={4} borderRadius={4} boxShadow={3} bgcolor="#fff" minWidth={320} textAlign="center">
          <LockIcon sx={{ fontSize: 48, color: '#25d366', mb: 1 }} />
          <Typography variant="h5" fontWeight={700} mb={2} color="#25d366">
            App Lock
          </Typography>
          {step === 'set' ? (
            <>
              <Typography mb={2}>Set a 4-digit PIN to protect your app</Typography>
              <TextField
                label="Enter PIN"
                type="password"
                value={pin}
                onChange={e => setPin(e.target.value.replace(/[^0-9]/g, '').slice(0,4))}
                inputProps={{ maxLength: 4, inputMode: 'numeric', pattern: '[0-9]*' }}
                fullWidth
                margin="normal"
              />
              <TextField
                label="Confirm PIN"
                type="password"
                value={confirmPin}
                onChange={e => setConfirmPin(e.target.value.replace(/[^0-9]/g, '').slice(0,4))}
                inputProps={{ maxLength: 4, inputMode: 'numeric', pattern: '[0-9]*' }}
                fullWidth
                margin="normal"
              />
              {error && <Typography color="error" mt={1}>{error}</Typography>}
              <Button variant="contained" sx={{ mt: 2, bgcolor: '#25d366', '&:hover': { bgcolor: '#1ea952' } }} onClick={handleSetPin} fullWidth>
                Set PIN
              </Button>
            </>
          ) : (
            <>
              <Typography mb={2}>Enter your 4-digit PIN to unlock</Typography>
              <TextField
                label="PIN"
                type="password"
                value={pin}
                onChange={e => setPin(e.target.value.replace(/[^0-9]/g, '').slice(0,4))}
                inputProps={{ maxLength: 4, inputMode: 'numeric', pattern: '[0-9]*' }}
                fullWidth
                margin="normal"
                onKeyDown={e => { if (e.key === 'Enter') handleUnlock(); }}
              />
              {error && <Typography color="error" mt={1}>{error}</Typography>}
              <Button variant="contained" sx={{ mt: 2, bgcolor: '#25d366', '&:hover': { bgcolor: '#1ea952' } }} onClick={handleUnlock} fullWidth>
                Unlock
              </Button>
              {bioAvailable && (
                <Button variant="outlined" sx={{ mt: 2, borderColor: '#25d366', color: '#25d366', fontWeight: 600 }} onClick={handleBiometric} fullWidth>
                  Use Biometric (Fingerprint/Face)
                </Button>
              )}
              {bioError && <Typography color="error" mt={1}>{bioError}</Typography>}
              <Button variant="text" sx={{ mt: 1, color: '#25d366' }} onClick={handleReset} fullWidth>
                Reset PIN
              </Button>
            </>
          )}
        </Box>
      </Box>
    );
  }

  // In App function, add state for appLockUnlocked
  const [appLockUnlocked, setAppLockUnlocked] = useState(() => !localStorage.getItem('applock_pin'));
  const [isLocked, setIsLocked] = useState(() => localStorage.getItem('applock_enabled') === 'true'); // App lock state
  useEffect(() => {
    const handleStorageChange = () => {
      setIsLocked(localStorage.getItem('applock_enabled') === 'true');
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Inactivity lock logic
  useEffect(() => {
    if (!isLocked && localStorage.getItem('applock_enabled') === 'true') {
      let timeout;
      const getTimeout = () => parseInt(localStorage.getItem('applock_timeout') || '2000', 10);
      const resetTimer = () => {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
          setIsLocked(true);
        }, getTimeout());
      };
      const events = ['mousemove', 'keydown', 'mousedown', 'touchstart'];
      events.forEach(event => window.addEventListener(event, resetTimer));
      resetTimer();
      return () => {
        clearTimeout(timeout);
        events.forEach(event => window.removeEventListener(event, resetTimer));
      };
    }
  }, [isLocked]);

  useEffect(() => {
    console.log('pendingSelectedUserId effect running', pendingSelectedUserId, users);
    if (pendingSelectedUserId) {
      const found = users.find(u => u._id === pendingSelectedUserId);
      console.log('Found user in users array:', found);
      if (found) {
        setSelectedUser(found);
        setSelectedGroup(null);
        setPendingSelectedUserId(null);
      }
    }
  }, [users, pendingSelectedUserId]);

  useEffect(() => {
    if (token && selectedGroup) {
      axios
        .get(`${API_URL}/messages/${selectedGroup._id}?type=group`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          setGroupMessages(res.data);
          // Optionally update lastMessages for group
          if (res.data.length > 0) {
            const lastMessage = res.data[res.data.length - 1];
            setLastMessages((prev) => ({
              ...prev,
              [selectedGroup._id]: lastMessage,
            }));
          } else {
            setLastMessages((prev) => {
              const updated = { ...prev };
              delete updated[selectedGroup._id];
              return updated;
            });
          }
        })
        .catch(() => {
          setGroupMessages([]);
          setLastMessages((prev) => {
            const updated = { ...prev };
            delete updated[selectedGroup._id];
            return updated;
          });
        });
    }
  }, [token, selectedGroup]);

  // Restore last selected chat on page load
  useEffect(() => {
    if (!user) return;
    const lastSelected = localStorage.getItem('lastSelectedChat');
    if (lastSelected && users.length > 0) {
      try {
        const parsed = JSON.parse(lastSelected);
        if (parsed.type === 'user') {
          const foundUser = users.find(u => u._id === parsed.id);
          if (foundUser) {
            setSelectedUser(foundUser);
            setSelectedGroup(null);
          }
        } else if (parsed.type === 'group' && groups.length > 0) {
          const foundGroup = groups.find(g => g._id === parsed.id);
          if (foundGroup) {
            setSelectedGroup(foundGroup);
            setSelectedUser(null);
          }
        }
      } catch {}
    }
  }, [user, users, groups]);

  // Scroll to bottom instantly when messages or chat changes
  useEffect(() => {
    if ((selectedUser || selectedGroup) && messagesContainerRef.current) {
      // Instantly jump to bottom (no smooth scroll)
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages, selectedUser, selectedGroup]);

  useEffect(() => {
    if (nav === 'calls' && token) {
      axios.get('http://localhost:5001/api/calls', {
        headers: { Authorization: `Bearer ${token}` }
      }).then(res => setCallHistory(res.data));
    }
  }, [nav, token]);

  // Custom navigation handler to close message box when navigating to calls or status
  const handleNav = (navTarget) => {
    setNav(navTarget);
    if (navTarget === 'calls' || navTarget === 'status') {
      setSelectedUser(null);
      setSelectedGroup(null);
      setMessages([]);
      setGroupMessages([]);
      setMessage('');
    }
  };

  // Helper to toggle favorite
  const toggleFavorite = (userId) => {
    setFavorites((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  // Filter chat list based on nav
  let chatListToShow = search.trim() ? searchResults : mergedSearchResults;
  if (nav === 'favorite') {
    chatListToShow = chatListToShow.filter((u) => favorites.includes(u._id));
  }

  if (isLocked) {
    return <LockScreen onUnlock={() => setIsLocked(false)} />;
  }

  if (!token || !user) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {/* Top Navbar for Login/Register */}
        <Box width="100vw" position="fixed" top={0} left={0}
          sx={{
            height: 56,
            display: 'flex',
            alignItems: 'center',
            boxShadow: darkMode ? 4 : 2,
            borderRadius: 0,
            bgcolor: 'background.paper',
            zIndex: 1201,
            transition: 'background 0.2s',
          }}
        >
          {/* Social X Icon and Text */}
          <Box display="flex" alignItems="center" gap={1} ml={2}>
            <SocialXIcon size={32} color="#25d366" />
            <Typography variant="h6" fontWeight={700} color="text.primary" sx={{ pl: 1, letterSpacing: 1 }}>
              Social X
            </Typography>
          </Box>
          {/* About Link */}
          <Box flex={1} />
          <IconButton
            sx={{ color: 'text.primary', mr: 1 }}
            onClick={() => setAboutDialogOpen(true)}
          >
            <InfoIcon />
          </IconButton>
          {/* Theme Toggle */}
          <IconButton onClick={() => {
            setDarkMode((prev) => {
              localStorage.setItem('darkMode', JSON.stringify(!prev));
              return !prev;
            });
          }} sx={{ color: 'text.primary', mr: 1 }}>
            {darkMode ? <WbSunnyIcon /> : <DarkModeIcon />}
          </IconButton>
          {/* 3-dot Menu */}
          <IconButton onClick={handleNavMenuOpen} sx={{ color: 'text.primary', mr: 2 }}>
            <MoreVertIcon />
          </IconButton>
          <Menu
            anchorEl={navMenuAnchor}
            open={Boolean(navMenuAnchor)}
            onClose={handleNavMenuClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            PaperProps={{ sx: { minWidth: 180, borderRadius: 2, boxShadow: 3, bgcolor: darkMode ? '#222' : '#fff' } }}
          >
            <MenuItem onClick={() => { setLoginDialogOpen(true); handleNavMenuClose(); }} sx={{ gap: 1 }}>
              <LoginIcon sx={{ color: darkMode ? '#fff' : '#000' }} />
              Login
            </MenuItem>
            <MenuItem onClick={() => { setRegisterDialogOpen(true); handleNavMenuClose(); }} sx={{ gap: 1 }}>
              <PersonAddIcon sx={{ color: darkMode ? '#fff' : '#000' }} />
              Sign Up
            </MenuItem>
          </Menu>
        </Box>
        {/* Main Content */}
        <Box minHeight="100vh" width="100vw" bgcolor="background.default" sx={{ pt: 7, transition: 'background-color 0.5s ease' }}>
          <Container maxWidth="md">
            <Box mt={8} textAlign="center">
              {/* Welcome Screen */}
              <Box display="flex" alignItems="center" justifyContent="center" mb={4}>
                <SocialXIcon size={80} color="#25d366" />
                <Typography variant="h2" fontWeight={700} color="text.primary" sx={{ ml: 3, letterSpacing: 2 }}>
                  Social X
                </Typography>
              </Box>
              {/* Replace animated welcomeText with static text */}
              <Typography variant="h4" color="text.primary" sx={{ mb: 3, fontWeight: 500, minHeight: '2.5rem' }}>
                Welcome to Social X
              </Typography>
              <Typography variant="h6" color="text.secondary" sx={{ mb: 6, maxWidth: 600, mx: 'auto' }}>
                Connect with friends and family through instant messaging, voice messages, and file sharing. 
                Experience real-time communication with modern features and beautiful design.
              </Typography>
              <Box display="flex" gap={3} justifyContent="center" flexWrap="wrap">
                <Button 
                  variant="contained" 
                  size="large"
                  onClick={() => setLoginDialogOpen(true)}
                  sx={{ 
                    bgcolor: '#25d366',
                    '&:hover': { bgcolor: '#1ea952' },
                    px: 4,
                    py: 1.5,
                    fontSize: 18,
                    fontWeight: 600
                  }}
                >
                  Get Started
                </Button>
                <Button 
                  variant="outlined" 
                  size="large"
                  onClick={() => setAboutDialogOpen(true)}
                  sx={{ 
                    borderColor: '#25d366',
                    color: '#25d366',
                    '&:hover': { 
                      borderColor: '#1ea952',
                      bgcolor: 'rgba(37, 211, 102, 0.1)'
                    },
                    px: 4,
                    py: 1.5,
                    fontSize: 18,
                    fontWeight: 600
                  }}
                >
                  Learn More
                </Button>
                {/* Try Demo Button */}
                <Button
                  variant="outlined"
                  size="large"
                  startIcon={<span style={{fontSize:22,marginRight:2}}>🪄</span>}
                  sx={{
                    borderColor: '#25d366',
                    color: '#25d366',
                    fontWeight: 600,
                    px: 4,
                    py: 1.5,
                    fontSize: 18,
                    '&:hover': { borderColor: '#1ea952', color: '#1ea952', bgcolor: 'rgba(37,211,102,0.08)' },
                  }}
                  onClick={() => alert('Demo mode coming soon!')}
                >
                  Try Demo
                </Button>
              </Box>
              {/* App Lock Badge */}
              <Box display="flex" alignItems="center" justifyContent="center" mt={3} mb={1}>
                <LockIcon sx={{ color: '#25d366', fontSize: 28, mr: 1 }} />
                <Typography variant="subtitle1" fontWeight={600} color="#25d366">
                  Privacy Protected: App Lock Enabled
                </Typography>
              </Box>
              {/* Security Features List */}
              <Box display="flex" justifyContent="center" gap={3} mb={2}>
                <Box display="flex" alignItems="center" gap={1}>
                  <span style={{fontSize:22}}>🔒</span>
                  <Typography variant="body2" color="textSecondary">End-to-End Encryption</Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={1}>
                  <span style={{fontSize:22}}>🧬</span>
                  <Typography variant="body2" color="textSecondary">Biometric/Passcode Lock</Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={1}>
                  <span style={{fontSize:22}}>✅</span>
                  <Typography variant="body2" color="textSecondary">2FA Security</Typography>
                </Box>
              </Box>
            </Box>
          </Container>
        </Box>
        {error && (
          <Box position="fixed" top={16} left={0} right={0} zIndex={9999} display="flex" justifyContent="center">
            <Paper sx={{ p: 2, bgcolor: 'error.main', color: '#fff' }}>{error}</Paper>
          </Box>
        )}

        {/* About Dialog */}
        <Dialog 
          open={aboutDialogOpen} 
          onClose={() => setAboutDialogOpen(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{ 
            sx: { 
              bgcolor: darkMode ? '#222' : '#fff',
              color: darkMode ? '#fff' : '#222'
            } 
          }}
        >
          <DialogTitle sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 2,
            borderBottom: `1px solid ${darkMode ? '#444' : '#e0e0e0'}`
          }}>
            <SocialXIcon size={32} color="#25d366" />
            <Typography variant="h6" fontWeight={700}>
              About Social X
            </Typography>
          </DialogTitle>
          <DialogContent sx={{ pt: 3 }}>
            <Typography variant="body1" paragraph>
              Social X is a modern, real-time chat application built with React and Node.js. 
              Connect with friends and family through instant messaging, voice messages, and file sharing.
            </Typography>
            <Typography variant="h6" sx={{ mt: 3, mb: 2, color: '#25d366' }}>
              Features:
            </Typography>
            <Box component="ul" sx={{ pl: 2 }}>
              <Typography component="li" variant="body2" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                <ChatIcon sx={{ fontSize: 20, color: '#25d366' }} />
                Real-time messaging with typing indicators
              </Typography>
              <Typography component="li" variant="body2" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                <MicIcon sx={{ fontSize: 20, color: '#25d366' }} />
                Voice message recording and playback
              </Typography>
              <Typography component="li" variant="body2" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                <AttachFileIcon sx={{ fontSize: 20, color: '#25d366' }} />
                File sharing (images, documents, audio, video)
              </Typography>
              <Typography component="li" variant="body2" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                <DarkModeIcon sx={{ fontSize: 20, color: '#25d366' }} />
                Dark/Light theme support
              </Typography>
              <Typography component="li" variant="body2" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                <PhoneIcon sx={{ fontSize: 20, color: '#25d366' }} />
                Phone and email OTP verification
              </Typography>
              <Typography component="li" variant="body2" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                <NotificationsIcon sx={{ fontSize: 20, color: '#25d366' }} />
                Push notifications
              </Typography>
              <Typography component="li" variant="body2" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                <PersonIcon sx={{ fontSize: 20, color: '#25d366' }} />
                User status and last seen
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ mt: 3, color: darkMode ? '#aaa' : '#666' }}>
              Version 1.0.0 • Built with React, Node.js, Socket.io, and Material-UI
            </Typography>
          </DialogContent>
          <DialogActions sx={{ p: 2, borderTop: `1px solid ${darkMode ? '#444' : '#e0e0e0'}` }}>
            <Button 
              onClick={() => setAboutDialogOpen(false)}
              variant="contained"
              sx={{ 
                bgcolor: '#25d366',
                '&:hover': { bgcolor: '#1ea952' }
              }}
            >
              Close
            </Button>
          </DialogActions>
        </Dialog>

        {/* Login Dialog */}
        <Dialog 
          open={loginDialogOpen} 
          onClose={() => setLoginDialogOpen(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{ 
            sx: { 
              bgcolor: darkMode ? '#222' : '#fff',
              color: darkMode ? '#fff' : '#222'
            } 
          }}
        >
          <DialogTitle sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 2,
            borderBottom: `1px solid ${darkMode ? '#444' : '#e0e0e0'}`
          }}>
            <SocialXIcon size={32} color="#25d366" />
            <Typography variant="h6" fontWeight={700}>
              Login to Social X
            </Typography>
          </DialogTitle>
          <DialogContent sx={{ pt: 3 }}>
            <TextField 
              label="Email" 
              fullWidth 
              margin="normal" 
              value={email} 
              onChange={e => setEmail(e.target.value)}
              sx={{ mb: 2 }}
            />
            <TextField 
              label="Password" 
              type="password" 
              fullWidth 
              margin="normal" 
              value={password} 
              onChange={e => setPassword(e.target.value)}
              sx={{ mb: 2 }}
            />
            <Box sx={{ mt: 1, textAlign: 'right' }}>
              <Button
                variant="text"
                size="small"
                sx={{ color: '#25d366', textTransform: 'none', p: 0, minWidth: 'auto', fontSize: '0.95rem', fontWeight: 500 }}
                onClick={() => { setForgotDialogOpen(true); setForgotStep(1); setForgotEmail(''); setForgotToken(''); setForgotNewPassword(''); setForgotConfirmPassword(''); setForgotError(''); setForgotSuccess(''); }}
              >
                Forgot password?
              </Button>
            </Box>
            {/* Don't have an account? Register link */}
            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Typography variant="body1" color="textSecondary">
                Don't have an account?{' '}
                <Button 
                  variant="text" 
                  size="medium"
                  onClick={() => {
                    setUsername('');
                    setEmail('');
                    setPassword('');
                    setConfirmPassword('');
                    setAvatar('');
                    setAvatarFile(null);
                    setError('');
                    setLoginDialogOpen(false);
                    setRegisterDialogOpen(true);
                  }}
                  sx={{ 
                    color: '#25d366',
                    textTransform: 'none',
                    p: 0.5,
                    minWidth: 'auto',
                    fontSize: '1rem',
                    fontWeight: 500,
                    '&:hover': { 
                      bgcolor: 'transparent',
                      textDecoration: 'underline'
                    }
                  }}
                >
                  Register
                </Button>
              </Typography>
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2, borderTop: `1px solid ${darkMode ? '#444' : '#e0e0e0'}` }}>
            <Button 
              onClick={() => setLoginDialogOpen(false)}
              sx={{ 
                mr: 1,
                color: '#25d366',
                '&:hover': {
                  backgroundColor: 'rgba(37, 211, 102, 0.1)'
                }
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={async () => {
                const result = await handleLogin();
                if (!result?.pendingDeletion) setLoginDialogOpen(false);
              }}
              variant="contained"
              sx={{ 
                bgcolor: '#25d366',
                '&:hover': { bgcolor: '#1ea952' }
              }}
            >
              Login
            </Button>
          </DialogActions>
        </Dialog>

        {/* Register Dialog */}
        <Dialog 
          open={registerDialogOpen} 
          onClose={() => setRegisterDialogOpen(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{ 
            sx: { 
              bgcolor: darkMode ? '#222' : '#fff',
              color: darkMode ? '#fff' : '#222',
              maxHeight: '90vh'
            } 
          }}
        >
          <DialogTitle sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 2,
            borderBottom: `1px solid ${darkMode ? '#444' : '#e0e0e0'}`
          }}>
            <SocialXIcon size={32} color="#25d366" />
            <Typography variant="h6" fontWeight={700}>
              Create Account
            </Typography>
          </DialogTitle>
          <DialogContent sx={{ 
            pt: 3, 
            overflowY: 'auto',
            '&::-webkit-scrollbar': { display: 'none' },
            scrollbarWidth: 'none',
            msOverflowStyle: 'none'
          }}>
            {/* Avatar Upload */}
            <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" my={2}>
              {avatar ? (
                <Button
                  variant="outlined"
                  component="label"
                  onMouseEnter={() => setIsAvatarHovered(true)}
                  onMouseLeave={() => setIsAvatarHovered(false)}
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
                    '& .MuiAvatar-root': {
                      transition: 'filter 0.2s ease-in-out',
                    },
                    '&:hover .MuiAvatar-root': {
                      filter: 'brightness(0.6)',
                    },
                  }}
                >
                  <Avatar src={avatar} sx={{ width: 72, height: 72 }} />
                  {isAvatarHovered && (
                    <Box sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }}>
                      <EditIcon sx={{ color: 'white', fontSize: 32 }} />
                    </Box>
                  )}
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
                  onMouseEnter={() => setIsAvatarHovered(true)}
                  onMouseLeave={() => setIsAvatarHovered(false)}
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
                  {isAvatarHovered ? <EditIcon sx={{ fontSize: 32, color: '#555' }} /> : <CameraAltIcon sx={{ fontSize: 32, color: '#555' }} />}
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

            <TextField label="Username" fullWidth margin="normal" value={username} onChange={e => setUsername(e.target.value)} />
            <TextField label="Email" fullWidth margin="normal" value={email} onChange={e => setEmail(e.target.value)} />
            <TextField label="Password" type="password" fullWidth margin="normal" value={password} onChange={e => setPassword(e.target.value)} />
            <TextField label="Confirm Password" type="password" fullWidth margin="normal" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} 
              onPaste={e => {}} // Explicitly allow paste
            />
            
            {/* Have an account? Login link */}
            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Typography variant="body1" color="textSecondary">
                Have an account?{' '}
                <Button 
                  variant="text" 
                  size="medium" 
                  onClick={() => {
                    setUsername('');
                    setEmail('');
                    setPassword('');
                    setConfirmPassword('');
                    setAvatar('');
                    setAvatarFile(null);
                  setError('');
                    setRegisterDialogOpen(false);
                    setLoginDialogOpen(true);
                  }}
                  sx={{ 
                    color: '#25d366',
                    textTransform: 'none',
                    p: 0.5,
                    minWidth: 'auto',
                    fontSize: '1rem',
                    fontWeight: 500,
                    '&:hover': { 
                      bgcolor: 'transparent',
                      textDecoration: 'underline'
                    }
                  }}
                >
                  Login
                </Button>
              </Typography>
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2, borderTop: `1px solid ${darkMode ? '#444' : '#e0e0e0'}` }}>
            <Button 
              onClick={() => setRegisterDialogOpen(false)}
              sx={{ 
                mr: 1,
                color: '#25d366',
                '&:hover': {
                    backgroundColor: 'rgba(37, 211, 102, 0.1)'
                  }
                }} 
            >
              Cancel
            </Button>
            <Button 
              onClick={async () => {
                const prevToken = token;
                const prevUser = user;
                await handleRegister();
                // Only close dialog if registration was successful (token and user are set)
                if (token !== prevToken && user !== prevUser) {
                  setRegisterDialogOpen(false);
                }
              }}
              variant="contained"
              sx={{ 
                bgcolor: '#25d366',
                '&:hover': { bgcolor: '#1ea952' }
              }}
            >
              Register
            </Button>
          </DialogActions>
        </Dialog>

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
              sx={{ 
                mt: 2,
                color: '#25d366'
              }}
            />
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={handleCropCancel}
              sx={{ 
                color: '#25d366',
                '&:hover': {
                  backgroundColor: 'rgba(37, 211, 102, 0.1)'
                }
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCropSave} 
              variant="contained"
              sx={{ 
                bgcolor: '#25d366',
                '&:hover': { bgcolor: '#1ea952' }
              }}
            >
              Save
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar for notifications */}
        {snackbar && (
          <Snackbar open={!!snackbar && snackbar.open} autoHideDuration={6000} onClose={handleSnackbarClose}>
            <MuiAlert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
              {snackbar.message}
            </MuiAlert>
          </Snackbar>
        )}
        <Dialog open={forgotDialogOpen} onClose={() => setForgotDialogOpen(false)} maxWidth="xs" fullWidth>
          <DialogTitle>Forgot Password</DialogTitle>
          <DialogContent>
            {forgotStep === 1 ? (
              <>
                <Typography sx={{ mb: 2 }}>Enter your email to receive a password reset link.</Typography>
                <TextField
                  label="Email"
                  value={forgotEmail}
                  onChange={e => setForgotEmail(e.target.value)}
                  fullWidth
                  margin="normal"
                />
                {forgotError && <Typography color="error" sx={{ mt: 1 }}>{forgotError}</Typography>}
                {forgotSuccess && <Typography color="success.main" sx={{ mt: 1 }}>{forgotSuccess}</Typography>}
              </>
            ) : (
              <>
                <Typography sx={{ mb: 2 }}>Enter the reset token (demo) and your new password.</Typography>
                <TextField
                  label="Reset Token"
                  value={forgotToken}
                  onChange={e => setForgotToken(e.target.value)}
                  fullWidth
                  margin="normal"
                />
                <TextField
                  label="New Password"
                  type="password"
                  value={forgotNewPassword}
                  onChange={e => setForgotNewPassword(e.target.value)}
                  fullWidth
                  margin="normal"
                />
                <TextField
                  label="Confirm New Password"
                  type="password"
                  value={forgotConfirmPassword}
                  onChange={e => setForgotConfirmPassword(e.target.value)}
                  fullWidth
                  margin="normal"
                />
                {forgotError && <Typography color="error" sx={{ mt: 1 }}>{forgotError}</Typography>}
                {forgotSuccess && <Typography color="success.main" sx={{ mt: 1 }}>{forgotSuccess}</Typography>}
              </>
            )}
          </DialogContent>
          <DialogActions>
            {forgotStep === 1 ? (
              <Button onClick={handleForgotSubmit} variant="contained" sx={{ backgroundColor: '#25d366', color: '#fff' }} disabled={!forgotEmail}>
                Send Reset Link
              </Button>
            ) : (
              <Button onClick={handleForgotReset} variant="contained" sx={{ backgroundColor: '#25d366', color: '#fff' }} disabled={!forgotToken || !forgotNewPassword || !forgotConfirmPassword}>
                Reset Password
              </Button>
            )}
            <Button onClick={() => setForgotDialogOpen(false)} sx={{ color: '#25d366' }}>Cancel</Button>
          </DialogActions>
        </Dialog>
        {/* Auth Method Choice Dialog */}
        <Dialog open={authMethodDialogOpen} onClose={() => setAuthMethodDialogOpen(false)} maxWidth="xs" fullWidth>
          <DialogTitle>Choose Authentication Method</DialogTitle>
          <DialogContent>
            <Typography sx={{ mb: 2 }}>How would you like to authenticate?</Typography>
            <Button onClick={handleChoose2FA} variant="outlined" fullWidth sx={{ mb: 2, color: '#25d366', borderColor: '#25d366' }}>
              Use Authenticator App (2FA)
            </Button>
            <Button onClick={handleChoosePasskey} variant="contained" fullWidth sx={{ backgroundColor: '#25d366', color: '#fff' }}>
              Use Passkey (Device)
            </Button>
            {authMethodError && <Typography color="error" sx={{ mt: 2 }}>{authMethodError}</Typography>}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setAuthMethodDialogOpen(false)} sx={{ color: '#25d366' }}>Cancel</Button>
          </DialogActions>
        </Dialog>
        {/* Cancel Deletion Dialog (intercept login and in-app) */}
        <Dialog open={showCancelDeletionDialog}>
          <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'warning.main' }}>
            <WarningAmberIcon sx={{ color: 'warning.main', mr: 1 }} />
            Account Scheduled for Deletion
          </DialogTitle>
          <DialogContent>
            <Typography color="error" fontWeight={600} sx={{ mb: 1 }}>
              Your account is scheduled for deletion!
            </Typography>
            <Typography sx={{ mb: 1 }}>
              <b>Scheduled Deletion Date:</b> {(pendingLoginUser?.deletionDate || user?.deletionDate) ? new Date(pendingLoginUser?.deletionDate || user?.deletionDate).toLocaleString() : ''}
            </Typography>
            <Typography sx={{ mb: 2 }}>
              <b>Time remaining:</b> {deletionCountdown}
            </Typography>
            <Typography sx={{ mb: 2 }}>
              If you want to keep your account, click <b>Keep Account</b> below. Otherwise, your account will be permanently deleted after the scheduled date.
            </Typography>
          </DialogContent>
          <DialogActions>
            {pendingLoginUser ? (
              <Button onClick={() => {
                setShowCancelDeletionDialog(false);
                setPendingLoginUser(null);
                setPendingLoginToken('');
              }} color="error" variant="outlined">Cancel Login</Button>
            ) : (
              <Button onClick={() => {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.reload();
              }} color="error" variant="outlined">Logout</Button>
            )}
            <Button 
              onClick={() => handleCancelAccountDeletion(!!pendingLoginUser)} 
              sx={{ bgcolor: '#25d366', color: '#fff', fontWeight: 600, '&:hover': { bgcolor: '#1ea952' } }}
              variant="contained"
            >
              Keep Account
            </Button>
          </DialogActions>
        </Dialog>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {/* Top Navbar with Social X */}
      <Box width="100vw" position="fixed" top={0} left={0}
        bgcolor="background.paper"
        sx={{
          height: 56,
          display: 'flex',
          alignItems: 'center',
          boxShadow: darkMode ? 4 : 2,
          borderRadius: 0,
          transition: 'background 0.2s',
        }}
      >
        <Box display="flex" alignItems="center" gap={1}>
          <SocialXIcon size={32} color="#25d366" style={{ marginLeft: 12 }} />
          <Typography variant="h6" fontWeight={700} color="text.primary" sx={{ pl: 1, letterSpacing: 1 }}>
            Social X
          </Typography>
        </Box>
      </Box>
      <Box display="flex" width="100vw" bgcolor="background.default" sx={{ 
        height: 'calc(100vh - 56px)', 
        width: '100vw', 
        minWidth: '100vw', 
        overflow: 'hidden', 
        '::-webkit-scrollbar': { display: 'none' }, 
        scrollbarWidth: 'none', 
        msOverflowStyle: 'none', 
        borderRadius: 0, 
        boxShadow: 2, 
        mt: 7, 
        transition: 'background-color 0.5s ease'
      }} style={{ scrollBehavior: 'auto' }}>
        <Sidebar
          user={user}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          onNav={handleNav}
          onLogout={handleLogout}
          onProfileEdit={handleProfileEdit}
          nav={nav}
          unreadChatsCount={unreadChatsCount}
          onNotificationSettings={() => setNotificationSettingsDialogOpen(true)}
          fetchUserProfile={fetchUserProfile}
          seasonalTheme={seasonalTheme}
          setSeasonalTheme={setSeasonalThemeAndPersist}
          getCurrentSeason={getCurrentSeason}
        />
        {/* Chat List Panel */}
        {nav === 'status' ? (
          <Box width={{ xs: '100vw', sm: 320 }} minWidth={{ xs: '100vw', sm: 260 }} maxWidth={400} bgcolor={darkMode ? '#000' : '#fff'} p={{ xs: 1, sm: 2 }} boxShadow={0} display="flex" flexDirection="column" height="100%" borderRadius={0} sx={{ mt: 0, overflowY: 'auto', borderRadius: 0, borderTopLeftRadius: 0, borderTop: 0, position: 'relative', '::-webkit-scrollbar': { display: 'none' }, scrollbarWidth: 'none', '-ms-overflow-style': 'none' }}>
            <Typography variant="h5" fontWeight={900} sx={{ mt: 2, mb: 2, color: darkMode ? '#fff' : '#222', letterSpacing: 1 }}>Status</Typography>
            {/* My Status Card */}
            <Paper sx={{ display: 'flex', alignItems: 'center', p: 2, mb: 2, borderRadius: 3, bgcolor: darkMode ? '#000' : '#fff', '&:hover': { bgcolor: darkMode ? '#111' : '#f0f0f0' } }}>
              <Box position="relative"
                onMouseEnter={() => setMyStatusAvatarHover(true)}
                onMouseLeave={() => setMyStatusAvatarHover(false)}
                sx={{ mr: 2 }}
              >
                <Avatar src={getFullUrl(user?.avatar)} sx={{ width: 48, height: 48 }} />
                {myStatusAvatarHover && (
                  <Box
                    position="absolute"
                    top={0}
                    left={0}
                    width={48}
                    height={48}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    sx={{
                      background: darkMode ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.6)',
                      borderRadius: '50%',
                      cursor: 'pointer',
                      transition: 'background 0.2s',
                    }}
                    onClick={() => setShareStatusDialogOpen(true)}
                  >
                    <AddIcon sx={{ color: '#25d366', fontSize: 32 }} />
                  </Box>
                )}
              </Box>
              <Box>
                <Typography fontWeight={700} sx={{ color: darkMode ? '#fff' : '#222' }}>My status</Typography>
                <Typography variant="body2" color="textSecondary">
                  {statuses.find(s => s.userId === user?.id) ? statuses.find(s => s.userId === user?.id).text : 'No updates'}
                </Typography>
              </Box>
            </Paper>
            {/* Share Status Dialog */}
            <Dialog open={shareStatusDialogOpen} onClose={() => setShareStatusDialogOpen(false)} maxWidth="xs" fullWidth
              PaperProps={{
                sx: {
                  borderRadius: 4,
                  boxShadow: 12,
                  bgcolor: darkMode ? '#181c1f' : '#f9f9f9',
                  p: 0,
                  overflow: 'hidden',
                }
              }}
            >
              <DialogTitle sx={{
                textAlign: 'center',
                fontWeight: 800,
                fontSize: 26,
                color: darkMode ? '#fff' : '#222',
                letterSpacing: 1,
                pb: 1.5,
                pt: 3,
              }}>
                Share Status
                <Divider sx={{ mt: 2, mb: 0, bgcolor: darkMode ? '#222e35' : '#e0e0e0', height: 2, borderRadius: 1 }} />
              </DialogTitle>
              <DialogContent sx={{ px: 4, pt: 2, pb: 1 }}>
                <Box display="flex" flexDirection="column" gap={2.5} alignItems="center" justifyContent="center">
                  <Button startIcon={<ImageIcon sx={{ color: '#25d366' }} />} fullWidth variant="outlined"
                    sx={{
                      justifyContent: 'flex-start',
                      color: darkMode ? '#fff' : '#222',
                      borderColor: darkMode ? '#333' : '#ccc',
                      borderRadius: 3,
                      fontWeight: 600,
                      fontSize: 17,
                      py: 1.5,
                      px: 2,
                      boxShadow: '0 1px 4px rgba(37,211,102,0.04)',
                      transition: 'transform 0.15s, box-shadow 0.15s, border 0.15s',
                      borderWidth: 2,
                      '&:hover': {
                        border: '2px solid #25d366',
                        bgcolor: darkMode ? '#111' : '#f0f0f0',
                        transform: 'scale(1.04)',
                        boxShadow: '0 4px 16px rgba(37,211,102,0.10)',
                      },
                    }}
                  >Share Image</Button>
                  <Button startIcon={<MovieIcon sx={{ color: '#25d366' }} />} fullWidth variant="outlined"
                    sx={{
                      justifyContent: 'flex-start',
                      color: darkMode ? '#fff' : '#222',
                      borderColor: darkMode ? '#333' : '#ccc',
                      borderRadius: 3,
                      fontWeight: 600,
                      fontSize: 17,
                      py: 1.5,
                      px: 2,
                      boxShadow: '0 1px 4px rgba(37,211,102,0.04)',
                      transition: 'transform 0.15s, box-shadow 0.15s, border 0.15s',
                      borderWidth: 2,
                      '&:hover': {
                        border: '2px solid #25d366',
                        bgcolor: darkMode ? '#111' : '#f0f0f0',
                        transform: 'scale(1.04)',
                        boxShadow: '0 4px 16px rgba(37,211,102,0.10)',
                      },
                    }}
                  >Share Video</Button>
                  <Button startIcon={<EditIcon sx={{ color: '#25d366' }} />} fullWidth variant="outlined"
                    sx={{
                      justifyContent: 'flex-start',
                      color: darkMode ? '#fff' : '#222',
                      borderColor: darkMode ? '#333' : '#ccc',
                      borderRadius: 3,
                      fontWeight: 600,
                      fontSize: 17,
                      py: 1.5,
                      px: 2,
                      boxShadow: '0 1px 4px rgba(37,211,102,0.04)',
                      transition: 'transform 0.15s, box-shadow 0.15s, border 0.15s',
                      borderWidth: 2,
                      '&:hover': {
                        border: '2px solid #25d366',
                        bgcolor: darkMode ? '#111' : '#f0f0f0',
                        transform: 'scale(1.04)',
                        boxShadow: '0 4px 16px rgba(37,211,102,0.10)',
                      },
                    }}
                  >Share Text</Button>
                  <Button startIcon={<LinkIcon sx={{ color: '#25d366' }} />} fullWidth variant="outlined"
                    sx={{
                      justifyContent: 'flex-start',
                      color: darkMode ? '#fff' : '#222',
                      borderColor: darkMode ? '#333' : '#ccc',
                      borderRadius: 3,
                      fontWeight: 600,
                      fontSize: 17,
                      py: 1.5,
                      px: 2,
                      boxShadow: '0 1px 4px rgba(37,211,102,0.04)',
                      transition: 'transform 0.15s, box-shadow 0.15s, border 0.15s',
                      borderWidth: 2,
                      '&:hover': {
                        border: '2px solid #25d366',
                        bgcolor: darkMode ? '#111' : '#f0f0f0',
                        transform: 'scale(1.04)',
                        boxShadow: '0 4px 16px rgba(37,211,102,0.10)',
                      },
                    }}
                  >Share Link</Button>
                </Box>
              </DialogContent>
              <DialogActions sx={{ bgcolor: 'transparent', px: 3, pb: 2, pt: 1 }}>
                <Button onClick={() => setShareStatusDialogOpen(false)} sx={{ color: '#25d366', fontWeight: 700, fontSize: 16, borderRadius: 2, px: 3, py: 1, letterSpacing: 1, textTransform: 'none' }}>Cancel</Button>
              </DialogActions>
            </Dialog>
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
            <IconButton 
              color="primary" 
              sx={{ position: 'absolute', top: 16, right: 16, bgcolor: 'transparent', borderRadius: 0, width: 'auto', height: 'auto', boxShadow: 'none', p: 0, '&:hover': { bgcolor: 'transparent', color: darkMode ? '#1976d2' : '#1976d2' } }}
              onClick={() => setShowNewCallPanel(true)}
            >
              <AddIcCallIcon sx={{ fontSize: 24, color: darkMode ? '#fff' : '#222' }} />
            </IconButton>
            <Box height={40} />
            {/* Search bar for calls */}
            <Box display="flex" alignItems="center" mb={2} gap={1}>
              <Box flex={1} display="flex" alignItems="center" bgcolor={darkMode ? '#111' : '#f5f5f5'} px={1} sx={{ border: darkMode ? '1.5px solid #222e35' : '1.5px solid #e0e0e0', borderRadius: '50px' }}>
                <SearchIcon sx={{ color: darkMode ? '#aebac1' : '#555' }} />
                <input
                  type="text"
                  name="call-search-bar"
                  placeholder="Search calls"
                  value={callSearch}
                  onChange={e => setCallSearch(e.target.value)}
                  autoComplete="off"
                  style={{ border: 'none', outline: 'none', background: 'transparent', padding: 8, flex: 1, color: darkMode ? '#fff' : '#222', fontSize: 16 }}
                />
              </Box>
            </Box>
            {/* Call history list, filtered by search */}
            {callHistory.length === 0 && !callSearch.trim() && (
              <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" py={6}>
                <Typography variant="h6" fontWeight={700} sx={{ color: darkMode ? '#fff' : '#222', mb: 1 }}>No Calls Yet</Typography>
                <Typography variant="body2" color="textSecondary" sx={{ color: darkMode ? '#bbb' : '#555', mb: 3 }}>Start a new call</Typography>
              </Box>
            )}
            <List sx={{ width: '100%', maxWidth: 400, bgcolor: darkMode ? '#000' : '#fff', borderRadius: 2, mb: 2 }}>
              {callHistory
                .filter(call => {
                  const name = call.group ? call.group.name : (call.to && call.to._id === user._id ? call.from?.username : call.to?.username);
                  return name && name.toLowerCase().includes(callSearch.toLowerCase());
                })
                .map(call => {
                  const isGroup = !!call.group;
                  const name = isGroup ? call.group.name : (call.to && call.to._id === user._id ? call.from?.username : call.to?.username);
                  const avatar = isGroup ? call.group.avatar : (call.to && call.to._id === user._id ? call.from?.avatar : call.to?.avatar);
                  const typeLabel = call.type.charAt(0).toUpperCase() + call.type.slice(1);
                  const statusLabel = call.status.charAt(0).toUpperCase() + call.status.slice(1);
                  const time = new Date(call.startedAt).toLocaleString();
                  return (
                    <ListItem key={call._id} sx={{ borderRadius: 2, mb: 1, bgcolor: darkMode ? '#000' : '#fff', '&:hover': { bgcolor: darkMode ? '#111' : '#f0f0f0' } }}>
                      <Avatar src={avatar} sx={{ mr: 2 }}>{!avatar && name ? name[0] : ''}</Avatar>
                      <ListItemText
                        primary={<Typography fontWeight={600} sx={{ color: darkMode ? '#fff' : 'inherit' }}>{name}</Typography>}
                        secondary={<Typography variant="body2" color="textSecondary" sx={{ color: darkMode ? '#bbb' : 'textSecondary.main' }}>{typeLabel} Call - {statusLabel} - {time}</Typography>}
                      />
                    </ListItem>
                  );
                })}
            </List>
            {showNewCallPanel && (
              <NewCallPanel
                open={showNewCallPanel}
                onClose={() => setShowNewCallPanel(false)}
                contacts={users}
                frequentlyContacted={users.slice(0, 2)}
              />
            )}
          </Box>
        ) : (
          <Box width={{ xs: '100vw', sm: 320 }} minWidth={{ xs: '100vw', sm: 260 }} maxWidth={400} bgcolor={darkMode ? '#000' : '#fff'} p={{ xs: 1, sm: 2 }} boxShadow={0} display="flex" flexDirection="column" height="100%" borderRadius={0} sx={{ mt: 0, overflowY: 'auto', borderRadius: 0, borderTopLeftRadius: 0, borderTop: 0, position: 'relative' }}>
            <Box display="flex" alignItems="center" mb={2} gap={1}>
              <Box flex={1} display="flex" alignItems="center" bgcolor={darkMode ? '#111' : '#f5f5f5'} px={1} sx={{ border: darkMode ? '1.5px solid #222e35' : '1.5px solid #e0e0e0', borderRadius: '50px' }}>
                {/* Hidden dummy input to catch browser autofill */}
                <input type="text" name="fake-email" autoComplete="username" style={{ display: 'none' }} />
                <SearchIcon sx={{ color: darkMode ? '#aebac1' : '#555' }} />
                <input
                  type="text"
                  name="chat-search-bar"
                  placeholder="Search or start a new chat"
                  value={search}
                  onChange={e => {
                    console.log('Search input changed:', e.target.value);
                    setSearch(e.target.value);
                  }}
                  autoComplete="new-password"
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
                            <Avatar src={getFullUrl(u.avatar)} />
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
                              {u.username || u.name || u.email}
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
                {chatListToShow.length > 0 ? (
                  chatListToShow.map(u => {
                    const unreadCount = unreadCounts[u._id] || 0;
                    const isOnline = getUserStatus(u).status === 'online';
                    const lastMsgObj = lastMessages[u._id];

                    let fileData = null;
                    let lastMsgContent = '';
                    let lastMsgTimestamp = null;
                    if (lastMsgObj && typeof lastMsgObj === 'object') {
                      lastMsgContent = lastMsgObj.content || '';
                      lastMsgTimestamp = lastMsgObj.createdAt || null;
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
                    }
                    if (!lastMsgObj) {
                      lastMsgContent = 'Start a conversation!';
                    }
                    return (
                      <Tooltip title={lastMsgContent} placement="right">
                        <ListItem 
                          button 
                          key={u._id} 
                          selected={selectedUser?._id === u._id} 
                          onClick={() => {
                            if (!users.find(convUser => convUser._id === u._id)) {
                              startNewChat(u);
                            } else {
                              setSelectedUser(u); setSelectedGroup(null);
                            }
                          }} 
                          sx={{ 
                            borderRadius: 2, mb: 1, position: 'relative',
                            '&:hover .remove-chat-btn': { display: 'flex' },
                          }}
                        >
                          <Box position="relative" display="inline-block" mr={1}>
                            <Avatar src={getFullUrl(u.avatar)} />
                            {isOnline && (
                              <Box position="absolute" bottom={2} right={2} width={8} height={8} bgcolor="#25d366" borderRadius="50%" border={`2px solid ${darkMode ? '#000' : '#fff'}`} />
                            )}
                            {(unreadCount > 0 && (!isOnline || selectedUser?._id !== u._id)) && (
                              <Box position="absolute" top={-2} right={-2} bgcolor="#25d366" color="#fff" borderRadius="50%" minWidth={18} height={18} display="flex" alignItems="center" justifyContent="center" fontSize={12} fontWeight={700} px={0.5} boxShadow={2}>
                                {unreadCount}
                              </Box>
                            )}
                          </Box>
                          <Box flex={1} minWidth={0} mr={1.5} display="flex" alignItems="center">
                            <Box flex={1} minWidth={0}>
                              <Typography fontWeight={600} sx={{ color: darkMode ? '#fff' : 'inherit', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {u.username || u.name || u.email}
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
                            {lastMsgTimestamp && <Typography variant="caption" color="textSecondary" sx={{ color: darkMode ? '#bbb' : 'textSecondary.main', ml: 1 }}>
                              {new Date(lastMsgTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </Typography>}
                            <IconButton onClick={e => { e.stopPropagation(); handleOpenProfileDialog(u); }} sx={{ ml: 1 }}><PersonIcon /></IconButton>
                          </Box>
                          {/* Favorite toggle button */}
                          <Box flexShrink={0} display="flex" alignItems="center" ml={1}>
                            <IconButton
                              onClick={e => {
                                e.stopPropagation();
                                toggleFavorite(u._id);
                              }}
                              size="small"
                              sx={{ color: favorites.includes(u._id) ? '#FFD700' : (darkMode ? '#bbb' : '#888') }}
                              title={favorites.includes(u._id) ? 'Remove from favorites' : 'Add to favorites'}
                            >
                              {favorites.includes(u._id) ? <StarIcon fontSize="small" /> : <StarIcon fontSize="small" sx={{ color: 'inherit', opacity: 0.4 }} />}
                            </IconButton>
                          </Box>
                          {/* Remove chat button (existing code) */}
                          <Box flexShrink={0} display="flex" alignItems="center" ml={2}>
                            <IconButton 
                              className="remove-chat-btn" 
                              sx={{ display: 'none' }}
                              onClick={async (e) => {
                                e.stopPropagation();
                                
                                // Remove from local state
                                setUsers(prev => prev.filter(user => user._id !== u._id));
                                setMessages(prev => (selectedUser && selectedUser._id === u._id ? [] : prev));
                                setLastMessages(prev => {
                                  const updated = { ...prev };
                                  delete updated[u._id];
                                  return updated;
                                });
                                setUnreadCounts(prev => {
                                  const updated = { ...prev };
                                  delete updated[u._id];
                                  return updated;
                                });
                                if (selectedUser && selectedUser._id === u._id) {
                                  setSelectedUser(null);
                                  setMessages([]);
                                }
                                
                                // Also remove from database contacts
                                try {
                                  await axios.delete(`${API_URL}/messages/${u._id}`, {
                                    headers: { Authorization: `Bearer ${token}` }
                                  });
                                  console.log('User removed from database contacts:', u.username);
                                } catch (error) {
                                  // console.error('Error removing user from database contacts:', error);
                                  // Even if database removal fails, keep the local removal
                                }
                              }}
                              size="small"
                              color="error"
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </ListItem>
                      </Tooltip>
                    );
                  })
                ) : search ? (
                  <>
                    {searchResults.length > 0 ? (
                      <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" py={4}>
                        {searchResults.map(user => (
                          <ListItem
                            key={user._id || user.username}
                            button
                            onClick={() => {
                              console.log('Clicked user in search results:', user);
                              const foundUser = users.find(convUser => convUser._id === user._id);
                              if (!foundUser) {
                                startNewChat(user);
                              } else {
                                setSelectedUser(foundUser);
                                setSelectedGroup(null);
                                console.log('User already in users list, set as selectedUser:', foundUser);
                              }
                            }}
                            sx={{
                              borderRadius: 2,
                              mb: 1,
                              width: '100%',
                              maxWidth: 320,
                              '&:hover': {
                                bgcolor: darkMode ? '#222' : '#f5f5f5'
                              },
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'flex-start',
                              cursor: 'pointer',
                            }}
                          >
                            <Avatar src={getFullUrl(user.avatar)} sx={{ mr: 2 }}>
                              {!user.avatar && user.username ? user.username[0] : null}
                            </Avatar>
                            <ListItemText
                              primary={user.username}
                              secondary={user.email}
                              primaryTypographyProps={{
                                fontWeight: 600,
                                color: darkMode ? '#fff' : 'inherit'
                              }}
                              secondaryTypographyProps={{
                                color: 'text.secondary'
                              }}
                            />
                          </ListItem>
                        ))}
                      </Box>
                    ) : (
                      <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" py={4}>
                        <SearchIcon sx={{ fontSize: 48, color: darkMode ? '#555' : '#ccc', mb: 2 }} />
                        <Typography variant="body1" color="textSecondary" align="center">
                          No users found for "{search}"
                        </Typography>
                        <Typography variant="body2" color="textSecondary" align="center" sx={{ mt: 1 }}>
                          Try searching with a different term
                        </Typography>
                      </Box>
                    )}
                  </>
                ) : (
                  <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" py={4}>
                    <PersonIcon sx={{ fontSize: 48, color: darkMode ? '#555' : '#ccc', mb: 2 }} />
                    <Typography variant="body1" color="textSecondary" align="center">
                      No conversations yet
                    </Typography>
                    <Typography variant="body2" color="textSecondary" align="center" sx={{ mt: 1, mb: 2 }}>
                      Start a new conversation to begin chatting
                    </Typography>
                    <Button
                      variant="contained"
                      sx={{ 
                        borderRadius: 2,
                        bgcolor: '#25d366',
                        '&:hover': {
                          bgcolor: '#1da851'
                        }
                      }}
                      onClick={() => {
                        fetchAvailableUsers();
                        setShowNewChatDialog(true);
                      }}
                      startIcon={<AddIcon />}
                    >
                      New Chat
                    </Button>
                  </Box>
                )}
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
          {/* If no chat is selected and nav is 'calls', show the calls welcome page */}
          {nav === 'calls' && !(selectedUser || selectedGroup) && (
            <Box flex={1} display="flex" flexDirection="column" alignItems="center" justifyContent="center">
              <Typography variant="h5" color="textSecondary" sx={{ mb: 2 }}>
                Start a new call
              </Typography>
              <Box display="flex" flexDirection="row" gap={6} mb={2}>
                <Box display="flex" flexDirection="column" alignItems="center">
                  <IconButton size="large" sx={{ color: '#25d366', mb: 1, width: 72, height: 72 }}>
                    <CallOutlinedIcon fontSize="large" />
                  </IconButton>
                  <Typography variant="body2" color="textSecondary">Voice call</Typography>
                </Box>
                <Box display="flex" flexDirection="column" alignItems="center">
                  <IconButton size="large" sx={{ color: '#25d366', mb: 1, width: 72, height: 72 }}>
                    <VideocamOutlinedIcon fontSize="large" />
                  </IconButton>
                  <Typography variant="body2" color="textSecondary">Video call</Typography>
                </Box>
                <Box display="flex" flexDirection="column" alignItems="center">
                  <IconButton size="large" sx={{ color: '#25d366', mb: 1, width: 72, height: 72 }}>
                    <GroupAddIcon fontSize="large" />
                  </IconButton>
                  <Typography variant="body2" color="textSecondary">New group call</Typography>
                </Box>
              </Box>
            </Box>
          )}

          {/* If no chat is selected and nav is not 'calls', show SocialXIcon centered */}
          {!(selectedUser || selectedGroup) && nav !== 'calls' && nav !== 'status' && (
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
          {/* If nav is 'status' and no contact is selected, show status instruction */}
          {!(selectedUser || selectedGroup) && nav === 'status' && (
            <Box flex={1} display="flex" flexDirection="column" alignItems="center" justifyContent="center" sx={{ 
              minHeight: 0, 
              minWidth: 0,
              bgcolor: darkMode ? '#000' : '#fff',
              position: 'relative',
              width: '100%',
              height: '100%',
            }}>
              <Typography variant="body1" color="textSecondary" align="center" sx={{ fontWeight: 400 }}>
                Click on a contact to view their status updates
              </Typography>
              <Box position="absolute" bottom={32} left={0} width="100%" display="flex" justifyContent="center">
                <Box display="flex" alignItems="center" color="text.secondary" sx={{ opacity: 0.7 }}>
                  <LockOutlinedIcon sx={{ fontSize: 18, mr: 1 }} />
                  <Typography variant="body2" color="textSecondary">
                    Status updates are end-to-end encrypted
                  </Typography>
                </Box>
              </Box>
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
              {selectedUser && !isBlocked && (console.log('Rendering message box for selectedUser:', selectedUser),
                <Box display="flex" alignItems="center" sx={{ cursor: 'pointer' }} onClick={() => { handleOpenProfileDialog(selectedUser); }}>
                  <Box position="relative" display="inline-block" mr={2}>
                    <Avatar src={getFullUrl(selectedUser.avatar) || undefined}>
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
                  <Avatar src={getFullUrl(selectedGroup.avatar)} sx={{ mr: 2, cursor: 'pointer' }} onClick={() => { handleOpenProfileDialog(selectedGroup); }} />
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
                  backgroundImage: darkMode
                    ? `url('/whatsapp-doodle-bg.png')`
                    : `url('/whatsapp-doodle-bg-light.png')`,
                  backgroundSize: 'auto',
                  backgroundRepeat: 'repeat',
                  backgroundPosition: 'center',
                  // Make doodle lighter in light mode
                  ...(darkMode
                    ? {}
                    : {
                        // filter: 'brightness(2.2) opacity(0.18)', // Temporarily removed for debugging
                        // border: '2px solid red', // Debug border removed
                      }),
                }}
                p={3}
                pb={2} // Add bottom padding to prevent overlap with input
              >
                {(selectedUser ? messages : groupMessages).map((msg, idx) => {
                  let fileData = null;
                  try {
                    fileData = msg.content && typeof msg.content === 'string' && msg.content.startsWith('{') ? JSON.parse(msg.content) : null;
                  } catch {}
                  // Use correct sender check
                  const isMine = msg.from && msg.from._id === user.id;
                  return (
                    <>
                      <Box key={idx} display="flex" flexDirection="column" alignItems={isMine ? 'flex-end' : 'flex-start'} width="100%" sx={{ mb: 1 }}>
                        {/* Render message bubble here, using msg.content or fileData */}
                        <div style={{
                          background: isMine ? '#DCF8C6' : (darkMode ? '#222' : '#fff'),
                          color: isMine ? '#222' : (darkMode ? '#fff' : '#222'),
                          borderRadius: 8,
                          padding: '8px 12px',
                          maxWidth: '70%',
                          wordBreak: 'break-word',
                          boxShadow: '0 1px 1px rgba(0,0,0,0.05)',
                          marginLeft: isMine ? 'auto' : 0,
                          marginRight: isMine ? 0 : 'auto',
                        }}>
                          {fileData ? (
                            fileData.type.startsWith('image/') ? (
                              <img src={`http://localhost:5001${fileData.file}`} alt={fileData.name || 'Image'} style={{ maxWidth: 200, borderRadius: 8 }} />
                            ) : fileData.type.startsWith('audio/') ? (
                              <audio controls src={`http://localhost:5001${fileData.file}`} style={{ width: 200 }} />
                            ) : fileData.type.startsWith('video/') ? (
                              <div style={{ maxWidth: 300, borderRadius: 8, overflow: 'hidden', position: 'relative' }}>
                                <video 
                                  controls 
                                  src={`http://localhost:5001${fileData.file}`} 
                                  style={{ 
                                    width: '100%', 
                                    maxHeight: 200,
                                    borderRadius: 8,
                                    backgroundColor: '#000'
                                  }}
                                  preload="metadata"
                                  onLoadStart={() => {
                                    setVideoLoadingStates(prev => ({ ...prev, [`${msg._id}-${idx}`]: true }));
                                  }}
                                  onCanPlay={() => {
                                    setVideoLoadingStates(prev => ({ ...prev, [`${msg._id}-${idx}`]: false }));
                                  }}
                                  onError={() => {
                                    setVideoLoadingStates(prev => ({ ...prev, [`${msg._id}-${idx}`]: false }));
                                    setVideoErrorStates(prev => ({ ...prev, [`${msg._id}-${idx}`]: true }));
                                  }}
                                />
                                {videoLoadingStates[`${msg._id}-${idx}`] && (
                                  <div style={{ 
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    bottom: 0,
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center',
                                    backgroundColor: 'rgba(0,0,0,0.7)',
                                    color: 'white',
                                    borderRadius: 8
                                  }}>
                                    Loading video...
                                  </div>
                                )}
                                {videoErrorStates[`${msg._id}-${idx}`] && (
                                  <div style={{ 
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    bottom: 0,
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center',
                                    backgroundColor: 'rgba(255,0,0,0.1)',
                                    flexDirection: 'column',
                                    borderRadius: 8
                                  }}>
                                    <div style={{ color: '#d32f2f', marginBottom: 8 }}>Video failed to load</div>
                                    <a 
                                      href={`http://localhost:5001${fileData.file}`} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      style={{ color: '#1976d2', textDecoration: 'underline' }}
                                    >
                                      Download video
                                    </a>
                                  </div>
                                )}
                                <div style={{ 
                                  fontSize: '12px', 
                                  color: '#666', 
                                  marginTop: '4px',
                                  wordBreak: 'break-word'
                                }}>
                                  {fileData.name || 'Video'}
                                </div>
                              </div>
                            ) : fileData.type === 'application/pdf' ? (
                              <div style={{ 
                                border: '1px solid #ddd', 
                                borderRadius: 8, 
                                padding: 12, 
                                backgroundColor: '#f9f9f9',
                                maxWidth: 250
                              }}>
                                <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                                  <span style={{ fontSize: 24, marginRight: 8 }}>📄</span>
                                  <span style={{ fontWeight: 'bold' }}>PDF Document</span>
                                </div>
                                <div style={{ fontSize: '12px', color: '#666', marginBottom: 8 }}>
                                  {fileData.name || 'Document'}
                                </div>
                                <a 
                                  href={`http://localhost:5001${fileData.file}`} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  style={{ 
                                    color: '#1976d2', 
                                    textDecoration: 'underline',
                                    fontSize: '12px'
                                  }}
                                >
                                  Open PDF
                                </a>
                              </div>
                            ) : fileData.type.startsWith('text/') ? (
                              <div style={{ 
                                border: '1px solid #ddd', 
                                borderRadius: 8, 
                                padding: 12, 
                                backgroundColor: '#f9f9f9',
                                maxWidth: 250
                              }}>
                                <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                                  <span style={{ fontSize: 24, marginRight: 8 }}>📝</span>
                                  <span style={{ fontWeight: 'bold' }}>Text File</span>
                                </div>
                                <div style={{ fontSize: '12px', color: '#666', marginBottom: 8 }}>
                                  {fileData.name || 'Text Document'}
                                </div>
                                <a 
                                  href={`http://localhost:5001${fileData.file}`} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  style={{ 
                                    color: '#1976d2', 
                                    textDecoration: 'underline',
                                    fontSize: '12px'
                                  }}
                                >
                                  View Text
                                </a>
                              </div>
                            ) : fileData.type.includes('word') || fileData.type.includes('document') ? (
                              <div style={{ 
                                border: '1px solid #ddd', 
                                borderRadius: 8, 
                                padding: 12, 
                                backgroundColor: '#f9f9f9',
                                maxWidth: 250
                              }}>
                                <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                                  <span style={{ fontSize: 24, marginRight: 8 }}>📄</span>
                                  <span style={{ fontWeight: 'bold' }}>Word Document</span>
                                </div>
                                <div style={{ fontSize: '12px', color: '#666', marginBottom: 8 }}>
                                  {fileData.name || 'Document'}
                                </div>
                                <a 
                                  href={`http://localhost:5001${fileData.file}`} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  style={{ 
                                    color: '#1976d2', 
                                    textDecoration: 'underline',
                                    fontSize: '12px'
                                  }}
                                >
                                  Download Document
                                </a>
                              </div>
                            ) : fileData.type.includes('excel') || fileData.type.includes('spreadsheet') ? (
                              <div style={{ 
                                border: '1px solid #ddd', 
                                borderRadius: 8, 
                                padding: 12, 
                                backgroundColor: '#f9f9f9',
                                maxWidth: 250
                              }}>
                                <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                                  <span style={{ fontSize: 24, marginRight: 8 }}>📊</span>
                                  <span style={{ fontWeight: 'bold' }}>Excel Spreadsheet</span>
                                </div>
                                <div style={{ fontSize: '12px', color: '#666', marginBottom: 8 }}>
                                  {fileData.name || 'Spreadsheet'}
                                </div>
                                <a 
                                  href={`http://localhost:5001${fileData.file}`} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  style={{ 
                                    color: '#1976d2', 
                                    textDecoration: 'underline',
                                    fontSize: '12px'
                                  }}
                                >
                                  Download Spreadsheet
                                </a>
                              </div>
                            ) : fileData.type.includes('powerpoint') || fileData.type.includes('presentation') ? (
                              <div style={{ 
                                border: '1px solid #ddd', 
                                borderRadius: 8, 
                                padding: 12, 
                                backgroundColor: '#f9f9f9',
                                maxWidth: 250
                              }}>
                                <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                                  <span style={{ fontSize: 24, marginRight: 8 }}>📈</span>
                                  <span style={{ fontWeight: 'bold' }}>PowerPoint Presentation</span>
                                </div>
                                <div style={{ fontSize: '12px', color: '#666', marginBottom: 8 }}>
                                  {fileData.name || 'Presentation'}
                                </div>
                                <a 
                                  href={`http://localhost:5001${fileData.file}`} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  style={{ 
                                    color: '#1976d2', 
                                    textDecoration: 'underline',
                                    fontSize: '12px'
                                  }}
                                >
                                  Download Presentation
                                </a>
                              </div>
                            ) : fileData.type.includes('zip') || fileData.type.includes('rar') || fileData.type.includes('archive') ? (
                              <div style={{ 
                                border: '1px solid #ddd', 
                                borderRadius: 8, 
                                padding: 12, 
                                backgroundColor: '#f9f9f9',
                                maxWidth: 250
                              }}>
                                <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                                  <span style={{ fontSize: 24, marginRight: 8 }}>📦</span>
                                  <span style={{ fontWeight: 'bold' }}>Compressed File</span>
                                </div>
                                <div style={{ fontSize: '12px', color: '#666', marginBottom: 8 }}>
                                  {fileData.name || 'Archive'}
                                </div>
                                <a 
                                  href={`http://localhost:5001${fileData.file}`} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  style={{ 
                                    color: '#1976d2', 
                                    textDecoration: 'underline',
                                    fontSize: '12px'
                                  }}
                                >
                                  Download Archive
                                </a>
                              </div>
                            ) : (
                              <div style={{ 
                                border: '1px solid #ddd', 
                                borderRadius: 8, 
                                padding: 12, 
                                backgroundColor: '#f9f9f9',
                                maxWidth: 250
                              }}>
                                <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                                  <span style={{ fontSize: 24, marginRight: 8 }}>📎</span>
                                  <span style={{ fontWeight: 'bold' }}>File</span>
                                </div>
                                <div style={{ fontSize: '12px', color: '#666', marginBottom: 8 }}>
                                  {fileData.name || 'File'}
                                </div>
                                <a 
                                  href={`http://localhost:5001${fileData.file}`} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  style={{ 
                                    color: '#1976d2', 
                                    textDecoration: 'underline',
                                    fontSize: '12px'
                                  }}
                                >
                                  Download File
                                </a>
                              </div>
                            )
                          ) : (
                            msg.content
                          )}
                        </div>
                      </Box>
                    </>
                  );
                })}
                {/* Dummy div for scroll-to-bottom */}
                <div ref={messagesEndRef} />
                {/* Typing indicator bubble */}
                {selectedUser && typingUsers.includes(selectedUser._id) && (
                  <Box display="flex" flexDirection="column" alignItems="flex-start" width="100%" sx={{ mb: 1 }}>
                    <span className="typing-dots" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 28 }}>
                      <span style={{
                        display: 'inline-block',
                        animation: 'typing-bubble 1s infinite',
                        animationDelay: '0s',
                        fontSize: 14,
                        fontWeight: 'bold',
                        color: darkMode ? '#fff' : '#222',
                        marginRight: 2
                      }}>●</span>
                      <span style={{
                        display: 'inline-block',
                        animation: 'typing-bubble 1s infinite',
                        animationDelay: '0.2s',
                        fontSize: 14,
                        fontWeight: 'bold',
                        color: darkMode ? '#fff' : '#222',
                        marginRight: 2
                      }}>●</span>
                      <span style={{
                        display: 'inline-block',
                        animation: 'typing-bubble 1s infinite',
                        animationDelay: '0.4s',
                        fontSize: 14,
                        fontWeight: 'bold',
                        color: darkMode ? '#fff' : '#222'
                      }}>●</span>
                    </span>
                  </Box>
                )}
              </Box>
            )
          )}
          {/* WhatsApp-style Message Input */}
          {(selectedUser || selectedGroup) && !isBlocked && (
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
          <Alert onClose={() => setError('')} severity="error" sx={{ maxWidth: 400, borderRadius: 2, mx: 'auto', boxShadow: 3 }} elevation={6} variant="filled">
            {error}
          </Alert>
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
                // Removed localStorage.setItem to prevent caching
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
                // Removed localStorage.setItem to prevent caching
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
        {/* New Chat Dialog */}
        <Dialog 
          open={showNewChatDialog} 
          onClose={() => setShowNewChatDialog(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 3,
              bgcolor: darkMode ? '#111' : '#fff',
              boxShadow: 8
            }
          }}
        >
          <DialogTitle sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1,
            borderBottom: `1px solid ${darkMode ? '#333' : '#eee'}`,
            pb: 2
          }}>
            <AddIcon sx={{ color: '#25d366' }} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              New Chat
            </Typography>
          </DialogTitle>
          <DialogContent sx={{ pt: 2 }}>
            <Box sx={{ mb: 2 }}>
              <TextField
                fullWidth
                placeholder="Search users..."
                value={newChatSearch}
                onChange={(e) => setNewChatSearch(e.target.value)}
                variant="outlined"
                size="small"
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                  sx: { borderRadius: 2 }
                }}
              />
            </Box>
            <Box sx={{ maxHeight: 400, overflowY: 'auto' }}>
              {availableUsers
                .filter(u => 
                  u.username && 
                  u.username.toLowerCase().includes(newChatSearch.toLowerCase())
                )
                .map(user => (
                  <ListItem
                    key={user._id}
                    button
                    onClick={() => {
                      console.log('Clicked user in New Chat dialog:', user);
                      const foundUser = users.find(convUser => convUser._id === user._id);
                      if (!foundUser) {
                        startNewChat(user);
                      } else {
                        setSelectedUser(foundUser);
                        setSelectedGroup(null);
                        setShowNewChatDialog(false);
                        console.log('User already in users list, set as selectedUser:', foundUser);
                      }
                    }}
                    sx={{
                      borderRadius: 2,
                      mb: 1,
                      '&:hover': {
                        bgcolor: darkMode ? '#222' : '#f5f5f5'
                      }
                    }}
                  >
                    <Avatar src={getFullUrl(user.avatar)} sx={{ mr: 2 }}>
                      {!user.avatar && user.username ? user.username[0] : null}
                    </Avatar>
                    <ListItemText
                      primary={user.username}
                      secondary={user.email}
                      primaryTypographyProps={{
                        fontWeight: 600,
                        color: darkMode ? '#fff' : 'inherit'
                      }}
                      secondaryTypographyProps={{
                        color: 'text.secondary'
                      }}
                    />
                  </ListItem>
                ))}
              {availableUsers.filter(u => 
                u.username && 
                u.username.toLowerCase().includes(newChatSearch.toLowerCase())
              ).length === 0 && (
                <Box display="flex" flexDirection="column" alignItems="center" py={4}>
                  <PersonIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="body1" color="text.secondary" align="center">
                    {newChatSearch ? 'No users found' : 'No users available'}
                  </Typography>
                </Box>
              )}
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2, pt: 0 }}>
            <Button 
              onClick={() => setShowNewChatDialog(false)}
              variant="outlined"
              sx={{ 
                borderRadius: 2,
                borderColor: '#25d366',
                color: '#25d366',
                '&:hover': {
                  borderColor: '#1da851',
                  color: '#1da851',
                  bgcolor: 'rgba(37, 211, 102, 0.04)'
                }
              }}
            >
              Cancel
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
      {snackbar && (
        <Snackbar open={!!snackbar && snackbar.open} autoHideDuration={6000} onClose={handleSnackbarClose}>
          <MuiAlert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
            {snackbar.message}
          </MuiAlert>
        </Snackbar>
      )}
    </ThemeProvider>
  );
}

export default App;
import React, { useState, useEffect, useRef } from 'react';
import { Box, IconButton, Avatar, Tooltip, Typography, Divider, ListItemIcon, Drawer, List, ListItem, ListItemText, Dialog, DialogTitle, DialogContent, DialogActions, Button, Tabs, Tab } from '@mui/material';
import ChatOutlinedIcon from '@mui/icons-material/ChatOutlined';
import CallOutlinedIcon from '@mui/icons-material/CallOutlined';
import DonutLargeOutlinedIcon from '@mui/icons-material/DonutLargeOutlined';
import StarBorderOutlinedIcon from '@mui/icons-material/StarBorderOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import LogoutIcon from '@mui/icons-material/Logout';
import EditIcon from '@mui/icons-material/Edit';
import EditProfileDialog from './EditProfileDialog';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import MenuIcon from '@mui/icons-material/Menu';
import Badge from '@mui/material/Badge';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';
import PaletteOutlinedIcon from '@mui/icons-material/PaletteOutlined';
import TuneOutlinedIcon from '@mui/icons-material/TuneOutlined';
import { useTheme } from '@mui/material/styles';
import PhotoCameraOutlinedIcon from '@mui/icons-material/PhotoCameraOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import ImageCropDialog from './ImageCropDialog';
import Slider from '@mui/material/Slider';
import SocialXIcon from './SocialXIcon';
import TextField from '@mui/material/TextField';
import CircularProgress from '@mui/material/CircularProgress';
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import Select from '@mui/material/Select';
import { useTranslation } from 'react-i18next';
import i18n from './i18n';
import InputBase from '@mui/material/InputBase';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import SettingsIcon from '@mui/icons-material/Settings';
import StarIcon from '@mui/icons-material/Star';
import Skeleton from '@mui/material/Skeleton';
import Fade from '@mui/material/Fade';
import { styled } from '@mui/material/styles';
import SeasonalThemeSelector from './SeasonalThemeSelector';
import AdvancedPersonalization from './AdvancedPersonalization';
import MoodThemeSelector from './MoodThemeSelector';

// TabPanel component
function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`personalization-tabpanel-${index}`}
      aria-labelledby={`personalization-tab-${index}`}
      {...other}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

const getFullUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return `http://localhost:5000${url}`;
};

// Styled chat item for hover/scale effect
const ChatItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(1.5, 2),
  borderRadius: theme.shape.borderRadius * 2,
  margin: theme.spacing(0.5, 1),
  transition: 'background 0.2s, transform 0.2s',
  cursor: 'pointer',
  boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
  '&:hover': {
    background: 'rgba(37,211,102,0.08)',
    transform: 'scale(1.025)',
  },
}));

const Sidebar = ({ user, darkMode, setDarkMode, onNav, onLogout, onProfileEdit, nav, unreadChatsCount, onNotificationSettings, onDeleteAccount, fetchUserProfile, seasonalTheme = 'auto', setSeasonalTheme = () => {}, getCurrentSeason = () => 'spring' }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [editOpen, setEditOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [avatarMenuAnchorEl, setAvatarMenuAnchorEl] = useState(null);
  const [viewImageOpen, setViewImageOpen] = useState(false);
  const [imageToCrop, setImageToCrop] = useState(null);
  const theme = useTheme();
  const fileInputRef = React.useRef(null);
  const [generalDialogOpen, setGeneralDialogOpen] = useState(false);
  const { t } = useTranslation();
  const [selectedLanguage, setSelectedLanguage] = useState(i18n.language === 'hi' ? 'Hindi' : 'English');
  const [fontSize, setFontSize] = useState(16);
  const [accountDialogOpen, setAccountDialogOpen] = useState(false);
  const [changePasswordDialogOpen, setChangePasswordDialogOpen] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [appLockEnabled, setAppLockEnabled] = useState(() => localStorage.getItem('applock_enabled') === 'true');
  const [resetPinDialogOpen, setResetPinDialogOpen] = useState(false);
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [resetError, setResetError] = useState('');
  const [appLockTimeout, setAppLockTimeout] = useState(() => {
    const stored = localStorage.getItem('applock_timeout');
    return stored ? parseInt(stored, 10) : 2000;
  });
  const [chatMenuOpen, setChatMenuOpen] = useState(false);
  const [chatTab, setChatTab] = useState(0);
  const [chatSearch, setChatSearch] = useState('');
  const [personalizationDialogOpen, setPersonalizationDialogOpen] = useState(false);
  const [personalizationTab, setPersonalizationTab] = useState(0);

  const handleAvatarClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleAvatarMenuOpen = (event) => {
    setAvatarMenuAnchorEl(event.currentTarget);
  };

  const handleAvatarMenuClose = () => {
    setAvatarMenuAnchorEl(null);
  };

  const handleRemoveImage = () => {
    if (user) {
      onProfileEdit({ ...user, avatar: '' }, null);
    }
    handleAvatarMenuClose();
  };

  const handleChangeImage = () => {
    fileInputRef.current.click();
    handleAvatarMenuClose();
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.addEventListener('load', () => setImageToCrop(reader.result?.toString() || ''));
      reader.readAsDataURL(file);
    }
    event.target.value = '';
  };

  const handleCropComplete = (croppedImageBlob) => {
    setImageToCrop(null);
    if (croppedImageBlob && user) {
      const croppedImageFile = new File([croppedImageBlob], "avatar.jpg", { type: "image/jpeg" });
      const localUrl = URL.createObjectURL(croppedImageFile);
      onProfileEdit({ ...user, avatar: localUrl }, croppedImageFile);
    }
  };

  const handleGeneralClick = () => {
    setGeneralDialogOpen(true);
  };

  const handleChangePassword = () => {
    setChangePasswordDialogOpen(true);
  };

  const handleToggleAppLock = () => {
    const newValue = !appLockEnabled;
    setAppLockEnabled(newValue);
    localStorage.setItem('applock_enabled', newValue);
    if (!newValue) {
      // Optionally clear PIN when disabling
      // localStorage.removeItem('lockscreen_pin');
    }
  };

  const handleResetPin = (e) => {
    e.preventDefault();
    const prevPin = localStorage.getItem('lockscreen_pin') || '';
    if (newPin.length !== 4 || /\D/.test(newPin)) {
      setResetError('PIN must be 4 digits.');
      return;
    }
    if (newPin !== confirmPin) {
      setResetError('PINs do not match.');
      return;
    }
    if (newPin === prevPin) {
      setResetError('Enter a new PIN');
      return;
    }
    localStorage.setItem('lockscreen_pin', newPin);
    setResetPinDialogOpen(false);
    setNewPin('');
    setConfirmPin('');
    setResetError('');
  };

  const handleTimeoutChange = (e) => {
    setAppLockTimeout(e.target.value);
    localStorage.setItem('applock_timeout', e.target.value);
  };

  return (
    <Box position="relative" display="flex" flexDirection="column" alignItems={expanded ? 'flex-start' : 'center'}
      bgcolor={darkMode ? '#000' : '#f5f5f5'}
      height="100%"
      width={expanded ? 180 : 56}
      minWidth={expanded ? 180 : 56}
      py={2}
      boxShadow={darkMode ? 4 : 2}
      sx={{
        transition: 'width 0.2s',
        overflow: 'hidden',
        borderRadius: 0,
        borderTopLeftRadius: 0,
        borderRight: darkMode ? '1.5px solid #222' : '1.5px solid #e0e0e0',
        borderTop: 0,
        '::-webkit-scrollbar': { display: 'none' },
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
        background: darkMode ? '#000' : undefined
      }}
    >
      <IconButton onClick={() => setExpanded(e => !e)} sx={{ mb: 2, alignSelf: expanded ? 'flex-start' : 'center', color: darkMode ? '#aebac1' : '#222' }}>
        <MenuIcon fontSize="small" />
      </IconButton>
      
      <Box display="flex" flexDirection="column" alignItems={expanded ? 'flex-start' : 'center'} gap={0} mt={1} sx={{ width: '100%' }}>
        <Tooltip title="Chats" placement="right">
          <Box display="flex" alignItems="center" width={expanded ? '100%' : 'auto'}>
            <IconButton
              onClick={() => {
                onNav('chats');
              }}
              sx={{
                color: nav === 'chats' ? '#25d366' : (darkMode ? '#aebac1' : '#222'),
                background: nav === 'chats' ? (darkMode ? 'rgba(37,211,102,0.08)' : 'rgba(37,211,102,0.08)') : 'none',
                width: 40,
                height: 40,
                borderRadius: 2,
                boxShadow: nav === 'chats' ? 2 : 0,
                position: 'relative',
              }}
            >
              <ChatOutlinedIcon fontSize="small" />
              {unreadChatsCount > 0 && (
                <Box position="absolute" top={2} right={2} bgcolor="#25d366" color="#fff" borderRadius="50%" minWidth={16} height={16} display="flex" alignItems="center" justifyContent="center" fontSize={11} fontWeight={700} px={0.5} boxShadow={2}>
                  {unreadChatsCount}
                </Box>
              )}
            </IconButton>
            {expanded && <Typography ml={1} sx={{ color: darkMode ? '#fff' : 'inherit', fontWeight: nav === 'chats' ? 700 : 400 }}>Chats</Typography>}
          </Box>
        </Tooltip>
        <Tooltip title="Calls" placement="right">
          <Box display="flex" alignItems="center" width={expanded ? '100%' : 'auto'}>
            <IconButton
              onClick={() => {
                onNav('calls');
              }}
              sx={{
                color: nav === 'calls' ? '#25d366' : (darkMode ? '#aebac1' : '#222'),
                background: nav === 'calls' ? (darkMode ? 'rgba(37,211,102,0.08)' : 'rgba(37,211,102,0.08)') : 'none',
                width: 40,
                height: 40,
                borderRadius: 2,
                boxShadow: nav === 'calls' ? 2 : 0,
              }}
            >
              <CallOutlinedIcon fontSize="small" />
            </IconButton>
            {expanded && <Typography ml={1} sx={{ color: darkMode ? '#fff' : 'inherit', fontWeight: nav === 'calls' ? 700 : 400 }}>Calls</Typography>}
          </Box>
        </Tooltip>
        <Tooltip title="Status" placement="right">
          <Box display="flex" alignItems="center" width={expanded ? '100%' : 'auto'}>
            <IconButton
              onClick={() => {
                onNav('status');
              }}
              sx={{
                color: nav === 'status' ? '#25d366' : (darkMode ? '#aebac1' : '#222'),
                background: nav === 'status' ? (darkMode ? 'rgba(37,211,102,0.08)' : 'rgba(37,211,102,0.08)') : 'none',
                width: 40,
                height: 40,
                borderRadius: 2,
                boxShadow: nav === 'status' ? 2 : 0,
              }}
            >
              <Badge variant="dot" color="success" overlap="circular" anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
                <DonutLargeOutlinedIcon fontSize="small" />
              </Badge>
            </IconButton>
            {expanded && <Typography ml={1} sx={{ color: darkMode ? '#fff' : 'inherit', fontWeight: nav === 'status' ? 700 : 400 }}>Status</Typography>}
          </Box>
        </Tooltip>
        <Divider sx={{ width: expanded ? '100%' : '80%', my: 1, borderColor: darkMode ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)' }} />
      </Box>
      <Box sx={{ flex: 1 }} />
      {/* Bottom group: Favorite, Trash, Settings */}
      <Box display="flex" flexDirection="column" alignItems={expanded ? 'flex-start' : 'center'} sx={{ width: '100%' }}>
        <Tooltip title="Favorite" placement="right">
          <Box display="flex" alignItems="center" width={expanded ? '100%' : 'auto'}>
            <IconButton onClick={() => onNav('favorite')} sx={{ color: nav === 'favorite' ? '#25d366' : (darkMode ? '#aebac1' : '#222'), background: nav === 'favorite' ? (darkMode ? 'rgba(37,211,102,0.08)' : 'rgba(37,211,102,0.08)') : 'none', width: 40, height: 40, borderRadius: 2, boxShadow: nav === 'favorite' ? 2 : 0 }}>
              <StarBorderOutlinedIcon fontSize="small" />
            </IconButton>
            {expanded && <Typography ml={1} sx={{ color: darkMode ? '#fff' : 'inherit', fontWeight: nav === 'favorite' ? 700 : 400 }}>Favorite</Typography>}
          </Box>
        </Tooltip>
        <Tooltip title="Trash" placement="right">
          <Box display="flex" alignItems="center" width={expanded ? '100%' : 'auto'}>
            <IconButton onClick={() => onNav('trash')} sx={{ color: nav === 'trash' ? '#25d366' : (darkMode ? '#aebac1' : '#222'), background: nav === 'trash' ? (darkMode ? 'rgba(37,211,102,0.08)' : 'rgba(37,211,102,0.08)') : 'none', width: 40, height: 40, borderRadius: 2, boxShadow: nav === 'trash' ? 2 : 0 }}>
              <DeleteOutlineOutlinedIcon fontSize="small" />
            </IconButton>
            {expanded && <Typography ml={1} sx={{ color: darkMode ? '#fff' : 'inherit', fontWeight: nav === 'trash' ? 700 : 400 }}>Trash</Typography>}
          </Box>
        </Tooltip>
        {/* Divider between Trash and Settings */}
        <Divider sx={{ width: expanded ? '100%' : '80%', my: 1, borderColor: darkMode ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)' }} />
        <Tooltip title="Settings" placement="right">
          <Box display="flex" alignItems="center" width={expanded ? '100%' : 'auto'}>
            <IconButton onClick={e => { onNav('settings'); handleAvatarClick(e); }} sx={{ color: nav === 'settings' ? '#25d366' : (darkMode ? '#aebac1' : '#222'), background: nav === 'settings' ? (darkMode ? 'rgba(37,211,102,0.08)' : 'rgba(37,211,102,0.08)') : 'none', width: 40, height: 40, borderRadius: 2, boxShadow: nav === 'settings' ? 2 : 0 }}>
              <SettingsOutlinedIcon fontSize="small" />
            </IconButton>
            {expanded && <Typography ml={1} sx={{ color: darkMode ? '#fff' : 'inherit', fontWeight: nav === 'settings' ? 700 : 400 }}>Settings</Typography>}
          </Box>
        </Tooltip>
      </Box>
      {/* Avatar slightly above the bottom */}
      <Box sx={{ p: -1, width: '100%', mb: -1 }}>
        <Tooltip title="Profile" placement="right">
          <Box display="flex" alignItems="center" sx={{ width: expanded ? '100%' : 'auto', justifyContent: expanded ? 'flex-start' : 'center', mt: 2 }}>
            <IconButton onClick={handleAvatarClick} sx={{ p: 0, borderRadius: '50%' }}>
              <Avatar
                src={
                  user?.avatar
                    ? user.avatar.startsWith('blob:')
                      ? user.avatar
                      : getFullUrl(user.avatar)
                    : undefined
                }
                alt={user?.username}
                sx={{ width: 40, height: 40 }}
              >
                {!user?.avatar && user?.username?.[0]}
              </Avatar>
            </IconButton>
            {expanded && <Typography sx={{ color: darkMode ? '#fff' : 'inherit', ml: 1 }}>Profile</Typography>}
          </Box>
        </Tooltip>
      </Box>

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose} PaperProps={{ sx: { minWidth: 320, borderRadius: 3, boxShadow: 6, bgcolor: darkMode ? '#000' : '#fff' } }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            bgcolor: darkMode ? '#000' : '#fff',
            p: 4,
            pb: 3,
            maxWidth: 320,
            mx: 'auto',
            mt: -3,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              mb: 1.5,
            }}
          >
            <Avatar
              onMouseEnter={handleAvatarMenuOpen}
              src={
                user?.avatar
                  ? user.avatar.startsWith('blob:')
                    ? user.avatar
                    : getFullUrl(user.avatar)
                  : undefined
              }
              alt={user?.username}
              sx={{ width: 64, height: 64, cursor: 'pointer' }}
            >
              {!user?.avatar && user?.username?.[0]}
            </Avatar>
          </Box>
          <Typography fontWeight={600} variant="h6" align="center">{user?.username}</Typography>
          <Typography variant="body2" color="textSecondary" align="center">{user?.email}</Typography>
        </Box>
        <Divider />
        <Menu
          anchorEl={avatarMenuAnchorEl}
          open={Boolean(avatarMenuAnchorEl)}
          onClose={handleAvatarMenuClose}
          PaperProps={{
            sx: {
              bgcolor: 'grey.800',
              color: 'white',
              borderRadius: 2,
              boxShadow: 3,
            },
          }}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'center',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'center',
          }}
        >
          {user?.avatar && (
            <MenuItem onClick={() => { setViewImageOpen(true); handleAvatarMenuClose(); }}>Show Image</MenuItem>
          )}
          <MenuItem onClick={handleChangeImage}>{user?.avatar ? 'Change Image' : 'Add Image'}</MenuItem>
          {user?.avatar && (
            <MenuItem onClick={handleRemoveImage}>Remove Image</MenuItem>
          )}
        </Menu>
        <MenuItem onClick={() => { setDarkMode(!darkMode); handleMenuClose(); }} sx={{ mb: 1 }}>
          <ListItemIcon>{darkMode ? <Brightness7Icon /> : <Brightness4Icon />}</ListItemIcon>
          Theme
        </MenuItem>
        <MenuItem onClick={() => { setEditOpen(true); }} sx={{ mb: 1 }}>
          <ListItemIcon><EditIcon /></ListItemIcon>
          Edit Profile
        </MenuItem>
        <MenuItem onClick={() => setResetPinDialogOpen(true)} sx={{ mb: 1 }}>
          <ListItemIcon><LockIcon sx={{ color: appLockEnabled ? '#25d366' : 'inherit' }} /></ListItemIcon>
          App Lock
        </MenuItem>
        <MenuItem onClick={handleGeneralClick}>
          <ListItemIcon><TuneOutlinedIcon /></ListItemIcon>
          General
        </MenuItem>
        <MenuItem onClick={() => setAccountDialogOpen(true)}>
          <ListItemIcon><AccountCircleOutlinedIcon /></ListItemIcon>
          Account
        </MenuItem>
        <MenuItem onClick={() => setChatMenuOpen(true)} sx={{ mb: 1 }}>
          <ListItemIcon><ChatOutlinedIcon /></ListItemIcon>
          Chat
        </MenuItem>
        <MenuItem onClick={() => { onNotificationSettings(); handleMenuClose(); }} sx={{ mb: 1 }}>
          <ListItemIcon><NotificationsNoneOutlinedIcon /></ListItemIcon>
          Notification
        </MenuItem>
        <MenuItem onClick={() => { setPersonalizationDialogOpen(true); }} sx={{ mb: 1 }}>
          <ListItemIcon><PaletteOutlinedIcon /></ListItemIcon>
          Personalization
        </MenuItem>
        <MenuItem onClick={() => { onLogout(); handleMenuClose(); }}>
          <ListItemIcon><LogoutIcon color="error" /></ListItemIcon>
          <Typography color="error">Logout</Typography>
        </MenuItem>
      </Menu>
      <EditProfileDialog open={editOpen} onClose={() => setEditOpen(false)} user={user} onSave={onProfileEdit} />
      <Dialog open={viewImageOpen} onClose={() => setViewImageOpen(false)} maxWidth="sm" fullWidth>
        <DialogContent sx={{ p: 0, position: 'relative' }}>
          <img src={getFullUrl(user?.avatar)} alt={user?.username} style={{ width: '100%', height: 'auto' }} />
        </DialogContent>
      </Dialog>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: 'none' }}
        accept="image/*"
      />
      <ImageCropDialog
        open={!!imageToCrop}
        onClose={() => setImageToCrop(null)}
        imageSrc={imageToCrop}
        onCropComplete={handleCropComplete}
      />
      <Dialog open={generalDialogOpen} onClose={() => setGeneralDialogOpen(false)}>
        <DialogTitle>{t('General Settings')}</DialogTitle>
        <DialogContent>
          <Typography variant="subtitle1" sx={{ mb: 2 }}>{t('Language')}</Typography>
          <Button
            variant={selectedLanguage === 'English' ? 'contained' : 'outlined'}
            onClick={() => {
              setSelectedLanguage('English');
              i18n.changeLanguage('en');
            }}
            sx={{
              mr: 1,
              color: selectedLanguage === 'English' ? '#fff' : '#25d366',
              borderColor: '#25d366',
              backgroundColor: selectedLanguage === 'English' ? '#25d366' : 'transparent',
              '&:hover': { backgroundColor: '#25d366', color: '#fff' }
            }}
          >
            {t('ENGLISH')}
          </Button>
          <Button
            variant={selectedLanguage === 'Hindi' ? 'contained' : 'outlined'}
            onClick={() => {
              setSelectedLanguage('Hindi');
              i18n.changeLanguage('hi');
            }}
            sx={{
              color: selectedLanguage === 'Hindi' ? '#fff' : '#25d366',
              borderColor: '#25d366',
              backgroundColor: selectedLanguage === 'Hindi' ? '#25d366' : 'transparent',
              '&:hover': { backgroundColor: '#25d366', color: '#fff' }
            }}
          >
            {t('HINDI')}
          </Button>
          <Typography variant="subtitle1" sx={{ mt: 3, mb: 1 }}>{t('Font Size')}</Typography>
          <Slider
            value={fontSize}
            min={12}
            max={24}
            step={1}
            onChange={(_, value) => setFontSize(value)}
            valueLabelDisplay="auto"
            sx={{
              width: 200,
              color: '#25d366',
              '& .MuiSlider-thumb': { borderColor: '#25d366' },
              '& .MuiSlider-track': { backgroundColor: '#25d366' },
              '& .MuiSlider-rail': { backgroundColor: '#b7f5d8' }
            }}
          />
          <Typography variant="body2">{t('Preview')} <span style={{ fontSize }}>{t('Preview: This is a preview.')}</span></Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setGeneralDialogOpen(false)}
            sx={{ color: '#25d366' }}
          >
            {t('CLOSE')}
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={accountDialogOpen} onClose={() => setAccountDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Account Settings</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', pt: 3 }}>
          <Avatar
            src={user?.avatar ? (user.avatar.startsWith('blob:') ? user.avatar : getFullUrl(user.avatar)) : undefined}
            alt={user?.username}
            sx={{ width: 80, height: 80, mb: 2 }}
          >
            {!user?.avatar && user?.username?.[0]}
          </Avatar>
          <Typography fontWeight={600} variant="h6" align="center">{user?.username}</Typography>
          <Typography variant="body2" color="textSecondary" align="center" sx={{ mb: 2 }}>{user?.email}</Typography>
          <Divider sx={{ width: '100%', my: 2, borderColor: 'rgba(255,255,255,0.12)' }} />
          <Button
            variant="outlined"
            fullWidth
            sx={{ color: '#25d366', borderColor: '#25d366', mb: 2, fontWeight: 600 }}
            onClick={handleChangePassword}
          >
            CHANGE PASSWORD
          </Button>
          <Typography variant="subtitle2" sx={{ alignSelf: 'flex-start', mt: 1, mb: 0.5 }}>Security</Typography>
          <Typography variant="body2" sx={{ alignSelf: 'flex-start', mb: 1 }}>
            Password last changed: {user?.passwordChangedAt ? new Date(user.passwordChangedAt).toLocaleString() : 'N/A'}
          </Typography>
          <Divider sx={{ width: '100%', my: 2, borderColor: 'rgba(255,255,255,0.12)' }} />
          <Box display="flex" alignItems="center" justifyContent="space-between" width="100%" mb={1}>
            <Typography variant="body1" fontWeight={500}>App Lock</Typography>
            <Button
              variant={appLockEnabled ? 'contained' : 'outlined'}
              startIcon={appLockEnabled ? <LockIcon /> : <LockOpenIcon />}
              sx={{ backgroundColor: appLockEnabled ? '#25d366' : undefined, color: appLockEnabled ? '#fff' : '#25d366', borderColor: '#25d366', fontWeight: 600, minWidth: 120, '&:hover': { backgroundColor: appLockEnabled ? '#1da851' : undefined } }}
              onClick={handleToggleAppLock}
            >
              {appLockEnabled ? 'Disable' : 'Enable'}
            </Button>
          </Box>
          <Box display="flex" alignItems="center" justifyContent="space-between" width="100%" mb={2}>
            <Typography variant="body2" fontWeight={500}>Auto-lock after inactivity</Typography>
            <Select
              value={appLockTimeout}
              onChange={handleTimeoutChange}
              size="small"
              sx={{
                bgcolor: darkMode ? '#111' : '#fff',
                color: darkMode ? '#fff' : 'inherit',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#25d366 !important',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#25d366 !important',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#25d366 !important',
                },
              }}
              MenuProps={{
                PaperProps: {
                  sx: {
                    bgcolor: darkMode ? '#333' : '#333',
                    '& .MuiMenuItem-root.Mui-selected': {
                      bgcolor: '#25d366',
                      color: '#fff',
                      '&:hover': {
                        bgcolor: '#1ea952',
                      },
                    },
                  },
                },
              }}
              disabled={!appLockEnabled}
            >
              <MenuItem value={60000}>1 minute</MenuItem>
              <MenuItem value={120000}>2 minutes</MenuItem>
              <MenuItem value={300000}>5 minutes</MenuItem>
              <MenuItem value={900000}>15 minutes</MenuItem>
              <MenuItem value={1800000}>30 minutes</MenuItem>
              <MenuItem value={3600000}>1 hour</MenuItem>
              <MenuItem value={7200000}>2 hours</MenuItem>
              <MenuItem value={18000000}>5 hours</MenuItem>
            </Select>
          </Box>
          {appLockEnabled && (
            <Button
              variant="outlined"
              fullWidth
              sx={{ color: '#e53935', borderColor: '#e53935', fontWeight: 600, mb: 2, mt: 1 }}
              onClick={() => setResetPinDialogOpen(true)}
            >
              Reset PIN
            </Button>
          )}
          <Divider sx={{ width: '100%', my: 2, borderColor: 'rgba(255,255,255,0.12)' }} />
          <Button
            variant="contained"
            fullWidth
            sx={{ backgroundColor: '#f44336', color: '#fff', fontWeight: 600, mb: 2, '&:hover': { backgroundColor: '#d32f2f' } }}
            onClick={() => setDeleteDialogOpen(true)}
          >
            DELETE ACCOUNT
          </Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAccountDialogOpen(false)} sx={{ color: '#25d366', fontWeight: 600 }}>CLOSE</Button>
        </DialogActions>
      </Dialog>
      <Dialog open={changePasswordDialogOpen} onClose={() => setChangePasswordDialogOpen(false)}>
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent>
          <TextField
            label="Current Password"
            type="password"
            fullWidth
            margin="normal"
            value={oldPassword}
            onChange={e => setOldPassword(e.target.value)}
          />
          <TextField
            label="New Password"
            type="password"
            fullWidth
            margin="normal"
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
          />
          <TextField
            label="Confirm New Password"
            type="password"
            fullWidth
            margin="normal"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
          />
          {passwordError && <Typography color="error">{passwordError}</Typography>}
          {passwordSuccess && <Typography color="success.main">{passwordSuccess}</Typography>}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setChangePasswordDialogOpen(false)} sx={{ color: '#25d366' }}>Cancel</Button>
          <Button
            variant="contained"
            sx={{ backgroundColor: '#25d366', color: '#fff' }}
            onClick={async () => {
              setPasswordError('');
              setPasswordSuccess('');
              if (!oldPassword || !newPassword || !confirmPassword) {
                setPasswordError('All fields are required.');
                return;
              }
              if (newPassword !== confirmPassword) {
                setPasswordError('New passwords do not match.');
                return;
              }
              // Password strength check
              const strong = /[A-Z]/.test(newPassword) && /[^A-Za-z0-9]/.test(newPassword) && newPassword.length >= 8;
              if (!strong) {
                setPasswordError('Password must be at least 8 characters, contain an uppercase letter and a special character.');
                return;
              }
              try {
                const token = localStorage.getItem('token');
                const res = await fetch('http://localhost:5000/api/auth/change-password', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                  },
                  body: JSON.stringify({
                    oldPassword,
                    newPassword
                  })
                });
                const data = await res.json();
                if (!res.ok) {
                  setPasswordError(data.message || 'Failed to change password.');
                } else {
                  setPasswordSuccess('Password changed successfully!');
                  setOldPassword('');
                  setNewPassword('');
                  setConfirmPassword('');
                  if (user) {
                    user.passwordChangedAt = new Date().toISOString();
                    localStorage.setItem('user', JSON.stringify(user));
                  }
                  await fetchUserProfile();
                  setTimeout(() => setChangePasswordDialogOpen(false), 1500);
                }
              } catch (err) {
                setPasswordError('Server error. Please try again.');
              }
            }}
          >
            Change Password
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Account Deletion</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete your account? Your account will be scheduled for deletion in 7 days. You can cancel this by logging in again before the deletion date.</Typography>
          {deleteError && <Typography color="error" sx={{ mt: 2 }}>{deleteError}</Typography>}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} disabled={deleteLoading} sx={{ color: '#25d366' }}>Cancel</Button>
          <Button
            onClick={async () => {
              setDeleteLoading(true);
              setDeleteError('');
              try {
                const token = localStorage.getItem('token');
                const res = await fetch('http://localhost:5000/api/auth/delete-account', {
                  method: 'DELETE',
                  headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await res.json();
                if (!res.ok) {
                  setDeleteError(data.message || 'Failed to schedule account deletion.');
                } else {
                  // Log out user and reload app
                  localStorage.removeItem('token');
                  localStorage.removeItem('user');
                  window.location.reload();
                }
              } catch (err) {
                setDeleteError('Server error. Please try again.');
              }
              setDeleteLoading(false);
            }}
            color="error"
            variant="contained"
            disabled={deleteLoading}
          >
            {deleteLoading ? 'Processing...' : 'Confirm & Schedule Deletion'}
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={resetPinDialogOpen} onClose={() => setResetPinDialogOpen(false)} PaperProps={{ sx: { bgcolor: darkMode ? '#000' : '#fff', minWidth: 320 } }}>
        <DialogTitle sx={{ color: darkMode ? '#fff' : 'inherit' }}>App Lock Settings</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography sx={{ color: darkMode ? '#fff' : 'inherit' }}>Enable App Lock</Typography>
              <IconButton onClick={handleToggleAppLock} sx={{ color: appLockEnabled ? '#25d366' : (darkMode ? '#aebac1' : '#666') }}>
                {appLockEnabled ? <LockIcon /> : <LockOpenIcon />}
              </IconButton>
            </Box>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Typography sx={{ color: darkMode ? '#fff' : 'inherit' }}>Auto-lock after</Typography>
              <Select
                value={appLockTimeout}
                onChange={handleTimeoutChange}
                size="small"
                sx={{
                  bgcolor: darkMode ? '#111' : '#fff',
                  color: darkMode ? '#fff' : 'inherit',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#25d366 !important',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#25d366 !important',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#25d366 !important',
                  },
                }}
                MenuProps={{
                  PaperProps: {
                    sx: {
                      bgcolor: darkMode ? '#333' : '#333',
                      '& .MuiMenuItem-root.Mui-selected': {
                        bgcolor: '#25d366',
                        color: '#fff',
                        '&:hover': {
                          bgcolor: '#1ea952',
                        },
                      },
                    },
                  },
                }}
              >
                <MenuItem value={60000}>1 minute</MenuItem>
                <MenuItem value={120000}>2 minutes</MenuItem>
                <MenuItem value={300000}>5 minutes</MenuItem>
                <MenuItem value={900000}>15 minutes</MenuItem>
                <MenuItem value={1800000}>30 minutes</MenuItem>
                <MenuItem value={3600000}>1 hour</MenuItem>
                <MenuItem value={7200000}>2 hours</MenuItem>
                <MenuItem value={18000000}>5 hours</MenuItem>
              </Select>
            </Box>

            <form onSubmit={handleResetPin}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  label="New PIN"
                  type="password"
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value)}
                  error={Boolean(resetError)}
                  inputProps={{ maxLength: 4, inputMode: 'numeric', pattern: '[0-9]*' }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      bgcolor: darkMode ? '#111' : '#fff',
                      '& fieldset': {
                        borderColor: darkMode ? '#333' : 'rgba(0, 0, 0, 0.23)',
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: darkMode ? '#aebac1' : 'inherit',
                    },
                    '& input': {
                      color: darkMode ? '#fff' : 'inherit',
                    },
                  }}
                />
                <TextField
                  label="Confirm PIN"
                  type="password"
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value)}
                  error={Boolean(resetError)}
                  helperText={resetError}
                  inputProps={{ maxLength: 4, inputMode: 'numeric', pattern: '[0-9]*' }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      bgcolor: darkMode ? '#111' : '#fff',
                      '& fieldset': {
                        borderColor: darkMode ? '#333' : 'rgba(0, 0, 0, 0.23)',
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: darkMode ? '#aebac1' : 'inherit',
                    },
                    '& input': {
                      color: darkMode ? '#fff' : 'inherit',
                    },
                    '& .MuiFormHelperText-root': {
                      color: '#f44336',
                    },
                  }}
                />
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 3 }}>
                <Button onClick={() => {
                  setResetPinDialogOpen(false);
                  setNewPin('');
                  setConfirmPin('');
                  setResetError('');
                }} sx={{ color: '#25d366' }}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  sx={{
                    bgcolor: '#25d366',
                    '&:hover': { bgcolor: '#1fab54' },
                  }}
                >
                  Save
                </Button>
              </Box>
            </form>
          </Box>
        </DialogContent>
      </Dialog>
      <Dialog
        open={chatMenuOpen}
        onClose={() => setChatMenuOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            backdropFilter: 'blur(16px)',
            bgcolor: 'rgba(30,30,30,0.85)',
            borderRadius: 4,
            boxShadow: 8,
            overflow: 'hidden',
            transition: 'all 0.3s cubic-bezier(.4,2,.6,1)',
          }
        }}
        TransitionComponent={Fade}
        transitionDuration={400}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, bgcolor: 'transparent', borderBottom: 'none', pb: 0 }}>
          <SearchIcon sx={{ mr: 1, color: '#25d366' }} />
          <InputBase
            placeholder="Search chats..."
            value={chatSearch}
            onChange={e => setChatSearch(e.target.value)}
            sx={{ flex: 1, color: '#fff', fontSize: 16, bgcolor: 'rgba(255,255,255,0.05)', px: 1.5, borderRadius: 2 }}
            autoFocus
          />
        </DialogTitle>
        <Tabs
          value={chatTab}
          onChange={(_, v) => setChatTab(v)}
          variant="fullWidth"
          TabIndicatorProps={{ style: { backgroundColor: '#25d366', height: 4, borderRadius: 2 } }}
          textColor="inherit"
          sx={{
            bgcolor: 'rgba(255,255,255,0.04)',
            borderRadius: 2,
            mt: 1,
            mb: 0.5,
            '& .MuiTab-root': {
              color: '#aaa',
              fontWeight: 600,
              fontSize: 16,
              transition: 'color 0.2s',
            },
            '& .Mui-selected': {
              color: '#25d366',
            },
          }}
        >
          <Tab label="All" />
          <Tab label="Unread" />
          <Tab label="Groups" />
          <Tab label={<StarIcon fontSize="small" sx={{ mb: '-2px' }} />} />
        </Tabs>
        <DialogContent sx={{ p: 0, minHeight: 320, maxHeight: 400, overflowY: 'auto', bgcolor: 'transparent' }}>
          {/* Loading skeletons (simulate loading state) */}
          {false ? (
            Array.from({ length: 5 }).map((_, i) => (
              <ChatItem key={i}>
                <Skeleton variant="circular" width={40} height={40} sx={{ mr: 2, bgcolor: 'grey.800' }} />
                <Box flex={1}>
                  <Skeleton width="60%" height={18} sx={{ bgcolor: 'grey.800', mb: 1 }} />
                  <Skeleton width="80%" height={14} sx={{ bgcolor: 'grey.800' }} />
                </Box>
                <Skeleton variant="rectangular" width={24} height={24} sx={{ borderRadius: 2, bgcolor: 'grey.800', ml: 2 }} />
              </ChatItem>
            ))
          ) : (
            // Mock chat data for demo
            [
              { name: 'John Doe', lastMsg: 'See you soon!', time: '2m ago', unread: 2, pinned: true, online: true, avatar: '', typing: false },
              { name: 'Family Group', lastMsg: 'Dinner at 8?', time: '10m ago', unread: 0, pinned: false, online: false, avatar: '', typing: false },
              { name: 'Jane Smith', lastMsg: 'Typing...', time: 'now', unread: 1, pinned: false, online: true, avatar: '', typing: true },
              { name: 'Work', lastMsg: 'Project update sent.', time: '1h ago', unread: 0, pinned: true, online: false, avatar: '', typing: false },
              { name: 'Alex', lastMsg: '👍', time: '3h ago', unread: 0, pinned: false, online: false, avatar: '', typing: false },
            ].map((chat, i) => (
              <ChatItem key={i}>
                <Badge
                  color={chat.online ? 'success' : 'default'}
                  variant={chat.online ? 'dot' : undefined}
                  overlap="circular"
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  sx={{ mr: 2 }}
                >
                  <Avatar sx={{ width: 40, height: 40, bgcolor: chat.pinned ? '#25d366' : '#222' }}>{chat.name[0]}</Avatar>
                </Badge>
                <Box flex={1}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography fontWeight={600} color="#fff">{chat.name}</Typography>
                    {chat.pinned && <StarIcon fontSize="small" sx={{ color: '#25d366', ml: 0.5 }} />}
                  </Box>
                  <Typography variant="body2" color={chat.typing ? '#25d366' : 'grey.400'} fontStyle={chat.typing ? 'italic' : 'normal'}>
                    {chat.typing ? 'Typing...' : chat.lastMsg}
                  </Typography>
                </Box>
                <Box display="flex" flexDirection="column" alignItems="flex-end" minWidth={48}>
                  <Typography variant="caption" color="#aaa" sx={{ mb: 0.5 }}>{chat.time}</Typography>
                  <Badge
                    badgeContent={chat.unread}
                    color="primary"
                    sx={{
                      '& .MuiBadge-badge': {
                        animation: chat.unread ? 'pulse 1s infinite' : 'none',
                        bgcolor: chat.unread ? '#25d366' : 'transparent',
                        color: chat.unread ? '#fff' : 'transparent',
                        fontWeight: 700,
                        minWidth: 22,
                        height: 22,
                        fontSize: 13,
                        boxShadow: chat.unread ? '0 0 8px #25d36655' : 'none',
                      }
                    }}
                  />
                </Box>
              </ChatItem>
            ))
          )}
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'space-between', px: 2, pb: 2, bgcolor: 'transparent' }}>
          <Button startIcon={<AddIcon />} sx={{ color: '#25d366', fontWeight: 600, borderRadius: 2, px: 2, py: 1, bgcolor: 'rgba(37,211,102,0.08)', '&:hover': { bgcolor: '#25d366', color: '#fff' } }} onClick={() => alert('New Chat')}>New Chat</Button>
          <Button startIcon={<GroupAddIcon />} sx={{ color: '#25d366', fontWeight: 600, borderRadius: 2, px: 2, py: 1, bgcolor: 'rgba(37,211,102,0.08)', '&:hover': { bgcolor: '#25d366', color: '#fff' } }} onClick={() => alert('New Group')}>New Group</Button>
          <IconButton sx={{ color: '#25d366', bgcolor: 'rgba(37,211,102,0.08)', borderRadius: 2, '&:hover': { bgcolor: '#25d366', color: '#fff' } }} onClick={() => alert('Chat Settings')}><SettingsIcon /></IconButton>
        </DialogActions>
      </Dialog>
      
      {/* Personalization Dialog */}
      <Dialog
        open={personalizationDialogOpen}
        onClose={() => setPersonalizationDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: darkMode ? '#222' : '#fff',
            color: darkMode ? '#fff' : '#222',
            borderRadius: 3,
            boxShadow: 8
          }
        }}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 2,
          borderBottom: `1px solid ${darkMode ? '#444' : '#e0e0e0'}`
        }}>
          <PaletteOutlinedIcon sx={{ color: '#25d366' }} />
          <Typography variant="h6" fontWeight={700}>
            Personalization
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Tabs
            value={personalizationTab}
            onChange={(_, v) => setPersonalizationTab(v)}
            variant="fullWidth"
            TabIndicatorProps={{ style: { backgroundColor: '#25d366', height: 4, borderRadius: 2 } }}
            textColor="inherit"
            sx={{
              bgcolor: 'rgba(255,255,255,0.04)',
              borderRadius: 2,
              mt: 1,
              mb: 0.5,
              '& .MuiTab-root': {
                color: '#aaa',
                fontWeight: 600,
                fontSize: 16,
                transition: 'color 0.2s',
              },
              '& .Mui-selected': {
                color: '#25d366',
              },
            }}
          >
            <Tab label="Seasonal" />
            <Tab label="Advanced" />
            <Tab label="Mood" />
          </Tabs>
          <TabPanel value={personalizationTab} index={0}>
            <SeasonalThemeSelector 
              seasonalTheme={seasonalTheme}
              setSeasonalTheme={setSeasonalTheme}
              getCurrentSeason={getCurrentSeason}
            />
          </TabPanel>
          <TabPanel value={personalizationTab} index={1}>
            <AdvancedPersonalization />
          </TabPanel>
          <TabPanel value={personalizationTab} index={2}>
            <MoodThemeSelector />
          </TabPanel>
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: `1px solid ${darkMode ? '#444' : '#e0e0e0'}` }}>
          <Button 
            onClick={() => setPersonalizationDialogOpen(false)}
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
    </Box>
  );
};

export default Sidebar; 
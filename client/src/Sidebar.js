import React, { useState, useEffect } from 'react';
import { Box, IconButton, Avatar, Tooltip, Typography, Divider, ListItemIcon } from '@mui/material';
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
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import ImageCropDialog from './ImageCropDialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Slider from '@mui/material/Slider';
import SocialXIcon from './SocialXIcon';
import TextField from '@mui/material/TextField';
import CircularProgress from '@mui/material/CircularProgress';

const getFullUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return `http://localhost:5000${url}`;
};

const Sidebar = ({ user, darkMode, setDarkMode, onNav, onLogout, onProfileEdit, nav, unreadChatsCount, onNotificationSettings, onDeleteAccount }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [editOpen, setEditOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [avatarMenuAnchorEl, setAvatarMenuAnchorEl] = useState(null);
  const [viewImageOpen, setViewImageOpen] = useState(false);
  const [imageToCrop, setImageToCrop] = useState(null);
  const theme = useTheme();
  const fileInputRef = React.useRef(null);
  const [generalDialogOpen, setGeneralDialogOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [fontSize, setFontSize] = useState(16);
  const [accountDialogOpen, setAccountDialogOpen] = useState(false);
  const [changePasswordDialogOpen, setChangePasswordDialogOpen] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [twoFAStatus, setTwoFAStatus] = useState(user?.twoFactorEnabled || false);
  const [twoFAQROpen, setTwoFAQROpen] = useState(false);
  const [twoFAQr, setTwoFAQr] = useState('');
  const [twoFASecret, setTwoFASecret] = useState('');
  const [twoFACode, setTwoFACode] = useState('');
  const [twoFAError, setTwoFAError] = useState('');
  const [twoFALoading, setTwoFALoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => {
    setTwoFAStatus(user?.twoFactorEnabled || false);
  }, [user]);

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

  const handleEnable2FA = async () => {
    setTwoFAError('');
    setTwoFALoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/auth/enable-2fa', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) {
        setTwoFAError(data.message || 'Failed to start 2FA.');
        if (data.message && data.message.toLowerCase().includes('already enabled')) {
          setTwoFAStatus(true);
          setTwoFAQROpen(false);
        }
      } else {
        setTwoFAQr(data.qr);
        setTwoFASecret(data.secret);
        setTwoFAQROpen(true);
      }
    } catch (err) {
      setTwoFAError('Server error. Please try again.');
    }
    setTwoFALoading(false);
  };

  const handleVerify2FA = async () => {
    setTwoFAError('');
    setTwoFALoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/auth/verify-2fa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ code: twoFACode })
      });
      const data = await res.json();
      if (!res.ok) {
        setTwoFAError(data.message || 'Invalid code.');
      } else {
        setTwoFAStatus(true);
        setTwoFAQROpen(false);
        setTwoFACode('');
      }
    } catch (err) {
      setTwoFAError('Server error. Please try again.');
    }
    setTwoFALoading(false);
  };

  const handleDisable2FA = async () => {
    setTwoFAError('');
    setTwoFALoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/auth/disable-2fa', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) {
        setTwoFAError(data.message || 'Failed to disable 2FA.');
      } else {
        setTwoFAStatus(false);
      }
    } catch (err) {
      setTwoFAError('Server error. Please try again.');
    }
    setTwoFALoading(false);
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
      <Box sx={{ p: -1, width: '100%', mb: 3 }}>
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
        <MenuItem onClick={handleGeneralClick}>
          <ListItemIcon><TuneOutlinedIcon /></ListItemIcon>
          General
        </MenuItem>
        <MenuItem onClick={() => setAccountDialogOpen(true)}>
          <ListItemIcon><AccountCircleOutlinedIcon /></ListItemIcon>
          Account
        </MenuItem>
        <MenuItem onClick={() => { console.log('Chat'); }} sx={{ mb: 1 }}>
          <ListItemIcon><ChatOutlinedIcon /></ListItemIcon>
          Chat
        </MenuItem>
        <MenuItem onClick={() => { onNotificationSettings(); handleMenuClose(); }} sx={{ mb: 1 }}>
          <ListItemIcon><NotificationsNoneOutlinedIcon /></ListItemIcon>
          Notification
        </MenuItem>
        <MenuItem onClick={() => { console.log('Personalization'); }} sx={{ mb: 1 }}>
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
        <DialogTitle>General Settings</DialogTitle>
        <DialogContent>
          <Typography variant="subtitle1" sx={{ mb: 2 }}>Language</Typography>
          <Button
            variant={selectedLanguage === 'English' ? 'contained' : 'outlined'}
            onClick={() => setSelectedLanguage('English')}
            sx={{
              mr: 1,
              color: selectedLanguage === 'English' ? '#fff' : '#25d366',
              borderColor: '#25d366',
              backgroundColor: selectedLanguage === 'English' ? '#25d366' : 'transparent',
              '&:hover': { backgroundColor: '#25d366', color: '#fff' }
            }}
          >
            English
          </Button>
          <Button
            variant={selectedLanguage === 'Hindi' ? 'contained' : 'outlined'}
            onClick={() => setSelectedLanguage('Hindi')}
            sx={{
              color: selectedLanguage === 'Hindi' ? '#fff' : '#25d366',
              borderColor: '#25d366',
              backgroundColor: selectedLanguage === 'Hindi' ? '#25d366' : 'transparent',
              '&:hover': { backgroundColor: '#25d366', color: '#fff' }
            }}
          >
            Hindi
          </Button>
          <Typography variant="subtitle1" sx={{ mt: 3, mb: 1 }}>Font Size</Typography>
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
          <Typography variant="body2">Preview: <span style={{ fontSize }}>{'This is a preview.'}</span></Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setGeneralDialogOpen(false)}
            sx={{ color: '#25d366' }}
          >
            Close
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
            Password last changed: 10 days ago
          </Typography>
          {twoFAStatus ? (
            <Button
              variant="outlined"
              fullWidth
              sx={{ color: '#f44336', borderColor: '#f44336', fontWeight: 600, mb: 2 }}
              onClick={handleDisable2FA}
              disabled={twoFALoading}
            >
              Disable Two-Factor Authentication
            </Button>
          ) : (
            <Button
              variant="text"
              fullWidth
              sx={{ color: '#25d366', backgroundColor: 'rgba(37,211,102,0.08)', fontWeight: 600, mb: 2 }}
              onClick={handleEnable2FA}
              disabled={twoFALoading}
            >
              {twoFALoading ? <CircularProgress size={20} sx={{ color: '#25d366' }} /> : 'Enable Two-Factor Authentication'}
            </Button>
          )}
          {twoFAError && <Typography color="error" sx={{ mb: 1 }}>{twoFAError}</Typography>}
          <Dialog open={twoFAQROpen} onClose={() => setTwoFAQROpen(false)}>
            <DialogTitle>Enable Two-Factor Authentication</DialogTitle>
            <DialogContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', pt: 2 }}>
              <Typography sx={{ mb: 2 }}>Scan this QR code with your authenticator app:</Typography>
              {twoFAQr && <img src={twoFAQr} alt="2FA QR" style={{ width: 200, height: 200, marginBottom: 16 }} />}
              <Typography variant="body2" sx={{ mb: 2 }}>Or enter this secret manually: <b>{twoFASecret}</b></Typography>
              <TextField
                label="Enter 6-digit code"
                value={twoFACode}
                onChange={e => setTwoFACode(e.target.value)}
                fullWidth
                margin="normal"
                inputProps={{ maxLength: 6 }}
              />
              {twoFAError && <Typography color="error" sx={{ mb: 1 }}>{twoFAError}</Typography>}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setTwoFAQROpen(false)} sx={{ color: '#25d366' }}>Cancel</Button>
              <Button onClick={handleVerify2FA} variant="contained" sx={{ backgroundColor: '#25d366', color: '#fff' }} disabled={twoFALoading || !twoFACode || twoFACode.length !== 6}>
                {twoFALoading ? <CircularProgress size={20} sx={{ color: '#fff' }} /> : 'Verify & Enable'}
              </Button>
            </DialogActions>
          </Dialog>
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
          <Button onClick={() => setChangePasswordDialogOpen(false)}>Cancel</Button>
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
          <Typography>Are you sure you want to delete your account? This action cannot be undone.</Typography>
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
                  setDeleteError(data.message || 'Failed to delete account.');
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
            {deleteLoading ? 'Deleting...' : 'Confirm Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Sidebar; 
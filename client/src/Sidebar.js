import React, { useState } from 'react';
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

const getFullUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return `http://localhost:5000${url}`;
};

const Sidebar = ({ user, darkMode, setDarkMode, onNav, onLogout, onProfileEdit, nav, unreadChatsCount, onNotificationSettings }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [editOpen, setEditOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const theme = useTheme();

  const handleAvatarClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
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
              <Avatar src={getFullUrl(user?.avatar)} alt={user?.username} sx={{ width: 40, height: 40 }} />
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
          <Avatar src={getFullUrl(user?.avatar)} alt={user?.username} sx={{ width: 64, height: 64, mb: 1.5 }} />
          <Typography fontWeight={600} variant="h6" align="center">{user?.username}</Typography>
          <Typography variant="body2" color="textSecondary" align="center">{user?.email}</Typography>
        </Box>
        <Divider />
        <MenuItem onClick={() => { setDarkMode(!darkMode); handleMenuClose(); }} sx={{ mb: 1 }}>
          <ListItemIcon>{darkMode ? <Brightness7Icon /> : <Brightness4Icon />}</ListItemIcon>
          Theme
        </MenuItem>
        <MenuItem onClick={() => { setEditOpen(true); }} sx={{ mb: 1 }}>
          <ListItemIcon><EditIcon /></ListItemIcon>
          Edit Profile
        </MenuItem>
        <MenuItem onClick={() => { console.log('General'); }} sx={{ mb: 1 }}>
          <ListItemIcon><TuneOutlinedIcon /></ListItemIcon>
          General
        </MenuItem>
        <MenuItem onClick={() => { console.log('Account'); }} sx={{ mb: 1 }}>
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
    </Box>
  );
};

export default Sidebar; 
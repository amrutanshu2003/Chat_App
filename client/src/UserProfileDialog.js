import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, Avatar, Typography, Box, List, ListItem, ListItemAvatar, ListItemText, Divider, IconButton, Tooltip, Drawer } from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import CallIcon from '@mui/icons-material/Call';
import PersonIcon from '@mui/icons-material/Person';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

const UserProfileDialog = ({ open, onClose, user, onChat, onCall, getUserStatus, fetchLastSeenIfNeeded }) => {
  const [showImageDialog, setShowImageDialog] = useState(false);

  useEffect(() => {
    if (open && user && getUserStatus && fetchLastSeenIfNeeded && getUserStatus(user).status !== 'online') {
      fetchLastSeenIfNeeded(user);
    }
    // eslint-disable-next-line
  }, [open, user]);

  if (!user) return null;
  // If user has members, treat as group
  const isGroup = Array.isArray(user.members);
  return (
    <Drawer anchor="top" open={open} onClose={onClose} PaperProps={{ sx: { width: 320, borderRadius: 4, margin: '0 auto', mt: 4 } }}>
      <Box p={2}>
        <Box display="flex" alignItems="center" mb={2} justifyContent="space-between">
          <Box display="flex" alignItems="center">
            <PersonIcon sx={{ mr: 1 }} />
            <Typography variant="h6" fontWeight={600}>Profile</Typography>
          </Box>
          <IconButton onClick={onClose} sx={{ ml: 1 }}>
            <CloseIcon />
          </IconButton>
        </Box>
        <Box display="flex" flexDirection="column" alignItems="center" mb={2}>
          <Box position="relative" display="inline-block" mb={2}>
            <Avatar src={user.avatar} sx={{ width: 80, height: 80, cursor: 'pointer' }} onClick={() => setShowImageDialog(true)} />
            {getUserStatus && getUserStatus(user).status === 'online' && (
              <Box position="absolute" bottom={6} right={6} width={8} height={8} bgcolor="#25d366" borderRadius="50%" border="2px solid #fff" />
            )}
          </Box>
          <Typography fontWeight={600} variant="h6">{isGroup ? user.name : user.username}</Typography>
          {!isGroup && getUserStatus && (
            getUserStatus(user).status === 'online' ? (
              <Typography variant="caption" color="textSecondary">Online</Typography>
            ) : (
              <Typography variant="caption" color="textSecondary">
                {getUserStatus(user).lastSeen ? `Last seen ${new Date(getUserStatus(user).lastSeen).toLocaleString()}` : 'Offline'}
              </Typography>
            )
          )}
          {/* About section left-aligned */}
          {!isGroup && (
            <Box display="flex" flexDirection="column" alignItems="flex-start" width="100%">
              <Box display="flex" alignItems="center" mt={1} mb={0.5}>
                <InfoOutlinedIcon fontSize="small" sx={{ mr: 1 }} />
                <Typography variant="subtitle2" color="textSecondary">About</Typography>
              </Box>
              <Typography variant="body2" color="primary" align="left" sx={{ width: '100%', wordBreak: 'break-word', whiteSpace: 'pre-line' }}>{user.about || ''}</Typography>
            </Box>
          )}
        </Box>
        {isGroup && user.members && user.members.length > 0 && (
          <>
            <Divider sx={{ mb: 1 }} />
            <Typography variant="subtitle2" color="textSecondary" mb={1}>Members</Typography>
            <List>
              {user.members.map(member => (
                <ListItem key={member._id || member.id} secondaryAction={
                  <Box>
                    <Tooltip title="Chat"><IconButton onClick={() => onChat && onChat(member)}><ChatIcon /></IconButton></Tooltip>
                    <Tooltip title="Call"><IconButton onClick={() => onCall && onCall(member)}><CallIcon /></IconButton></Tooltip>
                  </Box>
                }>
                  <ListItemAvatar>
                    <Avatar src={member.avatar} />
                  </ListItemAvatar>
                  <ListItemText
                    primary={member.username}
                    secondary={member.about}
                  />
                </ListItem>
              ))}
            </List>
          </>
        )}
        {isGroup && (
          <Typography variant="body2" color="textSecondary">Group</Typography>
        )}
      </Box>
      <Dialog open={showImageDialog} onClose={() => setShowImageDialog(false)} fullScreen PaperProps={{ sx: { bgcolor: 'rgba(0,0,0,0.95)' } }}>
        <IconButton onClick={() => setShowImageDialog(false)} sx={{ position: 'absolute', top: 16, left: 16, color: '#fff', zIndex: 10 }}>
          <ArrowBackIcon />
        </IconButton>
        <Box display="flex" justifyContent="center" alignItems="center" height="100vh" width="100vw">
          <img src={user.avatar} alt="Profile" style={{ maxWidth: '90vw', maxHeight: '90vh', objectFit: 'contain' }} />
        </Box>
      </Dialog>
    </Drawer>
  );
};

export default UserProfileDialog; 
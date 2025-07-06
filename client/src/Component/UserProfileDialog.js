import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Avatar, Box } from '@mui/material';

const UserProfileDialog = ({ open, onClose, user, onChat, onCall }) => {
  if (!user) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>User Profile</DialogTitle>
      <DialogContent>
        <Box display="flex" flexDirection="column" alignItems="center" gap={2} p={2}>
          <Avatar src={user.avatar} sx={{ width: 96, height: 96 }} />
          <Typography variant="h6">{user.username || user.name || 'Unknown User'}</Typography>
          <Typography variant="body2" color="textSecondary">{user.email}</Typography>
          {user.about && <Typography variant="body2" sx={{ mt: 1 }}>{user.about}</Typography>}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => { onChat && onChat(user); onClose(); }} color="primary" variant="contained">
          Chat
        </Button>
        <Button onClick={() => { onCall && onCall(user); onClose(); }} color="primary" variant="outlined">
          Call
        </Button>
        <Button onClick={onClose} color="secondary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UserProfileDialog;

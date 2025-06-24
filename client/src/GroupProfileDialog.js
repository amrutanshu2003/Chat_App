import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Avatar,
  Typography,
  Box,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Alert,
  TextField,
  FormControlLabel,
  Switch
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  AdminPanelSettings as AdminIcon,
  Security as SecurityIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  PersonAdd as PersonAddIcon,
  ExitToApp as LeaveIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';

const GroupProfileDialog = ({ open, onClose, group, currentUser, token, onGroupUpdated, onGroupDeleted }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editSettings, setEditSettings] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);

  useEffect(() => {
    if (group) {
      setEditName(group.name);
      setEditDescription(group.description || '');
      setEditSettings({
        isPrivate: group.settings?.isPrivate || false,
        allowMemberInvite: group.settings?.allowMemberInvite || true,
        allowMemberEdit: group.settings?.allowMemberEdit || false
      });
    }
  }, [group]);

  const isAdmin = group?.admin === currentUser?._id;
  const isModerator = group?.members?.find(m => m.user === currentUser?._id)?.role === 'moderator';
  const canEdit = isAdmin || isModerator;

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEditToggle = () => {
    if (isEditing) {
      // Cancel editing
      setEditName(group.name);
      setEditDescription(group.description || '');
      setEditSettings({
        isPrivate: group.settings?.isPrivate || false,
        allowMemberInvite: group.settings?.allowMemberInvite || true,
        allowMemberEdit: group.settings?.allowMemberEdit || false
      });
    }
    setIsEditing(!isEditing);
    setError('');
  };

  const handleSave = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/groups/${group._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: editName.trim(),
          description: editDescription.trim(),
          ...editSettings
        })
      });

      if (response.ok) {
        const updatedGroup = await response.json();
        onGroupUpdated(updatedGroup);
        setIsEditing(false);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to update group');
      }
    } catch (error) {
      console.error('Error updating group:', error);
      setError('Failed to update group');
    } finally {
      setLoading(false);
    }
  };

  // Helper function to show confirmation dialog
  const showConfirmDialog = (message) => {
    // eslint-disable-next-line no-restricted-globals
    return typeof window !== 'undefined' && window.confirm(message);
  };

  const handleLeaveGroup = async () => {
    if (!showConfirmDialog('Are you sure you want to leave this group?')) return;

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/groups/${group._id}/leave`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        onGroupDeleted(group._id);
        onClose();
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to leave group');
      }
    } catch (error) {
      console.error('Error leaving group:', error);
      setError('Failed to leave group');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (memberId) => {
    if (!showConfirmDialog('Are you sure you want to remove this member?')) return;

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/groups/${group._id}/members/${memberId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const updatedGroup = await response.json();
        onGroupUpdated(updatedGroup);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to remove member');
      }
    } catch (error) {
      console.error('Error removing member:', error);
      setError('Failed to remove member');
    } finally {
      setLoading(false);
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'error';
      case 'moderator': return 'warning';
      default: return 'default';
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin': return <AdminIcon fontSize="small" />;
      case 'moderator': return <SecurityIcon fontSize="small" />;
      default: return null;
    }
  };

  if (!group) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={2}>
            <Avatar
              src={group.avatar}
              sx={{ width: 56, height: 56 }}
            >
              {group.name.charAt(0).toUpperCase()}
            </Avatar>
            <Box>
              {isEditing ? (
                <TextField
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  variant="standard"
                  fullWidth
                  sx={{ mb: 1 }}
                />
              ) : (
                <Typography variant="h6">{group.name}</Typography>
              )}
              <Typography variant="body2" color="text.secondary">
                {group.members?.length || 0} members
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={handleMenuOpen}>
            <MoreVertIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {isEditing ? (
          <TextField
            label="Description"
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            fullWidth
            multiline
            rows={3}
            sx={{ mb: 2 }}
          />
        ) : (
          <Typography variant="body1" sx={{ mb: 2 }}>
            {group.description || 'No description'}
          </Typography>
        )}

        {isEditing && (
          <Box sx={{ mb: 2 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={editSettings.isPrivate}
                  onChange={(e) => setEditSettings(prev => ({ ...prev, isPrivate: e.target.checked }))}
                />
              }
              label="Private Group"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={editSettings.allowMemberInvite}
                  onChange={(e) => setEditSettings(prev => ({ ...prev, allowMemberInvite: e.target.checked }))}
                />
              }
              label="Allow Members to Invite"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={editSettings.allowMemberEdit}
                  onChange={(e) => setEditSettings(prev => ({ ...prev, allowMemberEdit: e.target.checked }))}
                />
              }
              label="Allow Members to Edit"
            />
          </Box>
        )}

        <Divider sx={{ my: 2 }} />

        <Typography variant="h6" gutterBottom>
          Members ({group.members?.length || 0})
        </Typography>

        <List>
          {group.members?.map((member) => (
            <ListItem key={member.user._id}>
              <ListItemAvatar>
                <Avatar src={member.user.avatar}>
                  {member.user.username.charAt(0).toUpperCase()}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Box display="flex" alignItems="center" gap={1}>
                    {member.user.username}
                    {member.user._id === group.admin && (
                      <Chip
                        label="Admin"
                        color="error"
                        size="small"
                        icon={<AdminIcon />}
                      />
                    )}
                    {member.role !== 'member' && member.user._id !== group.admin && (
                      <Chip
                        label={member.role}
                        color={getRoleColor(member.role)}
                        size="small"
                        icon={getRoleIcon(member.role)}
                      />
                    )}
                  </Box>
                }
                secondary={member.user.email}
              />
              {canEdit && member.user._id !== currentUser?._id && member.user._id !== group.admin && (
                <IconButton
                  onClick={() => handleRemoveMember(member.user._id)}
                  disabled={loading}
                  color="error"
                >
                  <DeleteIcon />
                </IconButton>
              )}
            </ListItem>
          ))}
        </List>

        {group.pinnedMessages && group.pinnedMessages.length > 0 && (
          <>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" gutterBottom>
              Pinned Messages ({group.pinnedMessages.length})
            </Typography>
            <List>
              {group.pinnedMessages.map((pinned, index) => (
                <ListItem key={index}>
                  <ListItemText
                    primary={pinned.message?.content || 'Message not available'}
                    secondary={`Pinned by ${pinned.pinnedBy?.username || 'Unknown'}`}
                  />
                </ListItem>
              ))}
            </List>
          </>
        )}
      </DialogContent>

      <DialogActions>
        {isEditing ? (
          <>
            <Button onClick={handleEditToggle} disabled={loading}>
              <CancelIcon /> Cancel
            </Button>
            <Button onClick={handleSave} variant="contained" disabled={loading}>
              <SaveIcon /> Save
            </Button>
          </>
        ) : (
          <>
            {canEdit && (
              <Button onClick={handleEditToggle} startIcon={<EditIcon />}>
                Edit
              </Button>
            )}
            <Button onClick={onClose}>
              Close
            </Button>
          </>
        )}
      </DialogActions>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        {canEdit && (
          <MenuItem onClick={() => { handleEditToggle(); handleMenuClose(); }}>
            <EditIcon sx={{ mr: 1 }} /> Edit Group
          </MenuItem>
        )}
        <MenuItem onClick={() => { handleLeaveGroup(); handleMenuClose(); }}>
          <LeaveIcon sx={{ mr: 1 }} /> Leave Group
        </MenuItem>
      </Menu>
    </Dialog>
  );
};

export default GroupProfileDialog; 
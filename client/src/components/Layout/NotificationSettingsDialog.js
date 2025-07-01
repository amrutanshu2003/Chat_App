import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControlLabel,
  Switch,
  Typography,
  Box,
  Divider
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SendIcon from '@mui/icons-material/Send';

const NotificationSettingsDialog = ({ open, onClose, settings, onSave }) => {
  const [localSettings, setLocalSettings] = React.useState(settings);

  React.useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleSave = () => {
    onSave(localSettings);
    onClose();
  };

  const handleCancel = () => {
    setLocalSettings(settings);
    onClose();
  };

  const handleSettingChange = (setting, value) => {
    setLocalSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  return (
    <Dialog open={open} onClose={handleCancel} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <NotificationsIcon />
        Notification Settings
      </DialogTitle>
      <DialogContent>
        <Box sx={{ py: 1 }}>
          <FormControlLabel
            control={
              <Switch
                checked={localSettings.enabled}
                onChange={(e) => handleSettingChange('enabled', e.target.checked)}
                sx={{
                  '& .MuiSwitch-switchBase.Mui-checked': {
                    color: '#25d366',
                  },
                  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                    backgroundColor: '#25d366',
                  },
                }}
              />
            }
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <NotificationsIcon fontSize="small" />
                <Typography>Enable Notifications</Typography>
              </Box>
            }
          />
          <Typography variant="body2" color="textSecondary" sx={{ ml: 4, mb: 2 }}>
            Show desktop notifications for new messages
          </Typography>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ py: 1 }}>
          <FormControlLabel
            control={
              <Switch
                checked={localSettings.sound}
                onChange={(e) => handleSettingChange('sound', e.target.checked)}
                sx={{
                  '& .MuiSwitch-switchBase.Mui-checked': {
                    color: '#25d366',
                  },
                  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                    backgroundColor: '#25d366',
                  },
                }}
                disabled={!localSettings.enabled}
              />
            }
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <VolumeUpIcon fontSize="small" />
                <Typography>Notification Sound</Typography>
              </Box>
            }
          />
          <Typography variant="body2" color="textSecondary" sx={{ ml: 4, mb: 2 }}>
            Play sound when notifications appear
          </Typography>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ py: 1 }}>
          <FormControlLabel
            control={
              <Switch
                checked={localSettings.showPreview}
                onChange={(e) => handleSettingChange('showPreview', e.target.checked)}
                sx={{
                  '& .MuiSwitch-switchBase.Mui-checked': {
                    color: '#25d366',
                  },
                  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                    backgroundColor: '#25d366',
                  },
                }}
                disabled={!localSettings.enabled}
              />
            }
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <VisibilityIcon fontSize="small" />
                <Typography>Show Message Preview</Typography>
              </Box>
            }
          />
          <Typography variant="body2" color="textSecondary" sx={{ ml: 4, mb: 2 }}>
            Display message content in notifications
          </Typography>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ py: 1 }}>
          <FormControlLabel
            control={
              <Switch
                checked={localSettings.sentMessageNotifications}
                onChange={(e) => handleSettingChange('sentMessageNotifications', e.target.checked)}
                sx={{
                  '& .MuiSwitch-switchBase.Mui-checked': {
                    color: '#25d366',
                  },
                  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                    backgroundColor: '#25d366',
                  },
                }}
                disabled={!localSettings.enabled}
              />
            }
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <SendIcon fontSize="small" />
                <Typography>Sent Message Notifications</Typography>
              </Box>
            }
          />
          <Typography variant="body2" color="textSecondary" sx={{ ml: 4, mb: 2 }}>
            Show notifications when you send messages
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCancel} sx={{ color: '#25d366' }}>Cancel</Button>
        <Button onClick={handleSave} variant="contained" sx={{ bgcolor: '#25d366', '&:hover': { bgcolor: '#1ea952' } }}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default NotificationSettingsDialog; 
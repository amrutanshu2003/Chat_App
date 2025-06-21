import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Avatar, Box, Menu, MenuItem, IconButton } from '@mui/material';
import axios from 'axios';
import Cropper from 'react-easy-crop';
import Slider from '@mui/material/Slider';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const EditProfileDialog = ({ open, onClose, user, onSave }) => {
  const [username, setUsername] = useState(user?.username || '');
  const [email, setEmail] = useState(user?.email || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [about, setAbout] = useState(user?.about || '');
  const [usernameDisabled, setUsernameDisabled] = useState(false);
  const [usernameHelper, setUsernameHelper] = useState('');

  const API_URL = 'http://localhost:5000/api';
  const BACKEND_URL = 'http://localhost:5000';

  const fileInputRef = useRef();
  const pencilRef = useRef();
  const [anchorEl, setAnchorEl] = useState(null);
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [cropImageSrc, setCropImageSrc] = useState(null);
  const [cropDialogOpen, setCropDialogOpen] = useState(false);
  const [avatarHover, setAvatarHover] = useState(false);
  const [menuPosition, setMenuPosition] = useState(null);

  useEffect(() => {
    setUsername(user?.username || '');
    setEmail(user?.email || '');
    setAvatar(user?.avatar || '');
    setAbout(user?.about || '');
    if (user?.lastUsernameChange) {
      const lastChange = new Date(user.lastUsernameChange);
      const now = new Date();
      const daysSince = (now - lastChange) / (1000 * 60 * 60 * 24);
      if (daysSince < 14) {
        setUsernameDisabled(true);
        const nextDate = new Date(lastChange.getTime() + 14 * 24 * 60 * 60 * 1000);
        setUsernameHelper(`You can change your username again on ${nextDate.toLocaleDateString()}`);
      } else {
        setUsernameDisabled(false);
        setUsernameHelper('');
      }
    } else {
      setUsernameDisabled(false);
      setUsernameHelper('');
    }
  }, [user]);

  useEffect(() => {
    if (!open) {
      setUsername(user?.username || '');
      setEmail(user?.email || '');
      setAvatar(user?.avatar || '');
      setAbout(user?.about || '');
    }
  }, [open]);

  const handleSave = () => {
    onSave({ username, email, avatar, about });
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setCropImageSrc(reader.result);
      setCropDialogOpen(true);
    };
    reader.readAsDataURL(file);
  };

  const onCropComplete = (croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
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
        resolve(blob);
      }, 'image/jpeg');
    });
  };

  const handleCropSave = async () => {
    const croppedBlob = await getCroppedImg(cropImageSrc, croppedAreaPixels);
    const formData = new FormData();
    formData.append('avatar', croppedBlob, 'avatar.jpg');
    try {
      const res = await axios.post(`${API_URL}/auth/upload-avatar`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const url = res.data.url.startsWith('/') ? BACKEND_URL + res.data.url : res.data.url;
      setAvatar(url);
      setTimeout(() => onSave({ username, email, avatar: url, about }), 0);
    } catch (err) {
      alert('Failed to upload image');
    }
    setCropDialogOpen(false);
    setCropImageSrc(null);
  };

  const handleCropCancel = () => {
    setCropDialogOpen(false);
    setCropImageSrc(null);
  };

  const handleAvatarClick = (e) => {
    setAnchorEl(e.currentTarget);
  };

  const handleMenuClose = () => setAnchorEl(null);

  const handleShowImage = () => {
    setShowImageDialog(true);
    handleMenuClose();
  };

  const handleChangeImage = () => {
    if (fileInputRef.current) fileInputRef.current.click();
    handleMenuClose();
  };

  const handleRemoveImage = () => {
    setAvatar('');
    handleMenuClose();
    setTimeout(() => onSave({ username, email, avatar: '', about }), 0);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Edit Profile</DialogTitle>
      <DialogContent>
        <Box display="flex" flexDirection="column" alignItems="center" mb={2} mt={1}>
          <Box position="relative" display="inline-block"
            onMouseEnter={() => setAvatarHover(true)}
            onMouseLeave={() => setAvatarHover(false)}
          >
            <Avatar
              alt="User Avatar"
              src={avatar}
              sx={{ width: 100, height: 100, cursor: 'pointer', mb: 2, transition: 'filter 0.2s' }}
              style={avatarHover ? { filter: 'brightness(0.5)' } : {}}
            />
            {avatarHover && (
              <Box
                ref={pencilRef}
                position="absolute"
                top="50%"
                left="50%"
                sx={{
                  transform: 'translate(-50%, -50%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                onClick={e => {
                  const rect = pencilRef.current.getBoundingClientRect();
                  setMenuPosition({
                    top: rect.top + window.scrollY,
                    left: rect.left + rect.width / 2 + window.scrollX
                  });
                  setAnchorEl(pencilRef.current);
                  e.stopPropagation();
                }}
                style={{ cursor: 'pointer' }}
              >
                <EditOutlinedIcon fontSize="medium" sx={{ color: '#fff' }} />
              </Box>
            )}
          </Box>
          <Menu
            anchorReference={menuPosition ? 'anchorPosition' : 'anchorEl'}
            anchorEl={anchorEl}
            anchorPosition={menuPosition ? { top: menuPosition.top, left: menuPosition.left } : undefined}
            open={Boolean(anchorEl)}
            onClose={() => { handleMenuClose(); setMenuPosition(null); }}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            transformOrigin={{ vertical: 'top', horizontal: 'center' }}
          >
            <MenuItem onClick={handleShowImage}>Show Image</MenuItem>
            <MenuItem onClick={handleChangeImage}>Change Image</MenuItem>
            <MenuItem onClick={handleRemoveImage}>Remove Image</MenuItem>
          </Menu>
          <input
            type="file"
            accept="image/*"
            hidden
            ref={fileInputRef}
            onChange={handleFileChange}
          />
        </Box>
        <TextField label="Username" fullWidth margin="normal" value={username} onChange={e => setUsername(e.target.value)} disabled={usernameDisabled} helperText={usernameHelper} />
        <TextField label="Email" fullWidth margin="normal" value={email} onChange={e => setEmail(e.target.value)} />
        <TextField label="About" fullWidth margin="normal" value={about} onChange={e => setAbout(e.target.value)} />
        <Dialog open={showImageDialog} onClose={() => setShowImageDialog(false)} fullScreen PaperProps={{ sx: { bgcolor: 'rgba(0,0,0,0.95)' } }}>
          <IconButton onClick={() => setShowImageDialog(false)} sx={{ position: 'absolute', top: 16, left: 16, color: '#fff', zIndex: 10 }}>
            <ArrowBackIcon />
          </IconButton>
          <Box display="flex" justifyContent="center" alignItems="center" height="100vh" width="100vw">
            <img src={avatar} alt="Profile" style={{ maxWidth: '90vw', maxHeight: '90vh', objectFit: 'contain' }} />
          </Box>
        </Dialog>
        <Dialog open={cropDialogOpen} onClose={handleCropCancel} maxWidth="sm" fullWidth>
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
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained">Save</Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditProfileDialog; 
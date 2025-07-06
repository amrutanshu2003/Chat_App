import React, { useRef, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box } from '@mui/material';

const VideoCallModal = ({ open, onClose, localStream, remoteStream, onAccept, onEnd, incoming, accepted, audioOnly }) => {
  const localVideoRef = useRef();
  const remoteVideoRef = useRef();

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{incoming ? (audioOnly ? 'Incoming Audio Call' : 'Incoming Call') : (audioOnly ? 'Audio Call' : 'Video Call')}</DialogTitle>
      <DialogContent>
        <Box display="flex" flexDirection="column" alignItems="center">
          {!audioOnly && <video ref={localVideoRef} autoPlay muted playsInline style={{ width: 200, borderRadius: 8, marginBottom: 8 }} />}
          {remoteStream && (!audioOnly || (remoteStream.getVideoTracks && remoteStream.getVideoTracks().length > 0)) ? (
            <video ref={remoteVideoRef} autoPlay playsInline style={{ width: 400, borderRadius: 8 }} />
          ) : (
            <Box p={4}>
              <span role="img" aria-label="audio">🎤</span> Audio Call
            </Box>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        {incoming && !accepted && <Button onClick={onAccept} variant="contained" color="primary">Accept</Button>}
        <Button onClick={onEnd} variant="contained" color="secondary">End Call</Button>
      </DialogActions>
    </Dialog>
  );
};

export default VideoCallModal;

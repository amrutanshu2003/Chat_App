import React, { useRef, useState, useEffect } from 'react';
import Avatar from '@mui/material/Avatar';

const AudioMessage = ({ audioSrc, profileImg, profileName = '', duration = 0 }) => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const updateTime = () => setCurrentTime(audio.currentTime);
    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('ended', () => setIsPlaying(false));
    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('ended', () => setIsPlaying(false));
    };
  }, []);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  // Generate fake waveform data for demo
  const waveform = Array(40).fill(0).map(() => Math.random());
  const progress = duration ? (currentTime / duration) * waveform.length : 0;

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      background: '#075e54',
      borderRadius: 16,
      padding: '8px 12px',
      width: 250,
      color: '#fff',
      fontFamily: 'sans-serif',
    }}>
      <button onClick={togglePlay} style={{
        background: 'none',
        border: 'none',
        color: '#fff',
        fontSize: 24,
        marginRight: 10,
        cursor: 'pointer',
        padding: 0
      }}>
        {isPlaying ? '⏸️' : '▶️'}
      </button>
      <audio ref={audioRef} src={audioSrc} preload="auto" />
      <span style={{ fontSize: 12, minWidth: 60, textAlign: 'right' }}>
        {formatTime(currentTime)} / {formatTime(duration)}
      </span>
    </div>
  );
};

function formatTime(sec) {
  if (!sec) return '0:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default AudioMessage;

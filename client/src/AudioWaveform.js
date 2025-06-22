import React, { useRef, useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import Avatar from '@mui/material/Avatar';

const AudioWaveform = forwardRef(({ audioSrc, profileImg, profileName = '', duration = 0, isPlaying = false, currentTime = 0, onPlayPause, onSeek }, ref) => {
  const audioRef = useRef(null);

  // Expose the audio element to parent component
  useImperativeHandle(ref, () => audioRef.current);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    
    const updateTime = () => {
      if (onSeek) onSeek(audio.currentTime);
    };
    
    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('ended', () => {
      if (onPlayPause) onPlayPause();
    });
    
    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('ended', () => {
        if (onPlayPause) onPlayPause();
      });
    };
  }, [onSeek, onPlayPause]);

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
      <button onClick={onPlayPause} style={{
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
});

function formatTime(sec) {
  if (!sec) return '0:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default AudioWaveform; 
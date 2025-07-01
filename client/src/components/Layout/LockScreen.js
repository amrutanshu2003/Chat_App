import React, { useState } from 'react';
import SocialXIcon from './SocialXIcon';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import DarkModeIcon from '@mui/icons-material/DarkMode';

const DEFAULT_PIN = '1234';

function LockScreen({ onUnlock }) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [resetMode, setResetMode] = useState(false);
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [resetError, setResetError] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [darkMode, setDarkMode] = useState(() => {
    const stored = localStorage.getItem('lockscreen_darkMode');
    return stored ? JSON.parse(stored) : false;
  });

  const getStoredPin = () => localStorage.getItem('lockscreen_pin') || DEFAULT_PIN;

  const handleMenuOpen = (e) => {
    setAnchorEl(e.currentTarget);
    setMenuOpen(true);
  };
  const handleMenuClose = () => {
    setMenuOpen(false);
    setAnchorEl(null);
  };
  const handleToggleTheme = () => {
    setDarkMode((prev) => {
      localStorage.setItem('lockscreen_darkMode', JSON.stringify(!prev));
      return !prev;
    });
    handleMenuClose();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (pin === getStoredPin()) {
      setError('');
      onUnlock();
    } else {
      setError('Incorrect PIN. Please try again.');
      setPin('');
    }
  };

  const handleResetPin = (e) => {
    e.preventDefault();
    if (newPin.length !== 4 || /\D/.test(newPin)) {
      setResetError('PIN must be 4 digits.');
      return;
    }
    if (newPin !== confirmPin) {
      setResetError('PINs do not match.');
      return;
    }
    localStorage.setItem('lockscreen_pin', newPin);
    setResetMode(false);
    setNewPin('');
    setConfirmPin('');
    setResetError('');
    setError('PIN changed! Use new PIN to unlock.');
  };

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      height: '100vh', background: darkMode ? '#222' : '#f0f0f0', transition: 'background 0.2s',
    }}>
      {/* Header */}
      <div style={{
        position: 'absolute', top: 0, left: 0, width: '100%', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'transparent', padding: '0 1rem', boxSizing: 'border-box',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <SocialXIcon size={40} style={{ marginLeft: 0 }} color="#25d366" />
          <span style={{ color: darkMode ? '#fff' : '#222', fontWeight: 700, fontSize: 24, letterSpacing: 1 }}>Social X</span>
        </div>
        <div style={{ position: 'relative' }}>
          <span onClick={handleToggleTheme} style={{ cursor: 'pointer', color: darkMode ? '#fff' : '#222', fontSize: 28, display: 'flex', alignItems: 'center' }}>
            {darkMode ? <WbSunnyIcon /> : <DarkModeIcon />}
          </span>
        </div>
      </div>
      {/* Main Content */}
      <h2 style={{ color: darkMode ? '#fff' : '#222', marginTop: 80 }}>Social X App Locked</h2>
      {!resetMode ? (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', minWidth: 250 }}>
          <input
            type="password"
            value={pin}
            onChange={e => setPin(e.target.value.replace(/\D/g, ''))}
            maxLength={4}
            placeholder="Enter 4-digit PIN"
            style={{ fontSize: '1.2rem', padding: '0.5rem', textAlign: 'center', background: darkMode ? '#333' : '#fff', color: darkMode ? '#fff' : '#222', border: '1px solid #ccc', borderRadius: 6 }}
          />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 8 }}>
            <button type="submit" style={{ fontSize: '1rem', padding: '0.5rem', background: '#25d366', color: '#fff', border: 'none', borderRadius: 6 }}>Unlock</button>
            <button type="button" onClick={() => { setResetMode(true); setError(''); }} style={{ fontSize: '1rem', padding: '0.5rem', background: '#e53935', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}>Reset PIN</button>
          </div>
          {error && <div style={{ color: 'red', textAlign: 'center' }}>{error}</div>}
        </form>
      ) : (
        <form onSubmit={handleResetPin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', minWidth: 250 }}>
          <input
            type="password"
            value={newPin}
            onChange={e => setNewPin(e.target.value.replace(/\D/g, ''))}
            maxLength={4}
            placeholder="New 4-digit PIN"
            style={{ fontSize: '1.2rem', padding: '0.5rem', textAlign: 'center', background: darkMode ? '#333' : '#fff', color: darkMode ? '#fff' : '#222', border: '1px solid #ccc', borderRadius: 6 }}
          />
          <input
            type="password"
            value={confirmPin}
            onChange={e => setConfirmPin(e.target.value.replace(/\D/g, ''))}
            maxLength={4}
            placeholder="Confirm new PIN"
            style={{ fontSize: '1.2rem', padding: '0.5rem', textAlign: 'center', background: darkMode ? '#333' : '#fff', color: darkMode ? '#fff' : '#222', border: '1px solid #ccc', borderRadius: 6 }}
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button type="submit" style={{ fontSize: '1rem', padding: '0.5rem', background: '#25d366', color: '#fff', border: 'none', borderRadius: 6 }}>Set PIN</button>
            <button type="button" onClick={() => { setResetMode(false); setResetError(''); setNewPin(''); setConfirmPin(''); }} style={{ background: 'none', border: 'none', color: '#25d366', textDecoration: 'underline', cursor: 'pointer', fontSize: '1rem' }}>Cancel</button>
          </div>
          {resetError && <div style={{ color: 'red', textAlign: 'center' }}>{resetError}</div>}
        </form>
      )}
    </div>
  );
}

export default LockScreen; 
import React, { useState } from "react";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import VideocamIcon from "@mui/icons-material/Videocam";
import CallIcon from "@mui/icons-material/Call";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import Avatar from "@mui/material/Avatar";
import Stack from "@mui/material/Stack";
import { useTheme } from "@mui/material/styles";
import "./NewCallPanel.css";

const SOCIALX_GREEN = '#25d366';

export default function NewCallPanel({ open, onClose, contacts = [], frequentlyContacted = [] }) {
  const [search, setSearch] = useState("");
  const [selectedContacts, setSelectedContacts] = useState([]);
  const theme = useTheme();

  const isDark = theme.palette.mode === 'dark';
  const panelBg = isDark ? '#23272a' : '#fff';
  const panelText = isDark ? '#fff' : '#23272a';
  const inputBg = isDark ? '#181a1b' : '#f5f5f5';
  const inputText = isDark ? '#fff' : '#23272a';
  const contactRowBg = isDark ? '#333' : '#e0f7ef';
  const subtitleColor = isDark ? '#aaa' : '#555';

  const filteredContacts = contacts.filter(
    c =>
      (c.username || c.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (c.status && c.status.toLowerCase().includes(search.toLowerCase()))
  );

  const filteredFrequent = frequentlyContacted.filter(
    c =>
      (c.username || c.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (c.status && c.status.toLowerCase().includes(search.toLowerCase()))
  );

  const isSelected = (c) => selectedContacts.some(sel => (sel._id || sel.id) === (c._id || c.id));

  const handleToggleContact = (c) => {
    const id = c._id || c.id;
    if (isSelected(c)) {
      setSelectedContacts(selectedContacts.filter(sel => (sel._id || sel.id) !== id));
    } else {
      setSelectedContacts([...selectedContacts, c]);
    }
    setSearch("");
  };

  const handleCancelSelect = () => {
    setSelectedContacts([]);
    setSearch("");
  };

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 60, // Position below the call button (which is at top: 16 + some height)
        left: '50%', // Center horizontally
        transform: 'translateX(-50%)', // Center the panel
        width: 380,
        maxWidth: '90vw',
        maxHeight: 'calc(100vh - 120px)', // Ensure it doesn't exceed viewport height
        borderRadius: 4,
        boxShadow: 8,
        background: panelBg,
        color: panelText,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
        zIndex: 1300,
        overflow: 'hidden',
      }}
    >
      <Box sx={{ p: 0, display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 3, pt: 2, pb: 1, flexShrink: 0 }}>
          <Typography variant="h6" fontWeight={700} sx={{ color: panelText }}>New call</Typography>
          <IconButton onClick={onClose} sx={{ color: panelText }}>
            <CloseIcon />
          </IconButton>
        </Box>
        {/* Search and Selected Contacts */}
        <Box sx={{ px: 3, pb: 1, flexShrink: 0 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              background: inputBg,
              borderRadius: 2,
              p: 1,
              mb: selectedContacts.length > 0 ? 1 : 0,
              minHeight: 48,
              flexWrap: 'wrap',
              gap: 1,
            }}
          >
            {selectedContacts.map((contact, idx) => (
              <Avatar
                key={contact._id || contact.id || contact.username || contact.name || idx}
                src={contact.avatar}
                sx={{ width: 32, height: 32, border: `2px solid ${panelBg}`, bgcolor: '#444', fontSize: 16, mr: 0.5 }}
              >
                {(!contact.avatar && (contact.username ? contact.username[0] : (contact.name ? contact.name[0] : '?')))}
              </Avatar>
            ))}
            <input
              className="search-input"
              type="text"
              placeholder="Search"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                flex: 1,
                minWidth: 80,
                background: 'transparent',
                color: inputText,
                border: 'none',
                outline: 'none',
                borderRadius: 8,
                padding: '10px 12px',
                fontSize: 16,
              }}
            />
          </Box>
          {selectedContacts.length > 0 && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
              <Button
                variant="contained"
                color="success"
                sx={{
                  minWidth: 0,
                  px: 2,
                  bgcolor: SOCIALX_GREEN,
                  '&:hover': { bgcolor: '#1ea851' },
                  boxShadow: 3,
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  '&:hover .MuiSvgIcon-root': { color: '#111' },
                }}
                startIcon={<VideocamIcon sx={{ color: '#fff', fontSize: 28 }} />}
              >
                {/* Video Call */}
              </Button>
              <Button
                variant="contained"
                color="success"
                sx={{
                  minWidth: 0,
                  px: 2,
                  bgcolor: SOCIALX_GREEN,
                  '&:hover': { bgcolor: '#1ea851' },
                  boxShadow: 3,
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  '&:hover .MuiSvgIcon-root': { color: '#111' },
                }}
                startIcon={<CallIcon sx={{ color: '#fff', fontSize: 28 }} />}
              >
                {/* Audio Call */}
              </Button>
              <Button
                variant="outlined"
                color="inherit"
                sx={{ minWidth: 0, px: 2, borderColor: '#555', color: panelText }}
                onClick={handleCancelSelect}
              >
                Cancel
              </Button>
            </Box>
          )}
        </Box>
        {/* Content */}
        <Box sx={{ 
          flex: 1, 
          overflowY: 'auto', 
          px: 3, 
          pb: 2,
          minHeight: 0, // Important for flex child to shrink
          '&::-webkit-scrollbar': {
            width: '6px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            background: isDark ? '#555' : '#ccc',
            borderRadius: '3px',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            background: isDark ? '#777' : '#999',
          },
        }}>
          <Typography variant="subtitle2" sx={{ mt: 1, mb: 0.5, color: subtitleColor }}>Frequently contacted</Typography>
          {(filteredFrequent.length ? filteredFrequent : filteredContacts.slice(0, 2)).length === 0 ? (
            <div style={{ color: subtitleColor }}>No contacts found.</div>
          ) : (
            (filteredFrequent.length ? filteredFrequent : filteredContacts.slice(0, 2)).map((c, i) => {
              const checked = isSelected(c);
              return (
                <div
                  className={`contact-row${checked ? ' selected' : ''}`}
                  key={c._id || c.id || c.username || c.name || i}
                  style={{ cursor: 'pointer', background: checked ? contactRowBg : 'transparent', borderRadius: 8 }}
                  onClick={() => handleToggleContact(c)}
                >
                  <Checkbox
                    checked={checked}
                    tabIndex={-1}
                    sx={{ color: SOCIALX_GREEN, p: 0.5, mr: 1 }}
                    onChange={() => handleToggleContact(c)}
                    onClick={e => e.stopPropagation()}
                  />
                  <div
                    className="avatar"
                    style={{
                      background: isDark ? '#444' : '#e0e0e0',
                      color: isDark ? '#fff' : '#222'
                    }}
                  >
                    {c.avatar ? <img src={c.avatar} alt={c.username || c.name} style={{width: '100%', height: '100%', borderRadius: '50%'}} /> : (c.username ? c.username[0] : (c.name ? c.name[0] : '?'))}
                  </div>
                  <div>
                    <div className="contact-name" style={{ color: panelText }}>{c.username || c.name}</div>
                    <div className="contact-status" style={{ color: subtitleColor }}>{c.status}</div>
                  </div>
                </div>
              );
            })
          )}
          <Typography variant="subtitle2" sx={{ mt: 2, mb: 0.5, color: subtitleColor }}>All contacts</Typography>
          {filteredContacts.length === 0 ? (
            <div style={{ color: subtitleColor }}>No contacts found.</div>
          ) : (
            filteredContacts.map((c, i) => {
              const checked = isSelected(c);
              return (
                <div
                  className={`contact-row${checked ? ' selected' : ''}`}
                  key={c._id || c.id || c.username || c.name || i}
                  style={{ cursor: 'pointer', background: checked ? contactRowBg : 'transparent', borderRadius: 8 }}
                  onClick={() => handleToggleContact(c)}
                >
                  <Checkbox
                    checked={checked}
                    tabIndex={-1}
                    sx={{ color: SOCIALX_GREEN, p: 0.5, mr: 1 }}
                    onChange={() => handleToggleContact(c)}
                    onClick={e => e.stopPropagation()}
                  />
                  <div
                    className="avatar"
                    style={{
                      background: isDark ? '#444' : '#e0e0e0',
                      color: isDark ? '#fff' : '#222'
                    }}
                  >
                    {c.avatar ? <img src={c.avatar} alt={c.username || c.name} style={{width: '100%', height: '100%', borderRadius: '50%'}} /> : (c.username ? c.username[0] : (c.name ? c.name[0] : '?'))}
                  </div>
                  <div>
                    <div className="contact-name" style={{ color: panelText }}>{c.username || c.name}</div>
                    <div className="contact-status" style={{ color: subtitleColor }}>{c.status}</div>
                  </div>
                </div>
              );
            })
          )}
        </Box>
      </Box>
    </Box>
  );
} 
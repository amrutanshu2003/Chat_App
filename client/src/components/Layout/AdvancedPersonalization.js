import React, { useState, useRef } from "react";
import {
  Box, Typography, Divider, Switch, Slider, Select, MenuItem, Button, TextField, InputLabel, FormControl, Avatar, Stack, IconButton, Tooltip, Chip
} from "@mui/material";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import AccessibilityIcon from "@mui/icons-material/Accessibility";
import EmojiEmotionsIcon from "@mui/icons-material/EmojiEmotions";
import ScheduleIcon from "@mui/icons-material/Schedule";
import SecurityIcon from "@mui/icons-material/Security";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";

const fontOptions = [
  { label: "Default", value: "inherit" },
  { label: "Roboto", value: "Roboto, sans-serif" },
  { label: "Montserrat", value: "Montserrat, sans-serif" },
  { label: "Comic Sans", value: "'Comic Sans MS', cursive, sans-serif" }
];

const emojiStyles = [
  { label: "System", value: "system" },
  { label: "Google", value: "google" },
  { label: "Apple", value: "apple" }
];

const languages = [
  { label: "English", value: "en" },
  { label: "Español", value: "es" },
  { label: "Français", value: "fr" },
  { label: "Deutsch", value: "de" }
];

const notificationSounds = [
  { label: "Default", value: "/sounds/default.mp3" },
  { label: "Chime", value: "/sounds/chime.mp3" },
  { label: "Pop", value: "/sounds/pop.mp3" }
];

const colorBlindModes = [
  { label: "None", value: "none" },
  { label: "Deuteranopia", value: "deuteranopia" },
  { label: "Protanopia", value: "protanopia" },
  { label: "Tritanopia", value: "tritanopia" }
];

const quickReactions = ["👍", "😂", "❤️", "😮", "😢", "👏", "🎉", "🔥", "💯", "✨"];

export default function AdvancedPersonalization() {
  const [settings, setSettings] = useState({
    font: fontOptions[0].value,
    textSize: 16,
    emojiStyle: emojiStyles[0].value,
    language: languages[0].value,
    notificationSound: notificationSounds[0].value,
    customEmojis: [],
    scheduledMessages: [],
    ttsEnabled: false,
    incognito: false,
    blurPreviews: false,
    colorBlind: "none",
    reactions: ["👍", "😂", "❤️"],
    customStatus: "",
    highContrast: false,
    reduceMotion: false
  });

  const [emojiUpload, setEmojiUpload] = useState(null);
  const [scheduledMsg, setScheduledMsg] = useState({ text: "", time: "" });
  const [ttsText, setTtsText] = useState("");

  // Handlers
  const handleChange = (key, value) => setSettings(s => ({ ...s, [key]: value }));

  // Custom emoji upload
  const handleEmojiUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setSettings(s => ({
        ...s,
        customEmojis: [...s.customEmojis, url]
      }));
      setEmojiUpload(null);
    }
  };

  // Scheduled messages (local demo)
  const handleScheduleMessage = () => {
    if (!scheduledMsg.text || !scheduledMsg.time) return;
    setSettings(s => ({
      ...s,
      scheduledMessages: [...s.scheduledMessages, { ...scheduledMsg }]
    }));
    setScheduledMsg({ text: "", time: "" });
  };

  // Text-to-speech
  const speak = (text) => {
    if (!text) return;
    const utterance = new window.SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utterance);
  };

  // Quick reaction customization
  const handleReactionPick = (emoji) => {
    if (settings.reactions.includes(emoji)) return;
    setSettings(s => ({ ...s, reactions: s.reactions.length < 5 ? [...s.reactions, emoji] : s.reactions }));
  };
  
  const handleReactionRemove = (emoji) => {
    setSettings(s => ({ ...s, reactions: s.reactions.filter(e => e !== emoji) }));
  };

  return (
    <Box p={3} sx={{ maxWidth: 700, margin: "auto" }}>
      <Typography variant="h4" gutterBottom>🎨 Advanced Personalization</Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        Customize your chat experience with advanced features and accessibility options.
      </Typography>

      {/* Appearance */}
      <Typography variant="h6" gutterBottom>Appearance</Typography>
      <Stack direction="row" spacing={2} alignItems="center" mb={2}>
        <FormControl>
          <InputLabel>Font Style</InputLabel>
          <Select value={settings.font} label="Font Style" onChange={e => handleChange("font", e.target.value)} sx={{ minWidth: 140 }}>
            {fontOptions.map(opt => (
              <MenuItem key={opt.value} value={opt.value} style={{ fontFamily: opt.value }}>{opt.label}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <Box sx={{ width: 120 }}>
          <Typography variant="body2">Text Size</Typography>
          <Slider min={12} max={24} value={settings.textSize} onChange={(_, v) => handleChange("textSize", v)} valueLabelDisplay="auto" />
        </Box>
      </Stack>

      {/* Custom Emoji/Sticker Upload */}
      <Typography variant="h6" gutterBottom>Custom Emojis & Stickers</Typography>
      <Button variant="outlined" component="label" startIcon={<AddPhotoAlternateIcon />} sx={{ mb: 2 }}>
        Upload Emoji/Sticker
        <input type="file" hidden accept="image/*" onChange={handleEmojiUpload} />
      </Button>
      <Stack direction="row" spacing={1} mb={3}>
        {settings.customEmojis.map((url, i) => (
          <Avatar key={i} src={url} variant="rounded" sx={{ width: 32, height: 32 }} />
        ))}
      </Stack>

      {/* Scheduled Messages */}
      <Typography variant="h6" gutterBottom>📅 Scheduled Messages</Typography>
      <Stack direction="row" spacing={2} alignItems="center" mb={2}>
        <TextField
          label="Message"
          value={scheduledMsg.text}
          onChange={e => setScheduledMsg(s => ({ ...s, text: e.target.value }))}
          size="small"
        />
        <TextField
          label="Time"
          type="datetime-local"
          value={scheduledMsg.time}
          onChange={e => setScheduledMsg(s => ({ ...s, time: e.target.value }))}
          size="small"
          InputLabelProps={{ shrink: true }}
        />
        <Button variant="contained" onClick={handleScheduleMessage} startIcon={<ScheduleIcon />}>Schedule</Button>
      </Stack>
      <Box mb={3}>
        {settings.scheduledMessages.map((msg, i) => (
          <Chip key={i} label={`${msg.text} at ${new Date(msg.time).toLocaleString()}`} sx={{ mr: 1, mb: 1 }} />
        ))}
      </Box>

      {/* Text-to-Speech */}
      <Typography variant="h6" gutterBottom>🔊 Text-to-Speech</Typography>
      <Stack direction="row" spacing={2} alignItems="center" mb={3}>
        <Switch checked={settings.ttsEnabled} onChange={e => handleChange("ttsEnabled", e.target.checked)} />
        <Typography>Enable Text-to-Speech</Typography>
      </Stack>
      {settings.ttsEnabled && (
        <Stack direction="row" spacing={2} alignItems="center" mb={3}>
          <TextField
            label="Text to speak"
            value={ttsText}
            onChange={e => setTtsText(e.target.value)}
            size="small"
          />
          <Button variant="contained" onClick={() => speak(ttsText)} startIcon={<VolumeUpIcon />}>Speak</Button>
        </Stack>
      )}

      {/* Quick Reaction Customization */}
      <Typography variant="h6" gutterBottom>⚡ Quick Reactions</Typography>
      <Typography variant="body2" color="text.secondary" mb={1}>
        Pick up to 5 favorite emojis for quick reactions.
      </Typography>
      <Stack direction="row" spacing={1} alignItems="center" mb={1}>
        {settings.reactions.map((emoji, i) => (
          <Avatar
            key={i}
            sx={{ width: 32, height: 32, cursor: "pointer", bgcolor: "#eee", color: "#222" }}
            onClick={() => handleReactionRemove(emoji)}
            title="Remove"
          >
            {emoji}
          </Avatar>
        ))}
        <Typography variant="caption" color="text.secondary">(Click to remove)</Typography>
      </Stack>
      <Stack direction="row" spacing={1} alignItems="center" mb={3}>
        {quickReactions.map((emoji, i) => (
          <Button key={i} onClick={() => handleReactionPick(emoji)}>{emoji}</Button>
        ))}
      </Stack>

      {/* Accessibility */}
      <Typography variant="h6" gutterBottom>♿ Accessibility</Typography>
      <Stack direction="row" spacing={2} alignItems="center" mb={2}>
        <Switch checked={settings.highContrast} onChange={e => handleChange("highContrast", e.target.checked)} />
        <Typography>High Contrast Mode</Typography>
      </Stack>
      <Stack direction="row" spacing={2} alignItems="center" mb={2}>
        <Switch checked={settings.reduceMotion} onChange={e => handleChange("reduceMotion", e.target.checked)} />
        <Typography>Reduce Motion</Typography>
      </Stack>
      <FormControl sx={{ minWidth: 180, mb: 3 }}>
        <InputLabel>Color Blind Mode</InputLabel>
        <Select value={settings.colorBlind} label="Color Blind Mode" onChange={e => handleChange("colorBlind", e.target.value)}>
          {colorBlindModes.map(opt => (
            <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Privacy & Security */}
      <Typography variant="h6" gutterBottom>🔒 Privacy & Security</Typography>
      <Stack direction="row" spacing={2} alignItems="center" mb={2}>
        <Switch checked={settings.incognito} onChange={e => handleChange("incognito", e.target.checked)} />
        <Typography>Incognito/Stealth Mode</Typography>
      </Stack>
      <Stack direction="row" spacing={2} alignItems="center" mb={3}>
        <Switch checked={settings.blurPreviews} onChange={e => handleChange("blurPreviews", e.target.checked)} />
        <Typography>Blur Chat Previews</Typography>
      </Stack>

      {/* Custom Status */}
      <Typography variant="h6" gutterBottom>📝 Custom Status</Typography>
      <TextField
        label="Set a custom status"
        value={settings.customStatus}
        onChange={e => handleChange("customStatus", e.target.value)}
        fullWidth
        sx={{ mb: 3 }}
        inputProps={{ maxLength: 60 }}
      />

      {/* Notification Sound */}
      <Typography variant="h6" gutterBottom>🔔 Notification Sound</Typography>
      <Stack direction="row" spacing={2} alignItems="center" mb={3}>
        <Select value={settings.notificationSound} onChange={e => handleChange("notificationSound", e.target.value)} sx={{ minWidth: 180 }}>
          {notificationSounds.map(opt => (
            <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
          ))}
        </Select>
        <IconButton onClick={() => alert('Playing sound...')}><VolumeUpIcon /></IconButton>
      </Stack>

      {/* Emoji Style */}
      <Typography variant="h6" gutterBottom>😊 Emoji Style</Typography>
      <Select value={settings.emojiStyle} onChange={e => handleChange("emojiStyle", e.target.value)} sx={{ minWidth: 180, mb: 3 }}>
        {emojiStyles.map(opt => (
          <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
        ))}
      </Select>

      {/* Language */}
      <Typography variant="h6" gutterBottom>🌍 Language</Typography>
      <Select value={settings.language} onChange={e => handleChange("language", e.target.value)} sx={{ minWidth: 180, mb: 3 }}>
        {languages.map(opt => (
          <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
        ))}
      </Select>

      <Divider sx={{ my: 3 }} />

      <Button variant="contained" color="primary" size="large" sx={{ bgcolor: '#25d366' }}>
        Save All Changes
      </Button>
    </Box>
  );
} 
import React, { useState } from "react";
import { Box, Typography, Stack, Avatar, Fade } from "@mui/material";
import EmojiEmotionsIcon from "@mui/icons-material/EmojiEmotions";
import SelfImprovementIcon from "@mui/icons-material/SelfImprovement";
import BoltIcon from "@mui/icons-material/Bolt";
import PsychologyIcon from "@mui/icons-material/Psychology";
import NightsStayIcon from "@mui/icons-material/NightsStay";

const moods = [
  {
    key: "happy",
    label: "Happy",
    icon: <EmojiEmotionsIcon fontSize="large" />,
    colors: { bg: "#fffbe7", accent: "#ffd600" },
    animation: "radial-gradient(circle at 20% 20%, #fffbe7 0%, #ffe082 100%)"
  },
  {
    key: "calm",
    label: "Calm",
    icon: <SelfImprovementIcon fontSize="large" />,
    colors: { bg: "#e3f2fd", accent: "#64b5f6" },
    animation: "linear-gradient(135deg, #e3f2fd 0%, #b3e5fc 100%)"
  },
  {
    key: "energetic",
    label: "Energetic",
    icon: <BoltIcon fontSize="large" />,
    colors: { bg: "#fff3e0", accent: "#ff9800" },
    animation: "repeating-linear-gradient(45deg, #fff3e0, #ffe0b2 20px, #ff9800 40px)"
  },
  {
    key: "focused",
    label: "Focused",
    icon: <PsychologyIcon fontSize="large" />,
    colors: { bg: "#ede7f6", accent: "#7e57c2" },
    animation: "linear-gradient(120deg, #ede7f6 0%, #b39ddb 100%)"
  },
  {
    key: "night",
    label: "Night",
    icon: <NightsStayIcon fontSize="large" />,
    colors: { bg: "#212121", accent: "#90caf9" },
    animation: "radial-gradient(circle at 80% 20%, #212121 0%, #424242 100%)"
  }
];

export default function MoodThemeSelector() {
  const [selectedMood, setSelectedMood] = useState(moods[0].key);

  const mood = moods.find(m => m.key === selectedMood);

  return (
    <Box p={3} sx={{ maxWidth: 500, margin: "auto" }}>
      <Typography variant="h5" gutterBottom>🌈 Mood-Based Dynamic Theme</Typography>
      <Typography variant="body2" color="text.secondary" mb={2}>
        Select your current mood and watch the chat theme adapt instantly!
      </Typography>
      <Stack direction="row" spacing={2} mb={3}>
        {moods.map(m => (
          <Avatar
            key={m.key}
            sx={{
              bgcolor: m.colors.accent,
              color: "#222",
              width: 56,
              height: 56,
              border: selectedMood === m.key ? "3px solid #222" : "2px solid #eee",
              cursor: "pointer",
              transition: "border 0.2s"
            }}
            onClick={() => setSelectedMood(m.key)}
            title={m.label}
          >
            {m.icon}
          </Avatar>
        ))}
      </Stack>
      <Fade in>
        <Box
          sx={{
            borderRadius: 3,
            p: 3,
            minHeight: 120,
            background: mood.animation,
            color: mood.key === "night" ? "#fff" : "#222",
            boxShadow: 2,
            transition: "background 0.5s"
          }}
        >
          <Typography variant="h6" gutterBottom>
            {mood.label} Mode
          </Typography>
          <Typography variant="body1">
            This is how your chat will look and feel when you're feeling <b>{mood.label.toLowerCase()}</b>!
          </Typography>
        </Box>
      </Fade>
    </Box>
  );
} 
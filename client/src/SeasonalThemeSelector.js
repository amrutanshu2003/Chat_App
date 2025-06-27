import React, { useState, useEffect } from "react";
import { Box, Typography, Stack, Avatar, Fade, Button } from "@mui/material";
import WbSunnyIcon from "@mui/icons-material/WbSunny";
import AcUnitIcon from "@mui/icons-material/AcUnit";
import SpaIcon from "@mui/icons-material/Spa";
import ForestIcon from "@mui/icons-material/Forest";

const seasons = [
  {
    key: "spring",
    label: "Spring",
    icon: <SpaIcon fontSize="large" />,
    colors: { bg: "#e8f5e9", accent: "#66bb6a" },
    animation: "linear-gradient(135deg, #e8f5e9 0%, #b2dfdb 100%)"
  },
  {
    key: "summer",
    label: "Summer",
    icon: <WbSunnyIcon fontSize="large" />,
    colors: { bg: "#fffde7", accent: "#ffd54f" },
    animation: "linear-gradient(135deg, #fffde7 0%, #ffe082 100%)"
  },
  {
    key: "autumn",
    label: "Autumn",
    icon: <ForestIcon fontSize="large" />,
    colors: { bg: "#fbe9e7", accent: "#ff8a65" },
    animation: "linear-gradient(135deg, #fbe9e7 0%, #ffccbc 100%)"
  },
  {
    key: "winter",
    label: "Winter",
    icon: <AcUnitIcon fontSize="large" />,
    colors: { bg: "#e3f2fd", accent: "#90caf9" },
    animation: "linear-gradient(135deg, #e3f2fd 0%, #b3e5fc 100%)"
  }
];

// Helper to get current season
function getCurrentSeason() {
  const month = new Date().getMonth() + 1;
  if (month >= 3 && month <= 5) return "spring";
  if (month >= 6 && month <= 8) return "summer";
  if (month >= 9 && month <= 11) return "autumn";
  return "winter";
}

export default function SeasonalThemeSelector({ seasonalTheme, setSeasonalTheme, getCurrentSeason }) {
  const [selectedSeason, setSelectedSeason] = useState(seasonalTheme === 'auto' ? getCurrentSeason() : seasonalTheme);
  const season = seasons.find(s => s.key === selectedSeason) || seasons[0]; // Fallback to first season if not found

  useEffect(() => {
    const currentSeason = seasonalTheme === 'auto' ? getCurrentSeason() : seasonalTheme;
    // Ensure the season is valid
    const validSeason = seasons.find(s => s.key === currentSeason) ? currentSeason : 'spring';
    setSelectedSeason(validSeason);
  }, [seasonalTheme, getCurrentSeason]);

  // Safety check for required props (after hooks)
  // console.error('SeasonalThemeSelector: Missing required props', { seasonalTheme, setSeasonalTheme, getCurrentSeason });

  const handleSeasonSelect = (seasonKey) => {
    console.log('Season selected:', seasonKey);
    setSelectedSeason(seasonKey);
    setSeasonalTheme(seasonKey);
    // No direct localStorage.setItem here; handled in App.js
    // Show success message
    const selectedSeasonData = seasons.find(s => s.key === seasonKey);
    if (selectedSeasonData) {
      alert(`Theme changed to ${selectedSeasonData.label}! The app should now have a ${selectedSeasonData.label.toLowerCase()} color scheme.`);
    }
  };

  return (
    <Box p={3} sx={{ maxWidth: 500, margin: "auto" }}>
      <Typography variant="h5" gutterBottom>🍃 Seasonal Theme</Typography>
      <Typography variant="body2" color="text.secondary" mb={2}>
        The app adapts to the current season! You can also pick your favorite.
      </Typography>
      
      {/* Current Theme Indicator */}
      <Box sx={{ 
        p: 2, 
        mb: 3, 
        borderRadius: 2, 
        bgcolor: season.colors.bg,
        border: `2px solid ${season.colors.accent}`,
        textAlign: 'center'
      }}>
        <Typography variant="h6" sx={{ color: '#222', mb: 1 }}>
          Current Theme: {season.label}
        </Typography>
        <Typography variant="body2" sx={{ color: '#555' }}>
          Primary: {season.colors.accent} | Background: {season.colors.bg}
        </Typography>
      </Box>
      
      {/* Auto/Manual Toggle */}
      <Box display="flex" justifyContent="center" mb={3}>
        <Button
          variant={seasonalTheme === 'auto' ? 'contained' : 'outlined'}
          onClick={() => setSeasonalTheme('auto')}
          sx={{ mr: 2 }}
        >
          Auto ({getCurrentSeason()})
        </Button>
        <Button
          variant={seasonalTheme !== 'auto' ? 'contained' : 'outlined'}
          onClick={() => setSeasonalTheme(selectedSeason)}
        >
          Manual
        </Button>
      </Box>
      
      <Stack direction="row" spacing={2} mb={3}>
        {seasons.map(s => (
          <Avatar
            key={s.key}
            sx={{
              bgcolor: s.colors.accent,
              color: "#222",
              width: 56,
              height: 56,
              border: selectedSeason === s.key ? "4px solid #222" : "2px solid #eee",
              cursor: "pointer",
              transition: "border 0.2s, transform 0.2s",
              transform: selectedSeason === s.key ? "scale(1.1)" : "scale(1)",
              boxShadow: selectedSeason === s.key ? "0 4px 12px rgba(0,0,0,0.3)" : "0 2px 8px rgba(0,0,0,0.1)"
            }}
            onClick={() => handleSeasonSelect(s.key)}
            title={s.label}
          >
            {s.icon}
          </Avatar>
        ))}
      </Stack>
      <Fade in>
        <Box
          sx={{
            borderRadius: 3,
            p: 3,
            minHeight: 120,
            background: season.animation,
            color: "#222",
            boxShadow: 2,
            transition: "background 0.5s"
          }}
        >
          <Typography variant="h6" gutterBottom>
            {season.label} Theme
          </Typography>
          <Typography variant="body1">
            Enjoy a {season.label.toLowerCase()}-inspired look and feel!
          </Typography>
          {seasonalTheme === 'auto' && (
            <Typography variant="caption" sx={{ display: 'block', mt: 1, opacity: 0.7 }}>
              Currently in auto mode - will change with the season
            </Typography>
          )}
          
          {/* Live Color Preview */}
          <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Box sx={{ 
              width: 40, 
              height: 40, 
              bgcolor: season.colors.accent, 
              borderRadius: 1,
              border: '2px solid #222'
            }} title="Primary Color" />
            <Box sx={{ 
              width: 40, 
              height: 40, 
              bgcolor: season.colors.bg, 
              borderRadius: 1,
              border: '2px solid #222'
            }} title="Background Color" />
          </Box>
          
          {/* Test Theme Changes Button */}
          <Button
            variant="outlined"
            size="small"
            onClick={() => {
              const currentIndex = seasons.findIndex(s => s.key === selectedSeason);
              const nextIndex = (currentIndex + 1) % seasons.length;
              const nextSeason = seasons[nextIndex];
              handleSeasonSelect(nextSeason.key);
            }}
            sx={{ mt: 2, fontSize: '0.75rem' }}
          >
            🎨 Test Next Theme
          </Button>
        </Box>
      </Fade>
    </Box>
  );
} 
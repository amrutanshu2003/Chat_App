import React, { useState } from "react";
import { Box, Typography, Avatar, Paper, Stack, Chip } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import MicIcon from "@mui/icons-material/Mic";

export default function LiveThemePreview({ theme, accentColor, font, textSize, bubbleShape, bubbleColor, background }) {
  const [previewMessage, setPreviewMessage] = useState("");

  const bubbleStyle = {
    borderRadius: bubbleShape === "rounded" ? 16 : bubbleShape === "classic" ? 8 : 0,
    background: bubbleColor,
    padding: "8px 12px",
    margin: "4px 0",
    maxWidth: "70%",
    wordWrap: "break-word"
  };

  const sampleMessages = [
    { text: "Hey! How are you doing?", sender: "them", time: "2:30 PM" },
    { text: "I'm doing great! Just finished the project 🎉", sender: "me", time: "2:32 PM" },
    { text: "That's awesome! Can't wait to see it", sender: "them", time: "2:33 PM" },
    { text: "Thanks! I'll share it with you soon", sender: "me", time: "2:35 PM" }
  ];

  return (
    <Box p={3} sx={{ maxWidth: 400, margin: "auto" }}>
      <Typography variant="h6" gutterBottom>💬 Live Chat Preview</Typography>
      <Typography variant="body2" color="text.secondary" mb={2}>
        See how your theme looks in a real chat conversation.
      </Typography>
      
      {/* Chat Header */}
      <Paper 
        elevation={2} 
        sx={{ 
          p: 2, 
          mb: 2, 
          background: accentColor, 
          color: "#fff",
          borderRadius: "12px 12px 0 0"
        }}
      >
        <Stack direction="row" alignItems="center" spacing={2}>
          <Avatar sx={{ width: 40, height: 40, bgcolor: "rgba(255,255,255,0.2)" }}>J</Avatar>
          <Box>
            <Typography variant="subtitle1" fontWeight={600}>John Doe</Typography>
            <Typography variant="caption" sx={{ opacity: 0.8 }}>Online</Typography>
          </Box>
        </Stack>
      </Paper>

      {/* Chat Messages */}
      <Paper 
        elevation={1} 
        sx={{ 
          p: 2, 
          mb: 2, 
          minHeight: 300,
          background: background || "#f5f5f5",
          backgroundImage: background ? `url(${background})` : "none",
          backgroundSize: "cover",
          backgroundPosition: "center",
          borderRadius: "0 0 12px 12px",
          fontFamily: font,
          fontSize: textSize
        }}
      >
        <Stack spacing={1}>
          {sampleMessages.map((msg, index) => (
            <Box 
              key={index}
              display="flex" 
              justifyContent={msg.sender === "me" ? "flex-end" : "flex-start"}
            >
              <Box sx={{ ...bubbleStyle, alignSelf: msg.sender === "me" ? "flex-end" : "flex-start" }}>
                <Typography variant="body2" sx={{ color: msg.sender === "me" ? "#fff" : "#000" }}>
                  {msg.text}
                </Typography>
                <Typography variant="caption" sx={{ 
                  color: msg.sender === "me" ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.5)",
                  fontSize: "0.7rem",
                  display: "block",
                  textAlign: "right",
                  mt: 0.5
                }}>
                  {msg.time}
                </Typography>
              </Box>
            </Box>
          ))}
        </Stack>
      </Paper>

      {/* Message Input */}
      <Paper 
        elevation={2} 
        sx={{ 
          p: 2, 
          background: "#fff",
          borderRadius: "12px"
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <IconButton size="small" sx={{ color: accentColor }}>
            <AttachFileIcon />
          </IconButton>
          <Box 
            sx={{ 
              flex: 1, 
              p: 1, 
              border: `1px solid ${accentColor}20`,
              borderRadius: 2,
              background: "#f8f9fa"
            }}
          >
            <Typography variant="body2" color="text.secondary">
              Type a message...
            </Typography>
          </Box>
          <IconButton size="small" sx={{ color: accentColor }}>
            <MicIcon />
          </IconButton>
          <IconButton 
            size="small" 
            sx={{ 
              background: accentColor, 
              color: "#fff",
              "&:hover": { background: accentColor }
            }}
          >
            <SendIcon fontSize="small" />
          </IconButton>
        </Stack>
      </Paper>

      {/* Theme Info */}
      <Box mt={2} p={2} sx={{ background: "#f8f9fa", borderRadius: 2 }}>
        <Typography variant="caption" color="text.secondary">
          <strong>Current Theme:</strong> {theme} • <strong>Accent:</strong> {accentColor} • <strong>Font:</strong> {font.replace(/,.*$/, '')} • <strong>Size:</strong> {textSize}px
        </Typography>
      </Box>
    </Box>
  );
} 
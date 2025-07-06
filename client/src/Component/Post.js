import React from 'react';
import { Box, Typography, Avatar, Paper } from '@mui/material';

const Post = ({ post }) => {
  if (!post) return null;

  return (
    <Paper elevation={2} sx={{ p: 2, mb: 2, borderRadius: 2 }}>
      <Box display="flex" alignItems="center" mb={1}>
        <Avatar src={post.author?.avatar} alt={post.author?.username} sx={{ mr: 2 }} />
        <Typography variant="subtitle1" fontWeight="bold">
          {post.author?.username || 'Unknown'}
        </Typography>
      </Box>
      <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
        {post.content}
      </Typography>
      {post.image && (
        <Box mt={2}>
          <img src={post.image} alt="Post" style={{ maxWidth: '100%', borderRadius: 8 }} />
        </Box>
      )}
    </Paper>
  );
};

export default Post;

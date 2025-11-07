import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Typography,
  TextField,
  Button,
  Paper,
  Box,
  Chip,
  Divider,
  CircularProgress,
} from '@mui/material';

const AskQuestion = () => {
  const [formData, setFormData] = useState({
    title: '',
    body: '',
    tags: '',
  });
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);

  const { title, body } = formData;

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleTagInputChange = (e) => {
    setTagInput(e.target.value);
  };

  const handleTagKeyDown = (e) => {
    if (['Enter', 'Tab', ','].includes(e.key)) {
      e.preventDefault();
      
      const tag = tagInput.trim();
      
      if (tag && !tags.includes(tag)) {
        setTags([...tags, tag]);
        setTagInput('');
      }
    }
  };

  const removeTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    if (tags.length === 0) {
      // Show error about required tags
      return;
    }
    
    try {
      setLoading(true);
      // TODO: Implement question submission
      console.log('Submitting question:', { title, body, tags });
      // Reset form
      setFormData({ title: '', body: '', tags: '' });
      setTags([]);
      // Navigate to the new question
      // navigate(`/questions/${questionId}`);
    } catch (err) {
      console.error('Error submitting question:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <Container maxWidth="md" sx={{ my: 4 }}>
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            Please sign in to ask a question
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('/login')}
          >
            Sign In
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ my: 4 }}>
      <Typography variant="h4" gutterBottom>
        Ask a Question
      </Typography>
      
      <Paper elevation={3} sx={{ p: 4 }}>
        <form onSubmit={onSubmit}>
          {/* Title */}
          <Box mb={3}>
            <Typography variant="subtitle1" gutterBottom>
              Title
              <Typography component="span" color="error">*</Typography>
            </Typography>
            <Typography variant="caption" display="block" gutterBottom>
              Be specific and imagine you're asking a question to another person
            </Typography>
            <TextField
              fullWidth
              variant="outlined"
              name="title"
              value={title}
              onChange={onChange}
              placeholder="e.g. Is there an R function for finding the index of an element in a vector?"
              required
            />
          </Box>

          {/* Body */}
          <Box mb={3}>
            <Typography variant="subtitle1" gutterBottom>
              Body
              <Typography component="span" color="error">*</Typography>
            </Typography>
            <Typography variant="caption" display="block" gutterBottom>
              Include all the information someone would need to answer your question
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={10}
              variant="outlined"
              name="body"
              value={body}
              onChange={onChange}
              placeholder="Enter your question details here..."
              required
            />
          </Box>

          {/* Tags */}
          <Box mb={4}>
            <Typography variant="subtitle1" gutterBottom>
              Tags
              <Typography component="span" color="error">*</Typography>
            </Typography>
            <Typography variant="caption" display="block" gutterBottom>
              Add up to 5 tags to describe what your question is about
            </Typography>
            <TextField
              fullWidth
              variant="outlined"
              value={tagInput}
              onChange={handleTagInputChange}
              onKeyDown={handleTagKeyDown}
              placeholder="e.g. (react javascript css)"
              helperText="Press enter, tab or comma to add a tag"
            />
            <Box mt={1}>
              {tags.map((tag) => (
                <Chip
                  key={tag}
                  label={tag}
                  onDelete={() => removeTag(tag)}
                  sx={{ m: 0.5 }}
                />
              ))}
            </Box>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Button
            type="submit"
            variant="contained"
            color="primary"
            size="large"
            disabled={loading || !title || !body || tags.length === 0}
          >
            {loading ? <CircularProgress size={24} /> : 'Post Your Question'}
          </Button>
        </form>
      </Paper>
    </Container>
  );
};

export default AskQuestion;

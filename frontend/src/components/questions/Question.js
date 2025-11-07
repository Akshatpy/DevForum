import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  Divider,
  Chip,
  Avatar,
  TextField,
  CircularProgress,
} from '@mui/material';
import { formatDistanceToNow } from 'date-fns';
import { ThumbUp, ThumbDown, Comment as CommentIcon } from '@mui/icons-material';

const Question = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [answer, setAnswer] = useState('');
  const [answers, setAnswers] = useState([]);

  useEffect(() => {
    // Fetch question and answers
    const fetchQuestion = async () => {
      try {
        // TODO: Replace with actual API call
        // const res = await axios.get(`/api/questions/${id}`);
        // setQuestion(res.data);
        // setAnswers(res.data.answers || []);
        
        // Mock data for now
        setQuestion({
          _id: id,
          title: 'Sample Question Title',
          body: 'This is a sample question body. It can contain markdown or HTML content.',
          tags: ['react', 'javascript', 'frontend'],
          author: {
            _id: '1',
            username: 'sampleuser',
            avatar: '',
          },
          votes: [],
          views: 10,
          createdAt: new Date(),
        });
        
        setAnswers([
          {
            _id: '1',
            body: 'This is a sample answer to the question.',
            author: {
              _id: '2',
              username: 'anotheruser',
              avatar: '',
            },
            votes: [],
            isAccepted: false,
            createdAt: new Date(),
          },
        ]);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching question:', err);
        setLoading(false);
      }
    };

    fetchQuestion();
  }, [id]);

  const handleVote = async (type, id, isQuestion = true) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    try {
      // TODO: Implement voting logic
      console.log(`Voted ${type} on ${isQuestion ? 'question' : 'answer'} ${id}`);
    } catch (err) {
      console.error('Error voting:', err);
    }
  };

  const handleSubmitAnswer = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    try {
      // TODO: Implement answer submission
      console.log('Submitting answer:', answer);
      setAnswer('');
    } catch (err) {
      console.error('Error submitting answer:', err);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" my={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (!question) {
    return (
      <Container maxWidth="md" sx={{ my: 4 }}>
        <Typography variant="h5">Question not found</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ my: 4 }}>
      {/* Question */}
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Box display="flex" mb={2}>
          <Box display="flex" flexDirection="column" alignItems="center" mr={2}>
            <Button onClick={() => handleVote('up', question._id)}>
              <ThumbUp />
            </Button>
            <Typography variant="h6">{question.votes?.length || 0}</Typography>
            <Button onClick={() => handleVote('down', question._id)}>
              <ThumbDown />
            </Button>
          </Box>
          <Box flexGrow={1}>
            <Typography variant="h4" gutterBottom>
              {question.title}
            </Typography>
            <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
              {question.tags?.map((tag) => (
                <Chip key={tag} label={tag} size="small" />
              ))}
            </Box>
            <Typography variant="body1" paragraph>
              {question.body}
            </Typography>
            <Box display="flex" justifyContent="space-between" mt={4}>
              <Box display="flex" alignItems="center">
                <Avatar src={question.author?.avatar} sx={{ mr: 1 }} />
                <Box>
                  <Typography variant="subtitle2">
                    {question.author?.username}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    asked {formatDistanceToNow(new Date(question.createdAt), { addSuffix: true })}
                  </Typography>
                </Box>
              </Box>
              <Box>
                <Typography variant="caption" color="textSecondary">
                  {question.views} views
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      </Paper>

      {/* Answers */}
      <Typography variant="h6" gutterBottom>
        {answers.length} {answers.length === 1 ? 'Answer' : 'Answers'}
      </Typography>
      
      {answers.map((answer) => (
        <Paper key={answer._id} elevation={1} sx={{ p: 3, mb: 2 }}>
          <Box display="flex">
            <Box display="flex" flexDirection="column" alignItems="center" mr={2}>
              <Button onClick={() => handleVote('up', answer._id, false)}>
                <ThumbUp />
              </Button>
              <Typography variant="h6">{answer.votes?.length || 0}</Typography>
              <Button onClick={() => handleVote('down', answer._id, false)}>
                <ThumbDown />
              </Button>
              {answer.isAccepted && (
                <Chip
                  label="Accepted"
                  color="success"
                  size="small"
                  sx={{ mt: 1 }}
                />
              )}
            </Box>
            <Box flexGrow={1}>
              <Typography variant="body1" paragraph>
                {answer.body}
              </Typography>
              <Box display="flex" justifyContent="space-between" mt={2}>
                <Box display="flex" alignItems="center">
                  <Avatar src={answer.author?.avatar} sx={{ width: 24, height: 24, mr: 1 }} />
                  <Typography variant="subtitle2">
                    {answer.author?.username}
                  </Typography>
                </Box>
                <Typography variant="caption" color="textSecondary">
                  answered {formatDistanceToNow(new Date(answer.createdAt), { addSuffix: true })}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Paper>
      ))}

      {/* Answer Form */}
      <Box mt={6}>
        <Typography variant="h6" gutterBottom>
          Your Answer
        </Typography>
        <form onSubmit={handleSubmitAnswer}>
          <TextField
            fullWidth
            multiline
            rows={6}
            variant="outlined"
            placeholder="Write your answer here..."
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            required
            sx={{ mb: 2 }}
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={!isAuthenticated}
          >
            Post Your Answer
          </Button>
          {!isAuthenticated && (
            <Typography variant="caption" display="block" color="error">
              Please login to post an answer.
            </Typography>
          )}
        </form>
      </Box>
    </Container>
  );
};

export default Question;

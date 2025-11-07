import React, { useEffect, useState } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { formatDistanceToNow } from 'date-fns';
import {
  Container,
  Box,
  Typography,
  Paper,
  Avatar,
  Tabs,
  Tab,
  Divider,
  Chip,
  CircularProgress,
  Button,
} from '@mui/material';
import {
  Person as PersonIcon,
  QuestionAnswer as QuestionAnswerIcon,
  ThumbUp as ThumbUpIcon,
  CalendarToday as CalendarIcon,
} from '@mui/icons-material';

const Profile = () => {
  const { username } = useParams();
  const [activeTab, setActiveTab] = useState(0);
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user: currentUser } = useSelector((state) => state.auth);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // TODO: Replace with actual API call
        // const res = await axios.get(`/api/users/${username}`);
        // setProfileData(res.data);
        
        // Mock data for now
        setTimeout(() => {
          setProfileData({
            _id: '1',
            username: username || 'sampleuser',
            email: 'user@example.com',
            bio: 'Full-stack developer passionate about React, Node.js, and open source.',
            avatar: '',
            reputation: 1250,
            joinedAt: new Date('2023-01-15'),
            questions: [
              {
                _id: 'q1',
                title: 'How to use React hooks effectively?',
                votes: 15,
                answers: 5,
                views: 120,
                createdAt: new Date('2023-05-10'),
              },
              {
                _id: 'q2',
                title: 'Best practices for MongoDB schema design',
                votes: 8,
                answers: 3,
                views: 85,
                createdAt: new Date('2023-06-22'),
              },
            ],
            answers: [
              {
                _id: 'a1',
                question: {
                  _id: 'q3',
                  title: 'How to deploy a MERN stack application?',
                },
                votes: 10,
                isAccepted: true,
                createdAt: new Date('2023-07-05'),
              },
            ],
          });
          setLoading(false);
        }, 500);
      } catch (err) {
        console.error('Error fetching profile:', err);
        setLoading(false);
      }
    };

    fetchProfile();
  }, [username]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" my={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (!profileData) {
    return (
      <Container maxWidth="md" sx={{ my: 4 }}>
        <Typography variant="h5">Profile not found</Typography>
      </Container>
    );
  }

  const isCurrentUser = currentUser?.username === profileData.username;

  return (
    <Container maxWidth="lg" sx={{ my: 4 }}>
      {/* Profile Header */}
      <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
        <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={4}>
          <Box display="flex" flexDirection="column" alignItems="center">
            <Avatar
              src={profileData.avatar}
              sx={{ width: 120, height: 120, mb: 2 }}
            >
              {profileData.username.charAt(0).toUpperCase()}
            </Avatar>
            {isCurrentUser && (
              <Button 
                variant="outlined" 
                size="small"
                // onClick={() => setEditMode(true)}
              >
                Edit Profile
              </Button>
            )}
          </Box>
          
          <Box flexGrow={1}>
            <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
              <Typography variant="h4">{profileData.username}</Typography>
              <Chip 
                icon={<ThumbUpIcon />} 
                label={`${profileData.reputation} Reputation`} 
                color="primary"
                variant="outlined"
              />
            </Box>
            
            {profileData.bio && (
              <Typography variant="body1" paragraph>
                {profileData.bio}
              </Typography>
            )}
            
            <Box display="flex" flexWrap="wrap" gap={3} mt={2}>
              <Box display="flex" alignItems="center">
                <PersonIcon color="action" sx={{ mr: 1 }} />
                <Typography variant="body2" color="textSecondary">
                  {profileData.questions?.length || 0} Questions • {profileData.answers?.length || 0} Answers
                </Typography>
              </Box>
              <Box display="flex" alignItems="center">
                <CalendarIcon color="action" sx={{ mr: 1 }} />
                <Typography variant="body2" color="textSecondary">
                  Joined {formatDistanceToNow(new Date(profileData.joinedAt), { addSuffix: true })}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      </Paper>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange}
          aria-label="profile tabs"
        >
          <Tab label="Questions" />
          <Tab label="Answers" />
          <Tab label="Activity" />
        </Tabs>
      </Box>

      {/* Tab Content */}
      <Box sx={{ pt: 2 }}>
        {activeTab === 0 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              {profileData.questions?.length || 0} Questions
            </Typography>
            {profileData.questions?.length > 0 ? (
              profileData.questions.map((question) => (
                <Paper key={question._id} elevation={1} sx={{ p: 3, mb: 2 }}>
                  <Box display="flex" alignItems="center" mb={1}>
                    <Box display="flex" alignItems="center" mr={3}>
                      <ThumbUpIcon color="action" fontSize="small" sx={{ mr: 0.5 }} />
                      <Typography variant="body2" color="text.secondary">
                        {question.votes} votes
                      </Typography>
                    </Box>
                    <Box display="flex" alignItems="center" mr={3}>
                      <QuestionAnswerIcon color="action" fontSize="small" sx={{ mr: 0.5 }} />
                      <Typography variant="body2" color="text.secondary">
                        {question.answers} answers
                      </Typography>
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      {formatDistanceToNow(new Date(question.createdAt), { addSuffix: true })}
                    </Typography>
                  </Box>
                  <Typography 
                    component={RouterLink}
                    to={`/questions/${question._id}`}
                    variant="h6"
                    sx={{
                      display: 'block',
                      mb: 1,
                      textDecoration: 'none',
                      color: 'primary.main',
                      '&:hover': {
                        textDecoration: 'underline',
                      },
                    }}
                  >
                    {question.title}
                  </Typography>
                </Paper>
              ))
            ) : (
              <Typography>No questions yet.</Typography>
            )}
          </Box>
        )}

        {activeTab === 1 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              {profileData.answers?.length || 0} Answers
            </Typography>
            {profileData.answers?.length > 0 ? (
              profileData.answers.map((answer) => (
                <Paper key={answer._id} elevation={1} sx={{ p: 3, mb: 2 }}>
                  <Box display="flex" alignItems="center" mb={1}>
                    <Box display="flex" alignItems="center" mr={3}>
                      <ThumbUpIcon color="action" fontSize="small" sx={{ mr: 0.5 }} />
                      <Typography variant="body2" color="text.secondary">
                        {answer.votes} votes
                      </Typography>
                      {answer.isAccepted && (
                        <Chip
                          label="Accepted"
                          color="success"
                          size="small"
                          sx={{ ml: 1 }}
                        />
                      )}
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      {formatDistanceToNow(new Date(answer.createdAt), { addSuffix: true })}
                    </Typography>
                  </Box>
                  <Typography 
                    component={RouterLink}
                    to={`/questions/${answer.question._id}`}
                    variant="subtitle1"
                    sx={{
                      display: 'block',
                      textDecoration: 'none',
                      color: 'text.primary',
                      '&:hover': {
                        textDecoration: 'underline',
                      },
                    }}
                  >
                    {answer.question.title}
                  </Typography>
                </Paper>
              ))
            ) : (
              <Typography>No answers yet.</Typography>
            )}
          </Box>
        )}

        {activeTab === 2 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Recent Activity
            </Typography>
            <Typography>Activity feed will be displayed here.</Typography>
            {/* Activity feed implementation would go here */}
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default Profile;

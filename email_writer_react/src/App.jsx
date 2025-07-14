import React, { useState, useEffect } from 'react';
import { 
    Container, Typography, Box, TextField, FormControl, InputLabel, 
    MenuItem, Select, Button, CircularProgress, Paper, Card, 
    CardContent, Dialog, DialogTitle, DialogContent, DialogActions,
    Grid, Divider, List, ListItem, ListItemText, CssBaseline,
    Tabs, Tab, AppBar, Toolbar, Avatar, Chip, LinearProgress
} from '@mui/material';
import { createTheme, ThemeProvider, styled } from '@mui/material/styles';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import { saveAs } from 'file-saver';
import { 
    ContentCopy, Download, History, Dashboard, 
    Email, Palette, AutoAwesome 
} from '@mui/icons-material';

// Custom Styled Components
const GradientCard = styled(Card)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)`,
  border: `1px solid ${theme.palette.divider}`,
  backdropFilter: 'blur(10px)',
  borderRadius: '16px',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: theme.shadows[8]
  }
}));

const AnimatedButton = styled(Button)(({ theme }) => ({
  transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[4]
  }
}));

// Custom Theme
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#6C5CE7',
      light: '#A29BFE',
      dark: '#5649C0'
    },
    secondary: {
      main: '#00B894',
      light: '#55EFC4',
      dark: '#00A383'
    },
    background: {
      default: '#F5F6FA',
      paper: '#FFFFFF'
    },
    text: {
      primary: '#2D3436',
      secondary: '#636E72'
    },
    divider: 'rgba(0,0,0,0.08)'
  },
  typography: {
    fontFamily: '"Inter", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 700,
      letterSpacing: '-0.5px'
    },
    h6: {
      fontWeight: 600,
      letterSpacing: '-0.25px'
    },
    body1: {
      lineHeight: 1.6
    },
    button: {
      textTransform: 'none',
      fontWeight: 600
    }
  },
  shape: {
    borderRadius: 12
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          padding: '12px 24px',
          borderRadius: '12px',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none'
          }
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '16px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
          overflow: 'visible'
        }
      }
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: '12px',
            '& fieldset': {
              borderColor: 'rgba(0,0,0,0.1)'
            },
            '&:hover fieldset': {
              borderColor: 'rgba(0,0,0,0.2)'
            }
          }
        }
      }
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          borderRadius: '12px !important'
        }
      }
    }
  }
});

function App() {
    const [activeTab, setActiveTab] = useState('generator');
    const [emailContent, setEmailContent] = useState('');
    const [instructions, setInstructions] = useState('');
    const [tone, setTone] = useState('');
    const [generatedReply, setGeneratedReply] = useState('');
    const [loading, setLoading] = useState(false);
    const [history, setHistory] = useState([]);
    const [openHistoryModal, setOpenHistoryModal] = useState(false);
    const [stats, setStats] = useState({
        totalRepliesGenerated: 0,
        mostUsedTone: 'N/A',
        averageReplyLength: 0
    });

    const [promptHistory, setPromptHistory] = useState([
        { prompt: "Client project update", tone: "Professional", timestamp: new Date().toLocaleString() },
        { prompt: "Team collaboration", tone: "Friendly", timestamp: new Date().toLocaleString() },
        { prompt: "Sales pitch follow-up", tone: "Casual", timestamp: new Date().toLocaleString() }
    ]);

    async function handleSubmit() {
        setLoading(true);
        try {
            const response = await axios.post("http://localhost:9191/api/email/generate", {
                emailContent,
                instructions,
                tone
            });
            
            const newReply = response.data;
            setGeneratedReply(newReply);
            
            const newHistoryEntry = {
                originalEmail: emailContent,
                generatedReply: newReply,
                tone: tone || 'Unspecified',
                timestamp: new Date().toLocaleString()
            };
            
            setHistory(prevHistory => [newHistoryEntry, ...prevHistory].slice(0, 3));
            
            setStats(prev => ({
                totalRepliesGenerated: prev.totalRepliesGenerated + 1,
                mostUsedTone: tone || prev.mostUsedTone,
                averageReplyLength: Math.round((prev.averageReplyLength * prev.totalRepliesGenerated + newReply.length) / (prev.totalRepliesGenerated + 1))
            }));

            toast.success("Reply Generated Successfully");
        } catch (err) {
            toast.error("Generation Failed");
        } finally {
            setLoading(false);
        }
    }

    const handleDownload = () => {
        const blob = new Blob([generatedReply], { type: 'text/plain;charset=utf-8' });
        saveAs(blob, "email_reply.txt");
        toast.success("Downloaded");
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(generatedReply);
        toast.success("Copied to Clipboard");
    };

    const renderGenerator = () => (
        <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
                <GradientCard>
                    <CardContent>
                        <Box display="flex" alignItems="center" mb={2}>
                            <Email color="primary" sx={{ mr: 1 }} />
                            <Typography variant="h6" color="text.primary">
                                Email Details
                            </Typography>
                        </Box>
                        <TextField
                            fullWidth
                            multiline
                            rows={6}
                            variant="outlined"
                            label="Original Email"
                            value={emailContent}
                            onChange={(e) => setEmailContent(e.target.value)}
                            sx={{ mb: 2 }}
                        />
                        <TextField
                            fullWidth
                            multiline
                            rows={3}
                            variant="outlined"
                            label="Additional Instructions"
                            placeholder="Any specific requirements for the reply?"
                            value={instructions}
                            onChange={(e) => setInstructions(e.target.value)}
                            sx={{ mb: 2 }}
                        />
                        <FormControl fullWidth sx={{ mb: 3 }}>
                            <InputLabel>Tone</InputLabel>
                            <Select
                                value={tone}
                                label="Tone"
                                onChange={(e) => setTone(e.target.value)}
                                MenuProps={{
                                    PaperProps: {
                                        sx: {
                                            borderRadius: '12px',
                                            marginTop: '8px'
                                        }
                                    }
                                }}
                            >
                                <MenuItem value="Professional">Professional</MenuItem>
                                <MenuItem value="Casual">Casual</MenuItem>
                                <MenuItem value="Friendly">Friendly</MenuItem>
                                <MenuItem value="Playful">Playful</MenuItem>
                            </Select>
                        </FormControl>
                        <AnimatedButton 
                            fullWidth 
                            variant="contained" 
                            color="primary" 
                            onClick={handleSubmit}
                            disabled={!emailContent || loading}
                            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <AutoAwesome />}
                        >
                            {loading ? 'Generating...' : "Generate Reply"}
                        </AnimatedButton>
                    </CardContent>
                </GradientCard>
            </Grid>
            <Grid item xs={12} md={6}>
                {generatedReply && (
                    <GradientCard>
                        <CardContent>
                            <Box display="flex" alignItems="center" mb={2}>
                                <Palette color="primary" sx={{ mr: 1 }} />
                                <Typography variant="h6" color="text.primary">
                                    Generated Reply
                                </Typography>
                                <Chip 
                                    label={tone || 'No tone'} 
                                    size="small" 
                                    sx={{ ml: 'auto', backgroundColor: theme.palette.primary.light, color: 'white' }} 
                                />
                            </Box>
                            <TextField
                                fullWidth
                                multiline
                                rows={10}
                                variant="outlined"
                                value={generatedReply}
                                InputProps={{ 
                                    readOnly: true,
                                    sx: {
                                        borderRadius: '12px',
                                        backgroundColor: theme.palette.background.default
                                    }
                                }}
                                sx={{ mb: 3 }}
                            />
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
                                <AnimatedButton 
                                    variant="contained" 
                                    color="secondary" 
                                    onClick={handleDownload}
                                    startIcon={<Download />}
                                    fullWidth
                                >
                                    Download
                                </AnimatedButton>
                                <AnimatedButton 
                                    variant="outlined" 
                                    color="primary" 
                                    onClick={handleCopy}
                                    startIcon={<ContentCopy />}
                                    fullWidth
                                >
                                    Copy to clipboard
                                </AnimatedButton>
                            </Box>
                        </CardContent>
                    </GradientCard>
                )}
            </Grid>
        </Grid>
    );

    const renderDashboard = () => (
        <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
                <GradientCard>
                    <CardContent>
                        <Typography variant="subtitle1" color="text.secondary">Replies Generated</Typography>
                        <Typography variant="h3" color="primary.main" fontWeight={700}>
                            {stats.totalRepliesGenerated}
                        </Typography>
                        <LinearProgress 
                            variant="determinate" 
                            value={Math.min(stats.totalRepliesGenerated * 10, 100)} 
                            color="primary" 
                            sx={{ mt: 2, height: 6, borderRadius: 3 }}
                        />
                    </CardContent>
                </GradientCard>
            </Grid>
            <Grid item xs={12} md={4}>
                <GradientCard>
                    <CardContent>
                        <Typography variant="subtitle1" color="text.secondary">Most Used Tone</Typography>
                        <Typography variant="h3" color="primary.main" fontWeight={700}>
                            {stats.mostUsedTone}
                        </Typography>
                        <Box sx={{ mt: 2 }}>
                            <Chip 
                                label={stats.mostUsedTone} 
                                sx={{ 
                                    backgroundColor: theme.palette.primary.light, 
                                    color: 'white',
                                    fontSize: '0.875rem'
                                }} 
                            />
                        </Box>
                    </CardContent>
                </GradientCard>
            </Grid>
            <Grid item xs={12} md={4}>
                <GradientCard>
                    <CardContent>
                        <Typography variant="subtitle1" color="text.secondary">Avg. Reply Length</Typography>
                        <Typography variant="h3" color="primary.main" fontWeight={700}>
                            {stats.averageReplyLength}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">characters</Typography>
                    </CardContent>
                </GradientCard>
            </Grid>
        </Grid>
    );

    const renderHistory = () => (
        <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
                <GradientCard>
                    <CardContent>
                        <Box display="flex" alignItems="center" mb={3}>
                            <History color="primary" sx={{ mr: 1 }} />
                            <Typography variant="h6" color="text.primary">Recent Replies</Typography>
                        </Box>
                        {history.length === 0 ? (
                            <Box textAlign="center" py={4}>
                                <Typography color="text.secondary">No recent replies generated yet</Typography>
                            </Box>
                        ) : (
                            history.map((entry, index) => (
                                <GradientCard key={index} sx={{ mb: 3, p: 2 }}>
                                    <Box display="flex" alignItems="center" mb={1}>
                                        <Avatar sx={{ 
                                            width: 24, 
                                            height: 24, 
                                            fontSize: '0.75rem',
                                            bgcolor: theme.palette.primary.main 
                                        }}>
                                            {index + 1}
                                        </Avatar>
                                        <Typography variant="subtitle2" sx={{ ml: 1 }}>
                                            {entry.tone} • {entry.timestamp}
                                        </Typography>
                                    </Box>
                                    <Typography variant="body2" color="text.secondary">
                                        {entry.generatedReply}
                                    </Typography>
                                </GradientCard>
                            ))
                        )}
                    </CardContent>
                </GradientCard>
            </Grid>
            <Grid item xs={12} md={4}>
                <GradientCard>
                    <CardContent>
                        <Box display="flex" alignItems="center" mb={3}>
                            <Dashboard color="primary" sx={{ mr: 1 }} />
                            <Typography variant="h6" color="text.primary">Prompt History</Typography>
                        </Box>
                        <List sx={{ py: 0 }}>
                            {promptHistory.map((prompt, index) => (
                                <ListItem 
                                    key={index} 
                                    sx={{ 
                                        py: 1.5,
                                        px: 0,
                                        borderBottom: `1px solid ${theme.palette.divider}`,
                                        '&:last-child': {
                                            borderBottom: 'none'
                                        }
                                    }}
                                >
                                    <ListItemText 
                                        primary={
                                            <Typography fontWeight={500}>
                                                {prompt.prompt}
                                            </Typography>
                                        } 
                                        secondary={
                                            <Box component="span" display="flex" alignItems="center">
                                                <Chip 
                                                    label={prompt.tone} 
                                                    size="small" 
                                                    sx={{ 
                                                        mr: 1,
                                                        backgroundColor: theme.palette.primary.light,
                                                        color: 'white'
                                                    }} 
                                                />
                                                {prompt.timestamp}
                                            </Box>
                                        } 
                                    />
                                </ListItem>
                            ))}
                        </List>
                    </CardContent>
                </GradientCard>
            </Grid>
        </Grid>
    );

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Container maxWidth="xl" sx={{ py: 0, minHeight: '100vh' }}>
                <Paper elevation={0} sx={{ 
                    minHeight: '100vh',
                    background: `linear-gradient(135deg, ${theme.palette.background.default} 0%, ${theme.palette.background.paper} 100%)`,
                    p: 4
                }}>
                    <Box sx={{ maxWidth: 1400, margin: '0 auto' }}>
                        <Box textAlign="center" mb={4}>
                            <Typography 
                                variant="h3" 
                                sx={{ 
                                    fontWeight: 800,
                                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    mb: 1
                                }}
                            >
                                Email Reply Generator
                            </Typography>
                            <Typography variant="subtitle1" color="text.secondary">
                                AI-powered email responses tailored to your needs
                            </Typography>
                        </Box>

                        <Box sx={{ 
                            mb: 4,
                            '& .MuiTabs-indicator': {
                                height: 4,
                                borderRadius: '4px 4px 0 0'
                            }
                        }}>
                            <Tabs 
                                value={activeTab} 
                                onChange={(e, newValue) => setActiveTab(newValue)}
                                variant="fullWidth"
                                textColor="primary"
                                indicatorColor="primary"
                                sx={{
                                    '& .MuiTab-root': {
                                        textTransform: 'none',
                                        fontWeight: 600,
                                        fontSize: '1rem',
                                        py: 1.5
                                    }
                                }}
                            >
                                <Tab 
                                    value="generator" 
                                    label="Generator" 
                                    icon={<Email fontSize="small" sx={{ mb: 0.5 }} />} 
                                    iconPosition="start" 
                                />
                                <Tab 
                                    value="dashboard" 
                                    label="Dashboard" 
                                    icon={<Dashboard fontSize="small" sx={{ mb: 0.5 }} />} 
                                    iconPosition="start" 
                                />
                                <Tab 
                                    value="history" 
                                    label="History" 
                                    icon={<History fontSize="small" sx={{ mb: 0.5 }} />} 
                                    iconPosition="start" 
                                />
                            </Tabs>
                        </Box>

                        {loading && activeTab === 'generator' && (
                            <LinearProgress color="primary" sx={{ mb: 3, borderRadius: 3 }} />
                        )}

                        {activeTab === 'generator' && renderGenerator()}
                        {activeTab === 'dashboard' && renderDashboard()}
                        {activeTab === 'history' && renderHistory()}
                    </Box>
                </Paper>

                <ToastContainer 
                    position="bottom-right" 
                    autoClose={3000} 
                    hideProgressBar 
                    theme="colored"
                    toastStyle={{
                        borderRadius: '12px',
                        fontFamily: theme.typography.fontFamily
                    }}
                />
            </Container>
        </ThemeProvider>
    );
}

export default App;
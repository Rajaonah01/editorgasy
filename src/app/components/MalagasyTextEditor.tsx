import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  TextField,
  Paper,
  Typography,
  Chip,
  Stack,
  Alert,
  List,
  ListItem,
  ListItemText,
  Popover,
  IconButton,
  Tooltip,
  Card,
  CardContent,
  Grid,
  Tabs,
  Tab,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
} from '@mui/material';
import {
  Spellcheck,
  Translate,
  TrendingUp,
  VolumeUp,
  Psychology,
  AccountTree,
  SmartToy,
  Lightbulb,
} from '@mui/icons-material';
import {
  invalidPatterns,
  lemmatize,
  translate,
  analyzeSentiment,
  recognizeEntities,
  predictNextWord,
  knowledgeGraph,
  malagasyDictionary,
} from '../utils/malagasyDictionary';
import { KnowledgeGraphViewer } from './KnowledgeGraphViewer';

interface SpellingError {
  word: string;
  position: number;
  description: string;
}

export function MalagasyTextEditor() {
  const [text, setText] = useState('');
  const [spellingErrors, setSpellingErrors] = useState<SpellingError[]>([]);
  const [currentTab, setCurrentTab] = useState(0);
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showGraph, setShowGraph] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'bot'; text: string }>>([]);
  const [chatInput, setChatInput] = useState('');
  
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  // Vérification orthographique
  useEffect(() => {
    const errors: SpellingError[] = [];
    invalidPatterns.forEach(({ pattern, description }) => {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        errors.push({
          word: match[0],
          position: match.index,
          description,
        });
      }
    });
    setSpellingErrors(errors);
  }, [text]);

  // Analyse du texte
  const sentiment = analyzeSentiment(text);
  const entities = recognizeEntities(text);
  const wordCount = text.split(/\s+/).filter(w => w.length > 0).length;
  
  // Lemmatisation du texte
  const lemmatizedWords = text
    .split(/\s+/)
    .filter(w => w.length > 0)
    .map(w => ({ original: w, root: lemmatize(w) }));

  // Gestion du menu contextuel (clic droit)
  const handleContextMenu = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    
    if (!textAreaRef.current) return;
    
    const selection = window.getSelection();
    const selectedText = selection?.toString().trim();
    
    if (selectedText && selectedText.split(/\s+/).length === 1) {
      setSelectedWord(selectedText);
      setAnchorEl(event.currentTarget);
    }
  };

  const handleClosePopover = () => {
    setAnchorEl(null);
    setSelectedWord(null);
  };

  // Autocomplétion
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setText(newText);
    
    // Obtenir le mot actuel
    const cursorPosition = e.target.selectionStart;
    const textBeforeCursor = newText.substring(0, cursorPosition);
    const words = textBeforeCursor.split(/\s+/);
    const currentWord = words[words.length - 1];
    
    if (currentWord.length > 0) {
      const predictions = predictNextWord(currentWord);
      setSuggestions(predictions);
    } else {
      setSuggestions([]);
    }
  };

  // Synthèse vocale (TTS)
  const handleSpeak = () => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'fr-FR'; // Approximation pour le malgache
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    } else {
      alert('La synthèse vocale n\'est pas supportée par votre navigateur');
    }
  };

  // Chatbot assistant
  const handleChatSubmit = () => {
    if (!chatInput.trim()) return;
    
    const userMessage = chatInput.trim();
    setChatMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    
    // Logique simple du chatbot
    let botResponse = '';
    
    if (userMessage.toLowerCase().includes('synonyme')) {
      const words = userMessage.split(/\s+/);
      const lastWord = words[words.length - 1].replace(/[?.,!]/g, '');
      const entry = malagasyDictionary.find(d => d.word === lastWord.toLowerCase());
      if (entry) {
        const synonyms = malagasyDictionary
          .filter(d => d.category === entry.category && d.word !== entry.word)
          .slice(0, 3)
          .map(d => d.word);
        botResponse = synonyms.length > 0 
          ? `Voici quelques synonymes: ${synonyms.join(', ')}`
          : 'Je n\'ai pas trouvé de synonymes';
      } else {
        botResponse = 'Je ne connais pas ce mot';
      }
    } else if (userMessage.toLowerCase().includes('conjugaison')) {
      botResponse = 'La conjugaison en malgache utilise des préfixes: mi- (actif), ma- (causatif), -na (passé), -vao (futur)';
    } else if (userMessage.toLowerCase().includes('traduire')) {
      const words = userMessage.split(/\s+/);
      const lastWord = words[words.length - 1].replace(/[?.,!]/g, '');
      const translation = translate(lastWord);
      botResponse = translation 
        ? `"${lastWord}" signifie "${translation}" en français`
        : 'Je ne peux pas traduire ce mot';
    } else {
      botResponse = 'Je peux vous aider avec les synonymes, les conjugaisons et les traductions. Essayez "synonyme de [mot]" ou "conjugaison"';
    }
    
    setChatMessages(prev => [...prev, { role: 'bot', text: botResponse }]);
    setChatInput('');
  };

  const insertSuggestion = (suggestion: string) => {
    if (!textAreaRef.current) return;
    
    const cursorPosition = textAreaRef.current.selectionStart;
    const textBeforeCursor = text.substring(0, cursorPosition);
    const textAfterCursor = text.substring(cursorPosition);
    const words = textBeforeCursor.split(/\s+/);
    const lastWordStart = textBeforeCursor.lastIndexOf(words[words.length - 1]);
    
    const newText = text.substring(0, lastWordStart) + suggestion + ' ' + textAfterCursor;
    setText(newText);
    setSuggestions([]);
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1400, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Psychology color="primary" />
        Éditeur de Texte Intelligent - Langue Malgache
      </Typography>
      
      <Grid container spacing={3}>
        {/* Éditeur principal */}
        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Stack spacing={2}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">Zone d'édition</Typography>
                <Stack direction="row" spacing={1}>
                  <Tooltip title="Synthèse vocale">
                    <IconButton color="primary" onClick={handleSpeak}>
                      <VolumeUp />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Graphe de connaissances">
                    <IconButton color="secondary" onClick={() => setShowGraph(true)}>
                      <AccountTree />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </Box>

              <Box onContextMenu={handleContextMenu} sx={{ position: 'relative' }}>
                <TextField
                  inputRef={textAreaRef}
                  multiline
                  rows={10}
                  fullWidth
                  value={text}
                  onChange={handleTextChange}
                  placeholder="Écrivez votre texte en malgache ici... (Clic droit sur un mot pour la traduction)"
                  variant="outlined"
                />
                
                {/* Suggestions d'autocomplétion */}
                {suggestions.length > 0 && (
                  <Paper
                    elevation={3}
                    sx={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      zIndex: 1000,
                      mt: 0.5,
                      maxWidth: 300,
                    }}
                  >
                    <List dense>
                      {suggestions.map((suggestion, idx) => (
                        <ListItem
                          key={idx}
                          button
                          onClick={() => insertSuggestion(suggestion)}
                        >
                          <ListItemText 
                            primary={suggestion}
                            secondary={translate(suggestion)}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Paper>
                )}
              </Box>

              <Stack direction="row" spacing={1} flexWrap="wrap">
                <Chip label={`${wordCount} mots`} color="primary" size="small" />
                <Chip 
                  icon={<TrendingUp />}
                  label={`Sentiment: ${sentiment.label}`} 
                  color={sentiment.label === 'Positif' ? 'success' : sentiment.label === 'Négatif' ? 'error' : 'default'}
                  size="small"
                />
              </Stack>

              {/* Erreurs orthographiques */}
              {spellingErrors.length > 0 && (
                <Alert severity="warning" icon={<Spellcheck />}>
                  <Typography variant="subtitle2">Erreurs orthographiques détectées:</Typography>
                  <List dense>
                    {spellingErrors.map((error, idx) => (
                      <ListItem key={idx}>
                        <ListItemText
                          primary={`"${error.word}" à la position ${error.position}`}
                          secondary={error.description}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Alert>
              )}
            </Stack>
          </Paper>
        </Grid>

        {/* Panneau latéral */}
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 2, height: '100%' }}>
            <Tabs value={currentTab} onChange={(_, v) => setCurrentTab(v)}>
              <Tab label="Analyse" icon={<Spellcheck />} iconPosition="start" />
              <Tab label="NER" icon={<Lightbulb />} iconPosition="start" />
              <Tab label="Chatbot" icon={<SmartToy />} iconPosition="start" />
            </Tabs>

            <Box sx={{ mt: 2 }}>
              {/* Onglet Analyse */}
              {currentTab === 0 && (
                <Stack spacing={2}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        <Translate /> Lemmatisation
                      </Typography>
                      <List dense>
                        {lemmatizedWords.slice(0, 10).map((item, idx) => (
                          <ListItem key={idx}>
                            <ListItemText
                              primary={`${item.original} → ${item.root}`}
                              secondary={translate(item.original)}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        <TrendingUp /> Analyse de Sentiment
                      </Typography>
                      <Typography variant="body1">
                        Résultat: <strong>{sentiment.label}</strong>
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Score: {sentiment.score.toFixed(2)}
                      </Typography>
                    </CardContent>
                  </Card>
                </Stack>
              )}

              {/* Onglet NER */}
              {currentTab === 1 && (
                <Stack spacing={2}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Entités Reconnues (NER)
                      </Typography>
                      
                      <Typography variant="subtitle2" sx={{ mt: 2 }}>
                        Villes:
                      </Typography>
                      {entities.cities.length > 0 ? (
                        <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mt: 1 }}>
                          {entities.cities.map((city, idx) => (
                            <Chip key={idx} label={city} color="info" size="small" />
                          ))}
                        </Stack>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          Aucune ville détectée
                        </Typography>
                      )}

                      <Typography variant="subtitle2" sx={{ mt: 2 }}>
                        Personnalités:
                      </Typography>
                      {entities.personalities.length > 0 ? (
                        <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mt: 1 }}>
                          {entities.personalities.map((person, idx) => (
                            <Chip key={idx} label={person} color="secondary" size="small" />
                          ))}
                        </Stack>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          Aucune personnalité détectée
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </Stack>
              )}

              {/* Onglet Chatbot */}
              {currentTab === 2 && (
                <Stack spacing={2}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        <SmartToy /> Assistant Malgache
                      </Typography>
                      
                      <Box sx={{ 
                        maxHeight: 300, 
                        overflowY: 'auto', 
                        mb: 2,
                        p: 1,
                        bgcolor: 'background.default',
                        borderRadius: 1
                      }}>
                        {chatMessages.map((msg, idx) => (
                          <Box
                            key={idx}
                            sx={{
                              mb: 1,
                              p: 1,
                              bgcolor: msg.role === 'user' ? 'primary.light' : 'secondary.light',
                              borderRadius: 1,
                              color: 'white'
                            }}
                          >
                            <Typography variant="caption">
                              {msg.role === 'user' ? 'Vous:' : 'Bot:'}
                            </Typography>
                            <Typography variant="body2">{msg.text}</Typography>
                          </Box>
                        ))}
                      </Box>

                      <TextField
                        fullWidth
                        size="small"
                        placeholder="Demandez des synonymes, conjugaisons..."
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleChatSubmit()}
                      />
                      <Button
                        fullWidth
                        variant="contained"
                        onClick={handleChatSubmit}
                        sx={{ mt: 1 }}
                      >
                        Envoyer
                      </Button>
                    </CardContent>
                  </Card>
                </Stack>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Popover de traduction (clic droit) */}
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleClosePopover}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
      >
        <Box sx={{ p: 2, minWidth: 200 }}>
          {selectedWord && (
            <>
              <Typography variant="h6">{selectedWord}</Typography>
              <Typography variant="body2" color="text.secondary">
                Racine: {lemmatize(selectedWord)}
              </Typography>
              <Typography variant="body1" sx={{ mt: 1 }}>
                Traduction: <strong>{translate(selectedWord) || 'Non trouvée'}</strong>
              </Typography>
            </>
          )}
        </Box>
      </Popover>

      {/* Dialog du graphe de connaissances */}
      <Dialog
        open={showGraph}
        onClose={() => setShowGraph(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          <AccountTree /> Explorateur Sémantique (Knowledge Graph)
        </DialogTitle>
        <DialogContent>
          <KnowledgeGraphViewer />
        </DialogContent>
      </Dialog>
    </Box>
  );
}

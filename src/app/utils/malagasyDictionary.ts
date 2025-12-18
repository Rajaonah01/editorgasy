// Dictionnaire Malgache - Base de données locale
export interface MalagasyWord {
  word: string;
  root: string;
  translation: string;
  category: 'noun' | 'verb' | 'adjective' | 'adverb' | 'other';
  sentiment?: 'positive' | 'negative' | 'neutral';
}

export const malagasyDictionary: MalagasyWord[] = [
  // Verbes
  { word: 'manao', root: 'hao', translation: 'faire', category: 'verb', sentiment: 'neutral' },
  { word: 'manosika', root: 'tosika', translation: 'pousser', category: 'verb', sentiment: 'neutral' },
  { word: 'mihira', root: 'hira', translation: 'chanter', category: 'verb', sentiment: 'positive' },
  { word: 'mandeha', root: 'leha', translation: 'aller', category: 'verb', sentiment: 'neutral' },
  { word: 'mitady', root: 'tady', translation: 'chercher', category: 'verb', sentiment: 'neutral' },
  { word: 'manana', root: 'hana', translation: 'avoir', category: 'verb', sentiment: 'neutral' },
  { word: 'mihinana', root: 'hana', translation: 'manger', category: 'verb', sentiment: 'positive' },
  { word: 'misotro', root: 'sotro', translation: 'boire', category: 'verb', sentiment: 'neutral' },
  { word: 'miasa', root: 'asa', translation: 'travailler', category: 'verb', sentiment: 'neutral' },
  { word: 'mianatra', root: 'anatra', translation: 'apprendre', category: 'verb', sentiment: 'positive' },
  
  // Noms
  { word: 'trano', root: 'trano', translation: 'maison', category: 'noun', sentiment: 'neutral' },
  { word: 'olona', root: 'olona', translation: 'personne', category: 'noun', sentiment: 'neutral' },
  { word: 'fitiavana', root: 'tia', translation: 'amour', category: 'noun', sentiment: 'positive' },
  { word: 'fahatezerana', root: 'tezitra', translation: 'colère', category: 'noun', sentiment: 'negative' },
  { word: 'fahasambarana', root: 'sambatra', translation: 'bonheur', category: 'noun', sentiment: 'positive' },
  { word: 'alahelo', root: 'alahelo', translation: 'tristesse', category: 'noun', sentiment: 'negative' },
  { word: 'tanàna', root: 'tanàna', translation: 'ville', category: 'noun', sentiment: 'neutral' },
  { word: 'zavatra', root: 'zavatra', translation: 'chose', category: 'noun', sentiment: 'neutral' },
  
  // Adjectifs
  { word: 'tsara', root: 'tsara', translation: 'bon/bien', category: 'adjective', sentiment: 'positive' },
  { word: 'ratsy', root: 'ratsy', translation: 'mauvais', category: 'adjective', sentiment: 'negative' },
  { word: 'lehibe', root: 'lehibe', translation: 'grand', category: 'adjective', sentiment: 'neutral' },
  { word: 'kely', root: 'kely', translation: 'petit', category: 'adjective', sentiment: 'neutral' },
  { word: 'mahafinaritra', root: 'finaritra', translation: 'agréable', category: 'adjective', sentiment: 'positive' },
  { word: 'mahagaga', root: 'gaga', translation: 'étonnant', category: 'adjective', sentiment: 'positive' },
  { word: 'malahelo', root: 'alahelo', translation: 'triste', category: 'adjective', sentiment: 'negative' },
  { word: 'sambatra', root: 'sambatra', translation: 'heureux', category: 'adjective', sentiment: 'positive' },
];

// Villes de Madagascar
export const malagasyCities = [
  'Antananarivo', 'Antsirabe', 'Toamasina', 'Mahajanga', 
  'Toliara', 'Fianarantsoa', 'Antsiranana', 'Morondava'
];

// Personnalités
export const malagasyPersonalities = [
  'Ravalomanana', 'Ratsiraka', 'Rajoelina', 'Rainilaiarivony','DinaRasamimanana'
];

// Règles REGEX pour la validation orthographique
export const invalidPatterns = [
  { pattern: /nb/gi, description: 'La séquence "nb" n\'existe pas en Malgache' },
  { pattern: /mk/gi, description: 'La séquence "mk" n\'existe pas en Malgache' },
  { pattern: /[qwx]/gi, description: 'Les lettres q, w, x ne sont pas utilisées en Malgache' },
];

// Fonction de lemmatisation
export function lemmatize(word: string): string {
  const lowerWord = word.toLowerCase();
  const entry = malagasyDictionary.find(d => d.word === lowerWord);
  if (entry) {
    return entry.root;
  }
  
  // Règles basiques de lemmatisation
  // Préfixe "mi-" (verbes actifs)
  if (lowerWord.startsWith('mi')) {
    return lowerWord.substring(2);
  }
  // Préfixe "ma-" (verbes)
  if (lowerWord.startsWith('ma')) {
    return lowerWord.substring(2);
  }
  // Préfixe "f-" ou "fa-" (noms dérivés)
  if (lowerWord.startsWith('fa')) {
    return lowerWord.substring(2);
  }
  
  return lowerWord;
}

// Fonction de traduction
export function translate(word: string): string | null {
  const lowerWord = word.toLowerCase();
  const entry = malagasyDictionary.find(d => d.word === lowerWord);
  return entry ? entry.translation : null;
}

// Analyse de sentiment
export function analyzeSentiment(text: string): { score: number; label: string } {
  const words = text.toLowerCase().split(/\s+/);
  let positiveCount = 0;
  let negativeCount = 0;
  
  words.forEach(word => {
    const entry = malagasyDictionary.find(d => d.word === word);
    if (entry) {
      if (entry.sentiment === 'positive') positiveCount++;
      if (entry.sentiment === 'negative') negativeCount++;
    }
  });
  
  const total = positiveCount + negativeCount;
  if (total === 0) return { score: 0, label: 'Neutre' };
  
  const score = (positiveCount - negativeCount) / total;
  if (score > 0.2) return { score, label: 'Positif' };
  if (score < -0.2) return { score, label: 'Négatif' };
  return { score, label: 'Neutre' };
}

// Reconnaissance d'entités nommées (NER)
export function recognizeEntities(text: string): { cities: string[]; personalities: string[] } {
  const cities: string[] = [];
  const personalities: string[] = [];
  
  malagasyCities.forEach(city => {
    if (text.includes(city)) {
      cities.push(city);
    }
  });
  
  malagasyPersonalities.forEach(person => {
    if (text.includes(person)) {
      personalities.push(person);
    }
  });
  
  return { cities, personalities };
}

// Autocomplétion - Prédiction du prochain mot
export function predictNextWord(currentWord: string): string[] {
  const lowerWord = currentWord.toLowerCase();
  return malagasyDictionary
    .filter(d => d.word.startsWith(lowerWord))
    .slice(0, 5)
    .map(d => d.word);
}

// Graphe de connaissances
export interface KnowledgeGraphNode {
  id: string;
  label: string;
  category: string;
}

export interface KnowledgeGraphLink {
  source: string;
  target: string;
  relation: string;
}

export const knowledgeGraph = {
  nodes: [
    { id: 'manao', label: 'manao (faire)', category: 'verb' },
    { id: 'trano', label: 'trano (maison)', category: 'noun' },
    { id: 'tsara', label: 'tsara (bon)', category: 'adjective' },
    { id: 'olona', label: 'olona (personne)', category: 'noun' },
    { id: 'fitiavana', label: 'fitiavana (amour)', category: 'noun' },
    { id: 'mihira', label: 'mihira (chanter)', category: 'verb' },
    { id: 'sambatra', label: 'sambatra (heureux)', category: 'adjective' },
    { id: 'Antananarivo', label: 'Antananarivo', category: 'city' },
    { id: 'Antsirabe', label: 'Antsirabe', category: 'city' },
  ],
  links: [
    { source: 'manao', target: 'trano', relation: 'construit' },
    { source: 'olona', target: 'fitiavana', relation: 'ressent' },
    { source: 'mihira', target: 'sambatra', relation: 'provoque' },
    { source: 'Antananarivo', target: 'Antsirabe', relation: 'proche de' },
    { source: 'trano', target: 'tsara', relation: 'peut être' },
  ]
};

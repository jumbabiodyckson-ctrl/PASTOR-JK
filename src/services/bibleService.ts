export interface BibleVerse {
  book_id: string;
  book_name: string;
  chapter: number;
  verse: number;
  text: string;
}

export interface BibleResponse {
  reference: string;
  verses: BibleVerse[];
  text: string;
  translation_id: string;
  translation_name: string;
  translation_note: string;
}

export const BIBLE_VERSIONS = [
  { id: 'kjv', name: 'King James Version' },
  { id: 'web', name: 'World English Bible' },
  { id: 'bbe', name: 'Bible in Basic English' },
  { id: 'oeb-cw', name: 'Open English Bible (CW)' },
  { id: 'webbe', name: 'World English Bible (BE)' },
  { id: 'almeida', name: 'João Ferreira de Almeida' },
  { id: 'rvr', name: 'Reina Valera' },
];

export async function fetchBiblePassage(passage: string, translation: string = 'kjv'): Promise<BibleResponse | null> {
  try {
    const response = await fetch(`https://bible-api.com/${encodeURIComponent(passage)}?translation=${translation}`);
    if (!response.ok) throw new Error('Failed to fetch Bible passage');
    return await response.json();
  } catch (error) {
    console.error('Bible API Error:', error);
    return null;
  }
}

export const READING_GUIDES = [
  {
    id: 'faith',
    title: 'Strengthening Faith',
    description: 'Verses to build your trust in God.',
    passages: ['Hebrews 11:1', 'Romans 10:17', 'Matthew 17:20', 'James 1:3']
  },
  {
    id: 'peace',
    title: 'Finding Peace',
    description: 'Comforting words for troubled times.',
    passages: ['Philippians 4:6-7', 'John 14:27', 'Isaiah 26:3', 'Psalm 29:11']
  },
  {
    id: 'love',
    title: 'God\'s Love',
    description: 'Understanding the depth of His affection.',
    passages: ['John 3:16', '1 John 4:8', 'Romans 5:8', 'Psalm 136:1']
  },
  {
    id: 'strength',
    title: 'Inner Strength',
    description: 'Power for the weary soul.',
    passages: ['Isaiah 40:31', 'Philippians 4:13', 'Psalm 28:7', '2 Corinthians 12:9']
  },
  {
    id: 'wisdom',
    title: 'Divine Wisdom',
    description: 'Seeking God\'s perspective on life.',
    passages: ['James 1:5', 'Proverbs 3:5-6', 'Proverbs 4:7', 'Psalm 111:10']
  },
  {
    id: 'healing',
    title: 'Divine Healing',
    description: 'Restoration for body and soul.',
    passages: ['Psalm 103:2-3', 'Isaiah 53:5', 'James 5:14-15', '1 Peter 2:24']
  }
];

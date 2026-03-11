 /**
 * Proxy para API ABíbliaDigital - versículo aleatório.
 * https://www.abibliadigital.com.br/api
 * Formato: GET /verses/{version}/{book}/{chapter}
 */
const express = require('express');
const router = express.Router();

const API_BASE = 'https://www.abibliadigital.com.br/api';
const VERSION = 'nvi';

// Livros com abreviatura e quantidade de capítulos (amostra)
const BOOKS = [
  { abbrev: 'gn', chapters: 50, name: 'Gênesis' },
  { abbrev: 'ex', chapters: 40, name: 'Êxodo' },
  { abbrev: 'sl', chapters: 150, name: 'Salmos' },
  { abbrev: 'pv', chapters: 31, name: 'Provérbios' },
  { abbrev: 'is', chapters: 66, name: 'Isaías' },
  { abbrev: 'jr', chapters: 52, name: 'Jeremias' },
  { abbrev: 'mt', chapters: 28, name: 'Mateus' },
  { abbrev: 'jo', chapters: 21, name: 'João' },
  { abbrev: 'rm', chapters: 16, name: 'Romanos' },
  { abbrev: '1co', chapters: 16, name: '1 Coríntios' },
  { abbrev: 'gl', chapters: 6, name: 'Gálatas' },
  { abbrev: 'ef', chapters: 6, name: 'Efésios' },
  { abbrev: 'fp', chapters: 4, name: 'Filipenses' },
  { abbrev: 'cl', chapters: 4, name: 'Colossenses' },
  { abbrev: '1jo', chapters: 5, name: '1 João' },
  { abbrev: 'hb', chapters: 13, name: 'Hebreus' },
];

const FALLBACK_VERSES = [
  { text: 'O Senhor é meu pastor; nada me faltará.', reference: 'Salmos 23:1' },
  { text: 'Tudo posso naquele que me fortalece.', reference: 'Filipenses 4:13' },
  { text: 'Entrega o teu caminho ao Senhor; confia nele, e ele tudo fará.', reference: 'Salmos 37:5' },
  { text: 'Porque Deus amou o mundo de tal maneira que deu o seu Filho unigênito.', reference: 'João 3:16' },
  { text: 'O que for feito com as mãos prosperará.', reference: 'Provérbios 31:31' },
];

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function sendFallback(res) {
  const v = pickRandom(FALLBACK_VERSES);
  return res.json({
    success: true,
    data: { book: '', chapter: 0, number: '', text: v.text, reference: v.reference },
  });
}

/**
 * GET /api/verse/random
 * Retorna um versículo aleatório da ABíbliaDigital (NVI).
 */
router.get('/random', async (req, res) => {
  try {
    const book = pickRandom(BOOKS);
    const chapter = 1 + Math.floor(Math.random() * Math.min(book.chapters, 50));
    const url = `${API_BASE}/verses/${VERSION}/${book.abbrev}/${chapter}`;

    const response = await fetch(url).catch(() => null);
    if (!response || !response.ok) {
      return sendFallback(res);
    }

    const data = await response.json().catch(() => ({}));
    const verses = data.verses || data.chapter?.verses || [];
    if (verses.length === 0) {
      return sendFallback(res);
    }

    const verse = pickRandom(verses);
    const verseNumber = verse.number || verse.verse || '';
    const text = verse.text || '';

    return res.json({
      success: true,
      data: {
        book: data.book?.name || book.name,
        chapter: data.chapter?.number ?? chapter,
        number: verseNumber,
        text: text.trim(),
        reference: `${data.book?.name || book.name} ${data.chapter?.number ?? chapter}:${verseNumber}`,
      },
    });
  } catch (err) {
    console.error('Erro ao buscar versículo:', err);
    return sendFallback(res);
  }
});

module.exports = router;

/**
 * Endpoint de versículo aleatório.
 *
 * Importante: a chamada externa para a ABíbliaDigital foi removida.
 * Agora o endpoint retorna apenas versículos de fallback locais.
 */
const express = require('express');
const router = express.Router();

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

function sendFallback(res, reason) {
  if (reason) console.warn('[verse] Fallback usado:', reason);
  const v = pickRandom(FALLBACK_VERSES);
  return res.json({
    success: true,
    source: 'fallback',
    data: { book: '', chapter: 0, number: '', text: v.text, reference: v.reference },
  });
}

/**
 * GET /api/verse/random
 * Retorna um versículo aleatório usando fallback local.
 */
router.get('/random', (req, res) => {
  return sendFallback(res, 'API externa desativada');
});

module.exports = router;

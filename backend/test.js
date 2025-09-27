// Teste básico para Vercel
module.exports = (req, res) => {
  res.status(200).json({
    message: 'Teste funcionando!',
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url,
    headers: req.headers
  });
};

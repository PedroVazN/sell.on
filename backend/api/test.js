module.exports = (req, res) => {
  res.json({
    message: 'API funcionando!',
    timestamp: new Date().toISOString(),
    success: true
  });
};

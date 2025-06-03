const app = require('../server');

module.exports = (req, res) => {
  // Set CORS headers manually for every request
  res.setHeader('Access-Control-Allow-Origin', 'https://peer-eval-front.vercel.app');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  app(req, res);
};
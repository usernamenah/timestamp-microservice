const express = require('express');
const cors = require('cors');
const dns = require('dns');
const bodyParser = require('body-parser');
const app = express();

// Basic in-memory store
const urls = {};
let counter = 1;

// Middleware
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('public'));

// Homepage
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});

// POST endpoint to shorten a URL
app.post('/api/shorturl', (req, res) => {
  const original_url = req.body.url;

  // Remove protocol (http:// or https://) for DNS check
  const urlWithoutProtocol = original_url.replace(/^https?:\/\//, '');

  dns.lookup(urlWithoutProtocol, (err, address) => {
    if (err) {
      return res.json({ error: 'invalid url' });
    } else {
      const short_url = counter++;
      urls[short_url] = original_url;
      res.json({ original_url, short_url });
    }
  });
});

// Redirect endpoint
app.get('/api/shorturl/:short_url', (req, res) => {
  const short_url = req.params.short_url;
  const original_url = urls[short_url];

  if (original_url) {
    res.redirect(original_url);
  } else {
    res.json({ error: 'No short URL found for given input' });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

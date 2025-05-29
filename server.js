const express = require('express');
const cors = require('cors');
const dns = require('dns');
const bodyParser = require('body-parser');
const app = express();

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('public'));

let urlDatabase = []; // array to store URLs

// Homepage
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});

// POST endpoint to shorten a URL
app.post('/api/shorturl', (req, res) => {
  const original_url = req.body.url;

  // Validate using regex (must start with http or https)
  const urlRegex = /^https?:\/\/.+/;
  if (!urlRegex.test(original_url)) {
    return res.json({ error: 'invalid url' });
  }

  // Remove protocol for DNS lookup
  const urlWithoutProtocol = original_url.replace(/^https?:\/\//, '').split('/')[0];

  dns.lookup(urlWithoutProtocol, (err) => {
    if (err) {
      return res.json({ error: 'invalid url' });
    }

    const short_url = urlDatabase.length + 1;
    urlDatabase.push({ original_url, short_url });

    res.json({ original_url, short_url });
  });
});

// GET endpoint to redirect
app.get('/api/shorturl/:short_url', (req, res) => {
  const short_url = parseInt(req.params.short_url);

  const entry = urlDatabase.find(item => item.short_url === short_url);

  if (entry) {
    res.redirect(entry.original_url);
  } else {
    res.json({ error: 'No short URL found for given input' });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

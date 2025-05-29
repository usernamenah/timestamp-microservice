const express = require('express');
const app = express();

// Enable CORS (optional, for testing on freeCodeCamp)
const cors = require('cors');
app.use(cors({ optionsSuccessStatus: 200 }));

// Root route
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});

// API endpoint for /api/whoami
app.get('/api/whoami', (req, res) => {
  const ipaddress = req.ip;
  const language = req.headers['accept-language'];
  const software = req.headers['user-agent'];

  res.json({
    ipaddress,
    language,
    software
  });
});

// Listen on port 3000 or provided environment port
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

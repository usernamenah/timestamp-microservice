const express = require('express');
const cors = require('cors');
const app = express();

// Enable CORS (so your API is remotely testable)
app.use(cors());

// Serve static files (if you want a public folder)
// app.use(express.static('public'));

// Root endpoint
app.get('/', (req, res) => {
    res.send('Timestamp Microservice');
});

// API endpoint without date
app.get('/api', (req, res) => {
    const date = new Date();
    res.json({
        unix: date.getTime(),
        utc: date.toUTCString()
    });
});

// API endpoint with date
app.get('/api/:date', (req, res) => {
    let dateParam = req.params.date;

    let date;
    if (!isNaN(dateParam)) {
        // If it's a number, treat as milliseconds
        date = new Date(parseInt(dateParam));
    } else {
        date = new Date(dateParam);
    }

    if (date.toString() === 'Invalid Date') {
        res.json({ error: 'Invalid Date' });
    } else {
        res.json({
            unix: date.getTime(),
            utc: date.toUTCString()
        });
    }
});

// Listen on the right port
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

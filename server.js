const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const userSchema = new mongoose.Schema({
  username: { type: String, required: true }
});

const exerciseSchema = new mongoose.Schema({
  userId: String,
  description: String,
  duration: Number,
  date: Date
});

const User = mongoose.model('User', userSchema);
const Exercise = mongoose.model('Exercise', exerciseSchema);

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});

// POST create user
app.post('/api/users', async (req, res) => {
  const user = new User({ username: req.body.username });
  const savedUser = await user.save();
  res.json({ username: savedUser.username, _id: savedUser._id });
});

// GET all users
app.get('/api/users', async (req, res) => {
  const users = await User.find({});
  res.json(users);
});

// POST add exercise
app.post('/api/users/:_id/exercises', async (req, res) => {
  const { description, duration, date } = req.body;
  const userId = req.params._id;
  const user = await User.findById(userId);
  if (!user) return res.json({ error: 'User not found' });

  const exercise = new Exercise({
    userId,
    description,
    duration: parseInt(duration),
    date: date ? new Date(date) : new Date()
  });
  const savedExercise = await exercise.save();

  res.json({
    _id: user._id,
    username: user.username,
    date: savedExercise.date.toDateString(),
    duration: savedExercise.duration,
    description: savedExercise.description
  });
});

// GET user logs
app.get('/api/users/:_id/logs', async (req, res) => {
  const { from, to, limit } = req.query;
  const userId = req.params._id;
  const user = await User.findById(userId);
  if (!user) return res.json({ error: 'User not found' });

  let filter = { userId };
  if (from || to) {
    filter.date = {};
    if (from) filter.date.$gte = new Date(from);
    if (to) filter.date.$lte = new Date(to);
  }

  let query = Exercise.find(filter).select('-__v -userId');
  if (limit) query = query.limit(parseInt(limit));

  const exercises = await query.exec();

  res.json({
    username: user.username,
    count: exercises.length,
    _id: user._id,
    log: exercises.map(e => ({
      description: e.description,
      duration: e.duration,
      date: e.date.toDateString()
    }))
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

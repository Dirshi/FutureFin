const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

const dataPath = path.join(__dirname, 'data');
const read = (file) => JSON.parse(fs.readFileSync(path.join(dataPath, file)));
const write = (file, data) => fs.writeFileSync(path.join(dataPath, file), JSON.stringify(data, null, 2));

// 🟢 Register
app.post('/api/register', (req, res) => {
  const users = read('users.json');
  const { username, password } = req.body;
  if (users.find(u => u.username === username)) {
    return res.status(400).json({ message: 'User already exists' });
  }
  users.push({ username, password, portfolio: [] });
  write('users.json', users);
  res.json({ message: 'Registered!' });
});

// 🔐 Login
app.post('/api/login', (req, res) => {
  const users = read('users.json');
  const { username, password } = req.body;
  const user = users.find(u => u.username === username && u.password === password);
  if (!user) return res.status(401).json({ message: 'Invalid login' });
  res.json({ message: 'Logged in', user: { username: user.username } });
});

// 📈 Market Assets
app.get('/api/market', (req, res) => {
  res.json(read('assets.json'));
});

// 🏆 Leaderboard - Save Score
app.post('/api/leaderboard', (req, res) => {
  const { username, type, score } = req.body;
  const leaderboard = read('leaderboard.json');
  leaderboard.push({ username, type, score });
  write('leaderboard.json', leaderboard);
  res.json({ message: 'Score saved!' });
});

// 🏆 Leaderboard - Get All Scores
app.get('/api/leaderboard', (req, res) => {
  res.json(read('leaderboard.json'));
});

// 🟢 Server Start
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});

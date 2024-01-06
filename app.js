const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const crypto = require('crypto');

const app = express();
const port = 3000;

// Database connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'authentication',
});

db.connect((err) => {
  if (err) throw err;
  console.log('Connected to MySQL database');
});

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');

// Routes
app.get('/', (req, res) => {
  res.render('login');
});

app.get('/register', (req, res) => {
  res.render('register');
});

app.post('/register', (req, res) => {
  const { username, password } = req.body;

  // Encrypt the password using SHA-256
  const encryptedPassword = crypto.createHash('sha256').update(password).digest('hex');

  const user = { username, password: encryptedPassword };

  db.query('INSERT INTO users SET ?', user, (err) => {
    if (err) throw err;
    res.redirect('/');
  });
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;

  // Encrypt the entered password for comparison
  const encryptedPassword = crypto.createHash('sha256').update(password).digest('hex');

  db.query('SELECT * FROM users WHERE username = ? AND password = ?', [username, encryptedPassword], (err, results) => {
    if (err) throw err;

    if (results.length > 0) {
      res.render('dashboard', { username });
    } else {
      res.redirect('/');
    }
  });
});

// Server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

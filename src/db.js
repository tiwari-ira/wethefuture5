const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

// Create a database connection
async function getDb() {
  return open({
    filename: 'database.sqlite',
    driver: sqlite3.Database
  });
}

// Initialize the database
async function initDb() {
  const db = await getDb();
  
  // Create leaderboard table if it doesn't exist
  await db.exec(`
    CREATE TABLE IF NOT EXISTS leaderboard (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      wpm INTEGER NOT NULL,
      accuracy INTEGER NOT NULL,
      time INTEGER NOT NULL,
      mode TEXT NOT NULL,
      date DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS quiz_leaderboard (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      score INTEGER NOT NULL,
      total_questions INTEGER NOT NULL,
      time_taken INTEGER NOT NULL,
      date DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
  
  return db;
}

// Get leaderboard entries for a specific mode
async function getLeaderboard(mode) {
  const db = await getDb();
  const entries = await db.all(
    'SELECT name, wpm, accuracy, time FROM leaderboard WHERE mode = ? ORDER BY wpm DESC LIMIT 20',
    [mode]
  );
  return entries;
}

// Add a new entry to the leaderboard
async function addToLeaderboard(mode, name, wpm, accuracy, time) {
  const db = await getDb();
  await db.run(
    'INSERT INTO leaderboard (mode, name, wpm, accuracy, time) VALUES (?, ?, ?, ?, ?)',
    [mode, name, wpm, accuracy, time]
  );
  
  // Get updated leaderboard
  return getLeaderboard(mode);
}

// Get quiz leaderboard entries
async function getQuizLeaderboard() {
  const db = await getDb();
  const entries = await db.all(
    'SELECT name, score, total_questions, time_taken, date FROM quiz_leaderboard ORDER BY score DESC, time_taken ASC LIMIT 20'
  );
  return entries;
}

// Save quiz score
async function saveQuizScore(name, score, totalQuestions, timeTaken) {
  const db = await getDb();
  await db.run(
    'INSERT INTO quiz_leaderboard (name, score, total_questions, time_taken, date) VALUES (?, ?, ?, ?, ?)',
    [name, score, totalQuestions, timeTaken, new Date().toISOString()]
  );
}

// Initialize the database when the module is loaded
initDb();

module.exports = {
  getLeaderboard,
  addToLeaderboard,
  getQuizLeaderboard,
  saveQuizScore
}; 
const express = require('express');
const cors = require('cors');
const pg = require('pg');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Allow CORS from frontend
app.use(cors({
  origin: ['http://localhost:5173', 'https://fourloop.netlify.app/'],
  credentials: true
}));
app.use(express.json()); // Parse JSON request bodies

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false  // Required for connecting securely in hosted environments like Render
  }
});

// Test database connection
pool.connect((err) => {
  if (err) {
    console.error('Database connection error:', err.stack);
    return;
  }
  console.log('Connected to PostgreSQL database');
});

// Registration
app.post("/register", async (req, res) => {
  try {
    const { username, password, first_name, middle_name, last_name, ext_name } = req.body;

    // Check if the username already exists
    const existingUser = await pool.query(
      "SELECT * FROM users WHERE username = $1",
      [username]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: "Username already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      "INSERT INTO users (username, password, first_name, middle_name, last_name, ext_name) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
      [username, hashedPassword, first_name, middle_name, last_name, ext_name]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
});

// Login
app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const result = await pool.query("SELECT * FROM users WHERE username = $1", [username]);
    const user = result.rows[0];
    if (!user) {
      return res.status(400).json({ message: "Not a Registered User" });
    }
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(400).json({ message: "Invalid Password" });
    }

    const token = jwt.sign(
      { userId: user.id, username: user.username, roles: user.roles, truckNum: user.truck_num },
      process.env.SECRET_KEY,
      { expiresIn: "1h" }
    );
    res.json({ token });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
});

// Middleware function for token verification
function verifyToken(req, res, next) {
  const token = req.headers.authorization && req.headers.authorization.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Missing token" });
  }

  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    req.user = decoded;
    console.log(token); // Debugging log
    next();
  } catch (error) {
    console.error("Token verification failed: ", error.message);
    res.status(401).json({ message: "Invalid token" });
  }
}

// Protected route for user information
app.get("/userinfo", verifyToken, (req, res) => {
  res.json({ user: req.user });
});

// Endpoint to get waste data
app.get('/api/waste_data', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM waste_data');
    res.json(result.rows);
  } catch (err) {
    console.error('Error executing query:', err.stack);
    res.status(500).send('Server error');
  }
});

// API endpoint to get all pins
app.get('/api/markers', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM markers');
    res.json(result.rows);
  } catch (err) {
    console.error('Error executing query:', err.stack);
    res.status(500).send('Server error');
  }
});

// API endpoint to add a new pin
app.post('/api/markers', async (req, res) => {
  const { lat, lng, message } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO markers (lat, lng, message) VALUES ($1, $2, $3) RETURNING *',
      [lat, lng, message]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error executing query:', err.stack);
    res.status(500).send('Server error');
  }
});

// API endpoint to delete a pin
app.delete('/api/markers/:id_markers', async (req, res) => {
  const { id_markers } = req.params; // Ensure you are getting id_markers from params
  console.log('Received id_markers:', id_markers); // Debugging log
  try {
    await pool.query('DELETE FROM markers WHERE id_markers = $1', [id_markers]);
    res.status(200).send('Pin deleted successfully');
  } catch (err) {
    console.error('Error executing query:', err.stack);
    res.status(500).send('Server error');
  }
});


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
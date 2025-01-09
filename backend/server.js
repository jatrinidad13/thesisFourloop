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
  origin: ['http://localhost:5173', "https://fourloop.netlify.app"],
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

  
app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    // Query user from the users table
    const result = await pool.query("SELECT * FROM users WHERE username = $1", [username]);
    const user = result.rows[0];

    if (!user) {
      return res.status(400).json({ message: "Not a Registered User" });
    }

    // Check password
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(400).json({ message: "Invalid Password" });
    }

      // Query routes related to the user's truck_num and convert geometry to GeoJSON
  const routeResult = await pool.query(
    "SELECT id, ST_AsGeoJSON(geom) AS geom FROM routes WHERE trucknum = $1",
    [user.trucknum]
  );

  // Extract route names and geometries into an array
  const routes = routeResult.rows.map((row) => ({
    geometry: JSON.parse(row.geom)  // Parse the GeoJSON string into an object
  }));

  // Generate JWT token with user and route data
  const token = jwt.sign(
    { 
      userId: user.id, 
      username: user.username, 
      roles: user.roles, 
      truckNum: user.trucknum,
    },
    process.env.SECRET_KEY,
    { expiresIn: "1h" }
  );

    console.log("Generated JWT Token:", token); // Log token for debugging

    // Set token as HttpOnly cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Ensure secure in production
      maxAge: 3600 * 1000, // 1-hour expiration
    });

    // Respond with success message and token
    res.json({ message: "Login successful", token: token });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
});

function verifyToken(req, res, next) {
  const token = req.cookies.token;  // Read token from cookies

  if (!token) {
    return res.status(401).json({ message: "Missing token" });
  }

  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    req.user = decoded;

    console.log('Verified JWT Token:', token);  // Log token to console for debugging

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

app.get('/api/routes/:truckNum', async (req, res) => {
  const truckNum = req.params.truckNum;
  try {
    const result = await pool.query(
      'SELECT id, trucknum, start_mrf, dest_point, ST_AsGeoJSON(geom) AS geom FROM spatialTable WHERE trucknum = $1',
      [truckNum]
    );

    if (result.rows.length > 0) {
      const geoJson = {
        type: 'FeatureCollection',
        features: result.rows.map((row) => ({
          type: 'Feature',
          geometry: JSON.parse(row.geom),
          properties: {
            id: row.id,
            trucknum: row.trucknum,
            start_mrf: row.start_mrf,
            dest_point: row.dest_point,
          },
        })),
      };

      res.json(geoJson);
    } else {
      res.status(404).json({ message: 'No routes found for this truck number.' });
    }
  } catch (error) {
    console.error('Error fetching routes:', error);
    res.status(500).json({ message: 'Server error.' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
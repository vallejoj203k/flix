// ATENCIÓN: versión de prueba. Las contraseñas se guardan en TEXTO PLANO.
// No usar con datos reales. Siguiente paso: cifrar con bcrypt.
const express = require('express');
const path = require('path');
const { Pool } = require('pg');

const PORT = process.env.PORT || 3000;
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('Falta la variable de entorno DATABASE_URL');
  process.exit(1);
}

const pool = new Pool({
  connectionString: DATABASE_URL,
  // La URL pública de Railway usa SSL; la interna (*.railway.internal) y localhost no.
  ssl: /railway\.internal|localhost|127\.0\.0\.1/.test(DATABASE_URL)
    ? false
    : { rejectUnauthorized: false },
});

async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username VARCHAR(50) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);
}

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.post('/api/register', async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ error: 'Usuario y contraseña son obligatorios' });
  }
  try {
    const result = await pool.query(
      'INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id, username',
      [username, password]
    );
    res.status(201).json({ message: 'Usuario creado', user: result.rows[0] });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Ese usuario ya existe' });
    }
    console.error(err);
    res.status(500).json({ error: 'Error en la base de datos' });
  }
});

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ error: 'Usuario y contraseña son obligatorios' });
  }
  try {
    const result = await pool.query(
      'SELECT id, username FROM users WHERE username = $1 AND password = $2',
      [username, password]
    );
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
    }
    res.json({ message: 'Login correcto', user: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error en la base de datos' });
  }
});

// Solo para pruebas: muestra lo que hay guardado en la tabla (incluida la contraseña).
app.get('/api/users', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, username, password, created_at FROM users ORDER BY id'
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error en la base de datos' });
  }
});

initDb()
  .then(() => {
    app.listen(PORT, () => console.log(`Servidor escuchando en el puerto ${PORT}`));
  })
  .catch((err) => {
    console.error('No se pudo inicializar la base de datos:', err);
    process.exit(1);
  });

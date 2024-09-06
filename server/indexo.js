require('dotenv').config();
const mysql = require('mysql');
const express = require('express');
const cors = require('cors'); // Importa el paquete cors
const app = express();

// Configura CORS
app.use(cors({
    origin: [
        'https://buscadorempleos-1.onrender.com', // Dominio de producción
        'http://localhost:3000' // Dominio de desarrollo local
    ],
    methods: ['GET', 'POST']
}));

// Middleware y configuración de la aplicación aquí

// Configuración de la conexión a la base de datos
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    charset: 'utf8mb4',
    connectTimeout: 10000 // 10 segundos
});

// Conectar a la base de datos
db.connect((err) => {
  if (err) {
    console.error('Error al conectar con la base de datos:', err.stack);
    return;
  }
  console.log('Conexión a la base de datos exitosa');
});

// Rutas y lógica de la aplicación aquí

// Iniciar servidor en un puerto diferente
const PORT = process.env.PORT || 3003; // Cambia el puerto aquí si es necesario
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});

// Ejemplo de ruta de prueba
app.get('/', (req, res) => {
  res.send('Hola Mundo desde Express y MySQL');
});

// Rutas adicionales
app.get("/empleados", (req, res) => {
    const { jornada, torneo, fecha } = req.query;
    const sql = 'SELECT * FROM resultados WHERE jornada = ? AND torneo = ? AND YEAR(fecha) = ?';
    db.query(sql, [jornada, torneo, fecha], (err, result) => {
        if (err) throw err;
        res.json(result);
    });
});

app.get('/anio', (req, res) => {
    db.query('SELECT DISTINCT YEAR(fecha) AS anio FROM resultados', (err, result) => {
        if (err) throw err;
        res.json(result);
    });
});

app.get('/torneos/:anio', (req, res) => {
    const anio = req.params.anio;
    db.query('SELECT DISTINCT torneo FROM resultados WHERE YEAR(fecha) = ?', [anio], (err, result) => {
        if (err) throw err;
        res.json(result);
    });
});

app.get('/jornadas/:anio/:torneo', (req, res) => {
    const anio = req.params.anio;
    const torneo = req.params.torneo;
    db.query('SELECT DISTINCT jornada FROM resultados WHERE YEAR(fecha) = ? AND torneo = ?', [anio, torneo], (err, result) => {
        if (err) throw err;
        res.json(result);
    });
});

app.get('/resultadosfiltro/:anio/:torneo/:jornada', (req, res) => {
    const { anio, torneo, jornada } = req.params;
    const sql = 'SELECT * FROM resultados WHERE YEAR(fecha) = ? AND torneo = ? AND jornada = ?';
    db.query(sql, [anio, torneo, jornada], (err, result) => {
        if (err) { console.log(err); } else { res.json(result); }
    });
});

app.get("/comparacionequipos", (req, res) => {
    const { local, visita, fecha, limite } = req.query;
    const sql = `SELECT * FROM resultados WHERE (local = ? AND visita = ?) OR (local = ? AND visita = ?) ORDER BY fecha DESC LIMIT ?`;
    db.query(sql, [local, visita, visita, local, parseInt(limite)], (err, result) => {
        if (err) { console.log(err); } else { res.json(result); }
    });
});

app.get("/local", (req, res) => {
    const { local, visita, fecha, limite } = req.query;
    const sql = `SELECT * FROM resultados WHERE local = ? AND visita = ? ORDER BY fecha DESC LIMIT ?`;
    db.query(sql, [local, visita, parseInt(limite)], (err, result) => {
        if (err) { console.log(err); } else { res.json(result); }
    });
});

app.get("/pruebas", (req, res) => {
    const { local, visita, fecha, limite } = req.query;
    const sql = `SELECT * FROM resultados WHERE local = ? AND visita = ? ORDER BY fecha DESC LIMIT ?`;
    db.query(sql, [local, visita, parseInt(limite)], (err, result) => {
        if (err) { console.log(err); } else { res.json(result); }
    });
});

app.get("/analizar1equipo", (req, res) => {
    const { local, fecha, limite } = req.query;
    const sql = `SELECT * FROM resultados WHERE local = ? OR visita = ? ORDER BY fecha DESC LIMIT ?`;
    db.query(sql, [local, local, parseInt(limite)], (err, result) => {
        if (err) { console.log(err); } else { res.json(result); }
    });
});

app.get("/alocal", (req, res) => {
    const { local, fecha, limite } = req.query;
    const sql = `SELECT * FROM resultados WHERE local = ? ORDER BY fecha DESC LIMIT ?`;
    db.query(sql, [local, parseInt(limite)], (err, result) => {
        if (err) { console.log(err); } else { res.json(result); }
    });
});

app.get("/bvisita", (req, res) => {
    const { visita, limite } = req.query;
    const sql = `SELECT * FROM resultados WHERE visita = ? ORDER BY fecha DESC LIMIT ?`;
    db.query(sql, [visita, parseInt(limite)], (err, result) => {
        if (err) { console.log(err); } else { res.json(result); }
    });
});

app.get("/vslocalapp", (req, res) => {
    const sql = "SELECT DISTINCT local FROM resultados";
    db.query(sql, (err, result) => {
        if (err) { console.log(err); } else { res.send(result); }
    });
});

app.get("/vsvisitaapp", (req, res) => {
    const sql = "SELECT DISTINCT visita FROM resultados";
    db.query(sql, (err, result) => {
        if (err) { console.log(err); } else { res.send(result); }
    });
});

app.get("/estadisticasxjornadas/:anio/:torneo/:jornada", (req, res) => {
    const { anio, torneo, jornada } = req.params;
    const sql = `SELECT ganador, COUNT(*) FROM resultados WHERE YEAR(fecha) = ? AND torneo = ? AND jornada = ? GROUP BY ganador`;
    db.query(sql, [anio, torneo, jornada], (err, result) => {
        if (err) { console.log(err); } else { res.json(result); }
    });
});

app.get("/mercados/:anio/:torneo/:jornada", (req, res) => {
    const { anio, torneo, jornada } = req.params;
    const sql = `SELECT SUM(btts), SUM(masuno), SUM(masdos), SUM(mastres), COUNT(*) FROM resultados WHERE YEAR(fecha) = ? AND torneo = ? AND jornada = ?`;
    db.query(sql, [anio, torneo, jornada], (err, result) => {
        if (err) { console.log(err); } else { res.json(result); }
    });
});

app.get("/enfrentamientosdirectos/:local/:visita/:limit", (req, res) => {
    const { local, visita, limit } = req.params;
    const sql = `SELECT * FROM resultados WHERE (local = ? AND visita = ?) OR (local = ? AND visita = ?) ORDER BY fecha DESC LIMIT ?`;
    db.query(sql, [local, visita, visita, local, parseInt(limit)], (err, result) => {
        if (err) { console.log(err); } else { res.json(result); }
    });
});

app.get("/unovsuno/:local/:visita/:limit", (req, res) => {
    const { local, visita, limit } = req.params;
    const sql = `
        SELECT SUM(btts), SUM(masuno), SUM(masdos), SUM(mastres), YEAR(fecha), COUNT(*)
        FROM (SELECT local, visita, btts, fecha, masuno, masdos, mastres
              FROM resultados WHERE (local = ? AND visita = ?) OR (local = ? AND visita = ?)
              ORDER BY fecha DESC LIMIT ?) AS subquery`;
    db.query(sql, [local, visita, visita, local, parseInt(limit)], (err, result) => {
        if (err) { console.log(err); } else { res.json(result); }
    });
});

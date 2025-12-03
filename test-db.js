import mysql from 'mysql2/promise';

const config = {
  host: 'localhost',
  user: 'root',
  password: '161poker',
  database: 'nutricion_bd',
  port: 3306,
};

try {
  const conn = await mysql.createConnection(config);
  console.log('✅ Conectado correctamente');
  const [rows] = await conn.query('SELECT version() AS version');
  console.log(rows);
  await conn.end();
} catch (err) {
  console.error('❌ Error de conexión:', err.message);
}

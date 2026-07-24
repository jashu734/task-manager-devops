const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_NAME || 'taskdb',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  connectionTimeoutMillis: 2000,
});

// In-Memory Fallback Store for Local Development without Docker/Postgres
let useMemoryFallback = false;
let memoryTasks = [
  {
    id: 1,
    title: 'Learn DevOps with Docker & AWS',
    description: 'Build local containers and push image to Amazon ECR',
    status: 'in-progress',
    created_at: new Date().toISOString(),
  },
  {
    id: 2,
    title: 'Provision Infrastructure with Terraform',
    description: 'Deploy VPC, ALB, ECS Fargate, and RDS Postgres',
    status: 'todo',
    created_at: new Date().toISOString(),
  },
];
let memoryIdCounter = 3;

async function initDb() {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS tasks (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      status VARCHAR(20) DEFAULT 'todo' CHECK (status IN ('todo', 'in-progress', 'done')),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  try {
    const client = await pool.connect();
    await client.query(createTableQuery);
    client.release();
    useMemoryFallback = false;
    console.log('Database initialized: Connected to PostgreSQL.');
  } catch (err) {
    useMemoryFallback = true;
    console.warn('PostgreSQL not detected locally. Switched to In-Memory Task Database for local preview.');
  }
}

async function query(text, params) {
  if (!useMemoryFallback) {
    try {
      return await pool.query(text, params);
    } catch (err) {
      // Fallback if Postgres connection drops
      useMemoryFallback = true;
    }
  }

  // Handle In-Memory Queries
  const sql = text.trim();

  if (sql.startsWith('SELECT 1')) {
    return { rows: [{ status: 'UP' }] };
  }

  if (sql.includes('FROM tasks')) {
    const sorted = [...memoryTasks].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    return { rows: sorted };
  }

  if (sql.includes('INSERT INTO tasks')) {
    const title = params[0];
    const description = params[1] || '';
    const status = params[2] || 'todo';
    const newTask = {
      id: memoryIdCounter++,
      title,
      description,
      status,
      created_at: new Date().toISOString(),
    };
    memoryTasks.push(newTask);
    return { rows: [newTask] };
  }

  if (sql.includes('UPDATE tasks')) {
    const title = params[0];
    const description = params[1];
    const status = params[2];
    const id = parseInt(params[3], 10);

    const task = memoryTasks.find(t => t.id === id);
    if (!task) return { rows: [] };

    if (title !== undefined && title !== null) task.title = title;
    if (description !== undefined && description !== null) task.description = description;
    if (status !== undefined && status !== null) task.status = status;

    return { rows: [task] };
  }

  if (sql.includes('DELETE FROM tasks')) {
    const id = parseInt(params[0], 10);
    const index = memoryTasks.findIndex(t => t.id === id);
    if (index === -1) return { rows: [] };
    const deleted = memoryTasks.splice(index, 1);
    return { rows: deleted };
  }

  return { rows: [] };
}

module.exports = {
  pool: { query },
  initDb,
};

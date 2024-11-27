const express = require('express');
const app = express();
const PORT = 3000;
const { Pool } = require("pg");
require("dotenv").config();
app.use(express.json());

const config = {
  user: process.env.DB_USER,
  host: "localhost",
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: 5432,
};
// PostgreSQL connection
const pool = new Pool(config);


// let tasks = [
//     { id: 1, description: 'Buy groceries', status: 'incomplete' },
//     { id: 2, description: 'Read a book', status: 'complete' },
// ];


async function createTable() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tasks (
        id SERIAL PRIMARY KEY,
        description TEXT NOT NULL,
        status_complete BOOLEAN
      );
    `);

    console.log(
      "-------------------------------------------"
    );
    console.log(
      "| OK    Tasks table created successfully! |"
    );
    console.log(
      "-------------------------------------------"
    );
  } catch (error) {
    console.log(
      "---------------------------------------------------------------------"
    );
    console.log(
      "| X    Error happened while creating table:                         |"
    );
    console.log(
      "---------------------------------------------------------------------"
    );
    console.error(error);
  }
}
(async function populateDatabase(){
await createTable();
await insertSampleData()

})()
async function insertSampleData() {
async function insertTask(description, status_complete) {
  const query =
    "INSERT INTO tasks (description, status_complete) VALUES ($1, $2) RETURNING *";
  const result = await pool.query(query, [description, status_complete]);
  console.log(
    `Added Task: ${result.rows[0].description}, ${result.rows[0].status_complete}`
  );
}

insertTask("Buy groceries", true);
insertTask("Read a book", false);
insertTask("Change car oil", true);
insertTask("Doctor appointment", false);
insertTask("Pay rent", true);
}

// GET /tasks - Get all tasks
app.get('/tasks', (req, res) => {
    res.render("tasks")
});

// POST /tasks - Add a new task
app.post('/tasks', (request, response) => {
    const { id, description, status } = request.body;
    if (!id || !description || !status) {
        return response.status(400).json({ error: 'All fields (id, description, status) are required' });
    }

    tasks.push({ id, description, status });
    response.status(201).json({ message: 'Task added successfully' });
});

// PUT /tasks/:id - Update a task's status
app.put('/tasks/:id', (request, response) => {
    const taskId = parseInt(request.params.id, 10);
    const { status } = request.body;
    const task = tasks.find(t => t.id === taskId);

    if (!task) {
        return response.status(404).json({ error: 'Task not found' });
    }
    task.status = status;
    response.json({ message: 'Task updated successfully' });
});

// DELETE /tasks/:id - Delete a task
app.delete('/tasks/:id', (request, response) => {
    const taskId = parseInt(request.params.id, 10);
    const initialLength = tasks.length;
    tasks = tasks.filter(t => t.id !== taskId);

    if (tasks.length === initialLength) {
        return response.status(404).json({ error: 'Task not found' });
    }
    response.json({ message: 'Task deleted successfully' });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

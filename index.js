const express = require("express");
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
app.use(express.urlencoded({ extended: true })); // json payload middleware for form data
app.set("view engine", "ejs");
app.set("views", "./views");
app.use(express.static("public"));

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

    console.log("-------------------------------------------");
    console.log("| OK    Tasks table created successfully! |");
    console.log("-------------------------------------------");
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

(async function populateDatabase() {
  await createTable();
  const result = await pool.query("SELECT * FROM tasks");
  // console.log(result.rows)
  const itemsArray = result.rows;
  if (itemsArray.length === 0) {
    insertSampleData();
  }
})();

async function insertTask(description, status_complete) {
  const query =
    "INSERT INTO tasks (description, status_complete) VALUES ($1, $2) RETURNING *";
  try {
    const result = await pool.query(query, [description, status_complete]);
    console.log(
      `Added Task: ${result.rows[0].description}, ${result.rows[0].status_complete}`
    );
  } catch (error) {
    console.error("Error inserting task:", error);
    throw error; // Propagate the error
  }
}

async function insertSampleData() {
  insertTask("Buy groceries", true);
  insertTask("Read a book", false);
  insertTask("Change car oil", true);
  insertTask("Doctor appointment", false);
  insertTask("Pay rent", true);
}

app.get("/messageError", async (req, res) => {
  const message = req.query.message || "";
  res.render("messageError", { message: message });
});

app.get("/messageSuccess", async (req, res) => {
  const message = req.query.message || "";
  res.render("messageSuccess", { message: message });
});

// GET /tasks - Get all tasks
app.get("/tasks", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM tasks");
    res.render("tasks", { tasks: result.rows });
  } catch (error) {
    console.error("Error fetching tasks:", error);
    res.status(500).send("An error occurred");
  }
});

// POST /tasks - Add a new task
app.post("/tasks", async (request, response) => {
  console.log(request.body);
  const { description, status_complete } = request.body;
  const isComplete = status_complete === "true"; // Converts "true" string to true, "false" string to false
  console.log(typeof isComplete);
  console.log(isComplete);

  // Check if description exists and status_complete is boolean (true/false)
  if (!description || typeof isComplete !== "boolean") {
    // Redirect with an error message as a query parameter
    return response.redirect(
      "/messageError?message=Error: Description is required, and status must be true or false."
    );
  }

  try {
    await insertTask(description, isComplete);
    // success messaga after insertion
    return response.redirect(
      "/messageSuccess?message=Success: Task added successfully."
    );
  } catch (error) {
    // error message
    return response.redirect(
      "/messageError?message=Error: Error while adding task."
    );
  }
});

// PUT /tasks/:id - Update a task's status
app.post("/tasks/:id", async (request, response) => {
  const taskId = parseInt(request.params.id, 10);
  console.log(request.body);
  const { description, status_complete } = request.body;
  const isComplete = status_complete === "true"; // Converts string to boolean
  console.log(typeof isComplete);
  console.log(isComplete);
  if (!description || typeof isComplete !== "boolean") {
    return response.redirect(
      "/messageError?message=Error: Description is required, and status must be true or false."
    );
  }

  try {
    const updateQuery = `
      UPDATE tasks
      SET description = $1, status_complete = $2
      WHERE id = $3
      RETURNING *;
    `;

    const result = await pool.query(updateQuery, [
      description,
      status_complete,
      taskId,
    ]);
    return response.redirect(
      "/messageSuccess?message=Success: Task Edited successfully."
    );  }
     catch (error) {
    console.log(error);
      return response.redirect(
        "/messageError?message=Error: Error while updating task, task not found."
      );  }
});


// DELETE /tasks/:id - Delete a task
app.delete("/tasks/:id", async (request, response) => {
  const taskId = parseInt(request.params.id, 10);
  const query = "DELETE FROM tasks WHERE id = $1 RETURNING *";
  try {
    const result = await pool.query(query, [taskId]);
    console.log("successfully deleted task with id: ", taskId);
    if (result.rows.length === 0) {
      return response.redirect(
        "/messageError?message=Error: Error while deleting task, task not found."
      );
    }
    response.json({ message: "Task deleted successfully" });
    // return response.redirect(
    //   "/messageSuccess?message=Success: Task deleted successfully."
    // );
  } catch (error) {
    console.log(error);
    return response.redirect(
      "/messageError?message=Error: Error while deleting task."
    );
  }
});

app.get("/tasks/:id", async (request, response) => {
  const taskId = parseInt(request.params.id, 10);

  try {
    const result = await pool.query("SELECT * FROM tasks WHERE id = $1", [
      taskId,
    ]);
    // console.log(result.rows[taskId]);
    response.render("singleTask", { task: result.rows[0] });
  } catch (error) {
    console.error("Error fetching tasks:", error);
    response.status(500).send("An error occurred");
  }
});
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}/tasks`);
});

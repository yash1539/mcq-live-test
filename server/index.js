const express = require("express");
const app = express();
const http = require("http");
const { Server } = require("socket.io");
const { Pool } = require("pg");
const cors = require("cors");

// Load environment variables
require("dotenv").config();

app.use(cors());

const server = http.createServer(app);
const io = new Server(server);

// PostgreSQL connection pool
const pool = new Pool({
  user: process.env.POSTGRES_USER,
  host: process.env.POSTGRES_HOST,
  database: process.env.POSTGRES_DATABASE,
  password: process.env.POSTGRES_PASSWORD,
  port: process.env.POSTGRES_PORT || 5432,
  ssl: { rejectUnauthorized: false }, // for SSL connection, adjust as needed
});
let selectedOptionsCount = {};
let totalResponses = 0;

io.on("connection", (socket) => {

  socket.on("send_question", async (data) => {

    try {
      console.log("data", data);
      const client = await pool.connect();
      await client.query(`
      CREATE TABLE IF NOT EXISTS pool (
        id SERIAL PRIMARY KEY,
        question TEXT,
        options JSON
      );
    `);
      await client.query("INSERT INTO pool (question, options) VALUES ($1, $2)", [data.question, data.options]);
      client.release();
    } catch (error) {
      console.error("Error inserting message:", error);
    }
    socket.broadcast.emit("receive_message", data);

  });

  socket.on("select_option", async (data) => {

    console.log("data selected", data);

    const optionKey = data.slectedOption;
    selectedOptionsCount[optionKey] = (selectedOptionsCount[optionKey] || 0) + 1;
    const percentages = {};
    totalResponses++;

    for (const [option, count] of Object.entries(selectedOptionsCount)) {
      percentages[option] = ((count / totalResponses) * 100).toFixed(2) + "%";
    }

    io.emit("selected_options_percentage_updated", percentages);
  });
});

server.listen(3001, () => {
  console.log("SERVER IS RUNNING");
});
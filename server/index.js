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
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

// PostgreSQL connection pool
const pool = new Pool({
  user: process.env.POSTGRES_USER,
  host: process.env.POSTGRES_HOST,
  database: process.env.POSTGRES_DATABASE,
  password: process.env.POSTGRES_PASSWORD,
  port: process.env.POSTGRES_PORT || 5432,
  ssl: { rejectUnauthorized: false }, // for SSL connection, adjust as needed
});

io.on("connection", (socket) => {
  socket.on("send_question", async (data) => {
    // socket.broadcast.emit("receive_message", data);

    // try {
    //     console.log("data",data);
    //   const client = await pool.connect();
    //   // await client.query("INSERT INTO messages (question, options) VALUES ($1, $2)", [data.question, data.options]);
    //   client.release();
    // } catch (error) {
    //   console.error("Error inserting message:", error);
    // }
    console.log("fff", data);
    socket.broadcast.emit("receive_message", data);
  
  });
});

server.listen(3001, () => {
  console.log("SERVER IS RUNNING");
});
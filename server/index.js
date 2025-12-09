import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pkg from"pg";

dotenv.config();

const { Pool } = pkg;

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function testDB() {
    try {
        const res = await pool.query("SELECT NOW()");
        console.log("Database connected at:", res.rows[0].now);
    } catch (error) {
        console.error("Database connection failed:", error.message);
    }
}

testDB();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req,res) => {
    res.send("Backend is running");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
});
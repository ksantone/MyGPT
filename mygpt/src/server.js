const OpenAI = require("openai");
const express = require("express");
const pool = require("./db");
require('dotenv').config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

const app = express();
const cors = require("cors");
app.use(express.json());
app.use(cors());

const port = 3080;

app.post("/create_db", async(req, res) => {
    try {
        await pool.query("CREATE TABLE IF NOT EXISTS messages ( id SERIAL PRIMARY KEY, title VARCHAR(255), role VARCHAR(255), content TEXT )");
        const results = await pool.query("SELECT * FROM messages");
        res.json({
            row_data: results ? results.rows : null
        });
    } catch (error) {
        console.log("Error with either creating or retrieving tables from database: ", error);
    }
});

app.post("/add_message", async(req, res) => {
    const { title, messages } = req.body;

    messages.forEach(message => {
        if (message.hasOwnProperty("title")) {
            delete message["title"];
        }
    });

    await pool.query("INSERT INTO messages (title, role, content) VALUES ($1, $2, $3)", [title, messages[messages.length-1]["role"], messages[messages.length-1]["content"]]);

    let response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: messages,
        max_tokens: 500,
        temperature: 0.5
    });

    const response_length = response["choices"][0]["message"]["content"].length;

    if (response_length > 500) {
        max_tokens = response_length
        response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: messages,
            max_tokens: max_tokens,
            temperature: 0.5
        });
    }

    await pool.query("INSERT INTO messages (title, role, content) VALUES ($1, $2, $3)", [title, response["choices"][0]["message"]["role"], response["choices"][0]["message"]["content"]]);

    res.json({
        message: response["choices"][0]["message"]
    });
});

try {
    app.listen(port, () => {
        console.log(`App listening at http://localhost:${port}`);
    });
} catch (error) {
    console.error("Error starting the server:", error);
}
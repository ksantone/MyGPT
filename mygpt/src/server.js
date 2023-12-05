const OpenAI = require("openai");
const express = require("express");
const pool = require("./db");


const openai = new OpenAI({
    apiKey: "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"
});

const app = express();
const cors = require("cors");
app.use(express.json());
app.use(cors());

const port = 3080;

app.post("/create_db", async(req, res) => {
    console.log("In create database POST request.");
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

    const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: messages,
        max_tokens: 100,
        temperature: 0.5
    });

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
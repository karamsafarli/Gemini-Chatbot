require('dotenv').config();

const express = require('express');

const app = express();
const cors = require('cors');
const path = require('path');
const bodyParser = require('body-parser')
const { GoogleGenerativeAI } = require("@google/generative-ai");

const port = process.env.PORT || 3001;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));


app.get('/', (req, res) => {
    res.send("salam dostlar");
});


const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post('/gemini', async (req, res) => {

    const { prompt, imageParts } = req.body;
    const modelName = imageParts.length > 0 ? "gemini-pro-vision" : "gemini-pro"
    const model = genAI.getGenerativeModel({ model: modelName });
    const result = await model.generateContent([prompt, ...imageParts]);
    const response = await result.response;
    const text = response.text();
    res.status(201).json(text);
})


app.listen(port, () => {
    console.log("App is listening")
})
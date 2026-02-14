const express = require('express');
const router = express.Router();
const axios = require('axios');

const maxResults = 20;

router.get('/search', async (req, res) => {
    const { q, startIndex = 0 } = req.query;

    if (!q) {
        return res.status(400).json({ message: "Query is required" });
    }

    try {
        const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(q)}&startIndex=${startIndex}&maxResults=${maxResults}&key=${process.env.GOOGLE_BOOKS_API_KEY}`;
        const response = await axios.get(url);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch books" });
    }
});

module.exports = router;

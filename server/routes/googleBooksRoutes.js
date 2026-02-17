const express = require('express');
const router = express.Router();
const axios = require('axios');

const maxResults = 20;

router.get('/search', async (req, res) => {
    const { query, startIndex = 0 } = req.query;

    if (!query) return res.status(400).json({ message: "Query is required" });

    try {
        const baseParams = `startIndex=${startIndex}&maxResults=${maxResults}&key=${process.env.GOOGLE_BOOKS_API_KEY}`;

        const words = query.trim().split(/\s+/);
        let searchQueries = [];

        const isAuthorGuess = words.length === 2 && words.every(w => /^[A-Z]/.test(w));

        if (isAuthorGuess) {
            searchQueries.push(`inauthor:"${query}"`);
        }

        searchQueries.push(`intitle:"${query}"`);

        const allResults = [];
        for (const q of searchQueries) {
            const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(q)}&${baseParams}`;
            const response = await axios.get(url);
            if (response.data.items) allResults.push(...response.data.items);
        }

        const seen = new Set();
        const uniqueResults = allResults.filter(item => {
            if (seen.has(item.id)) return false;
            seen.add(item.id);
            return true;
        });

        res.json({ totalItems: uniqueResults.length, items: uniqueResults });
    } catch (error) {
        console.error(error.response?.data || error.message);
        res.status(500).json({ message: "Failed to fetch books" });
    }
});

module.exports = router;
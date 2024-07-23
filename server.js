const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();
const port = process.env.PORT || 3000;

// Liste des sports à scraper
const sports = ["athletisme", "natation", "basketball"];

app.get('/scrape', async (req, res) => {
    try {
        const sportsData = await Promise.all(sports.map(async sport => {
            const url = `https://olympics.com/fr/paris-2024/sports/${sport}`;
            const response = await axios.get(url);
            const $ = cheerio.load(response.data);

            const background_image = $('img[data-cy="discipline-hero-image"]').attr('src');
            const sport_name = $('h1.title').text().trim();
            const logo = $('img.lazyload').attr('data-src');

            return { sport, background_image, sport_name, logo };
        }));

        res.json(sportsData);
    } catch (error) {
        console.error('Erreur lors du scraping des données :', error);
        res.status(500).send('Erreur lors du scraping des données');
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

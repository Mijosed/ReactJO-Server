const express = require('express');
const puppeteer = require('puppeteer');

const app = express();
const port = process.env.PORT || 3000;

// Liste des sports à scraper
const sports = ["athletisme", "natation", "basketball"];

app.get('/scrape', async (req, res) => {
    try {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();

        const sportsData = await Promise.all(sports.map(async sport => {
            const url = `https://olympics.com/fr/paris-2024/sports/${sport}`;
            await page.goto(url, { waitUntil: 'networkidle2' });

            const data = await page.evaluate(() => {
                const backgroundImage = document.querySelector('img[data-cy="discipline-hero-image"]');
                const sportName = document.querySelector('h1.title');
                const logo = document.querySelector('img.lazyload');

                return {
                    sport: document.title.split(" | ")[0], // Extract sport name from the title or customize as needed
                    background_image: backgroundImage ? backgroundImage.src : null,
                    sport_name: sportName ? sportName.textContent.trim() : null,
                    logo: logo ? logo.getAttribute('data-src') : null
                };
            });

            return data;
        }));

        await browser.close();

        res.json(sportsData);
    } catch (error) {
        console.error('Erreur lors du scraping des données :', error);
        res.status(500).send('Erreur lors du scraping des données');
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

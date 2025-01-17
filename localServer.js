const express = require('express');
const puppeteer = require('puppeteer');

const app = express();
const port = 3000;

// Liste des sports à scraper
const sports = [
    "athletisme", 
    "aviron", 
    "badminton", 
    "basketball", 
    "basketball-3x3", 
    "boxe", 
    "breaking", 
    "canoe-slalom", 
    "canoe-sprint", 
    "cyclisme-bmx-freestyle", 
    "cyclisme-bmx-racing", 
    "cyclisme-mountain-bike", 
    "cyclisme-sur-piste", 
    "cyclisme-sur-route", 
    "escalade-sportive", 
    "escrime", 
    "football", 
    "golf", 
    "gymnastique-artistique", 
    "gymnastique-rythmique", 
    "halterophilie", 
    "handball", 
    "hockey-sur-gazon", 
    "judo", 
    "lutte", 
    "natation", 
    "natation-artistique", 
    "natation-marathon", 
    "pentathlon-moderne", 
    "plongeon", 
    "rugby-a-7", 
    "skateboard", 
    "sports-equestres", 
    "surf", 
    "taekwondo", 
    "tennis", 
    "tennis-de-table", 
    "tir", 
    "tir-a-l-arc", 
    "trampoline", 
    "triathlon", 
    "voile", 
    "volleyball", 
    "beach-volley", 
    "water-polo"
];

const MAX_CONCURRENT_PAGES = 5; // Limite le nombre de pages ouvertes simultanément

app.get('/scrape', async (req, res) => {
    try {
        console.log("Handler triggered");
        console.log("Launching Puppeteer");
        const browser = await puppeteer.launch({
            headless: false, // Mode headful pour le débogage
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
            ignoreHTTPSErrors: true
        });
        console.log("Puppeteer launched");

        const scrapePage = async (sport) => {
            const page = await browser.newPage();
            console.log("New page created");
            const url = `https://olympics.com/fr/paris-2024/sports/${sport}`;
            console.log(`Navigating to ${url}`);
            await page.goto(url, { waitUntil: 'networkidle2', timeout: 120000 });
            console.log(`Page loaded: ${url}`);

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

            console.log(`Data scraped for ${sport}:`, data);
            await page.close();
            return data;
        };

        const queue = [];
        const results = [];
        for (let i = 0; i < sports.length; i += MAX_CONCURRENT_PAGES) {
            const chunk = sports.slice(i, i + MAX_CONCURRENT_PAGES);
            const chunkResults = await Promise.all(chunk.map(sport => scrapePage(sport)));
            results.push(...chunkResults);
        }

        await browser.close();
        console.log("Browser closed");

        res.json(results);
    } catch (error) {
        console.error('Erreur lors du scraping des données :', error);
        res.status(500).send({ error: 'Erreur lors du scraping des données', details: error.message });
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

const puppeteer = require('puppeteer');

exports.handler = async function(event, context) {
    try {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();

        const sports = ["athletisme", "natation", "basketball"];
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

        return {
            statusCode: 200,
            body: JSON.stringify(sportsData),
        };
    } catch (error) {
        console.error('Erreur lors du scraping des données :', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Erreur lors du scraping des données' }),
        };
    }
};

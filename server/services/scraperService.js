const axios = require('axios');
const cheerio = require('cheerio');
const cron = require('node-cron');
const ScraperConfig = require('../models/ScraperConfig');
const Post = require('../models/Post');

async function scrapeMatches() {
    console.log("Starting Auto Scraper Event...");
    try {
        const config = await ScraperConfig.getConfig();
        const urls = config.targetUrls || [];
        const keywords = (config.keywords || []).map(k => k.toLowerCase());

        if (urls.length === 0 || keywords.length === 0) {
            console.log("Scraper aborted: No URLs or keywords configured.");
            return { message: "No configuration", matches: 0 };
        }

        let totalSaved = 0;

        for (const url of urls) {
            try {
                console.log(`Scraping: ${url}`);
                // Ensure proper protocol
                const target = url.startsWith('http') ? url : `https://${url}`;
                const response = await axios.get(target, {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                    },
                    timeout: 10000
                });

                const html = response.data;
                const $ = cheerio.load(html);

                // Look for anchor tags within typical article containers or headings
                const candidates = new Set();

                $('a').each((i, el) => {
                    const titleText = $(el).text().trim().replace(/\s+/g, ' ');
                    const href = $(el).attr('href');

                    if (!titleText || !href) return;

                    // Filter by keyword matches
                    const lowerTitle = titleText.toLowerCase();
                    const hasMatch = keywords.some(kw => lowerTitle.includes(kw));

                    if (hasMatch && titleText.length > 20) {
                        // resolve relative URLs
                        let fullUrl = href;
                        if (href.startsWith('/')) {
                            const urlObj = new URL(target);
                            fullUrl = `${urlObj.origin}${href}`;
                        } else if (!href.startsWith('http')) {
                            fullUrl = `${target}/${href}`;
                        }

                        candidates.add(JSON.stringify({
                            title: titleText,
                            link: fullUrl
                        }));
                    }
                });

                // Process unique candidates
                const uniqueItems = Array.from(candidates).map(c => JSON.parse(c));

                for (const item of uniqueItems) {
                    // Check if already drafted/published by source URL OR title
                    const exists = await Post.findOne({
                        $or: [
                            { sourceUrl: item.link },
                            { title: item.title }
                        ]
                    });

                    if (!exists) {
                        const newPost = new Post({
                            title: item.title,
                            category: "Global Chemical Industry News", // Default category
                            content: `<p>This article was automatically scraped. Original source: <a href="${item.link}" target="_blank">${item.link}</a></p>`,
                            sourceUrl: item.link,
                            status: "draft", // Saving as draft for review
                            author: "Auto Scraper",
                            slug: item.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') + '-' + Date.now().toString().slice(-4)
                        });

                        await newPost.save();
                        totalSaved++;
                        console.log(`Saved draft: ${item.title}`);
                    }
                }
            } catch (err) {
                console.error(`Error scraping ${url}:`, err.message);
            }
        }

        // Update last run time
        config.lastRun = new Date();
        await config.save();

        console.log(`Scraper Event Completed. Saved ${totalSaved} new drafts.`);
        return { message: "Success", newDrafts: totalSaved };

    } catch (error) {
        console.error("Scraper Database Error:", error);
        throw error;
    }
}

// Scheduled Cron Job: Runs every 6 hours
// '0 */6 * * *'  -> At minute 0 past every 6th hour.
cron.schedule('0 */6 * * *', () => {
    scrapeMatches();
});

module.exports = {
    scrapeMatches
};

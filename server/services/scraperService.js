const axios = require('axios');
const cheerio = require('cheerio');
const cron = require('node-cron');
const ScraperConfig = require('../models/ScraperConfig');
const Post = require('../models/Post');

async function scrapeMatches() {
    console.log(`[PID:${process.pid}] Starting Auto Scraper Event...`);
    try {
        const config = await ScraperConfig.getConfig();
        const urls = config.targetUrls || [];
        const configKeywords = (config.keywords || []).map(k => k.toLowerCase());

        // Extract individual significant words from the long category phrases for better matching
        const searchTerms = new Set();
        configKeywords.forEach(kw => {
            // Split by any non-word character except maybe hyphens, filter common/short words
            const words = kw.split(/[^a-z0-9-]+/i).filter(w => w.length >= 3 && !['news', 'industry', 'industries', 'care', 'allied', 'personal', 'including', 'etc'].includes(w));
            words.forEach(w => searchTerms.add(w));
        });
        const termsArray = Array.from(searchTerms);
        console.log(`Extracted search terms: ${termsArray.join(', ')}`);

        if (urls.length === 0 || termsArray.length === 0) {
            console.log("Scraper aborted: No URLs or extracted keywords configured.");
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
                        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                        'Accept-Language': 'en-US,en;q=0.5',
                    },
                    timeout: 30000 // Further increased timeout
                });

                const html = response.data;
                const $ = cheerio.load(html);

                // Improved selection: Look for anchors, but also headings that might contain the title
                const candidates = new Set();
                let pageLinksChecked = 0;
                let keywordMatches = 0;

                $('a, h1, h2, h3, h4, h5, h6').each((i, el) => {
                    let titleText = $(el).text().trim().replace(/\s+/g, ' ');
                    let href = $(el).attr('href') || $(el).find('a').attr('href');

                    // If it's a heading without a direct link, check siblings or parents for a link
                    if (!href && $(el).closest('a').length > 0) {
                        href = $(el).closest('a').attr('href');
                    }

                    if (!titleText || !href || titleText.length < 12) return;
                    pageLinksChecked++;

                    // Filter by keyword matches (check against extracted terms)
                    const lowerTitle = titleText.toLowerCase();
                    const matchedTerm = termsArray.find(term => lowerTitle.includes(term));

                    if (matchedTerm) {
                        keywordMatches++;
                        console.log(`[OK] Match: "${titleText}" (on "${matchedTerm}")`);
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

                console.log(`- Checked ${pageLinksChecked} links, found ${keywordMatches} keyword matches.`);

                // Process unique candidates
                const uniqueItems = Array.from(candidates).map(c => JSON.parse(c));
                console.log(`- Found ${uniqueItems.length} unique candidates to check against DB.`);

                for (const item of uniqueItems) {
                    // Check if already drafted/published by source URL OR title
                    const exists = await Post.findOne({
                        $or: [
                            { sourceUrl: item.link },
                            { title: item.title }
                        ]
                    });

                    if (exists) {
                        console.log(`[SKIPPED] Already exists: ${item.title}`);
                    } else {
                        // Map keywords to valid subcategories
                        let subcat = "Others";
                        const lowTitle = item.title.toLowerCase();

                        if (lowTitle.includes('pharma') || lowTitle.includes('medic') || lowTitle.includes('health')) subcat = "Pharma";
                        else if (lowTitle.includes('cosmetic') || lowTitle.includes('personal care')) subcat = "Cosmetics & Personal Care";
                        else if (lowTitle.includes('food') || lowTitle.includes('drink') || lowTitle.includes('brew') || lowTitle.includes('beverage')) subcat = "Brewing, Foods & Drinks";
                        else if (lowTitle.includes('chemical') || lowTitle.includes('petro') || lowTitle.includes('oil') || lowTitle.includes('gas') || lowTitle.includes('paint')) subcat = "Industries Chemical";

                        const newPost = new Post({
                            title: item.title,
                            category: "News Roundup", // Valid category
                            subcategory: subcat,
                            content: `<p>This article was automatically scraped. Original source: <a href="${item.link}" target="_blank">${item.link}</a></p>`,
                            sourceUrl: item.link,
                            status: "draft", // Saving as draft for review
                            author: "Auto Scraper",
                            slug: item.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') + '-' + Date.now().toString().slice(-4)
                        });

                        await newPost.save();
                        totalSaved++;
                        console.log(`[SAVED] Draft: ${item.title}`);
                    }
                }
                console.log(`[FINISHED] Scraping ${url}. Saved ${totalSaved} so far.`);
            } catch (err) {
                console.error(`[FATAL ERROR] Scraping ${url}:`, err);
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

// Scheduled Cron Job: Runs every 1 hour
// '0 * * * *'  -> At minute 0 past every hour.
cron.schedule('0 * * * *', () => {
    scrapeMatches();
});

module.exports = {
    scrapeMatches
};

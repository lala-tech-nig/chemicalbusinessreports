const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
const User = require("./models/User");
const Post = require("./models/Post");
const Ad = require("./models/Ad");
const connectDB = require("./config/db");

dotenv.config();

const seedData = async () => {
    try {
        await connectDB();

        console.log("Cleaning database...");
        await User.deleteMany({});
        await Post.deleteMany({});
        await Ad.deleteMany({});

        console.log("Creating Admin User...");
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash("password123", salt);

        const adminUser = await User.create({
            username: "SuperAdmin",
            email: "admin@chemicalreports.com",
            password: hashedPassword,
            role: "admin",
        });

        console.log(`Admin created: ${adminUser.email} / password123`);

        console.log("Creating Sample Posts...");
        const posts = [
            {
                title: "Global Chemical Market Surges to New Heights",
                content: "<p>The global chemical market is experiencing unprecedented growth...</p>",
                category: "News Roundup",
                image: "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&q=80&w=1000",
                isStoryOfTheDay: true,
                slug: "global-chemical-market-surges",
                author: "Admin",
            },
            {
                title: "Innovation in Green Chemistry",
                content: "<p>Sustainable practices are becoming the norm in chemical manufacturing...</p>",
                category: "Research & Reports",
                image: "https://images.unsplash.com/photo-1530213786676-41ad9kc7130?auto=format&fit=crop&q=80&w=1000",
                isStoryOfTheDay: false,
                slug: "innovation-green-chemistry",
                author: "Admin",
            },
            {
                title: "Top 10 Solvents for Industrial Use",
                content: "<p>A comprehensive guide to the best solvents for your industrial needs...</p>",
                category: "Chemical Mart",
                image: "https://images.unsplash.com/photo-1622646279177-3e1577c3856d?auto=format&fit=crop&q=80&w=1000",
                isStoryOfTheDay: false,
                slug: "top-10-solvents",
                author: "Admin",
            },
            {
                title: "BASF Announces New Sustainability Goals",
                content: "<p>The chemical giant has unveiled an ambitious plan to reduce carbon emissions...</p>",
                category: "Corporate Profile",
                image: "https://images.unsplash.com/photo-1581093458791-9f3020614838?auto=format&fit=crop&q=80&w=1000",
                isStoryOfTheDay: false,
                slug: "basf-sustainability-goals",
                author: "Admin",
            },
            {
                title: "Startup Spotlight: ChemAI",
                content: "<p>How AI is revolutionizing drug discovery and material science...</p>",
                category: "START UP",
                image: "https://images.unsplash.com/photo-1555255707-c07966088b7b?auto=format&fit=crop&q=80&w=1000",
                isStoryOfTheDay: false,
                slug: "startup-spotlight-chemai",
                author: "Admin",
            }
        ];

        await Post.insertMany(posts);
        console.log(`${posts.length} posts created.`);

        console.log("Creating Sample Ad...");
        await Ad.create({
            title: "Premium Report Subscription",
            image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=1000",
            link: "https://example.com/subscribe",
            type: "popup",
            durationDays: 30,
            isActive: true,
        });
        console.log("Sample Ad created.");

        console.log("Seeding complete!");
        process.exit();
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

seedData();

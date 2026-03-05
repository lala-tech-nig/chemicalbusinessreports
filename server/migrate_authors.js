const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Post = require('./models/Post');

dotenv.config();

const migrateAuthors = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB...");

        // Update all posts where author is "Admin" or "SuperAdmin" to "Foluso Olorunfemi"
        const result = await Post.updateMany(
            { author: { $in: ["Admin", "SuperAdmin"] } },
            { $set: { author: "Foluso Olorunfemi" } }
        );

        console.log(`Successfully updated ${result.modifiedCount} posts.`);
        process.exit(0);
    } catch (err) {
        console.error("Migration failed:", err);
        process.exit(1);
    }
};

migrateAuthors();

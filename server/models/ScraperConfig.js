const mongoose = require("mongoose");

const ScraperConfigSchema = new mongoose.Schema({
    targetUrls: {
        type: [String],
        default: [
            "https://www.chemanager-online.com/en/news",
            "https://www.icis.com/explore/news/"
        ]
    },
    keywords: {
        type: [String],
        default: [
            "BASF", "Dow", "SABIC", "petrochemicals", "merger", "acquisition", "capacity"
        ]
    },
    lastRun: {
        type: Date,
        default: null
    }
});

// Enforce singleton pattern (only one config doc should exist)
ScraperConfigSchema.statics.getConfig = async function () {
    let config = await this.findOne();
    if (!config) {
        config = await this.create({});
    }
    return config;
};

module.exports = mongoose.model("ScraperConfig", ScraperConfigSchema);

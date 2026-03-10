const mongoose = require("mongoose");

const ScraperConfigSchema = new mongoose.Schema({
    targetUrls: {
        type: [String],
        default: [
            "https://punchng.com/",
            "https://vanguardngr.com/",
            "https://thenationonlineng.net/",
            "https://guardian.ng/",
            "https://tribuneonlineng.com/",
            "https://dailytrust.com/",
            "https://www.premiumtimesng.com/",
            "https://saharareporters.com/",
            "https://thecable.ng/",
            "https://leadership.ng/",
            "https://businessday.ng/",
            "https://nairametrics.com/"
        ]
    },
    keywords: {
        type: [String],
        default: [
            "Pharmaceutical industry news",
            "Cosmetics & personal care industry news",
            "Foods & drinks industry news (including beverages, brewery, distilleries industries etc)",
            "Industrial Chemicals news",
            "Medical & health news",
            "Agribusiness news",
            "Petrochemical industry news",
            "Oil & gas industry news",
            "Chemical & allied industries news"
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

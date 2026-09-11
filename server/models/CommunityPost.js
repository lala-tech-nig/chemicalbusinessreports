const mongoose = require("mongoose");

const CommunityPostSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },
        slug: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        authorName: {
            type: String,
            default: "Anonymous Chemist",
        },
        authorAffiliation: {
            type: String,
            default: "Independent Researcher",
        },
        authorPhoto: {
            type: String,
            default: "",
        },
        type: {
            type: String,
            enum: ["thesis", "article", "discussion", "case-study"],
            default: "thesis",
            index: true,
        },
        category: {
            type: String,
            required: true,
            enum: [
                "Industrial & Petrochemicals",
                "Pharmaceutical & Medicinal",
                "Cosmetics & Personal Care",
                "Green Chemistry & Circular Economy",
                "Agrochemicals & Fertilizers",
                "Polymers & Materials Science",
                "Process Engineering & Plant Ops",
                "General ChemTalk",
            ],
            index: true,
        },
        abstract: {
            type: String,
            default: "",
        },
        content: {
            type: String,
            required: true,
        },
        coverImage: {
            type: String,
            default: "",
        },
        attachmentUrl: {
            type: String,
            default: "", // Full Thesis PDF or data file
        },
        attachmentName: {
            type: String,
            default: "",
        },
        tags: [
            {
                type: String,
                trim: true,
            },
        ],
        likes: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],
        likeCount: {
            type: Number,
            default: 0,
        },
        views: {
            type: Number,
            default: 0,
        },
        commentCount: {
            type: Number,
            default: 0,
        },
        status: {
            type: String,
            enum: ["published", "flagged"],
            default: "published",
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("CommunityPost", CommunityPostSchema);

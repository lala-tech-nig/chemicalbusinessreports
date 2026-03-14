const mongoose = require("mongoose");

const ExecutiveProfileSchema = new mongoose.Schema({
    // Section 1 — Basic Information
    fullName: { type: String, required: true },
    professionalTitle: { type: String, required: true },
    company: { type: String, required: true },
    industry: { type: String, required: true },
    location: { type: String, required: true }, // City & Country
    headshot: { type: String, default: "" }, // URL

    // Section 2 — Executive Summary
    summary: { type: String, required: true },

    // Section 3 — Educational Background
    degrees: { type: String }, // Primary Degree(s)
    professionalTraining: { type: String },

    // Section 4 — Career Journey
    careerJourney: { type: String },

    // Section 5 — Professional Experience
    yearsOfExperience: { type: String },
    expertise: { type: [String] },
    majorRoles: { type: String },

    // Section 6 — Key Achievements and Contributions
    achievements: { type: String },

    // Section 7 — Industry Insight
    opportunities: { type: String },
    challenges: { type: String },

    // Section 8 — Leadership Philosophy
    leadershipPhilosophy: { type: String },

    // Section 9 — Mentorship and Impact
    mentorshipDetails: { type: String },

    // Section 10 — Entrepreneurship or Initiatives
    entrepreneurshipDetails: { type: String },

    // Section 11 — Professional Memberships & Certifications
    memberships: { type: String },

    // Section 12 — Community Engagement
    communityEngagement: { type: String },

    // Section 13 — Vision for the Future
    longTermVision: { type: String },

    // Section 14 — Personal Insights (Optional)
    personalInterests: { type: String },

    // Section 15 — Final Message
    finalMessage: { type: String },

    // Final Confirmation
    isConfirmed: { type: Boolean, default: false },

    createdAt: {
        type: Date,
        default: Date.now,
    },
}, { timestamps: true });

module.exports = mongoose.model("ExecutiveProfile", ExecutiveProfileSchema);

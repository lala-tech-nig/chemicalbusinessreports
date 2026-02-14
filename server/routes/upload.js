const express = require("express");
const router = express.Router();
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const dotenv = require("dotenv");

dotenv.config();

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure Storage
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: "chemical-reports", // Folder name in Cloudinary
        resource_type: "auto", // Automatically detect image/video
        allowed_formats: ["jpg", "png", "jpeg", "gif", "mp4", "webm", "mov"],
    },
});

const upload = multer({ storage: storage });

// @route   POST /api/upload
// @desc    Upload media to Cloudinary
// @access  Public (or Protected)
router.post("/", upload.single("file"), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        // Multer-storage-cloudinary puts the file info in req.file
        // req.file.path is the Cloudinary URL
        res.status(200).json({
            message: "File uploaded successfully",
            filePath: req.file.path,
        });
    } catch (error) {
        console.error("Upload error:", error);
        res.status(500).json({ message: "Upload failed: " + error.message });
    }
});

module.exports = router;

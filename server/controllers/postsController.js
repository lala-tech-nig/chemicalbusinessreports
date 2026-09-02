const Post = require("../models/Post");
const slugify = require("slugify");
const { sendBrandStoryNotification, sendPlatformUsersStoryUpdate } = require("../services/emailReportService");

// Helper function to format post with populated author data
const formatPostWithAuthor = (post) => {
    const postObj = post.toObject ? post.toObject() : post;

    // If we have a populated authorId, use it for the latest data
    if (postObj.authorId && typeof postObj.authorId === 'object') {
        const user = postObj.authorId;
        // Use the user's actual username for all roles
        postObj.author = user.username;
        postObj.authorPhoto = user.profilePhoto || "";
    }

    return postObj;
};

// @desc    Get all posts
// @route   GET /api/posts
// @access  Public
exports.getPosts = async (req, res) => {
    try {
        const { category, subcategory, search, status } = req.query;
        let query = {};

        if (category && category !== "All") {
            query.category = category;
        }

        if (subcategory) {
            query.subcategory = subcategory;
        }

        if (search) {
            query.title = { $regex: search, $options: "i" };
        }

        // Filter by status (default to 'published' to hide drafts from public site)
        if (status === 'all') {
            // no status filter
        } else if (status) {
            query.status = status;
        } else {
            // Treat posts without a status field as published for backwards compatibility
            query.$or = [
                { status: 'published' },
                { status: { $exists: false } }
            ];
        }

        const posts = await Post.find(query)
            .populate('authorId', 'username profilePhoto role')
            .sort({ createdAt: -1 });

        const formattedPosts = posts.map(formatPostWithAuthor);
        res.json(formattedPosts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single post
// @route   GET /api/posts/:slug
// @access  Public
exports.getPostBySlug = async (req, res) => {
    try {
        const post = await Post.findOne({ slug: req.params.slug })
            .populate('authorId', 'username profilePhoto role');

        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        // If post is not published, verify user is admin/moderator
        if (post.status && post.status !== "published") {
            const jwt = require("jsonwebtoken");
            const User = require("../models/User");
            let authorized = false;

            if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
                try {
                    const token = req.headers.authorization.split(" ")[1];
                    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret_dev_key_123");
                    const user = await User.findById(decoded.id);
                    if (user && user.isActive && (user.role === "admin" || user.role === "moderator")) {
                        authorized = true;
                    }
                } catch (e) {
                    // Fail silently
                }
            }

            if (!authorized) {
                return res.status(404).json({ message: "Post not found" });
            }
        }

        // Increment views
        post.views += 1;
        await post.save();

        res.json(formatPostWithAuthor(post));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single post by ID
// @route   GET /api/posts/id/:id
// @access  Public
exports.getPostById = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
            .populate('authorId', 'username profilePhoto role');

        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }
        res.json(formatPostWithAuthor(post));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a post
// @route   POST /api/posts
// @access  Private (Admin)
exports.createPost = async (req, res) => {
    try {
        const { title, content, category, image, isStoryOfTheDay, companyName, productName, contactNumber, website, email, researchTopic, video, ceoDetails, companyServices, earlyBeginning, fails, success, awards, topic, subcategory, adSize, adDuration, excerpt, excerptColor, excerptTextColor, adPlacements, status, scheduledPublishDate } = req.body;
        let { slug } = req.body;

        if (!slug && title) {
            slug = slugify(title, { lower: true, strict: true });
        } else if (!slug && (companyName || productName || researchTopic || topic)) {
            // Fallback for slug if title is missing
            const source = companyName || productName || researchTopic || topic;
            slug = slugify(source, { lower: true, strict: true });
        }

        // Strictly use logged-in user's details for attribution
        const authorName = req.user.username;
        const photo = req.user.profilePhoto || "";

        const newPost = new Post({
            title,
            slug,
            content,
            category,
            image,
            isStoryOfTheDay,
            companyName, productName, contactNumber, website, email, researchTopic, video, ceoDetails, companyServices, earlyBeginning, fails, success, awards, topic,
            subcategory, adSize, adDuration, excerpt, excerptColor, excerptTextColor,
            adPlacements,
            author: authorName,
            authorPhoto: photo,
            authorId: req.user._id, // Store reference for robust linking
            status: status || 'published',
            scheduledPublishDate: status === 'scheduled' ? scheduledPublishDate : null
        });
        const savedPost = await newPost.save();

        // If this post is Story of the Day, unset others
        if (newPost.isStoryOfTheDay) {
            await Post.updateMany(
                { _id: { $ne: savedPost._id } },
                { $set: { isStoryOfTheDay: false } }
            );
        }

        // Trigger Brand Mention Notification & Platform User Updates if published
        if (savedPost.status === 'published') {
            const notifyBrand = req.body.notifyBrand !== false;
            const notifyUsers = req.body.notifyUsers === true;

            if (notifyBrand && savedPost.email && savedPost.email.trim()) {
                sendBrandStoryNotification({ post: savedPost, isUpdate: false })
                    .catch(err => console.error("Error sending brand story notification:", err));
            }

            if (notifyUsers) {
                sendPlatformUsersStoryUpdate({ post: savedPost, isUpdate: false })
                    .catch(err => console.error("Error sending platform users story update:", err));
            }
        }

        res.status(201).json(savedPost);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update a post
// @route   PUT /api/posts/:id
// @access  Private (Admin)
exports.updatePost = async (req, res) => {
    try {
        const { title, content, category, image, isStoryOfTheDay, companyName, productName, contactNumber, website, email, researchTopic, video, ceoDetails, companyServices, earlyBeginning, fails, success, awards, topic, subcategory, adSize, adDuration, excerpt, excerptColor, excerptTextColor, adPlacements, status, scheduledPublishDate, notifyBrand, notifyUsers } = req.body;
        // Optional: Regenerate slug if title changes, but often better to keep stable.
        // For now, let's keep slug stable unless explicitly changed (not implemented in UI yet)

        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        post.title = title || post.title;
        post.content = content || post.content;
        post.category = category || post.category;
        post.image = image || post.image;
        if (isStoryOfTheDay !== undefined) post.isStoryOfTheDay = isStoryOfTheDay;

        // Dynamic fields update
        if (companyName !== undefined) post.companyName = companyName;
        if (productName !== undefined) post.productName = productName;
        if (contactNumber !== undefined) post.contactNumber = contactNumber;
        if (website !== undefined) post.website = website;
        if (email !== undefined) post.email = email;
        if (researchTopic !== undefined) post.researchTopic = researchTopic;
        if (video !== undefined) post.video = video;
        if (ceoDetails !== undefined) post.ceoDetails = ceoDetails;
        if (companyServices !== undefined) post.companyServices = companyServices;
        if (earlyBeginning !== undefined) post.earlyBeginning = earlyBeginning;
        if (fails !== undefined) post.fails = fails;
        if (success !== undefined) post.success = success;
        if (awards !== undefined) post.awards = awards;
        if (topic !== undefined) post.topic = topic;
        if (subcategory !== undefined) post.subcategory = subcategory;
        if (adSize !== undefined) post.adSize = adSize;
        if (adDuration !== undefined) post.adDuration = adDuration;
        if (excerpt !== undefined) post.excerpt = excerpt;
        if (excerptColor) post.excerptColor = excerptColor;
        if (excerptTextColor) post.excerptTextColor = excerptTextColor;
        if (adPlacements) post.adPlacements = adPlacements;

        if (status) post.status = status;
        if (status === 'scheduled') {
            post.scheduledPublishDate = scheduledPublishDate || post.scheduledPublishDate;
        } else {
            post.scheduledPublishDate = null;
        }

        // If this post is set to Story of the Day, unset others
        if (post.isStoryOfTheDay) {
            await Post.updateMany(
                { _id: { $ne: post._id } },
                { $set: { isStoryOfTheDay: false } }
            );
        }

        // Update attribution details
        // Ensure authorId is set if missing (legacy posts being edited)
        if (!post.authorId) {
            post.authorId = req.user._id;
        }

        const currentDisplayName = req.user.username;
        if (post.author === currentDisplayName || post.author === "Admin" || post.author === "SuperAdmin" || !post.author || post.author === "Foluso Olorunfemi") {
            post.author = currentDisplayName;
            post.authorPhoto = req.user.profilePhoto || "";
        }

        const updatedPost = await post.save();

        // Trigger Brand Story Update Notification & Platform User Updates if published
        if (updatedPost.status === 'published') {
            const shouldNotifyBrand = notifyBrand !== false;
            const shouldNotifyUsers = notifyUsers === true;

            if (shouldNotifyBrand && updatedPost.email && updatedPost.email.trim()) {
                sendBrandStoryNotification({ post: updatedPost, isUpdate: true })
                    .catch(err => console.error("Error sending brand story update notification:", err));
            }

            if (shouldNotifyUsers) {
                sendPlatformUsersStoryUpdate({ post: updatedPost, isUpdate: true })
                    .catch(err => console.error("Error sending platform users story update:", err));
            }
        }

        res.json(updatedPost);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete post
// @route   DELETE /api/posts/:id
// @access  Private (Admin)
exports.deletePost = async (req, res) => {
    try {
        const post = await Post.findByIdAndDelete(req.params.id);
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }
        res.json({ message: "Post deleted" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// @desc    Toggle Story of the Day
// @route   PUT /api/posts/:id/story
// @access  Private (Admin)
exports.setStoryOfTheDay = async (req, res) => {
    try {
        // Unset all posts first
        await Post.updateMany({}, { isStoryOfTheDay: false });

        // Set the selected one
        const post = await Post.findByIdAndUpdate(
            req.params.id,
            { isStoryOfTheDay: true },
            { new: true }
        );

        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        res.json(post);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

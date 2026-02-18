const Post = require("../models/Post");
const slugify = require("slugify");

// @desc    Get all posts
// @route   GET /api/posts
// @access  Public
exports.getPosts = async (req, res) => {
    try {
        const { category, search } = req.query;
        let query = {};

        if (category && category !== "All") {
            query.category = category;
        }

        if (search) {
            query.title = { $regex: search, $options: "i" };
        }

        const posts = await Post.find(query).sort({ createdAt: -1 });
        res.json(posts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single post
// @route   GET /api/posts/:slug
// @access  Public
exports.getPostBySlug = async (req, res) => {
    try {
        const post = await Post.findOne({ slug: req.params.slug });
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }
        // Increment views
        post.views += 1;
        await post.save();

        res.json(post);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single post by ID
// @route   GET /api/posts/id/:id
// @access  Public
exports.getPostById = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }
        res.json(post);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a post
// @route   POST /api/posts
// @access  Private (Admin)
exports.createPost = async (req, res) => {
    try {
        const { title, content, category, image, isStoryOfTheDay, companyName, productName, contactNumber, researchTopic, video, ceoDetails, companyServices, earlyBeginning, fails, success, awards, topic, subcategory, adSize, adDuration } = req.body;
        let { slug } = req.body;

        if (!slug && title) {
            slug = slugify(title, { lower: true, strict: true });
        } else if (!slug && (companyName || productName || researchTopic || topic)) {
            // Fallback for slug if title is missing
            const source = companyName || productName || researchTopic || topic;
            slug = slugify(source, { lower: true, strict: true });
        }

        const newPost = new Post({
            title,
            slug,
            content,
            category,
            image,
            isStoryOfTheDay,
            companyName, productName, contactNumber, researchTopic, video, ceoDetails, companyServices, earlyBeginning, fails, success, awards, topic,
            subcategory, adSize, adDuration
        });
        const savedPost = await newPost.save();

        // If this post is Story of the Day, unset others
        if (newPost.isStoryOfTheDay) {
            await Post.updateMany(
                { _id: { $ne: savedPost._id } },
                { $set: { isStoryOfTheDay: false } }
            );
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
        const { title, content, category, image, isStoryOfTheDay, companyName, productName, contactNumber, researchTopic, video, ceoDetails, companyServices, earlyBeginning, fails, success, awards, topic, subcategory, adSize, adDuration } = req.body;
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
        if (companyName) post.companyName = companyName;
        if (productName) post.productName = productName;
        if (contactNumber) post.contactNumber = contactNumber;
        if (researchTopic) post.researchTopic = researchTopic;
        if (video) post.video = video;
        if (ceoDetails) post.ceoDetails = ceoDetails;
        if (companyServices) post.companyServices = companyServices;
        if (earlyBeginning) post.earlyBeginning = earlyBeginning;
        if (fails) post.fails = fails;
        if (success) post.success = success;
        if (awards) post.awards = awards;
        if (topic) post.topic = topic;
        if (subcategory) post.subcategory = subcategory;
        if (adSize) post.adSize = adSize;
        if (adDuration) post.adDuration = adDuration;

        // If this post is set to Story of the Day, unset others
        if (post.isStoryOfTheDay) {
            await Post.updateMany(
                { _id: { $ne: post._id } },
                { $set: { isStoryOfTheDay: false } }
            );
        }

        const updatedPost = await post.save();
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

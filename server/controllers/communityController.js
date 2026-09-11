const CommunityPost = require("../models/CommunityPost");
const CommunityComment = require("../models/CommunityComment");
const User = require("../models/User");
const slugify = require("slugify");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

// Generate JWT token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || "secret_dev_key_123", {
        expiresIn: "30d",
    });
};

// @desc    Register a new community member
// @route   POST /api/community/auth/register
// @access  Public
exports.registerMember = async (req, res) => {
    try {
        const { username, email, password, fullName, affiliation, fieldOfStudy, bio } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ message: "Username, email, and password are required" });
        }

        const existingEmail = await User.findOne({ email: email.toLowerCase() });
        if (existingEmail) {
            return res.status(400).json({ message: "An account with this email already exists" });
        }

        const existingUsername = await User.findOne({ username: { $regex: new RegExp(`^${username}$`, "i") } });
        if (existingUsername) {
            return res.status(400).json({ message: "Username is already taken" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({
            username: username.trim(),
            email: email.toLowerCase().trim(),
            password: hashedPassword,
            role: "member",
            fullName: fullName ? fullName.trim() : username.trim(),
            affiliation: affiliation ? affiliation.trim() : "",
            fieldOfStudy: fieldOfStudy ? fieldOfStudy.trim() : "",
            bio: bio ? bio.trim() : "",
            reputation: 5, // Welcome bonus reputation
            isActive: true,
        });

        res.status(201).json({
            _id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
            fullName: user.fullName,
            affiliation: user.affiliation,
            fieldOfStudy: user.fieldOfStudy,
            profilePhoto: user.profilePhoto,
            reputation: user.reputation,
            token: generateToken(user._id),
        });
    } catch (error) {
        console.error("Community register error:", error);
        res.status(500).json({ message: error.message || "Registration failed" });
    }
};

// @desc    Login community member
// @route   POST /api/community/auth/login
// @access  Public
exports.loginMember = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Please provide email and password" });
        }

        const user = await User.findOne({
            $or: [
                { email: email.toLowerCase().trim() },
                { username: email.trim() },
            ],
        });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        if (!user.isActive) {
            return res.status(403).json({ message: "Account has been suspended" });
        }

        res.json({
            _id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
            fullName: user.fullName || user.username,
            affiliation: user.affiliation || "",
            fieldOfStudy: user.fieldOfStudy || "",
            profilePhoto: user.profilePhoto || "",
            reputation: user.reputation || 0,
            token: generateToken(user._id),
        });
    } catch (error) {
        console.error("Community login error:", error);
        res.status(500).json({ message: error.message || "Login failed" });
    }
};

// @desc    Get current community user profile
// @route   GET /api/community/auth/me
// @access  Private
exports.getCommunityMe = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select("-password");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get community posts (Theses, Articles, Discussions)
// @route   GET /api/community/posts
// @access  Public
exports.getCommunityPosts = async (req, res) => {
    try {
        const { category, type, search, sort = "latest", page = 1, limit = 20 } = req.query;
        let query = { status: "published" };

        if (category && category !== "All") {
            query.category = category;
        }

        if (type && type !== "all") {
            query.type = type;
        }

        if (search && search.trim()) {
            query.$or = [
                { title: { $regex: search.trim(), $options: "i" } },
                { abstract: { $regex: search.trim(), $options: "i" } },
                { tags: { $in: [new RegExp(search.trim(), "i")] } },
                { authorName: { $regex: search.trim(), $options: "i" } },
            ];
        }

        let sortOption = { createdAt: -1 };
        if (sort === "popular") {
            sortOption = { likeCount: -1, views: -1, createdAt: -1 };
        } else if (sort === "discussed") {
            sortOption = { commentCount: -1, createdAt: -1 };
        } else if (sort === "theses") {
            sortOption = { type: 1, createdAt: -1 };
        }

        const skip = (Number(page) - 1) * Number(limit);

        const [posts, total] = await Promise.all([
            CommunityPost.find(query)
                .populate("author", "username fullName affiliation fieldOfStudy profilePhoto role reputation")
                .sort(sortOption)
                .skip(skip)
                .limit(Number(limit)),
            CommunityPost.countDocuments(query),
        ]);

        res.json({
            posts,
            total,
            page: Number(page),
            pages: Math.ceil(total / Number(limit)),
        });
    } catch (error) {
        console.error("Get community posts error:", error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single community post by slug
// @route   GET /api/community/posts/:slug
// @access  Public
exports.getCommunityPostBySlug = async (req, res) => {
    try {
        const post = await CommunityPost.findOne({ slug: req.params.slug })
            .populate("author", "username fullName affiliation fieldOfStudy bio profilePhoto role reputation");

        if (!post) {
            return res.status(404).json({ message: "Post or thesis not found" });
        }

        // Increment views in background
        post.views += 1;
        await post.save();

        res.json(post);
    } catch (error) {
        console.error("Get single community post error:", error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a community post or thesis
// @route   POST /api/community/posts
// @access  Private (Member / Admin)
exports.createCommunityPost = async (req, res) => {
    try {
        const { title, category, type = "thesis", abstract, content, coverImage, attachmentUrl, attachmentName, tags } = req.body;

        if (!title || !category || !content) {
            return res.status(400).json({ message: "Title, category, and content are required." });
        }

        let baseSlug = slugify(title, { lower: true, strict: true });
        if (!baseSlug) baseSlug = `post-${Date.now()}`;

        // Ensure slug uniqueness
        let uniqueSlug = baseSlug;
        let counter = 1;
        while (await CommunityPost.findOne({ slug: uniqueSlug })) {
            uniqueSlug = `${baseSlug}-${counter++}`;
        }

        const authorName = req.user.fullName || req.user.username;
        const authorAffiliation = req.user.affiliation || (req.user.role === "admin" ? "Editorial Board" : "Independent Chemist");
        const authorPhoto = req.user.profilePhoto || "";

        const parsedTags = Array.isArray(tags)
            ? tags
            : typeof tags === "string"
            ? tags.split(",").map((t) => t.trim()).filter(Boolean)
            : [];

        const newPost = new CommunityPost({
            title: title.trim(),
            slug: uniqueSlug,
            author: req.user._id,
            authorName,
            authorAffiliation,
            authorPhoto,
            type,
            category,
            abstract: abstract ? abstract.trim() : "",
            content,
            coverImage: coverImage || "",
            attachmentUrl: attachmentUrl || "",
            attachmentName: attachmentName || "",
            tags: parsedTags,
            likes: [],
            likeCount: 0,
            views: 0,
            commentCount: 0,
            status: "published",
        });

        const savedPost = await newPost.save();

        // Award reputation to author
        await User.findByIdAndUpdate(req.user._id, { $inc: { reputation: 10 } });

        res.status(201).json(savedPost);
    } catch (error) {
        console.error("Create community post error:", error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Toggle like on community post
// @route   POST /api/community/posts/:id/like
// @access  Private
exports.toggleCommunityPostLike = async (req, res) => {
    try {
        const post = await CommunityPost.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        const userId = req.user._id;
        const isLiked = post.likes.some((id) => id.toString() === userId.toString());

        if (isLiked) {
            post.likes = post.likes.filter((id) => id.toString() !== userId.toString());
            post.likeCount = Math.max(0, post.likeCount - 1);
            // Deduct reputation
            await User.findByIdAndUpdate(post.author, { $inc: { reputation: -2 } });
        } else {
            post.likes.push(userId);
            post.likeCount += 1;
            // Add reputation
            await User.findByIdAndUpdate(post.author, { $inc: { reputation: 2 } });
        }

        await post.save();

        res.json({
            isLiked: !isLiked,
            likeCount: post.likeCount,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get threaded comments for a community post
// @route   GET /api/community/posts/:id/comments
// @access  Public
exports.getCommunityComments = async (req, res) => {
    try {
        const comments = await CommunityComment.find({ postId: req.params.id })
            .populate("author", "username fullName affiliation fieldOfStudy profilePhoto role reputation")
            .sort({ createdAt: 1 });

        // Build threaded tree: top-level comments with nested replies
        const commentMap = {};
        const rootComments = [];

        comments.forEach((c) => {
            const commentObj = c.toObject();
            commentObj.replies = [];
            commentMap[commentObj._id.toString()] = commentObj;
        });

        comments.forEach((c) => {
            const commentObj = commentMap[c._id.toString()];
            if (c.parentId && commentMap[c.parentId.toString()]) {
                commentMap[c.parentId.toString()].replies.push(commentObj);
            } else {
                rootComments.push(commentObj);
            }
        });

        res.json({
            comments: rootComments,
            total: comments.length,
        });
    } catch (error) {
        console.error("Get community comments error:", error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Add comment or sub-reply
// @route   POST /api/community/posts/:id/comments
// @access  Private
exports.createCommunityComment = async (req, res) => {
    try {
        const { content, parentId } = req.body;

        if (!content || !content.trim()) {
            return res.status(400).json({ message: "Comment content is required" });
        }

        const post = await CommunityPost.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        // If parentId provided, verify parent exists
        if (parentId) {
            const parentComment = await CommunityComment.findById(parentId);
            if (!parentComment) {
                return res.status(404).json({ message: "Parent thread not found" });
            }
        }

        const authorName = req.user.fullName || req.user.username;
        const authorAffiliation = req.user.affiliation || "";
        const authorPhoto = req.user.profilePhoto || "";

        const newComment = new CommunityComment({
            postId: post._id,
            author: req.user._id,
            authorName,
            authorAffiliation,
            authorPhoto,
            content: content.trim(),
            parentId: parentId || null,
            likes: [],
            likeCount: 0,
        });

        const savedComment = await newComment.save();

        // Increment post comment counter
        post.commentCount += 1;
        await post.save();

        // Award reputation to commenter
        await User.findByIdAndUpdate(req.user._id, { $inc: { reputation: 2 } });

        const populated = await CommunityComment.findById(savedComment._id)
            .populate("author", "username fullName affiliation fieldOfStudy profilePhoto role reputation");

        const commentObj = populated.toObject();
        commentObj.replies = [];

        res.status(201).json(commentObj);
    } catch (error) {
        console.error("Create comment error:", error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Toggle like on comment
// @route   POST /api/community/comments/:id/like
// @access  Private
exports.toggleCommunityCommentLike = async (req, res) => {
    try {
        const comment = await CommunityComment.findById(req.params.id);
        if (!comment) {
            return res.status(404).json({ message: "Comment not found" });
        }

        const userId = req.user._id;
        const isLiked = comment.likes.some((id) => id.toString() === userId.toString());

        if (isLiked) {
            comment.likes = comment.likes.filter((id) => id.toString() !== userId.toString());
            comment.likeCount = Math.max(0, comment.likeCount - 1);
        } else {
            comment.likes.push(userId);
            comment.likeCount += 1;
        }

        await comment.save();

        res.json({
            isLiked: !isLiked,
            likeCount: comment.likeCount,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

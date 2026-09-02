const cron = require("node-cron");
const Post = require("../models/Post");
const { sendBrandStoryNotification, sendPlatformUsersStoryUpdate } = require("./emailReportService");

/**
 * Starts a background cron job that runs every minute (* * * * *) to check for 
 * scheduled posts that are due to go live.
 */
const startScheduler = () => {
    console.log("[Scheduler] Post scheduler initialized successfully.");

    cron.schedule("* * * * *", async () => {
        try {
            const now = new Date();
            
            // Find all posts that are scheduled and whose publish date is now or in the past
            const scheduledPosts = await Post.find({
                status: "scheduled",
                scheduledPublishDate: { $lte: now }
            });

            if (scheduledPosts.length > 0) {
                console.log(`[Scheduler] Found ${scheduledPosts.length} post(s) to go live at ${now.toISOString()}`);
                
                for (const post of scheduledPosts) {
                    // Update status to published
                    post.status = "published";
                    
                    // Update createdAt to the current time so it goes to the top of lists sorted by date
                    post.createdAt = now;
                    
                    // Clear the scheduled date
                    post.scheduledPublishDate = null;
                    
                    // Save post (this will trigger pre-save middleware to calculate expiryDate if Chemical Mart)
                    await post.save();
                    
                    console.log(`[Scheduler] Post successfully published: "${post.title}" (ID: ${post._id})`);

                    // Dispatch brand notification if email is attached
                    if (post.email && post.email.trim()) {
                        sendBrandStoryNotification({ post, isUpdate: false })
                            .catch(err => console.error("[Scheduler] Error sending brand story notification:", err));
                    }
                }
            }
        } catch (error) {
            console.error("[Scheduler] Error running scheduled publish cron:", error);
        }
    });
};

module.exports = { startScheduler };

const API_URL = process.env.NODE_ENV === "development" ? "http://localhost:5000/api" : "https://chemicalbusinessreports-f078.onrender.com/api";

function getAuthHeaders() {
    const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
    return {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
    };
}

export async function getMe() {
    const res = await fetch(`${API_URL}/auth/me`, {
        headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error("Failed to fetch user data");
    return res.json();
}

export async function login(credentials) {
    const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
    });
    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Login failed");
    }
    return res.json();
}

export async function uploadFile(file) {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(`${API_URL}/upload`, {
        method: 'POST',
        body: formData, // Content-Type header excluded so browser sets boundary
    });

    if (!res.ok) throw new Error("File upload failed");
    return res.json();
}

export async function fetchPosts(category = "All", search = "", subcategory = "", status = "") {
    const params = new URLSearchParams();
    if (category && category !== "All") params.append("category", category);
    if (subcategory) params.append("subcategory", subcategory);
    if (search) params.append("search", search);
    if (status) params.append("status", status);

    const res = await fetch(`${API_URL}/posts?${params.toString()}`);
    if (!res.ok) throw new Error("Failed to fetch posts");
    return res.json();
}

export async function fetchSinglePost(slug) {
    const res = await fetch(`${API_URL}/posts/${slug}`);
    if (!res.ok) throw new Error("Failed to fetch post");
    return res.json();
}

export async function fetchPostById(id) {
    const res = await fetch(`${API_URL}/posts/id/${id}`);
    if (!res.ok) throw new Error("Failed to fetch post");
    return res.json();
}

export async function fetchActiveAds() {
    const res = await fetch(`${API_URL}/ads`);
    if (!res.ok) throw new Error("Failed to fetch ads");
    return res.json();
}

// Admin / Protected Routes

export async function createPost(postData) {
    const res = await fetch(`${API_URL}/posts`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(postData),
    });
    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to create post");
    }
    return res.json();
}

export async function updatePost(id, postData) {
    const res = await fetch(`${API_URL}/posts/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(postData),
    });
    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to update post");
    }
    return res.json();
}



export async function deletePost(id) {
    const res = await fetch(`${API_URL}/posts/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Failed to delete post");
    return res.json();
}

export async function setStoryOfTheDay(id) {
    const res = await fetch(`${API_URL}/posts/story/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error("Failed to set story");
    return res.json();
}

export async function createAd(adData) {
    const res = await fetch(`${API_URL}/ads`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(adData),
    });
    if (!res.ok) throw new Error("Failed to create ad");
    return res.json();
}

export async function deleteAd(id) {
    const res = await fetch(`${API_URL}/ads/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Failed to delete ad");
    return res.json();
}

// User Management
export async function fetchUsers() {
    const res = await fetch(`${API_URL}/users`, {
        headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error("Failed to fetch users");
    return res.json();
}

export async function registerUser(userData) {
    const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(userData),
    });
    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to create user");
    }
    return res.json();
}

export async function updateUserStatus(id) {
    const res = await fetch(`${API_URL}/users/${id}/status`, {
        method: 'PUT',
        headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Failed to update user status");
    return res.json();
}

export async function updateUser(id, userData) {
    const res = await fetch(`${API_URL}/users/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(userData),
    });
    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to update user");
    }
    return res.json();
}

export async function deleteUser(id) {
    const res = await fetch(`${API_URL}/users/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
    });
    return res.json();
}

// Comments
export async function createComment(commentData) {
    const res = await fetch(`${API_URL}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(commentData),
    });
    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to submit comment");
    }
    return res.json();
}

export async function fetchApprovedComments(postId) {
    const res = await fetch(`${API_URL}/comments/post/${postId}`);
    if (!res.ok) throw new Error("Failed to fetch comments");
    return res.json();
}

export async function fetchPendingComments() {
    const res = await fetch(`${API_URL}/comments/pending`, {
        headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error("Failed to fetch pending comments");
    return res.json();
}

export async function approveComment(id) {
    const res = await fetch(`${API_URL}/comments/${id}/approve`, {
        method: 'PUT',
        headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error("Failed to approve comment");
    return res.json();
}

export async function deleteComment(id) {
    const res = await fetch(`${API_URL}/comments/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error("Failed to delete comment");
    return res.json();
}


// Submissions
export async function createSubmission(data) {
    const res = await fetch(`${API_URL}/submissions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to submit");
    }
    return res.json();
}

export async function fetchSubmissions() {
    const res = await fetch(`${API_URL}/submissions`, {
        headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error("Failed to fetch submissions");
    return res.json();
}

export async function createExecutiveProfile(data) {
    const res = await fetch(`${API_URL}/executive-profiles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to submit profile");
    }
    return res.json();
}

export async function fetchExecutiveProfiles() {
    const res = await fetch(`${API_URL}/executive-profiles`, {
        headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error("Failed to fetch executive profiles");
    return res.json();
}

// Auto Scraper
export async function getScraperConfig() {
    const res = await fetch(`${API_URL}/scraper/config`, {
        headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error("Failed to fetch scraper config");
    return res.json();
}

export async function updateScraperConfig(configData) {
    const res = await fetch(`${API_URL}/scraper/config`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(configData),
    });
    if (!res.ok) throw new Error("Failed to update scraper config");
    return res.json();
}

export async function runScraper() {
    const res = await fetch(`${API_URL}/scraper/run`, {
        method: 'POST',
        headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error("Failed to run scraper");
    return res.json();
}

export async function fetchScraperDrafts() {
    const res = await fetch(`${API_URL}/posts?status=draft`, {
        headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error("Failed to fetch drafts");
    return res.json();
}

// Analytics (Admin only)
export async function fetchAnalyticsSummary(params = {}) {
    const query = new URLSearchParams();
    if (params.dateRange) query.append("dateRange", params.dateRange);
    if (params.startDate) query.append("startDate", params.startDate);
    if (params.endDate) query.append("endDate", params.endDate);

    const res = await fetch(`${API_URL}/analytics/summary?${query.toString()}`, {
        headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error("Failed to fetch analytics summary");
    return res.json();
}

export async function fetchAnalyticsDetailed(params = {}) {
    const query = new URLSearchParams();
    const page = params.page || 1;
    const limit = params.limit || 20;
    query.append("page", page);
    query.append("limit", limit);

    if (params.dateRange) query.append("dateRange", params.dateRange);
    if (params.startDate) query.append("startDate", params.startDate);
    if (params.endDate) query.append("endDate", params.endDate);
    if (params.ip) query.append("ip", params.ip);
    if (params.search) query.append("search", params.search);
    if (params.pagePath) query.append("pagePath", params.pagePath);
    if (params.sortBy) query.append("sortBy", params.sortBy);
    if (params.sortOrder) query.append("sortOrder", params.sortOrder);

    const res = await fetch(`${API_URL}/analytics/detailed?${query.toString()}`, {
        headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error("Failed to fetch detailed analytics");
    return res.json();
}

export async function fetchDailyVisitors(days = 14) {
    const res = await fetch(`${API_URL}/analytics/daily-visitors?days=${days}`, {
        headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error("Failed to fetch daily visitors");
    return res.json();
}

export async function fetchAnalyticsByIP(ip) {
    const res = await fetch(`${API_URL}/analytics/ip/${encodeURIComponent(ip)}`, {
        headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error("Failed to fetch analytics for IP");
    return res.json();
}

export async function fetchReportLogs() {
    const res = await fetch(`${API_URL}/analytics/report-logs`, {
        headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error("Failed to fetch report logs");
    return res.json();
}

export async function fetchReportStatus() {
    const res = await fetch(`${API_URL}/analytics/report-status`, {
        headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error("Failed to fetch report status");
    return res.json();
}

export async function triggerDailyReport(recipients = null) {
    const res = await fetch(`${API_URL}/analytics/send-daily-report`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ recipients })
    });
    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to trigger daily report");
    }
    return res.json();
}

export async function triggerWeeklyReport(recipients = null) {
    const res = await fetch(`${API_URL}/analytics/send-weekly-report`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ recipients })
    });
    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to trigger weekly report");
    }
    return res.json();
}

export async function triggerTestVisitorAlert(payload = {}) {
    const res = await fetch(`${API_URL}/analytics/test-visitor-alert`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload)
    });
    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to send test alert");
    }
    return res.json();
}



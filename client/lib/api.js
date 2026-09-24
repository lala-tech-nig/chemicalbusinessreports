export const API_URL =
    process.env.NEXT_PUBLIC_API_URL ||
    (typeof window !== "undefined" && window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1"
        ? "https://chemical.livingvinepropertiesinvestment.com/api"
        : (process.env.NODE_ENV === "production"
            ? "https://chemical.livingvinepropertiesinvestment.com/api"
            : "http://localhost:5050/api"));

function getAuthHeaders() {
    const token = typeof window !== 'undefined'
        ? (localStorage.getItem('adminToken') || localStorage.getItem('staffToken') || localStorage.getItem('token'))
        : null;
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

export async function deleteAllDraftPosts() {
    const res = await fetch(`${API_URL}/posts/drafts/all`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
    });
    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to delete all drafts");
    }
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

export async function updateUserPermissions(id, dashboardPermissions) {
    const res = await fetch(`${API_URL}/users/${id}/permissions`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ dashboardPermissions }),
    });
    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to update permissions");
    }
    return res.json();
}

export async function triggerBackup() {
    const res = await fetch(`${API_URL}/backup/run`, {
        method: 'POST',
        headers: getAuthHeaders(),
    });
    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Backup failed");
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

export async function fetchAllComments(params = {}) {
    const query = new URLSearchParams(params).toString();
    const url = `${API_URL}/comments/all${query ? `?${query}` : ''}`;
    const res = await fetch(url, {
        headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error("Failed to fetch comments");
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

// ── ChemTalk / Community API Endpoints ─────────────────────────────────

export function getCommunityAuthHeaders() {
    const token = typeof window !== 'undefined'
        ? (localStorage.getItem('communityToken') || localStorage.getItem('adminToken'))
        : null;
    return {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
    };
}

export async function communityRegister(data) {
    const res = await fetch(`${API_URL}/community/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Registration failed");
    }
    return res.json();
}

export async function communityLogin(credentials) {
    const res = await fetch(`${API_URL}/community/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
    });
    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Login failed");
    }
    return res.json();
}

export async function getCommunityMe() {
    const res = await fetch(`${API_URL}/community/auth/me`, {
        headers: getCommunityAuthHeaders(),
    });
    if (!res.ok) throw new Error("Failed to fetch community profile");
    return res.json();
}

export async function fetchCommunityPosts({ category = "All", type = "all", search = "", sort = "latest", page = 1 } = {}) {
    const params = new URLSearchParams();
    if (category && category !== "All") params.append("category", category);
    if (type && type !== "all") params.append("type", type);
    if (search) params.append("search", search);
    if (sort) params.append("sort", sort);
    if (page) params.append("page", page);

    const res = await fetch(`${API_URL}/community/posts?${params.toString()}`);
    if (!res.ok) throw new Error("Failed to fetch community posts");
    return res.json();
}

export async function fetchCommunityPost(slug) {
    const res = await fetch(`${API_URL}/community/posts/${slug}`);
    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to fetch post");
    }
    return res.json();
}

export async function createCommunityPost(postData) {
    const res = await fetch(`${API_URL}/community/posts`, {
        method: 'POST',
        headers: getCommunityAuthHeaders(),
        body: JSON.stringify(postData),
    });
    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to publish post");
    }
    return res.json();
}

export async function toggleCommunityPostLike(postId) {
    const res = await fetch(`${API_URL}/community/posts/${postId}/like`, {
        method: 'POST',
        headers: getCommunityAuthHeaders(),
    });
    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to like post");
    }
    return res.json();
}

export async function fetchCommunityComments(postId) {
    const res = await fetch(`${API_URL}/community/posts/${postId}/comments`);
    if (!res.ok) throw new Error("Failed to fetch comments");
    return res.json();
}

export async function createCommunityComment(postId, commentData) {
    const res = await fetch(`${API_URL}/community/posts/${postId}/comments`, {
        method: 'POST',
        headers: getCommunityAuthHeaders(),
        body: JSON.stringify(commentData),
    });
    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to post comment");
    }
    return res.json();
}

export async function toggleCommunityCommentLike(commentId) {
    const res = await fetch(`${API_URL}/community/comments/${commentId}/like`, {
        method: 'POST',
        headers: getCommunityAuthHeaders(),
    });
    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to like comment");
    }
    return res.json();
}

// ── Admin ChemTalk Moderation API ──────────────────────────────────────

export async function adminFetchCommunityPosts({ search = "", type = "all", status = "all", page = 1 } = {}) {
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    if (type !== "all") params.append("type", type);
    if (status !== "all") params.append("status", status);
    params.append("page", page);
    const res = await fetch(`${API_URL}/community/admin/posts?${params.toString()}`, {
        headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Failed to fetch community posts");
    return res.json();
}

export async function adminFetchCommunityComments({ search = "", page = 1 } = {}) {
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    params.append("page", page);
    const res = await fetch(`${API_URL}/community/admin/comments?${params.toString()}`, {
        headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Failed to fetch community comments");
    return res.json();
}

export async function adminFetchCommunityUsers({ search = "", page = 1 } = {}) {
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    params.append("page", page);
    const res = await fetch(`${API_URL}/community/admin/users?${params.toString()}`, {
        headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Failed to fetch community users");
    return res.json();
}

export async function adminDeleteCommunityPost(id) {
    const res = await fetch(`${API_URL}/community/admin/posts/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to delete post");
    }
    return res.json();
}

export async function adminFlagCommunityPost(id) {
    const res = await fetch(`${API_URL}/community/admin/posts/${id}/flag`, {
        method: 'PUT',
        headers: getAuthHeaders(),
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to flag post");
    }
    return res.json();
}

export async function adminDeleteCommunityComment(id) {
    const res = await fetch(`${API_URL}/community/admin/comments/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to delete comment");
    }
    return res.json();
}

export async function adminToggleSuspendUser(id) {
    const res = await fetch(`${API_URL}/community/admin/users/${id}/suspend`, {
        method: 'PUT',
        headers: getAuthHeaders(),
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to update user status");
    }
    return res.json();
}

export async function adminDeleteCommunityUser(id) {
    const res = await fetch(`${API_URL}/community/admin/users/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to delete user");
    }
    return res.json();
}

// ── Staff Tasks & Kanban API ─────────────────────────────────────────

export async function fetchStaffTasks(params = {}) {
    const query = new URLSearchParams();
    if (params.date) query.append("date", params.date);
    if (params.staffId) query.append("staffId", params.staffId);
    if (params.status) query.append("status", params.status);
    if (params.isDraft !== undefined) query.append("isDraft", params.isDraft);
    if (params.priority) query.append("priority", params.priority);
    if (params.search) query.append("search", params.search);

    const res = await fetch(`${API_URL}/staff-tasks?${query.toString()}`, {
        headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Failed to fetch staff tasks");
    return res.json();
}

export async function createStaffTask(taskData) {
    const res = await fetch(`${API_URL}/staff-tasks`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(taskData),
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to create task");
    }
    return res.json();
}

export async function updateStaffTaskStatus(id, { status, adminSupportNote }) {
    const res = await fetch(`${API_URL}/staff-tasks/${id}/status`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({ status, adminSupportNote }),
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to update status");
    }
    return res.json();
}

export async function publishStaffDraft(id, date) {
    const res = await fetch(`${API_URL}/staff-tasks/${id}/publish`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({ date }),
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to publish draft");
    }
    return res.json();
}

export async function updateStaffTask(id, taskData) {
    const res = await fetch(`${API_URL}/staff-tasks/${id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(taskData),
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to update task");
    }
    return res.json();
}

export async function deleteStaffTask(id) {
    const res = await fetch(`${API_URL}/staff-tasks/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to delete task");
    }
    return res.json();
}

export async function addStaffTaskComment(id, text) {
    const res = await fetch(`${API_URL}/staff-tasks/${id}/comments`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ text }),
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to add comment");
    }
    return res.json();
}

export async function fetchStaffLeaderboard(period = "today") {
    const res = await fetch(`${API_URL}/staff-tasks/leaderboard?period=${period}`, {
        headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Failed to fetch leaderboard");
    return res.json();
}

export async function fetchStaffInfographics(staffId = "") {
    const url = staffId
        ? `${API_URL}/staff-tasks/infographics?staffId=${staffId}`
        : `${API_URL}/staff-tasks/infographics`;
    const res = await fetch(url, {
        headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Failed to fetch staff infographics");
    return res.json();
}

// ── Petty Cash API ────────────────────────────────────────────────────

export async function fetchPettyCashRequests(params = {}) {
    const query = new URLSearchParams();
    if (params.status) query.append("status", params.status);
    if (params.staffId) query.append("staffId", params.staffId);
    if (params.date) query.append("date", params.date);
    if (params.search) query.append("search", params.search);

    const res = await fetch(`${API_URL}/petty-cash?${query.toString()}`, {
        headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Failed to fetch petty cash requests");
    return res.json();
}

export async function createPettyCashRequest(data) {
    const res = await fetch(`${API_URL}/petty-cash`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to submit reimbursement");
    }
    return res.json();
}

export async function reviewPettyCashRequest(id, { status, adminNote }) {
    const res = await fetch(`${API_URL}/petty-cash/${id}/review`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({ status, adminNote }),
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to review request");
    }
    return res.json();
}

export async function reimbursePettyCashRequest(id, data = {}) {
    const res = await fetch(`${API_URL}/petty-cash/${id}/reimburse`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to reimburse request");
    }
    return res.json();
}

export async function deletePettyCashRequest(id) {
    const res = await fetch(`${API_URL}/petty-cash/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to delete request");
    }
    return res.json();
}

// ── Finances API ──────────────────────────────────────────────────────

export async function fetchFinanceOverview() {
    const res = await fetch(`${API_URL}/finances/overview`, {
        headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Failed to fetch financial overview");
    return res.json();
}

export async function fetchTransactions(params = {}) {
    const query = new URLSearchParams();
    if (params.type) query.append("type", params.type);
    if (params.category) query.append("category", params.category);
    if (params.bankAccount) query.append("bankAccount", params.bankAccount);
    if (params.startDate) query.append("startDate", params.startDate);
    if (params.endDate) query.append("endDate", params.endDate);
    if (params.search) query.append("search", params.search);

    const res = await fetch(`${API_URL}/finances/transactions?${query.toString()}`, {
        headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Failed to fetch transactions");
    return res.json();
}

export async function createTransaction(data) {
    const res = await fetch(`${API_URL}/finances/transactions`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to create transaction");
    }
    return res.json();
}

export async function deleteTransaction(id) {
    const res = await fetch(`${API_URL}/finances/transactions/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to delete transaction");
    }
    return res.json();
}

export async function fetchStaffSalaries() {
    const res = await fetch(`${API_URL}/finances/salaries`, {
        headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Failed to fetch staff salaries");
    return res.json();
}

export async function upsertStaffSalary(staffId, data) {
    const res = await fetch(`${API_URL}/finances/salaries/${staffId}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to update staff salary");
    }
    return res.json();
}

export async function recordSalaryPayment(staffId, data) {
    const res = await fetch(`${API_URL}/finances/salaries/${staffId}/pay`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to record salary payment");
    }
    return res.json();
}

export async function fetchBankAccounts() {
    const res = await fetch(`${API_URL}/finances/bank-accounts`, {
        headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Failed to fetch bank accounts");
    return res.json();
}

export async function createBankAccount(data) {
    const res = await fetch(`${API_URL}/finances/bank-accounts`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to create bank account");
    }
    return res.json();
}

export async function updateBankAccount(id, data) {
    const res = await fetch(`${API_URL}/finances/bank-accounts/${id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to update bank account");
    }
    return res.json();
}

export async function deleteBankAccount(id) {
    const res = await fetch(`${API_URL}/finances/bank-accounts/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to delete bank account");
    }
    return res.json();
}

// ── Meetings API ──────────────────────────────────────────────────────────

export async function fetchMeetings(params = {}) {
    const query = new URLSearchParams();
    if (params.status) query.append("status", params.status);
    if (params.limit) query.append("limit", params.limit);
    const res = await fetch(`${API_URL}/meetings?${query.toString()}`, {
        headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Failed to fetch meetings");
    return res.json();
}

export async function fetchNextMeeting() {
    const res = await fetch(`${API_URL}/meetings/next`, {
        headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Failed to fetch next meeting");
    return res.json();
}

export async function fetchMeeting(id) {
    const res = await fetch(`${API_URL}/meetings/${id}`, {
        headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Failed to fetch meeting");
    return res.json();
}

export async function createMeeting(data) {
    const res = await fetch(`${API_URL}/meetings`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to create meeting");
    }
    return res.json();
}

export async function updateMeeting(id, data) {
    const res = await fetch(`${API_URL}/meetings/${id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to update meeting");
    }
    return res.json();
}

export async function deleteMeeting(id) {
    const res = await fetch(`${API_URL}/meetings/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to delete meeting");
    }
    return res.json();
}


const express = require("express");
const router = express.Router();
const {
    getPettyCashRequests,
    createPettyCashRequest,
    reviewPettyCashRequest,
    reimbursePettyCashRequest,
    deletePettyCashRequest,
} = require("../controllers/pettyCashController");
const { protect, admin } = require("../middleware/authMiddleware");

router.use(protect);

router.route("/").get(getPettyCashRequests).post(createPettyCashRequest);

router.delete("/:id", deletePettyCashRequest);

// Admin only actions
router.put("/:id/review", admin, reviewPettyCashRequest);
router.put("/:id/reimburse", admin, reimbursePettyCashRequest);

module.exports = router;

const express = require("express");
const router = express.Router();
const { getUsers, deleteUser, toggleUserStatus, updateUser, updateUserPermissions } = require("../controllers/usersController");
const { protect, admin } = require("../middleware/authMiddleware");

router.get("/", protect, admin, getUsers);
router.put("/:id/status", protect, admin, toggleUserStatus);
router.put("/:id/permissions", protect, admin, updateUserPermissions);
router.put("/:id", protect, admin, updateUser);
router.delete("/:id", protect, admin, deleteUser);

module.exports = router;

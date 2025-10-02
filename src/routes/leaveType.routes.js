const express = require("express");
const router = express.Router();
const {
  getLeaveTypes,
  addLeaveType,
  updateLeaveType,
  deleteLeaveType,
} = require("../controllers/leaveType.controller");
const { auth, adminOnly } = require("../middleware/auth");

/**
 * @swagger
 * tags:
 *   name: LeaveTypes
 *   description: Manage employee leave types
 */

/**
 * @swagger
 * /api/leave-types:
 *   get:
 *     summary: Get all leave types
 *     tags: [LeaveTypes]
 *     responses:
 *       200:
 *         description: List of leave types
 */
router.get("/", auth, getLeaveTypes);

/**
 * @swagger
 * /api/leave-types:
 *   post:
 *     summary: Add a new leave type
 *     tags: [LeaveTypes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [TypeName, MaxDaysPerYear]
 *             properties:
 *               TypeName:
 *                 type: string
 *               MaxDaysPerYear:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Leave type added
 */
router.post("/", auth, adminOnly, addLeaveType);

/**
 * @swagger
 * /api/leave-types/{LeaveTypeID}:
 *   put:
 *     summary: Update a leave type
 *     tags: [LeaveTypes]
 *     parameters:
 *       - in: path
 *         name: LeaveTypeID
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [TypeName, MaxDaysPerYear]
 *             properties:
 *               TypeName:
 *                 type: string
 *               MaxDaysPerYear:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Leave type updated
 */
router.put("/:LeaveTypeID", auth, adminOnly, updateLeaveType);

/**
 * @swagger
 * /api/leave-types/{LeaveTypeID}:
 *   delete:
 *     summary: Delete a leave type
 *     tags: [LeaveTypes]
 *     parameters:
 *       - in: path
 *         name: LeaveTypeID
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Leave type deleted
 */
router.delete("/:LeaveTypeID", auth, adminOnly, deleteLeaveType);

module.exports = router;

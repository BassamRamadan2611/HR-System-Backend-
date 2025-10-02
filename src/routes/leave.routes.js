const express = require("express");
const router = express.Router();
const {
  getLeaves,
  getLeaveById,
  requestLeave,
  updateLeave,
  approveLeave,
  deleteLeave,
} = require("../controllers/leave.controller");
const { auth, managerOrAdmin ,adminOnly} = require("../middleware/auth");

/**
 * @swagger
 * tags:
 *   name: Leaves
 *   description: Manage employee leave requests
 */

/**
 * @swagger
 * /api/leaves:
 *   get:
 *     summary: Get all leave requests (filter by employee if query parameter provided)
 *     tags: [Leaves]
 *     parameters:
 *       - in: query
 *         name: employeeId
 *         schema:
 *           type: integer
 *         description: Filter leaves by employee ID
 *     responses:
 *       200:
 *         description: List of leaves
 */
router.get("/", auth, getLeaves);

/**
 * @swagger
 * /api/leaves/{LeaveID}:
 *   get:
 *     summary: Get a specific leave request
 *     tags: [Leaves]
 *     parameters:
 *       - in: path
 *         name: LeaveID
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Leave details
 */
router.get("/:LeaveID", auth, getLeaveById);

/**
 * @swagger
 * /api/leaves:
 *   post:
 *     summary: Request a leave
 *     tags: [Leaves]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [EmployeeID, LeaveTypeID, StartDate, EndDate]
 *             properties:
 *               EmployeeID:
 *                 type: integer
 *               LeaveTypeID:
 *                 type: integer
 *               StartDate:
 *                 type: string
 *                 format: date
 *               EndDate:
 *                 type: string
 *                 format: date
 *               Reason:
 *                 type: string
 *     responses:
 *       201:
 *         description: Leave requested
 */
router.post("/", auth, requestLeave);

/**
 * @swagger
 * /api/leaves/{LeaveID}:
 *   put:
 *     summary: Update a leave request (employees can edit their pending leaves)
 *     tags: [Leaves]
 *     parameters:
 *       - in: path
 *         name: LeaveID
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               LeaveTypeID:
 *                 type: integer
 *               StartDate:
 *                 type: string
 *                 format: date
 *               EndDate:
 *                 type: string
 *                 format: date
 *               Reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Leave updated
 */
router.put("/:LeaveID", auth, updateLeave);

/**
 * @swagger
 * /api/leaves/approve:
 *   post:
 *     summary: Approve or reject a leave request (Admin/Manager only)
 *     tags: [Leaves]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [LeaveID, ApprovedBy, Status]
 *             properties:
 *               LeaveID:
 *                 type: integer
 *               ApprovedBy:
 *                 type: integer
 *               Status:
 *                 type: string
 *                 enum: [Approved, Rejected]
 *     responses:
 *       200:
 *         description: Leave approved or rejected
 */
router.post("/approve", auth, managerOrAdmin, approveLeave);

/**
 * @swagger
 * /api/leaves/{LeaveID}:
 *   delete:
 *     summary: Delete/Cancel a leave request (employees can cancel their own pending leaves)
 *     tags: [Leaves]
 *     parameters:
 *       - in: path
 *         name: LeaveID
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Leave deleted/canceled
 */
router.delete("/:LeaveID", auth,adminOnly, deleteLeave); // REMOVED adminOnly middleware

module.exports = router;
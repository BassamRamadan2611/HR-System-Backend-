const express = require('express');
const router = express.Router();
const { auth, managerOrAdmin ,adminOnly} = require("../middleware/auth");


// Import the controller object directly
const attendanceRequestsController = require('../controllers/attendanceRequests.controller');


/**
 * @swagger
 * tags:
 *   name: Attendance Requests
 *   description: Employee attendance requests management (Work From Home, Early Departure, Late Arrival, etc.)
 */

/**
 * @swagger
 * /attendance-requests/types:
 *   get:
 *     summary: Get all attendance request types
 *     tags: [Attendance Requests]
 *     responses:
 *       200:
 *         description: List of attendance request types
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   RequestTypeID:
 *                     type: integer
 *                     example: 1
 *                   TypeName:
 *                     type: string
 *                     example: "Work From Home"
 *                   Description:
 *                     type: string
 *                     example: "Request to work from home for the day"
 *                   MaxHoursPerRequest:
 *                     type: integer
 *                     example: 8
 *                   RequiresApproval:
 *                     type: boolean
 *                     example: true
 *       500:
 *         description: Server error
 */
router.get('/types', attendanceRequestsController.getAttendanceRequestTypes);

/**
 * @swagger
 * /attendance-requests:
 *   post:
 *     summary: Submit a new attendance request
 *     tags: [Attendance Requests]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - EmployeeID
 *               - RequestTypeID
 *               - RequestDate
 *             properties:
 *               EmployeeID:
 *                 type: integer
 *                 example: 1
 *               RequestTypeID:
 *                 type: integer
 *                 example: 1
 *               RequestDate:
 *                 type: string
 *                 format: date
 *                 example: "2024-01-15"
 *               StartTime:
 *                 type: string
 *                 format: time
 *                 example: "14:00"
 *               EndTime:
 *                 type: string
 *                 format: time
 *                 example: "16:00"
 *               Reason:
 *                 type: string
 *                 example: "Doctor appointment"
 *     responses:
 *       201:
 *         description: Attendance request submitted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "✅ Attendance request submitted successfully"
 *       400:
 *         description: Bad request - missing or invalid fields
 *       500:
 *         description: Server error
 */
router.post('/', auth, attendanceRequestsController.submitAttendanceRequest);

/**
 * @swagger
 * /attendance-requests:
 *   get:
 *     summary: Get all attendance requests with optional filtering
 *     tags: [Attendance Requests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: employeeId
 *         schema:
 *           type: integer
 *         description: Filter by employee ID
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [Pending, Approved, Rejected]
 *         description: Filter by status
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by start date (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by end date (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: List of attendance requests
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   RequestID:
 *                     type: integer
 *                     example: 1
 *                   EmployeeID:
 *                     type: integer
 *                     example: 1
 *                   FirstName:
 *                     type: string
 *                     example: "John"
 *                   LastName:
 *                     type: string
 *                     example: "Doe"
 *                   TypeName:
 *                     type: string
 *                     example: "Work From Home"
 *                   RequestDate:
 *                     type: string
 *                     format: date
 *                     example: "2024-01-15"
 *                   StartTime:
 *                     type: string
 *                     format: time
 *                     example: "14:00"
 *                   EndTime:
 *                     type: string
 *                     format: time
 *                     example: "16:00"
 *                   TotalHours:
 *                     type: number
 *                     format: float
 *                     example: 2.0
 *                   Reason:
 *                     type: string
 *                     example: "Doctor appointment"
 *                   Status:
 *                     type: string
 *                     enum: [Pending, Approved, Rejected]
 *                     example: "Pending"
 *                   CreatedAt:
 *                     type: string
 *                     format: date-time
 *                     example: "2024-01-15T10:30:00.000Z"
 *       500:
 *         description: Server error
 */
router.get('/', auth, attendanceRequestsController.getAttendanceRequests);

/**
 * @swagger
 * /attendance-requests/{RequestID}:
 *   get:
 *     summary: Get attendance request by ID
 *     tags: [Attendance Requests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: RequestID
 *         required: true
 *         schema:
 *           type: integer
 *         description: Attendance request ID
 *     responses:
 *       200:
 *         description: Attendance request details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 RequestID:
 *                   type: integer
 *                   example: 1
 *                 EmployeeID:
 *                   type: integer
 *                   example: 1
 *                 FirstName:
 *                   type: string
 *                   example: "John"
 *                 LastName:
 *                   type: string
 *                   example: "Doe"
 *                 TypeName:
 *                   type: string
 *                   example: "Work From Home"
 *                 RequestDate:
 *                   type: string
 *                   format: date
 *                   example: "2024-01-15"
 *                 StartTime:
 *                   type: string
 *                   format: time
 *                   example: "14:00"
 *                 EndTime:
 *                   type: string
 *                   format: time
 *                   example: "16:00"
 *                 TotalHours:
 *                   type: number
 *                   format: float
 *                   example: 2.0
 *                 Reason:
 *                   type: string
 *                   example: "Doctor appointment"
 *                 Status:
 *                   type: string
 *                   example: "Pending"
 *       404:
 *         description: Request not found
 *       500:
 *         description: Server error
 */
router.get('/:RequestID', auth, attendanceRequestsController.getAttendanceRequestById);

/**
 * @swagger
 * /attendance-requests/{RequestID}:
 *   put:
 *     summary: Update an attendance request (only pending requests)
 *     tags: [Attendance Requests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: RequestID
 *         required: true
 *         schema:
 *           type: integer
 *         description: Attendance request ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - RequestTypeID
 *               - RequestDate
 *             properties:
 *               RequestTypeID:
 *                 type: integer
 *                 example: 2
 *               RequestDate:
 *                 type: string
 *                 format: date
 *                 example: "2024-01-16"
 *               StartTime:
 *                 type: string
 *                 format: time
 *                 example: "15:00"
 *               EndTime:
 *                 type: string
 *                 format: time
 *                 example: "17:00"
 *               Reason:
 *                 type: string
 *                 example: "Updated reason"
 *     responses:
 *       200:
 *         description: Attendance request updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "✅ Attendance request updated successfully"
 *       400:
 *         description: Bad request - only pending requests can be edited
 *       403:
 *         description: Forbidden - user can only edit their own requests
 *       404:
 *         description: Request not found
 *       500:
 *         description: Server error
 */
router.put('/:RequestID', auth, attendanceRequestsController.updateAttendanceRequest);

/**
 * @swagger
 * /attendance-requests/{RequestID}:
 *   delete:
 *     summary: Delete/Cancel an attendance request
 *     tags: [Attendance Requests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: RequestID
 *         required: true
 *         schema:
 *           type: integer
 *         description: Attendance request ID
 *     responses:
 *       200:
 *         description: Attendance request canceled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "✅ Attendance request canceled successfully"
 *       400:
 *         description: Bad request - only pending requests can be canceled
 *       403:
 *         description: Forbidden - user can only cancel their own requests
 *       404:
 *         description: Request not found
 *       500:
 *         description: Server error
 */
router.delete('/:RequestID', adminOnly,auth, attendanceRequestsController.deleteAttendanceRequest);

/**
 * @swagger
 * /attendance-requests/approve:
 *   post:
 *     summary: Approve or reject an attendance request
 *     tags: [Attendance Requests]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - RequestID
 *               - ApprovedBy
 *               - Status
 *             properties:
 *               RequestID:
 *                 type: integer
 *                 example: 1
 *               ApprovedBy:
 *                 type: integer
 *                 example: 2
 *               Status:
 *                 type: string
 *                 enum: [Approved, Rejected]
 *                 example: "Approved"
 *     responses:
 *       200:
 *         description: Attendance request approved/rejected successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "✅ Attendance request approved successfully"
 *       400:
 *         description: Bad request - invalid input
 *       500:
 *         description: Server error
 */
router.post('/approve', auth, managerOrAdmin,attendanceRequestsController.approveAttendanceRequest);

module.exports = router;
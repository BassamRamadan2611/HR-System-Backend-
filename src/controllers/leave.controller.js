const sql = require("mssql");

// Get all leaves (with employee filtering)
exports.getLeaves = async (req, res) => {
  try {
    const { employeeId } = req.query; // Allow filtering by employee ID
    let query = `
      SELECT l.LeaveID, l.EmployeeID, e.FirstName, e.LastName, l.LeaveTypeID, 
             lt.TypeName, lt.MaxDaysPerYear, l.StartDate, l.EndDate, l.Reason, 
             l.Status, l.ApprovedBy, 
             approver.FirstName as ApproverFirstName, approver.LastName as ApproverLastName
      FROM Leaves l
      JOIN Employees e ON l.EmployeeID = e.EmployeeID
      JOIN LeaveTypes lt ON l.LeaveTypeID = lt.LeaveTypeID
      LEFT JOIN Employees approver ON l.ApprovedBy = approver.EmployeeID
    `;

    if (employeeId) {
      query += ` WHERE l.EmployeeID = ${parseInt(employeeId)}`;
    }

    query += ` ORDER BY l.StartDate DESC`;

    const result = await sql.query(query);
    res.json(result.recordset);
  } catch (err) {
    console.error("Get leaves error:", err);
    res.status(500).json({ error: err.message });
  }
};

// Get leave by ID
exports.getLeaveById = async (req, res) => {
  const { LeaveID } = req.params;
  try {
    const result = await sql.query`
      SELECT l.LeaveID, l.EmployeeID, e.FirstName, e.LastName, l.LeaveTypeID, 
             lt.TypeName, lt.MaxDaysPerYear, l.StartDate, l.EndDate, l.Reason, 
             l.Status, l.ApprovedBy
      FROM Leaves l
      JOIN Employees e ON l.EmployeeID = e.EmployeeID
      JOIN LeaveTypes lt ON l.LeaveTypeID = lt.LeaveTypeID
      WHERE l.LeaveID = ${LeaveID}
    `;
    
    if (result.recordset.length === 0) {
      return res.status(404).json({ error: "Leave not found" });
    }
    
    res.json(result.recordset[0]);
  } catch (err) {
    console.error("Get leave error:", err);
    res.status(500).json({ error: err.message });
  }
};

// Update leave (for employees to edit their pending leaves)
exports.updateLeave = async (req, res) => {
  const { LeaveID } = req.params;
  const { LeaveTypeID, StartDate, EndDate, Reason } = req.body;
  const employeeId = req.user.employeeId || req.user.id; // From auth middleware

  try {
    if (!LeaveTypeID || !StartDate || !EndDate) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    console.log(`Employee ${employeeId} attempting to update leave ${LeaveID}`);

    // Check if leave exists and belongs to the employee
    const leaveCheck = await sql.query`
      SELECT EmployeeID, Status FROM Leaves WHERE LeaveID = ${LeaveID}
    `;
    
    if (leaveCheck.recordset.length === 0) {
      return res.status(404).json({ error: "Leave not found" });
    }

    const leave = leaveCheck.recordset[0];
    
    // Check if leave belongs to the employee
    if (leave.EmployeeID !== employeeId) {
      return res.status(403).json({ error: "Access denied. You can only edit your own leaves." });
    }

    // Check if leave is still pending (only pending leaves can be edited)
    if (leave.Status !== 'Pending') {
      return res.status(400).json({ error: "Only pending leaves can be edited" });
    }

    // Validate and normalize date formats
    let normalizedStartDate, normalizedEndDate;

    try {
      const startDateObj = new Date(StartDate);
      const endDateObj = new Date(EndDate);

      if (isNaN(startDateObj.getTime()) || isNaN(endDateObj.getTime())) {
        return res.status(400).json({ error: "Invalid date format. Please use YYYY-MM-DD format." });
      }

      normalizedStartDate = startDateObj.toISOString().split('T')[0];
      normalizedEndDate = endDateObj.toISOString().split('T')[0];

      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(normalizedStartDate) || !dateRegex.test(normalizedEndDate)) {
        return res.status(400).json({ error: "Dates must be in YYYY-MM-DD format." });
      }

      console.log('Normalized dates - Start:', normalizedStartDate, 'End:', normalizedEndDate);

      if (endDateObj < startDateObj) {
        return res.status(400).json({ error: "End date cannot be before start date" });
      }
    } catch (dateError) {
      console.error('Date parsing error:', dateError);
      return res.status(400).json({ error: "Invalid date format. Please use YYYY-MM-DD format." });
    }

    // Convert LeaveTypeID to integer
    const parsedLeaveTypeID = parseInt(LeaveTypeID, 10);
    if (isNaN(parsedLeaveTypeID)) {
      return res.status(400).json({ error: "Invalid LeaveTypeID. Must be a number." });
    }

    // Check leave type
    const typeCheck = await sql.query`
      SELECT MaxDaysPerYear FROM LeaveTypes WHERE LeaveTypeID = ${parsedLeaveTypeID}
    `;
    
    if (typeCheck.recordset.length === 0) {
      return res.status(400).json({ error: "Invalid leave type" });
    }

    // Calculate days requested
    const startDateObj = new Date(normalizedStartDate);
    const endDateObj = new Date(normalizedEndDate);
    const daysRequested = Math.ceil((endDateObj - startDateObj) / (1000 * 60 * 60 * 24)) + 1;
    const maxDays = typeCheck.recordset[0].MaxDaysPerYear || 30;

    if (daysRequested > maxDays) {
      return res.status(400).json({ error: `Requested ${daysRequested} days exceeds maximum ${maxDays} days` });
    }

    // Check for overlapping leaves (excluding current leave) - using parameterized query
    const overlapRequest = new sql.Request();
    overlapRequest.input('EmployeeID', sql.Int, employeeId);
    overlapRequest.input('StartDate', sql.Date, normalizedStartDate);
    overlapRequest.input('EndDate', sql.Date, normalizedEndDate);
    overlapRequest.input('LeaveID', sql.Int, LeaveID);

    const overlapResult = await overlapRequest.query(`
      SELECT 1 FROM Leaves 
      WHERE EmployeeID = @EmployeeID 
        AND Status = 'Approved'
        AND LeaveID != @LeaveID
        AND (
          (StartDate <= @EndDate AND EndDate >= @StartDate) OR
          (StartDate BETWEEN @StartDate AND @EndDate) OR
          (EndDate BETWEEN @StartDate AND @EndDate)
        )
    `);

    if (overlapResult.recordset.length > 0) {
      return res.status(400).json({ error: "Overlapping leave request exists" });
    }

    // Update leave using parameterized query
    const updateRequest = new sql.Request();
    updateRequest.input('LeaveTypeID', sql.Int, parsedLeaveTypeID);
    updateRequest.input('StartDate', sql.Date, normalizedStartDate);
    updateRequest.input('EndDate', sql.Date, normalizedEndDate);
    updateRequest.input('Reason', sql.NVarChar, Reason || '');
    updateRequest.input('LeaveID', sql.Int, LeaveID);

    await updateRequest.query(`
      UPDATE Leaves 
      SET LeaveTypeID = @LeaveTypeID, 
          StartDate = @StartDate, 
          EndDate = @EndDate, 
          Reason = @Reason
      WHERE LeaveID = @LeaveID
    `);

    res.json({ message: "✅ Leave updated successfully" });
  } catch (err) {
    console.error("Update leave error:", err);
    if (err.number === 241) {
      return res.status(400).json({ error: "Invalid date format or data type. Please ensure all fields are valid." });
    }
    res.status(500).json({ error: "Failed to update leave" });
  }
};

// Delete leave (cancel request) - Employees can cancel their own pending leaves
exports.deleteLeave = async (req, res) => {
  const { LeaveID } = req.params;
  const employeeId = req.user.employeeId || req.user.id; // From auth middleware

  try {
    console.log(`Employee ${employeeId} attempting to delete leave ${LeaveID}`);

    // Check if leave exists and belongs to the employee
    const leaveCheck = await sql.query`
      SELECT EmployeeID, Status FROM Leaves WHERE LeaveID = ${LeaveID}
    `;
    
    if (leaveCheck.recordset.length === 0) {
      return res.status(404).json({ error: "Leave not found" });
    }

    const leave = leaveCheck.recordset[0];
    
    // Check if leave belongs to the employee OR if user is admin
    const userRole = req.user.role;
    const isAdmin = userRole === 'admin';
    
    if (!isAdmin && leave.EmployeeID !== employeeId) {
      return res.status(403).json({ error: "Access denied. You can only cancel your own leaves." });
    }

    // Only allow deletion of pending leaves (unless admin)
    if (!isAdmin && leave.Status !== 'Pending') {
      return res.status(400).json({ error: "Only pending leaves can be canceled" });
    }

    await sql.query`DELETE FROM Leaves WHERE LeaveID = ${LeaveID}`;
    
    res.json({ message: "✅ Leave request canceled successfully" });
  } catch (err) {
    console.error("Delete leave error:", err);
    res.status(500).json({ error: err.message });
  }
};

// Existing requestLeave and approveLeave methods remain the same...
exports.requestLeave = async (req, res) => {
  const { EmployeeID, LeaveTypeID, StartDate, EndDate, Reason } = req.body;

  try {
    if (!EmployeeID || !LeaveTypeID || !StartDate || !EndDate) {
      return res.status(400).json({ error: "Missing required fields: EmployeeID, LeaveTypeID, StartDate, EndDate" });
    }

    console.log('Received leave request:', { EmployeeID, LeaveTypeID, StartDate, EndDate, Reason });

    // Validate and normalize date formats
    let normalizedStartDate, normalizedEndDate;

    try {
      const startDateObj = new Date(StartDate);
      const endDateObj = new Date(EndDate);

      if (isNaN(startDateObj.getTime()) || isNaN(endDateObj.getTime())) {
        return res.status(400).json({ error: "Invalid date format. Please use YYYY-MM-DD format." });
      }

      normalizedStartDate = startDateObj.toISOString().split('T')[0];
      normalizedEndDate = endDateObj.toISOString().split('T')[0];

      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(normalizedStartDate) || !dateRegex.test(normalizedEndDate)) {
        return res.status(400).json({ error: "Dates must be in YYYY-MM-DD format." });
      }

      console.log('Normalized dates - Start:', normalizedStartDate, 'End:', normalizedEndDate);

      if (endDateObj < startDateObj) {
        return res.status(400).json({ error: "End date cannot be before start date" });
      }
    } catch (dateError) {
      console.error('Date parsing error:', dateError);
      return res.status(400).json({ error: "Invalid date format. Please use YYYY-MM-DD format." });
    }

    // Convert LeaveTypeID to integer
    const parsedLeaveTypeID = parseInt(LeaveTypeID, 10);
    if (isNaN(parsedLeaveTypeID)) {
      return res.status(400).json({ error: "Invalid LeaveTypeID. Must be a number." });
    }

    // Validate foreign keys
    const empCheck = await sql.query`SELECT 1 FROM Employees WHERE EmployeeID = ${EmployeeID}`;
    const typeCheck = await sql.query`SELECT MaxDaysPerYear FROM LeaveTypes WHERE LeaveTypeID = ${parsedLeaveTypeID}`;

    if (empCheck.recordset.length === 0) {
      return res.status(400).json({ error: "Invalid EmployeeID" });
    }

    if (typeCheck.recordset.length === 0) {
      return res.status(400).json({ error: "Invalid LeaveTypeID" });
    }

    const startDateObj = new Date(normalizedStartDate);
    const endDateObj = new Date(normalizedEndDate);
    const daysRequested = Math.ceil((endDateObj - startDateObj) / (1000 * 60 * 60 * 24)) + 1;
    const maxDays = typeCheck.recordset[0].MaxDaysPerYear || 30;

    if (daysRequested > maxDays) {
      return res.status(400).json({ error: `Requested ${daysRequested} days exceeds maximum ${maxDays} days for this leave type` });
    }

    const overlapCheck = await sql.query`
      SELECT 1 FROM Leaves
      WHERE EmployeeID = ${EmployeeID} AND Status = 'Approved'
      AND (
        (StartDate <= ${normalizedEndDate} AND EndDate >= ${normalizedStartDate}) OR
        (StartDate BETWEEN ${normalizedStartDate} AND ${normalizedEndDate}) OR
        (EndDate BETWEEN ${normalizedStartDate} AND ${normalizedEndDate})
      )
    `;

    if (overlapCheck.recordset.length > 0) {
      return res.status(400).json({ error: "Overlapping leave request exists" });
    }

    // Use parameterized query for safety
    const request = new sql.Request();
    request.input('EmployeeID', sql.Int, EmployeeID);
    request.input('LeaveTypeID', sql.Int, parsedLeaveTypeID);
    request.input('StartDate', sql.Date, normalizedStartDate);
    request.input('EndDate', sql.Date, normalizedEndDate);
    request.input('Reason', sql.NVarChar, Reason || '');
    request.input('Status', sql.NVarChar, 'Pending');

    await request.query(`
      INSERT INTO Leaves (EmployeeID, LeaveTypeID, StartDate, EndDate, Reason, Status)
      VALUES (@EmployeeID, @LeaveTypeID, @StartDate, @EndDate, @Reason, @Status)
    `);

    res.status(201).json({ message: "✅ Leave request submitted successfully" });
  } catch (err) {
    console.error("Request leave error:", err);
    if (err.number === 241) {
      return res.status(400).json({ error: "Invalid date format or data type. Please ensure all fields are valid." });
    }
    res.status(500).json({ error: "Failed to submit leave request: " + err.message });
  }
};
exports.approveLeave = async (req, res) => {
  const { LeaveID, ApprovedBy, Status } = req.body;
  try {
    if (!LeaveID || !ApprovedBy || !Status) {
      return res.status(400).json({ error: "LeaveID, ApprovedBy, and Status required" });
    }
    
    if (!['Approved', 'Rejected'].includes(Status)) {
      return res.status(400).json({ error: "Status must be 'Approved' or 'Rejected'" });
    }

    // Validate approver exists and get their EmployeeID
    const empCheck = await sql.query`
      SELECT e.EmployeeID 
      FROM Employees e
      JOIN users u ON e.EmployeeID = u.EmployeeID 
      WHERE u.UserID = ${ApprovedBy}
    `;
    
    if (empCheck.recordset.length === 0) {
      return res.status(400).json({ error: "Invalid ApprovedBy ID or user not linked to employee" });
    }

    const approverEmployeeId = empCheck.recordset[0].EmployeeID;

    // Validate leave exists and is pending
    const leaveCheck = await sql.query`
      SELECT 1 FROM Leaves WHERE LeaveID = ${LeaveID} AND Status = 'Pending'
    `;
    
    if (leaveCheck.recordset.length === 0) {
      return res.status(400).json({ error: "Invalid or non-pending LeaveID" });
    }

    // Update leave status using the EmployeeID
    await sql.query`
      UPDATE Leaves
      SET Status = ${Status}, ApprovedBy = ${approverEmployeeId}
      WHERE LeaveID = ${LeaveID}
    `;

    res.json({ message: `✅ Leave ${Status.toLowerCase()} successfully` });
  } catch (err) {
    console.error("Approve leave error:", err);
    res.status(500).json({ error: err.message });
  }
};
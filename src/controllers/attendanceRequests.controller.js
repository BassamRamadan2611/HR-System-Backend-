const sql = require("mssql");

// Get all attendance request types
exports.getAttendanceRequestTypes = async (req, res) => {
  try {
    const result = await sql.query`
      SELECT * FROM AttendanceRequestTypes 
      WHERE IsActive = 1 
      ORDER BY TypeName
    `;
    res.json(result.recordset);
  } catch (err) {
    console.error("Get request types error:", err);
    res.status(500).json({ error: err.message });
  }
};

// Submit attendance request
exports.submitAttendanceRequest = async (req, res) => {
  const { EmployeeID, RequestTypeID, RequestDate, StartTime, EndTime, Reason } = req.body;

  try {
    if (!EmployeeID || !RequestTypeID || !RequestDate) {
      return res.status(400).json({ error: "Missing required fields: EmployeeID, RequestTypeID, RequestDate" });
    }

    console.log('Received attendance request:', { EmployeeID, RequestTypeID, RequestDate, StartTime, EndTime, Reason });

    // Validate and normalize date
    let normalizedRequestDate;
    try {
      const requestDateObj = new Date(RequestDate);
      if (isNaN(requestDateObj.getTime())) {
        return res.status(400).json({ error: "Invalid date format. Please use YYYY-MM-DD format." });
      }
      normalizedRequestDate = requestDateObj.toISOString().split('T')[0];
    } catch (dateError) {
      console.error('Date parsing error:', dateError);
      return res.status(400).json({ error: "Invalid date format. Please use YYYY-MM-DD format." });
    }

    // Validate request type
    const typeCheck = await sql.query`
      SELECT TypeName, MaxHoursPerRequest, RequiresApproval 
      FROM AttendanceRequestTypes 
      WHERE RequestTypeID = ${RequestTypeID} AND IsActive = 1
    `;
    
    if (typeCheck.recordset.length === 0) {
      return res.status(400).json({ error: "Invalid request type" });
    }

    const requestType = typeCheck.recordset[0];

    // Calculate total hours if times are provided
    let totalHours = null;
    if (StartTime && EndTime) {
      // Validate time format
      const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(StartTime) || !timeRegex.test(EndTime)) {
        return res.status(400).json({ error: "Invalid time format. Please use HH:MM format." });
      }

      const startTimeObj = new Date(`1970-01-01T${StartTime}`);
      const endTimeObj = new Date(`1970-01-01T${EndTime}`);
      
      if (endTimeObj <= startTimeObj) {
        return res.status(400).json({ error: "End time must be after start time" });
      }
      
      totalHours = (endTimeObj - startTimeObj) / (1000 * 60 * 60);
      
      if (requestType.MaxHoursPerRequest && totalHours > requestType.MaxHoursPerRequest) {
        return res.status(400).json({ 
          error: `Requested ${totalHours} hours exceeds maximum ${requestType.MaxHoursPerRequest} hours for ${requestType.TypeName}` 
        });
      }
    }

    // Check for existing requests on the same date
    const existingRequest = await sql.query`
      SELECT 1 FROM AttendanceRequests 
      WHERE EmployeeID = ${EmployeeID} 
        AND RequestDate = ${normalizedRequestDate}
        AND Status = 'Pending'
    `;

    if (existingRequest.recordset.length > 0) {
      return res.status(400).json({ error: "You already have a pending request for this date" });
    }

    // Check for overlapping leave on the same date
    const overlappingLeave = await sql.query`
      SELECT 1 FROM Leaves 
      WHERE EmployeeID = ${EmployeeID} 
        AND Status = 'Approved'
        AND ${normalizedRequestDate} BETWEEN StartDate AND EndDate
    `;

    if (overlappingLeave.recordset.length > 0) {
      return res.status(400).json({ error: "You have approved leave on this date" });
    }

    // Insert the request with proper time handling
    const request = new sql.Request();
    
    // Convert empty strings to null for time fields
    const processedStartTime = StartTime && StartTime.trim() !== '' ? StartTime : null;
    const processedEndTime = EndTime && EndTime.trim() !== '' ? EndTime : null;
    
    console.log('Processed times - Start:', processedStartTime, 'End:', processedEndTime);

    // Use different approach for time parameters
    if (processedStartTime && processedEndTime) {
      // If times are provided, use them
      await request.input('EmployeeID', sql.Int, EmployeeID)
                   .input('RequestTypeID', sql.Int, RequestTypeID)
                   .input('RequestDate', sql.Date, normalizedRequestDate)
                   .input('StartTime', sql.NVarChar, processedStartTime) // Use string instead of Time type
                   .input('EndTime', sql.NVarChar, processedEndTime)     // Use string instead of Time type
                   .input('TotalHours', sql.Decimal(5,2), totalHours)
                   .input('Reason', sql.NVarChar, Reason || '')
                   .input('Status', sql.NVarChar, 'Pending')
                   .query(`
                     INSERT INTO AttendanceRequests (EmployeeID, RequestTypeID, RequestDate, StartTime, EndTime, TotalHours, Reason, Status)
                     VALUES (@EmployeeID, @RequestTypeID, @RequestDate, @StartTime, @EndTime, @TotalHours, @Reason, @Status)
                   `);
    } else {
      // If no times provided, insert without time values
      await request.input('EmployeeID', sql.Int, EmployeeID)
                   .input('RequestTypeID', sql.Int, RequestTypeID)
                   .input('RequestDate', sql.Date, normalizedRequestDate)
                   .input('TotalHours', sql.Decimal(5,2), totalHours)
                   .input('Reason', sql.NVarChar, Reason || '')
                   .input('Status', sql.NVarChar, 'Pending')
                   .query(`
                     INSERT INTO AttendanceRequests (EmployeeID, RequestTypeID, RequestDate, TotalHours, Reason, Status)
                     VALUES (@EmployeeID, @RequestTypeID, @RequestDate, @TotalHours, @Reason, @Status)
                   `);
    }

    res.status(201).json({ message: "✅ Attendance request submitted successfully" });
  } catch (err) {
    console.error("Submit attendance request error:", err);
    
    // More specific error handling
    if (err.message.includes('Invalid time') || err.code === 'EPARAM') {
      return res.status(400).json({ error: "Invalid time format. Please use HH:MM format (e.g., 09:00, 14:30)." });
    }
    
    res.status(500).json({ error: "Failed to submit attendance request: " + err.message });
  }
};

// Get all attendance requests
exports.getAttendanceRequests = async (req, res) => {
  try {
    const { employeeId, status, startDate, endDate } = req.query;
    
    let query = `
      SELECT ar.RequestID, ar.EmployeeID, e.FirstName, e.LastName, 
             ar.RequestTypeID, art.TypeName, art.Description as RequestTypeDescription,
             ar.RequestDate, ar.StartTime, ar.EndTime, ar.TotalHours, ar.Reason,
             ar.Status, ar.ApprovedBy, ar.CreatedAt,
             approver.FirstName as ApproverFirstName, approver.LastName as ApproverLastName
      FROM AttendanceRequests ar
      JOIN Employees e ON ar.EmployeeID = e.EmployeeID
      JOIN AttendanceRequestTypes art ON ar.RequestTypeID = art.RequestTypeID
      LEFT JOIN Employees approver ON ar.ApprovedBy = approver.EmployeeID
      WHERE 1=1
    `;

    if (employeeId) {
      query += ` AND ar.EmployeeID = ${parseInt(employeeId)}`;
    }
    
    if (status) {
      query += ` AND ar.Status = '${status}'`;
    }
    
    if (startDate) {
      query += ` AND ar.RequestDate >= '${startDate}'`;
    }
    
    if (endDate) {
      query += ` AND ar.RequestDate <= '${endDate}'`;
    }

    query += ` ORDER BY ar.RequestDate DESC, ar.CreatedAt DESC`;

    const result = await sql.query(query);
    res.json(result.recordset);
  } catch (err) {
    console.error("Get attendance requests error:", err);
    res.status(500).json({ error: err.message });
  }
};

// Get attendance request by ID
exports.getAttendanceRequestById = async (req, res) => {
  const { RequestID } = req.params;
  try {
    const result = await sql.query`
      SELECT ar.RequestID, ar.EmployeeID, e.FirstName, e.LastName, 
             ar.RequestTypeID, art.TypeName, art.Description as RequestTypeDescription,
             ar.RequestDate, ar.StartTime, ar.EndTime, ar.TotalHours, ar.Reason,
             ar.Status, ar.ApprovedBy, ar.CreatedAt,
             approver.FirstName as ApproverFirstName, approver.LastName as ApproverLastName
      FROM AttendanceRequests ar
      JOIN Employees e ON ar.EmployeeID = e.EmployeeID
      JOIN AttendanceRequestTypes art ON ar.RequestTypeID = art.RequestTypeID
      LEFT JOIN Employees approver ON ar.ApprovedBy = approver.EmployeeID
      WHERE ar.RequestID = ${RequestID}
    `;
    
    if (result.recordset.length === 0) {
      return res.status(404).json({ error: "Attendance request not found" });
    }
    
    res.json(result.recordset[0]);
  } catch (err) {
    console.error("Get attendance request error:", err);
    res.status(500).json({ error: err.message });
  }
};

// Approve/Reject attendance request
exports.approveAttendanceRequest = async (req, res) => {
  const { RequestID, ApprovedBy, Status } = req.body;
  try {
    if (!RequestID || !ApprovedBy || !Status) {
      return res.status(400).json({ error: "RequestID, ApprovedBy, and Status required" });
    }
    
    if (!['Approved', 'Rejected'].includes(Status)) {
      return res.status(400).json({ error: "Status must be 'Approved' or 'Rejected'" });
    }

    // Validate approver exists and get EmployeeID
    const empCheck = await sql.query`
      SELECT e.EmployeeID 
      FROM Employees e
      JOIN users u ON e.EmployeeID = u.EmployeeID 
      WHERE u.UserID = ${ApprovedBy}
    `;
    
    if (empCheck.recordset.length === 0) {
      return res.status(400).json({ error: "Invalid ApprovedBy ID" });
    }

    const approverEmployeeId = empCheck.recordset[0].EmployeeID;

    // Validate request exists and is pending
    const requestCheck = await sql.query`
      SELECT 1 FROM AttendanceRequests 
      WHERE RequestID = ${RequestID} AND Status = 'Pending'
    `;
    
    if (requestCheck.recordset.length === 0) {
      return res.status(400).json({ error: "Invalid or non-pending request" });
    }

    // Update request status
    await sql.query`
      UPDATE AttendanceRequests
      SET Status = ${Status}, ApprovedBy = ${approverEmployeeId}
      WHERE RequestID = ${RequestID}
    `;

    res.json({ message: `✅ Attendance request ${Status.toLowerCase()} successfully` });
  } catch (err) {
    console.error("Approve attendance request error:", err);
    res.status(500).json({ error: err.message });
  }
};

// Update attendance request
exports.updateAttendanceRequest = async (req, res) => {
  const { RequestID } = req.params;
  const { RequestTypeID, RequestDate, StartTime, EndTime, Reason } = req.body;
  const employeeId = req.user.employeeId || req.user.id;

  try {
    if (!RequestTypeID || !RequestDate) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Check if request exists and belongs to the employee
    const requestCheck = await sql.query`
      SELECT EmployeeID, Status FROM AttendanceRequests WHERE RequestID = ${RequestID}
    `;
    
    if (requestCheck.recordset.length === 0) {
      return res.status(404).json({ error: "Request not found" });
    }

    const request = requestCheck.recordset[0];
    
    if (request.EmployeeID !== employeeId) {
      return res.status(403).json({ error: "Access denied. You can only edit your own requests." });
    }

    if (request.Status !== 'Pending') {
      return res.status(400).json({ error: "Only pending requests can be edited" });
    }

    // Validate and normalize date
    let normalizedRequestDate;
    try {
      const requestDateObj = new Date(RequestDate);
      if (isNaN(requestDateObj.getTime())) {
        return res.status(400).json({ error: "Invalid date format" });
      }
      normalizedRequestDate = requestDateObj.toISOString().split('T')[0];
    } catch (dateError) {
      return res.status(400).json({ error: "Invalid date format" });
    }

    // Update request with proper time handling
    const updateRequest = new sql.Request();
    
    // Convert empty strings to null for time fields
    const processedStartTime = StartTime && StartTime.trim() !== '' ? StartTime : null;
    const processedEndTime = EndTime && EndTime.trim() !== '' ? EndTime : null;
    
    if (processedStartTime && processedEndTime) {
      await updateRequest.input('RequestTypeID', sql.Int, RequestTypeID)
                        .input('RequestDate', sql.Date, normalizedRequestDate)
                        .input('StartTime', sql.NVarChar, processedStartTime)
                        .input('EndTime', sql.NVarChar, processedEndTime)
                        .input('Reason', sql.NVarChar, Reason || '')
                        .input('RequestID', sql.Int, RequestID)
                        .query(`
                          UPDATE AttendanceRequests 
                          SET RequestTypeID = @RequestTypeID, 
                              RequestDate = @RequestDate, 
                              StartTime = @StartTime, 
                              EndTime = @EndTime, 
                              Reason = @Reason
                          WHERE RequestID = @RequestID
                        `);
    } else {
      await updateRequest.input('RequestTypeID', sql.Int, RequestTypeID)
                        .input('RequestDate', sql.Date, normalizedRequestDate)
                        .input('Reason', sql.NVarChar, Reason || '')
                        .input('RequestID', sql.Int, RequestID)
                        .query(`
                          UPDATE AttendanceRequests 
                          SET RequestTypeID = @RequestTypeID, 
                              RequestDate = @RequestDate, 
                              StartTime = NULL, 
                              EndTime = NULL, 
                              Reason = @Reason
                          WHERE RequestID = @RequestID
                        `);
    }

    res.json({ message: "✅ Attendance request updated successfully" });
  } catch (err) {
    console.error("Update attendance request error:", err);
    res.status(500).json({ error: "Failed to update request" });
  }
};

// Delete/cancel attendance request
exports.deleteAttendanceRequest = async (req, res) => {
  const { RequestID } = req.params;
  const employeeId = req.user.employeeId || req.user.id;

  try {
    // Check if request exists and belongs to the employee
    const requestCheck = await sql.query`
      SELECT EmployeeID, Status FROM AttendanceRequests WHERE RequestID = ${RequestID}
    `;
    
    if (requestCheck.recordset.length === 0) {
      return res.status(404).json({ error: "Request not found" });
    }

    const request = requestCheck.recordset[0];
    
    // Check if user is admin or request belongs to employee
    const userRole = req.user.role;
    const isAdmin = userRole === 'admin';
    
    if (!isAdmin && request.EmployeeID !== employeeId) {
      return res.status(403).json({ error: "Access denied. You can only cancel your own requests." });
    }

    // Only allow deletion of pending requests (unless admin)
    if (!isAdmin && request.Status !== 'Pending') {
      return res.status(400).json({ error: "Only pending requests can be canceled" });
    }

    await sql.query`DELETE FROM AttendanceRequests WHERE RequestID = ${RequestID}`;
    
    res.json({ message: "✅ Attendance request canceled successfully" });
  } catch (err) {
    console.error("Delete attendance request error:", err);
    res.status(500).json({ error: err.message });
  }
};
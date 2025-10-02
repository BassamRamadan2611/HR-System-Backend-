const sql = require("mssql");

// Get all attendance records
exports.getAttendance = async (req, res) => {
  try {
    const result = await sql.query`
      SELECT a.AttendanceID, a.EmployeeID, e.FirstName, e.LastName,
             a.Date, a.CheckInTime, a.CheckOutTime, a.Status
      FROM Attendance a
      JOIN Employees e ON a.EmployeeID = e.EmployeeID
      ORDER BY a.Date DESC
    `;
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get attendance by ID
exports.getAttendanceById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await sql.query`
      SELECT a.AttendanceID, a.EmployeeID, e.FirstName, e.LastName,
             a.Date, a.CheckInTime, a.CheckOutTime, a.Status
      FROM Attendance a
      JOIN Employees e ON a.EmployeeID = e.EmployeeID
      WHERE a.AttendanceID = ${id}
    `;
    if (result.recordset.length === 0) {
      return res.status(404).json({ error: "Attendance record not found" });
    }
    res.json(result.recordset[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Check-in (create record)
exports.checkIn = async (req, res) => {
  const { EmployeeID } = req.body;
  try {
    if (!EmployeeID) return res.status(400).json({ error: "EmployeeID required" });

    const empCheck = await sql.query`SELECT 1 FROM Employees WHERE EmployeeID = ${EmployeeID}`;
    if (empCheck.recordset.length === 0) {
      return res.status(400).json({ error: "Invalid EmployeeID" });
    }

    await sql.query`
      INSERT INTO Attendance (EmployeeID, Date, CheckInTime, Status)
      VALUES (${EmployeeID}, CAST(GETDATE() AS DATE), CAST(GETDATE() AS TIME), 'Present')
    `;
    res.status(201).json({ message: "✅ Employee checked in" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Check-out (update record)
exports.checkOut = async (req, res) => {
  const { AttendanceID } = req.body;
  try {
    if (!AttendanceID) return res.status(400).json({ error: "AttendanceID required" });

    const attCheck = await sql.query`
      SELECT 1 FROM Attendance WHERE AttendanceID = ${AttendanceID} AND CheckOutTime IS NULL
    `;
    if (attCheck.recordset.length === 0) {
      return res.status(400).json({ error: "Invalid or already checked-out AttendanceID" });
    }

    await sql.query`
      UPDATE Attendance
      SET CheckOutTime = CAST(GETDATE() AS TIME)
      WHERE AttendanceID = ${AttendanceID}
    `;
    res.json({ message: "✅ Employee checked out" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update status (Admin only)
exports.updateAttendance = async (req, res) => {
  const { id } = req.params;
  const { Status } = req.body;
  try {
    const check = await sql.query`SELECT 1 FROM Attendance WHERE AttendanceID = ${id}`;
    if (check.recordset.length === 0) {
      return res.status(404).json({ error: "Attendance record not found" });
    }

    await sql.query`
      UPDATE Attendance
      SET Status = ${Status}
      WHERE AttendanceID = ${id}
    `;
    res.json({ message: "✅ Attendance updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete attendance record
exports.deleteAttendance = async (req, res) => {
  const { id } = req.params;
  try {
    const check = await sql.query`SELECT 1 FROM Attendance WHERE AttendanceID = ${id}`;
    if (check.recordset.length === 0) {
      return res.status(404).json({ error: "Attendance record not found" });
    }

    await sql.query`DELETE FROM Attendance WHERE AttendanceID = ${id}`;
    res.json({ message: "🗑️ Attendance record deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

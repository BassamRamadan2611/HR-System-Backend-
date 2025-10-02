const sql = require("mssql");

// ✅ Get all leave types
exports.getLeaveTypes = async (req, res) => {
  try {
    const result = await sql.query`SELECT * FROM LeaveTypes ORDER BY TypeName`;
    res.json(result.recordset);
  } catch (err) {
    console.error("Get leave types error:", err);
    res.status(500).json({ error: err.message });
  }
};

// ✅ Add a new leave type
exports.addLeaveType = async (req, res) => {
  const { TypeName, MaxDaysPerYear } = req.body;
  try {
    if (!TypeName || !MaxDaysPerYear) {
      return res.status(400).json({ error: "TypeName and MaxDaysPerYear required" });
    }

    // Check if type name already exists
    const existingCheck = await sql.query`SELECT LeaveTypeID FROM LeaveTypes WHERE TypeName = '${TypeName}'`;
    if (existingCheck.recordset.length > 0) {
      return res.status(400).json({ error: "Leave type name already exists" });
    }

    // Insert using direct values
    await sql.query`
      INSERT INTO LeaveTypes (TypeName, MaxDaysPerYear)
      VALUES ('${TypeName}', ${MaxDaysPerYear})
    `;

    res.status(201).json({ message: "✅ Leave type added successfully" });
  } catch (err) {
    console.error("Add leave type error:", err);
    res.status(500).json({ error: err.message });
  }
};

// ✅ Update an existing leave type
exports.updateLeaveType = async (req, res) => {
  const { LeaveTypeID } = req.params;
  const { TypeName, MaxDaysPerYear } = req.body;
  try {
    if (!TypeName || !MaxDaysPerYear) {
      return res.status(400).json({ error: "TypeName and MaxDaysPerYear required" });
    }

    // Check if leave type exists
    const typeCheck = await sql.query`SELECT LeaveTypeID FROM LeaveTypes WHERE LeaveTypeID = ${LeaveTypeID}`;
    if (typeCheck.recordset.length === 0) {
      return res.status(404).json({ error: "Leave type not found" });
    }

    // Check if type name already exists (excluding current)
    const nameCheck = await sql.query`
      SELECT LeaveTypeID FROM LeaveTypes WHERE TypeName = '${TypeName}' AND LeaveTypeID != ${LeaveTypeID}
    `;
    if (nameCheck.recordset.length > 0) {
      return res.status(400).json({ error: "Leave type name already exists" });
    }

    // Update using direct values
    const result = await sql.query`
      UPDATE LeaveTypes
      SET TypeName = '${TypeName}', MaxDaysPerYear = ${MaxDaysPerYear}
      WHERE LeaveTypeID = ${LeaveTypeID}
    `;

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ error: "Leave type not found" });
    }

    res.json({ message: "✅ Leave type updated successfully" });
  } catch (err) {
    console.error("Update leave type error:", err);
    res.status(500).json({ error: err.message });
  }
};

// ✅ Delete a leave type
exports.deleteLeaveType = async (req, res) => {
  const { LeaveTypeID } = req.params;
  try {
    // Check if leave type exists
    const typeCheck = await sql.query`SELECT LeaveTypeID FROM LeaveTypes WHERE LeaveTypeID = ${LeaveTypeID}`;
    if (typeCheck.recordset.length === 0) {
      return res.status(404).json({ error: "Leave type not found" });
    }

    // Check if leave type is being used
    const usageCheck = await sql.query`SELECT LeaveID FROM Leaves WHERE LeaveTypeID = ${LeaveTypeID}`;
    if (usageCheck.recordset.length > 0) {
      return res.status(400).json({ error: "Cannot delete leave type that is being used" });
    }

    const result = await sql.query`DELETE FROM LeaveTypes WHERE LeaveTypeID = ${LeaveTypeID}`;

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ error: "Leave type not found" });
    }

    res.json({ message: "✅ Leave type deleted successfully" });
  } catch (err) {
    console.error("Delete leave type error:", err);
    res.status(500).json({ error: err.message });
  }
};
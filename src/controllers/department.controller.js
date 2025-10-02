const sql = require("mssql");

// Get all departments
exports.getDepartments = async (req, res) => {
  try {
    const result = await sql.query`SELECT DepartmentID, DepartmentName, ManagerID FROM Departments`;
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get department by ID
exports.getDepartmentById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await sql.query`SELECT * FROM Departments WHERE DepartmentID = ${id}`;
    if (result.recordset.length === 0) {
      return res.status(404).json({ error: "Department not found" });
    }
    res.json(result.recordset[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Add new department
exports.addDepartment = async (req, res) => {
  const { DepartmentName, ManagerID } = req.body;
  try {
    if (!DepartmentName) return res.status(400).json({ error: "DepartmentName required" });

    if (ManagerID) {
      const mgrCheck = await sql.query`SELECT 1 FROM Employees WHERE EmployeeID = ${ManagerID}`;
      if (mgrCheck.recordset.length === 0) {
        return res.status(400).json({ error: "Invalid ManagerID" });
      }
    }

    await sql.query`
      INSERT INTO Departments (DepartmentName, ManagerID)
      VALUES (${DepartmentName}, ${ManagerID})
    `;
    res.status(201).json({ message: "✅ Department added successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update department
exports.updateDepartment = async (req, res) => {
  const { id } = req.params;
  const { DepartmentName, ManagerID } = req.body;
  try {
    const deptCheck = await sql.query`SELECT 1 FROM Departments WHERE DepartmentID = ${id}`;
    if (deptCheck.recordset.length === 0) {
      return res.status(404).json({ error: "Department not found" });
    }

    await sql.query`
      UPDATE Departments
      SET DepartmentName = ${DepartmentName}, ManagerID = ${ManagerID}
      WHERE DepartmentID = ${id}
    `;
    res.json({ message: "✅ Department updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete department
exports.deleteDepartment = async (req, res) => {
  const { id } = req.params;
  try {
    const deptCheck = await sql.query`SELECT 1 FROM Departments WHERE DepartmentID = ${id}`;
    if (deptCheck.recordset.length === 0) {
      return res.status(404).json({ error: "Department not found" });
    }

    await sql.query`DELETE FROM Departments WHERE DepartmentID = ${id}`;
    res.json({ message: "🗑️ Department deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

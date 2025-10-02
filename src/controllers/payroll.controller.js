const sql = require("mssql");

exports.getPayrolls = async (req, res) => {
  try {
    const result = await sql.query`
      SELECT p.PayrollID, p.EmployeeID, e.FirstName, e.LastName, p.Month, p.Year, p.BasicSalary, p.Deductions, p.Allowances, p.NetSalary, p.GeneratedDate
      FROM Payroll p
      JOIN Employees e ON p.EmployeeID = e.EmployeeID
      ORDER BY p.Year DESC, p.Month DESC
    `;
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.generatePayroll = async (req, res) => {
  const { EmployeeID, Month, Year, BasicSalary, Deductions, Allowances } = req.body;
  try {
    if (!EmployeeID || !Month || !Year || BasicSalary == null || Deductions == null || Allowances == null) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    const empCheck = await sql.query`SELECT 1 FROM Employees WHERE EmployeeID = @EmployeeID`({ EmployeeID });
    if (empCheck.recordset.length === 0) {
      return res.status(400).json({ error: "Invalid EmployeeID" });
    }
    if (Month < 1 || Month > 12) {
      return res.status(400).json({ error: "Invalid Month" });
    }
    if (Year < 2000 || Year > new Date().getFullYear()) {
      return res.status(400).json({ error: "Invalid Year" });
    }
    const existingPayroll = await sql.query`
      SELECT 1 FROM Payroll WHERE EmployeeID = @EmployeeID AND Month = @Month AND Year = @Year
    `({ EmployeeID, Month, Year });
    if (existingPayroll.recordset.length > 0) {
      return res.status(400).json({ error: "Payroll already exists for this employee and period" });
    }
    const NetSalary = parseFloat(BasicSalary) + parseFloat(Allowances) - parseFloat(Deductions);
    await sql.query`
      INSERT INTO Payroll (EmployeeID, Month, Year, BasicSalary, Deductions, Allowances, NetSalary, GeneratedDate)
      VALUES (@EmployeeID, @Month, @Year, @BasicSalary, @Deductions, @Allowances, @NetSalary, GETDATE())
    `({ EmployeeID, Month, Year, BasicSalary, Deductions, Allowances, NetSalary });
    res.status(201).json({ message: "✅ Payroll generated", NetSalary });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deletePayroll = async (req, res) => {
  const { PayrollID } = req.params;
  try {
    const result = await sql.query`DELETE FROM Payroll WHERE PayrollID = @PayrollID`({ PayrollID });
    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ error: "Payroll not found" });
    }
    res.json({ message: "✅ Payroll deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
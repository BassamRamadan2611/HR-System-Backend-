const sql = require("mssql");

exports.getReviews = async (req, res) => {
  try {
    const result = await sql.query`
      SELECT r.ReviewID, r.EmployeeID, e.FirstName AS EmployeeFirstName, e.LastName AS EmployeeLastName,
             r.ReviewerID, er.FirstName AS ReviewerFirstName, er.LastName AS ReviewerLastName,
             r.ReviewDate, r.Score, r.Comments
      FROM PerformanceReviews r
      JOIN Employees e ON r.EmployeeID = e.EmployeeID
      JOIN Employees er ON r.ReviewerID = er.EmployeeID
      ORDER BY r.ReviewDate DESC
    `;
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.addReview = async (req, res) => {
  const { EmployeeID, ReviewerID, ReviewDate, Score, Comments } = req.body;
  try {
    if (!EmployeeID || !ReviewerID || !ReviewDate || !Score) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    if (Score < 1 || Score > 5) {
      return res.status(400).json({ error: "Score must be between 1 and 5" });
    }
    const empCheck = await sql.query`SELECT 1 FROM Employees WHERE EmployeeID = @EmployeeID`({ EmployeeID });
    const revCheck = await sql.query`SELECT 1 FROM Employees WHERE EmployeeID = @ReviewerID`({ ReviewerID });
    if (empCheck.recordset.length === 0 || revCheck.recordset.length === 0) {
      return res.status(400).json({ error: "Invalid EmployeeID or ReviewerID" });
    }
    if (EmployeeID === ReviewerID) {
      return res.status(400).json({ error: "Employee cannot review themselves" });
    }
    await sql.query`
      INSERT INTO PerformanceReviews (EmployeeID, ReviewerID, ReviewDate, Score, Comments)
      VALUES (@EmployeeID, @ReviewerID, @ReviewDate, @Score, @Comments)
    `({ EmployeeID, ReviewerID, ReviewDate, Score, Comments });
    res.status(201).json({ message: "✅ Review added" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteReview = async (req, res) => {
  const { ReviewID } = req.params;
  try {
    const result = await sql.query`DELETE FROM PerformanceReviews WHERE ReviewID = @ReviewID`({ ReviewID });
    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ error: "Review not found" });
    }
    res.json({ message: "✅ Review deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
const sql = require("mssql");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

// ========================
// Register new user (Admin only)
// ========================
exports.register = async (req, res) => {
  const { Username, Password, Role, EmployeeID } = req.body;

  try {
    if (!Username || !Password || !EmployeeID) {
      return res.status(400).json({ error: "Username, Password, and EmployeeID are required" });
    }

    // Check if username already exists
    const userCheck = await sql.query`
      SELECT UserID FROM Users WHERE Username = ${Username}
    `;
    if (userCheck.recordset.length > 0) {
      return res.status(400).json({ error: "Username already exists" });
    }

    // Check if employee exists and not already registered
    const empCheck = await sql.query`
      SELECT EmployeeID, FirstName, LastName, Email FROM Employees WHERE EmployeeID = ${EmployeeID}
    `;
    if (empCheck.recordset.length === 0) {
      return res.status(400).json({ error: "Invalid EmployeeID" });
    }

    // Check if employee already has a user account
    const existingUser = await sql.query`
      SELECT UserID FROM Users WHERE EmployeeID = ${EmployeeID}
    `;
    if (existingUser.recordset.length > 0) {
      return res.status(400).json({ error: "Employee already has a user account" });
    }

    // Validate role
    const validRoles = ['admin', 'manager', 'employee', 'user'];
    const userRole = Role || 'employee';
    if (!validRoles.includes(userRole.toLowerCase())) {
      return res.status(400).json({ error: "Invalid role. Must be: admin, manager, employee, or user" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(Password, salt);

    // Insert into Users
    const result = await sql.query`
      INSERT INTO Users (EmployeeID, Username, PasswordHash, Role)
      OUTPUT INSERTED.UserID
      VALUES (${EmployeeID}, ${Username}, ${hashedPassword}, ${userRole})
    `;

    const newUserId = result.recordset[0].UserID;

    res.status(201).json({ 
      message: "✅ User registered successfully",
      userId: newUserId,
      username: Username,
      role: userRole
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ error: "Failed to register user" });
  }
};

// ========================
// Login user
// ========================
exports.login = async (req, res) => {
  const { Username, Password } = req.body;

  try {
    if (!Username || !Password) {
      return res.status(400).json({ error: "Username and Password are required" });
    }

    // Fetch user by Username with employee details
    const result = await sql.query`
      SELECT 
        u.UserID, 
        u.Username, 
        u.PasswordHash, 
        u.Role,
        u.EmployeeID,
        e.FirstName,
        e.LastName,
        e.Email,
        e.JobTitle,
        e.DepartmentID,
        d.DepartmentName
      FROM Users u
      LEFT JOIN Employees e ON u.EmployeeID = e.EmployeeID
      LEFT JOIN Departments d ON e.DepartmentID = d.DepartmentID
      WHERE u.Username = ${Username}
    `;

    if (result.recordset.length === 0) {
      return res.status(400).json({ error: "Invalid username or password" });
    }

    const user = result.recordset[0];

    // Compare password
    const validPass = await bcrypt.compare(Password, user.PasswordHash);
    if (!validPass) {
      return res.status(400).json({ error: "Invalid username or password" });
    }

    // Generate JWT
    const token = jwt.sign(
      { 
        id: user.UserID, 
        employeeId: user.EmployeeID,
        role: user.Role,
        username: user.Username 
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ 
      message: "✅ Login successful", 
      token, 
      user: {
        userId: user.UserID,
        employeeId: user.EmployeeID,
        username: user.Username,
        role: user.Role,
        firstName: user.FirstName,
        lastName: user.LastName,
        email: user.Email,
        jobTitle: user.JobTitle,
        departmentId: user.DepartmentID,
        departmentName: user.DepartmentName
      }
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Failed to login" });
  }
};

// ========================
// Get user profile
// ========================
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await sql.query`
      SELECT 
        u.UserID,
        u.Username,
        u.Role,
        u.EmployeeID,
        e.FirstName,
        e.LastName,
        e.Email,
        e.Phone,
        e.DateOfBirth,
        e.HireDate,
        e.JobTitle,
        e.DepartmentID,
        e.ManagerID,
        e.Salary,
        e.Status,
        d.DepartmentName,
        m.FirstName as ManagerFirstName,
        m.LastName as ManagerLastName
      FROM Users u
      LEFT JOIN Employees e ON u.EmployeeID = e.EmployeeID
      LEFT JOIN Departments d ON e.DepartmentID = d.DepartmentID
      LEFT JOIN Employees m ON e.ManagerID = m.EmployeeID
      WHERE u.UserID = ${userId}
    `;

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: "User profile not found" });
    }

    const profile = result.recordset[0];

    // Remove sensitive information
    delete profile.PasswordHash;

    res.json({ profile });
  } catch (err) {
    console.error("Get profile error:", err);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
};

// ========================
// Update user profile
// ========================
exports.updateProfile = async (req, res) => {
  const { 
    FirstName, 
    LastName, 
    Email, 
    Phone, 
    DateOfBirth 
  } = req.body;

  try {
    const userId = req.user.id;

    // Get employee ID from user
    const userResult = await sql.query`
      SELECT EmployeeID FROM Users WHERE UserID = ${userId}
    `;

    if (userResult.recordset.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const employeeId = userResult.recordset[0].EmployeeID;

    // Check if email already exists (excluding current employee)
    if (Email) {
      const emailCheck = await sql.query`
        SELECT EmployeeID FROM Employees WHERE Email = ${Email} AND EmployeeID != ${employeeId}
      `;
      
      if (emailCheck.recordset.length > 0) {
        return res.status(400).json({ error: "Email already exists" });
      }
    }

    // Build dynamic update query
    let updateFields = [];
    let params = [];

    if (FirstName) {
      updateFields.push(`FirstName = @FirstName`);
      params.push({ name: 'FirstName', value: FirstName });
    }
    if (LastName) {
      updateFields.push(`LastName = @LastName`);
      params.push({ name: 'LastName', value: LastName });
    }
    if (Email) {
      updateFields.push(`Email = @Email`);
      params.push({ name: 'Email', value: Email });
    }
    if (Phone !== undefined) {
      updateFields.push(`Phone = @Phone`);
      params.push({ name: 'Phone', value: Phone });
    }
    if (DateOfBirth) {
      updateFields.push(`DateOfBirth = @DateOfBirth`);
      params.push({ name: 'DateOfBirth', value: DateOfBirth });
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: "No fields to update" });
    }

    // Create parameterized query
    const request = new sql.Request();
    params.forEach(param => {
      request.input(param.name, param.value);
    });
    
    const query = `
      UPDATE Employees 
      SET ${updateFields.join(', ')} 
      WHERE EmployeeID = @EmployeeID
    `;
    
    request.input('EmployeeID', employeeId);
    await request.query(query);

    res.json({ message: "✅ Profile updated successfully" });
  } catch (err) {
    console.error("Update profile error:", err);
    res.status(500).json({ error: "Failed to update profile" });
  }
};

// ========================
// Change password
// ========================
exports.changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  try {
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: "Current password and new password are required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: "New password must be at least 6 characters long" });
    }

    const userId = req.user.id;

    // Get current password hash
    const result = await sql.query`
      SELECT PasswordHash FROM Users WHERE UserID = ${userId}
    `;

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const currentHashedPassword = result.recordset[0].PasswordHash;

    // Verify current password
    const validCurrentPass = await bcrypt.compare(currentPassword, currentHashedPassword);
    if (!validCurrentPass) {
      return res.status(400).json({ error: "Current password is incorrect" });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const newHashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    await sql.query`
      UPDATE Users 
      SET PasswordHash = ${newHashedPassword} 
      WHERE UserID = ${userId}
    `;

    res.json({ message: "✅ Password changed successfully" });
  } catch (err) {
    console.error("Change password error:", err);
    res.status(500).json({ error: "Failed to change password" });
  }
};

// ========================
// Get all users (Admin only)
// ========================
exports.getAllUsers = async (req, res) => {
  try {
    const result = await sql.query`
      SELECT 
        u.UserID,
        u.Username,
        u.Role,
        u.EmployeeID,
        e.FirstName,
        e.LastName,
        e.Email,
        e.JobTitle,
        d.DepartmentName
      FROM Users u
      LEFT JOIN Employees e ON u.EmployeeID = e.EmployeeID
      LEFT JOIN Departments d ON e.DepartmentID = d.DepartmentID
      ORDER BY u.UserID
    `;

    res.json({ users: result.recordset });
  } catch (err) {
    console.error("Get all users error:", err);
    res.status(500).json({ error: "Failed to fetch users" });
  }
};

// ========================
// Delete user (Admin only)
// ========================
exports.deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    if (!id || isNaN(id)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    // Check if user exists
    const userCheck = await sql.query`
      SELECT UserID FROM Users WHERE UserID = ${parseInt(id)}
    `;
    
    if (userCheck.recordset.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    // Prevent self-deletion
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({ error: "Cannot delete your own account" });
    }

    // Delete user
    await sql.query`
      DELETE FROM Users WHERE UserID = ${parseInt(id)}
    `;

    res.json({ message: "✅ User deleted successfully" });
  } catch (err) {
    console.error("Delete user error:", err);
    res.status(500).json({ error: "Failed to delete user" });
  }
};
// ========================
// Update user (Admin only) - UPDATED
// ========================
exports.updateUser = async (req, res) => {
  const { id } = req.params;
  const { Username, Role } = req.body;

  try {
    if (!id || isNaN(id)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    const userId = parseInt(id);

    // Check if user exists
    const userCheck = await sql.query`
      SELECT UserID, Username FROM Users WHERE UserID = ${userId}
    `;
    
    if (userCheck.recordset.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const existingUser = userCheck.recordset[0];

    // Validate role if provided
    if (Role) {
      const validRoles = ['admin', 'manager', 'employee', 'user'];
      if (!validRoles.includes(Role.toLowerCase())) {
        return res.status(400).json({ error: "Invalid role. Must be: admin, manager, employee, or user" });
      }
    }

    // Check if username already exists (if changing username)
    if (Username && Username !== existingUser.Username) {
      const usernameCheck = await sql.query`
        SELECT UserID FROM Users WHERE Username = ${Username} AND UserID != ${userId}
      `;
      
      if (usernameCheck.recordset.length > 0) {
        return res.status(400).json({ error: "Username already exists" });
      }
    }

    // Build dynamic update query
    let updateFields = [];
    let queryParams = '';

    if (Username) {
      updateFields.push(`Username = '${Username.replace(/'/g, "''")}'`);
    }
    if (Role) {
      updateFields.push(`Role = '${Role}'`);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: "No fields to update" });
    }

    // Build the update query
    const updateQuery = `
      UPDATE Users 
      SET ${updateFields.join(', ')} 
      WHERE UserID = ${userId}
    `;

    await sql.query(updateQuery);

    // Get updated user data
    const updatedUser = await sql.query`
      SELECT 
        u.UserID,
        u.Username,
        u.Role,
        u.EmployeeID,
        e.FirstName,
        e.LastName,
        e.Email,
        e.JobTitle,
        d.DepartmentName
      FROM Users u
      LEFT JOIN Employees e ON u.EmployeeID = e.EmployeeID
      LEFT JOIN Departments d ON e.DepartmentID = d.DepartmentID
      WHERE u.UserID = ${userId}
    `;

    res.json({ 
      message: "✅ User updated successfully",
      user: updatedUser.recordset[0]
    });
  } catch (err) {
    console.error("Update user error:", err);
    res.status(500).json({ error: "Failed to update user" });
  }
};

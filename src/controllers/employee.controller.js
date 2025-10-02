const sql = require("mssql");

// =====================
// Get all employees
// =====================
exports.getEmployees = async (req, res) => {
  try {
    const result = await sql.query`
      SELECT 
        EmployeeID, 
        FirstName, 
        LastName, 
        Email, 
        JobTitle, 
        Salary, 
        HireDate, 
        DepartmentID,
        ManagerID, 
        DateOfBirth, 
        Status,
        Phone
      FROM Employees
      ORDER BY EmployeeID
    `;
    res.json(result.recordset);
  } catch (err) {
    console.error("Get employees error:", err);
    res.status(500).json({ error: "Failed to fetch employees" });
  }
};

// =====================
// Get employee by ID
// =====================
exports.getEmployeeById = async (req, res) => {
  const { id } = req.params;
  
  // Validate ID
  if (!id || isNaN(id)) {
    return res.status(400).json({ error: "Invalid employee ID" });
  }

  try {
    const result = await sql.query`
      SELECT 
        EmployeeID, 
        FirstName, 
        LastName, 
        Email, 
        JobTitle, 
        Salary, 
        HireDate, 
        DepartmentID, 
        ManagerID, 
        DateOfBirth, 
        Status,
        Phone
      FROM Employees 
      WHERE EmployeeID = ${parseInt(id)}
    `;
    
    if (result.recordset.length === 0) {
      return res.status(404).json({ error: "Employee not found" });
    }
    
    res.json(result.recordset[0]);
  } catch (err) {
    console.error("Get employee error:", err);
    res.status(500).json({ error: "Failed to fetch employee" });
  }
};

// =====================
// Get employees by department (with optional manager filter)
// =====================
exports.getEmployeesByDepartment = async (req, res) => {
  const { departmentId } = req.params;
  const { managerId } = req.query; // Optional manager filter

  if (!departmentId || isNaN(departmentId)) {
    return res.status(400).json({ error: "Invalid department ID" });
  }

  try {
    // Verify department exists
    const deptCheck = await sql.query`
      SELECT DepartmentID, DepartmentName FROM Departments WHERE DepartmentID = ${parseInt(departmentId)}
    `;
    
    if (deptCheck.recordset.length === 0) {
      return res.status(404).json({ error: "Department not found" });
    }

    let sqlQuery = `
      SELECT 
        e.EmployeeID, 
        e.FirstName, 
        e.LastName, 
        e.Email, 
        e.JobTitle, 
        e.Salary, 
        e.HireDate, 
        e.Status,
        e.Phone,
        e.DateOfBirth,
        m.FirstName as ManagerFirstName,
        m.LastName as ManagerLastName,
        m.EmployeeID as ManagerID
      FROM Employees e
      LEFT JOIN Employees m ON e.ManagerID = m.EmployeeID
      WHERE e.DepartmentID = ${parseInt(departmentId)}
    `;

    // Add manager filter if provided
    if (managerId && !isNaN(managerId)) {
      sqlQuery += ` AND e.ManagerID = ${parseInt(managerId)}`;
    }

    sqlQuery += ` ORDER BY e.FirstName, e.LastName`;

    const result = await sql.query(sqlQuery);

    const department = deptCheck.recordset[0];
    
    const response = {
      department: {
        id: department.DepartmentID,
        name: department.DepartmentName
      },
      employees: result.recordset,
      count: result.recordset.length
    };

    // Add manager info if filtered by manager
    if (managerId && !isNaN(managerId)) {
      const managerResult = await sql.query`
        SELECT EmployeeID, FirstName, LastName, JobTitle 
        FROM Employees 
        WHERE EmployeeID = ${parseInt(managerId)}
      `;
      
      if (managerResult.recordset.length > 0) {
        const manager = managerResult.recordset[0];
        response.manager = {
          id: manager.EmployeeID,
          name: `${manager.FirstName} ${manager.LastName}`,
          jobTitle: manager.JobTitle
        };
      }
    }

    res.json(response);
  } catch (err) {
    console.error("Get employees by department error:", err);
    res.status(500).json({ error: "Failed to fetch employees" });
  }
};

// =====================
// Get employees by department and manager
// =====================
exports.getEmployeesByDepartmentAndManager = async (req, res) => {
  const { departmentId, managerId } = req.params;

  // Validate department ID
  if (!departmentId || isNaN(departmentId)) {
    return res.status(400).json({ error: "Invalid department ID" });
  }

  // Validate manager ID
  if (!managerId || isNaN(managerId)) {
    return res.status(400).json({ error: "Invalid manager ID" });
  }

  try {
    // Verify department exists
    const deptCheck = await sql.query`
      SELECT DepartmentID, DepartmentName FROM Departments WHERE DepartmentID = ${parseInt(departmentId)}
    `;
    
    if (deptCheck.recordset.length === 0) {
      return res.status(404).json({ error: "Department not found" });
    }

    // Verify manager exists and belongs to the specified department
    const managerCheck = await sql.query`
      SELECT EmployeeID, FirstName, LastName, JobTitle 
      FROM Employees 
      WHERE EmployeeID = ${parseInt(managerId)} 
        AND DepartmentID = ${parseInt(departmentId)}
    `;
    
    if (managerCheck.recordset.length === 0) {
      return res.status(404).json({ 
        error: "Manager not found or does not belong to the specified department" 
      });
    }

    // Get employees in the department who report to the specified manager
    const result = await sql.query`
      SELECT 
        e.EmployeeID, 
        e.FirstName, 
        e.LastName, 
        e.Email, 
        e.JobTitle, 
        e.Salary, 
        e.HireDate, 
        e.Status,
        e.Phone,
        e.DateOfBirth,
        m.FirstName as ManagerFirstName,
        m.LastName as ManagerLastName,
        d.DepartmentName
      FROM Employees e
      LEFT JOIN Employees m ON e.ManagerID = m.EmployeeID
      INNER JOIN Departments d ON e.DepartmentID = d.DepartmentID
      WHERE e.DepartmentID = ${parseInt(departmentId)}
        AND e.ManagerID = ${parseInt(managerId)}
      ORDER BY e.FirstName, e.LastName
    `;

    // Get manager info for the response
    const managerInfo = managerCheck.recordset[0];

    res.json({
      manager: {
        id: managerInfo.EmployeeID,
        name: `${managerInfo.FirstName} ${managerInfo.LastName}`,
        jobTitle: managerInfo.JobTitle
      },
      employees: result.recordset,
      count: result.recordset.length
    });
  } catch (err) {
    console.error("Get employees by department and manager error:", err);
    res.status(500).json({ error: "Failed to fetch employees" });
  }
};

// =====================
// Get managers in department (helper function)
// =====================
exports.getManagersInDepartment = async (req, res) => {
  const { departmentId } = req.params;

  if (!departmentId || isNaN(departmentId)) {
    return res.status(400).json({ error: "Invalid department ID" });
  }

  try {
    // Verify department exists
    const deptCheck = await sql.query`
      SELECT DepartmentID, DepartmentName FROM Departments WHERE DepartmentID = ${parseInt(departmentId)}
    `;
    
    if (deptCheck.recordset.length === 0) {
      return res.status(404).json({ error: "Department not found" });
    }

    // Get all managers in the department (employees who manage others)
    const result = await sql.query`
      SELECT DISTINCT
        m.EmployeeID,
        m.FirstName,
        m.LastName,
        m.JobTitle,
        m.Email,
        COUNT(e.EmployeeID) as TeamSize
      FROM Employees m
      LEFT JOIN Employees e ON m.EmployeeID = e.ManagerID
      WHERE m.DepartmentID = ${parseInt(departmentId)}
        AND EXISTS (
          SELECT 1 FROM Employees 
          WHERE ManagerID = m.EmployeeID
        )
      GROUP BY m.EmployeeID, m.FirstName, m.LastName, m.JobTitle, m.Email
      ORDER BY m.FirstName, m.LastName
    `;

    const department = deptCheck.recordset[0];

    res.json({
      department: {
        id: department.DepartmentID,
        name: department.DepartmentName
      },
      managers: result.recordset
    });
  } catch (err) {
    console.error("Get managers in department error:", err);
    res.status(500).json({ error: "Failed to fetch managers" });
  }
};

// =====================
// Add new employee
// =====================
exports.addEmployee = async (req, res) => {
  const { 
    FirstName, 
    LastName, 
    Email, 
    JobTitle, 
    Salary, 
    DepartmentID, 
    ManagerID, 
    DateOfBirth,
    Phone 
  } = req.body;

  try {
    // Validate required fields
    if (!FirstName || !LastName || !Email || !JobTitle || !Salary || !DepartmentID) {
      return res.status(400).json({ error: "Missing required fields: FirstName, LastName, Email, JobTitle, Salary, DepartmentID" });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(Email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    // Validate salary is positive number
    if (isNaN(Salary) || Salary <= 0) {
      return res.status(400).json({ error: "Salary must be a positive number" });
    }

    // Validate DepartmentID exists
    const deptCheck = await sql.query`
      SELECT DepartmentID FROM Departments WHERE DepartmentID = ${parseInt(DepartmentID)}
    `;
    
    if (deptCheck.recordset.length === 0) {
      return res.status(400).json({ error: "Invalid DepartmentID - department does not exist" });
    }

    // Validate ManagerID if provided
    if (ManagerID) {
      const managerCheck = await sql.query`
        SELECT EmployeeID FROM Employees WHERE EmployeeID = ${parseInt(ManagerID)}
      `;
      
      if (managerCheck.recordset.length === 0) {
        return res.status(400).json({ error: "Invalid ManagerID - manager does not exist" });
      }
    }

    // Check if email already exists
    const emailCheck = await sql.query`
      SELECT EmployeeID FROM Employees WHERE Email = ${Email}
    `;
    
    if (emailCheck.recordset.length > 0) {
      return res.status(400).json({ error: "Email already exists" });
    }

    // Validate DateOfBirth if provided
    if (DateOfBirth) {
      const birthDate = new Date(DateOfBirth);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      
      if (age < 18) {
        return res.status(400).json({ error: "Employee must be at least 18 years old" });
      }
      
      if (birthDate > today) {
        return res.status(400).json({ error: "Date of birth cannot be in the future" });
      }
    }

    // Insert new employee
    const result = await sql.query`
      INSERT INTO Employees (
        FirstName, 
        LastName, 
        Email, 
        JobTitle, 
        Salary, 
        Phone,
        HireDate, 
        DepartmentID, 
        ManagerID, 
        DateOfBirth, 
        Status
      )
      OUTPUT INSERTED.EmployeeID
      VALUES (
        ${FirstName}, 
        ${LastName}, 
        ${Email}, 
        ${JobTitle}, 
        ${parseFloat(Salary)},
        ${Phone || null}, 
        GETDATE(), 
        ${parseInt(DepartmentID)}, 
        ${ManagerID ? parseInt(ManagerID) : null}, 
        ${DateOfBirth || null}, 
        'Active'
      )
    `;

    const newEmployeeId = result.recordset[0].EmployeeID;

    res.status(201).json({ 
      message: "✅ Employee added successfully",
      employeeId: newEmployeeId
    });
  } catch (err) {
    console.error("Add employee error:", err);
    
    if (err.number === 2627) { // SQL Server unique constraint violation
      return res.status(400).json({ error: "Email already exists" });
    }
    
    res.status(500).json({ error: "Failed to add employee" });
  }
};

// =====================
// Update employee
// =====================
exports.updateEmployee = async (req, res) => {
  const { id } = req.params;
  const { 
    FirstName, 
    LastName, 
    Email, 
    JobTitle, 
    Salary, 
    DepartmentID, 
    ManagerID, 
    DateOfBirth, 
    Status,
    Phone 
  } = req.body;

  // Validate ID
  if (!id || isNaN(id)) {
    return res.status(400).json({ error: "Invalid employee ID" });
  }

  try {
    // Check if employee exists
    const employeeCheck = await sql.query`
      SELECT EmployeeID FROM Employees WHERE EmployeeID = ${parseInt(id)}
    `;
    
    if (employeeCheck.recordset.length === 0) {
      return res.status(404).json({ error: "Employee not found" });
    }

    // Validate required fields
    if (!FirstName || !LastName || !Email || !JobTitle || !Salary || !DepartmentID || !Status) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(Email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    // Validate salary is positive number
    if (isNaN(Salary) || Salary <= 0) {
      return res.status(400).json({ error: "Salary must be a positive number" });
    }

    // Validate DepartmentID exists
    const deptCheck = await sql.query`
      SELECT DepartmentID FROM Departments WHERE DepartmentID = ${parseInt(DepartmentID)}
    `;
    
    if (deptCheck.recordset.length === 0) {
      return res.status(400).json({ error: "Invalid DepartmentID - department does not exist" });
    }

    // Validate ManagerID if provided (and not self-reference)
    if (ManagerID) {
      if (parseInt(ManagerID) === parseInt(id)) {
        return res.status(400).json({ error: "Employee cannot be their own manager" });
      }
      
      const managerCheck = await sql.query`
        SELECT EmployeeID FROM Employees WHERE EmployeeID = ${parseInt(ManagerID)}
      `;
      
      if (managerCheck.recordset.length === 0) {
        return res.status(400).json({ error: "Invalid ManagerID - manager does not exist" });
      }
    }

    // Check if email already exists (excluding current employee)
    const emailCheck = await sql.query`
      SELECT EmployeeID FROM Employees WHERE Email = ${Email} AND EmployeeID != ${parseInt(id)}
    `;
    
    if (emailCheck.recordset.length > 0) {
      return res.status(400).json({ error: "Email already exists" });
    }

    // Validate DateOfBirth if provided
    if (DateOfBirth) {
      const birthDate = new Date(DateOfBirth);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      
      if (age < 18) {
        return res.status(400).json({ error: "Employee must be at least 18 years old" });
      }
      
      if (birthDate > today) {
        return res.status(400).json({ error: "Date of birth cannot be in the future" });
      }
    }

    // Validate Status
    const validStatuses = ['Active', 'Inactive', 'On Leave'];
    if (!validStatuses.includes(Status)) {
      return res.status(400).json({ error: "Invalid status. Must be: Active, Inactive, or On Leave" });
    }

    // Update employee
    await sql.query`
      UPDATE Employees
      SET 
        FirstName = ${FirstName},
        LastName = ${LastName},
        Email = ${Email},
        JobTitle = ${JobTitle},
        Salary = ${parseFloat(Salary)},
        DepartmentID = ${parseInt(DepartmentID)},
        ManagerID = ${ManagerID ? parseInt(ManagerID) : null},
        DateOfBirth = ${DateOfBirth || null},
        Status = ${Status},
        Phone = ${Phone || null}
      WHERE EmployeeID = ${parseInt(id)}
    `;

    res.json({ 
      message: "✅ Employee updated successfully",
      employeeId: parseInt(id)
    });
  } catch (err) {
    console.error("Update employee error:", err);
    
    if (err.number === 2627) { // SQL Server unique constraint violation
      return res.status(400).json({ error: "Email already exists" });
    }
    
    res.status(500).json({ error: "Failed to update employee" });
  }
};

// =====================
// Delete employee
// =====================
exports.deleteEmployee = async (req, res) => {
  const { id } = req.params;

  // Validate ID
  if (!id || isNaN(id)) {
    return res.status(400).json({ error: "Invalid employee ID" });
  }

  try {
    // Check if employee exists
    const employeeCheck = await sql.query`
      SELECT EmployeeID FROM Employees WHERE EmployeeID = ${parseInt(id)}
    `;
    
    if (employeeCheck.recordset.length === 0) {
      return res.status(404).json({ error: "Employee not found" });
    }

    // Check if employee is a manager of other employees
    const managerCheck = await sql.query`
      SELECT COUNT(*) as employeeCount FROM Employees WHERE ManagerID = ${parseInt(id)}
    `;
    
    if (managerCheck.recordset[0].employeeCount > 0) {
      return res.status(400).json({ 
        error: "Cannot delete employee who is a manager of other employees. Please reassign their reports first." 
      });
    }

    // Delete employee
    await sql.query`
      DELETE FROM Employees WHERE EmployeeID = ${parseInt(id)}
    `;

    res.json({ 
      message: "✅ Employee deleted successfully",
      employeeId: parseInt(id)
    });
  } catch (err) {
    console.error("Delete employee error:", err);
    
    // Handle foreign key constraint violations
    if (err.number === 547) {
      return res.status(400).json({ 
        error: "Cannot delete employee due to existing related records. Please remove related records first." 
      });
    }
    
    res.status(500).json({ error: "Failed to delete employee" });
  }
};
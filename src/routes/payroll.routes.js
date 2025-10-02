const express = require("express");
const router = express.Router();
const { getPayrolls, generatePayroll, deletePayroll } = require("../controllers/payroll.controller");
const { auth, adminOnly } = require("../middleware/auth");

router.get("/", auth, getPayrolls);
router.post("/", auth, adminOnly, generatePayroll);
router.delete("/:PayrollID", auth, adminOnly, deletePayroll);

module.exports = router;
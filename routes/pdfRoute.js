// routes/pdfRoute.js
const express = require("express");
const router = express.Router();
const { handlePdf } = require("../controllers/pdfController");

// POST /pdf
router.post("/", handlePdf);

module.exports = router;

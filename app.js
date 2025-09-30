const express = require("express");
const path = require("path");
const pdfRouter = require("./routes/pdfRoute");

const app = express();

// 미들웨어
app.use(express.static("public"));
app.use(express.json());

// 기본 페이지
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public/html/pdf.html"));
});

// /pdf 라우트 등록
app.use("/pdf", pdfRouter);

module.exports = app;


const { convertNotionToPdf } = require("../services/pdfService");

exports.handlePdf = async (req, res) => {
    let { notionUrl } = req.body;

    if (!notionUrl) {
        return res.status(400).json({ error: "URL이 비어 있습니다." });
    }

    if (typeof notionUrl !== "string") {
        return res.status(400).json({ error: "URL 형식이 잘못되었습니다." });
    }

    // JS 내장 URL 객체로 검증
    try {
        new URL(notionUrl);
    } catch {
        notionUrl = "https://" + notionUrl;
    }

    //Notion URL 여부 확인 (예시)
    if (!notionUrl.includes("notion.site") && !notionUrl.includes("notion.so")) {
        return res.status(400).json({ error: "Notion URL만 지원합니다." });
    }

    console.log("받은 URL:", notionUrl);

    try {
        const { buffer, fileName } = await convertNotionToPdf(notionUrl);

        // PDF 직접 응답
        res.setHeader("Content-Disposition", `attachment; filename="${fileName}.pdf"`);
        res.setHeader("Content-Type", "application/pdf");
        res.end(buffer);

    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

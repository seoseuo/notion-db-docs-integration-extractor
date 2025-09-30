const puppeteer = require("puppeteer");
const PDFMerger = require("pdf-merger-js").default;

exports.convertNotionToPdf = async (notionUrl) => {

    // 1. 쿼리 파라미터 제거
    const cleanUrl = notionUrl.split("?")[0];

    // 2. puppeteer 실행
    const browser = await puppeteer.launch({
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });


    try {
        const page = await browser.newPage();

        // 3. 페이지 접속
        await page.goto(notionUrl, {waitUntil: "networkidle2", timeout: 120000}); // 2분

        // 4. DOM에서 data-block-id 추출
        const blockIds = await page.evaluate(() => {
            const ids = [];
            document.querySelectorAll("[data-index]").forEach((row) => {
                // data-index 안에 있는 data-block-id div 선택
                const block = row.querySelector("[data-block-id]");
                if (block) {
                    const rawId = block.getAttribute("data-block-id");
                    if (rawId) {
                        ids.push(rawId.replace(/-/g, "")); // 하이픈 제거
                    }
                }
            });
            return ids;
        });


        // 5. block-id로 페이지 URL 목록 만들기
        const pageUrls = blockIds.map((id) => `${cleanUrl}&p=${id}`);

        if (pageUrls.length === 0) {
            throw new Error("데이터베이스에서 block-id를 찾을 수 없습니다.");
        }

        console.log("추출된 페이지 URL:", pageUrls);

        //제목 기반 파일명 추출
        const fileName = await page.evaluate(() => {
            const titleEl = document.querySelector("h1");
            return titleEl ? titleEl.innerText.trim() : "notion_export";
        });

        console.log("파일 이름 :",fileName);

        // 6. 각 페이지 PDF 버퍼로 추출
        // TODO : 상세 설정 또한 지정할 수 있도록 수정 예정
        const merger = new PDFMerger();

        for (let i = 0; i < pageUrls.length; i++) {
            const childPage = await browser.newPage();
            await childPage.goto(pageUrls[i], { waitUntil: "networkidle2", timeout: 60000 });

            const pdfBuffer = await childPage.pdf({
                format: "A4",
                printBackground: true,
            });

            await merger.add(pdfBuffer); // 버퍼 추가
            await childPage.close();
        }

        // 병합된 최종 PDF를 버퍼로 생성
        const mergedBuffer = await merger.saveAsBuffer();

        await browser.close();

        console.log(fileName,".pdf Merge 완료 -");

        const sizeKB = (mergedBuffer.length / 1024).toFixed(2);
        const sizeMB = (mergedBuffer.length / (1024 * 1024)).toFixed(2);

        console.log(`파일 크기: ${sizeKB} KB (${sizeMB} MB)`);

        return {
            success: true,
            count: pageUrls.length,
            fileName: fileName.replace(/[\\/:*?"<>|]/g, "_"), // 안전한 파일명
            buffer: mergedBuffer,
        };

    }catch (err) {
        await browser.close();
        throw new Error(err.message);
    }
};
const puppeteer = require("puppeteer");
const PDFMerger = require("pdf-merger-js").default;
const html2pdf = require("html2pdf-node");

exports.convertNotionToPdf = async (notionUrl) => {

    // 1. 쿼리 파라미터 제거
    const cleanUrl = notionUrl.split("?")[0];

    // 2. puppeteer 실행
    const browser = await puppeteer.launch({
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();

    try {

        // 3. 페이지 접속
        await page.goto(notionUrl, { waitUntil: "networkidle0", timeout: 50000 });

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
            throw new Error("데이터베이스에서 block-id를 찾을 수 없습니다.<br>데이터베이스 페이지 열기 후 링크를 입력하셨나요?");
        }
        console.log("추출된 페이지 URL:", pageUrls);


        // TODO

        const merger = new PDFMerger();
        // 5. 각 페이지 HTML 추출 및 pdf 변환 후 버퍼에 저장
        for (let i = 0; i < pageUrls.length; i++) {
            console.log(pageUrls.length + "개 중 " + (i + 1) + "번째 페이지 HTML 추출 중...");

            // const childPage = await browser.newPage();
            // await childPage.goto(pageUrls[i], { waitUntil: "networkidle0", timeout: 60000 });
            // const childHtml = await childPage.content();
            // await childPage.close();

            // 6. childPage html2pdf 변환
            console.log(pageUrls.length + "개 중 " + (i + 1) + "번째 페이지 PDF 변환 중...");

            // URL 직접 입력
            const file = { url: pageUrls[i]};
            const options = {
                format: "A4",
                printBackground: true,
                margin: "0",
                scale: 0.7
            };
            const pdfBuffer  = await html2pdf.generatePdfOfHtml(file, options);
            console.log(typeof pdfBuffer);

            await merger.add(pdfBuffer);
        }

        await browser.close();

        // 7. pdf 병합
        // 병합된 최종 PDF를 버퍼로 생성
        console.log("최종 PDF 병합 중 . . .");
        const mergedBuffer = await merger.saveAsBuffer();

        console.log("pdf Merge 완료 -");

        const sizeKB = (mergedBuffer.length / 1024).toFixed(2);
        const sizeMB = (mergedBuffer.length / (1024 * 1024)).toFixed(2);

        console.log(`파일 크기: ${sizeKB} KB (${sizeMB} MB)`);

        return {
            success: true,
            count: pageUrls.length, // 합친 문서 개수
            fileName: 'export',
            buffer: mergedBuffer, // 최종 병합된 PDF 버퍼
        };
    } catch (err) {
        await browser.close();
        throw new Error(err.message);
    }
};
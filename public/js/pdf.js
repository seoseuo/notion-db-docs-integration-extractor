document.getElementById('convertBtn').addEventListener('click', async () => {
    const url = document.getElementById('formGroupExampleInput2').value.trim();
    const warning = document.getElementById('warningAlert');
    const start = document.getElementById('startAlert');
    //const downloadBtn = document.getElementById('downloadBtn');

    // 초기화
    warning.classList.add("d-none");
    warning.innerHTML = "";
    //downloadBtn.classList.add("d-none");

    // 진행 중 표시
    start.classList.remove("d-none");
    start.innerHTML = "진행 중 입니다...";

    try {
        const res = await fetch("/pdf", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ notionUrl: url })
        });

        // PDF 응답을 blob으로 받음
        const data = await res.blob();

        if (!res.ok) {
            // 에러 처리
            start.classList.add("d-none"); // 진행중 숨김
            warning.innerHTML = `${data.error || data.message || "오류"}`;
            warning.classList.remove("d-none");
            return;
        }

        // 성공 처리
        start.classList.remove("d-none");
        start.innerHTML = "추출 성공, 다운로드 중...";


        const downloadUrl = window.URL.createObjectURL(data);

        // 헤더에서 파일 명 읽기
        const disposition = res.headers.get("Content-Disposition");
        let fileName = "notion.pdf"; // 기본값
        if (disposition && disposition.includes("filename=")) {
            fileName = disposition
                .split("filename=")[1]
                .replace(/"/g, "")
                .trim();
        }

        // 가상의 <a> 태그를 만들어서 다운로드 트리거
        const a = document.createElement("a");
        a.href = downloadUrl;
        a.download = fileName; // 서버에서 fileName도 같이 내려주면 반영 가능
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(downloadUrl);

        console.log("서버 응답:", data);
        // data.output 같은 경로가 있으면 다운로드 버튼에 연결 가능
        // downloadBtn.onclick = () => {
        //     window.location.href = `/download?file=${encodeURIComponent(data.output)}`;
        // };

    } catch (err) {
        console.error(err);
        start.classList.add("d-none"); // 진행중 숨김
        warning.innerHTML = err.message;
        warning.classList.remove("d-none");
    }
});

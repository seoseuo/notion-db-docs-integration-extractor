module.exports = {
    extends: ['@commitlint/config-conventional'],
    rules: {
        'subject-case': [0, 'always'], // 0으로 설정하여 규칙 비활성화
        // 'footer-empty': [2, 'never'], // footer가 비어있으면 에러
    },
};

//subject-case: 제목 대소문자 규칙 검사를 비활성화함.
//footer-empty: 커밋 메시지에 footer가 반드시 있어야 함

// footer 부분에 브랜치를 따로 엮어두지 않으면
// 이슈 페이지에서 커밋 추적이 용이하지 못하기 때문에
// 커밋 시 훅을 통해 필수작성에 대한 강제성을 부여.
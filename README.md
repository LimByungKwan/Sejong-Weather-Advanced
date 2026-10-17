# T05 · 세종 날씨 AI 인수인계

현재 단계: AI A 모듈 단계 종료, AI B 작업 전. **최종 제출 전입니다.**

- [작업 전 고정 계획·상한](docs/t05/PLAN.md)
- [고정 입력·기대값 10개](docs/t05/fixed-tests.json)
- [일곱 항목 인수인계](HANDOFF.md)
- [익명 비교표 초안](docs/t05/COMPARISON.md)
- [원출력과 증거](evidence/t05)
- [기존 T04 설명](docs/t05/T04-README.md)

A: 고정 자동 검사 9/10, T05-04 FAIL. 기존 T04 회귀 13/13.
시간 자동 갱신과 실제 화면 연결은 B가 이어서 완성합니다.
브라우저·빌드·새 공개 비교 보고서는 미검증/미완성입니다.

```sh
node scripts/verify-t05-freeze.mjs
node --test tests/t05-fixed.test.mjs
node --test tests/replay.test.mjs tests/daily-comparison.test.mjs
```

GitHub에는 최종 파일만 덮어쓰지 말고 제공된 Git 이력을 push해야 합니다.
기존 T04 배포 식별 설정은 새 배포 혼동을 막기 위해 제거했습니다.

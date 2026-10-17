# T05 · B 인수인계 (HANDOFF.md 원본은 수정하지 않음)

## 1. 목표
세종 날씨 앱의 조회 후 30분 기준 상태 표시 한 개 완성 (최신값/오래된 값/확인 필요, 실패 시 기온 유지, 성공 시 복구).

## 2. 현재 상태
- 시작 HEAD 2d4728e1e081692036ff83be0f039fcbc6468a9e 확인(bundle에서 새 폴더 work-b로 clone). 시작 시각 사용자 지정 2026-10-17 19:21 KST, 사용자 요청 2회차.
- HANDOFF.md SHA-256 01ffbf120a049e82e5ad770a0e4b801ee3776a34b8e8be6248c1f35774f7370d = evidence/t05/handoff-sent.json 값과 일치. 누락 없음(수정 없음). 단 수신 해시 필드(received_sha256)는 원래 null이라 A 측 전송 해시와의 대조만 했다.
- lib/weather-freshness.mjs: watchFreshness 구현(30분 경계 예약, 구독 해제 시 cancel, refresh()로 재판정).
- app/page.tsx: watchFreshness 구독, 오류·기록 변경 시 기존 구독 정리 후 재구독, 탭 복귀(visibilitychange) 시 재판정, 상태 라벨을 diagnoseFreshness 결과로 표시.
- 모델명·최종 종료 시각·정확한 사용 시간은 미기록(화면 확인 필요).

## 3. 실행 명령
git rev-parse HEAD; node scripts/verify-t05-freeze.mjs; node --test tests/t05-fixed.test.mjs; node --test tests/replay.test.mjs tests/daily-comparison.test.mjs
(Node v22.22.2 사용. 앱 빌드는 pnpm 11.25.0 필요.)

## 4. 통과 검사
- 회차1(재현, 구현 전): 고정 9/10, T05-04 FAIL → 오류 회차 1 (evidence/t05/b-fixed-round-01.txt)
- 회차2(watchFreshness 구현 후): 10/10 PASS (…round-02.txt)
- 회차3(page.tsx 연결 후, 최종): 10/10 PASS (…round-03.txt), T04 회귀 13/13 PASS, freeze 검증 통과
- 네트워크 실패로 clone하지 못한 앞선 시도는 환경 제약으로 기록하며 FAIL 회차에 세지 않음.
- 자동 검사는 함수·구독자 계약이며 실제 React 화면 PASS를 뜻하지 않는다.

## 5. 남은 문제 (미실행)
- pnpm install/build/dev, TypeScript 타입 검사: 미실행(이 환경에 node_modules·pnpm 없음, 네트워크 없음). page.tsx 변경은 타입·빌드 미검증.
- 브라우저 확인(30분 자동 전환, 실패 시 기온 유지, 성공 복구, 탭 복귀): 미확인.
- 새 배포, 공개 비교 보고서, 학생 판단, 시크릿 창 확인, 개인정보 검사: 미실행.

## 6. 다음 행동
1. pnpm install --frozen-lockfile && pnpm build 로 page.tsx 타입·빌드 확인.
2. 브라우저에서 위 화면 시나리오 확인.
3. 종료 시각·요청 수·모델명을 화면에서 확인해 기록, 이름 가린 비교 보고서 작성.

## 7. 건드리지 말 것
docs/t05/PLAN.md, fixed-tests.json, frozen-hashes.json, tests/t05-fixed.test.mjs, T04 테스트·fixture, DB 스키마·비교 규칙, A 증거 및 HANDOFF.md 원본.

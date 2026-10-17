# B 종료 후 검증 및 보완

이 문서는 B 종료 버전 68b3504d39dd3a8b5fd8ae8f9cbda135aca448a2 이후의 사용자 검증과 후속 수정을 기록한다. A/B 원본 커밋, 증거, HANDOFF.md와 HANDOFF-B.md는 변경하지 않는다.

## 새 환경에서 발견한 실행 안내 누락

- 수정 전: vite.config.ts가 참조하는 .openai/hosting.json이 인계 저장소에 없어 빌드가 실패했다. 로컬 DB에 테이블이 없어 /api/weather가 500을 반환했다.
- 수정 후: 기존 T04 배포 ID 없이 최소 설정 `{"d1":"DB","r2":null}`을 복원했다. 기존 SQL을 로컬 DB에 적용해 GET/POST 200을 확인했다.
- 원본 인계의 ‘누락 없음’은 B 당시 확인 범위였다. 전체 앱 실행 재현에는 위 두 안내가 부족했음을 후속 검증에서 발견했다.

Windows PowerShell, Node >=22.13, pnpm 11.25.0, 저장소 루트에서 실행한다. 비밀 환경값은 필요 없다.

```powershell
pnpm.cmd install --frozen-lockfile
pnpm.cmd build
pnpm.cmd exec wrangler d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_windy_karma.sql
pnpm.cmd dev
```

브라우저 주소: http://127.0.0.1:5173/

SQL 적용은 새 로컬 DB에서 한 번 수행한다. 기존 테이블이 있는 DB에 중복 실행하지 않는다. `--remote`를 사용하지 않으며 T04의 배포나 DB를 변경하지 않는다.

## 타입 오류 수정

- 수정 전: app/page.tsx의 JSON 응답 unknown 접근 5건, comparison.delta의 undefined 가능성 2건으로 타입 검사 실패.
- 수정 후: WeatherResponse 타입 지정과 delta 숫자 여부 분기를 추가했다. 중복 선언을 제거한 뒤 `pnpm.cmd exec tsc --noEmit --incremental false`에서 오류 없이 종료 코드 0을 확인했다.
- 최종 `pnpm.cmd build`: 전체 5단계 완료, Build complete 확인(21:41 사용자 출력).
- 고정 검사 파일과 기대값을 수정하지 않았다.

## 고정 파일 줄바꿈

Windows 작업 폴더의 CRLF 때문에 원본 해시 검사가 실패했다. Git 원본과 줄바꿈 통일 후 내용이 같음을 확인했다. 고정 파일 3개 모두 내용 동일 여부를 먼저 확인한 뒤 최초 고정 커밋의 바이트로 복원했다. 기대 해시를 바꾸지 않았으며, .gitattributes에서 해당 3개 파일을 LF로 유지한다.

21:40 사용자 실행 결과: 고정 계약 원본 일치 통과, 같은 고정 검사 10개 모두 PASS, FAIL 0. 줄바꿈 문제는 고정 검사의 삭제·완화·기대값 변경이 아니다.

## 실제 브라우저 확인

2026-10-17 Asia/Seoul, 사용자가 직접 실행하고 캡처했다.

| 상황 | 관찰 결과 |
|---|---|
| 정상 조회 | 18.9°C, 조회 20:42:58, 최신값, 조회·저장 200 |
| Network Offline 후 조회 | 18.9°C와 20:42:58 유지, 오래된 값 · 조회 실패 |
| No throttling 복구 후 재시도 | 18.8°C, 조회 20:46:27 갱신, 최신값, 조회·저장 200 |
| 21:14:24 전환 전 캡처 | 18.8°C, 조회 20:46:27, 최신값 |
| 21:16:48 전환 후 캡처 | 18.8°C, 조회 20:46:27, 오래된 값 |

사용자는 대기 중 버튼을 누르지 않았다고 확인했다. 따라서 30분 경과 후 자동 상태 전환을 확인했다. 전환 순간의 정확한 초 단위 지연은 측정하지 않았다. 원래 T05-04의 정확한 경계는 고정 자동 검사로 별도 확인한다.

탭이 숨겨진 상태에서 30분 경계를 넘긴 뒤 복귀하는 시나리오는 아직 별도 검증하지 않았다. 공개 배포 및 시크릿 창 확인도 아직 미완료다. 이 문서는 전체 과제 통과를 선언하지 않는다.

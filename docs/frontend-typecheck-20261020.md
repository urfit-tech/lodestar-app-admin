# 前端型別與 production build 修正（2026-10-20）

## 結果與根因

在原編譯器／測試型別修正後，使用者擴大範圍要求清除既有建置阻擋。本次完整型別診斷從 30 個降至 0；不更改 strict、不排除來源或測試、不略過 CRA 型別檢查。

原 TypeScript 4.4.3 無法解析 SWR 2.2.5 的 inline type export；app 另有 react-reader。根編譯器已升為 4.9.5，符合 CRA 4 的 ^3.2.1 || ^4 peer range，補 @types/jest 26.0.24 與 Promise mocks。剩餘業務錯誤可在基準以相同工具重現；auth 新增的錯誤只在測試型別，已修正。先前「只列既有業務錯誤」的範圍已由本次修正取代。

- 原基準：`771d815c87d4b9187d13bc1df094b1421774edb6`。
- 原 auth HEAD：`22371599ee179e73392eaa2a2a0ba3275012397d`（[#764](https://github.com/urfit-tech/lodestar-app-admin/pull/764)）。
- 前輪 fresh subagent review 僅涵蓋編譯器／測試型別 commit；本輪新增業務修正經主 agent 複查，仍待同事 review。

## 本輪變更

- 補 CouponPlanAdminCard 的 useApp import；ProgramContent 的日期以 Omit 保留 Date 型別。
- 排程資源查詢改為明確回傳 Promise 的 curried function；邀請 payload 依實際 API 接受 resource ID／role，不要求未使用的顯示欄位。
- 將 RRule 實例轉成 FullCalendar 支援的 recurrence／exclusion 輸入，保留日期、duration 與 metadata，補回歸測試。
- 補訂單 GraphQL 回應型別（沿用本地 Hasura schema 的 Pick）、既有查詢 options／expired_at 宣告、排程 type literal、CheckboxValueType 與行事曆日期轉換。
- 權限頁仍使用原本 SELECT_MEMBER_PERMISSION key，僅以 in 判斷縮窄型別；沒有改用其他權限、擴大授權或更動後端權限。
- 用 patch-package 8.0.0／postinstall-postinstall 2.1.0 修補原 element v1.95.4 的五個來源檔，postinstall 設定 --error-on-fail。
- 部署 workflow 固定 Node 16.20.2／Yarn 1.22.22，install 使用 --frozen-lockfile --production=false --non-interactive，避免 NODE_ENV=production 略過 patch 工具及 Jest 型別。

## 驗證

- Node 16.20.2／Yarn 1.22.22／TypeScript 4.9.5。
- `tsc --noEmit --pretty false`：通過，0 diagnostics。
- 全部 11 suites／83 tests 通過，包括原 auth 測試。
- production build：通過。保留既有 ESLint／Browserslist 警告，沒有透過新增忽略設定消除錯誤；CI=false 是原 build script 行為。
- 獨立完整安裝及 NODE_ENV=production 下的 --frozen-lockfile --production=false 安裝／postinstall patch 成功。以 Yarn lock parser 比對，既有 selector 的 resolution／integrity 未漂移；新增項目只來自 patch-package 及其依賴（32 個 selector，可能合併到既有版本）。
- Node 16 符合專案 engines >=14.16 <17；部署 workflow 的 Node 14 改為這次實測版本。只更新 workflow，未執行部署。
- 前輪以 CRA 4 的 webpack 4.44.2／fork-ts-checker 4.1.6 實測 TS 4.9.5：合法 fixture 通過、故意錯誤可被攔下、修復後恢復通過。@typescript-eslint 4.33 宣告支援範圍 <4.5，實測成功不代表所有 parser 行為受官方保證。

## 依賴與部署順序

本 PR [#766](https://github.com/urfit-tech/lodestar-app-admin/pull/766) 的 base 為 `develop`，包含原 auth PR 的 ancestry。原 auth PR 未合併前，GitHub diff 會包含 auth 變更。先合併原 auth PR，再處理本 PR；如果採 squash／rebase merge，以原 auth HEAD `22371599ee179e73392eaa2a2a0ba3275012397d` 為界，只把後續修正 rebase 到新 base，確認 diff 後重跑驗證，避免重複引入 auth commits。

此處是同事 review 後的計畫，這輪沒有 merge、部署或 tag：

1. app #749 → #750；admin #764 → #766，各自的 auth 與建置修正作為同一部署單位。先部署這兩個前端。
2. 再部署 backend #426，沿用 doc §8、§10、§12 的契約。此輪不改 retryAfter、60 秒冷卻、每會員每小時 5 封或既有同 IP 15 分鐘 200 次登入限流。
3. element #142 → #143 之後另外發 tag；目前 app／admin 的 patch 固定於舊版 element，不需要先更新套件。未來升級 tag 時，確認上游已包含相同修正，再移除本地 patch；auth 本地相容副本／replacement 也要另驗證後才能移除。

新前端＋舊後端：仍處理既有成功／拒絕回應，缺少 retryAfter 時使用 60 秒 fallback。新前端＋新後端：顯示對應拒絕訊息及實際 retryAfter。舊前端＋新後端：仍可能忽略 retryAfter、顯示 Axios 原始錯誤或卡載入，因此維持前端先部署。此次型別／建置修正不改這些相容性規則。

## CI

推送後檢查新 HEAD 的 CodeQL；CodeQL 不取代本地 typecheck／production build。 最新 HEAD／結果記錄於 PR 描述。

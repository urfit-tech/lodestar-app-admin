# 前端型別檢查調查（2026-10-20）

## 結論與範圍

原基準分支就有 TypeScript 4.4.3 無法解析依賴宣告的問題。以相同的 TypeScript 4.9.5 與同一份既有依賴比較，auth PR 新增 4 個診斷，全部在測試檔；未發現 auth 產品程式新增型別錯誤。本次依約只修編譯器、測試型別及 auth 新增問題，保留並列出既有業務診斷。

此分支接續 [auth PR #764](https://github.com/urfit-tech/lodestar-app-admin/pull/764) 的 HEAD；新 draft PR 的 base 仍為 `develop`。應先合併原 auth PR，再合併本 PR。原 PR 尚未合併時，GitHub diff 會包含其 auth 變更；本次新增修正以最後一個 `fix: restore compiler and test typings` commit 為準。原 auth PR 不因本次工作更新。

## 比較證據

- 基準：`771d815c87d4b9187d13bc1df094b1421774edb6`（`origin/develop`）。
- auth HEAD：`22371599ee179e73392eaa2a2a0ba3275012397d`。
- 同 repo 的基準、auth、修正後均使用相同既有依賴；修正後僅替換根編譯器並新增 Jest 型別。
- TS 4.4.3 在基準的語法診斷：42 個；原 auth 的 CLI 檢查同樣卡在依賴語法。

| 狀態（TypeScript 4.9.5） | 診斷數 |
| --- | ---: |
| 原基準，尚未補 Jest 型別 | 157 |
| auth HEAD，尚未補 Jest 型別 | 161 |
| 本次修正後 | 30 |

比較鍵為「檔案路徑、TS code、完整訊息」並保留重複次數，忽略行號位移。剩餘 30 個診斷全部能在基準分支以同一編譯器重現；測試檔與 setupTests 的診斷為 0。這代表與 auth 變更無關，不表示原 TS 4.4 已能完成 semantic check。

## 根因與修正

1. 三個 repo 原本固定 TS 4.4.3，但 SWR 2.2.5 使用 `export { type ... }`。SWR 的 internal 與 mutation 宣告均使用此語法。這種 inline type modifier 自 [TypeScript 4.5](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-5.html#type-modifiers-on-import-names) 才支援；既有 `skipLibCheck` 無法跳過語法解析。根編譯器升為 4.9.5，符合本地 react-scripts 4.0.3 的 peer range `^3.2.1 || ^4`。
2. 專案測試使用 `jest`、`expect`、`it` 等全域，但未宣告 `@types/jest`。補上 26.0.24，對齊既有 Jest 26。沒有改 tsconfig、排除測試、放寬 strict 或加入錯誤抑制。
3. auth 測試的 Promise mock 原為無回傳型別的 `jest.fn()`，`mockResolvedValue` 參數被推斷為 `never`。改成 `jest.fn<Promise<unknown>, any[]>()`，不改 runtime 測試行為。
4. 另外將既有空白 setupTests.ts 標記為 module，修正 isolatedModules 的 TS1208。
5. 新增 `yarn typecheck`（`tsc --noEmit`）統一入口；剩餘錯誤仍使命令回傳非零。lockfile 只更新編譯器與 Jest 型別所需 selector，沒有升級業務依賴。

### auth 新增診斷分布（修正前）

| 檔案 | 新增診斷 |
| --- | ---: |
| `src/contexts/AuthContext.test.tsx` | 2 |
| `src/pages/ForgotPasswordPage.test.tsx` | 2 |

## 驗證

- 全部測試：9 suites、77 tests 通過；使用 Node 18.20.8、Jest 26 與既有 react-scripts。
- 完整型別檢查：仍有 30 個既有業務／套件來源診斷，預期 exit 2；不是全綠。
- 已比對 lockfile：Yarn 4 使用 update-lockfile 驗證；Yarn 1 用官方 lockfile parser 比對既有 resolution，未漂移。
- 使用隔離 worktree 與既有 node_modules 的隔離 overlay，另置 TS 4.9.5 與 Jest 型別。未執行從零完整安裝或 production build；測試結果不等同部署驗證。

```sh
yarn typecheck
CI=true NODE_OPTIONS=--openssl-legacy-provider yarn test --watch=false --watchman=false --runInBand
```

## 剩餘既有業務診斷

以下行號取自本次修正後。`node_modules/lodestar-app-element` 是消費端已安裝的套件來源，不是本次 element PR；學員端／後台沒有更換 element tag。完整訊息可用上述 typecheck 命令重現。

| 檔案:行 | Code | 訊息摘要 |
| --- | --- | --- |
| `src/components/coupon/CouponPlanAdminCard.tsx:129` | TS2304 | Cannot find name 'useApp'. |
| `src/components/craft/inputs/ImageInput.tsx:90` | TS2741 | Property 'className' is missing in type '{ width: string; ratio: number; src: string; shape: "rounded"; }' but required in type 'CustomRatioImageProps'. |
| `src/components/event/MemberOpenTimeScheduleBlock.tsx:217` | TS2345 | Argument of type '{ events: GeneralEventApi[]; invitedResource: { temporally_exclusive_resource_id: string; role: string; }[]; }' is not assignable to parameter of type 'unique symbol \| { events: GeneralEventAp… |
| `src/components/event/MemberOpenTimeScheduleBlock.tsx:248` | TS2322 | Type '({ id: any; title: string; backgroundColor: string; borderColor: string; extendedProps: { originalEvent: GeneralEventApi; }; classNames: string[]; source?: EventSourceApi \| null \| undefined; ... 26 more .… |
| `src/components/program/ExerciseAdminModalBlock.tsx:540` | TS2769 | No overload matches this call. |
| `src/components/program/ExternalLinkAdminModalBlock.tsx:179` | TS2769 | No overload matches this call. |
| `src/components/program/PracticeAdminModalBlock.tsx:154` | TS2769 | No overload matches this call. |
| `src/components/program/ProgramContentAdminBlock.tsx:431` | TS2769 | No overload matches this call. |
| `src/components/schedule/AddOrdersToClassModal.tsx:80` | TS7006 | Parameter 'order' implicitly has an 'any' type. |
| `src/components/schedule/AddOrdersToClassModal.tsx:81` | TS7006 | Parameter 'product' implicitly has an 'any' type. |
| `src/components/schedule/AddOrdersToClassModal.tsx:118` | TS7006 | Parameter 'order' implicitly has an 'any' type. |
| `src/components/schedule/AddOrdersToClassModal.tsx:119` | TS7006 | Parameter 'order' implicitly has an 'any' type. |
| `src/components/schedule/editor/ClassGroupScheduleEditor.tsx:1126` | TS18046 | 'teacherResources' is of type 'unknown'. |
| `src/components/schedule/editor/ClassGroupScheduleEditor.tsx:1132` | TS18046 | 'classroomResources' is of type 'unknown'. |
| `src/components/schedule/editor/ClassGroupScheduleEditor.tsx:2095` | TS2322 | Type 'string \| Date' is not assignable to type 'Date \| undefined'. |
| `src/components/schedule/editor/ClassGroupScheduleEditor.tsx:2226` | TS2322 | Type '(values: Array<string \| number>) => void' is not assignable to type '(checkedValue: CheckboxValueType[]) => void'. |
| `src/components/schedule/editor/PersonalScheduleEditor.tsx:1994` | TS2322 | Type '{ id: any; studentId: string; productName: string; language: any; type: string; totalMinutes: number; usedMinutes: number; availableMinutes: number; createdAt: Date; paymentExpiredAt: Date \| undefined; ex… |
| `src/components/schedule/editor/PersonalScheduleEditor.tsx:2005` | TS2322 | Type '{ usedMinutes: number; availableMinutes: number; id: any; studentId: string; productName: string; language: any; type: string; totalMinutes: number; createdAt: Date; paymentExpiredAt: Date \| undefined; ex… |
| `src/components/schedule/editor/PersonalScheduleEditor.tsx:2156` | TS2322 | Type '(values: Array<string \| number>) => void' is not assignable to type '(checkedValue: CheckboxValueType[]) => void'. |
| `src/components/schedule/utils/orderOptionResolver.ts:46` | TS7006 | Parameter 'id' implicitly has an 'any' type. |
| `src/hooks/schedule.ts:136` | TS2339 | Property 'options' does not exist on type '{ __typename?: "order_log" \| undefined; id: string; status: string; member_id: string; created_at: any; updated_at?: any; order_products: { __typename?: "order_product… |
| `src/pages/MemberAdminPage/MemberAdminPage.tsx:140` | TS2339 | Property 'SELECT_MEMBER_PERMISSION' does not exist on type '{ ACTIVITY_NORMAL?: boolean \| undefined; ACTIVITY_CATEGORY_ADMIN?: boolean \| undefined; ACTIVITY_ADMIN?: boolean \| undefined; ACTIVITY_READ?: boolean … |
| `node_modules/lodestar-app-element/src/components/cards/ActivityCard.tsx:54` | TS2741 | Property 'className' is missing in type '{ width: string; ratio: number; src: string; }' but required in type 'CustomRatioImageProps'. |
| `node_modules/lodestar-app-element/src/components/cards/PostCard.tsx:137` | TS2741 | Property 'className' is missing in type '{ width: string; ratio: number; src: string; }' but required in type 'CustomRatioImageProps'. |
| `node_modules/lodestar-app-element/src/components/cards/ProgramContentCard.tsx:119` | TS2741 | Property 'className' is missing in type '{ src: string; ratio: number; width: string; }' but required in type 'CustomRatioImageProps'. |
| `node_modules/lodestar-app-element/src/components/collections/ActivityCollection.tsx:116` | TS2769 | No overload matches this call. |
| `node_modules/lodestar-app-element/src/components/collections/ActivityCollection.tsx:117` | TS2769 | No overload matches this call. |
| `node_modules/lodestar-app-element/src/components/collections/PostCollection.tsx:126` | TS2769 | No overload matches this call. |
| `node_modules/lodestar-app-element/src/components/collections/ProjectCollection.tsx:127` | TS2769 | No overload matches this call. |
| `node_modules/lodestar-app-element/src/components/common/Craftize.tsx:67` | TS2352 | Conversion of type 'StyledComponent<ElementComponent<P>, any, P & { className?: string \| undefined; children?: ReactNode; onClick?: (() => void) \| undefined; } & { responsive?: { mobile?: (P & { ...; }) \| undef… |

## 相容性與後續

本次新增 commit 僅影響開發編譯器與測試宣告，沒有改後端回應契約、冷卻時間或 auth runtime，無需配套後端部署。原 auth PR 所述的部署順序與新舊前後端相容性仍適用。app 與 admin 的修正不依賴 element 新 tag；element 也不在本次發布 tag。

剩餘業務型別問題需獨立確認元件 props、GraphQL schema、泛型／Date 型別契約後處理，未以 any 或 suppressions 隱藏。CI 結果記錄於新 draft PR 描述；CodeQL 成功不代表 typecheck 通過。尚未 merge、部署或發布。

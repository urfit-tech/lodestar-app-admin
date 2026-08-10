# ADR 0001:代幣紀錄清單改用 seek pagination

- 日期:2026-08-06
- 狀態:已接受
- 相關:`src/components/coin/MemberCoinAdminBlock.tsx`

## 背景

客戶 `neganchor` 回報某位會員的代幣紀錄「學員端看得到、管理端看不到」。
資料本身完整無誤,問題在管理端清單的分頁。查下來有兩個獨立缺陷。

**一、`order_by` 缺唯一鍵。** 批次發送會產生大量 `created_at` 完全相同的資料列
(同一個 statement 共用 transaction 時間戳,實務上單一微秒數十筆)。
原本只有 `order_by: { created_at: desc }`,而每一頁都是一次獨立查詢、各自排序一次,
Postgres 對並列值不保證跨查詢一致 —— 相鄰兩頁對「誰排第 N 名」的認知不一致,
交界處同時產生重複列與漏行。

正式站唯讀實測(管理端實際的查詢條件,翻 10 頁):修正前 100 列只有 **89 個唯一 id**,
補上 `{ id: desc }` 後 **100/100**。

> 這不是排序錯亂 —— `created_at` 全程單調遞減,畫面上沒有任何視覺訊號,
> 唯一症狀是某一列安靜地不見了。這是它長期未被發現的原因。

**二、分頁狀態存在從不重設的 ref。** `storeCreatedTime` / `currentIndex` 只在初次載入時
寫入、之後永不重設。發送代幣成功後會 `refetch`,但 refetch 只回第一頁:
`storeCreatedTime` 凍結在發送前的時間戳,而 `loadMore` 的條件是 `created_at <= 它`,
把剛發出去的資料整批擋在門外;`currentIndex` 只增不減,跳號漏行。

實際後果:一次發送 16 人 → 畫面只出現 10 筆 → 操作者以為有 6 人沒發成功 → 補發。
這正是本次客訴的成因。

## 決策

**改用 seek pagination,以最後一筆的 `(created_at, id)` 為游標。**

`offset` 問的是「跳過前 N 筆」—— 資料庫只是在數數,不知道上次看到誰。
翻頁途中前面被刪掉一筆,後面全部往前挪一格,交界那筆就被含進「前 N 筆」一起跳掉。
這是 offset 的結構性限制,補任何上界條件都無解(上界只擋得住新增,擋不住刪除)。

```ts
const afterCursor = (cursor: { created_at: any; id: string }) => ({
  _or: [
    { created_at: { _lt: cursor.created_at } },
    { _and: [{ created_at: { _eq: cursor.created_at } }, { id: { _lt: cursor.id } }] },
  ],
})
```

游標是一組值的比較,不是位置 —— **游標那一列本身被刪除也不影響**。

## 取捨

### `order_by` 的 `id` 不可移除

游標條件必須與 `order_by: [{ created_at: desc }, { id: desc }]` 完全一致。
移除 `id` 會讓排序不唯一,游標就沒有座標可指,而且**不會報錯**,只會靜默漏行。

### `condition` 必須用 `_and` 包住

`condition` 本身已經有一個 `_or`(`started_at is null OR <= now()`)。
展開後直接加 `_or` 會覆蓋掉它,同樣不會報錯,只會安靜地多查出未生效的代幣。

### aggregate 要跟著游標重算

`fetchMore` 回來的 `aggregate.count` 是「游標之後還有幾筆」,
必須加上已載入筆數才能還原成總數:

```ts
count: prev.coin_log.length + (fetchMoreResult.coin_log_aggregate.aggregate?.count || 0)
```

否則「顯示更多」按鈕的判斷式(`count - 已載入 > 0`)會用到初次查詢的陳舊總數 ——
翻頁途中資料被刪除時,已載入筆數永遠追不上,按鈕不會消失。

### 無法跳頁

seek 只能往下連續取。目前 UI 只有「顯示更多」、沒有頁碼,不受影響;
日後若要加頁碼則做不到。

## 被推翻的替代方案

### 只補 `{ id: desc }`,保留 offset

能解決排序不唯一,實測從 89/100 變成 100/100。但對「翻頁途中刪除」無效 ——
而收回代幣是硬刪除,這不是假設情境。

### 保留 offset,加上 `created_at <= 目前第一筆` 的上界

擋得住新增(新資料一定排在最上面,被上界切掉),但擋不住刪除。
刪除發生在已載入區塊內部,後面往前挪,沒有任何上界能阻止。

## 後果

- 三支 hook(發送紀錄、即將發送、消費紀錄)的 `_lte` 上界整段移除,`offset` 固定為 0。
- dev 環境以新查詢形狀完整走訪 83 筆:0 重複、0 漏,最後一頁 `count - 已載入 = 0`,
  按鈕正確隱藏。
- **實際 UI 行為尚未在部署環境驗證**,需上測試站點擊確認。

## 已決定(2026-08-07 討論後補記)

- **不加 `created_at` 索引。** 每筆寫入都要多維護一份索引,寫入成本不划算;
  且 Hasura 無法表達 row-value 比較 `(created_at, id) < (?, ?)`,只能展開成
  `_or` + `_and`,Postgres 對這個形狀不保證能從索引中段起跳 —— 即使加了,
  效能收益也不確定。seek 在本查詢的價值定位為**正確性**,不是效能。
- **收回代幣後補 refetch「即將發送」tab。** 兩個 tab 的收回按鈕共用
  `handleRevokeCoin`,原本只 refetch 發送紀錄,在「即將發送」tab 收回後
  畫面與 cache 會殘留已刪除的列,下一頁游標取到 stale 資料。已併入本次修正。

## 尚未決定

1. **排序鍵要不要從 `created_at` 換成 `started_at`(代幣效期)。**
   產品層的出發點:對使用者而言效期比建立時間重要,且 `created_at` 排序被視為
   歷史共業。但技術上須三件一起改,不宜順手做:
   - 全表 83,154 筆中 **12,494 筆(15%)的 `started_at` 為 NULL**(「即日起」),
     Hasura `desc` 是 NULLS FIRST → 清單頂端會先出現一整塊萬筆級的 NULL 群,
     且游標條件無法表達 `started_at < NULL`,seek 要拆成 NULL 區/跨區/非 NULL 區三段
   - 清單第一欄顯示的是建立日期,改排 `started_at` 後該欄會呈現亂序,
     顯示欄位需一併調整
   - 現有 `(member_id, started_at)` 索引第一鍵是 `member_id`,全站清單吃不到
2. `src/pages/PointHistoryAdminPage.tsx:305,381`(點數)有完全相同的 offset 寫法,
   尚未處理(與本 PR 無關,另案)。

const orderExampleData = [
  ['email', 'type', 'target', 'name', 'price', 'discountType', 'discountSource', 'discountInstance', 'startedAt', 'endedAt', 'status'],
  [
    'member1@sample.com',
    'Program',
    '1231-34114-124134',
    '範例課程-A',
    '100',
    'Voucher',
    'fb6e55cf-02a5-4198-806f-9267fdd5cb65',
    '',
    '2021-10-03',
    '',
    'SUCCESS'
  ],
  [
    'member2@sample.com',
    'Program',
    '1231-34114-124134',
    '範例課程-B',
    '150',
    'Voucher',
    'fb6e55cf-02a5-4198-806f-9267fdd5cb65',
    '',
    '2021-10-03 00:00:00',
    '2021-10-05',
    'FAILED',
  ],
  ['member3@sample.com', 'Program', '1231-34114-124134', '範例課程-C', '200', '2021/10/03', '', 'UNPAID'],
  [
    'member4@sample.com',
    'Program',
    '1231-34114-124134',
    '範例課程-D',
    '250',
    'Voucher',
    'fb6e55cf-02a5-4198-806f-9267fdd5cb65',
    '',
    '2021/10/03 12:22:24 AM',
    '2021-10-04',
    'REFUND',
  ],
  [
    'member4@sample.com',
    'Program',
    '1231-34114-124134',
    '範例課程-E',
    '300',
    'Voucher',
    'fb6e55cf-02a5-4198-806f-9267fdd5cb65',
    '',
    '2021/10/03 21:22:24',
    '2021-10-06 11:22:21 PM',
    'SUCCESS',
  ],
  [],
  [`注意事項：
0. discountSource 為折扣方案，
   discountInstance 為該折扣本身
   —— 注意並非兌換券代碼或折價券代碼
1. 在只提供 discountSource，
   沒有提供 discountInstance 的狀況下，
   會以 discountSource 去找目前會員
   可用的 discountInstance；
2. 在提供 discountSource，
   也提供 discountInstance 的狀況下，
   會以 discountInstance 為主 
   —— 亦即，就算該會員並無該 discountSource，
   也不會去找適合的 discountInstance；
3. 同會員同 discountInstance 的資料
   會被聚合為一張訂單，
   無論這個 discountInstance 是給定的，
   抑或由 discountSource 查出的；
4. 假使直接給定 discountInstance，
   就不檢查是否屬於該用戶，也不檢查
   是否已經使用或過期，也不檢查該兌換券
   是否可以兌換對應產品；
5. 交易狀態的優先順序會以 
   'SUCCESS', 'UNPAID', 'REFUND', 
   'EXPIRED', 'FAILED'  遞增，亦即，
   假使 2 列資料屬於同筆訂單，而一筆為
   'SUCCESS'、一筆為  'EXPIRED'，則會以
   'EXPIRED' 為主 —— 亦即衝突時取保守者`],
]

export default orderExampleData

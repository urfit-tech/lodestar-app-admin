export const paymentMethods: {
  method: string
  feeWithInstallmentPlans: {
    installmentPlan: number
    fee: number
  }[]
  hidden?: boolean
}[] = [
  {
    method: '學米仲信',
    feeWithInstallmentPlans: [
      { installmentPlan: 3, fee: 0.03 },
      { installmentPlan: 6, fee: 0.03 },
      { installmentPlan: 12, fee: 0.05 },
      { installmentPlan: 18, fee: 0.055 },
      { installmentPlan: 24, fee: 0.07 },
      { installmentPlan: 30, fee: 0.085 },
      { installmentPlan: 36, fee: 0.11 },
    ],
  },
  {
    method: '歐付寶',
    feeWithInstallmentPlans: [
      { installmentPlan: 1, fee: 0.0245 },
      { installmentPlan: 3, fee: 0.025 },
      { installmentPlan: 6, fee: 0.04 },
      { installmentPlan: 12, fee: 0.07 },
      { installmentPlan: 18, fee: 0.095 },
      { installmentPlan: 24, fee: 0.11 },
    ],
  },
  {
    method: '藍新',
    feeWithInstallmentPlans: [
      { installmentPlan: 1, fee: 0.028 },
      { installmentPlan: 3, fee: 0.03 },
      { installmentPlan: 6, fee: 0.035 },
      { installmentPlan: 12, fee: 0.07 },
      { installmentPlan: 18, fee: 0.09 },
      { installmentPlan: 24, fee: 0.12 },
      { installmentPlan: 30, fee: 0.15 },
    ],
  },

  { method: '富比世', feeWithInstallmentPlans: [] },
  {
    method: '匠說仲信',
    feeWithInstallmentPlans: [
      { installmentPlan: 3, fee: 0.03 },
      { installmentPlan: 6, fee: 0.03 },
      { installmentPlan: 12, fee: 0.05 },
      { installmentPlan: 18, fee: 0.07 },
      { installmentPlan: 24, fee: 0.09 },
      { installmentPlan: 30, fee: 0.1 },
      { installmentPlan: 36, fee: 0.13 },
    ],
  },
  { method: '匯款', feeWithInstallmentPlans: [] },
  { method: '現金', feeWithInstallmentPlans: [] },
  {
    method: '裕富',
    feeWithInstallmentPlans: [
      { installmentPlan: 6, fee: 0.035 },
      { installmentPlan: 12, fee: 0.06 },
      { installmentPlan: 18, fee: 0.09 },
      { installmentPlan: 24, fee: 0.0975 },
      { installmentPlan: 30, fee: 0.12 },
      { installmentPlan: 36, fee: 0.14 },
    ],
  },
  {
    method: '遠信',
    feeWithInstallmentPlans: [
      { installmentPlan: 6, fee: 0.035 },
      { installmentPlan: 12, fee: 0.043 },
      { installmentPlan: 18, fee: 0.06 },
      { installmentPlan: 24, fee: 0.075 },
      { installmentPlan: 30, fee: 0.09 },
      { installmentPlan: 36, fee: 0.12 },
    ],
  },
  {
    method: '萬事達',
    feeWithInstallmentPlans: [
      { installmentPlan: 1, fee: 0.028 },
      { installmentPlan: 3, fee: 0.03 },
      { installmentPlan: 6, fee: 0.04 },
      { installmentPlan: 12, fee: 0.065 },
    ],
  },
  // old used
  {
    method: '舊遠信',
    hidden: true,
    feeWithInstallmentPlans: [
      { installmentPlan: 6, fee: 0.045 },
      { installmentPlan: 12, fee: 0.045 },
      { installmentPlan: 18, fee: 0.065 },
      { installmentPlan: 24, fee: 0.085 },
      { installmentPlan: 30, fee: 0.1 },
      { installmentPlan: 36, fee: 0.14 },
    ],
  },
  {
    method: '新仲信',
    hidden: true,
    feeWithInstallmentPlans: [
      { installmentPlan: 3, fee: 0.03 },
      { installmentPlan: 6, fee: 0.03 },
      { installmentPlan: 12, fee: 0.05 },
      { installmentPlan: 18, fee: 0.07 },
      { installmentPlan: 24, fee: 0.09 },
      { installmentPlan: 30, fee: 0.1 },
      { installmentPlan: 36, fee: 0.13 },
    ],
  },
  {
    method: '舊仲信',
    hidden: true,
    feeWithInstallmentPlans: [
      { installmentPlan: 3, fee: 0.03 },
      { installmentPlan: 6, fee: 0.04 },
      { installmentPlan: 12, fee: 0.06 },
      { installmentPlan: 18, fee: 0.09 },
      { installmentPlan: 24, fee: 0.11 },
      { installmentPlan: 30, fee: 0.13 },
      { installmentPlan: 36, fee: 0.15 },
    ],
  },
]

export const installmentPlans = [1, 3, 6, 8, 9, 12, 18, 24, 30, 36] as const

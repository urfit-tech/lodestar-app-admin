export type MembershipCard = {
  id: string
  relativePeriodAmount: number | null
  relativePeriodType: 'D' | 'W' | 'M' | 'Y'
  appId: string
  description: string
  template: string
  fixedStartDate: string | null
  fixedEndDate: string | null
  expiryType: string
  title: string
}

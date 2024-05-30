export type MembershipCard = {
  id: string
  relativePeriodAmount: number | null
  relativePeriodType: string | null
  appId: string
  description: string
  template: string
  fixedStartDate: string | null
  fixedEndDate: string | null
  expiryType: string
  title: string
}

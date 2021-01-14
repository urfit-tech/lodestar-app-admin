export type MemberContractProps = {
  id: string
  authorId: string
  member: {
    id: string
    name: string
    pictureUrl: string | null
    email: string
  }
  startedAt: Date
  endedAt: Date
  agreedAt: Date
  revokedAt: Date
  approvedAt: Date | null
  loanCancelAt: Date | null
  refundApplyAt: Date | null
  referralMemberId: string | null
  appointmentCreatorId: string | null
  studentCertification: string | null
  invoice: {
    name: string
    email: string
    phone: string
  } | null
  projectPlanName: string | null
  price: number | null
  coinAmount: number | null
  paymentOptions: {
    paymentMethod: string
    paymentNumber: string
    installmentPlan: number
  } | null
  note: string | null
  orderExecutors:
    | {
        ratio: number
        memberId: string
      }[]
    | null
  couponCount: number | null
}

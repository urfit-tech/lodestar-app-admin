export type StatusType = 'pending-approval' | 'approved-approval' | 'applied-refund' | 'canceled-loan' | ''
export type DateRangeType = 'agreed_at' | 'started_at' | 'revoked_at'

export type MemberContractProps = {
  id: string
  authorName: string | null
  member: {
    name: string | null
    pictureUrl: string | null
    email: string | null
  }
  startedAt: Date
  endedAt: Date
  agreedAt: Date | null
  revokedAt: Date | null
  approvedAt: Date | null
  loanCanceledAt: Date | null
  refundAppliedAt: Date | null
  referral: {
    name: string | null
    email: string | null
  }
  appointmentCreatorName: string | null
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

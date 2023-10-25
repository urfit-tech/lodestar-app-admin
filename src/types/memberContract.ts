import { Manager } from './sales'

export type StatusType = 'pending' | 'approved' | 'refund-applied' | 'loan-canceled' | 'revoked'
export type DateRangeType =
  | 'agreed_at'
  | 'started_at'
  | 'approved_at'
  | 'refund_applied_at'
  | 'loan_canceled_at'
  | 'revoked_at'

export type MemberContractProps = {
  id: string
  authorId: string | null
  authorName: string | null
  member: {
    id: string | null
    name: string | null
    pictureUrl: string | null
    email: string | null
    createdAt: Date | null
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
  attachments: { id: string; data: any; options: any }[] | null
  invoice: {
    name: string
    email: string
    phone: string
  } | null
  projectPlanName: string | null
  price: number | null
  coinAmount: number | null
  orderOptions: {
    recognizePerformance?: number
  }
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
  appointmentCouponCount: number | null
  manager: Pick<Manager, 'id' | 'email' | 'username' | 'name' | 'avatarUrl'> | null
  status: StatusType | null
  lastActivity: string | null
  lastAdPackage: string | null
  lastAdMaterial: string | null
  firstFilledAt: string | null
  lastFilledAt: string | null
  rebateGift?: string | null
  sourceUrl?: string | null
  dealer?: string | null
}

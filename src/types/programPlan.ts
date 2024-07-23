import { EditorState } from 'braft-editor'
import { Moment } from 'moment'
import { AdminModalProps } from '../components/admin/AdminModal'
import { SaleProps } from '../components/form/SaleInput'
import { ListPriceCircumfix } from '../components/program/programPlanAdminModals/formItem/ListPriceCircumfixItem'
import { PeriodType } from './general'
import { ProductGiftPlan } from './giftPlan'
import { ProgramPlan } from './program'

export type MembershipItemProps = {
  name: string
  membershipId: string | undefined
}

export type MembershipPlanModalFieldProps = {
  title: string
  type: 1 | 2 | 3
  membershipCard: string
  cardId: string
}

export type PerpetualField = {
  title: string
  isPublished: boolean
  isParticipantsVisible: boolean
  currencyId?: string
  listPrice: number
  sale: SaleProps
  type: 1 | 2 | 3
  description: EditorState
  groupBuyingPeople?: number
  hasGiftPlan: boolean
  productGiftPlanId: string
  productId?: string
  giftPlanProductId: string
  giftPlanStartedAt?: Moment | null
  giftPlanEndedAt?: Moment | null
  productLevel?: number
  listPriceCircumfix?: ListPriceCircumfix
  priceDescription?: EditorState | null
}

export type PeriodFieldProps = {
  title: string
  isPublished: boolean
  isParticipantsVisible: boolean
  period: { type: PeriodType; amount: number }
  remindPeriod: { type: PeriodType; amount: number }
  currencyId?: string
  listPrice: number
  sale: SaleProps
  type: 1 | 2 | 3
  description: EditorState
  hasGiftPlan: boolean
  productGiftPlanId: string
  productId?: string
  giftPlanProductId: string
  giftPlanStartedAt?: Moment | null
  giftPlanEndedAt?: Moment | null
  productLevel?: number
  listPriceCircumfix?: ListPriceCircumfix
  priceDescription?: EditorState | null
}

export type SubscriptionFieldProps = {
  title: string
  isPublished: boolean
  isParticipantsVisible: boolean
  period: { type: PeriodType; amount: number }
  remindPeriod: { type: PeriodType; amount: number }
  currencyId?: string
  listPrice: number
  sale: SaleProps
  discountDownPrice?: number
  type: 1 | 2 | 3
  description: EditorState
  hasGiftPlan: boolean
  productGiftPlanId: string
  productId?: string
  giftPlanProductId: string
  giftPlanStartedAt?: Moment | null
  giftPlanEndedAt?: Moment | null
  productLevel?: number
  listPriceCircumfix?: ListPriceCircumfix
  priceDescription?: EditorState | null
}

export type MembershipPlanModalProps = Omit<AdminModalProps, 'renderTrigger'> & {
  programId: string
  programPlan?: ProgramPlan
  onRefetch?: () => void
  onProductGiftPlanRefetch?: () => void
  renderTrigger?: React.FC<{
    onOpen?: () => void
    onClose?: () => void
  }>
  isOpen?: boolean
  setIsOpen?: (open: boolean) => void
}

export type ProgramPlanModalProps = {
  programPlanType: string
  programId: string
  programPlan: ProgramPlan
  productGiftPlan: ProductGiftPlan
  onRefetch?: () => void
  refetchProductGiftPlan: () => void
  renderTrigger?: React.FC<{
    onOpen?: () => void
    onClose?: () => void
  }>
  isOpen?: boolean
  setIsOpen?: (open: boolean) => void
}

export type MemberShipCards = {
  title: string
  id: string
}[]

export type CardProducts = {
  cardProductId: string
  cardId: string
  cardTitle: string
  targetId: string
  productType: string
}[]

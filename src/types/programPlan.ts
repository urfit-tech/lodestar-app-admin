import { AdminModalProps } from '../components/admin/AdminModal'
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

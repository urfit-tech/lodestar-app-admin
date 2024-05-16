import { ProgramPlanModalProps } from '../../../types/programPlan'
import MembershipPlanModal from './MembershipPlanModal'
import PeriodPlanModal from './PeriodPlanModal'
import PerpetualPlanModal from './PerpetualPlanModal'
import SubscriptionPlanModal from './SubscriptionPlanModal'

const ProgramPlanModal: React.FC<ProgramPlanModalProps> = ({
  programPlanType,
  programId,
  programPlan,
  productGiftPlan,
  onRefetch,
  refetchProductGiftPlan,
  isOpen,
  setIsOpen,
}) => {
  switch (programPlanType) {
    case 'perpetual':
      return (
        <PerpetualPlanModal
          onRefetch={onRefetch}
          onProductGiftPlanRefetch={refetchProductGiftPlan}
          programId={programId}
          programPlan={programPlan}
          productGiftPlan={productGiftPlan}
        />
      )

    case 'period':
      return (
        <PeriodPlanModal
          onRefetch={onRefetch}
          onProductGiftPlanRefetch={refetchProductGiftPlan}
          programId={programId}
          programPlan={programPlan}
          productGiftPlan={productGiftPlan}
        />
      )

    case 'subscription':
      return (
        <SubscriptionPlanModal
          onRefetch={onRefetch}
          onProductGiftPlanRefetch={refetchProductGiftPlan}
          programId={programId}
          programPlan={programPlan}
          productGiftPlan={productGiftPlan}
        />
      )

    case 'membership':
      return (
        <MembershipPlanModal
          onRefetch={onRefetch}
          onProductGiftPlanRefetch={refetchProductGiftPlan}
          programId={programId}
          programPlan={programPlan}
          isOpen={isOpen}
          setIsOpen={setIsOpen}
        />
      )

    default:
      return <></>
  }
}

export default ProgramPlanModal

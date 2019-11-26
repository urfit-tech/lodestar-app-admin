import { Button } from 'antd'
import { CardProps } from 'antd/lib/card'
import React, { useContext } from 'react'
import styled from 'styled-components'
import useRouter from 'use-react-router'
import { InferType } from 'yup'
import { currencyFormatter, getShortenPeriodTypeLabel } from '../../helpers'
import { useEnrolledPlanIds, useProgram, useProgramPlanEnrollment } from '../../hooks/program'
import { programPlanSchema } from '../../schemas/program'
import { useAuth } from '../auth/AuthContext'
import { AuthModalContext } from '../auth/AuthModal'
import CheckoutSubscriptionModal from '../checkout/CheckoutSubscriptionModal'
import AdminCard from '../common/AdminCard'
import { BraftContent } from '../common/StyledBraftEditor'

const StyledAdminCard = styled(AdminCard)`
  color: ${props => props.theme['@label-color']};

  header {
    margin-bottom: 20px;
    border-bottom: solid 1px #cdcdcd;
    padding-bottom: 20px;

    h2.title {
      margin: 0 0 20px;
      letter-spacing: 0.2px;
      font-size: 16px;
      font-weight: bold;
    }

    .current-price {
      margin-bottom: 8px;
      line-height: 1;
      letter-spacing: 0.35px;
      font-weight: bold;
      font-size: 28px;
      &__period {
        font-size: 16px;
      }
    }

    .exact-price {
      margin-bottom: 16px;
      display: block;
      line-height: 1.5;
      letter-spacing: 0.2px;
      font-size: 14px;
      font-weight: 500;
      color: #585858;
    }

    .original-price {
      display: block;
      color: rgba(0, 0, 0, 0.45);
      text-decoration: line-through;
      letter-spacing: 0.18px;
      font-size: 14px;
    }
  }

  .enrollment {
    padding-bottom: 12px;
    color: gray;
    text-align: right;
    font-size: 14px;
  }
`

type ProgramSubscriptionPlanCardProps = CardProps & {
  memberId: string
  programId: string
  programPlan: InferType<typeof programPlanSchema>
}
const ProgramSubscriptionPlanCard: React.FC<ProgramSubscriptionPlanCardProps> = ({
  memberId,
  programId,
  programPlan,
  ...cardProps
}) => {
  const { history } = useRouter()
  const { isAuthenticated } = useAuth()
  const { program } = useProgram(programId)
  const { programPlanIds: enrolledProgramIds } = useEnrolledPlanIds(memberId)
  const { setVisible: setAuthModalVisible } = useContext(AuthModalContext)
  const isOnSale = programPlan.soldAt && new Date() < programPlan.soldAt
  const hasFirstDiscount = Boolean(programPlan.discountDownPrice)
  const { numProgramPlanEnrollments } = useProgramPlanEnrollment(programPlan.id)
  const enrolled = enrolledProgramIds.includes(programPlan.id)
  const { salePrice, listPrice, discountDownPrice, periodType } = programPlan
  const currentPrice = isOnSale ? salePrice : listPrice

  return (
    <StyledAdminCard key={programPlan.id} {...cardProps}>
      <header>
        <h2 className="title">{programPlan.title}</h2>

        <h3 className="current-price">
          {currentPrice - discountDownPrice ? (
            <>
              <span>{currencyFormatter(currentPrice - discountDownPrice)}</span>
              <span className="current-price__period">/{getShortenPeriodTypeLabel(periodType)}</span>
            </>
          ) : (
            <span>首期免費 $ 0</span>
          )}
        </h3>

        {hasFirstDiscount && <span className="exact-price">第二期開始 {currencyFormatter(currentPrice)}</span>}

        {isOnSale && (
          <span className="original-price">
            原價 {currencyFormatter(listPrice)}/{getShortenPeriodTypeLabel(periodType)}
          </span>
        )}
      </header>
      <BraftContent>{programPlan.description}</BraftContent>
      <div className="enrollment">{numProgramPlanEnrollments}人</div>

      {program && program.isSoldOut ? (
        <Button block disabled>
          已售完
        </Button>
      ) : enrolled ? (
        <Button block onClick={() => history.push(`/programs/${programId}/contents`)}>
          進入課程
        </Button>
      ) : (
        <CheckoutSubscriptionModal
          programId={programId}
          programPlan={programPlan}
          render={({ setVisible }) => (
            <Button
              type="primary"
              block
              onClick={() => {
                if (!isAuthenticated) {
                  setAuthModalVisible && setAuthModalVisible(true)
                } else {
                  setVisible(true)
                }
              }}
            >
              立即訂閱
            </Button>
          )}
        />
      )}
    </StyledAdminCard>
  )
}

export default ProgramSubscriptionPlanCard

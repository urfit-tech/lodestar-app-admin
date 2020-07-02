import { Button, Divider, Dropdown, Icon, Menu } from 'antd'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import { currencyFormatter, dateFormatter } from '../../helpers'
import { commonMessages, promotionMessages } from '../../helpers/translation'
import { CouponPlanProps } from '../../types/checkout'
import AdminCard from '../admin/AdminCard'
import CouponPlanAdminModal from './CouponPlanAdminModal'
import CouponPlanDescriptionModal from './CouponPlanDescriptionModal'

const StyledAdminCard = styled(AdminCard)`
  position: relative;

  &::before {
    content: ' ';
    position: absolute;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background-color: #f7f8f8;
    top: 50%;
    transform: translateY(-50%);
    left: -10px;
    z-index: 999;
    box-shadow: inset rgba(0, 0, 0, 0.06) -1px 0px 5px 0px;
  }
  &::after {
    content: ' ';
    position: absolute;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background-color: #f7f8f8;
    top: 50%;
    transform: translateY(-50%);
    right: -10px;
    z-index: 999;
    box-shadow: inset rgba(0, 0, 0, 0.06) 4px 0px 5px 0px;
  }

  .ant-card-head {
    border-bottom: 0;
  }
  .ant-card-head-title {
    padding: 0;
  }
  .ant-card-body {
    padding: 14px 28px 17px 28px;
  }
  .ant-card-bordered {
    border-radius: 0px;
  }
`
const StyledTitle = styled.div`
  font-size: 20px;
  font-weight: bold;
  line-height: 1.3;
  letter-spacing: 0.77px;
`
const StyledPriceLabel = styled.span<{ active?: boolean }>`
  color: ${props => (props.active ? props.theme['@primary-color'] : 'var(--gray)')};
  font-size: 24px;
  letter-spacing: 0.2px;
`
const StyledText = styled.span<{ active?: boolean }>`
  padding: 2px 6px;
  color: ${props => (props.active ? props.theme['@primary-color'] : 'var(--gray-dark)')};
  background-color: ${props => (props.active ? props.theme['@processing-color'] : 'var(--gray-lighter)')};
  font-size: 14px;
  line-height: 1.57;
  letter-spacing: 0.4px;
`

const CouponPlanAdminCard: React.FC<{
  couponPlan: CouponPlanProps
  isAvailable?: boolean
  onRefetch?: () => void
}> = ({ couponPlan, isAvailable, onRefetch }) => {
  const { formatMessage } = useIntl()
  const [modalVisible, setModalVisible] = useState(false)

  return (
    <StyledAdminCard
      title={
        <StyledTitle className="d-flex align-items-start justify-content-between py-4">
          <span className="flex-grow-1">{couponPlan.title}</span>
          <StyledPriceLabel className="flex-shrink-0" active={isAvailable}>
            {couponPlan.type === 'cash'
              ? currencyFormatter(couponPlan.amount)
              : couponPlan.type === 'percent'
              ? `${couponPlan.amount}% off`
              : null}
          </StyledPriceLabel>
        </StyledTitle>
      }
    >
      <StyledText active={isAvailable}>
        {couponPlan.constraint
          ? formatMessage(promotionMessages.label.constraintAmount, {
              amount: currencyFormatter(couponPlan.constraint),
            })
          : formatMessage(promotionMessages.label.withoutConstraintAmount)}
        {couponPlan.type === 'cash'
          ? formatMessage(promotionMessages.label.price, {
              amount: currencyFormatter(couponPlan.amount),
            })
          : couponPlan.type === 'percent'
          ? formatMessage(promotionMessages.label.ratio, { amount: couponPlan.amount })
          : null}
      </StyledText>

      <div style={{ fontFamily: 'Roboto', fontSize: '14px', paddingTop: '12px' }}>
        {couponPlan.startedAt ? dateFormatter(couponPlan.startedAt) : formatMessage(promotionMessages.label.fromNow)}
        {' - '}
        {couponPlan.endedAt ? dateFormatter(couponPlan.endedAt) : formatMessage(promotionMessages.label.forever)}
      </div>

      <Divider className="mt-3" />

      <div className="d-flex align-items-center justify-content-between">
        <Button
          type="link"
          onClick={() => setModalVisible(true)}
          style={{
            fontSize: '14px',
            padding: 0,
            letterSpacing: '-1px',
            height: 'auto',
            paddingRight: '24px',
          }}
        >
          {formatMessage(commonMessages.ui.detail)}
        </Button>

        <Dropdown
          placement="bottomRight"
          trigger={['click']}
          overlay={
            <Menu>
              <Menu.Item>
                <CouponPlanAdminModal
                  renderTrigger={({ setVisible }) => (
                    <span onClick={() => setVisible(true)}>{formatMessage(commonMessages.ui.edit)}</span>
                  )}
                  icon={<Icon type="edit" />}
                  title={formatMessage(promotionMessages.ui.editCouponPlan)}
                  couponPlan={couponPlan}
                  onRefetch={onRefetch}
                />
              </Menu.Item>
            </Menu>
          }
        >
          <Icon type="more" />
        </Dropdown>
      </div>

      {modalVisible && (
        <CouponPlanDescriptionModal
          couponPlan={couponPlan}
          visible={modalVisible}
          onCancel={() => setModalVisible(false)}
        />
      )}
    </StyledAdminCard>
  )
}

export default CouponPlanAdminCard

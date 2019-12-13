import { Button, Divider, Dropdown, Icon, Menu } from 'antd'
import React, { useState } from 'react'
import styled from 'styled-components'
import { InferType } from 'yup'
import { currencyFormatter, dateFormatter } from '../../helpers'
import { couponPlanSchema } from '../../schemas/coupon'
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
const StyledPriceLabel = styled.span<{ outdated?: boolean }>`
  color: ${props => (props.outdated ? 'var(--gray)' : props.theme['@primary-color'])};
  font-size: 24px;
  letter-spacing: 0.2px;
`
const StyledText = styled.span<{ outdated?: boolean }>`
  padding: 2px 6px;
  color: ${props => (props.outdated ? 'var(--gray-dark)' : props.theme['@primary-color'])};
  background-color: ${props => (props.outdated ? 'var(--gray-lighter)' : props.theme['@processing-color'])};
  font-size: 14px;
  line-height: 1.57;
  letter-spacing: 0.4px;
`

const CouponPlanAdminCard: React.FC<{
  couponPlan: InferType<typeof couponPlanSchema>
  outdated?: boolean
}> = ({ couponPlan, outdated }) => {
  const [modalVisible, setModalVisible] = useState()

  return (
    <StyledAdminCard
      title={
        <StyledTitle className="d-flex align-items-start justify-content-between py-4">
          <span className="flex-grow-1">{couponPlan.title}</span>
          <StyledPriceLabel className="flex-shrink-0" outdated={outdated}>
            {couponPlan.type === 1
              ? currencyFormatter(couponPlan.amount)
              : couponPlan.type === 2
              ? couponPlan.amount % 10 === 0
                ? `${10 - couponPlan.amount / 10} 折`
                : `${100 - couponPlan.amount} 折`
              : null}
          </StyledPriceLabel>
        </StyledTitle>
      }
    >
      <StyledText outdated={outdated}>
        {couponPlan.constraint ? `消費滿 ${currencyFormatter(couponPlan.constraint)} 折抵` : `直接折抵`}
        {couponPlan.type === 1
          ? `金額 ${currencyFormatter(couponPlan.amount)} 元`
          : couponPlan.type === 2
          ? `比例 ${couponPlan.amount}%`
          : null}
      </StyledText>
      <div style={{ fontFamily: 'Roboto', fontSize: '14px', paddingTop: '12px' }}>
        {couponPlan.startedAt ? dateFormatter(couponPlan.startedAt) : '即日起'}
        {' - '}
        {couponPlan.endedAt ? dateFormatter(couponPlan.endedAt) : '無使用期限'}
      </div>

      <Divider className="mt-3" />

      <div className="d-flex align-items-center justify-content-between">
        <div>
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
            詳情
          </Button>
          <span
            style={{
              fontSize: '14px',
              color: '#9b9b9b',
              letterSpacing: '0.4px',
            }}
          >
            {`數量 ${couponPlan.count - couponPlan.remaining} / ${couponPlan.count}`}
          </span>
        </div>

        <Dropdown
          placement="bottomRight"
          overlay={
            <Menu>
              <Menu.Item>
                <CouponPlanAdminModal
                  renderTrigger={({ setVisible }) => <span onClick={() => setVisible(true)}>編輯方案</span>}
                  icon={<Icon type="edit" />}
                  title="編輯折價方案"
                  couponPlan={couponPlan}
                />
              </Menu.Item>
              {/* <Menu.Item disabled>新增折扣碼</Menu.Item>
                <Menu.Item onClick={() => message.warn("功能尚未開放")}>
                  刪除方案
                </Menu.Item> */}
            </Menu>
          }
          trigger={['click']}
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

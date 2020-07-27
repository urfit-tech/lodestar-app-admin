import Icon, { DownloadOutlined } from '@ant-design/icons'
import { Button, Modal, Tabs, Typography } from 'antd'
import { ModalProps } from 'antd/lib/modal'
import BraftEditor, { EditorState } from 'braft-editor'
import React, { useState } from 'react'
import { defineMessages, useIntl } from 'react-intl'
import styled from 'styled-components'
import { currencyFormatter, downloadCSV, toCSV } from '../../helpers'
import { commonMessages, errorMessages, promotionMessages } from '../../helpers/translation'
import { useCouponCodeCollection } from '../../hooks/checkout'
import { ReactComponent as CheckIcon } from '../../images/icon/check.svg'
import { CouponPlanProps } from '../../types/checkout'
import ProductItem from '../common/ProductItem'
import { BraftContent } from '../common/StyledBraftEditor'

const messages = defineMessages({
  allScope: { id: 'common.product.allScope', defaultMessage: '全站折抵' },
  allProgram: { id: 'common.product.allProgram', defaultMessage: '全部單次課程' },
  allProgramPlan: { id: 'common.product.allProgramPlan', defaultMessage: '全部訂閱課程' },
  allActivityTicket: { id: 'common.product.allActivityTicket', defaultMessage: '全部線下實體' },
  allPodcastProgram: { id: 'common.product.allPodcastProgram', defaultMessage: '全部廣播' },
  allPodcastPlan: { id: 'common.product.allPodcastPlan', defaultMessage: '全部廣播訂閱頻道' },
  allAppointmentPlan: { id: 'common.product.allAppointmentPlan', defaultMessage: '全部預約' },
  allMerchandise: { id: 'common.product.allMerchandise', defaultMessage: '全部商品' },
  allProjectPlan: { id: 'common.product.allProjectPlan', defaultMessage: '全部專案' },
  allProgramPackagePlan: { id: 'common.product.allProgramPackagePlan', defaultMessage: '全部課程組合' },
  otherSpecificProduct: { id: 'common.product.otherSpecificProduct', defaultMessage: '其他特定項目' },
})

const StyledModal = styled(Modal)`
  color: ${props => props.theme['@normal-color']};

  .ant-modal-header {
    border-bottom: 0px solid #e8e8e8;
  }
  .ant-modal-title {
    font-weight: bold;
  }
  .ant-modal-body {
    font-size: 14px;
    line-height: 1.57;
    letter-spacing: 0.18px;
    color: var(--gray-darker);
  }
  .ant-modal-close-x {
    color: #9b9b9b;
  }
`
const StyledModalTitle = styled.div`
  color: var(--gray-darker);
  font-size: 16px;
  font-weight: bold;
  letter-spacing: 0.2px;
`
const StyledCouponCode = styled.span`
  width: 7.5rem;
  text-align: justify;
`
const StyledTitle = styled.div`
  margin-bottom: 0.75rem;
  font-size: 16px;
  font-weight: bold;
  letter-spacing: 0.2px;
  color: var(--gray-darker);
`

const CouponPlanDescriptionModal: React.FC<
  ModalProps & {
    couponPlan: CouponPlanProps
  }
> = ({ couponPlan, ...modalProps }) => {
  const { formatMessage } = useIntl()
  const { loadingCouponCodes, errorCouponCodes, couponCodes } = useCouponCodeCollection(couponPlan.id)
  const [activeKey, setActiveKey] = useState('')
  const withDescription = !(BraftEditor.createEditorState(couponPlan.description || '') as EditorState).isEmpty()

  const exportCodes = () => {
    const data: string[][] = [
      [formatMessage(promotionMessages.term.couponCodes), formatMessage(promotionMessages.status.used), 'Email'],
    ]

    couponCodes.forEach(couponPlanCode => {
      couponPlanCode.coupons.forEach(coupon => {
        data.push([couponPlanCode.code, coupon.used ? 'v' : '', coupon.member.email])
      })

      if (couponPlanCode.remaining) {
        for (let i = 0; i < couponPlanCode.remaining; i++) {
          data.push([couponPlanCode.code, '', ''])
        }
      }
    })

    downloadCSV(`${couponPlan.title}.csv`, toCSV(data))
  }

  return (
    <StyledModal title={null} footer={null} {...modalProps}>
      <StyledModalTitle className="mb-3">{couponPlan.title}</StyledModalTitle>

      <Tabs activeKey={activeKey || 'coupon-codes'} onChange={key => setActiveKey(key)}>
        <Tabs.TabPane key="coupon-codes" tab={formatMessage(promotionMessages.term.couponCode)} className="pt-4">
          <Button type="primary" icon={<DownloadOutlined />} className="mb-4" onClick={() => exportCodes()}>
            {formatMessage(promotionMessages.ui.exportCodes)}
          </Button>

          {loadingCouponCodes ? (
            <div>{formatMessage(commonMessages.event.loading)}</div>
          ) : errorCouponCodes ? (
            <div>{formatMessage(errorMessages.data.fetch)}</div>
          ) : (
            couponCodes.map(couponPlanCode => (
              <div key={couponPlanCode.id}>
                <StyledCouponCode className="mr-3">{couponPlanCode.code}</StyledCouponCode>
                <Typography.Text strong>
                  {`${couponPlanCode.used}/${couponPlanCode.count} ${formatMessage(promotionMessages.label.unit)}`}
                </Typography.Text>
              </div>
            ))
          )}
        </Tabs.TabPane>

        <Tabs.TabPane key="rules" tab={formatMessage(promotionMessages.label.rules)} className="pt-4">
          <StyledTitle>{formatMessage(promotionMessages.label.rules)}</StyledTitle>
          <div className="mb-4">
            {couponPlan.constraint
              ? formatMessage(promotionMessages.text.constraints, {
                  total: currencyFormatter(couponPlan.constraint),
                  discount: couponPlan.type === 'cash' ? currencyFormatter(couponPlan.amount) : `${couponPlan.amount}%`,
                })
              : formatMessage(promotionMessages.text.directly, {
                  discount: couponPlan.type === 'cash' ? currencyFormatter(couponPlan.amount) : `${couponPlan.amount}%`,
                })}
          </div>

          <StyledTitle>{formatMessage(promotionMessages.label.discountTarget)}</StyledTitle>
          <div className="mb-4">
            {couponPlan.scope === null && <div>{formatMessage(messages.allScope)}</div>}
            {couponPlan.scope?.includes('Program') && (
              <div className="mb-2">
                <Icon component={() => <CheckIcon />} className="mr-2" />
                <span>{formatMessage(messages.allProgram)}</span>
              </div>
            )}
            {couponPlan.scope?.includes('ProgramPlan') && (
              <div className="mb-2">
                <Icon component={() => <CheckIcon />} className="mr-2" />
                <span>{formatMessage(messages.allProgramPlan)}</span>
              </div>
            )}
            {couponPlan.scope?.includes('ActivityTicket') && (
              <div className="mb-2">
                <Icon component={() => <CheckIcon />} className="mr-2" />
                <span>{formatMessage(messages.allActivityTicket)}</span>
              </div>
            )}
            {couponPlan.scope?.includes('PodcastProgram') && (
              <div className="mb-2">
                <Icon component={() => <CheckIcon />} className="mr-2" />
                <span>{formatMessage(messages.allPodcastProgram)}</span>
              </div>
            )}
            {couponPlan.scope?.includes('PodcastPlan') && (
              <div className="mb-2">
                <Icon component={() => <CheckIcon />} className="mr-2" />
                <span>{formatMessage(messages.allPodcastPlan)}</span>
              </div>
            )}
            {couponPlan.scope?.includes('AppointmentPlan') && (
              <div className="mb-2">
                <Icon component={() => <CheckIcon />} className="mr-2" />
                <span>{formatMessage(messages.allAppointmentPlan)}</span>
              </div>
            )}
            {couponPlan.scope?.includes('Merchandise') && (
              <div className="mb-2">
                <Icon component={() => <CheckIcon />} className="mr-2" />
                <span>{formatMessage(messages.allMerchandise)}</span>
              </div>
            )}
            {couponPlan.scope?.includes('ProjectPlan') && (
              <div className="mb-2">
                <Icon component={() => <CheckIcon />} className="mr-2" />
                <span>{formatMessage(messages.allProjectPlan)}</span>
              </div>
            )}
            {couponPlan.scope?.includes('ProgramPackagePlan') && (
              <div className="mb-2">
                <Icon component={() => <CheckIcon />} className="mr-2" />
                <span>{formatMessage(messages.allProgramPackagePlan)}</span>
              </div>
            )}
            {couponPlan.productIds && couponPlan.productIds.length > 0 && (
              <>
                <div className="mb-2">
                  <Icon component={() => <CheckIcon />} className="mr-2" />
                  <span>{formatMessage(messages.otherSpecificProduct)}</span>
                </div>
                <div className="pl-4">
                  {couponPlan.productIds.map(productId => (
                    <ProductItem key={productId} id={productId} variant="coupon-product" />
                  ))}
                </div>
              </>
            )}
          </div>
        </Tabs.TabPane>

        {withDescription && (
          <Tabs.TabPane key="description" tab={formatMessage(promotionMessages.label.description)} className="pt-4">
            <BraftContent>{couponPlan.description}</BraftContent>
          </Tabs.TabPane>
        )}
      </Tabs>
    </StyledModal>
  )
}

export default CouponPlanDescriptionModal

import { DownloadOutlined } from '@ant-design/icons'
import { Button, Tabs, Typography } from 'antd'
import BraftEditor, { EditorState } from 'braft-editor'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import { downloadCSV, toCSV } from '../../helpers'
import { commonMessages, errorMessages, promotionMessages } from '../../helpers/translation'
import { useCouponCodeCollection } from '../../hooks/checkout'
import { CouponPlanType } from '../../types/checkout'
import { ProductType } from '../../types/general'
import { BraftContent } from '../common/StyledBraftEditor'
import CouponPlanDescriptionScopeBlock from './CouponPlanDescriptionScopeBlock'

const StyledCouponCode = styled.span`
  width: 7.5rem;
  text-align: justify;
`

const CouponPlanDescriptionTabs: React.FC<{
  couponPlanId: string
  title: string
  description: string | null
  constraint: number | null
  type: CouponPlanType | null
  amount: number
  scope: ProductType[]
  productIds: string[]
}> = ({ couponPlanId, title, description, constraint, type, amount, scope, productIds }) => {
  const { formatMessage } = useIntl()
  const { loadingCouponCodes, errorCouponCodes, couponCodes } = useCouponCodeCollection(couponPlanId)
  const [activeKey, setActiveKey] = useState('')
  const withDescription = !(BraftEditor.createEditorState(description || '') as EditorState).isEmpty()

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

    downloadCSV(`${title}.csv`, toCSV(data))
  }
  return (
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
        <CouponPlanDescriptionScopeBlock
          constraint={constraint}
          type={type}
          amount={amount}
          scope={scope}
          productIds={productIds}
        />
      </Tabs.TabPane>

      {withDescription && (
        <Tabs.TabPane key="description" tab={formatMessage(promotionMessages.label.description)} className="pt-4">
          <BraftContent>{description}</BraftContent>
        </Tabs.TabPane>
      )}
    </Tabs>
  )
}

export default CouponPlanDescriptionTabs

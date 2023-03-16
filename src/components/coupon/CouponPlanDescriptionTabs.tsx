import { DownloadOutlined } from '@ant-design/icons'
import { Button, message, Tabs, Typography } from 'antd'
import BraftEditor, { EditorState } from 'braft-editor'
import { BraftContent } from 'lodestar-app-element/src/components/common/StyledBraftEditor'
import { ProductType } from 'lodestar-app-element/src/types/product'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import { downloadCSV, toCSV } from '../../helpers'
import { useCouponCode, useCouponsStatus } from '../../hooks/checkout'
import { CouponPlanType } from '../../types/checkout'
import CouponPlanDescriptionScopeBlock from './CouponPlanDescriptionScopeBlock'
import couponMessages from './translation'

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
  const { loadingCouponCodes, errorCouponCodes, couponCodes } = useCouponCode(couponPlanId)
  const couponsStatus = useCouponsStatus(couponPlanId)
  const [activeKey, setActiveKey] = useState('')
  const withDescription = !(BraftEditor.createEditorState(description || '') as EditorState).isEmpty()

  const mergedCouponCodes = couponCodes.map(couponCode => ({
    ...couponCode,
    coupons: couponCode.coupons.map(coupon => ({
      ...coupon,
      used: couponsStatus.data.find(couponStatusCoupon => couponStatusCoupon.id === coupon.id)?.used ?? false,
    })),
  }))

  const exportCodes = async () => {
    const data: string[][] = [
      [
        formatMessage(couponMessages['*'].couponCodes),
        formatMessage(couponMessages.CouponPlanDescriptionTabs.used),
        'Email',
      ],
    ]

    mergedCouponCodes.forEach(couponCode => {
      couponCode.coupons.forEach(coupon => {
        data.push([couponCode.code, coupon.used ? 'v' : '', coupon.memberEmail])
      })

      if (couponCode.remaining) {
        for (let i = 0; i < couponCode.remaining; i++) {
          data.push([couponCode.code, '', ''])
        }
      }
    })

    message.success(formatMessage(couponMessages.CouponPlanDescriptionTabs.exportSuccessfully))
    return downloadCSV(`${title}.csv`, toCSV(data))
  }
  return (
    <Tabs activeKey={activeKey || 'coupon-codes'} onChange={key => setActiveKey(key)}>
      <Tabs.TabPane
        key="coupon-codes"
        tab={formatMessage(couponMessages.CouponPlanDescriptionTabs.couponCode)}
        className="pt-4"
      >
        <Button
          type="primary"
          icon={<DownloadOutlined />}
          className="mb-4"
          onClick={exportCodes}
          loading={!!(loadingCouponCodes || errorCouponCodes || couponsStatus.loading || couponsStatus.error)}
        >
          {formatMessage(couponMessages.CouponPlanDescriptionTabs.exportCodes)}
        </Button>

        {mergedCouponCodes.map(couponPlanCode => (
          <div key={couponPlanCode.id}>
            <StyledCouponCode className="mr-3">{couponPlanCode.code}</StyledCouponCode>
            <Typography.Text strong>
              {`${couponPlanCode.count - couponPlanCode.remaining}/${couponPlanCode.count} ${formatMessage(
                couponMessages.CouponPlanDescriptionTabs.unit,
              )}`}
            </Typography.Text>
          </div>
        ))}
      </Tabs.TabPane>

      <Tabs.TabPane key="rules" tab={formatMessage(couponMessages['*'].rules)} className="pt-4">
        <CouponPlanDescriptionScopeBlock
          constraint={constraint}
          type={type}
          amount={amount}
          scope={scope}
          productIds={productIds}
        />
      </Tabs.TabPane>

      {withDescription && (
        <Tabs.TabPane
          key="description"
          tab={formatMessage(couponMessages.CouponPlanDescriptionTabs.description)}
          className="pt-4"
        >
          <BraftContent>{description}</BraftContent>
        </Tabs.TabPane>
      )}
    </Tabs>
  )
}

export default CouponPlanDescriptionTabs

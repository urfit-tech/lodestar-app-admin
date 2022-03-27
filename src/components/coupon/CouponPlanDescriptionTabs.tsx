import { DownloadOutlined } from '@ant-design/icons'
import { useApolloClient } from '@apollo/react-hooks'
import { Button, message, Tabs, Typography } from 'antd'
import BraftEditor, { EditorState } from 'braft-editor'
import gql from 'graphql-tag'
import { ProductType } from 'lodestar-app-element/src/types/product'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import hasura from '../../hasura'
import { downloadCSV, toCSV } from '../../helpers'
import { useCouponCodeCollection } from '../../hooks/checkout'
import { CouponPlanType } from '../../types/checkout'
import { BraftContent } from '../common/StyledBraftEditor'
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
  const client = useApolloClient()
  const { loadingCouponCodes, errorCouponCodes, couponCodes } = useCouponCodeCollection(couponPlanId)
  const [activeKey, setActiveKey] = useState('')
  const withDescription = !(BraftEditor.createEditorState(description || '') as EditorState).isEmpty()
  const [exporting, setExporting] = useState(false)

  const exportCodes = async () => {
    setExporting(true)

    try {
      const { data: couponCodesExport } = await client.query<
        hasura.GET_COUPON_CODE_EXPORT,
        hasura.GET_COUPON_CODE_EXPORTVariables
      >({
        query: gql`
          query GET_COUPON_CODE_EXPORT($couponPlanId: uuid!) {
            coupon_code(where: { coupon_plan: { id: { _eq: $couponPlanId } } }) {
              id
              code
              remaining
              coupons {
                id
                member {
                  id
                  email
                }
                status {
                  used
                  outdated
                }
              }
            }
          }
        `,
        variables: { couponPlanId },
      })

      const data: string[][] = [
        [
          formatMessage(couponMessages['*'].couponCodes),
          formatMessage(couponMessages.CouponPlanDescriptionTabs.used),
          'Email',
        ],
      ]

      couponCodesExport.coupon_code.forEach(v => {
        v.coupons.forEach(w => {
          data.push([v.code, w.status?.used ? 'v' : '', w.member.email])
        })

        if (v.remaining) {
          for (let i = 0; i < v.remaining; i++) {
            data.push([v.code, '', ''])
          }
        }
      })

      setExporting(false)
      message.success(formatMessage(couponMessages.CouponPlanDescriptionTabs.exportSuccessfully))
      return downloadCSV(`${title}.csv`, toCSV(data))
    } catch (error) {
      setExporting(false)
      return message.error(formatMessage(couponMessages.CouponPlanDescriptionTabs.exportFailed))
    }
  }
  return (
    <Tabs activeKey={activeKey || 'coupon-codes'} onChange={key => setActiveKey(key)}>
      <Tabs.TabPane
        key="coupon-codes"
        tab={formatMessage(couponMessages.CouponPlanDescriptionTabs.couponCode)}
        className="pt-4"
      >
        <Button
          loading={exporting}
          type="primary"
          icon={<DownloadOutlined />}
          className="mb-4"
          onClick={() => exportCodes()}
        >
          {formatMessage(couponMessages.CouponPlanDescriptionTabs.exportCodes)}
        </Button>

        {loadingCouponCodes ? (
          <div>{formatMessage(couponMessages.CouponPlanDescriptionTabs.loading)}</div>
        ) : errorCouponCodes ? (
          <div>{formatMessage(couponMessages.CouponPlanDescriptionTabs.loadingError)}</div>
        ) : (
          couponCodes.map(couponPlanCode => (
            <div key={couponPlanCode.id}>
              <StyledCouponCode className="mr-3">{couponPlanCode.code}</StyledCouponCode>
              <Typography.Text strong>
                {`${couponPlanCode.used}/${couponPlanCode.count} ${formatMessage(
                  couponMessages.CouponPlanDescriptionTabs.unit,
                )}`}
              </Typography.Text>
            </div>
          ))
        )}
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

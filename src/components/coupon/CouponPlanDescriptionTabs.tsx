import { DeleteOutlined, DownloadOutlined } from '@ant-design/icons'
import { gql, useMutation } from '@apollo/client'
import { Button, message, Tabs, Typography } from 'antd'
import BraftEditor, { EditorState } from 'braft-editor'
import { BraftContent } from 'lodestar-app-element/src/components/common/StyledBraftEditor'
import { ProductType } from 'lodestar-app-element/src/types/product'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import AdminModal from '../../components/admin/AdminModal'
import hasura from '../../hasura'
import { downloadCSV, handleError, toCSV } from '../../helpers'
import { useCouponCode, useCouponsStatus } from '../../hooks/checkout'
import { CouponPlanType } from '../../types/checkout'
import CouponPlanDescriptionScopeBlock from './CouponPlanDescriptionScopeBlock'
import couponMessages from './translation'

const StyledCouponCodeBlock = styled.div`
  display: flex;
  justify-content: space-between;
`

const StyledCouponCode = styled.span`
  text-align: justify;
`

const StyledCouponCodeAmountBlock = styled.div`
  display: flex;
  align-items: center;
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
  const { loadingCouponCodes, errorCouponCodes, couponCodes, refetchCouponCodes } = useCouponCode(couponPlanId)
  const couponsStatus = useCouponsStatus(couponPlanId)
  const [activeKey, setActiveKey] = useState('')
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [archiveCouponCode] = useMutation<hasura.ARCHIVE_COUPON_CODE, hasura.ARCHIVE_COUPON_CODEVariables>(
    ARCHIVE_COUPON_CODE,
  )
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

  const handleDeleteCouponCode = (couponCodeId: string, setVisible: (visible: boolean) => void) => {
    setDeleteLoading(true)
    archiveCouponCode({ variables: { couponCodeId: couponCodeId } })
      .then(() => {
        refetchCouponCodes()
        message.success(formatMessage(couponMessages.CouponPlanDescriptionTabs.successDeletedCouponCode), 3)
      })
      .catch(handleError)
      .finally(() => {
        setDeleteLoading(false)
        setVisible(false)
      })
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
          <StyledCouponCodeBlock key={couponPlanCode.id}>
            <StyledCouponCode>{couponPlanCode.code}</StyledCouponCode>
            <StyledCouponCodeAmountBlock>
              <Typography.Text strong>
                {`${couponPlanCode.count - couponPlanCode.remaining}/${couponPlanCode.count} ${formatMessage(
                  couponMessages.CouponPlanDescriptionTabs.unit,
                )}`}
              </Typography.Text>
              <AdminModal
                renderTrigger={({ setVisible }) => <DeleteOutlined className="ml-4" onClick={() => setVisible(true)} />}
                title={formatMessage(couponMessages.CouponPlanDescriptionTabs.deleteCouponCode)}
                footer={null}
                renderFooter={({ setVisible }) =>
                  couponPlanCode.coupons.some(coupon => coupon.used === true) ? (
                    <Button
                      type="primary"
                      loading={deleteLoading}
                      onClick={() => {
                        setVisible(false)
                      }}
                    >
                      {formatMessage(couponMessages['*'].confirm)}
                    </Button>
                  ) : (
                    <div>
                      <Button
                        className="mr-2"
                        onClick={() => {
                          setVisible(false)
                        }}
                      >
                        {formatMessage(couponMessages['*'].cancel)}
                      </Button>
                      <Button
                        type="primary"
                        danger={true}
                        loading={deleteLoading}
                        onClick={() => {
                          handleDeleteCouponCode(couponPlanCode.id, setVisible)
                        }}
                      >
                        {formatMessage(couponMessages['*'].confirm)}
                      </Button>
                    </div>
                  )
                }
              >
                <p className="mb-4">
                  {couponPlanCode.coupons.some(coupon => coupon.used === true)
                    ? formatMessage(couponMessages.CouponPlanDescriptionTabs.codeUsedMessage, {
                        couponCode: couponPlanCode.code,
                      })
                    : formatMessage(couponMessages.CouponPlanDescriptionTabs.deleteCodeMessage, {
                        couponCode: couponPlanCode.code,
                      })}
                </p>
              </AdminModal>
            </StyledCouponCodeAmountBlock>
          </StyledCouponCodeBlock>
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

const ARCHIVE_COUPON_CODE = gql`
  mutation ARCHIVE_COUPON_CODE($couponCodeId: uuid!) {
    update_coupon_code(where: { id: { _eq: $couponCodeId } }, _set: { deleted_at: "now()" }) {
      affected_rows
    }
  }
`

export default CouponPlanDescriptionTabs

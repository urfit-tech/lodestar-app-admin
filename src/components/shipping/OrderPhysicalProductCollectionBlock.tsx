import { gql, useMutation } from '@apollo/client'
import { Button, Divider, message, Spin } from 'antd'
import { UploadFile } from 'antd/lib/upload/interface'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import moment from 'moment-timezone'
import { default as React, useState } from 'react'
import { defineMessages, useIntl } from 'react-intl'
import styled from 'styled-components'
import MultipleUploader, { StyledFileBlock } from '../../components/common/MultipleUploader'
import hasura from '../../hasura'
import { handleError } from '../../helpers'
import { commonMessages, merchandiseMessages } from '../../helpers/translation'
import { useSimpleProduct } from '../../hooks/data'
import { ReactComponent as CalendarOIcon } from '../../images/default/calendar-alt-o.svg'
import EmptyCover from '../../images/default/empty-cover.png'
import { InvoiceProps, ShippingProps } from '../../types/merchandise'
import AdminCard from '../admin/AdminCard'
import { CustomRatioImage } from '../common/Image'
import OrderContactModal from './OrderContactModal'
import ShippingInfoModal from './ShippingInfoModal'
import ShippingNoticeModal from './ShippingNoticeModal'

const messages = defineMessages({
  purchase: { id: 'merchandise.text.purchase', defaultMessage: '購買' },
  seller: { id: 'merchandise.ui.seller', defaultMessage: '賣家通知' },
  deliveryItem: { id: 'merchandise.label.deliveryItem', defaultMessage: '交付：' },
})

const StyledOrderTitle = styled.h3`
  color: var(--gray-darker);
  font-size: 18px;
  font-weight: bold;
  letter-spacing: 0.8px;
`
export const StyledDate = styled.div`
  color: var(--gray-dark);
  font-size: 14px;
  letter-spacing: 0.4px;
`
const StyledSpecification = styled.div`
  color: var(--gray-darker);
  letter-spacing: 0.2px;
`
const StyledShippingInfo = styled.div``

const OrderPhysicalProductCollectionBlock: React.FC<{
  orderPhysicalProductLogs: {
    id: string
    createdAt: Date
    updatedAt: Date
    deliveredAt: Date
    lastPaidAt: Date
    deliverMessage: string | null
    shipping: ShippingProps | null
    invoice: InvoiceProps
    orderPhysicalProducts: {
      key: string
      id: string
      name: string
      productId: string
      quantity: number
      files: UploadFile[]
    }[]
  }[]
  onRefetch?: () => void
}> = ({ orderPhysicalProductLogs, onRefetch }) => {
  const { formatMessage } = useIntl()
  const { enabledModules } = useApp()

  return (
    <div className="pt-4">
      {orderPhysicalProductLogs.length ? (
        orderPhysicalProductLogs.map(orderLog => (
          <AdminCard key={orderLog.id} className="mb-3">
            <StyledShippingInfo className="d-lg-flex justify-content-between">
              <div>
                <StyledOrderTitle className="mb-2">
                  {`${formatMessage(commonMessages.label.orderLogId)} ${orderLog.id}`}
                </StyledOrderTitle>

                {orderLog.lastPaidAt && (
                  <StyledDate className="mb-4 d-flex align-items-center">
                    <CalendarOIcon className="mr-2" />
                    {`${moment(orderLog.lastPaidAt).format('YYYY-MM-DD HH:mm')} ${formatMessage(messages.purchase)}`}
                  </StyledDate>
                )}

                {orderLog.shipping?.specification ? (
                  <StyledSpecification className="mb-2">{orderLog.shipping?.specification}</StyledSpecification>
                ) : null}
              </div>

              <div>
                <span className="mr-2">
                  {enabledModules.order_contact && <OrderContactModal orderId={orderLog.id} />}
                </span>
                <span className="mr-2">
                  <ShippingInfoModal shipping={orderLog.shipping} invoice={orderLog.invoice} />
                </span>
                <span>
                  <ShippingNoticeModal
                    orderLogId={orderLog.id}
                    deliveredAt={orderLog.deliveredAt}
                    deliverMessage={orderLog.deliverMessage}
                    onRefetch={onRefetch}
                  />
                </span>
              </div>
            </StyledShippingInfo>

            {orderLog.orderPhysicalProducts.map(orderPhysicalProduct => (
              <ShippingProductItem
                key={orderPhysicalProduct.id}
                productId={orderPhysicalProduct.productId}
                quantity={orderPhysicalProduct.quantity}
                orderProductId={orderPhysicalProduct.id}
                productFiles={orderPhysicalProduct.files}
              />
            ))}
          </AdminCard>
        ))
      ) : (
        <div className="container d-flex align-items-center">
          <div>{formatMessage(merchandiseMessages.text.noMatchingItems)}</div>
        </div>
      )}
    </div>
  )
}

const StyledQuantity = styled.div`
  color: var(--gray-darker);
  font-size: 14px;
  line-height: 1.71;
  letter-spacing: 0.4px;
`
const StyledButtonWrapper = styled.div`
  position: absolute;
  top: 20px;
  right: -100px;
  @media (max-width: 767px) {
    top: 10px;
    right: 0px;
  }
`
const StyledSpace = styled.div`
  @media (min-width: 768px) {
    width: 100px;
  }
`
const StyledUploaderWrapper = styled.div`
  position: relative;

  & ${StyledFileBlock}:nth-child(n) {
    margin-top: 0 !important;
  }
  & ${StyledFileBlock}:nth-child(2) {
    margin-top: 1.5rem !important;
  }
`

const ShippingProductItem: React.FC<{
  orderProductId: string
  productId: string
  quantity: number
  productFiles: UploadFile[]
}> = ({ orderProductId, productId, quantity, productFiles }) => {
  const { formatMessage } = useIntl()
  const { id: appId } = useApp()
  const { loading, target } = useSimpleProduct(productId, {})
  const updateOrderProductFiles = useUpdateOrderProductFiles(orderProductId)
  const filesRef = React.useRef<UploadFile[]>([])
  const [files, setFiles] = useState<UploadFile[]>(productFiles || [])

  if (loading || !target) {
    return <Spin />
  }

  filesRef.current = files

  return (
    <div>
      <Divider />

      <div
        className={'d-flex ' + (!target.isPhysical && target.isCustomized ? 'align-items-start' : 'align-items-center')}
      >
        <CustomRatioImage
          width="64px"
          ratio={1}
          src={target.coverUrl || EmptyCover}
          shape="rounded"
          className="mr-3 flex-shrink-0"
        />

        {!target.isPhysical && target.isCustomized ? (
          <div className="flex-grow-1">
            <span>{target.title}</span>
            <div className="d-flex">
              <div className="mt-3">{formatMessage(messages.deliveryItem)}</div>
              <StyledUploaderWrapper className="flex-grow-1 mt-sm-n5 pt-2">
                <MultipleUploader
                  renderTrigger={({ loading }) => (
                    <StyledButtonWrapper>
                      <Button loading={loading} disabled={loading}>
                        {formatMessage(commonMessages.ui.upload)}
                      </Button>
                    </StyledButtonWrapper>
                  )}
                  path={`merchandise_files/${appId}/${orderProductId}`}
                  fileList={files}
                  onSetFileList={setFiles}
                  onSuccess={() => {
                    updateOrderProductFiles(
                      filesRef.current.map(v => ({
                        order_product_id: orderProductId,
                        data: v,
                      })),
                    )
                      .then(() => {
                        message.success(formatMessage(commonMessages.event.successfullyUpload))
                      })
                      .catch(handleError)
                  }}
                  onDelete={value => {
                    value &&
                      updateOrderProductFiles(
                        files
                          .filter(file => file.uid !== value.uid)
                          .map(v => ({
                            order_product_id: orderProductId,
                            data: v,
                          })),
                      ).catch(handleError)
                  }}
                />
              </StyledUploaderWrapper>
              <StyledSpace />
            </div>
          </div>
        ) : (
          <>
            <div className="flex-grow-1">{target.title}</div>
            <StyledQuantity className="px-4">x{quantity}</StyledQuantity>
          </>
        )}
      </div>
    </div>
  )
}

const useUpdateOrderProductFiles = (orderProductId: string) => {
  const [updateFiles] = useMutation<hasura.UPDATE_ORDER_PRODUCT_FILES, hasura.UPDATE_ORDER_PRODUCT_FILESVariables>(gql`
    mutation UPDATE_ORDER_PRODUCT_FILES(
      $orderProductId: uuid!
      $orderProductFiles: [order_product_file_insert_input!]!
    ) {
      delete_order_product_file(where: { order_product_id: { _eq: $orderProductId } }) {
        affected_rows
      }
      insert_order_product_file(objects: $orderProductFiles) {
        affected_rows
      }
    }
  `)

  return (orderProductFiles: { order_product_id: string; data: UploadFile }[]) =>
    updateFiles({
      variables: {
        orderProductId,
        orderProductFiles,
      },
    })
}

export default OrderPhysicalProductCollectionBlock

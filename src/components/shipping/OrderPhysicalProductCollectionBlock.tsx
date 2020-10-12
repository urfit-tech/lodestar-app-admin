import { useMutation } from '@apollo/react-hooks'
import { Divider, message, Spin } from 'antd'
import { UploadFile } from 'antd/lib/upload/interface'
import gql from 'graphql-tag'
import moment from 'moment-timezone'
import { default as React, useContext, useState } from 'react'
import { defineMessages, useIntl } from 'react-intl'
import styled from 'styled-components'
import MultipleUploader, { StyledCloseOutlines, StyledFileBlock } from '../../components/common/MultipleUploader'
import AppContext from '../../contexts/AppContext'
import { handleError } from '../../helpers'
import { commonMessages } from '../../helpers/translation'
import { useSimpleProduct } from '../../hooks/data'
import { ReactComponent as CalendarOIcon } from '../../images/default/calendar-alt-o.svg'
import EmptyCover from '../../images/default/empty-cover.png'
import types from '../../types'
import { InvoiceProps, ShippingProps } from '../../types/merchandise'
import AdminCard from '../admin/AdminCard'
import { CustomRatioImage } from '../common/Image'
import ShippingInfoModal from './ShippingInfoModal'
import ShippingNoticeModal from './ShippingNoticeModal'

const messages = defineMessages({
  purchase: { id: 'merchandise.text.purchase', defaultMessage: '購買' },
  seller: { id: 'merchandise.ui.seller', defaultMessage: '賣家通知' },
  deliver: { id: 'merchandise.label.deliveryItem', defaultMessage: '交付' },
  noMatchingItems: { id: 'merchandise.text.noMatchingItems', defaultMessage: '沒有任何符合項目' },
  uploadFile: { id: 'common.ui.uploadFile', defaultMessage: '上傳' },
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
    deliverMessage: string | null
    shipping: ShippingProps
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
  searchText?: string
  onRefetch?: () => void
}> = ({ orderPhysicalProductLogs, searchText, onRefetch }) => {
  const { formatMessage } = useIntl()

  if (searchText) {
    orderPhysicalProductLogs = orderPhysicalProductLogs.filter(orderPhysicalProductLog =>
      orderPhysicalProductLog.orderPhysicalProducts.some(
        orderPhysicalProduct => !searchText || orderPhysicalProduct.key.toLowerCase().includes(searchText),
      ),
    )
  }

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

                {orderLog.updatedAt && (
                  <StyledDate className="mb-4 d-flex align-items-center">
                    <CalendarOIcon className="mr-2" />
                    {`${moment(orderLog.updatedAt).format('YYYY-MM-DD HH:mm')} ${formatMessage(messages.purchase)}`}
                  </StyledDate>
                )}

                {orderLog?.shipping?.specification ? (
                  <StyledSpecification className="mb-2">{orderLog.shipping.specification}</StyledSpecification>
                ) : null}
              </div>

              <div>
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
          <div>{formatMessage(messages.noMatchingItems)}</div>
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
const StyledProductItem = styled.div<{ isPhysicalCustomized: boolean | undefined }>`
  align-items: ${props => (props.isPhysicalCustomized ? 'flex-start' : 'center')} !important;
`
const StyledFilesWrapper = styled.div`
  @media (min-width: 576px) {
    display: flex !important;
  }
`

const ShippingProductItem: React.FC<{
  orderProductId: string
  productId: string
  quantity: number
  productFiles: UploadFile[]
}> = ({ orderProductId, productId, quantity, productFiles }) => {
  const { formatMessage } = useIntl()
  const { loading, target } = useSimpleProduct(productId, {})
  const updateOrderProductFiles = useUpdateOrderProductFiles(orderProductId)
  const [uploading, setUploading] = useState(false)
  const { id: appId } = useContext(AppContext)
  const [files, setFiles] = useState<UploadFile[]>(productFiles || [])
  if (loading || !target) {
    return <Spin />
  }
  const duplicateName = (file: UploadFile) => {
    const getFileName = (fileName: string) => (/^([^.()]+)(.+)?$/.exec(fileName) || [])[1]
    const getFileFormat = (fileName: string) => fileName.substring(fileName.indexOf('.', 0))

    if (files.some(oldFile => oldFile.name === file.name)) {
      return `${getFileName(file.name)}(${
        Math.max(
          ...files
            .filter(oldFile => getFileFormat(oldFile.name) === getFileFormat(file.name))
            .filter(oldFile => getFileName(oldFile.name) === getFileName(file.name))
            .map(oldFile => (/\((\d*)\)/.exec(oldFile.name) || [])[1])
            .map(oldFileIndex => parseInt(oldFileIndex || '0')),
        ) + 1
      })${getFileFormat(file.name)}`
    }

    return file.name
  }
  return (
    <div>
      <Divider />

      <StyledProductItem className="d-flex" isPhysicalCustomized={!target?.is_physical && target?.is_customized}>
        <CustomRatioImage
          width="64px"
          ratio={1}
          src={target.coverUrl || EmptyCover}
          shape="rounded"
          className="mr-3 flex-shrink-0"
        />
        <div className="flex-grow-1">
          {target.title}
          {!target?.is_physical && target?.is_customized && (
            <StyledFilesWrapper className="mt-2">
              <span className="pt-2 mt-2">{formatMessage(messages.deliver)}：</span>
              <div className="flex-grow-1 mr-md-4">
                {files?.map(file => (
                  <StyledFileBlock key={file.uid} className="d-flex align-items-center justify-content-between mt-2">
                    <div>
                      <span className="mr-2">{file.name}</span>
                    </div>
                    <StyledCloseOutlines
                      className={uploading ? 'd-none' : ''}
                      onClick={() => {
                        setUploading(true)
                        updateOrderProductFiles({
                          orderProductFiles: files
                            .filter(oldFile => oldFile.uid !== file.uid)
                            .map(v => ({
                              order_product_id: orderProductId,
                              data: v,
                            })),
                        })
                          .then(() => {
                            setFiles(files.filter(oldFile => oldFile.uid !== file.uid))
                            message.success(formatMessage(commonMessages.ui.deleted))
                          })
                          .finally(() => setUploading(false))
                      }}
                    />
                  </StyledFileBlock>
                ))}
              </div>
            </StyledFilesWrapper>
          )}
        </div>
        {!target?.is_physical && target?.is_customized ? (
          <MultipleUploader
            path={`merchandise_customized_files/${appId}/${target.id}`}
            fileList={[]}
            onSetFileList={() => {}}
            uploadText={formatMessage(messages.uploadFile)}
            onUploading={() => setUploading(true)}
            onSuccess={info => {
              setFiles([
                ...files,
                {
                  ...info.file,
                  name: duplicateName(info.file),
                },
              ])
              updateOrderProductFiles({
                orderProductFiles: [
                  ...files.map(v => ({
                    order_product_id: orderProductId,
                    data: v,
                  })),
                  {
                    order_product_id: orderProductId,
                    data: {
                      ...info.file,
                      name: duplicateName(info.file),
                    },
                  },
                ],
              })
                .then(() => {
                  message.success(formatMessage(commonMessages.event.successfullyUpload))
                })
                .finally(() => setUploading(false))
            }}
            onError={() => setUploading(false)}
          />
        ) : (
          <StyledQuantity className="px-4">x{quantity}</StyledQuantity>
        )}
      </StyledProductItem>
    </div>
  )
}

const useUpdateOrderProductFiles = (orderProductId: string) => {
  const [updateFiles] = useMutation<types.UPDATE_ORDER_PRODUCT_FILES, types.UPDATE_ORDER_PRODUCT_FILESVariables>(gql`
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

  const updateOrderProductFiles: (data: {
    orderProductFiles: {
      order_product_id: string
      data: UploadFile
    }[]
  }) => Promise<void> = async ({ orderProductFiles }) => {
    console.log(orderProductFiles)
    try {
      await updateFiles({
        variables: {
          orderProductId,
          orderProductFiles,
        },
      })
    } catch (error) {
      handleError(error)
    }
  }

  return updateOrderProductFiles
}

export default OrderPhysicalProductCollectionBlock

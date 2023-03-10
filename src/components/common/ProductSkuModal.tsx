import { useMutation } from '@apollo/react-hooks'
import { Button, Checkbox, Form, Input, message } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import gql from 'graphql-tag'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import { flatten, mergeAll } from 'ramda'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import hasura from '../../hasura'
import { handleError } from '../../helpers'
import { commonMessages } from '../../helpers/translation'
import { useProductChannelInfo, useUpsertProductChannel } from '../../hooks/channel'
import { useProductSku } from '../../hooks/data'
import AdminModal, { AdminModalProps } from '../admin/AdminModal'

type FieldProps = {
  sku?: string
} & { [key: string]: string }

const ProductSkuModal: React.FC<
  Omit<AdminModalProps, 'renderTrigger'> & {
    productId: string
    onRefetch?: () => void
    renderTrigger?: React.FC<{
      sku: string | null
      onOpen?: () => void
      onClose?: () => void
    }>
    renderTitle?: () => React.ReactNode
    renderInputLabel?: () => React.ReactNode
  }
> = ({ productId, onRefetch, renderTrigger, renderTitle, renderInputLabel, ...modalProps }) => {
  const { formatMessage } = useIntl()
  const { id: appId } = useApp()
  const [form] = useForm<FieldProps>()
  const [loading, setLoading] = useState(false)
  const { loadingProduct, product, refetchProduct } = useProductSku(productId)
  const [updateProductSku] = useMutation<hasura.UPDATE_PRODUCT_SKU, hasura.UPDATE_PRODUCT_SKUVariables>(
    UPDATE_PRODUCT_SKU,
  )
  const { productChannelInfo, loadingProductChannelInfo, refetchProductChannelInfo } = useProductChannelInfo(
    appId,
    productId,
  )
  const { upsertProductChannel } = useUpsertProductChannel()

  if (loadingProduct || loadingProductChannelInfo) {
    return <></>
  }

  const initialChannelSkuList = productChannelInfo?.map(v => ({ [v.appChannelId]: v.channelSku })) || []
  const initialValues = mergeAll(
    flatten([
      {
        sku: product?.sku,
      },
      initialChannelSkuList,
    ]),
  )
  const handleSubmit = (callback?: { onSuccess?: () => void }) => {
    form
      .validateFields()
      .then(() => {
        setLoading(true)
        const { sku } = form.getFieldsValue()
        updateProductSku({
          variables: {
            productId,
            sku: sku || null,
          },
        })
          .then(() => {
            const formValues = form.getFieldsValue()
            const channelIds = Object.keys(formValues).filter(key => key !== 'sku')
            const productChannelList = channelIds.map(id => ({
              product_id: productId,
              app_id: appId,
              channel_id: id,
              channel_sku: formValues[id] || null,
            }))
            return upsertProductChannel({
              variables: {
                productChannel: productChannelList,
              },
            })
          })
          .then(() => {
            callback?.onSuccess?.()
            onRefetch?.()
            refetchProduct()
            refetchProductChannelInfo()
          })
          .catch(handleError)
          .finally(() => setLoading(false))
      })
      .catch(() => {})
  }

  return (
    <AdminModal
      title={renderTitle?.() || formatMessage(commonMessages.label.skuSetting)}
      footer={null}
      renderFooter={({ setVisible }) => (
        <>
          <Button className="mr-2" onClick={() => setVisible(false)}>
            {formatMessage(commonMessages.ui.cancel)}
          </Button>
          <Button
            type="primary"
            loading={loading}
            onClick={() =>
              handleSubmit({
                onSuccess: () => {
                  message.success(formatMessage(commonMessages.event.successfullySaved))
                  setVisible(false)
                },
              })
            }
          >
            {formatMessage(commonMessages.ui.confirm)}
          </Button>
        </>
      )}
      // TODO: too difficult to understand
      renderTrigger={({ setVisible }) => {
        return (
          renderTrigger?.({
            sku: product?.sku || null,
            onOpen: () => setVisible(true),
            onClose: () => setVisible(false),
          }) || null
        )
      }}
      {...modalProps}
    >
      <Form form={form} colon={false} layout="vertical" hideRequiredMark initialValues={initialValues}>
        <Form.Item label={renderInputLabel?.() || formatMessage(commonMessages.label.sku)} name="sku">
          <Input />
        </Form.Item>
        <Form.Item label={formatMessage(commonMessages.label.appChannel)}>
          {productChannelInfo?.map(v => (
            <ChannelCheckbox
              key={v.appChannelId}
              channelId={v.appChannelId}
              name={v.appChannelName}
              channelSku={v.channelSku}
            />
          ))}
        </Form.Item>
      </Form>
    </AdminModal>
  )
}

const ChannelCheckbox: React.VFC<{ channelId: string; name: string; channelSku: string | null }> = ({
  channelId,
  name,
  channelSku,
}) => {
  const { formatMessage } = useIntl()
  const [isChecked, setIsChecked] = useState(channelSku ? true : false)

  return (
    <>
      <Checkbox className="mb-1" defaultChecked={isChecked} onChange={v => setIsChecked(v.target.checked)}>
        {name}
      </Checkbox>
      {isChecked && (
        <Form.Item name={channelId}>
          <Input placeholder={formatMessage(commonMessages.placeholder.enterChannelSku)} />
        </Form.Item>
      )}
    </>
  )
}

const UPDATE_PRODUCT_SKU = gql`
  mutation UPDATE_PRODUCT_SKU($productId: String, $sku: String) {
    update_product(where: { id: { _eq: $productId } }, _set: { sku: $sku }) {
      affected_rows
    }
  }
`

export default ProductSkuModal

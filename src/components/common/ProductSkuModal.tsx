import { useMutation } from '@apollo/react-hooks'
import { Button, Form, Input, message } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import gql from 'graphql-tag'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import hasura from '../../hasura'
import { handleError } from '../../helpers'
import { commonMessages } from '../../helpers/translation'
import { useProductSku } from '../../hooks/data'
import AdminModal, { AdminModalProps } from '../admin/AdminModal'

type FieldProps = {
  sku?: string
}

const ProgramPlanAdminModal: React.FC<
  AdminModalProps & {
    productId: string
    onRefetch?: () => void
  }
> = ({ productId, onRefetch, ...modalProps }) => {
  const { formatMessage } = useIntl()
  const [form] = useForm<FieldProps>()
  const [loading, setLoading] = useState(false)
  const { loadingProduct, product } = useProductSku(productId)
  const [upsertProductSku] = useMutation<hasura.UPDATE_PRODUCT_SKU, hasura.UPDATE_PRODUCT_SKUVariables>(
    UPDATE_PRODUCT_SKU,
  )

  if (loadingProduct) {
    return <></>
  }

  const handleSubmit = (callback?: { onSuccess?: () => void }) => {
    form
      .validateFields()
      .then(() => {
        setLoading(true)
        const { sku } = form.getFieldsValue()
        upsertProductSku({
          variables: {
            productId,
            sku: sku || null,
          },
        })
          .then(() => {
            callback?.onSuccess?.()
            onRefetch?.()
          })
          .catch(handleError)
          .finally(() => setLoading(false))
      })
      .catch(() => {})
  }

  return (
    <AdminModal
      title={formatMessage(commonMessages.label.skuSetting)}
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
      {...modalProps}
    >
      <Form
        form={form}
        colon={false}
        hideRequiredMark
        initialValues={{
          sku: product?.sku,
        }}
      >
        <Form.Item label={formatMessage(commonMessages.label.sku)} name="sku">
          <Input />
        </Form.Item>
      </Form>
    </AdminModal>
  )
}

const UPDATE_PRODUCT_SKU = gql`
  mutation UPDATE_PRODUCT_SKU($productId: String, $sku: String) {
    update_product(where: { id: { _eq: $productId } }, _set: { sku: $sku }) {
      affected_rows
    }
  }
`

export default ProgramPlanAdminModal

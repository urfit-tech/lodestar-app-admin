import { useMutation } from '@apollo/react-hooks'
import { Button, Divider, Form, Input, message } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import gql from 'graphql-tag'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import { handleError } from '../../helpers'
import { commonMessages, errorMessages, merchandiseMessages } from '../../helpers/translation'
import { ReactComponent as PlusIcon } from '../../images/icon/plus.svg'
import { ReactComponent as TrashOIcon } from '../../images/icon/trash-o.svg'
import types from '../../types'
import { MerchandiseProps, MerchandiseSpecProps } from '../../types/merchandise'
import CurrencyInput from '../form/CurrencyInput'

const StyledLabel = styled.div`
  font-size: 14px;
`
const StyledDeleteButton = styled(Button)`
  margin-top: 33px;
`

const MerchandiseSpecForm: React.FC<{
  merchandise: MerchandiseProps
  merchandiseId: string
  onRefetch?: () => void
}> = ({ merchandise, merchandiseId, onRefetch }) => {
  const { formatMessage } = useIntl()
  const [form] = useForm()
  const [insertMerchandiseSpecCollection] = useMutation<
    types.INSERT_MERCHANDISE_SPEC_COLLECTION,
    types.INSERT_MERCHANDISE_SPEC_COLLECTIONVariables
  >(INSERT_MERCHANDISE_SPEC_COLLECTION)
  const [loading, setLoading] = useState(false)

  const handleSubmit = (values: any) => {
    setLoading(true)
    insertMerchandiseSpecCollection({
      variables: values.specs.map((spec: MerchandiseSpecProps) => ({
        id: spec.id || undefined,
        title: spec.title,
        listPrice: spec.listPrice || 0,
        salePrice: spec.salePrice || null,
        quota: spec.quota || undefined,
      })),
    })
      .then(() => {
        onRefetch && onRefetch()
        message.success(formatMessage(commonMessages.event.successfullySaved))
      })
      .catch(handleError)
      .finally(() => setLoading(false))
  }

  return (
    <Form
      form={form}
      layout="vertical"
      colon={false}
      hideRequiredMark
      initialValues={{
        specs:
          merchandise.specs.length === 0
            ? [
                {
                  title: '',
                  listPrice: 0,
                  salePrice: null,
                },
              ]
            : merchandise.specs,
      }}
      onFinish={handleSubmit}
    >
      <Form.List name="specs">
        {(fields, { add, remove }) => (
          <>
            {fields.map((field, index) => (
              <>
                {index !== 0 && <Divider className="my-4" />}
                <div key={field.key} className="d-flex justify-content-start">
                  <Form.Item
                    name={[field.name, 'title']}
                    fieldKey={[field.fieldKey, 'title']}
                    label={<StyledLabel>{formatMessage(merchandiseMessages.label.specTitle)}</StyledLabel>}
                    rules={[
                      {
                        required: true,
                        message: formatMessage(errorMessages.form.isRequired, {
                          field: formatMessage(merchandiseMessages.label.specTitle),
                        }),
                      },
                    ]}
                    className="mb-0 mr-3"
                  >
                    <Input style={{ width: '320px' }} />
                  </Form.Item>
                  <Form.Item
                    name={[field.name, 'listPrice']}
                    fieldKey={[field.fieldKey, 'listPrice']}
                    label={<StyledLabel>{formatMessage(commonMessages.term.listPrice)}</StyledLabel>}
                    className="mb-0 mr-3"
                    required
                  >
                    <CurrencyInput noUnit />
                  </Form.Item>
                  <Form.Item
                    name={[field.name, 'salePrice']}
                    fieldKey={[field.fieldKey, 'salePrice']}
                    label={<StyledLabel>{formatMessage(merchandiseMessages.label.specSalePrice)}</StyledLabel>}
                    className="mb-0"
                  >
                    <CurrencyInput noUnit />
                  </Form.Item>
                  {fields.length > 1 && (
                    <div className="flex-grow-1 text-right">
                      <StyledDeleteButton type="link" icon={<TrashOIcon />} onClick={() => remove(field.name)} />
                    </div>
                  )}
                </div>
              </>
            ))}

            <Button type="link" icon={<PlusIcon />} className="my-4" onClick={() => add({ listPrice: 0 })}>
              {formatMessage(merchandiseMessages.ui.addSpec)}
            </Button>
          </>
        )}
      </Form.List>

      <div>
        <Button onClick={() => form.resetFields()} className="mr-2">
          {formatMessage(commonMessages.ui.cancel)}
        </Button>
        <Button type="primary" htmlType="submit" loading={loading}>
          {formatMessage(commonMessages.ui.save)}
        </Button>
      </div>
    </Form>
  )
}

const INSERT_MERCHANDISE_SPEC_COLLECTION = gql`
  mutation INSERT_MERCHANDISE_SPEC_COLLECTION($data: [merchandise_spec_insert_input!]!) {
    insert_merchandise_spec(
      objects: $data
      on_conflict: { constraint: merchandise_spec_pkey, update_columns: [title, list_price, sale_price, quota] }
    ) {
      affected_rows
    }
  }
`

export default MerchandiseSpecForm

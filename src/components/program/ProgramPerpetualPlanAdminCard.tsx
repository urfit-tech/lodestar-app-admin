import { Form } from '@ant-design/compatible'
import { FormComponentProps } from '@ant-design/compatible/lib/form'
import { useMutation } from '@apollo/react-hooks'
import { Button, InputNumber, message } from 'antd'
import gql from 'graphql-tag'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import { handleError } from '../../helpers'
import { commonMessages, errorMessages } from '../../helpers/translation'
import types from '../../types'
import { ProgramProps } from '../../types/program'
import AdminCard from '../admin/AdminCard'
import SaleInput from '../admin/SaleInput'

type ProgramPerpetualPlanAdminCardProps = FormComponentProps & {
  program: ProgramProps
  onRefetch?: () => void
}
const ProgramPerpetualPlanAdminCard: React.FC<ProgramPerpetualPlanAdminCardProps> = ({ program, onRefetch, form }) => {
  const { formatMessage } = useIntl()
  const [updateProgram] = useMutation<
    types.UPDATE_PROGRAM_PERPETUAL_PLAN,
    types.UPDATE_PROGRAM_PERPETUAL_PLANVariables
  >(UPDATE_PROGRAM_PERPETUAL_PLAN)

  const [loading, setLoading] = useState(false)

  const handleSubmit = () => {
    form.validateFields((errors, values) => {
      if (errors) {
        return
      }

      setLoading(true)
      updateProgram({
        variables: {
          programId: program.id,
          listPrice: values.listPrice || 0,
          salePrice: values.sale ? values.sale.price : null,
          soldAt: values.sale ? values.sale.soldAt : null,
        },
      })
        .then(() => {
          message.success(formatMessage(commonMessages.event.successfullySaved))
          onRefetch && onRefetch()
        })
        .catch(handleError)
        .finally(() => setLoading(false))
    })
  }

  return (
    <AdminCard>
      <Form
        hideRequiredMark
        colon={false}
        onSubmit={e => {
          e.preventDefault()
          handleSubmit()
        }}
      >
        <Form.Item label={formatMessage(commonMessages.term.listPrice)}>
          {form.getFieldDecorator('listPrice', {
            initialValue: program.listPrice || 0,
            rules: [
              {
                required: true,
                message: formatMessage(errorMessages.form.isRequired, {
                  field: formatMessage(commonMessages.term.listPrice),
                }),
              },
              {
                type: 'number',
              },
            ],
          })(
            <InputNumber
              min={0}
              formatter={value => `NT$ ${value}`}
              parser={value => (value ? value.replace(/\D/g, '') : '')}
            />,
          )}
        </Form.Item>

        <Form.Item>
          {form.getFieldDecorator('sale', {
            initialValue: program.soldAt
              ? {
                  price: program.salePrice,
                  soldAt: program.soldAt,
                }
              : null,
            rules: [{ validator: (rule, value, callback) => callback((value && !value.soldAt) || undefined) }],
          })(<SaleInput />)}
        </Form.Item>

        <div>
          <Button disabled={loading} onClick={() => form.resetFields()} className="mr-2">
            {formatMessage(commonMessages.ui.cancel)}
          </Button>
          <Button loading={loading} type="primary" htmlType="submit">
            {formatMessage(commonMessages.ui.save)}
          </Button>
        </div>
      </Form>
    </AdminCard>
  )
}

const UPDATE_PROGRAM_PERPETUAL_PLAN = gql`
  mutation UPDATE_PROGRAM_PERPETUAL_PLAN(
    $programId: uuid!
    $listPrice: numeric
    $salePrice: numeric
    $soldAt: timestamptz
  ) {
    update_program(
      where: { id: { _eq: $programId } }
      _set: { list_price: $listPrice, sale_price: $salePrice, sold_at: $soldAt }
    ) {
      affected_rows
    }
  }
`

export default Form.create<ProgramPerpetualPlanAdminCardProps>()(ProgramPerpetualPlanAdminCard)

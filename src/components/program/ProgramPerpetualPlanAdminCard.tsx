import { useMutation } from '@apollo/react-hooks'
import { Button, Checkbox, DatePicker, Icon, InputNumber, message } from 'antd'
import Form, { FormComponentProps } from 'antd/lib/form'
import gql from 'graphql-tag'
import moment from 'moment'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import { handleError } from '../../helpers'
import { commonMessages, errorMessages } from '../../helpers/translation'
import types from '../../types'
import { ProgramType } from '../../types/program'
import AdminCard from '../admin/AdminCard'

const StyledIcon = styled(Icon)`
  color: #ff7d62;
`

type ProgramPerpetualPlanAdminCardProps = FormComponentProps & {
  program: ProgramType
  onRefetch?: () => void
}
const ProgramPerpetualPlanAdminCard: React.FC<ProgramPerpetualPlanAdminCardProps> = ({ program, onRefetch, form }) => {
  const [updateProgram] = useMutation<
    types.UPDATE_PROGRAM_PERPETUAL_PLAN,
    types.UPDATE_PROGRAM_PERPETUAL_PLANVariables
  >(UPDATE_PROGRAM_PERPETUAL_PLAN)
  const { formatMessage } = useIntl()
  const [loading, setLoading] = useState(false)
  const [withSalePrice, setWithSalePrice] = useState(program.salePrice ? true : false)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    form.validateFields((error, values) => {
      if (!error) {
        setLoading(true)
        updateProgram({
          variables: {
            programId: program.id,
            listPrice: values.listPrice || 0,
            salePrice: values.salePrice || 0,
            soldAt: withSalePrice && values.soldAt ? moment(values.soldAt).toDate() : null,
          },
        })
          .then(() => {
            message.success(formatMessage(commonMessages.event.successfullySaved))
            onRefetch && onRefetch()
          })
          .catch(handleError)
          .finally(() => setLoading(false))
      }
    })
  }

  return (
    <AdminCard>
      <Form onSubmit={handleSubmit}>
        <Form.Item label={formatMessage(commonMessages.term.listPrice)}>
          {form.getFieldDecorator('listPrice', {
            initialValue: program.listPrice || 0,
            rules: [{ required: true }, { type: 'number' }],
          })(
            <InputNumber
              min={0}
              formatter={value => `NT$ ${value}`}
              parser={value => (value ? value.replace(/\D/g, '') : '')}
            />,
          )}
        </Form.Item>

        <div className="mb-4">
          <Checkbox defaultChecked={withSalePrice} onChange={e => setWithSalePrice(e.target.checked)}>
            {formatMessage(commonMessages.term.salePrice)}
          </Checkbox>
        </div>
        <Form.Item className={withSalePrice ? 'm-0' : 'd-none'}>
          <Form.Item className="d-inline-block mr-2">
            {form.getFieldDecorator('salePrice', {
              initialValue: program.salePrice || 0,
            })(
              <InputNumber
                min={0}
                formatter={value => `NT$ ${value}`}
                parser={value => (value ? value.replace(/\D/g, '') : '')}
              />,
            )}
          </Form.Item>
          <Form.Item className="d-inline-block mr-2">
            {form.getFieldDecorator('soldAt', {
              initialValue: program && program.soldAt ? moment(program.soldAt) : null,
              rules: [{ required: withSalePrice, message: formatMessage(errorMessages.form.date) }],
            })(<DatePicker />)}
          </Form.Item>
          {form.getFieldValue('soldAt') && moment(form.getFieldValue('soldAt')).isBefore(moment()) ? (
            <div className="d-inline-block">
              <StyledIcon type="exclamation-circle" theme="filled" className="mr-1" />
              <span>{formatMessage(commonMessages.label.outdated)}</span>
            </div>
          ) : null}
        </Form.Item>

        <Form.Item>
          <Button disabled={loading} onClick={() => form.resetFields()} className="mr-2">
            {formatMessage(commonMessages.ui.cancel)}
          </Button>
          <Button loading={loading} type="primary" htmlType="submit">
            {formatMessage(commonMessages.ui.save)}
          </Button>
        </Form.Item>
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

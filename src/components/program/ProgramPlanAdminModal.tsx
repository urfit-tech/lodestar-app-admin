import { useMutation } from '@apollo/react-hooks'
import { Button, Checkbox, DatePicker, Form, Icon, Input, InputNumber, message, Radio } from 'antd'
import { FormComponentProps } from 'antd/lib/form/Form'
import BraftEditor from 'braft-editor'
import gql from 'graphql-tag'
import moment from 'moment'
import React, { useState } from 'react'
import { defineMessages, useIntl } from 'react-intl'
import styled from 'styled-components'
import uuid from 'uuid'
import { commonMessages, errorMessages, programMessages } from '../../helpers/translation'
import types from '../../types'
import { ProgramPlanType } from '../../types/program'
import AdminBraftEditor from '../admin/AdminBraftEditor'
import AdminModal, { AdminModalProps } from '../admin/AdminModal'
import ProgramPeriodTypeDropdown from './ProgramPeriodTypeDropdown'

const StyledForm = styled(Form)`
  .ant-form-item-label {
    line-height: 2;
  }

  .notation {
    line-height: 1.5;
    letter-spacing: 0.4px;
    font-size: 14px;
    font-weight: 500;
    color: #9b9b9b;
    white-space: pre-line;

    span {
      display: block;
    }
  }
`
const StyledIcon = styled(Icon)`
  color: #ff7d62;
`

const messages = defineMessages({
  subscriptionPlan: { id: 'program.label.subscriptionPlan', defaultMessage: '訂閱付費方案' },
  permissionType: { id: 'program.label.permissionType', defaultMessage: '選擇內容觀看權限' },
  availableForPastContent: { id: 'program.label.availableForPastContent', defaultMessage: '可看過去內容' },
  unavailableForPastContent: { id: 'program.label.unavailableForPastContent', defaultMessage: '不可看過去內容' },
  subscriptionPeriodType: { id: 'program.label.subscriptionPeriodType', defaultMessage: '訂閱週期' },
  planDescription: { id: 'program.label.planDescription', defaultMessage: '方案描述' },
})

type ProgramPlanAdminModalProps = FormComponentProps &
  AdminModalProps & {
    programId: string
    programPlan?: ProgramPlanType
    onRefetch?: () => void
  }
const ProgramPlanAdminModal: React.FC<ProgramPlanAdminModalProps> = ({
  form,
  renderTrigger,
  programId,
  programPlan,
  onRefetch,
}) => {
  const { formatMessage } = useIntl()
  const [upsertProgramPlan] = useMutation<types.UPSERT_PROGRAM_PLAN, types.UPSERT_PROGRAM_PLANVariables>(
    UPSERT_PROGRAM_PLAN,
  )

  const [loading, setLoading] = useState(false)
  const [withSalePrice, setWithSalePrice] = useState(programPlan && programPlan.salePrice ? true : false)
  const [withDiscountDownPrice, setWithDiscountDownPrice] = useState(
    programPlan && programPlan.discountDownPrice ? true : false,
  )

  const handleSubmit = (setVisible: React.Dispatch<React.SetStateAction<boolean>>) => {
    form.validateFieldsAndScroll((error, values) => {
      if (!error && upsertProgramPlan) {
        setLoading(true)
        upsertProgramPlan({
          variables: {
            id: programPlan ? programPlan.id : uuid.v4(),
            programId,
            type: values.type,
            title: values.title,
            description: values.description.toRAW(),
            listPrice: values.listPrice,
            salePrice: withSalePrice ? values.salePrice : 0,
            discountDownPrice: withDiscountDownPrice ? values.discountDownPrice : 0,
            periodType: values.periodType,
            soldAt: withSalePrice && values.soldAt ? values.soldAt.toDate() : null,
          },
        })
          .then(() => {
            onRefetch && onRefetch()
            setVisible(false)
          })
          .catch(error => {
            message.error(error.message)
          })
          .finally(() => setLoading(false))
      }
    })
  }

  const radioStyle = {
    display: 'block',
    height: '30px',
    lineHeight: '30px',
  }

  return (
    <AdminModal
      renderTrigger={renderTrigger}
      title={formatMessage(messages.subscriptionPlan)}
      icon={<Icon type="file-add" />}
      footer={null}
      renderFooter={({ setVisible }) => (
        <>
          <Button className="mr-2" onClick={() => setVisible(false)}>
            {formatMessage(commonMessages.ui.cancel)}
          </Button>
          <Button type="primary" loading={loading} onClick={() => handleSubmit(setVisible)}>
            {formatMessage(commonMessages.ui.confirm)}
          </Button>
        </>
      )}
    >
      <StyledForm>
        <Form.Item label={formatMessage(programMessages.label.planTitle)}>
          {form.getFieldDecorator('title', {
            initialValue: programPlan && programPlan.title,
            rules: [
              {
                required: true,
                message: formatMessage(errorMessages.form.isRequired, {
                  field: formatMessage(programMessages.label.planTitle),
                }),
              },
            ],
          })(<Input />)}
        </Form.Item>
        <Form.Item label={formatMessage(messages.permissionType)}>
          {form.getFieldDecorator('type', {
            initialValue: (programPlan && programPlan.type) || 2,
            rules: [{ required: true }],
          })(
            <Radio.Group>
              <Radio value={1} style={radioStyle}>
                {formatMessage(messages.availableForPastContent)}
              </Radio>
              <Radio value={2} style={radioStyle}>
                {formatMessage(messages.unavailableForPastContent)}
              </Radio>
            </Radio.Group>,
          )}
        </Form.Item>
        <Form.Item label={formatMessage(messages.subscriptionPeriodType)}>
          {form.getFieldDecorator('periodType', {
            initialValue: (programPlan && programPlan.periodType) || 'M',
          })(<ProgramPeriodTypeDropdown />)}
        </Form.Item>
        <Form.Item label={formatMessage(commonMessages.term.listPrice)}>
          {form.getFieldDecorator('listPrice', {
            initialValue: (programPlan && programPlan.listPrice) || 0,
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
          {withSalePrice && <div className="notation">{formatMessage(commonMessages.text.salePriceNotation)}</div>}
        </div>
        <Form.Item className={withSalePrice ? 'm-0' : 'd-none'}>
          <Form.Item className="d-inline-block mr-2">
            {form.getFieldDecorator('salePrice', {
              initialValue: (programPlan && programPlan.salePrice) || 0,
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
              initialValue: programPlan && programPlan.soldAt ? moment(programPlan.soldAt) : null,
              rules: [{ required: withSalePrice, message: formatMessage(errorMessages.form.date) }],
            })(<DatePicker placeholder={formatMessage(commonMessages.label.salePriceEndTime)} />)}
          </Form.Item>
          {form.getFieldValue('soldAt') && moment(form.getFieldValue('soldAt')).isBefore(moment()) ? (
            <div className="d-inline-block">
              <StyledIcon type="exclamation-circle" theme="filled" className="mr-1" />
              <span>{formatMessage(commonMessages.label.outdated)}</span>
            </div>
          ) : null}
        </Form.Item>

        <div className="mb-4">
          <Checkbox defaultChecked={withDiscountDownPrice} onChange={e => setWithDiscountDownPrice(e.target.checked)}>
            {formatMessage(commonMessages.label.discountDownPrice)}
          </Checkbox>
          {withDiscountDownPrice && (
            <div className="notation">{formatMessage(commonMessages.text.discountDownNotation)}</div>
          )}
        </div>
        <Form.Item className={withDiscountDownPrice ? '' : 'd-none'}>
          {form.getFieldDecorator('discountDownPrice', {
            initialValue: (programPlan && programPlan.discountDownPrice) || 0,
          })(
            <InputNumber
              min={0}
              formatter={value => `NT$ ${value}`}
              parser={value => (value ? value.replace(/\D/g, '') : '')}
            />,
          )}
        </Form.Item>

        <Form.Item label={formatMessage(messages.planDescription)}>
          {form.getFieldDecorator('description', {
            initialValue: BraftEditor.createEditorState(programPlan ? programPlan.description : null),
          })(<AdminBraftEditor variant="short" />)}
        </Form.Item>
      </StyledForm>
    </AdminModal>
  )
}

const UPSERT_PROGRAM_PLAN = gql`
  mutation UPSERT_PROGRAM_PLAN(
    $programId: uuid!
    $id: uuid!
    $type: Int!
    $title: String!
    $description: String!
    $listPrice: numeric!
    $salePrice: numeric!
    $discountDownPrice: numeric!
    $periodType: String!
    $soldAt: timestamptz
  ) {
    insert_program_plan(
      objects: {
        id: $id
        type: $type
        title: $title
        description: $description
        list_price: $listPrice
        sale_price: $salePrice
        period_type: $periodType
        discount_down_price: $discountDownPrice
        sold_at: $soldAt
        program_id: $programId
      }
      on_conflict: {
        constraint: program_plan_pkey
        update_columns: [type, title, description, list_price, sale_price, discount_down_price, period_type, sold_at]
      }
    ) {
      affected_rows
    }
  }
`
export default Form.create<ProgramPlanAdminModalProps>()(ProgramPlanAdminModal)

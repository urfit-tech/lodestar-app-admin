import { Form } from '@ant-design/compatible'
import '@ant-design/compatible/assets/index.css'
import { FormComponentProps } from '@ant-design/compatible/lib/form/Form'
import { FileAddOutlined } from '@ant-design/icons'
import { useMutation } from '@apollo/react-hooks'
import { Button, Checkbox, Input, InputNumber, Radio } from 'antd'
import BraftEditor from 'braft-editor'
import gql from 'graphql-tag'
import React, { useState } from 'react'
import { defineMessages, useIntl } from 'react-intl'
import styled from 'styled-components'
import { v4 as uuid } from 'uuid'
import { handleError } from '../../helpers'
import { commonMessages, errorMessages, programMessages } from '../../helpers/translation'
import types from '../../types'
import { ProgramPlanProps } from '../../types/program'
import AdminBraftEditor from '../admin/AdminBraftEditor'
import AdminModal, { AdminModalProps } from '../admin/AdminModal'
import SaleInput from '../admin/SaleInput'
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
    programPlan?: ProgramPlanProps
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
  const [withDiscountDownPrice, setWithDiscountDownPrice] = useState(programPlan && !!programPlan.discountDownPrice)

  const handleSubmit = (setVisible: React.Dispatch<React.SetStateAction<boolean>>) => {
    form.validateFieldsAndScroll((error, values) => {
      if (!error && upsertProgramPlan) {
        setLoading(true)
        upsertProgramPlan({
          variables: {
            id: programPlan ? programPlan.id : uuid(),
            programId,
            type: values.type,
            title: values.title,
            description: values.description.toRAW(),
            listPrice: values.listPrice,
            salePrice: values.sale ? values.sale.price : null,
            soldAt: values.sale ? values.sale.soldAt : null,
            discountDownPrice: withDiscountDownPrice ? values.discountDownPrice : 0,
            periodType: values.periodType,
          },
        })
          .then(() => {
            onRefetch && onRefetch()
            setVisible(false)
          })
          .catch(handleError)
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
      icon={<FileAddOutlined />}
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
      <StyledForm hideRequiredMark colon={false}>
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

        <Form.Item>
          {form.getFieldDecorator('sale', {
            initialValue: programPlan?.soldAt
              ? {
                  price: programPlan.salePrice || 0,
                  soldAt: programPlan.soldAt,
                }
              : null,
            rules: [{ validator: (rule, value, callback) => callback((value && !value.soldAt) || undefined) }],
          })(<SaleInput />)}
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
    $salePrice: numeric
    $soldAt: timestamptz
    $discountDownPrice: numeric!
    $periodType: String!
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

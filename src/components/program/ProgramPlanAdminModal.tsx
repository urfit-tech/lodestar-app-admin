import { useMutation } from '@apollo/react-hooks'
import { Button, Checkbox, DatePicker, Form, Icon, Input, InputNumber, message, Radio } from 'antd'
import { FormComponentProps } from 'antd/lib/form/Form'
import BraftEditor from 'braft-editor'
import gql from 'graphql-tag'
import moment from 'moment'
import React, { useState } from 'react'
import styled from 'styled-components'
import uuid from 'uuid'
import { InferType } from 'yup'
import { programPlanSchema } from '../../schemas/program'
import types from '../../types'
import AdminModal, { AdminModalProps } from '../admin/AdminModal'
import StyledBraftEditor from '../common/StyledBraftEditor'
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

    span {
      display: block;
    }
  }
`
const StyledIcon = styled(Icon)`
  color: #ff7d62;
`

type ProgramPlanAdminModalProps = FormComponentProps &
  AdminModalProps & {
    programId: string
    programPlan?: InferType<typeof programPlanSchema>
    onRefetch?: () => void
  }
const ProgramPlanAdminModal: React.FC<ProgramPlanAdminModalProps> = ({
  form,
  renderTrigger,
  programId,
  programPlan,
  onRefetch,
}) => {
  const [upsertProgramPlan] = useMutation<types.UPSERT_PROGRAM_PLAN, types.UPSERT_PROGRAM_PLANVariables>(
    UPSERT_PROGRAM_PLAN,
  )

  const [loading, setLoading] = useState(false)
  const [hasSalePrice, setHasSalePrice] = useState(programPlan && programPlan.salePrice ? true : false)
  const [hasDiscountDownPrice, setHasDiscountDownPrice] = useState(
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
            salePrice: hasSalePrice ? values.salePrice : 0,
            discountDownPrice: hasDiscountDownPrice ? values.discountDownPrice : 0,
            periodType: values.periodType,
            soldAt: hasSalePrice && values.soldAt ? values.soldAt.toDate() : null,
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
      title="訂閱付費方案"
      icon={<Icon type="file-add" />}
      renderFooter={({ setVisible }) => (
        <>
          <Button className="mr-2" onClick={() => setVisible(false)}>
            取消
          </Button>
          <Button type="primary" loading={loading} onClick={() => handleSubmit(setVisible)}>
            確定
          </Button>
        </>
      )}
    >
      <StyledForm>
        <Form.Item label="方案名稱">
          {form.getFieldDecorator('title', {
            initialValue: programPlan && programPlan.title,
            rules: [{ required: true, message: '請輸入方案名稱' }],
          })(<Input />)}
        </Form.Item>
        <Form.Item label="選擇內容觀看權限">
          {form.getFieldDecorator('type', {
            initialValue: (programPlan && programPlan.type) || 2,
            rules: [{ required: true }],
          })(
            <Radio.Group>
              <Radio value={1} style={radioStyle}>
                可看過去內容
              </Radio>
              <Radio value={2} style={radioStyle}>
                不可看過去內容
              </Radio>
            </Radio.Group>,
          )}
        </Form.Item>
        <Form.Item label="訂閱週期">
          {form.getFieldDecorator('periodType', {
            initialValue: (programPlan && programPlan.periodType) || 'M',
          })(<ProgramPeriodTypeDropdown />)}
        </Form.Item>
        <Form.Item label="定價">
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
          <Checkbox defaultChecked={hasSalePrice} onChange={e => setHasSalePrice(e.target.checked)}>
            優惠價
          </Checkbox>
          {hasSalePrice && <div className="notation">購買到優惠價的會員，往後每期皆以優惠價收款</div>}
        </div>
        <Form.Item className={hasSalePrice ? 'm-0' : 'd-none'}>
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
              rules: [{ required: hasSalePrice, message: '請選擇日期' }],
            })(<DatePicker placeholder="優惠截止日期" />)}
          </Form.Item>
          {form.getFieldValue('soldAt') && moment(form.getFieldValue('soldAt')).isBefore(moment()) ? (
            <div className="d-inline-block">
              <StyledIcon type="exclamation-circle" theme="filled" className="mr-1" />
              <span>已過期</span>
            </div>
          ) : null}
        </Form.Item>

        <div className="mb-4">
          <Checkbox defaultChecked={hasDiscountDownPrice} onChange={e => setHasDiscountDownPrice(e.target.checked)}>
            首期折扣
          </Checkbox>
          {hasDiscountDownPrice && (
            <div className="notation">
              <span>定價或優惠價 - 首期折扣 = 首期支付金額</span>
              <span>EX：100 - 20 = 80，此欄填入 20</span>
            </div>
          )}
        </div>
        <Form.Item className={hasDiscountDownPrice ? '' : 'd-none'}>
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

        <Form.Item label="方案描述">
          {form.getFieldDecorator('description', {
            initialValue: BraftEditor.createEditorState(programPlan ? programPlan.description : null),
          })(
            <StyledBraftEditor
              language="zh-hant"
              controls={['text-color', 'bold', 'list-ol', 'list-ul', { key: 'remove-styles', title: '清除樣式' }]}
              contentClassName="short-bf-content"
            />,
          )}
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

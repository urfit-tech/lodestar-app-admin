import { useMutation } from '@apollo/react-hooks'
import { Button, DatePicker, Form, Input, InputNumber, message, Icon } from 'antd'
import { FormComponentProps } from 'antd/lib/form'
import { generate } from 'coupon-code'
import gql from 'graphql-tag'
import moment from 'moment'
import { times } from 'ramda'
import React, { useState } from 'react'
import { InferType } from 'yup'
import { couponPlanSchema } from '../../schemas/coupon'
import types from '../../types'
import AdminModal, { AdminModalProps } from '../admin/AdminModal'
import CouponPlanDiscountSelector from './CouponPlanDiscountSelector'
import PlanCodeSelector, { PlanCodeProps } from './PlanCodeSelector'

type CouponPlanAdminModalProps = AdminModalProps &
  FormComponentProps & {
    couponPlan?: InferType<typeof couponPlanSchema>
  }
const CouponPlanAdminModal: React.FC<CouponPlanAdminModalProps> = ({ form, couponPlan, ...props }) => {
  const [loading, setLoading] = useState()
  const [createCouponPlan] = useMutation<types.INSERT_COUPON_PLAN, types.INSERT_COUPON_PLANVariables>(
    INSERT_COUPON_PLAN,
  )
  const [updateCouponPlan] = useMutation<types.UPDATE_COUPON_PLAN, types.UPDATE_COUPON_PLANVariables>(
    UPDATE_COUPON_PLAN,
  )

  const handleSubmit = () => {
    form.validateFieldsAndScroll((error, values) => {
      if (error) {
        return
      }

      setLoading(true)
      if (couponPlan) {
        updateCouponPlan({
          variables: {
            couponPlanId: couponPlan.id,
            constraint: values.constraint,
            description: values.description,
            endedAt: values.endedAt,
            startedAt: values.startedAt,
            title: values.title,
            type: values.discount.type,
            amount: values.discount.amount,
          },
        })
          .then(() => window.location.reload())
          .catch(error => {
            message.error(`無法更新折扣方案`)
            setLoading(false)
          })
      } else {
        // create a new coupon plan
        createCouponPlan({
          variables: {
            couponCodes: values.codes.flatMap((couponCode: PlanCodeProps) => {
              if (couponCode.type === 'random') {
                return times(
                  () => ({
                    app_id: localStorage.getItem('kolable.app.id'),
                    code: generate(),
                    count: 1,
                    remaining: 1,
                  }),
                  couponCode.count,
                )
              }
              return {
                app_id: localStorage.getItem('kolable.app.id'),
                code: couponCode.code,
                count: couponCode.count,
                remaining: couponCode.count,
              }
            }),
            constraint: values.constraint,
            description: values.description,
            endedAt: values.endedAt,
            scope: 'all',
            startedAt: values.startedAt,
            title: values.title,
            type: values.discount.type,
            amount: values.discount.amount,
          },
        })
          .then(() => {
            window.location.reload()
          })
          .catch(error => {
            message.error(`無法創建折扣方案，可能原因為此折扣碼已存在`)
            setLoading(false)
          })
      }
    })
  }

  return (
    <AdminModal
      renderFooter={({ setVisible }) => (
        <>
          <Button className="mr-2" onClick={() => setVisible(false)}>
            取消
          </Button>
          <Button type="primary" loading={loading} onClick={() => handleSubmit()}>
            確定
          </Button>
        </>
      )}
      {...props}
    >
      <Form>
        <Form.Item label="折價方案名稱">
          {form.getFieldDecorator('title', {
            initialValue: couponPlan && couponPlan.title,
            rules: [{ required: true, message: '請輸入折價方案名稱' }],
          })(<Input />)}
        </Form.Item>
        <Form.Item label="消費需達">
          {form.getFieldDecorator('constraint', {
            initialValue: (couponPlan && couponPlan.constraint) || 0,
            rules: [{ required: true }],
          })(<InputNumber formatter={v => `${v} 元`} parser={v => (v && parseFloat(v.replace(' 元', ''))) || 0} />)}
        </Form.Item>
        {!couponPlan && (
          <Form.Item label="折扣碼">
            {form.getFieldDecorator('codes', {
              rules: [{ required: true, message: '至少一組折扣碼' }],
            })(<PlanCodeSelector planType="coupon" />)}
          </Form.Item>
        )}
        <Form.Item label="折抵額度" help="折抵方式為比例時，額度範圍為 0 - 100">
          {form.getFieldDecorator('discount', {
            initialValue: couponPlan ? { type: couponPlan.type, amount: couponPlan.amount } : { type: 1, amount: 0 },
          })(<CouponPlanDiscountSelector />)}
        </Form.Item>
        <Form.Item label="有效期限">
          <Input.Group compact>
            {form.getFieldDecorator('startedAt', {
              initialValue: couponPlan && couponPlan.startedAt && moment(couponPlan.startedAt),
            })(<DatePicker placeholder="開始日期" />)}
            {form.getFieldDecorator('endedAt', {
              initialValue: couponPlan && couponPlan.endedAt && moment(couponPlan.endedAt),
            })(<DatePicker placeholder="截止日期" />)}
          </Input.Group>
        </Form.Item>
        <Form.Item label="使用限制與描述">
          {form.getFieldDecorator('description', {
            initialValue: couponPlan && couponPlan.description,
          })(<Input.TextArea placeholder="非必填" rows={4} />)}
        </Form.Item>
      </Form>
    </AdminModal>
  )
}

const INSERT_COUPON_PLAN = gql`
  mutation INSERT_COUPON_PLAN(
    $couponCodes: [coupon_code_insert_input!]!
    $constraint: numeric
    $description: String
    $endedAt: timestamptz
    $scope: String
    $startedAt: timestamptz
    $title: String
    $type: Int
    $amount: numeric
  ) {
    insert_coupon_plan(
      objects: {
        coupon_codes: { data: $couponCodes }
        constraint: $constraint
        description: $description
        ended_at: $endedAt
        scope: $scope
        started_at: $startedAt
        title: $title
        type: $type
        amount: $amount
      }
    ) {
      affected_rows
    }
  }
`

const UPDATE_COUPON_PLAN = gql`
  mutation UPDATE_COUPON_PLAN(
    $couponPlanId: uuid!
    $constraint: numeric
    $description: String
    $endedAt: timestamptz
    $startedAt: timestamptz
    $title: String
    $type: Int
    $amount: numeric
  ) {
    update_coupon_plan(
      where: { id: { _eq: $couponPlanId } }
      _set: {
        constraint: $constraint
        description: $description
        ended_at: $endedAt
        started_at: $startedAt
        title: $title
        type: $type
        amount: $amount
      }
    ) {
      affected_rows
    }
  }
`

export default Form.create<CouponPlanAdminModalProps>()(CouponPlanAdminModal)

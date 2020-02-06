import { useMutation } from '@apollo/react-hooks'
import { Button, DatePicker, Form, Input, InputNumber } from 'antd'
import { FormComponentProps } from 'antd/lib/form'
import { generate } from 'coupon-code'
import gql from 'graphql-tag'
import moment from 'moment'
import { times } from 'ramda'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import { InferType } from 'yup'
import { handleError } from '../../helpers'
import { commonMessages, errorMessages, promotionMessages } from '../../helpers/translation'
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
  const { formatMessage } = useIntl()
  const [createCouponPlan] = useMutation<types.INSERT_COUPON_PLAN, types.INSERT_COUPON_PLANVariables>(
    INSERT_COUPON_PLAN,
  )
  const [updateCouponPlan] = useMutation<types.UPDATE_COUPON_PLAN, types.UPDATE_COUPON_PLANVariables>(
    UPDATE_COUPON_PLAN,
  )
  const [loading, setLoading] = useState()

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
            handleError(error)
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
            handleError(error)
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
            {formatMessage(commonMessages.ui.cancel)}
          </Button>
          <Button type="primary" loading={loading} onClick={() => handleSubmit()}>
            {formatMessage(commonMessages.ui.confirm)}
          </Button>
        </>
      )}
      {...props}
    >
      <Form>
        <Form.Item label={formatMessage(promotionMessages.term.couponPlanTitle)}>
          {form.getFieldDecorator('title', {
            initialValue: couponPlan && couponPlan.title,
            rules: [
              {
                required: true,
                message: formatMessage(errorMessages.form.isRequired, {
                  field: formatMessage(promotionMessages.term.couponPlanTitle),
                }),
              },
            ],
          })(<Input />)}
        </Form.Item>
        <Form.Item label={formatMessage(promotionMessages.label.constraint)}>
          {form.getFieldDecorator('constraint', {
            initialValue: (couponPlan && couponPlan.constraint) || 0,
            rules: [{ required: true }],
          })(<InputNumber formatter={v => `${v}`} parser={v => (v ? parseFloat(v) : 0)} />)}
        </Form.Item>
        {!couponPlan && (
          <Form.Item label={formatMessage(promotionMessages.term.couponCodes)}>
            {form.getFieldDecorator('codes', {
              rules: [{ required: true, message: formatMessage(errorMessages.form.couponCodes) }],
            })(<PlanCodeSelector planType="coupon" />)}
          </Form.Item>
        )}
        <Form.Item
          label={formatMessage(promotionMessages.term.discount)}
          help={formatMessage(promotionMessages.label.discountHelp)}
        >
          {form.getFieldDecorator('discount', {
            initialValue: couponPlan ? { type: couponPlan.type, amount: couponPlan.amount } : { type: 1, amount: 0 },
          })(<CouponPlanDiscountSelector />)}
        </Form.Item>
        <Form.Item label={formatMessage(promotionMessages.label.availableDateRange)}>
          <Input.Group compact>
            {form.getFieldDecorator('startedAt', {
              initialValue: couponPlan && couponPlan.startedAt && moment(couponPlan.startedAt),
            })(<DatePicker placeholder={formatMessage(commonMessages.term.startedAt)} />)}
            {form.getFieldDecorator('endedAt', {
              initialValue: couponPlan && couponPlan.endedAt && moment(couponPlan.endedAt),
            })(<DatePicker placeholder={formatMessage(commonMessages.term.endedAt)} />)}
          </Input.Group>
        </Form.Item>
        <Form.Item label={formatMessage(promotionMessages.term.description)}>
          {form.getFieldDecorator('description', {
            initialValue: couponPlan && couponPlan.description,
          })(<Input.TextArea placeholder={formatMessage(commonMessages.label.optional)} rows={4} />)}
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

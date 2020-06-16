import { useMutation } from '@apollo/react-hooks'
import { DatePicker, Form, Input, InputNumber, message } from 'antd'
import { FormComponentProps } from 'antd/lib/form'
import { generate } from 'coupon-code'
import gql from 'graphql-tag'
import moment from 'moment'
import { times } from 'ramda'
import React, { useContext, useState } from 'react'
import { useIntl } from 'react-intl'
import AppContext from '../../contexts/AppContext'
import { handleError } from '../../helpers'
import { commonMessages, errorMessages, promotionMessages } from '../../helpers/translation'
import types from '../../types'
import { CouponPlanProps } from '../../types/checkout'
import AdminModal, { AdminModalProps } from '../admin/AdminModal'
import CouponPlanDiscountSelector from './CouponPlanDiscountSelector'
import PlanCodeSelector, { PlanCodeProps } from './PlanCodeSelector'
import CouponPlanScopeSelector from './CouponPlanScopeSelector'

type CouponPlanAdminModalProps = AdminModalProps &
  FormComponentProps & {
    couponPlan?: CouponPlanProps
  }
const CouponPlanAdminModal: React.FC<CouponPlanAdminModalProps> = ({ form, couponPlan, ...props }) => {
  const { id: appId } = useContext(AppContext)
  const { formatMessage } = useIntl()
  const [createCouponPlan] = useMutation<types.INSERT_COUPON_PLAN, types.INSERT_COUPON_PLANVariables>(
    INSERT_COUPON_PLAN,
  )
  const [updateCouponPlan] = useMutation<types.UPDATE_COUPON_PLAN, types.UPDATE_COUPON_PLANVariables>(
    UPDATE_COUPON_PLAN,
  )
  const [loading, setLoading] = useState(false)

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
            scope: values.scope.scope,
            title: values.title,
            type: values.discount.type === 'cash' ? 1 : values.discount.type === 'percent' ? 2 : 1,
            amount: values.discount.amount,
            couponPlanProduct: values.scope.productIds.map((productId: string) => ({
              coupon_plan_id: couponPlan.id,
              product_id: productId,
            })),
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
                    app_id: appId,
                    code: generate(),
                    count: 1,
                    remaining: 1,
                  }),
                  couponCode.count,
                )
              }
              return {
                app_id: appId,
                code: couponCode.code,
                count: couponCode.count,
                remaining: couponCode.count,
              }
            }),
            constraint: values.constraint,
            description: values.description,
            endedAt: values.endedAt,
            scope: values.scope.scope,
            startedAt: values.startedAt,
            title: values.title,
            type: values.discount.type === 'cash' ? 1 : values.discount.type === 'percent' ? 2 : 1,
            amount: values.discount.amount,
            couponPlanProduct: values.scope.productIds.map((productId: string) => ({
              product_id: productId,
            })),
          },
        })
          .then(() => {
            window.location.reload()
          })
          .catch(error => {
            if (/^GraphQL error: Uniqueness violation/.test(error.message)) {
              message.error(formatMessage(errorMessages.event.duplicateVoucherCode))
            } else {
              handleError(error)
            }
            setLoading(false)
          })
      }
    })
  }

  return (
    <AdminModal
      maskClosable={false}
      okText={formatMessage(commonMessages.ui.confirm)}
      cancelText={formatMessage(commonMessages.ui.cancel)}
      okButtonProps={{ loading }}
      onOk={() => handleSubmit()}
      {...props}
    >
      <Form colon={false} hideRequiredMark>
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
        <Form.Item
          label={formatMessage(promotionMessages.term.discount)}
          help={formatMessage(promotionMessages.label.discountHelp)}
        >
          {form.getFieldDecorator('discount', {
            initialValue: couponPlan
              ? { type: couponPlan.type, amount: couponPlan.amount }
              : { type: 'cash', amount: 0 },
          })(<CouponPlanDiscountSelector />)}
        </Form.Item>

        <Form.Item label={formatMessage(promotionMessages.label.scope)}>
          {form.getFieldDecorator('scope', {
            initialValue: {
              scope: couponPlan?.scope || null,
              productIds: couponPlan?.productIds || [],
            },
          })(<CouponPlanScopeSelector />)}
        </Form.Item>

        {!couponPlan && (
          <Form.Item label={formatMessage(promotionMessages.term.couponCodes)}>
            {form.getFieldDecorator('codes', {
              rules: [{ required: true, message: formatMessage(errorMessages.form.couponCodes) }],
            })(<PlanCodeSelector planType="coupon" />)}
          </Form.Item>
        )}

        <Form.Item label={formatMessage(promotionMessages.label.availableDateRange)}>
          <Input.Group compact>
            {form.getFieldDecorator('startedAt', {
              initialValue: couponPlan && couponPlan.startedAt && moment(couponPlan.startedAt),
            })(
              <DatePicker
                showTime
                format="YYYY-MM-DD HH:mm"
                placeholder={formatMessage(commonMessages.term.startedAt)}
              />,
            )}
            {form.getFieldDecorator('endedAt', {
              initialValue: couponPlan && couponPlan.endedAt && moment(couponPlan.endedAt),
            })(
              <DatePicker
                showTime
                format="YYYY-MM-DD HH:mm"
                placeholder={formatMessage(commonMessages.term.endedAt)}
              />,
            )}
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
    $scope: jsonb
    $startedAt: timestamptz
    $title: String
    $type: Int
    $amount: numeric
    $couponPlanProduct: [coupon_plan_product_insert_input!]!
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
        coupon_plan_products: { data: $couponPlanProduct }
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
    $scope: jsonb
    $title: String
    $type: Int
    $amount: numeric
    $couponPlanProduct: [coupon_plan_product_insert_input!]!
  ) {
    update_coupon_plan(
      where: { id: { _eq: $couponPlanId } }
      _set: {
        constraint: $constraint
        description: $description
        ended_at: $endedAt
        started_at: $startedAt
        scope: $scope
        title: $title
        type: $type
        amount: $amount
      }
    ) {
      affected_rows
    }
    delete_coupon_plan_product(where: { coupon_plan_id: { _eq: $couponPlanId } }) {
      affected_rows
    }
    insert_coupon_plan_product(objects: $couponPlanProduct) {
      affected_rows
    }
  }
`

export default Form.create<CouponPlanAdminModalProps>()(CouponPlanAdminModal)

import { gql, useMutation } from '@apollo/client'
import { Button, DatePicker, Form, Input, InputNumber, message } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import { generate } from 'coupon-code'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import moment, { Moment } from 'moment'
import { times } from 'ramda'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import hasura from '../../hasura'
import { handleError } from '../../helpers'
import { CouponPlanProps } from '../../types/checkout'
import AdminModal, { AdminModalProps } from '../admin/AdminModal'
import PlanCodeSelector, { PlanCodeProps } from '../checkout/PlanCodeSelector'
import DiscountFormItem from '../common/FormItem/DiscountFormItem'
import ScopeSelector, { ScopeProps } from '../form/ScopeSelector'
import { CouponPlanDiscountProps } from './CouponPlanDiscountSelector'
import couponMessages from './translation'

type FieldProps = {
  title: string
  scope?: ScopeProps | null
  constraint: number
  discount: CouponPlanDiscountProps
  codes?: PlanCodeProps[]
  startedAt: Moment | null
  endedAt: Moment | null
  description: string
}

const CouponPlanAdminModal: React.FC<
  AdminModalProps & {
    couponPlan?: CouponPlanProps
    onRefetch?: () => void
  }
> = ({ couponPlan, onRefetch, ...props }) => {
  const { formatMessage } = useIntl()
  const [form] = useForm<FieldProps>()
  const { id: appId, enabledModules } = useApp()
  const { currentMemberId } = useAuth()

  const [createCouponPlan] = useMutation<hasura.INSERT_COUPON_PLAN, hasura.INSERT_COUPON_PLANVariables>(
    INSERT_COUPON_PLAN,
  )
  const [updateCouponPlan] = useMutation<hasura.UPDATE_COUPON_PLAN, hasura.UPDATE_COUPON_PLANVariables>(
    UPDATE_COUPON_PLAN,
  )
  const [loading, setLoading] = useState(false)

  const handleSubmit = (setVisible: React.Dispatch<React.SetStateAction<boolean>>) => {
    form
      .validateFields()
      .then(() => {
        setLoading(true)
        const values = form.getFieldsValue()
        if (couponPlan) {
          updateCouponPlan({
            variables: {
              couponPlanId: couponPlan.id,
              constraint: values.constraint,
              description: values.description || '',
              endedAt: values.endedAt,
              startedAt: values.startedAt,
              scope: values.scope?.productTypes || null,
              title: values.title || '',
              type: values.discount.type === 'cash' ? 1 : values.discount.type === 'percent' ? 2 : 1,
              amount: values.discount.amount,
              couponPlanProduct:
                values.scope?.productIds.map((productId: string) => ({
                  coupon_plan_id: couponPlan.id,
                  product_id: productId,
                })) || [],
            },
          })
            .then(() => {
              message.success(formatMessage(couponMessages.CouponPlanAdminModal.successfullySaved))
              setVisible(false)
              onRefetch?.()
            })
            .catch(handleError)
            .finally(() => setLoading(false))
        } else {
          // create a new coupon plan
          createCouponPlan({
            variables: {
              couponCodes:
                values.codes?.flatMap((couponCode: PlanCodeProps) => {
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
                }) || [],
              constraint: values.constraint,
              description: values.description || '',
              startedAt: values.startedAt,
              endedAt: values.endedAt,
              scope: values.scope?.productTypes || null,
              title: values.title || '',
              type: values.discount.type === 'cash' ? 1 : values.discount.type === 'percent' ? 2 : 1,
              amount: values.discount.amount,
              couponPlanProduct:
                values.scope?.productIds.map((productId: string) => ({
                  product_id: productId,
                })) || [],
              editorId: currentMemberId,
            },
          })
            .then(() => {
              message.success(formatMessage(couponMessages.CouponPlanAdminModal.successfullyCreated))
              setVisible(false)
              onRefetch?.()
            })
            .catch(error => {
              if (/^GraphQL error: Uniqueness violation/.test(error.message)) {
                message.error(formatMessage(couponMessages.CouponPlanAdminModal.duplicateVoucherCode))
              } else {
                handleError(error)
              }
            })
            .finally(() => setLoading(false))
        }
      })
      .catch(() => {})
  }

  return (
    <AdminModal
      maskClosable={false}
      footer={null}
      renderFooter={({ setVisible }) => (
        <>
          <Button className="mr-2" onClick={() => setVisible(false)}>
            {formatMessage(couponMessages.CouponPlanAdminModal.cancel)}
          </Button>
          <Button type="primary" loading={loading} onClick={() => handleSubmit(setVisible)}>
            {formatMessage(couponMessages.CouponPlanAdminModal.confirm)}
          </Button>
        </>
      )}
      {...props}
    >
      <Form
        form={form}
        layout="vertical"
        colon={false}
        hideRequiredMark
        initialValues={{
          title: couponPlan?.title || '',
          scope: {
            productTypes: couponPlan?.scope || null,
            productIds: couponPlan?.productIds || [],
          },
          constraint: couponPlan?.constraint || 0,
          discount: {
            type: couponPlan?.type || 'cash',
            amount: couponPlan?.amount || 0,
          },
          startedAt: couponPlan && couponPlan.startedAt ? moment(couponPlan.startedAt) : null,
          endedAt: couponPlan && couponPlan.endedAt ? moment(couponPlan.endedAt) : null,
          description: couponPlan?.description || '',
        }}
      >
        <Form.Item
          label={formatMessage(couponMessages.CouponPlanAdminModal.couponPlanTitle)}
          name="title"
          rules={[
            {
              required: true,
              message: formatMessage(couponMessages.CouponPlanAdminModal.isRequired, {
                field: formatMessage(couponMessages.CouponPlanAdminModal.couponPlanTitle),
              }),
            },
          ]}
        >
          <Input />
        </Form.Item>

        {enabledModules.coupon_scope && (
          <Form.Item label={formatMessage(couponMessages.CouponPlanAdminModal.scope)} name="scope">
            <ScopeSelector
              allText={formatMessage(couponMessages.CouponPlanAdminModal.allProductScope)}
              specificTypeText={formatMessage(couponMessages.CouponPlanAdminModal.specificProductScope)}
              otherProductText={formatMessage(couponMessages.CouponPlanAdminModal.otherSpecificProduct)}
            />
          </Form.Item>
        )}

        <Form.Item
          label={formatMessage(couponMessages.CouponPlanAdminModal.constraint)}
          name="constraint"
          rules={[{ required: true }]}
        >
          <InputNumber formatter={v => `${v}`} parser={v => (v ? parseFloat(v) : 0)} />
        </Form.Item>

        <DiscountFormItem />

        {!couponPlan && (
          <Form.Item
            label={formatMessage(couponMessages['*'].couponCodes)}
            name="codes"
            rules={[
              { required: true, message: formatMessage(couponMessages.CouponPlanAdminModal.atLastOneCouponCode) },
            ]}
          >
            <PlanCodeSelector planType="coupon" />
          </Form.Item>
        )}
        <Form.Item label={formatMessage(couponMessages.CouponPlanAdminModal.availableDateRange)}>
          <Input.Group compact>
            <Form.Item name="startedAt">
              <DatePicker
                format="YYYY-MM-DD HH:mm"
                showTime={{ format: 'HH:mm', defaultValue: moment('00:00:00', 'HH:mm:ss') }}
                placeholder={formatMessage(couponMessages.CouponPlanAdminModal.startedAt)}
              />
            </Form.Item>
            <Form.Item name="endedAt">
              <DatePicker
                format="YYYY-MM-DD HH:mm"
                showTime={{ format: 'HH:mm', defaultValue: moment('23:59:00', 'HH:mm:ss') }}
                placeholder={formatMessage(couponMessages.CouponPlanAdminModal.endedAt)}
              />
            </Form.Item>
          </Input.Group>
        </Form.Item>
        <Form.Item label={formatMessage(couponMessages.CouponPlanAdminModal.description)} name="description">
          <Input.TextArea placeholder={formatMessage(couponMessages.CouponPlanAdminModal.optional)} rows={4} />
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
    $editorId: String
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
        editor_id: $editorId
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

export default CouponPlanAdminModal

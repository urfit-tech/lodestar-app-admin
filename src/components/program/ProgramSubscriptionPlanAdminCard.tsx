import { useMutation } from '@apollo/react-hooks'
import { Button, Divider, InputNumber, Typography } from 'antd'
import Form, { FormComponentProps, FormProps } from 'antd/lib/form'
import gql from 'graphql-tag'
import React, { useState } from 'react'
import styled from 'styled-components'
import { InferType } from 'yup'
import { programPlanSchema } from '../../schemas/program'
import types from '../../types'
import AdminCard from '../common/AdminCard'
import PriceLabel from '../common/PriceLabel'
import { BraftContent } from '../common/StyledBraftEditor'
import ProgramPlanAdminModal from './ProgramPlanAdminModal'

const StyledAdminCard = styled(AdminCard)`
  && {
    .current-price {
      margin-bottom: 8px;
      line-height: 1;
      letter-spacing: 0.35px;
      font-weight: bold;
      font-size: 28px;
      &__period {
        font-size: 16px;
      }
    }

    .exact-price {
      margin-bottom: 16px;
      display: block;
      line-height: 1.5;
      letter-spacing: 0.2px;
      font-size: 14px;
      font-weight: 500;
      color: #585858;
    }

    .original-price {
      display: block;
      color: rgba(0, 0, 0, 0.45);
      text-decoration: line-through;
      letter-spacing: 0.18px;
      font-size: 14px;
    }
  }
`

type ProgramSubscriptionPlanAdminCardProps = {
  programId: string
  isSubscription: boolean
  programPlan: InferType<typeof programPlanSchema>
  onRefetch?: () => void
}
const ProgramSubscriptionPlanAdminCard: React.FC<ProgramSubscriptionPlanAdminCardProps> = ({
  programId,
  isSubscription,
  programPlan,
  onRefetch,
}) => {
  const isOnSale = programPlan.soldAt && new Date() < programPlan.soldAt
  const { salePrice, listPrice, discountDownPrice, periodType } = programPlan

  return isSubscription ? (
    <StyledAdminCard>
      <Typography.Text>{programPlan.title}</Typography.Text>
      <PriceLabel
        listPrice={listPrice}
        salePrice={isOnSale ? salePrice : undefined}
        downPrice={discountDownPrice || undefined}
        periodAmount={1}
        periodType={periodType}
      />

      <Divider />

      <div className="mb-4">
        <BraftContent>{programPlan.description}</BraftContent>
      </div>

      <ProgramPlanAdminModal
        onRefetch={onRefetch}
        programId={programId}
        programPlan={programPlan}
        renderTrigger={({ setVisible }) => <Button onClick={() => setVisible(true)}>編輯</Button>}
      />
    </StyledAdminCard>
  ) : (
    <AdminCard>
      <WrappedPerpetualPlanForm programPlan={programPlan} />
    </AdminCard>
  )
}

type PerpetualPlanFormProps = FormComponentProps & FormProps & { programPlan: InferType<typeof programPlanSchema> }
const PerpetualPlanForm: React.FC<PerpetualPlanFormProps> = ({ form, programPlan }) => {
  const [updateProgramContent] = useMutation<
    types.UPDATE_PROGRAM_SUBSCRIPTION_PLAN,
    types.UPDATE_PROGRAM_SUBSCRIPTION_PLANVariables
  >(UPDATE_PROGRAM_SUBSCRIPTION_PLAN)
  const [loading, setLoading] = useState()

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    form.validateFields((error, values) => {
      if (!error) {
        setLoading(true)
        updateProgramContent({
          variables: {
            programPlanId: programPlan.id,
            listPrice: values.listPrice,
            salePrice: values.salePrice,
          },
        }).finally(() => setLoading(false))
      }
    })
  }

  return (
    <Form onSubmit={handleSubmit}>
      <Form.Item label="定價">
        {form.getFieldDecorator('listPrice', {
          initialValue: programPlan.listPrice,
          rules: [{ required: true }, { type: 'number' }],
        })(<InputNumber />)}
      </Form.Item>
      <Form.Item label="優惠價">
        {form.getFieldDecorator('salePrice', {
          initialValue: programPlan.salePrice,
          rules: [{ required: true }, { type: 'number' }],
        })(<InputNumber />)}
      </Form.Item>
      <Form.Item>
        <Button disabled={loading} onClick={() => form.resetFields()}>
          取消
        </Button>
        <Button loading={loading} type="primary" htmlType="submit">
          儲存
        </Button>
      </Form.Item>
    </Form>
  )
}
const WrappedPerpetualPlanForm = Form.create<PerpetualPlanFormProps>()(PerpetualPlanForm)

const UPDATE_PROGRAM_SUBSCRIPTION_PLAN = gql`
  mutation UPDATE_PROGRAM_SUBSCRIPTION_PLAN($programPlanId: uuid!, $listPrice: numeric!, $salePrice: numeric!) {
    update_program_plan(
      where: { id: { _eq: $programPlanId } }
      _set: { list_price: $listPrice, sale_price: $salePrice }
    ) {
      affected_rows
    }
  }
`

export default ProgramSubscriptionPlanAdminCard

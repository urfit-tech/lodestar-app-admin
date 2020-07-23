import { useMutation, useQuery } from '@apollo/react-hooks'
import { Button, Divider, Dropdown, Icon, InputNumber, Menu, Typography } from 'antd'
import Form, { FormComponentProps, FormProps } from 'antd/lib/form'
import gql from 'graphql-tag'
import moment from 'moment-timezone'
import React, { useState } from 'react'
import { defineMessages, useIntl } from 'react-intl'
import styled from 'styled-components'
import { commonMessages } from '../../helpers/translation'
import types from '../../types'
import { ProgramPlanPeriodType, ProgramPlanProps } from '../../types/program'
import AdminCard from '../admin/AdminCard'
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

const messages = defineMessages({
  subscriptionCount: { id: 'program.text.subscriptionCount', defaultMessage: '{count} 人' },
})

type ProgramSubscriptionPlanAdminCardProps = {
  programId: string
  isSubscription: boolean
  programPlan: ProgramPlanProps
  onRefetch?: () => void
}
const ProgramSubscriptionPlanAdminCard: React.FC<ProgramSubscriptionPlanAdminCardProps> = ({
  programId,
  isSubscription,
  programPlan,
  onRefetch,
}) => {
  const { formatMessage } = useIntl()
  const isOnSale = programPlan.soldAt && moment() < moment(programPlan.soldAt)
  const { salePrice, listPrice, discountDownPrice, periodType } = programPlan
  const { loading, error, data } = useQuery<
    types.GET_PROGRAM_SUBSCRIPTION_PLAN_COUNT,
    types.GET_PROGRAM_SUBSCRIPTION_PLAN_COUNTVariables
  >(GET_PROGRAM_SUBSCRIPTION_PLAN_COUNT, { variables: { programPlanId: programPlan.id } })
  const programSubscriptionPlanCount =
    loading || !!error || !data ? '' : data?.program_plan_enrollment_aggregate.aggregate?.count

  return isSubscription ? (
    <StyledAdminCard>
      <Typography.Text>{programPlan.title}</Typography.Text>
      <PriceLabel
        listPrice={listPrice}
        salePrice={isOnSale && salePrice ? salePrice : undefined}
        downPrice={discountDownPrice || undefined}
        periodAmount={1}
        periodType={periodType as ProgramPlanPeriodType}
      />
      <Divider />
      <div className="mb-4">
        <BraftContent>{programPlan.description}</BraftContent>
      </div>
      <div className="d-flex justify-content-between align-items-center mt-3">
        <div className="flex-grow-1 m-0" style={{ lineHeight: '20px' }}>
          {!loading && formatMessage(messages.subscriptionCount, { count: `${programSubscriptionPlanCount}` })}
        </div>
        <Dropdown
          placement="bottomRight"
          overlay={
            <Menu>
              <Menu.Item>
                <ProgramPlanAdminModal
                  onRefetch={onRefetch}
                  programId={programId}
                  programPlan={programPlan}
                  renderTrigger={({ setVisible }) => (
                    <span onClick={() => setVisible(true)}>{formatMessage(commonMessages.ui.edit)}</span>
                  )}
                />
              </Menu.Item>
            </Menu>
          }
          trigger={['click']}
        >
          <Icon type="more" style={{ fontSize: '24px' }} />
        </Dropdown>
      </div>
    </StyledAdminCard>
  ) : (
    <AdminCard>
      <WrappedPerpetualPlanForm programPlan={programPlan} />
    </AdminCard>
  )
}

type PerpetualPlanFormProps = FormComponentProps &
  FormProps & {
    programPlan: ProgramPlanProps
  }
const PerpetualPlanForm: React.FC<PerpetualPlanFormProps> = ({ form, programPlan }) => {
  const { formatMessage } = useIntl()

  const [updateProgramContent] = useMutation<
    types.UPDATE_PROGRAM_SUBSCRIPTION_PLAN,
    types.UPDATE_PROGRAM_SUBSCRIPTION_PLANVariables
  >(UPDATE_PROGRAM_SUBSCRIPTION_PLAN)
  const [loading, setLoading] = useState(false)

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
      <Form.Item label={formatMessage(commonMessages.term.listPrice)}>
        {form.getFieldDecorator('listPrice', {
          initialValue: programPlan.listPrice,
          rules: [{ required: true }, { type: 'number' }],
        })(<InputNumber />)}
      </Form.Item>
      <Form.Item label={formatMessage(commonMessages.term.salePrice)}>
        {form.getFieldDecorator('salePrice', {
          initialValue: programPlan.salePrice,
          rules: [{ required: true }, { type: 'number' }],
        })(<InputNumber />)}
      </Form.Item>
      <Form.Item>
        <Button disabled={loading} onClick={() => form.resetFields()}>
          {formatMessage(commonMessages.ui.cancel)}
        </Button>
        <Button loading={loading} type="primary" htmlType="submit">
          {formatMessage(commonMessages.ui.save)}
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

const GET_PROGRAM_SUBSCRIPTION_PLAN_COUNT = gql`
  query GET_PROGRAM_SUBSCRIPTION_PLAN_COUNT($programPlanId: uuid!) {
    program_plan_enrollment_aggregate(where: { program_plan_id: { _eq: $programPlanId } }) {
      aggregate {
        count
      }
    }
  }
`

export default ProgramSubscriptionPlanAdminCard

import { gql, useMutation } from '@apollo/client'
import { Button, Divider, Form, InputNumber, message } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import React, { Fragment, useState } from 'react'
import { defineMessages, useIntl } from 'react-intl'
import styled from 'styled-components'
import { v4 as uuid } from 'uuid'
import hasura from '../../hasura'
import { handleError } from '../../helpers'
import { commonMessages, errorMessages } from '../../helpers/translation'
import { ReactComponent as PlusIcon } from '../../images/icon/plus.svg'
import { ReactComponent as TrashOIcon } from '../../images/icon/trash-o.svg'
import { ProgramAdminProps } from '../../types/program'
import CurrencyInput from '../form/CurrencyInput'

const messages = defineMessages({
  salePrice: { id: 'program.label.salePrice', defaultMessage: '優惠價 (若無請留空)' },
  groupPlanTitle: { id: 'program.text.groupPlanTitle', defaultMessage: ' {amount} 人方案' },
})

const StyledLabel = styled.div`
  font-size: 14px;
`

const StyledDeleteButton = styled(Button)`
  margin-top: 33px;
`

type FieldProps = {
  groupBuying: {
    id: string
    people: number
    listPrice: number
    salePrice?: number | null
  }[]
}

const ProgramGroupBuyingAdminForm: React.FC<{
  program: ProgramAdminProps
  onRefetch?: () => void
}> = ({ program, onRefetch }) => {
  const { formatMessage } = useIntl()
  const [form] = useForm<FieldProps>()
  const [loading, setLoading] = useState(false)
  const [upsertProgramPlan] = useMutation<
    hasura.UPSERT_PROGRAM_GROUP_BUYING_PLAN,
    hasura.UPSERT_PROGRAM_GROUP_BUYING_PLANVariables
  >(UPSERT_PROGRAM_GROUP_BUYING_PLAN)

  const handleSubmit = (values: FieldProps) => {
    form.validateFields().then(() => {
      setLoading(true)
      upsertProgramPlan({
        variables: {
          programPlans: values.groupBuying.map(groupBuy => ({
            id: groupBuy.id || uuid(),
            program_id: program.id,
            type: 3,
            title: formatMessage(messages.groupPlanTitle, {
              amount: groupBuy.people.toString(),
            }),
            list_price: groupBuy.listPrice,
            sale_price: groupBuy.salePrice ?? null,
            period_type: null,
            auto_renewed: false,
            sold_at: program.plans.find(v => v.id === groupBuy.id)?.soldAt,
            published_at: program.plans.find(v => v.id === groupBuy.id)?.publishedAt || new Date(),
            group_buying_people: groupBuy.people,
          })),
          archivedProgramPlanIds: program.plans
            .map(plan => plan.id)
            .filter(planId => values.groupBuying.every(v => v.id !== planId)),
        },
      })
        .then(() => {
          message.success(formatMessage(commonMessages.event.successfullySaved))
          onRefetch?.()
        })
        .catch(handleError)
        .finally(() => setLoading(false))
    })
  }
  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={{
        groupBuying: program.plans
          .filter(v => v.publishedAt)
          .map(plan => ({
            id: plan.id,
            people: plan.groupBuyingPeople,
            listPrice: plan.listPrice,
            salePrice: plan.salePrice,
          })),
      }}
      colon={false}
      onFinish={handleSubmit}
    >
      <Form.List name="groupBuying">
        {(fields, { add, remove }) => (
          <>
            {fields.map((field, index) => (
              <Fragment key={field.fieldKey}>
                {index !== 0 && <Divider className="my-4" />}
                <div className="d-flex justify-content-start">
                  <Form.Item className="d-none" name={[field.name, 'id']} fieldKey={[field.fieldKey, 'id']} />
                  <Form.Item
                    name={[field.name, 'people']}
                    fieldKey={[field.fieldKey, 'people']}
                    label={<StyledLabel>{formatMessage(commonMessages.label.participants)}</StyledLabel>}
                    className="mb-0 mr-3"
                    rules={[
                      {
                        required: true,
                        message: formatMessage(errorMessages.form.isRequired, {
                          field: formatMessage(commonMessages.label.participants),
                        }),
                      },
                    ]}
                  >
                    <InputNumber min={2} parser={value => (value ? value.replace(/\D/g, '') : '')} />
                  </Form.Item>
                  <Form.Item
                    name={[field.name, 'listPrice']}
                    fieldKey={[field.fieldKey, 'listPrice']}
                    label={<StyledLabel>{formatMessage(commonMessages.label.listPrice)}</StyledLabel>}
                    className="mb-0 mr-3"
                    rules={[
                      {
                        required: true,
                        message: formatMessage(errorMessages.form.isRequired, {
                          field: formatMessage(commonMessages.label.listPrice),
                        }),
                      },
                    ]}
                  >
                    <InputNumber
                      min={0}
                      formatter={value => `NT$ ${value}`}
                      parser={value => (value ? value.replace(/\D/g, '') : '')}
                    />
                  </Form.Item>
                  {!!program.plans[0]?.soldAt && (
                    <Form.Item
                      name={[field.name, 'salePrice']}
                      fieldKey={[field.fieldKey, 'salePrice']}
                      label={<StyledLabel>{formatMessage(messages.salePrice)}</StyledLabel>}
                      className="mb-0"
                    >
                      <CurrencyInput noUnit />
                    </Form.Item>
                  )}
                  {fields.length > 1 && (
                    <div className="flex-grow-1 text-right">
                      <StyledDeleteButton type="link" icon={<TrashOIcon />} onClick={() => remove(field.name)} />
                    </div>
                  )}
                </div>
              </Fragment>
            ))}
            <Button type="link" icon={<PlusIcon className="mr-2" />} className="mb-4" onClick={() => add()}>
              新增多人方案
            </Button>
          </>
        )}
      </Form.List>
      <div>
        <Button onClick={() => form.resetFields()} className="mr-2">
          {formatMessage(commonMessages.ui.cancel)}
        </Button>
        <Button type="primary" htmlType="submit" loading={loading}>
          {formatMessage(commonMessages.ui.save)}
        </Button>
      </div>
    </Form>
  )
}

const UPSERT_PROGRAM_GROUP_BUYING_PLAN = gql`
  mutation UPSERT_PROGRAM_GROUP_BUYING_PLAN(
    $programPlans: [program_plan_insert_input!]!
    $archivedProgramPlanIds: [uuid!]!
  ) {
    insert_program_plan(
      objects: $programPlans
      on_conflict: {
        constraint: program_plan_pkey
        update_columns: [
          type
          title
          list_price
          sale_price
          period_type
          sold_at
          auto_renewed
          published_at
          group_buying_people
        ]
      }
    ) {
      affected_rows
    }
    update_program_plan(where: { id: { _in: $archivedProgramPlanIds } }, _set: { published_at: null }) {
      affected_rows
    }
  }
`

export default ProgramGroupBuyingAdminForm

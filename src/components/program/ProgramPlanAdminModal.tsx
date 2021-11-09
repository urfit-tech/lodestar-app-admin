import { FileAddOutlined } from '@ant-design/icons'
import { useMutation } from '@apollo/react-hooks'
import { Button, Form, Input, InputNumber, message, Radio } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import BraftEditor, { EditorState } from 'braft-editor'
import gql from 'graphql-tag'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import React, { useEffect, useState } from 'react'
import { defineMessages, useIntl } from 'react-intl'
import styled from 'styled-components'
import { v4 as uuid } from 'uuid'
import hasura from '../../hasura'
import { handleError } from '../../helpers'
import { commonMessages, errorMessages, programMessages } from '../../helpers/translation'
import { PeriodType } from '../../types/general'
import { ProgramPlan } from '../../types/program'
import AdminModal, { AdminModalProps } from '../admin/AdminModal'
import AdminBraftEditor from '../form/AdminBraftEditor'
import CurrencyInput from '../form/CurrencyInput'
import CurrencySelector from '../form/CurrencySelector'
import PeriodSelector from '../form/PeriodSelector'
import SaleInput, { SaleProps } from '../form/SaleInput'

const StyledNotation = styled.div`
  line-height: 1.5;
  letter-spacing: 0.4px;
  font-size: 14px;
  font-weight: 500;
  color: #9b9b9b;
  white-space: pre-line;
`

const messages = defineMessages({
  isPublished: { id: 'program.label.isPublished', defaultMessage: '是否顯示方案' },
  published: { id: 'program.label.published', defaultMessage: '發售，上架後立即開賣' },
  unpublished: { id: 'program.label.unpublished', defaultMessage: '停售，此方案暫停對外銷售並隱藏' },
  subscriptionPlan: { id: 'program.label.subscriptionPlan', defaultMessage: '訂閱付費方案' },
  permissionType: { id: 'program.label.permissionType', defaultMessage: '選擇內容觀看權限' },
  availableForPastContent: { id: 'program.label.availableForPastContent', defaultMessage: '可看指定方案過去內容' },
  unavailableForPastContent: { id: 'program.label.unavailableForPastContent', defaultMessage: '可看指定方案未來內容' },
  availableForAllContent: { id: 'program.label.availableForAllContent', defaultMessage: '可看課程所有內容' },
  subscriptionPeriodType: { id: 'program.label.subscriptionPeriodType', defaultMessage: '訂閱週期' },
  programExpirationNotice: { id: 'program.label.programExpirationNotice', defaultMessage: '課程到期通知' },
  planDescription: { id: 'program.label.planDescription', defaultMessage: '方案描述' },
})

type FieldProps = {
  title: string
  isPublished: boolean
  period: { type: PeriodType; amount: number }
  remindPeriod: { type: PeriodType; amount: number }
  currencyId?: string
  listPrice: number
  sale: SaleProps
  discountDownPrice?: number
  type: 1 | 2 | 3
  description: EditorState
  groupBuyingPeople?: number
}

type ProgramPlanType = 'perpetual' | 'period' | 'subscription'
const ProgramPlanAdminModal: React.FC<
  Omit<AdminModalProps, 'renderTrigger'> & {
    programId: string
    programPlan?: ProgramPlan
    onRefetch?: () => void
    renderTrigger?: React.FC<{
      onOpen?: () => void
      onClose?: () => void
      onPlanCreate?: (programProgramPlanType: ProgramPlanType) => void
    }>
  }
> = ({ programId, programPlan, onRefetch, renderTrigger, ...modalProps }) => {
  const [programPlanType, setProgramPlanType] = useState<ProgramPlanType>()
  const { formatMessage } = useIntl()
  const [form] = useForm<FieldProps>()
  const { enabledModules } = useApp()
  const [upsertProgramPlan] = useMutation<hasura.UPSERT_PROGRAM_PLAN, hasura.UPSERT_PROGRAM_PLANVariables>(
    UPSERT_PROGRAM_PLAN,
  )
  const [currencyId, setCurrencyId] = useState(programPlan?.currencyId || '')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    programPlan &&
      setProgramPlanType(
        programPlan.autoRenewed
          ? 'subscription'
          : programPlan.periodType && programPlan.periodAmount
          ? 'period'
          : 'perpetual',
      )
  }, [programPlan])

  const withPeriod = programPlanType === 'period' || programPlanType === 'subscription'
  const withRemind = programPlanType === 'period' || programPlanType === 'subscription'
  const withDiscountDownPrice = programPlanType === 'subscription'
  const withAutoRenewed = programPlanType === 'subscription'

  const handleSubmit = (onSuccess: () => void) => {
    form
      .validateFields()
      .then(() => {
        setLoading(true)
        const values = form.getFieldsValue()
        upsertProgramPlan({
          variables: {
            id: programPlan ? programPlan.id : uuid(),
            programId,
            type: values.type || 1,
            title: values.title,
            description: values.description.toRAW(),
            listPrice: values.listPrice || 0,
            salePrice: values.sale ? values.sale.price || 0 : null,
            soldAt: values.sale?.soldAt || null,
            discountDownPrice: withDiscountDownPrice ? values.discountDownPrice : 0,
            periodAmount: withPeriod ? values.period.amount : null,
            periodType: withPeriod ? values.period.type : null,
            remindPeriodAmount: withRemind ? values.remindPeriod.amount : null,
            remindPeriodType: withRemind ? values.remindPeriod.type : null,
            currencyId: values.currencyId || programPlan?.currencyId || 'TWD',
            autoRenewed: withPeriod ? withAutoRenewed : false,
            publishedAt: values.isPublished ? new Date() : null,
            isCountdownTimerVisible: !!values.sale?.isTimerVisible,
            groupBuyingPeople: values.groupBuyingPeople,
          },
        })
          .then(() => {
            message.success(formatMessage(commonMessages.event.successfullySaved))
            onSuccess()
            onRefetch?.()
          })
          .catch(handleError)
          .finally(() => setLoading(false))
      })
      .catch(() => {})
  }
  return (
    <AdminModal
      title={formatMessage(commonMessages.label.salesPlan)}
      icon={<FileAddOutlined />}
      footer={null}
      renderFooter={({ setVisible }) => (
        <>
          <Button className="mr-2" onClick={() => setVisible(false)}>
            {formatMessage(commonMessages.ui.cancel)}
          </Button>
          <Button type="primary" loading={loading} onClick={() => handleSubmit(() => setVisible(false))}>
            {formatMessage(commonMessages.ui.confirm)}
          </Button>
        </>
      )}
      // TODO: too nested to understand
      renderTrigger={({ setVisible }) => {
        return (
          renderTrigger?.({
            onOpen: () => setVisible(true),
            onClose: () => setVisible(false),
            onPlanCreate: programProgramPlanType => {
              setProgramPlanType(programProgramPlanType)
              setVisible(true)
            },
          }) || null
        )
      }}
      {...modalProps}
    >
      <Form
        form={form}
        layout="vertical"
        colon={false}
        hideRequiredMark
        initialValues={{
          title: programPlan?.title,
          isPublished: !!programPlan?.publishedAt,
          currencyId: programPlan?.currencyId,
          listPrice: programPlan?.listPrice,
          sale: programPlan?.soldAt
            ? {
                price: programPlan.salePrice,
                soldAt: programPlan.soldAt,
                timerVisible: !!programPlan?.isCountdownTimerVisible,
              }
            : null,
          period: { amount: programPlan?.periodAmount || 1, type: programPlan?.periodType || 'M' },
          type: programPlan?.type || 1,
          discountDownPrice: programPlan?.discountDownPrice,
          remindPeriod: { amount: programPlan?.remindPeriodAmount || 1, type: programPlan?.remindPeriodType || 'D' },
          description: BraftEditor.createEditorState(programPlan ? programPlan.description : null),
          groupBuyingPeople: programPlan?.groupBuyingPeople || 1,
        }}
      >
        <Form.Item
          label={formatMessage(programMessages.label.planTitle)}
          name="title"
          rules={[
            {
              required: true,
              message: formatMessage(errorMessages.form.isRequired, {
                field: formatMessage(programMessages.label.planTitle),
              }),
            },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item label={formatMessage(messages.isPublished)} name="isPublished">
          <Radio.Group>
            <Radio value={true} className="d-block">
              {formatMessage(messages.published)}
            </Radio>
            <Radio value={false} className="d-block">
              {formatMessage(messages.unpublished)}
            </Radio>
          </Radio.Group>
        </Form.Item>
        <Form.Item label={formatMessage(messages.permissionType)} name="type" rules={[{ required: true }]}>
          <Radio.Group>
            <Radio value={1} className="d-block">
              {formatMessage(messages.availableForPastContent)}
            </Radio>
            <Radio value={2} className="d-block">
              {formatMessage(messages.unavailableForPastContent)}
            </Radio>
            <Radio value={3} className="d-block">
              {formatMessage(messages.availableForAllContent)}
            </Radio>
          </Radio.Group>
        </Form.Item>
        {withPeriod && (
          <Form.Item name="period" label={formatMessage(commonMessages.label.period)}>
            <PeriodSelector />
          </Form.Item>
        )}
        {withRemind && (
          <Form.Item name="remindPeriod" label={formatMessage(messages.programExpirationNotice)}>
            <PeriodSelector />
          </Form.Item>
        )}
        {enabledModules?.currency && (
          <Form.Item
            label={formatMessage(commonMessages.label.currency)}
            name="currencyId"
            rules={[
              {
                required: true,
                message: formatMessage(errorMessages.form.isRequired, {
                  field: formatMessage(commonMessages.label.listPrice),
                }),
              },
            ]}
          >
            <CurrencySelector />
          </Form.Item>
        )}
        <Form.Item label={formatMessage(commonMessages.label.listPrice)} name="listPrice">
          <CurrencyInput currencyId={currencyId} />
        </Form.Item>
        <Form.Item
          name="sale"
          rules={[{ validator: (rule, value, callback) => callback(value && !value.soldAt ? '' : undefined) }]}
        >
          <SaleInput currencyId={currencyId} withTimer />
        </Form.Item>
        {programPlanType === 'subscription' && (
          <Form.Item
            name="discountDownPrice"
            label={formatMessage(commonMessages.label.discountDownPrice)}
            help={
              <StyledNotation className="mt-2 mb-4">
                {formatMessage(commonMessages.text.discountDownNotation)}
              </StyledNotation>
            }
          >
            <CurrencyInput currencyId={currencyId} />
          </Form.Item>
        )}
        {enabledModules['group_buying'] && (
          <Form.Item name="groupBuyingPeople" label={formatMessage(commonMessages.text.groupBuyingPeople)}>
            <InputNumber min={1} />
          </Form.Item>
        )}
        <Form.Item label={formatMessage(messages.planDescription)} name="description">
          <AdminBraftEditor variant="short" />
        </Form.Item>
      </Form>
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
    $periodAmount: numeric
    $periodType: String
    $remindPeriodAmount: Int
    $remindPeriodType: String
    $currencyId: String!
    $autoRenewed: Boolean!
    $publishedAt: timestamptz
    $isCountdownTimerVisible: Boolean!
    $groupBuyingPeople: numeric
  ) {
    insert_program_plan(
      objects: {
        id: $id
        type: $type
        title: $title
        description: $description
        list_price: $listPrice
        sale_price: $salePrice
        period_amount: $periodAmount
        period_type: $periodType
        remind_period_amount: $remindPeriodAmount
        remind_period_type: $remindPeriodType
        discount_down_price: $discountDownPrice
        sold_at: $soldAt
        program_id: $programId
        currency_id: $currencyId
        auto_renewed: $autoRenewed
        published_at: $publishedAt
        is_countdown_timer_visible: $isCountdownTimerVisible
        group_buying_people: $groupBuyingPeople
      }
      on_conflict: {
        constraint: program_plan_pkey
        update_columns: [
          type
          title
          description
          list_price
          sale_price
          discount_down_price
          period_amount
          period_type
          remind_period_amount
          remind_period_type
          sold_at
          currency_id
          auto_renewed
          published_at
          is_countdown_timer_visible
          group_buying_people
        ]
      }
    ) {
      affected_rows
    }
  }
`
export default ProgramPlanAdminModal

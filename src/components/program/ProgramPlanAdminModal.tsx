import { FileAddOutlined } from '@ant-design/icons'
import { useMutation } from '@apollo/react-hooks'
import { Button, Checkbox, Form, Input, InputNumber, message, Radio } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import BraftEditor, { EditorState } from 'braft-editor'
import gql from 'graphql-tag'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import { useGiftPlanMutation } from 'lodestar-app-element/src/hooks/giftPlan'
import moment, { Moment } from 'moment'
import React, { useEffect, useState } from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import { v4 as uuid } from 'uuid'
import hasura from '../../hasura'
import { handleError } from '../../helpers'
import { commonMessages, errorMessages } from '../../helpers/translation'
import { PeriodType } from '../../types/general'
import { ProductGiftPlan } from '../../types/giftPlan'
import { ProgramPlan } from '../../types/program'
import AdminModal, { AdminModalProps } from '../admin/AdminModal'
import AdminBraftEditor from '../form/AdminBraftEditor'
import CurrencyInput from '../form/CurrencyInput'
import CurrencySelector from '../form/CurrencySelector'
import GiftPlanInput from '../form/GiftPlanInput'
import PeriodSelector from '../form/PeriodSelector'
import SaleInput, { SaleProps } from '../form/SaleInput'
import formMessages from '../form/translation'
import programMessages from './translation'

const StyledNotation = styled.div`
  line-height: 1.5;
  letter-spacing: 0.4px;
  font-size: 14px;
  font-weight: 500;
  color: #9b9b9b;
  white-space: pre-line;
`

type FieldProps = {
  title: string
  isPublished: boolean
  isParticipantsVisible: boolean
  period: { type: PeriodType; amount: number }
  remindPeriod: { type: PeriodType; amount: number }
  currencyId?: string
  listPrice: number
  sale: SaleProps
  discountDownPrice?: number
  type: 1 | 2 | 3
  description: EditorState
  groupBuyingPeople?: number
  hasGiftPlan: boolean
  productGiftPlanId: string
  productId?: string
  giftPlanProductId: string
  giftPlanStartedAt?: Moment | null
  giftPlanEndedAt?: Moment | null
}

type ProgramPlanType = 'perpetual' | 'period' | 'subscription'
const ProgramPlanAdminModal: React.FC<
  Omit<AdminModalProps, 'renderTrigger'> & {
    programId: string
    programPlan?: ProgramPlan
    productGiftPlan?: ProductGiftPlan
    onRefetch?: () => void
    onProductGiftPlanRefetch?: () => void
    renderTrigger?: React.FC<{
      onOpen?: (programProgramPlanType: ProgramPlanType) => void
      onClose?: () => void
    }>
  }
> = ({
  programId,
  programPlan,
  productGiftPlan,
  onRefetch,
  onProductGiftPlanRefetch,
  renderTrigger,
  ...modalProps
}) => {
  const [programPlanType, setProgramPlanType] = useState<ProgramPlanType>()
  const [toggle, setToggle] = useState({
    withDiscountDownPrice: false,
    withRemind: false,
  })
  const { formatMessage } = useIntl()
  const [form] = useForm<FieldProps>()
  const { enabledModules } = useApp()
  const { permissions } = useAuth()
  const [upsertProgramPlan] = useMutation<hasura.UPSERT_PROGRAM_PLAN, hasura.UPSERT_PROGRAM_PLANVariables>(
    UPSERT_PROGRAM_PLAN,
  )
  const { upsertProductGiftPlan, deleteProductGiftPlan } = useGiftPlanMutation()
  const [loading, setLoading] = useState(false)
  const currencyId = programPlan?.currencyId || ''

  useEffect(() => {
    if (programPlan) {
      setProgramPlanType(
        programPlan.autoRenewed
          ? 'subscription'
          : programPlan.periodType && programPlan.periodAmount
          ? 'period'
          : 'perpetual',
      )
      setToggle({
        withDiscountDownPrice: !!programPlan.discountDownPrice,
        withRemind: !!programPlan.remindPeriodAmount && !!programPlan.remindPeriodType,
      })
    }
  }, [programPlan])

  const withPeriod = programPlanType === 'period' || programPlanType === 'subscription'
  const withRemind = programPlanType === 'period' || programPlanType === 'subscription'
  const withAutoRenewed = programPlanType === 'subscription'

  const handleSubmit = (onSuccess: () => void) => {
    form
      .validateFields()
      .then(() => {
        setLoading(true)
        const values = form.getFieldsValue()
        const newProgramPlanId = uuid()

        upsertProgramPlan({
          variables: {
            id: programPlan ? programPlan.id : newProgramPlanId,
            programId,
            type: values.type,
            title: values.title,
            description: values.description.toRAW(),
            listPrice: values.listPrice || 0,
            salePrice: values.sale ? values.sale.price || 0 : null,
            soldAt: values.sale?.soldAt || null,
            discountDownPrice: toggle.withDiscountDownPrice && values.discountDownPrice ? values.discountDownPrice : 0,
            periodAmount: withPeriod ? values.period.amount : null,
            periodType: withPeriod ? values.period.type : null,
            remindPeriodAmount: withRemind && toggle.withRemind ? values.remindPeriod.amount : null,
            remindPeriodType: withRemind && toggle.withRemind ? values.remindPeriod.type : null,
            currencyId: values.currencyId || programPlan?.currencyId || 'TWD',
            autoRenewed: withPeriod ? withAutoRenewed : false,
            publishedAt: values.isPublished ? new Date() : null,
            isCountdownTimerVisible: !!values.sale?.isTimerVisible,
            groupBuyingPeople: values.groupBuyingPeople,
            isParticipantsVisible: values.isParticipantsVisible,
          },
        })
          .catch(handleError)
          .finally(() => {
            if (values.hasGiftPlan) {
              upsertProductGiftPlan({
                variables: {
                  productGiftPlanId: values.productGiftPlanId || uuid(),
                  productId: `ProgramPlan_${programPlan ? programPlan.id : newProgramPlanId}`,
                  giftPlanId: values.hasGiftPlan
                    ? typeof values.giftPlanProductId === 'string'
                      ? values.giftPlanProductId
                      : values.giftPlanProductId[0]
                    : null,
                  giftPlanStartedAt:
                    values.hasGiftPlan && values.giftPlanStartedAt ? values.giftPlanStartedAt?.toISOString() : null,
                  giftPlanEndedAt:
                    values.hasGiftPlan && values.giftPlanEndedAt ? values.giftPlanEndedAt?.toISOString() : null,
                },
              })
                .then(() => {
                  setLoading(false)
                  message.success(formatMessage(commonMessages.event.successfullySaved))
                  onSuccess()
                  onProductGiftPlanRefetch?.()
                  onRefetch?.()
                })
                .catch(err => console.log(err))
            } else if (!values.hasGiftPlan && productGiftPlan?.id) {
              deleteProductGiftPlan({
                variables: {
                  productGiftPlanId: productGiftPlan.id,
                },
              })
                .then(() => {
                  setLoading(false)
                  message.success(formatMessage(commonMessages.event.successfullySaved))
                  onSuccess()
                  onProductGiftPlanRefetch?.()
                  onRefetch?.()
                })
                .catch(err => console.log(err))
            } else {
              setLoading(false)
              message.success(formatMessage(commonMessages.event.successfullySaved))
              onSuccess()
              onProductGiftPlanRefetch?.()
              onRefetch?.()
            }
          })
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
            onOpen: programProgramPlanType => {
              setProgramPlanType(programProgramPlanType)
              setVisible(true)
            },
            onClose: () => setVisible(false),
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
          isParticipantsVisible: !!programPlan?.isParticipantsVisible,
          currencyId: programPlan?.currencyId,
          listPrice: programPlan?.listPrice || 0,
          sale: programPlan?.soldAt
            ? {
                price: programPlan.salePrice,
                soldAt: programPlan.soldAt,
                timerVisible: !!programPlan?.isCountdownTimerVisible,
              }
            : null,
          period: { amount: programPlan?.periodAmount || 1, type: programPlan?.periodType || 'M' },
          type: programPlan?.type || 3,
          discountDownPrice: programPlan?.discountDownPrice || 0,
          remindPeriod: { amount: programPlan?.remindPeriodAmount || 1, type: programPlan?.remindPeriodType || 'D' },
          description: BraftEditor.createEditorState(programPlan ? programPlan.description : null),
          groupBuyingPeople: programPlan?.groupBuyingPeople || 1,
          hasGiftPlan: productGiftPlan?.giftPlan.id !== undefined ? true : false,
          productGiftPlanId: productGiftPlan?.id,
          giftPlanProductId: productGiftPlan?.giftPlan.id || undefined,
          giftPlanStartedAt: productGiftPlan?.startedAt ? moment(productGiftPlan.startedAt) : '',
          giftPlanEndedAt: productGiftPlan?.startedAt ? moment(productGiftPlan.endedAt) : '',
        }}
      >
        <Form.Item
          label={formatMessage(programMessages.ProgramPlanAdminModal.planTitle)}
          name="title"
          rules={[
            {
              required: true,
              message: formatMessage(errorMessages.form.isRequired, {
                field: formatMessage(programMessages.ProgramPlanAdminModal.planTitle),
              }),
            },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item label={formatMessage(programMessages.ProgramPlanAdminModal.isPublished)} name="isPublished">
          <Radio.Group>
            <Radio value={true} className="d-block">
              {formatMessage(programMessages.ProgramPlanAdminModal.published)}
            </Radio>
            <Radio value={false} className="d-block">
              {formatMessage(programMessages.ProgramPlanAdminModal.unpublished)}
            </Radio>
          </Radio.Group>
        </Form.Item>
        <Form.Item
          label={formatMessage(programMessages.ProgramPlanAdminModal.isParticipantsVisible)}
          name="isParticipantsVisible"
        >
          <Radio.Group>
            <Radio value={false} className="d-block">
              {formatMessage(programMessages.ProgramPlanAdminModal.invisible)}
            </Radio>
            <Radio value={true} className="d-block">
              {formatMessage(programMessages.ProgramPlanAdminModal.visible)}
            </Radio>
          </Radio.Group>
        </Form.Item>
        <Form.Item
          label={formatMessage(programMessages.ProgramPlanAdminModal.permissionType)}
          name="type"
          rules={[{ required: true }]}
        >
          <Radio.Group>
            <Radio value={3} className="default d-block">
              {formatMessage(programMessages.ProgramPlanAdminModal.availableForAllContent)}
            </Radio>
            <Radio value={1} className="d-block">
              {formatMessage(programMessages.ProgramPlanAdminModal.availableForPastContent)}
            </Radio>
            <Radio value={2} className="d-block">
              {formatMessage(programMessages.ProgramPlanAdminModal.unavailableForPastContent)}
            </Radio>
          </Radio.Group>
        </Form.Item>
        {!!enabledModules.gift && (Boolean(permissions.GIFT_PLAN_ADMIN) || Boolean(permissions.GIFT_PLAN_NORMAL)) && (
          <Form.Item
            label={formatMessage(formMessages.GiftPlanInput.whetherProvideGift)}
            name="hasGiftPlan"
            rules={[{ required: true }]}
          >
            <GiftPlanInput />
          </Form.Item>
        )}
        {withPeriod && (
          <Form.Item name="period" label={formatMessage(commonMessages.label.period)}>
            <PeriodSelector />
          </Form.Item>
        )}
        {withRemind && (
          <div>
            <Checkbox
              checked={toggle.withRemind}
              className="mb-2"
              onChange={e => setToggle({ ...toggle, withRemind: e.target.checked })}
            >
              {formatMessage(programMessages.ProgramPlanAdminModal.programExpirationNotice)}
            </Checkbox>
            {toggle.withRemind && (
              <Form.Item name="remindPeriod">
                <PeriodSelector />
              </Form.Item>
            )}
          </div>
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
          <div>
            <Checkbox
              checked={toggle.withDiscountDownPrice}
              className="mb-2"
              onChange={e => setToggle({ ...toggle, withDiscountDownPrice: e.target.checked })}
            >
              {formatMessage(commonMessages.label.discountDownPrice)}
            </Checkbox>
            {toggle.withDiscountDownPrice && (
              <Form.Item
                name="discountDownPrice"
                help={
                  <StyledNotation className="mt-2 mb-4">
                    {formatMessage(commonMessages.text.discountDownNotation)}
                  </StyledNotation>
                }
              >
                <CurrencyInput currencyId={currencyId} />
              </Form.Item>
            )}
          </div>
        )}
        {enabledModules['group_buying'] && programPlanType === 'perpetual' && (
          <Form.Item name="groupBuyingPeople" label={formatMessage(commonMessages.text.groupBuyingPeople)}>
            <InputNumber min={1} />
          </Form.Item>
        )}
        <Form.Item label={formatMessage(programMessages.ProgramPlanAdminModal.planDescription)} name="description">
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
    $isParticipantsVisible: Boolean!
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
        is_participants_visible: $isParticipantsVisible
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
          is_participants_visible
        ]
      }
    ) {
      affected_rows
    }
  }
`
export default ProgramPlanAdminModal

import { FileAddOutlined } from '@ant-design/icons'
import { gql, useMutation } from '@apollo/client'
import { Button, Form, message } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import BraftEditor, { EditorState } from 'braft-editor'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import { useGiftPlanMutation } from 'lodestar-app-element/src/hooks/giftPlan'
import moment, { Moment } from 'moment'
import React, { useEffect, useState } from 'react'
import { useIntl } from 'react-intl'
import { v4 as uuid } from 'uuid'
import { handleError } from '../../../helpers'
import { commonMessages } from '../../../helpers/translation'
import { useMutateProductLevel } from '../../../hooks/data'
import { PeriodType } from '../../../types/general'
import { ProductGiftPlan } from '../../../types/giftPlan'
import { ProgramPlan } from '../../../types/program'
import AdminModal, { AdminModalProps } from '../../admin/AdminModal'
import { SaleProps } from '../../form/SaleInput'
import {
  CurrencyItem,
  DiscountDownPriceItem,
  GiftItem,
  ListPriceItem,
  ParticipantsItem,
  PeriodItem,
  PermissionItem,
  PlanDescriptionItem,
  ProductLevelItem,
  ProgramExpirationNoticeItem,
  PublishItem,
  SaleItem,
  TitleItem,
} from './formItem'

type SubscriptionFieldProps = {
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
  hasGiftPlan: boolean
  productGiftPlanId: string
  productId?: string
  giftPlanProductId: string
  giftPlanStartedAt?: Moment | null
  giftPlanEndedAt?: Moment | null
  productLevel?: number
}

const SubscriptionPlanModal: React.FC<
  Omit<AdminModalProps, 'renderTrigger'> & {
    programId: string
    programPlan?: ProgramPlan
    productGiftPlan?: ProductGiftPlan
    onRefetch?: () => void
    onProductGiftPlanRefetch?: () => void
    renderTrigger?: React.FC<{
      onOpen?: () => void
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
  const { formatMessage } = useIntl()
  const [form] = useForm<SubscriptionFieldProps>()
  const { enabledModules } = useApp()
  const [upsertProgramPlan] = useMutation(UPSERT_PROGRAM_PLAN)
  const { upsertProductGiftPlan, deleteProductGiftPlan } = useGiftPlanMutation()
  const { updateProductLevel } = useMutateProductLevel()
  const [loading, setLoading] = useState(false)
  const currencyId = programPlan?.currencyId || ''
  const [withRemind, setWithRemind] = useState(false)
  const [withDiscountDownPrice, setWithDiscountDownPrice] = useState(false)

  useEffect(() => {
    setWithRemind(!!programPlan?.remindPeriodAmount && !!programPlan?.remindPeriodType)
    setWithDiscountDownPrice(!!programPlan?.discountDownPrice)
  }, [programPlan])

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
            title: values.title || '',
            description: values.description.toRAW(),
            listPrice: values.listPrice || 0,
            salePrice: values.sale ? values.sale.price || 0 : null,
            soldAt: values.sale?.soldAt || null,
            discountDownPrice: withDiscountDownPrice && values.discountDownPrice ? values.discountDownPrice : 0,
            periodAmount: values.period.amount,
            periodType: values.period.type,
            remindPeriodAmount: withRemind ? values.remindPeriod.amount : null,
            remindPeriodType: withRemind ? values.remindPeriod.type : null,
            currencyId: values.currencyId || programPlan?.currencyId || 'TWD',
            autoRenewed: true,
            publishedAt: values.isPublished ? new Date() : null,
            isCountdownTimerVisible: !!values.sale?.isTimerVisible,
            isParticipantsVisible: values.isParticipantsVisible,
          },
        })
          .then(res => {
            const programPlanId = res.data?.insert_program_plan?.returning?.[0].id
            if (enabledModules.product_level && programPlanId) {
              updateProductLevel({
                variables: { productId: `ProgramPlan_${programPlanId}`, level: values.productLevel },
              }).catch(e => handleError(e))
            }
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
      renderTrigger={({ setVisible }) => {
        return (
          renderTrigger?.({
            onOpen: () => {
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
          title: programPlan?.title || '',
          isPublished: !!programPlan?.publishedAt,
          isParticipantsVisible: !!programPlan?.isParticipantsVisible,
          currencyId: programPlan?.currencyId,
          listPrice: programPlan?.listPrice || 0,
          sale: programPlan?.soldAt
            ? {
                price: programPlan.salePrice,
                soldAt: programPlan.soldAt,
                isTimerVisible: !!programPlan?.isCountdownTimerVisible,
              }
            : null,
          period: { amount: programPlan?.periodAmount || 1, type: programPlan?.periodType || 'M' },
          type: programPlan?.type || 3,
          discountDownPrice: programPlan?.discountDownPrice || 0,
          remindPeriod: { amount: programPlan?.remindPeriodAmount || 1, type: programPlan?.remindPeriodType || 'D' },
          description: BraftEditor.createEditorState(programPlan ? programPlan.description : null),
          hasGiftPlan: productGiftPlan?.giftPlan.id !== undefined ? true : false,
          productGiftPlanId: productGiftPlan?.id,
          giftPlanProductId: productGiftPlan?.giftPlan.id || undefined,
          giftPlanStartedAt: productGiftPlan?.startedAt ? moment(productGiftPlan.startedAt) : '',
          giftPlanEndedAt: productGiftPlan?.startedAt ? moment(productGiftPlan.endedAt) : '',
        }}
      >
        <TitleItem name="title" />
        <PublishItem name="isPublished" />
        <ParticipantsItem name="isParticipantsVisible" />
        <PermissionItem name="type" />
        <GiftItem name="hasGiftPlan" />
        <PeriodItem name="period" />
        <ProgramExpirationNoticeItem
          name="remindPeriod"
          isChecked={withRemind}
          onChange={e => setWithRemind(e.target.checked)}
        />
        <ProductLevelItem name="productLevel" programPlanId={programPlan?.id} />
        <CurrencyItem name="currencyId" />
        <ListPriceItem name="listPrice" programPlanCurrencyId={currencyId} />
        <SaleItem name="sale" programPlanCurrencyId={currencyId} />
        <DiscountDownPriceItem
          name="discountDownPrice"
          isChecked={withDiscountDownPrice}
          ProgramPlanCurrencyId={currencyId}
          onChange={e => setWithDiscountDownPrice(e.target.checked)}
        />
        <PlanDescriptionItem name="description" />
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
          is_participants_visible
        ]
      }
    ) {
      affected_rows
      returning {
        id
      }
    }
  }
`
export default SubscriptionPlanModal

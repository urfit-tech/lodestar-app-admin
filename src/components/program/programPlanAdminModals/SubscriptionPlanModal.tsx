import { FileAddOutlined } from '@ant-design/icons'
import { Button, Form, message } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import BraftEditor from 'braft-editor'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import { useGiftPlanMutation } from 'lodestar-app-element/src/hooks/giftPlan'
import moment from 'moment'
import React, { useEffect, useState } from 'react'
import { useIntl } from 'react-intl'
import { v4 as uuid } from 'uuid'
import { handleError } from '../../../helpers'
import { commonMessages } from '../../../helpers/translation'
import { useMutateProductLevel } from '../../../hooks/data'
import { useUpsertProgramPlan } from '../../../hooks/programPlan'
import { ProductGiftPlan } from '../../../types/giftPlan'
import { ProgramPlan } from '../../../types/program'
import { SubscriptionFieldProps } from '../../../types/programPlan'
import AdminModal, { AdminModalProps } from '../../admin/AdminModal'
import {
  CurrencyItem,
  DiscountDownPriceItem,
  GiftItem,
  ListPriceCircumfixItem,
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
  PriceDescriptionItem,
} from './formItem'

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
    isOpen?: boolean
    setIsOpen?: (open: boolean) => void
  }
> = ({
  programId,
  programPlan,
  productGiftPlan,
  isOpen,
  setIsOpen,
  onRefetch,
  onProductGiftPlanRefetch,
  renderTrigger,
  ...modalProps
}) => {
  const { formatMessage } = useIntl()
  const [form] = useForm<SubscriptionFieldProps>()
  const { enabledModules, settings } = useApp()
  const { upsertProgramPlan } = useUpsertProgramPlan()
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

  const handleSubmit = async (onSuccess: () => void) => {
    try {
      await form.validateFields()
      setLoading(true)
      const values = form.getFieldsValue()
      const newProgramPlanId = uuid()
      const { data: upsertProgramPlanData } = await upsertProgramPlan({
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
          listPricePrefix: values.listPriceCircumfix?.listPricePrefix,
          listPriceSuffix: values.listPriceCircumfix?.listPriceSuffix,
          salePricePrefix: values.sale?.salePricePrefix || '',
          salePriceSuffix: values.sale?.salePriceSuffix || '',
          priceDescription: values?.priceDescription ? values.priceDescription.toHTML() : null,
        },
      })
      const programPlanId = upsertProgramPlanData?.insert_program_plan?.returning?.[0].id
      if (enabledModules.product_level && programPlanId) {
        updateProductLevel({
          variables: { productId: `ProgramPlan_${programPlanId}`, level: values.productLevel },
        }).catch(e => handleError(e))
      }
      if (values.hasGiftPlan) {
        await upsertProductGiftPlan({
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
      } else if (!values.hasGiftPlan && productGiftPlan?.id) {
        await deleteProductGiftPlan({
          variables: {
            productGiftPlanId: productGiftPlan.id,
          },
        })
      }

      message.success(formatMessage(commonMessages.event.successfullySaved))
      onSuccess()
      onProductGiftPlanRefetch?.()
      form.resetFields()
      onRefetch?.()
    } catch (err) {
      console.log(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AdminModal
      title={formatMessage(commonMessages.label.subscriptionPlan)}
      icon={<FileAddOutlined />}
      footer={null}
      renderFooter={({ setVisible }) => (
        <>
          <Button
            className="mr-2"
            onClick={() => {
              setVisible(false)
              setIsOpen?.(false)
            }}
          >
            {formatMessage(commonMessages.ui.cancel)}
          </Button>
          <Button
            type="primary"
            loading={loading}
            onClick={() =>
              handleSubmit(() => {
                setVisible(false)
                setIsOpen?.(false)
              })
            }
          >
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
      isOpen={isOpen}
      setIsOpen={setIsOpen}
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
          listPriceCircumfix: {
            listPricePrefix: programPlan?.listPricePrefix || null,
            listPriceSuffix: programPlan?.listPriceSuffix || null,
          },
          sale: programPlan?.soldAt
            ? {
                price: programPlan.salePrice,
                soldAt: programPlan.soldAt,
                isTimerVisible: !!programPlan?.isCountdownTimerVisible,
                salePricePrefix: programPlan?.salePricePrefix || '',
                salePriceSuffix: programPlan?.salePriceSuffix || '',
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
          giftPlanStartedAt: productGiftPlan?.startedAt ? moment(productGiftPlan.startedAt) : null,
          giftPlanEndedAt: productGiftPlan?.endedAt ? moment(productGiftPlan.endedAt) : null,
          priceDescription: BraftEditor.createEditorState(programPlan?.priceDescription),
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
        <ListPriceItem name="listPrice" />
        {settings['program.layout_template_circumfix.enabled'] ? (
          <ListPriceCircumfixItem name="listPriceCircumfix" />
        ) : null}
        <SaleItem name="sale" programPlanCurrencyId={currencyId} />
        <DiscountDownPriceItem
          name="discountDownPrice"
          isChecked={withDiscountDownPrice}
          ProgramPlanCurrencyId={currencyId}
          onChange={e => setWithDiscountDownPrice(e.target.checked)}
        />
        {settings['program.layout_template_price_description.enabled'] ? (
          <PriceDescriptionItem name="priceDescription" />
        ) : null}
        <PlanDescriptionItem name="description" />
      </Form>
    </AdminModal>
  )
}

export default SubscriptionPlanModal

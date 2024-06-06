import { FileAddOutlined } from '@ant-design/icons'
import { Button, Form, message } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import { v4 as uuid } from 'uuid'
import { commonMessages } from '../../../helpers/translation'
import { useMembershipCardByTargetId, useUpsertCardProduct, useUpsertProgramPlan } from '../../../hooks/programPlan'
import { MembershipPlanModalFieldProps, MembershipPlanModalProps } from '../../../types/programPlan'
import AdminModal from '../../admin/AdminModal'
import { MembershipItem, PermissionItem, TitleItem } from './formItem'

const MembershipPlanModal: React.FC<MembershipPlanModalProps> = ({
  programId,
  programPlan,
  onRefetch,
  onProductGiftPlanRefetch,
  renderTrigger,
  isOpen,
  setIsOpen,
  ...modalProps
}) => {
  const { formatMessage } = useIntl()
  const [form] = useForm<MembershipPlanModalFieldProps>()
  const [submitLoading, setSubmitLoading] = useState(false)
  const { upsertProgramPlan } = useUpsertProgramPlan()
  const { upsertCardProduct } = useUpsertCardProduct()
  const { cardProducts, refetchMembershipCard } = useMembershipCardByTargetId('ProgramPlan', programPlan?.id || '')
  const currentCardProduct = cardProducts.find(card => card.targetId === programPlan?.id)

  const handleSubmit = async (onSuccess: () => void) => {
    try {
      await form.validateFields()
      setSubmitLoading(true)
      const values: MembershipPlanModalFieldProps = form.getFieldsValue()
      const { data: upsertProgramPlanData } = await upsertProgramPlan({
        variables: {
          id: programPlan ? programPlan.id : uuid(),
          programId,
          type: values.type,
          title: values.title || '',
          autoRenewed: false,
          listPrice: 0,
          currencyId: 'TWD',
          discountDownPrice: 0,
          isParticipantsVisible: false,
          isCountdownTimerVisible: false,
        },
      })
      if (values.membershipCard) {
        upsertProgramPlanData?.insert_program_plan?.returning.map(async plan => {
          await upsertCardProduct({
            variables: {
              id: currentCardProduct ? currentCardProduct.cardProductId : uuid(),
              productType: 'ProgramPlan',
              targetId: plan.id,
              cardId: values.membershipCard,
            },
          })
        })
      }
      setSubmitLoading(false)
      message.success(formatMessage(commonMessages.event.successfullySaved))
      onSuccess()
      onRefetch?.()
      onProductGiftPlanRefetch?.()
      refetchMembershipCard()
      form.resetFields()
    } catch (err) {
      console.log(err)
    }
  }

  return (
    <AdminModal
      title={formatMessage(commonMessages.label.membershipPlan)}
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
            loading={submitLoading}
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
          type: programPlan?.type || 3,
        }}
      >
        <TitleItem name="title" />
        <PermissionItem name="type" />
        <MembershipItem name="membershipCard" membershipId={currentCardProduct?.cardId} />
      </Form>
    </AdminModal>
  )
}

export default MembershipPlanModal

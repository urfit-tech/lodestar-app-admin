import { FileAddOutlined } from '@ant-design/icons'
import { gql, useMutation } from '@apollo/client'
import { Button, Form, message } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import { v4 as uuid } from 'uuid'
import { handleError } from '../../../helpers'
import { commonMessages } from '../../../helpers/translation'
import { ProgramPlan } from '../../../types/program'
import AdminModal, { AdminModalProps } from '../../admin/AdminModal'
import { PermissionItem, TitleItem } from './formItem'

type FieldProps = {
  title: string
  type: 1 | 2 | 3
}

const MembershipPlanModal: React.FC<
  Omit<AdminModalProps, 'renderTrigger'> & {
    programId: string
    programPlan?: ProgramPlan
    onRefetch?: () => void
    onProductGiftPlanRefetch?: () => void
    renderTrigger?: React.FC<{
      onOpen?: () => void
      onClose?: () => void
    }>
  }
> = ({ programId, programPlan, onRefetch, onProductGiftPlanRefetch, renderTrigger, ...modalProps }) => {
  const { formatMessage } = useIntl()
  const [form] = useForm<FieldProps>()
  const [upsertProgramPlan] = useMutation(UPSERT_MEMBERSHIP_PLAN)
  const [loading, setLoading] = useState(false)

  const handleSubmit = (onSuccess: () => void) => {
    form
      .validateFields()
      .then(() => {
        setLoading(true)
        const values: FieldProps = form.getFieldsValue()
        const newProgramPlanId = uuid()

        upsertProgramPlan({
          variables: {
            id: programPlan ? programPlan.id : newProgramPlanId,
            programId,
            type: values.type,
            title: values.title || '',
            autoRenewed: false,
            listPrice: 0,
          },
        })
          .then(_ => {})
          .catch(handleError)
          .finally(() => {
            setLoading(false)
            message.success(formatMessage(commonMessages.event.successfullySaved))
            onSuccess()
            onProductGiftPlanRefetch?.()
            onRefetch?.()
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
          type: programPlan?.type || 3,
        }}
      >
        <TitleItem name="title" />
        <PermissionItem name="type" />
      </Form>
    </AdminModal>
  )
}

const UPSERT_MEMBERSHIP_PLAN = gql`
  mutation UPSERT_MEMBERSHIP_PLAN(
    $programId: uuid!
    $id: uuid!
    $type: Int!
    $title: String!
    $autoRenewed: Boolean!
    $listPrice: numeric!
  ) {
    insert_program_plan(
      objects: {
        program_id: $programId
        id: $id
        type: $type
        title: $title
        auto_renewed: $autoRenewed
        list_price: $listPrice
      }
      on_conflict: { constraint: program_plan_pkey, update_columns: [type, title, auto_renewed, list_price] }
    ) {
      affected_rows
      returning {
        id
      }
    }
  }
`
export default MembershipPlanModal

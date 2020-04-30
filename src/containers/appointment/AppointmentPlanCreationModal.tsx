import { useMutation } from '@apollo/react-hooks'
import { Button, Form, Icon, Input } from 'antd'
import { FormComponentProps } from 'antd/lib/form'
import gql from 'graphql-tag'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import useRouter from 'use-react-router'
import AdminModal from '../../components/admin/AdminModal'
import CreatorSelector from '../../components/common/CreatorSelector'
import { useAuth } from '../../contexts/AuthContext'
import { handleError } from '../../helpers'
import { appointmentMessages, commonMessages, errorMessages } from '../../helpers/translation'
import { useMember } from '../../hooks/member'
import types from '../../types'

const AppointmentPlanCreationModal: React.FC<FormComponentProps> = ({ form }) => {
  const { formatMessage } = useIntl()
  const { history } = useRouter()
  const { currentMemberId, currentUserRole } = useAuth()
  const { member } = useMember(currentMemberId || '')

  const [createAppointmentPlan] = useMutation<types.CREATE_APPOINTMENT_PLAN, types.CREATE_APPOINTMENT_PLANVariables>(
    CREATE_APPOINTMENT_PLAN,
  )

  const [loading, setLoading] = useState(false)

  const handleSubmit = () => {
    form.validateFields((error, values) => {
      if (error) {
        return
      }

      setLoading(true)

      createAppointmentPlan({
        variables: {
          title: values.title,
          creatorId: currentUserRole === 'app-owner' ? values.creatorId : currentMemberId,
        },
      })
        .then(({ data }) =>
          history.push(
            `/${currentUserRole === 'app-owner' ? 'admin' : 'studio'}/appointment-plans/${
              data && data.insert_appointment_plan ? data.insert_appointment_plan.returning[0].id : ''
            }`,
          ),
        )
        .catch(error => {
          handleError(error)
          setLoading(false)
        })
    })
  }

  if (!member) {
    return (
      <Button icon="file-add" disabled>
        {formatMessage(appointmentMessages.ui.createPlan)}
      </Button>
    )
  }

  return (
    <AdminModal
      renderTrigger={({ setVisible }) => (
        <Button type="primary" icon="file-add" onClick={() => setVisible(true)}>
          {formatMessage(appointmentMessages.ui.createPlan)}
        </Button>
      )}
      title={formatMessage(appointmentMessages.ui.createPlan)}
      icon={<Icon type="file-add" />}
      cancelText={formatMessage(commonMessages.ui.cancel)}
      okText={formatMessage(commonMessages.ui.create)}
      okButtonProps={{ loading }}
      onOk={() => handleSubmit()}
    >
      <Form hideRequiredMark colon={false} onSubmit={e => e.preventDefault()}>
        {member.role === 'app-owner' && (
          <Form.Item
            label={formatMessage(commonMessages.label.selectInstructor)}
            className={currentUserRole !== 'app-owner' ? 'd-none' : ''}
          >
            {form.getFieldDecorator('creatorId', {
              rules: [{ required: true, message: formatMessage(errorMessages.form.selectInstructor) }],
            })(<CreatorSelector />)}
          </Form.Item>
        )}
        <Form.Item label={formatMessage(commonMessages.term.planTitle)}>
          {form.getFieldDecorator('title', {
            initialValue: 'Untitled',
            rules: [
              {
                required: true,
                message: formatMessage(errorMessages.form.isRequired, {
                  field: formatMessage(commonMessages.term.planTitle),
                }),
              },
            ],
          })(<Input maxLength={10} />)}
        </Form.Item>
      </Form>
    </AdminModal>
  )
}

const CREATE_APPOINTMENT_PLAN = gql`
  mutation CREATE_APPOINTMENT_PLAN($title: String!, $creatorId: String!) {
    insert_appointment_plan(objects: { title: $title, creator_id: $creatorId, duration: 0 }) {
      affected_rows
      returning {
        id
      }
    }
  }
`

export default Form.create<FormComponentProps>()(AppointmentPlanCreationModal)

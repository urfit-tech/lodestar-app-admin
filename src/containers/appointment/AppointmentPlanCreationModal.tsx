import { useMutation } from '@apollo/react-hooks'
import { Button, Form, Icon, Input } from 'antd'
import { FormComponentProps } from 'antd/lib/form'
import gql from 'graphql-tag'
import React, { useState } from 'react'
import useRouter from 'use-react-router'
import AdminModal from '../../components/admin/AdminModal'
import CreatorSelector from '../../containers/common/CreatorSelector'
import { handleError } from '../../helpers'
import types from '../../types'

const AppointmentPlanCreationModal: React.FC<FormComponentProps> = ({ form }) => {
  const { history } = useRouter()

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
          creatorId: values.creatorId,
        },
      })
        .then(({ data }) =>
          history.push(
            `/admin/appointment-plans/${
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

  return (
    <AdminModal
      renderTrigger={({ setVisible }) => (
        <Button type="primary" icon="file-add" onClick={() => setVisible(true)}>
          建立方案
        </Button>
      )}
      title="建立方案"
      icon={<Icon type="file-add" />}
      renderFooter={({ setVisible }) => (
        <>
          <Button className="mr-2" onClick={() => setVisible(false)}>
            取消
          </Button>
          <Button type="primary" loading={loading} onClick={() => handleSubmit()}>
            建立
          </Button>
        </>
      )}
    >
      <Form hideRequiredMark colon={false} onSubmit={e => e.preventDefault()}>
        <Form.Item label="選擇老師">
          {form.getFieldDecorator('creatorId', {
            initialValue: '',
            rules: [{ required: true, message: '請選擇老師' }],
          })(<CreatorSelector />)}
        </Form.Item>
        <Form.Item label="方案名稱">
          {form.getFieldDecorator('title', {
            initialValue: '未命名方案',
            rules: [{ required: true, message: '請輸入方案名稱' }],
          })(<Input />)}
        </Form.Item>
      </Form>
    </AdminModal>
  )
}

const CREATE_APPOINTMENT_PLAN = gql`
  mutation CREATE_APPOINTMENT_PLAN($title: String!, $creatorId: String!) {
    insert_appointment_plan(objects: { title: $title, creator_id: $creatorId }) {
      affected_rows
      returning {
        id
      }
    }
  }
`

export default Form.create<FormComponentProps>()(AppointmentPlanCreationModal)

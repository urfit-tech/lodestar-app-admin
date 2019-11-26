import { useMutation } from '@apollo/react-hooks'
import { Button, Form, Icon, Input, message, Radio } from 'antd'
import { FormComponentProps } from 'antd/lib/form'
import gql from 'graphql-tag'
import React, { useState } from 'react'
import useRouter from 'use-react-router'
import types from '../../types'
import { useAuth } from '../auth/AuthContext'
import AdminModal from '../common/AdminModal'
import ProgramCategorySelector from './ProgramCategorySelector'

const ProgramCreationModal: React.FC<FormComponentProps> = ({ form }) => {
  const { currentMemberId } = useAuth()
  const { history } = useRouter()

  const [createProgram] = useMutation<types.INSERT_PROGRAM, types.INSERT_PROGRAMVariables>(INSERT_PROGRAM)

  const [loading, setLoading] = useState()

  const handleSubmit = () => {
    form.validateFields((error, values) => {
      if (!error && createProgram) {
        setLoading(true)
        createProgram({
          variables: {
            memberId: currentMemberId || '',
            appId: localStorage.getItem('kolable.app.id') || 'default',
            title: values.title,
            isSubscription: values.isSubscription,
            programCategories: values.categoryIds.map((categoryId: string, idx: number) => ({
              category_id: categoryId,
              position: idx,
            })),
          },
        })
          .then((res: any) => {
            const { id } = res.data.insert_program.returning[0]
            history.push(`/studio/programs/${id}`)
          })
          .catch(error => {
            setLoading(false)
            message.error(error.message)
          })
      }
    })
  }

  return (
    <AdminModal
      renderTrigger={({ setVisible }) => (
        <Button icon="plus" className="mb-4" onClick={() => setVisible(true)}>
          建立課程
        </Button>
      )}
      title="建立課程"
      icon={<Icon type="plus" />}
      renderFooter={({ setVisible }) => (
        <>
          <Button className="mr-2" onClick={() => setVisible(false)}>
            取消
          </Button>
          <Button type="primary" loading={loading} onClick={() => handleSubmit()}>
            建立課程
          </Button>
        </>
      )}
    >
      <Form>
        <Form.Item className="mb-1" label="課程名稱">
          {form.getFieldDecorator('title', { rules: [{ required: true }] })(<Input />)}
        </Form.Item>
        <Form.Item label="類別">
          {form.getFieldDecorator('categoryIds', { initialValue: [] })(<ProgramCategorySelector />)}
        </Form.Item>
        <Form.Item label="選擇課程付費方案">
          {form.getFieldDecorator('isSubscription', {
            initialValue: false,
            rules: [{ required: true }],
          })(
            <Radio.Group
              options={[
                { label: '單次付費', value: false },
                { label: '訂閱付費', value: true },
              ]}
            />,
          )}
        </Form.Item>
      </Form>
    </AdminModal>
  )
}

const INSERT_PROGRAM = gql`
  mutation INSERT_PROGRAM(
    $memberId: String!
    $appId: String!
    $title: String!
    $isSubscription: Boolean!
    $programCategories: [program_category_insert_input!]!
  ) {
    insert_program(
      objects: {
        app_id: $appId
        title: $title
        is_subscription: $isSubscription
        program_roles: { data: [{ member_id: $memberId, name: "owner" }, { member_id: $memberId, name: "instructor" }] }
        program_categories: { data: $programCategories }
      }
    ) {
      returning {
        id
      }
    }
  }
`
export default Form.create<FormComponentProps>()(ProgramCreationModal)

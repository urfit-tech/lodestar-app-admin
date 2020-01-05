import { useMutation } from '@apollo/react-hooks'
import { Button, Form, Icon, Input, message, Radio } from 'antd'
import { FormComponentProps } from 'antd/lib/form'
import gql from 'graphql-tag'
import React, { useState } from 'react'
import useRouter from 'use-react-router'
import CreatorSelector from '../../containers/common/CreatorSelector'
import { useAuth } from '../../contexts/AuthContext'
import types from '../../types'
import AdminModal from '../admin/AdminModal'
import ProgramCategorySelector from './ProgramCategorySelector'

type ProgramCreationModalProps = FormComponentProps & {
  withSelector?: boolean
}
const ProgramCreationModal: React.FC<ProgramCreationModalProps> = ({ form, withSelector }) => {
  const { currentMemberId } = useAuth()
  const { history } = useRouter()

  const [createProgram] = useMutation<types.INSERT_PROGRAM, types.INSERT_PROGRAMVariables>(INSERT_PROGRAM)

  const [loading, setLoading] = useState(false)

  const handleSubmit = () => {
    form.validateFields((error, values) => {
      if (!error && currentMemberId) {
        setLoading(true)
        createProgram({
          variables: {
            ownerId: currentMemberId,
            instructorId: values.memberId || currentMemberId,
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
            history.push(`/programs/${id}`)
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
        <Button type="primary" icon="file-add" className="mb-4" onClick={() => setVisible(true)}>
          建立課程
        </Button>
      )}
      title="建立課程"
      icon={<Icon type="file-add" />}
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
        {withSelector && (
          <Form.Item label="選擇老師">
            {form.getFieldDecorator('memberId', {
              initialValue: currentMemberId,
            })(<CreatorSelector />)}
          </Form.Item>
        )}
        <Form.Item label="課程名稱" className="mb-1">
          {form.getFieldDecorator('title', {
            rules: [{ required: true }],
          })(<Input />)}
        </Form.Item>
        <Form.Item label="類別">
          {form.getFieldDecorator('categoryIds', {
            initialValue: [],
          })(<ProgramCategorySelector />)}
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
    $ownerId: String!
    $instructorId: String!
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
        program_roles: {
          data: [{ member_id: $ownerId, name: "owner" }, { member_id: $instructorId, name: "instructor" }]
        }
        program_categories: { data: $programCategories }
      }
    ) {
      returning {
        id
      }
    }
  }
`
export default Form.create<ProgramCreationModalProps>()(ProgramCreationModal)

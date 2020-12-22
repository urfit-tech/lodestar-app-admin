import Icon, { MoreOutlined } from '@ant-design/icons'
import { useMutation } from '@apollo/react-hooks'
import { Button, DatePicker, Dropdown, Form, Input, Menu, Select } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import TextArea from 'antd/lib/input/TextArea'
import gql from 'graphql-tag'
import moment, { Moment } from 'moment'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import { handleError } from '../../helpers'
import { commonMessages, errorMessages, memberMessages } from '../../helpers/translation'
import { ReactComponent as ExternalLinkIcon } from '../../images/icon/external-link-square.svg'
import types from '../../types'
import { MemberTaskProps } from '../../types/member'
import { MemberTaskTag } from '../admin'
import AdminModal, { AdminModalProps } from '../admin/AdminModal'
import AllMemberSelector from '../form/AllMemberSelector'
import CategorySelector from '../form/CategorySelector'

const StyledLinkIconWrapper = styled.span`
  cursor: pointer;
  & path {
    fill: ${props => props.theme['@primary-color']};
  }
  color: ${props => props.theme['@primary-color']};
`
const StyledFormItemWrapper = styled.div`
  & label {
    width: 100%;
  }
`

type FieldProps = {
  title: string
  categoryId: string | null
  memberId: string | null
  executorId: string | null
  priority: MemberTaskProps['priority']
  status: MemberTaskProps['status']
  dueAt: Moment | null
  description: string | null
}

const MemberTaskAdminModal: React.FC<
  {
    memberTask?: MemberTaskProps
    initialMemberId?: string
    initialExecutorId?: string
    onRefetch?: () => void
  } & AdminModalProps
> = ({ memberTask, initialMemberId, initialExecutorId, onRefetch, onCancel, ...props }) => {
  const { formatMessage } = useIntl()
  const [form] = useForm<FieldProps>()
  const [insertTask] = useMutation<types.INSERT_TASK, types.INSERT_TASKVariables>(INSERT_TASK)
  const [deleteTask] = useMutation<types.DELETE_TASK, types.DELETE_TASKVariables>(DELETE_TASK)
  const [loading, setLoading] = useState(false)

  const handleSubmit = (onSuccess?: () => void) => {
    form
      .validateFields()
      .then(() => {
        setLoading(true)
        const values = form.getFieldsValue()
        if (memberTask) {
          insertTask({
            variables: {
              data: [
                {
                  id: memberTask.id,
                  title: values.title,
                  category_id: values.categoryId,
                  member_id: values.memberId,
                  executor_id: values.executorId,
                  priority: values.priority,
                  status: values.status,
                  due_at: values.dueAt?.toDate(),
                  description: values.description,
                },
              ],
            },
          })
            .then(() => {
              onRefetch?.()
              onSuccess?.()
            })
            .catch(handleError)
            .finally(() => setLoading(false))
        } else {
          insertTask({
            variables: {
              data: [
                {
                  title: values.title,
                  category_id: values.categoryId,
                  member_id: values.memberId,
                  executor_id: values.executorId,
                  priority: values.priority,
                  status: values.status,
                  due_at: values.dueAt?.toDate(),
                  description: values.description,
                },
              ],
            },
          })
            .then(() => {
              onRefetch?.()
              onSuccess?.()
              form.resetFields()
            })
            .catch(handleError)
            .finally(() => setLoading(false))
        }
      })
      .catch(() => {})
  }

  return (
    <AdminModal
      footer={null}
      renderFooter={({ setVisible }) => (
        <>
          <Button
            className="mr-2"
            onClick={e => {
              onCancel?.(e)
              setVisible(false)
            }}
          >
            {formatMessage(commonMessages.ui.cancel)}
          </Button>
          <Button type="primary" loading={loading} onClick={() => handleSubmit(() => setVisible(false))}>
            {formatMessage(commonMessages.ui.confirm)}
          </Button>
          {memberTask && (
            <Dropdown
              trigger={['click']}
              overlay={
                <Menu>
                  <Menu.Item
                    className="cursor-pointer"
                    onClick={() =>
                      deleteTask({ variables: { taskId: memberTask.id } })
                        .then(() => onRefetch?.())
                        .catch(handleError)
                    }
                  >
                    {formatMessage(commonMessages.ui.delete)}
                  </Menu.Item>
                </Menu>
              }
            >
              <Button type="link" icon={<MoreOutlined />} />
            </Dropdown>
          )}
        </>
      )}
      onCancel={onCancel}
      {...props}
    >
      <Form
        form={form}
        layout="vertical"
        colon={false}
        hideRequiredMark
        initialValues={{
          title: memberTask?.title,
          categoryId: memberTask?.category?.id,
          memberId: memberTask?.member?.id || initialMemberId,
          executorId: memberTask?.executor?.id || initialExecutorId,
          priority: memberTask?.priority || 'high',
          status: memberTask?.status || 'pending',
          dueAt: memberTask?.dueAt ? moment(memberTask.dueAt) : null,
          description: memberTask?.description,
        }}
      >
        <Form.Item
          label={formatMessage(memberMessages.label.taskTitle)}
          name="title"
          rules={[
            {
              required: true,
              message: formatMessage(errorMessages.form.isRequired, {
                field: formatMessage(memberMessages.label.taskTitle),
              }),
            },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item label={formatMessage(memberMessages.label.category)} name="categoryId">
          <CategorySelector classType="task" single />
        </Form.Item>
        <div className="row">
          <StyledFormItemWrapper className="col-6">
            <Form.Item
              label={
                <span className="d-flex justify-content-between" style={{ width: 'inherit' }}>
                  {formatMessage(memberMessages.label.target)}
                  <StyledLinkIconWrapper
                    onClick={() => {
                      form.getFieldValue('memberId') &&
                        window.open(`/admin/members/${form.getFieldValue('memberId')}`, '_blank')
                    }}
                  >
                    <Icon component={() => <ExternalLinkIcon />} className="mr-1" />
                    {formatMessage(commonMessages.ui.check)}
                  </StyledLinkIconWrapper>
                </span>
              }
              name="memberId"
              rules={[
                {
                  required: true,
                  message: formatMessage(errorMessages.form.isRequired, {
                    field: formatMessage(memberMessages.label.target),
                  }),
                },
              ]}
            >
              <AllMemberSelector />
            </Form.Item>
          </StyledFormItemWrapper>
          <div className="col-6">
            <Form.Item label={formatMessage(memberMessages.label.assign)} name="executorId">
              <AllMemberSelector />
            </Form.Item>
          </div>
        </div>

        <div className="row">
          <div className="col-6">
            <Form.Item label={formatMessage(memberMessages.label.priority)} name="priority">
              <Select>
                <Select.Option value="high">
                  <MemberTaskTag variant="high">{formatMessage(memberMessages.status.priorityHigh)}</MemberTaskTag>
                </Select.Option>
                <Select.Option value="medium">
                  <MemberTaskTag variant="medium">{formatMessage(memberMessages.status.priorityMedium)}</MemberTaskTag>
                </Select.Option>
                <Select.Option value="low">
                  <MemberTaskTag variant="low">{formatMessage(memberMessages.status.priorityLow)}</MemberTaskTag>
                </Select.Option>
              </Select>
            </Form.Item>
          </div>
          <div className="col-6">
            <Form.Item label={formatMessage(memberMessages.label.status)} name="status">
              <Select>
                <Select.Option value="pending">
                  <MemberTaskTag variant="pending">{formatMessage(memberMessages.status.statusPending)}</MemberTaskTag>
                </Select.Option>
                <Select.Option value="in-progress">
                  <MemberTaskTag variant="in-progress">
                    {formatMessage(memberMessages.status.statusInProgress)}
                  </MemberTaskTag>
                </Select.Option>
                <Select.Option value="done">
                  <MemberTaskTag variant="done">{formatMessage(memberMessages.status.statusDone)}</MemberTaskTag>
                </Select.Option>
              </Select>
            </Form.Item>
          </div>
        </div>

        <Form.Item label={formatMessage(memberMessages.label.dueDate)} name="dueAt">
          <DatePicker
            format="YYYY-MM-DD HH:mm"
            showTime={{ format: 'HH:mm', defaultValue: moment('00:00:00', 'HH:mm:ss') }}
            style={{ width: '100%' }}
          />
        </Form.Item>
        <Form.Item label={formatMessage(memberMessages.label.taskDescription)} name="description">
          <TextArea />
        </Form.Item>
      </Form>
    </AdminModal>
  )
}

const INSERT_TASK = gql`
  mutation INSERT_TASK($data: [member_task_insert_input!]!) {
    insert_member_task(
      objects: $data
      on_conflict: {
        constraint: member_task_pkey
        update_columns: [title, category_id, member_id, executor_id, priority, status, due_at, description]
      }
    ) {
      affected_rows
    }
  }
`
const DELETE_TASK = gql`
  mutation DELETE_TASK($taskId: String!) {
    delete_member_task(where: { id: { _eq: $taskId } }) {
      affected_rows
    }
  }
`

export default MemberTaskAdminModal

import { FileAddOutlined } from '@ant-design/icons'
import { gql, useMutation } from '@apollo/client'
import { Button, Form, Input, message, Skeleton } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import hasura from '../../hasura'
import { handleError } from '../../helpers'
import { commonMessages, errorMessages } from '../../helpers/translation'
import { useDefaultPermissions } from '../../hooks/permission'
import { PermissionGroupProps } from '../../types/general'
import AdminModal, { AdminModalProps } from '../admin/AdminModal'
import PermissionInput from '../form/PermissionInput'

type FieldProps = {
  name: string
  permissionIds: string[]
}

const PermissionGroupAdminModal: React.FC<
  AdminModalProps &
    Partial<PermissionGroupProps> & {
      onRefetch?: () => void
    }
> = ({ id, name, permissionIds, onRefetch, ...props }) => {
  const { formatMessage } = useIntl()
  const { id: appId } = useApp()
  const [form] = useForm<FieldProps>()
  const [loading, setLoading] = useState(false)
  const { loadingPermissions, defaultRolePermissions } = useDefaultPermissions()
  const [insertPermissionGroup] = useMutation<hasura.INSERT_PERMISSION_GROUP, hasura.INSERT_PERMISSION_GROUPVariables>(
    INSERT_PERMISSION_GROUP,
  )
  const [updatePermissionGroup] = useMutation<hasura.UPDATE_PERMISSION_GROUP, hasura.UPDATE_PERMISSION_GROUPVariables>(
    UPDATE_PERMISSION_GROUP,
  )
  const [insertPermissionGroupPermission] = useMutation<
    hasura.INSERT_PERMISSION_GROUP_PERMISSION,
    hasura.INSERT_PERMISSION_GROUP_PERMISSIONVariables
  >(INSERT_PERMISSION_GROUP_PERMISSION)
  const [updatePermissionGroupPermission] = useMutation<
    hasura.UPDATE_PERMISSION_GROUP_PERMISSION,
    hasura.UPDATE_PERMISSION_GROUP_PERMISSIONVariables
  >(UPDATE_PERMISSION_GROUP_PERMISSION)

  const handleSubmit = (onSuccess: () => void) => {
    form
      .validateFields()
      .then(() => {
        setLoading(true)
        const values = form.getFieldsValue()
        if (id) {
          updatePermissionGroup({ variables: { id: id, name: values.name } })
          updatePermissionGroupPermission({
            variables: {
              permissionGroupPermissionId: id,
              permissionGroups:
                values.permissionIds.map(permissionId => ({
                  permission_group_id: id,
                  permission_id: permissionId,
                })) || [],
            },
          }).then(() => {
            message.success(formatMessage(commonMessages.event.successfullyEdited))
            onRefetch?.()
          })
        } else {
          insertPermissionGroup({ variables: { appId: appId, name: values.name } }).then(({ data }) => {
            const permissionGroupId = data?.insert_permission_group?.returning[0].id
            insertPermissionGroupPermission({
              variables: {
                permissionGroups: values.permissionIds
                  ? values.permissionIds.map(permissionId => ({
                      permission_group_id: permissionGroupId,
                      permission_id: permissionId,
                    }))
                  : [],
              },
            }).then(() => {
              message.success(formatMessage(commonMessages.event.successfullyCreated))
              onRefetch?.()
            })
          })
        }
        form.resetFields()
        onSuccess()
      })
      .catch(handleError)
      .finally(() => setLoading(false))
  }

  if (loadingPermissions || !defaultRolePermissions) {
    return <Skeleton active />
  }

  return (
    <AdminModal
      width="60%"
      icon={<FileAddOutlined />}
      footer={null}
      renderFooter={({ setVisible }) => (
        <>
          <Button className="mr-2" onClick={() => setVisible(false)}>
            {formatMessage(commonMessages.ui.cancel)}
          </Button>
          <Button type="primary" loading={loading} onClick={() => handleSubmit(() => setVisible(false))}>
            {formatMessage(commonMessages.ui.save)}
          </Button>
        </>
      )}
      {...props}
    >
      <Form
        form={form}
        layout="vertical"
        colon={false}
        hideRequiredMark
        initialValues={{
          name,
          permissionIds,
        }}
      >
        <Form.Item
          label={formatMessage(commonMessages.label.name)}
          name="name"
          rules={[
            {
              required: true,
              message: formatMessage(errorMessages.form.isRequired, {
                field: formatMessage(commonMessages.label.name),
              }),
            },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item label={formatMessage(commonMessages.label.permissionSettings)} name="permissionIds">
          <PermissionInput />
        </Form.Item>
      </Form>
    </AdminModal>
  )
}

const INSERT_PERMISSION_GROUP = gql`
  mutation INSERT_PERMISSION_GROUP($appId: String, $name: String) {
    insert_permission_group(objects: { app_id: $appId, name: $name }) {
      affected_rows
      returning {
        id
      }
    }
  }
`
const UPDATE_PERMISSION_GROUP = gql`
  mutation UPDATE_PERMISSION_GROUP($id: uuid, $name: String) {
    update_permission_group(where: { id: { _eq: $id } }, _set: { name: $name }) {
      affected_rows
    }
  }
`

const INSERT_PERMISSION_GROUP_PERMISSION = gql`
  mutation INSERT_PERMISSION_GROUP_PERMISSION($permissionGroups: [permission_group_permission_insert_input!]!) {
    insert_permission_group_permission(objects: $permissionGroups) {
      affected_rows
    }
  }
`
const UPDATE_PERMISSION_GROUP_PERMISSION = gql`
  mutation UPDATE_PERMISSION_GROUP_PERMISSION(
    $permissionGroupPermissionId: uuid!
    $permissionGroups: [permission_group_permission_insert_input!]!
  ) {
    delete_permission_group_permission(where: { permission_group_id: { _eq: $permissionGroupPermissionId } }) {
      affected_rows
    }
    insert_permission_group_permission(objects: $permissionGroups) {
      affected_rows
    }
  }
`

export default PermissionGroupAdminModal

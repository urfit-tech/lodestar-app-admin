import { PlusOutlined, UserOutlined } from '@ant-design/icons'
import { useMutation } from '@apollo/client'
import { Button } from 'antd'
import { gql } from '@apollo/client'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import { AdminPageTitle } from '../components/admin'
import AdminCard from '../components/admin/AdminCard'
import DraggableItemCollectionBlock from '../components/common/DraggableItemCollectionBlock'
import AdminLayout from '../components/layout/AdminLayout'
import hasura from '../hasura'
import { handleError } from '../helpers'
import { commonMessages } from '../helpers/translation'
import { useProperty } from '../hooks/member'
import ForbiddenPage from './ForbiddenPage'

const MemberPropertyAdminPage: React.FC = () => {
  const { formatMessage } = useIntl()
  const app = useApp()
  const { enabledModules } = useApp()
  const { permissions } = useAuth()
  const { loadingProperties, properties, refetchProperties } = useProperty()
  const [insertProperty] = useMutation<hasura.INSERT_PROPERTY, hasura.INSERT_PROPERTYVariables>(INSERT_PROPERTY)
  const [updateProperty] = useMutation<hasura.UPDATE_PROPERTY, hasura.UPDATE_PROPERTYVariables>(UPDATE_PROPERTY)
  const [updatePropertyIsEditable] = useMutation<
    hasura.UPDATE_PROPERTY_IS_EDITABLE,
    hasura.UPDATE_PROPERTY_IS_EDITABLEVariables
  >(UPDATE_PROPERTY_IS_EDITABLE)
  const [updatePropertiesIsRequired] = useMutation<
    hasura.UPDATE_PROPERTY_IS_REQUIRED,
    hasura.UPDATE_PROPERTY_IS_REQUIREDVariables
  >(UPDATE_PROPERTY_IS_REQUIRED)
  const [updatePropertyPosition] = useMutation<
    hasura.UPDATE_PROPERTY_POSITION,
    hasura.UPDATE_PROPERTY_POSITIONVariables
  >(UPDATE_PROPERTY_POSITION)
  const [deleteProperty] = useMutation<hasura.DELETE_PROPERTY, hasura.DELETE_PROPERTYVariables>(DELETE_PROPERTY)
  const [loading, setLoading] = useState(false)

  if (!enabledModules.member_property || !permissions.MEMBER_PROPERTY_ADMIN) {
    return <ForbiddenPage />
  }

  return (
    <AdminLayout>
      <AdminPageTitle className="mb-4">
        <UserOutlined className="mr-3" />
        <span>{formatMessage(commonMessages.menu.memberProperties)}</span>
      </AdminPageTitle>

      <AdminCard loading={loadingProperties} className={loading ? 'mask' : ''}>
        <div className="mb-3">{formatMessage(commonMessages.label.propertyItem)}</div>
        <DraggableItemCollectionBlock
          isEditable
          pageName={'memberAdminPage'}
          onChange={(check: boolean, id: string, type?: string) => {
            setLoading(true)
            if (type === 'isEditable') {
              updatePropertyIsEditable({ variables: { propertyId: id, isEditable: check } })
                .then(() => refetchProperties())
                .catch(handleError)
                .finally(() => setLoading(false))
            } else if (type === 'isRequired') {
              updatePropertiesIsRequired({ variables: { propertyId: id, isRequired: check } })
                .then(() => refetchProperties())
                .catch(handleError)
                .finally(() => setLoading(false))
            }
          }}
          items={properties.map(v => ({
            id: v.id,
            description: v.name,
            isEditableField: v.isEditable,
            isRequiredField: v.isRequired,
          }))}
          isDeletable
          onSort={newProperties => {
            setLoading(true)
            updatePropertyPosition({
              variables: {
                data: newProperties.map((property, index) => ({
                  id: property.id,
                  app_id: app.id,
                  type: 'member',
                  name: property.description || '',
                  position: index,
                })),
              },
            })
              .then(() => refetchProperties())
              .catch(handleError)
              .finally(() => setLoading(false))
          }}
          onEdit={item => {
            updateProperty({ variables: { propertyId: item.id, name: item.description || '' } })
              .then(() => refetchProperties())
              .catch(handleError)
          }}
          onDelete={id => {
            deleteProperty({ variables: { propertyId: id } })
              .then(() => refetchProperties())
              .catch(handleError)
          }}
        />
        <Button
          icon={<PlusOutlined />}
          type="link"
          onClick={() => {
            insertProperty({
              variables: {
                data: [
                  {
                    app_id: app.id,
                    type: 'member',
                    name: `Untitled-${properties.length + 1}`,
                    position: properties.length,
                  },
                ],
              },
            }).then(() => refetchProperties())
          }}
        >
          {formatMessage(commonMessages.ui.addProperty)}
        </Button>
      </AdminCard>
    </AdminLayout>
  )
}

const INSERT_PROPERTY = gql`
  mutation INSERT_PROPERTY($data: [property_insert_input!]!) {
    insert_property(objects: $data) {
      affected_rows
    }
  }
`
const UPDATE_PROPERTY = gql`
  mutation UPDATE_PROPERTY($propertyId: uuid!, $name: String!) {
    update_property(where: { id: { _eq: $propertyId } }, _set: { name: $name }) {
      affected_rows
    }
  }
`
const UPDATE_PROPERTY_IS_EDITABLE = gql`
  mutation UPDATE_PROPERTY_IS_EDITABLE($propertyId: uuid!, $isEditable: Boolean!) {
    update_property(where: { id: { _eq: $propertyId } }, _set: { is_editable: $isEditable }) {
      affected_rows
    }
  }
`
const UPDATE_PROPERTY_IS_REQUIRED = gql`
  mutation UPDATE_PROPERTY_IS_REQUIRED($propertyId: uuid!, $isRequired: Boolean!) {
    update_property(where: { id: { _eq: $propertyId } }, _set: { is_required: $isRequired }) {
      affected_rows
    }
  }
`
const UPDATE_PROPERTY_POSITION = gql`
  mutation UPDATE_PROPERTY_POSITION($data: [property_insert_input!]!) {
    insert_property(objects: $data, on_conflict: { constraint: property_pkey, update_columns: position }) {
      affected_rows
    }
  }
`
const DELETE_PROPERTY = gql`
  mutation DELETE_PROPERTY($propertyId: uuid!) {
    delete_member_property(where: { property_id: { _eq: $propertyId } }) {
      affected_rows
    }
    delete_property(where: { id: { _eq: $propertyId } }) {
      affected_rows
    }
  }
`

export default MemberPropertyAdminPage

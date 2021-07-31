import { DeleteOutlined, PlusOutlined, UserOutlined } from '@ant-design/icons'
import { useMutation } from '@apollo/react-hooks'
import { Button, Typography } from 'antd'
import gql from 'graphql-tag'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import { ReactSortable } from 'react-sortablejs'
import { AdminPageTitle } from '../../components/admin'
import AdminCard from '../../components/admin/AdminCard'
import DraggableItem from '../../components/common/DraggableItem'
import AdminLayout from '../../components/layout/AdminLayout'
import { useApp } from '../../contexts/AppContext'
import hasura from '../../hasura'
import { handleError } from '../../helpers'
import { commonMessages } from '../../helpers/translation'
import { useProperty } from '../../hooks/member'

const MemberPropertyAdminPage: React.FC = () => {
  const { formatMessage } = useIntl()
  const app = useApp()
  const { loadingProperties, properties, refetchProperties } = useProperty()
  const [insertProperty] = useMutation<hasura.INSERT_PROPERTY, hasura.INSERT_PROPERTYVariables>(INSERT_PROPERTY)
  const [updateProperty] = useMutation<hasura.UPDATE_PROPERTY, hasura.UPDATE_PROPERTYVariables>(UPDATE_PROPERTY)
  const [updatePropertyPosition] = useMutation<
    hasura.UPDATE_PROPERTY_POSITION,
    hasura.UPDATE_PROPERTY_POSITIONVariables
  >(UPDATE_PROPERTY_POSITION)
  const [deleteProperty] = useMutation<hasura.DELETE_PROPERTY, hasura.DELETE_PROPERTYVariables>(DELETE_PROPERTY)
  const [loading, setLoading] = useState(false)

  return (
    <AdminLayout>
      <AdminPageTitle className="mb-4">
        <UserOutlined className="mr-3" />
        <span>{formatMessage(commonMessages.menu.memberProperties)}</span>
      </AdminPageTitle>

      <AdminCard loading={loadingProperties} className={loading ? 'mask' : ''}>
        <div className="mb-4">{formatMessage(commonMessages.label.propertyItem)}</div>

        <ReactSortable
          handle=".draggable"
          list={properties}
          setList={newProperties => {
            setLoading(true)
            updatePropertyPosition({
              variables: {
                data: newProperties.map((property, index) => ({
                  id: property.id,
                  app_id: app.id,
                  type: 'member',
                  name: property.name,
                  position: index,
                })),
              },
            })
              .then(() => refetchProperties())
              .catch(handleError)
              .finally(() => setLoading(false))
          }}
        >
          {properties.map(property => (
            <DraggableItem
              key={property.id}
              className="mb-2"
              dataId={property.id}
              handlerClassName="draggable"
              actions={[
                <DeleteOutlined
                  key="delete"
                  onClick={() => {
                    window.confirm(formatMessage(commonMessages.text.deletePropertyNotation)) &&
                      deleteProperty({ variables: { propertyId: property.id } })
                        .then(() => refetchProperties())
                        .catch(handleError)
                  }}
                />,
              ]}
            >
              <Typography.Text
                editable={{
                  onChange: name => {
                    updateProperty({ variables: { propertyId: property.id, name } })
                      .then(() => refetchProperties())
                      .catch(handleError)
                  },
                }}
              >
                {property.name}
              </Typography.Text>
            </DraggableItem>
          ))}
        </ReactSortable>

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

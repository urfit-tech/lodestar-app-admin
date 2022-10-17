import { PlusOutlined } from '@ant-design/icons'
import { Button, Typography } from 'antd'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import { MetaProductType } from 'lodestar-app-element/src/types/metaProduct'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import { handleError } from '../../helpers'
import { commonMessages } from '../../helpers/translation'
import { useIdentity } from '../../hooks/identity'
import DraggableItemCollectionBlock from '../common/DraggableItemCollectionBlock'
import AdminCard from './AdminCard'

const RoleAdminCard: React.FC<{
  classType: MetaProductType
}> = ({ classType }) => {
  const { formatMessage } = useIntl()
  const app = useApp()
  const {
    getIdentity,
    insertMetaProjectIdentity,
    updateMetaProjectIdentityName,
    updateMetaProjectIdentityPosition,
    deleteMetaProjectIdentity,
  } = useIdentity()
  const { identityList, identityListRefetch } = getIdentity('Project')

  const [loading, setLoading] = useState(false)

  return (
    <AdminCard loading={false} className={loading ? 'mask' : ''}>
      <Typography.Text className="d-block mb-3">{formatMessage(commonMessages.label.categoryItem)}</Typography.Text>
      <DraggableItemCollectionBlock
        items={identityList?.map(v => ({ id: v.id, description: v.name })) || []}
        isEditable
        isDeletable
        onSort={newIdentityList => {
          setLoading(true)
          updateMetaProjectIdentityPosition({
            variables: {
              data: newIdentityList.map((identity, index) => ({
                id: identity.id,
                app_id: app.id,
                type: classType,
                name: identity.description,
                position: index,
              })),
            },
          })
            .then(() => identityListRefetch?.())
            .catch(handleError)
            .finally(() => setLoading(false))
        }}
        onEdit={item => {
          updateMetaProjectIdentityName({
            variables: {
              identityId: item.id,
              name: item.description,
            },
          })
            .then(() => identityListRefetch?.())
            .catch(handleError)
        }}
        onDelete={id => {
          deleteMetaProjectIdentity({ variables: { identityId: id } })
            .then(() => identityListRefetch?.())
            .catch(handleError)
        }}
      />
      <Button
        icon={<PlusOutlined />}
        type="link"
        onClick={() => {
          insertMetaProjectIdentity({
            variables: {
              appId: app.id,
              type: classType,
              name: `Untitled-${(identityList?.length || 0) + 1}`,
              position: identityList?.length,
            },
          }).then(() => identityListRefetch?.())
        }}
      >
        {formatMessage(commonMessages.ui.addCategory)}
      </Button>
    </AdminCard>
  )
}

// const INSERT_CATEGORY = gql`
//   mutation INSERT_CATEGORY($appId: String!, $name: String, $classType: String, $position: Int) {
//     insert_category(objects: { app_id: $appId, name: $name, class: $classType, position: $position }) {
//       affected_rows
//     }
//   }
// `
// const UPDATE_CATEGORY_NAME = gql`
//   mutation UPDATE_CATEGORY_NAME($categoryId: String!, $name: String) {
//     update_category(_set: { name: $name }, where: { id: { _eq: $categoryId } }) {
//       affected_rows
//     }
//   }
// `
// const UPDATE_CATEGORY_POSITION = gql`
//   mutation UPDATE_CATEGORY_POSITION($data: [category_insert_input!]!) {
//     insert_category(objects: $data, on_conflict: { constraint: category_pkey, update_columns: position }) {
//       affected_rows
//     }
//   }
// `
// const DELETE_CATEGORY = gql`
//   mutation DELETE_CATEGORY($categoryId: String!) {
//     delete_category(where: { id: { _eq: $categoryId } }) {
//       affected_rows
//     }
//   }
// `

export default RoleAdminCard

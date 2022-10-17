import { PlusOutlined } from '@ant-design/icons'
import { Button, Typography } from 'antd'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import { MetaProductType } from 'lodestar-app-element/src/types/metaProduct'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import { handleError } from '../../helpers'
import { commonMessages } from '../../helpers/translation'
import { useIdentity, useProjectIdentity } from '../../hooks/identity'
import DraggableItemCollectionBlock from '../common/DraggableItemCollectionBlock'
import AdminCard from './AdminCard'

const RoleAdminCard: React.FC<{
  classType: MetaProductType
}> = ({ classType }) => {
  const { formatMessage } = useIntl()
  const app = useApp()
  const { getIdentity, insertMetaProductIdentity } = useIdentity()
  const { updateMetaProjectIdentityName, updateMetaProjectIdentityPosition, deleteMetaProjectIdentity } =
    useProjectIdentity()
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
          insertMetaProductIdentity({
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

export default RoleAdminCard

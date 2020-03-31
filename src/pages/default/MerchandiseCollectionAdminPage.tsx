import { Button, Icon } from 'antd'
import React, { useContext } from 'react'
import { useIntl } from 'react-intl'
import useRouter from 'use-react-router'
import { AdminPageTitle } from '../../components/admin'
import ProductCreationModal from '../../components/common/ProductCreationModal'
import CreatorAdminLayout from '../../components/layout/CreatorAdminLayout'
import OwnerAdminLayout from '../../components/layout/OwnerAdminLayout'
import AppContext from '../../contexts/AppContext'
import { useAuth } from '../../contexts/AuthContext'
import { commonMessages, merchandiseMessages } from '../../helpers/translation'
import { useInsertMerchandise } from '../../hooks/merchandise'
import { ReactComponent as ShopIcon } from '../../images/icon/shop.svg'
import LoadingPage from './LoadingPage'

const MerchandiseCollectionAdminPage: React.FC = () => {
  const { formatMessage } = useIntl()
  const { history } = useRouter()
  const { currentMemberId, currentUserRole } = useAuth()
  const { id: appId } = useContext(AppContext)
  const insertMerchandise = useInsertMerchandise()
  // const { merchandises } = useMerchandiseCollection()

  if (!currentMemberId || !currentUserRole || !appId) {
    return <LoadingPage />
  }

  const AdminLayout = currentUserRole === 'app-owner' ? OwnerAdminLayout : CreatorAdminLayout

  return (
    <AdminLayout>
      <AdminPageTitle className="mb-4">
        <Icon component={() => <ShopIcon />} className="mr-2" />
        <span>{formatMessage(commonMessages.menu.merchandiseAdmin)}</span>
      </AdminPageTitle>

      <div className="mb-4">
        <ProductCreationModal
          renderTrigger={({ setVisible }) => (
            <Button type="primary" icon="file-add" onClick={() => setVisible(true)}>
              {formatMessage(merchandiseMessages.ui.createMerchandise)}
            </Button>
          )}
          title={formatMessage(merchandiseMessages.ui.createMerchandise)}
          onCreate={({ title, categoryIds }) =>
            insertMerchandise({
              variables: {
                appId:'1',
                title,
                merchandiseCategories: categoryIds.map((categoryId, index) => ({
                  category_id: categoryId,
                  position: index,
                })),
              },
            })
              .then(({ data }) => {
                const id = data?.insert_merchandise?.returning[0].id
                id && history.push(`/merchandises/${id}`)
              })
          }
        />
      </div>
    </AdminLayout>
  )
}

export default MerchandiseCollectionAdminPage

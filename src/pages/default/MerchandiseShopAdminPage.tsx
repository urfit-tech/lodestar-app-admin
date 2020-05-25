import { Button, Icon } from 'antd'
import React from 'react'
import { Link } from 'react-router-dom'
import useRouter from 'use-react-router'
import { AdminHeader, AdminHeaderTitle } from '../../components/admin'
import { StyledLayoutContent } from '../../components/layout/DefaultLayout'

const MerchandiseShopAdminPage: React.FC = () => {
  const { match } = useRouter<{ shopId: string }>()
  const shopId = match.params.shopId

  return (
    <>
      <AdminHeader>
        <Link to="/merchandise-shops">
          <Button type="link" className="mr-3">
            <Icon type="arrow-left" />
          </Button>
        </Link>

        <AdminHeaderTitle>{shopId}</AdminHeaderTitle>
      </AdminHeader>

      <StyledLayoutContent variant="gray"></StyledLayoutContent>
    </>
  )
}

export default MerchandiseShopAdminPage

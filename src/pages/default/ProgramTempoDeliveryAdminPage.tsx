import { Icon } from 'antd'
import React from 'react'
import { useIntl } from 'react-intl'
import { AdminPageTitle } from '../../components/admin'
import OwnerAdminLayout from '../../components/layout/OwnerAdminLayout'
import { commonMessages } from '../../helpers/translation'
import { ReactComponent as BookIcon } from '../../images/icon/book.svg'

const ProgramTempoDeliveryAdminPage: React.FC = () => {
  const { formatMessage } = useIntl()

  return (
    <OwnerAdminLayout>
      <AdminPageTitle>
        <Icon component={() => <BookIcon />} className="mr-3" />
        <span>{formatMessage(commonMessages.menu.tempoDelivery)}</span>
      </AdminPageTitle>
    </OwnerAdminLayout>
  )
}

export default ProgramTempoDeliveryAdminPage

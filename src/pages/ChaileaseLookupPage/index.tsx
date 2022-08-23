import Icon from '@ant-design/icons'
import { Input } from 'antd'
import { AdminPageTitle } from '../../components/admin'
import AdminLayout from '../../components/layout/AdminLayout'
import { ReactComponent as PhoneIcon } from '../../images/icon/phone.svg'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import { salesMessages } from '../../helpers/translation'
import ChaileaseInformationBlock from './ChaileaseInformationBlock'

const ChaileaseLookupPage: React.FC = () => {
  const { formatMessage } = useIntl()
  const [email, setEmail] = useState('')

  return (
    <AdminLayout>
      <AdminPageTitle className="mb-4">
        <Icon className="mr-3" component={() => <PhoneIcon />} />
        <span>{formatMessage(salesMessages.chaileaseLookup)}</span>
      </AdminPageTitle>
      <Input.Search
        className="mb-3"
        size="large"
        type="email"
        placeholder="username@example.com"
        onSearch={value => {
          setEmail(value)
        }}
        defaultValue={email || ''}
        enterButton="查詢"
      />
      {email && <ChaileaseInformationBlock email={email} />}
    </AdminLayout>
  )
}

export default ChaileaseLookupPage

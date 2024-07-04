import Icon from '@ant-design/icons'
import { Input } from 'antd'
import React, { useState } from 'react'
import { AdminPageTitle } from '../../components/admin'
import AdminLayout from '../../components/layout/AdminLayout'
import { ReactComponent as PhoneIcon } from '../../images/icon/phone.svg'
import ChaileaseAdditionalInformationBlock from './ChaileaseAdditionalInformationBlock'

const ChaileaseAdditionalLookupPage: React.FC = () => {
  const [email, setEmail] = useState('')

  return (
    <AdminLayout>
      <AdminPageTitle className="mb-4">
        <Icon className="mr-3" component={() => <PhoneIcon />} />
        <span>補件查詢</span>
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
      {email && <ChaileaseAdditionalInformationBlock email={email} />}
    </AdminLayout>
  )
}

export default ChaileaseAdditionalLookupPage

import Icon, { EditOutlined, FileTextFilled } from '@ant-design/icons'
import { useMutation, useQuery } from '@apollo/react-hooks'
import { Button, Input, Select, Skeleton, Tabs } from 'antd'
import gql from 'graphql-tag'
import { sum } from 'ramda'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import { AdminPageTitle } from '../../components/admin'
import AdminLayout from '../../components/layout/AdminLayout'
import PracticeCard from '../../components/practice/PracticeCard'
import { OwnedProgramSelector } from '../../components/program/ProgramSelector'
import { useAuth } from '../../contexts/AuthContext'
import { commonMessages, practiceMessages } from '../../helpers/translation'
import { ReactComponent as BookIcon } from '../../images/icon/book.svg'

const PracticeCollectionAdminPage: React.FC = () => {
  const { formatMessage } = useIntl()
  const [selectedStatus, setSelectedStatus] = useState<string>('unreviewed')
  const [searchText, setSearchText] = useState('')
  const { currentMemberId } = useAuth()

  return (
    <AdminLayout>
      <AdminPageTitle className="mb-4">
        <Icon component={() => <BookIcon />} className="mr-3" />
        <span>{formatMessage(commonMessages.menu.practice)}</span>
      </AdminPageTitle>

      <div className="d-flex flex-wrap mb-4">
        <div className="d-flex flex-wrap col-12 px-0 mb-2 mb-md-0">
          <div className="col-12 col-sm-2 mb-2 mb-sm-0 px-0 pr-sm-3">
            <Select style={{ width: '100%' }} value={selectedStatus} onChange={(key: string) => setSelectedStatus(key)}>
              <Select.Option value="unreviewed">{formatMessage(practiceMessages.status.unreviewed)}</Select.Option>
              <Select.Option value="reviewed">{formatMessage(practiceMessages.status.reviewed)}</Select.Option>
              <Select.Option value="all">{formatMessage(commonMessages.label.all)}</Select.Option>
            </Select>
          </div>
          <div className="col-12 col-sm-5 mb-2 mb-sm-0 px-0 pr-sm-3">
            <OwnedProgramSelector value={selectedProgramId} />
          </div>
          <div className="col-12 col-sm-2" />
          <div className="col-12 col-sm-3 px-0">
            <Input.Search
              placeholder={formatMessage(practiceMessages.text.searchPractice)}
              onChange={e => setSearchText(e.target.value)}
            />
          </div>
        </div>
      </div>

      {currentMemberId && <AllPracticeCollectionBlock />}
    </AdminLayout>
  )
}

const AllPracticeCollectionBlock: React.FC<{}> = () => {
  return <PracticeCard />
}

export default PracticeCollectionAdminPage

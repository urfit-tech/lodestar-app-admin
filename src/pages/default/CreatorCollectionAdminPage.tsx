import Icon, { SearchOutlined } from '@ant-design/icons'
import { useQuery } from '@apollo/react-hooks'
import { Button, Input, Table, Tabs } from 'antd'
import { ColumnProps } from 'antd/lib/table'
import gql from 'graphql-tag'
import React from 'react'
import { defineMessages, useIntl } from 'react-intl'
import { Redirect } from 'react-router-dom'
import styled from 'styled-components'
import { AdminPageTitle } from '../../components/admin'
import AdminLayout from '../../components/layout/AdminLayout'
import { useApp } from '../../contexts/AppContext'
import { useAuth } from '../../contexts/AuthContext'
import { commonMessages } from '../../helpers/translation'
import { ReactComponent as CalendarAltIcon } from '../../images/icon/calendar-alt.svg'
import types from '../../types'
import LoadingPage from './LoadingPage'

const messages = defineMessages({
  published: { id: 'creator.label.published', defaultMessage: '已公開 ({count})' },
  hidden: { id: 'creator.label.hidden', defaultMessage: '隱藏 ({count})' },
})

const StyledFilterButton = styled(Button)`
  height: 36px;
  width: 90px;
`
const StyledFilterInput = styled(Input)`
  width: 188px;
`

const CreatorCollectionAdminPage: React.FC<{}> = () => {
  const { formatMessage } = useIntl()
  const { loading, enabledModules } = useApp()
  const { isAuthenticating, currentUserRole } = useAuth()
  const { creators } = useCreatorCollection()

  if (loading || isAuthenticating) {
    return <LoadingPage />
  }

  if (!enabledModules.creator_display || currentUserRole === 'content-creator') {
    return <Redirect to="/studio/sales" />
  }

  const tabContents = [
    {
      key: 'published',
      tab: formatMessage(messages.published, { count: 1 }),
    },
    {
      key: 'hidden',
      tab: formatMessage(messages.hidden, { count: 1 }),
    },
  ]

  const getColumnSearchProps = ({
    onReset,
    onSearch,
  }: {
    onReset: (clearFilters: any) => void
    onSearch: (selectedKeys?: React.ReactText[], confirm?: () => void) => void
  }): ColumnProps<any> => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
      <div className="p-2">
        <StyledFilterInput
          autoFocus
          value={selectedKeys?.[0]}
          onChange={e => setSelectedKeys?.(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => onSearch(selectedKeys, confirm)}
          className="mb-2 d-block"
        />
        <StyledFilterButton
          className="mr-2"
          type="primary"
          size="small"
          onClick={() => onSearch(selectedKeys, confirm)}
        >
          {formatMessage(commonMessages.ui.search)}
        </StyledFilterButton>
        <StyledFilterButton size="small" onClick={() => onReset(clearFilters)}>
          {formatMessage(commonMessages.ui.reset)}
        </StyledFilterButton>
      </div>
    ),
    filterIcon: <SearchOutlined />,
  })

  const columns = [
    {
      title: formatMessage(commonMessages.term.instructor),
      dataIndex: 'name',
      key: 'name',
      ...getColumnSearchProps({
        onReset: clearFilters => clearFilters(),
        onSearch: (selectedKeys, confirm) => {
          confirm?.()
        },
      }),
    },
    {
      title: formatMessage(commonMessages.term.field),
      dataIndex: 'field',
      key: 'field',
      ...getColumnSearchProps({
        onReset: clearFilters => clearFilters(),
        onSearch: (selectedKeys, confirm) => {
          confirm?.()
        },
      }),
    },
    {
      title: formatMessage(commonMessages.term.speciality),
      dataIndex: 'speciality',
      key: 'speciality',
    },
  ]

  return (
    <AdminLayout>
      <AdminPageTitle className="mb-4">
        <Icon component={() => <CalendarAltIcon />} className="mr-3" />
        <span>{formatMessage(commonMessages.menu.creatorDisplayManagement)}</span>
      </AdminPageTitle>

      <Tabs defaultActiveKey="published">
        {tabContents.map(v => (
          <Tabs.TabPane key={v.key} tab={v.tab}>
            <Table rowKey="id" loading={false} dataSource={[]} columns={columns} pagination={false} />
          </Tabs.TabPane>
        ))}
      </Tabs>
    </AdminLayout>
  )
}

export default CreatorCollectionAdminPage

const useCreatorCollection = () => {
  const { loading, error, data, refetch, fetchMore } = useQuery<types.GET_CREATOR_COLLECTION>(gql`
    query GET_CREATOR_COLLECTION {
      creator {
        id
        published_at
        creator_categories {
          id
          category {
            id
            name
          }
        }
        member_specialities {
          id
          tag_name
        }
      }
    }
  `)

  const creators: {
    id: string
    isPublished: boolean
    categories: { id: string; name: string }[]
    specialities: { id: string; name: string }[]
  }[] =
    loading || error || !data
      ? []
      : data.creator.map(v => ({
          id: v.id || '',
          isPublished: !!v.published_at,
          categories: v.creator_categories.map(w => ({
            id: w.category.id,
            name: w.category.name,
          })),
          specialities: v.member_specialities.map(w => ({
            id: w.id,
            name: w.tag_name,
          })),
        }))

  return {
    loadingCreators: loading,
    errorCreators: error,
    creators,
    refetchCreators: refetch,
  }
}

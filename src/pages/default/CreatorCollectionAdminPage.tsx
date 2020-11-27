import Icon, { SearchOutlined } from '@ant-design/icons'
import { useQuery } from '@apollo/react-hooks'
import { Button, Input, Table, Tabs } from 'antd'
import { ColumnProps, TableProps } from 'antd/lib/table'
import gql from 'graphql-tag'
import React, { useState } from 'react'
import { defineMessages, useIntl } from 'react-intl'
import { Redirect } from 'react-router-dom'
import styled from 'styled-components'
import { AdminPageTitle } from '../../components/admin'
import { AvatarImage } from '../../components/common/Image'
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

const StyledCategory = styled.span`
  border-radius: 2px;
  border: solid 1px var(--gray);
  text-align: center;
  width: 70px;
  padding: 2px 6px;
  background-color: var(--gray-lighter);

  & + & {
    margin-left: 0.5rem;
  }
`

const StyledTag = styled.span`
  width: 44px;
  font-size: 14px;
  text-align: center;
  color: ${props => props.theme['@primary-color']};

  &:before {
    content: '#';
  }

  & + & {
    margin-left: 0.5rem;
  }
`

type CreatorProps = {
  id: string
  isPublished: boolean
  pictureUrl: string | null
  name: string
  categoryNames: string[]
  specialityNames: string[]
}

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
      tab: formatMessage(messages.published, { count: creators.filter(v => v.isPublished).length }),
      creators: creators.filter(v => v.isPublished),
    },
    {
      key: 'hidden',
      tab: formatMessage(messages.hidden, { count: creators.filter(v => !v.isPublished).length }),
      creators: creators.filter(v => !v.isPublished),
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
            <CreatorCollectionAdminTable creators={v.creators} />
          </Tabs.TabPane>
        ))}
      </Tabs>
    </AdminLayout>
  )
}

export default CreatorCollectionAdminPage

const CreatorCollectionAdminTable: React.FC<{ creators: CreatorProps[] } & TableProps<CreatorProps>> = ({
  creators,
  ...props
}) => {
  const { formatMessage } = useIntl()
  const [filter, setFilter] = useState<{
    name: string | null
    field: string | null
    speciality: string | null
  }>({
    name: null,
    field: null,
    speciality: null,
  })

  const filteredCreators = creators.filter(
    v =>
      (!filter.name || v.name.includes(filter.name)) &&
      (!filter.field || v.categoryNames.find(v => v.search(filter.field || '') !== -1)) &&
      (!filter.speciality || v.specialityNames.find(v => v.search(filter.speciality || '') !== -1)),
  )

  const getColumnSearchProps = ({
    onReset,
    onSearch,
  }: {
    onReset: (clearFilters: any) => void
    onSearch: (selectedKeys?: React.ReactText[], confirm?: () => void) => void
  }): ColumnProps<CreatorProps> => ({
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

  const columns: ColumnProps<CreatorProps>[] = [
    {
      title: formatMessage(commonMessages.term.instructor),
      dataIndex: 'name',
      key: 'name',
      ...getColumnSearchProps({
        onReset: clearFilters => {
          clearFilters()
          setFilter({ ...filter, name: null })
        },
        onSearch: ([searchText] = []) =>
          setFilter({
            ...filter,
            name: searchText as string,
          }),
      }),
      render: (name, record) => (
        <div className="d-flex align-items-center justify-content-start">
          <AvatarImage size="36px" src={record.pictureUrl} className="mr-3" />
          <span className="pl-1">{name}</span>
        </div>
      ),
    },
    {
      title: formatMessage(commonMessages.term.field),
      dataIndex: 'categoryNames',
      key: 'field',
      ...getColumnSearchProps({
        onReset: clearFilters => {
          clearFilters()
          setFilter({
            ...filter,
            field: null,
          })
        },
        onSearch: ([searchText] = []) => setFilter({ ...filter, field: searchText as string }),
      }),
      render: fields => fields.map((v: string) => <StyledCategory>{v}</StyledCategory>),
    },
    {
      title: formatMessage(commonMessages.term.speciality),
      dataIndex: 'specialityNames',
      key: 'speciality',
      ...getColumnSearchProps({
        onReset: clearFilters => {
          clearFilters()
          setFilter({ ...filter, speciality: null })
        },
        onSearch: ([searchText] = []) =>
          setFilter({
            ...filter,
            speciality: searchText as string,
          }),
      }),
      render: tags => tags.map((v: string) => <StyledTag>{v}</StyledTag>),
    },
  ]

  return <Table dataSource={filteredCreators} columns={columns} {...props} />
}

const useCreatorCollection = () => {
  const { loading, error, data, refetch, fetchMore } = useQuery<types.GET_CREATOR_COLLECTION>(gql`
    query GET_CREATOR_COLLECTION {
      creator {
        id
        name
        picture_url
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

  const creators: CreatorProps[] =
    loading || error || !data
      ? []
      : data.creator.map(v => ({
          id: v.id || '',
          isPublished: !!v.published_at,
          pictureUrl: v.picture_url,
          name: v.name || '',
          categoryNames: v.creator_categories.map(w => w.category.name),
          specialityNames: v.member_specialities.map(w => w.tag_name),
        }))

  return {
    loadingCreators: loading,
    errorCreators: error,
    creators,
    refetchCreators: refetch,
  }
}

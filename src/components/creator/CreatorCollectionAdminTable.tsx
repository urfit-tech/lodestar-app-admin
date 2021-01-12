import Icon, { MoreOutlined, SearchOutlined } from '@ant-design/icons'
import { useMutation } from '@apollo/react-hooks'
import { Button, Dropdown, Input, Menu, message, Table } from 'antd'
import { ColumnProps } from 'antd/lib/table'
import gql from 'graphql-tag'
import React, { useState } from 'react'
import { defineMessages, useIntl } from 'react-intl'
import styled from 'styled-components'
import { useApp } from '../../contexts/AppContext'
import { commonMessages } from '../../helpers/translation'
import { ReactComponent as ExternalLinkIcon } from '../../images/icon/external-link-square.svg'
import types from '../../types'
import { CreatorProps } from '../../types/creator'
import { AvatarImage } from '../common/Image'

const messages = defineMessages({
  showCreator: { id: 'creator.label.showCreator', defaultMessage: '顯示講師' },
  hideCreator: { id: 'creator.ui.hideCreator', defaultMessage: '隱藏講師' },
  publishedSuccess: { id: 'creator.status.publishedSuccess', defaultMessage: '已公開' },
  hiddenSuccess: { id: 'creator.status.hiddenSuccess', defaultMessage: '已隱藏' },
})

const StyledFilterButton = styled(Button)`
  height: 36px;
  width: 90px;
`
const StyledFilterInput = styled(Input)`
  width: 188px;
`
const StyledField = styled.span`
  border-radius: 2px;
  border: solid 1px var(--gray);
  text-align: center;
  margin-bottom: 0.5rem;
  padding: 2px 6px;
  background-color: var(--gray-lighter);

  &:not(:last-child) {
    margin-right: 4px;
  }
`
const StyledTag = styled.span`
  font-size: 14px;
  text-align: center;
  color: ${props => props.theme['@primary-color']};

  &:before {
    content: '#';
  }

  &:not(:last-child) {
    margin-right: 4px;
  }
`

const CreatorCollectionAdminTable: React.FC<{
  creators: CreatorProps[]
  onRefetch?: () => void
}> = ({ creators, onRefetch }) => {
  const { formatMessage } = useIntl()
  const { settings } = useApp()
  const [filter, setFilter] = useState<{
    name: string | null
    field: string | null
    speciality: string | null
  }>({
    name: null,
    field: null,
    speciality: null,
  })

  const [insertCreatorDisplay] = useMutation<types.INSERT_CREATOR_DISPLAY, types.INSERT_CREATOR_DISPLAYVariables>(gql`
    mutation INSERT_CREATOR_DISPLAY($creatorId: String!) {
      insert_creator_display_one(object: { member_id: $creatorId }) {
        id
      }
    }
  `)

  const [deleteCreatorDisplay] = useMutation<types.DELETE_CREATOR_DISPLAY, types.DELETE_CREATOR_DISPLAYVariables>(gql`
    mutation DELETE_CREATOR_DISPLAY($creatorId: String!) {
      delete_creator_display(where: { member_id: { _eq: $creatorId }, block_id: { _eq: "default" } }) {
        affected_rows
      }
    }
  `)

  const filteredCreators = creators.filter(
    v =>
      (!filter.name || v.name.includes(filter.name)) &&
      (!filter.field || v.categoryNames.some(v => v.includes(filter.field || ''))) &&
      (!filter.speciality || v.specialityNames.some(v => v.includes(filter.speciality || ''))),
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
      width: '30%',
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
      width: '30%',
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
      render: fields => (
        <div className="d-flex flex-wrap">
          {fields.map((v: string) => (
            <StyledField>{v}</StyledField>
          ))}
        </div>
      ),
    },
    {
      title: formatMessage(commonMessages.term.speciality),
      dataIndex: 'specialityNames',
      key: 'speciality',
      width: '35%',
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
      render: tags => (
        <div className="d-flex flex-wrap">
          {tags.map((v: string) => (
            <StyledTag>{v}</StyledTag>
          ))}
        </div>
      ),
    },
    {
      dataIndex: 'id',
      width: '5%',
      render: (creatorId, { isPublished }) => (
        <div className="d-flex align-items-center">
          <Button
            type="link"
            onClick={() => window.open(`https://${settings['host']}/creators/${creatorId}`, '_blank')}
          >
            <Icon component={() => <ExternalLinkIcon />} />
          </Button>
          <Dropdown
            overlay={
              <Menu>
                {isPublished ? (
                  <Menu.Item
                    onClick={() =>
                      deleteCreatorDisplay({ variables: { creatorId } })
                        .then(() => {
                          message.success(formatMessage(messages.hiddenSuccess))
                          onRefetch?.()
                        })
                        .catch(err => process.env.NODE_ENV === 'development' && console.error(err))
                    }
                  >
                    {formatMessage(messages.hideCreator)}
                  </Menu.Item>
                ) : (
                  <Menu.Item
                    onClick={() =>
                      insertCreatorDisplay({ variables: { creatorId } })
                        .then(() => {
                          message.success(formatMessage(messages.publishedSuccess))
                          onRefetch?.()
                        })
                        .catch(err => process.env.NODE_ENV === 'development' && console.error(err))
                    }
                  >
                    {formatMessage(messages.showCreator)}
                  </Menu.Item>
                )}
              </Menu>
            }
            trigger={['click']}
          >
            <MoreOutlined />
          </Dropdown>
        </div>
      ),
    },
  ]

  return <Table dataSource={filteredCreators} columns={columns} rowKey="id" pagination={false} />
}

export default CreatorCollectionAdminTable

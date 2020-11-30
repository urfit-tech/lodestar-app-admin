import Icon, { MoreOutlined, SearchOutlined } from '@ant-design/icons'
import { Button, Dropdown, Input, Menu, message } from 'antd'
import Table, { ColumnProps, TableProps } from 'antd/lib/table'
import React, { useState } from 'react'
import { defineMessages, useIntl } from 'react-intl'
import styled from 'styled-components'
import { useApp } from '../../contexts/AppContext'
import { commonMessages } from '../../helpers/translation'
import { useCreator } from '../../hooks/creators'
import { ReactComponent as ExternalLinkIcon } from '../../images/icon/external-link-square.svg'
import { CreatorProps } from '../../types/creator'
import { AvatarImage } from '../common/Image'

const messages = defineMessages({
  publishedSuccess: { id: 'creator.status.publishedSuccess', defaultMessage: '已公開' },
  hiddenSuccess: { id: 'creator.status.hiddenSuccess', defaultMessage: '已隱藏' },
  showCreator: { id: 'creator.label.showCreator', defaultMessage: '顯示講師' },
  hideCreator: { id: 'creator.ui.hideCreator', defaultMessage: '隱藏講師' },
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

const CreatorCollectionAdminTable: React.FC<{ creators: CreatorProps[] } & TableProps<CreatorProps>> = ({
  creators,
  ...props
}) => {
  const { formatMessage } = useIntl()
  const { settings } = useApp()
  const { insertCreatorDisplay, deleteCreatorDisplay, refetchCreators } = useCreator()
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
      render: fields => fields.map((v: string) => <StyledField>{v}</StyledField>),
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
      render: tags => tags.map((v: string) => <StyledTag>{v}</StyledTag>),
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
                      deleteCreatorDisplay(creatorId).then(() => {
                        message.success(formatMessage(messages.hiddenSuccess))
                        refetchCreators()
                      })
                    }
                  >
                    {formatMessage(messages.hideCreator)}
                  </Menu.Item>
                ) : (
                  <Menu.Item
                    onClick={() =>
                      insertCreatorDisplay(creatorId).then(() => {
                        message.success(formatMessage(messages.publishedSuccess))
                        refetchCreators()
                      })
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

  return <Table dataSource={filteredCreators} columns={columns} {...props} />
}

export default CreatorCollectionAdminTable

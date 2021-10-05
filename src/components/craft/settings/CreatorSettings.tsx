import { useApolloClient } from '@apollo/react-hooks'
import { useNode } from '@craftjs/core'
import { Button, Collapse, InputNumber, Select } from 'antd'
import Form from 'antd/lib/form/'
import { useForm } from 'antd/lib/form/Form'
import gql from 'graphql-tag'
import { StyledCraftSettingLabel } from 'lodestar-app-element/src/components/common'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import { repeat } from 'ramda'
import React, { useEffect, useState } from 'react'
import { useIntl } from 'react-intl'
import { AdminHeaderTitle, StyledCollapsePanel } from '.'
import hasura from '../../../hasura'
import { craftPageMessages } from '../../../helpers/translation'

const CreatorSettings: React.VFC = () => {
  const { formatMessage } = useIntl()
  const [form] = useForm<{ creatorCollection: CreatorCollection }>()

  const {
    actions: { setProp },
    props: { type, ids },
  } = useNode(node => ({
    props: node.data.props,
    selected: node.events.selected,
  }))

  return (
    <Form
      form={form}
      layout="vertical"
      colon={false}
      requiredMark={false}
      initialValues={{ creatorCollection: { type, ids } }}
      onValuesChange={() => {
        form
          .validateFields()
          .then(values => {
            setProp(props => {
              props.type = values.creatorCollection.type
              props.ids = values.creatorCollection.ids
            })
          })
          .catch(() => {})
      }}
    >
      <Collapse
        className="mt-2 p-0"
        bordered={false}
        expandIconPosition="right"
        ghost
        defaultActiveKey={['displayItem', 'categorySelector']}
      >
        <StyledCollapsePanel
          key="displayItem"
          header={<AdminHeaderTitle>{formatMessage(craftPageMessages.label.specifyDisplayItem)}</AdminHeaderTitle>}
        >
          <Form.Item name="creatorCollection">
            <CreatorCollectionSelector />
          </Form.Item>
        </StyledCollapsePanel>
      </Collapse>
    </Form>
  )
}

type CreatorCollection = {
  type: 'newest' | 'custom'
  ids: (string | null)[]
}
const CreatorCollectionSelector: React.FC<{
  value?: CreatorCollection
  onChange?: (value: CreatorCollection) => void
}> = ({ value, onChange }) => {
  const { formatMessage } = useIntl()
  return (
    <div>
      <Form.Item
        label={<StyledCraftSettingLabel>{formatMessage(craftPageMessages.label.ruleOfSort)}</StyledCraftSettingLabel>}
      >
        <Select<CreatorCollection['type']>
          placeholder={formatMessage(craftPageMessages.label.choiceData)}
          value={value?.type}
          onChange={type => {
            onChange?.({ type, ids: [] })
          }}
          filterOption={(input, option) =>
            option?.props?.children
              ? (option.props.children as string).toLowerCase().indexOf(input.toLowerCase()) >= 0
              : true
          }
        >
          <Select.Option key="newest" value="newest">
            {formatMessage(craftPageMessages.label.newest)}
          </Select.Option>
          <Select.Option key="custom" value="custom">
            {formatMessage(craftPageMessages.label.custom)}
          </Select.Option>
        </Select>
      </Form.Item>
      {value?.type === 'newest' && (
        <Form.Item
          label={
            <StyledCraftSettingLabel>{formatMessage(craftPageMessages.label.displayAmount)}</StyledCraftSettingLabel>
          }
        >
          <InputNumber
            value={value.ids.length}
            onChange={limit =>
              onChange?.({
                type: value.type,
                ids: repeat(null, Number(limit) || 0),
              })
            }
          />
        </Form.Item>
      )}
      {value?.type === 'custom' && (
        <Form.Item
          label={
            <StyledCraftSettingLabel>{formatMessage(craftPageMessages.label.dataDisplay)}</StyledCraftSettingLabel>
          }
        >
          {value.ids.map((creatorId, idx) => (
            <div className="my-2" key={creatorId}>
              <CreatorSelector
                value={creatorId}
                onChange={selectedActivityId => {
                  onChange?.({
                    type: value.type,
                    ids: [...value.ids.slice(0, idx), selectedActivityId, ...value.ids.slice(idx + 1)],
                  })
                }}
                onRemove={() =>
                  onChange?.({
                    type: value.type,
                    ids: [...value.ids.slice(0, idx), ...value.ids.slice(idx + 1)],
                  })
                }
              />
            </div>
          ))}
          <Button type="link" onClick={() => onChange?.({ type: value.type, ids: [...value.ids, null] })}>
            {formatMessage(craftPageMessages.label.addItem)}
          </Button>
        </Form.Item>
      )}
    </div>
  )
}

const CreatorSelector: React.VFC<{
  value?: string | null
  onChange?: (value: string | null) => void
  onRemove?: () => void
}> = ({ value, onChange, onRemove }) => {
  const { formatMessage } = useIntl()
  const [searchValue, setSearchValue] = useState('')
  const { id: appId } = useApp()
  const apolloClient = useApolloClient()
  const [searchedCreators, setSearchedCreator] = useState<{ id: string; name: string }[]>([])

  useEffect(() => {
    apolloClient
      .query<hasura.SEARCH_CREATOR, hasura.SEARCH_CREATORVariables>({
        query: gql`
          query SEARCH_CREATOR($searchText: String!) {
            creator(limit: 20, where: { name: { _like: $searchText }, published_at: { _is_null: false } }) {
              id
              name
            }
          }
        `,
        variables: {
          searchText: `%${searchValue}%`,
        },
      })
      .then(({ data }: { data?: hasura.SEARCH_CREATOR }) => {
        setSearchedCreator(data?.creator.map(v => ({ id: v.id || '', name: v.name || '' })) || [])
      })
  }, [searchValue, apolloClient, appId])

  return (
    <Select
      showSearch
      allowClear
      placeholder={formatMessage(craftPageMessages.label.choiceData)}
      value={value || undefined}
      searchValue={searchValue}
      onChange={onChange}
      onSearch={value => setSearchValue(value)}
      onClear={onRemove}
      filterOption={(input, option) =>
        option?.props?.children
          ? (option.props.children as string).toLowerCase().indexOf(input.toLowerCase()) >= 0
          : true
      }
    >
      {searchedCreators.map(creator => (
        <Select.Option key={creator.id} value={creator.id}>
          {creator.name}
        </Select.Option>
      ))}
    </Select>
  )
}

export default CreatorSettings

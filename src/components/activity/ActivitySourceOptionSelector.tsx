import { useQuery } from '@apollo/react-hooks'
import { Button, Form, InputNumber, Select } from 'antd'
import gql from 'graphql-tag'
import { CraftActivityCollectionProps } from 'lodestar-app-element/src/components/craft/CraftActivityCollection'
import { useIntl } from 'react-intl'
import hasura from '../../hasura'
import { craftPageMessages } from '../../helpers/translation'
import { StyledCraftSettingLabel } from '../craft/settings'
import ActivityCategorySelect from './ActivityCategorySelect'
import ActivityTagSelect from './ActivityTagSelect'

type ActivitySourceOption = CraftActivityCollectionProps['sourceOptions']
const ActivitySourceOptionSelector: React.FC<{
  value?: ActivitySourceOption
  onChange?: (value: ActivitySourceOption) => void
}> = ({ value, onChange }) => {
  const { formatMessage } = useIntl()
  const { data } = useQuery<hasura.GET_ACTIVITY_ID_LIST>(GET_ACTIVITY_ID_LIST)
  const activityOptions = data?.activity.map(p => ({ id: p.id, title: p.title })) || []
  return (
    <div>
      <Form.Item
        label={<StyledCraftSettingLabel>{formatMessage(craftPageMessages.label.ruleOfSort)}</StyledCraftSettingLabel>}
      >
        <Select<ActivitySourceOption['source']>
          placeholder={formatMessage(craftPageMessages.label.choiceData)}
          value={value?.source}
          onChange={source => {
            switch (source) {
              case 'publishedAt':
                onChange?.({ source, limit: 4 })
                break
              case 'custom':
                onChange?.({ source, idList: [] })
                break
            }
          }}
          filterOption={(input, option) =>
            option?.props?.children
              ? (option.props.children as string).toLowerCase().indexOf(input.toLowerCase()) >= 0
              : true
          }
        >
          <Select.Option key="publishedAt" value="publishedAt">
            {formatMessage(craftPageMessages.label.publishedAt)}
          </Select.Option>
          <Select.Option key="currentPrice" value="currentPrice">
            {formatMessage(craftPageMessages.label.currentPrice)}
          </Select.Option>
          <Select.Option key="custom" value="custom">
            {formatMessage(craftPageMessages.label.custom)}
          </Select.Option>
        </Select>
      </Form.Item>
      {value?.source === 'publishedAt' && (
        <>
          <Form.Item
            label={<StyledCraftSettingLabel>{formatMessage(craftPageMessages.label.sort)}</StyledCraftSettingLabel>}
          >
            <Select value={value.asc ? 'asc' : 'desc'} onChange={v => onChange?.({ ...value, asc: v === 'asc' })}>
              <Select.Option value="asc">{formatMessage(craftPageMessages.label.sortAsc)}</Select.Option>
              <Select.Option value="desc">{formatMessage(craftPageMessages.label.sortDesc)}</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            label={
              <StyledCraftSettingLabel>{formatMessage(craftPageMessages.label.displayAmount)}</StyledCraftSettingLabel>
            }
          >
            <InputNumber
              value={value.limit}
              onChange={limit => onChange?.({ ...value, limit: limit ? Number(limit) : undefined })}
            />
          </Form.Item>
          <Form.Item
            label={
              <StyledCraftSettingLabel>
                {formatMessage(craftPageMessages.label.defaultCategoryId)}
              </StyledCraftSettingLabel>
            }
          >
            <ActivityCategorySelect
              value={value.defaultCategoryIds}
              onChange={v => onChange?.({ ...value, defaultCategoryIds: typeof v === 'string' ? [v] : v })}
            />
          </Form.Item>
          <Form.Item
            label={
              <StyledCraftSettingLabel>{formatMessage(craftPageMessages.label.defaultTagName)}</StyledCraftSettingLabel>
            }
          >
            <ActivityTagSelect
              value={value.defaultTagNames}
              onChange={v => onChange?.({ ...value, defaultTagNames: typeof v === 'string' ? [v] : v })}
            />
          </Form.Item>
        </>
      )}
      {value?.source === 'custom' && (
        <Form.Item
          label={
            <StyledCraftSettingLabel>{formatMessage(craftPageMessages.label.dataDisplay)}</StyledCraftSettingLabel>
          }
        >
          {value.idList.map((activityId, idx) => (
            <div key={activityId} className="my-2">
              <Select
                showSearch
                allowClear
                placeholder={formatMessage(craftPageMessages.label.choiceData)}
                value={activityId}
                options={activityOptions.map(({ id, title }) => ({ key: id, value: id, label: title }))}
                onChange={selectedActivityId =>
                  selectedActivityId &&
                  onChange?.({
                    ...value,
                    idList: [...value.idList.slice(0, idx), selectedActivityId, ...value.idList.slice(idx + 1)],
                  })
                }
                onClear={() =>
                  onChange?.({ ...value, idList: [...value.idList.slice(0, idx), ...value.idList.slice(idx + 1)] })
                }
                filterOption={(input, option) =>
                  option?.props?.children
                    ? (option.props.children as string).toLowerCase().indexOf(input.toLowerCase()) >= 0
                    : true
                }
              />
            </div>
          ))}
          <Button type="link" onClick={() => onChange?.({ ...value, idList: [...value.idList, ''] })}>
            {formatMessage(craftPageMessages.label.addItem)}
          </Button>
        </Form.Item>
      )}
    </div>
  )
}

const GET_ACTIVITY_ID_LIST = gql`
  query GET_ACTIVITY_ID_LIST {
    activity(where: { published_at: { _lt: "now()" } }) {
      id
      title
    }
  }
`

export default ActivitySourceOptionSelector

import { useQuery } from '@apollo/client'
import { Button, Form, InputNumber, Select } from 'antd'
import { gql } from '@apollo/client'
import { PostCollectionProps } from 'lodestar-app-element/src/components/collections/PostCollection'
import { useIntl } from 'react-intl'
import hasura from '../../hasura'
import { CraftSettingLabel } from '../../pages/CraftPageAdminPage/CraftSettingsPanel'
import PostCategorySelect from './PostCategorySelect'
import PostTagSelect from './PostTagSelect'
import blogMessages from './translation'

type PostSourceOptions = PostCollectionProps['source']

const PostCollectionSelector: React.FC<{
  withOrderSelector?: boolean
  value?: PostSourceOptions
  onChange?: (value: PostSourceOptions) => void
}> = ({ withOrderSelector, value = { from: 'publishedAt' }, onChange }) => {
  const { formatMessage } = useIntl()
  const { data } = useQuery<hasura.GET_POST_ID_LIST>(GET_POST_ID_LIST)
  const postOptions = data?.post.map(p => ({ id: p.id, title: p.title })) || []

  return (
    <div>
      <Form.Item
        label={<CraftSettingLabel>{formatMessage(blogMessages.PostCollectionSelector.ruleOfSort)}</CraftSettingLabel>}
      >
        <Select<typeof value.from>
          placeholder={formatMessage(blogMessages.PostCollectionSelector.choiceData)}
          value={value?.from}
          onChange={from => {
            switch (from) {
              case 'publishedAt':
                onChange?.({ from, limit: 4 })
                break
              case 'popular':
                onChange?.({ from, limit: 4 })
                break
              case 'custom':
                onChange?.({ from, idList: [] })
                break
            }
          }}
          filterOption={(input, option) =>
            option?.props?.children
              ? (option.props.children as string).toLowerCase().indexOf(input.toLowerCase()) >= 0
              : true
          }
        >
          <Select.Option key="popular" value="popular">
            {formatMessage(blogMessages.PostCollectionSelector.byPopularity)}
          </Select.Option>
          <Select.Option key="publishedAt" value="publishedAt">
            {formatMessage(blogMessages.PostCollectionSelector.publishedAt)}
          </Select.Option>
          {!withOrderSelector && (
            <Select.Option key="custom" value="custom">
              {formatMessage(blogMessages.PostCollectionSelector.custom)}
            </Select.Option>
          )}
        </Select>
      </Form.Item>
      {(value?.from === 'publishedAt' || value?.from === 'popular') && (
        <>
          <Form.Item
            label={<CraftSettingLabel>{formatMessage(blogMessages.PostCollectionSelector.sort)}</CraftSettingLabel>}
          >
            <Select value={value.asc ? 'asc' : 'desc'} onChange={v => onChange?.({ ...value, asc: v === 'asc' })}>
              <Select.Option value="asc">{formatMessage(blogMessages.PostCollectionSelector.sortAsc)}</Select.Option>
              <Select.Option value="desc">{formatMessage(blogMessages.PostCollectionSelector.sortDesc)}</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            label={
              <CraftSettingLabel>{formatMessage(blogMessages.PostCollectionSelector.displayAmount)}</CraftSettingLabel>
            }
          >
            <InputNumber
              value={value.limit}
              onChange={limit => onChange?.({ ...value, limit: limit ? Number(limit) : undefined })}
            />
          </Form.Item>
          <Form.Item
            label={
              <CraftSettingLabel>
                {formatMessage(blogMessages.PostCollectionSelector.defaultCategoryId)}
              </CraftSettingLabel>
            }
          >
            <PostCategorySelect
              value={value.defaultCategoryIds}
              onChange={v => onChange?.({ ...value, defaultCategoryIds: typeof v === 'string' ? [v] : v })}
            />
          </Form.Item>
          <Form.Item
            label={
              <CraftSettingLabel>{formatMessage(blogMessages.PostCollectionSelector.defaultTagName)}</CraftSettingLabel>
            }
          >
            <PostTagSelect
              value={value.defaultTagNames}
              onChange={v => onChange?.({ ...value, defaultTagNames: typeof v === 'string' ? [v] : v })}
            />
          </Form.Item>
        </>
      )}
      {value?.from === 'custom' && (
        <Form.Item
          label={
            <CraftSettingLabel>{formatMessage(blogMessages.PostCollectionSelector.dataDisplay)}</CraftSettingLabel>
          }
        >
          {(value.idList || []).map((postId, idx) => (
            <div key={postId} className="my-2">
              <Select
                showSearch
                allowClear
                placeholder={formatMessage(blogMessages.PostCollectionSelector.choiceData)}
                value={postId}
                options={postOptions.map(({ id, title }) => ({ key: id, value: id, label: title }))}
                onChange={selectedProgramId =>
                  selectedProgramId &&
                  onChange?.({
                    ...value,
                    idList: [
                      ...(value.idList || []).slice(0, idx),
                      selectedProgramId,
                      ...(value.idList || []).slice(idx + 1),
                    ],
                  })
                }
                onClear={() =>
                  onChange?.({
                    ...value,
                    idList: [...(value.idList || []).slice(0, idx), ...(value.idList || []).slice(idx + 1)],
                  })
                }
                filterOption={(input, option) =>
                  option?.label ? (option.label as string).toLowerCase().indexOf(input.toLowerCase()) >= 0 : true
                }
              />
            </div>
          ))}
          <Button type="link" onClick={() => onChange?.({ ...value, idList: [...(value.idList || []), ''] })}>
            {formatMessage(blogMessages.PostCollectionSelector.addItem)}
          </Button>
        </Form.Item>
      )}
    </div>
  )
}

const GET_POST_ID_LIST = gql`
  query GET_POST_ID_LIST {
    post(where: { published_at: { _lt: "now()" } }) {
      id
      title
    }
  }
`

export default PostCollectionSelector

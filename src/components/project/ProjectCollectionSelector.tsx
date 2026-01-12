import { gql, useQuery } from '@apollo/client'
import { Button, Form, InputNumber, Select } from 'antd'
import { ProjectCollectionProps } from 'lodestar-app-element/src/components/collections/ProjectCollection'
import { useIntl } from 'react-intl'
import hasura from '../../hasura'
import { craftPageMessages } from '../../helpers/translation'
import { CraftSettingLabel } from '../../pages/CraftPageAdminPage/CraftSettingsPanel'
import ProjectCategorySelect from './ProjectCategorySelect'

type ProjectSourceOptions = ProjectCollectionProps['source']
const ProjectCollectionSelector: React.FC<{
  value?: ProjectSourceOptions
  onChange?: (value: ProjectSourceOptions) => void
}> = ({ value = { from: 'publishedAt' }, onChange }) => {
  const { formatMessage } = useIntl()
  const { data } = useQuery<hasura.GET_PROJECT_ID_LIST>(GET_PROJECT_ID_LIST)
  const projectOptions = data?.project.map(p => ({ id: p.id, title: p.title })) || []
  return (
    <div>
      <Form.Item label={<CraftSettingLabel>{formatMessage(craftPageMessages.label.ruleOfSort)}</CraftSettingLabel>}>
        <Select<typeof value.from>
          placeholder={formatMessage(craftPageMessages.label.choiceData)}
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
          <Select.Option key="publishedAt" value="publishedAt">
            {formatMessage(craftPageMessages.label.publishedAt)}
          </Select.Option>
          <Select.Option key="popular" value="popular">
            {formatMessage(craftPageMessages.label.popular)}
          </Select.Option>
          <Select.Option key="custom" value="custom">
            {formatMessage(craftPageMessages.label.custom)}
          </Select.Option>
        </Select>
      </Form.Item>
      {(value?.from === 'publishedAt' || value?.from === 'popular') && (
        <>
          <Form.Item label={<CraftSettingLabel>{formatMessage(craftPageMessages.label.sort)}</CraftSettingLabel>}>
            <Select value={value.asc ? 'asc' : 'desc'} onChange={v => onChange?.({ ...value, asc: v === 'asc' })}>
              <Select.Option value="asc">{formatMessage(craftPageMessages.label.sortAsc)}</Select.Option>
              <Select.Option value="desc">{formatMessage(craftPageMessages.label.sortDesc)}</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            label={<CraftSettingLabel>{formatMessage(craftPageMessages.label.displayAmount)}</CraftSettingLabel>}
          >
            <InputNumber
              value={value.limit}
              onChange={limit => onChange?.({ ...value, limit: limit ? Number(limit) : undefined })}
            />
          </Form.Item>
          <Form.Item
            label={<CraftSettingLabel>{formatMessage(craftPageMessages.label.defaultCategoryId)}</CraftSettingLabel>}
          >
            <ProjectCategorySelect
              value={value.defaultCategoryIds}
              onChange={v => onChange?.({ ...value, defaultCategoryIds: typeof v === 'string' ? [v] : v })}
            />
          </Form.Item>
        </>
      )}
      {value?.from === 'custom' && (
        <Form.Item label={<CraftSettingLabel>{formatMessage(craftPageMessages.label.dataDisplay)}</CraftSettingLabel>}>
          {(value.idList || []).map((projectId, idx) => (
            <div key={projectId} className="my-2">
              <Select
                showSearch
                allowClear
                placeholder={formatMessage(craftPageMessages.label.choiceData)}
                value={projectId}
                options={projectOptions.map(({ id, title }) => ({ key: id, value: id, label: title }))}
                onChange={selectedProjectId =>
                  selectedProjectId &&
                  onChange?.({
                    ...value,
                    idList: [
                      ...(value.idList || []).slice(0, idx),
                      selectedProjectId,
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
            {formatMessage(craftPageMessages.label.addItem)}
          </Button>
        </Form.Item>
      )}
    </div>
  )
}

const GET_PROJECT_ID_LIST = gql`
  query GET_PROJECT_ID_LIST {
    project(where: { published_at: { _lt: "now()" } }) {
      id
      title
    }
  }
`

export default ProjectCollectionSelector

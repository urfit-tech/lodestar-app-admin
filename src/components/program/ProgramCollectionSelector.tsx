import { useQuery } from '@apollo/react-hooks'
import { Button, Form, InputNumber, Select } from 'antd'
import gql from 'graphql-tag'
import { ProgramCollectionProps } from 'lodestar-app-element/src/components/collections/ProgramCollection'
import { useIntl } from 'react-intl'
import hasura from '../../hasura'
import { craftPageMessages } from '../../helpers/translation'
import { CraftSettingLabel } from '../craft/settings/CraftSettings'
import ProgramCategorySelect from './ProgramCategorySelect'
import ProgramTagSelect from './ProgramTagSelect'

type ProgramSourceOptions = ProgramCollectionProps['sourceOptions']
const ProgramCollectionSelector: React.FC<{
  value?: ProgramSourceOptions
  onChange?: (value: ProgramSourceOptions) => void
}> = ({ value, onChange }) => {
  const { formatMessage } = useIntl()
  const { data } = useQuery<hasura.GET_PROGRAM_ID_LIST>(GET_PROGRAM_ID_LIST)
  const programOptions = data?.program.map(p => ({ id: p.id, title: p.title })) || []
  return (
    <div>
      <Form.Item label={<CraftSettingLabel>{formatMessage(craftPageMessages.label.ruleOfSort)}</CraftSettingLabel>}>
        <Select<ProgramSourceOptions['source']>
          placeholder={formatMessage(craftPageMessages.label.choiceData)}
          value={value?.source}
          onChange={source => {
            switch (source) {
              case 'publishedAt':
                onChange?.({ source, limit: 4 })
                break
              case 'currentPrice':
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
      {(value?.source === 'publishedAt' || value?.source === 'currentPrice') && (
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
            <ProgramCategorySelect
              value={value.defaultCategoryIds}
              onChange={v => onChange?.({ ...value, defaultCategoryIds: typeof v === 'string' ? [v] : v })}
            />
          </Form.Item>
          <Form.Item
            label={<CraftSettingLabel>{formatMessage(craftPageMessages.label.defaultTagName)}</CraftSettingLabel>}
          >
            <ProgramTagSelect
              value={value.defaultTagNames}
              onChange={v => onChange?.({ ...value, defaultTagNames: typeof v === 'string' ? [v] : v })}
            />
          </Form.Item>
        </>
      )}
      {value?.source === 'custom' && (
        <Form.Item label={<CraftSettingLabel>{formatMessage(craftPageMessages.label.dataDisplay)}</CraftSettingLabel>}>
          {value.idList.map((programId, idx) => (
            <div key={programId} className="my-2">
              <Select
                showSearch
                allowClear
                placeholder={formatMessage(craftPageMessages.label.choiceData)}
                value={programId}
                options={programOptions.map(({ id, title }) => ({ key: id, value: id, label: title }))}
                onChange={selectedProgramId =>
                  selectedProgramId &&
                  onChange?.({
                    ...value,
                    idList: [...value.idList.slice(0, idx), selectedProgramId, ...value.idList.slice(idx + 1)],
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

const GET_PROGRAM_ID_LIST = gql`
  query GET_PROGRAM_ID_LIST {
    program(where: { published_at: { _lt: "now()" } }) {
      id
      title
    }
  }
`

export default ProgramCollectionSelector

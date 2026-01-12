import { gql, useQuery } from '@apollo/client'
import { Button, Form, InputNumber, Select } from 'antd'
import { ProgramCollectionProps } from 'lodestar-app-element/src/components/collections/ProgramCollection'
import { useIntl } from 'react-intl'
import hasura from '../../hasura'
import { craftPageMessages } from '../../helpers/translation'
import { CraftSettingLabel } from '../../pages/CraftPageAdminPage/CraftSettingsPanel'
import ProgramCategorySelect from './ProgramCategorySelect'
import ProgramTagSelect from './ProgramTagSelect'
import programMessages from './translation'

type ProgramSourceOptions = ProgramCollectionProps['source']
const ProgramCollectionSelector: React.FC<{
  withOrderSelector?: boolean
  value?: ProgramSourceOptions
  onChange?: (value: ProgramSourceOptions) => void
}> = ({ withOrderSelector, value = { from: 'publishedAt' }, onChange }) => {
  const { formatMessage } = useIntl()
  const { data } = useQuery<hasura.GET_PROGRAM_ID_LIST>(GET_PROGRAM_ID_LIST)
  const programOptions = data?.program.map(p => ({ id: p.id, title: p.title })) || []
  return (
    <div>
      <Form.Item
        label={
          <CraftSettingLabel>{formatMessage(programMessages.ProgramCollectionSelector.ruleOfSort)}</CraftSettingLabel>
        }
      >
        <Select<typeof value.from>
          placeholder={formatMessage(programMessages.ProgramCollectionSelector.choiceData)}
          value={value?.from}
          onChange={from => {
            switch (from) {
              case 'publishedAt':
                onChange?.({ from, limit: 4 })
                break
              case 'popular':
                onChange?.({ from, limit: 4 })
                break
              case 'currentPrice':
                onChange?.({ from, limit: 4 })
                break
              case 'recentWatched':
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
            {formatMessage(craftPageMessages.label.popular)}
          </Select.Option>
          <Select.Option key="publishedAt" value="publishedAt">
            {formatMessage(programMessages.ProgramCollectionSelector.publishedAt)}
          </Select.Option>
          <Select.Option key="currentPrice" value="currentPrice">
            {formatMessage(programMessages.ProgramCollectionSelector.currentPrice)}
          </Select.Option>
          {!withOrderSelector && (
            <Select.Option key="recentWatched" value="recentWatched">
              {formatMessage(programMessages.ProgramCollectionSelector.recentWatched)}
            </Select.Option>
          )}
          {!withOrderSelector && (
            <Select.Option key="custom" value="custom">
              {formatMessage(programMessages.ProgramCollectionSelector.custom)}
            </Select.Option>
          )}
        </Select>
      </Form.Item>
      {(value?.from === 'recentWatched' ||
        value?.from === 'publishedAt' ||
        value?.from === 'currentPrice' ||
        value?.from === 'popular') && (
        <>
          <Form.Item
            label={
              <CraftSettingLabel>{formatMessage(programMessages.ProgramCollectionSelector.sort)}</CraftSettingLabel>
            }
          >
            <Select value={value.asc ? 'asc' : 'desc'} onChange={v => onChange?.({ ...value, asc: v === 'asc' })}>
              <Select.Option value="asc">
                {formatMessage(programMessages.ProgramCollectionSelector.sortAsc)}
              </Select.Option>
              <Select.Option value="desc">
                {formatMessage(programMessages.ProgramCollectionSelector.sortDesc)}
              </Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            label={
              <CraftSettingLabel>
                {formatMessage(programMessages.ProgramCollectionSelector.displayAmount)}
              </CraftSettingLabel>
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
                {formatMessage(programMessages.ProgramCollectionSelector.defaultCategoryId)}
              </CraftSettingLabel>
            }
          >
            <ProgramCategorySelect
              value={value.defaultCategoryIds}
              onChange={v => onChange?.({ ...value, defaultCategoryIds: typeof v === 'string' ? [v] : v })}
            />
          </Form.Item>
          <Form.Item
            label={
              <CraftSettingLabel>
                {formatMessage(programMessages.ProgramCollectionSelector.defaultTagName)}
              </CraftSettingLabel>
            }
          >
            <ProgramTagSelect
              value={value.defaultTagNames}
              onChange={v => onChange?.({ ...value, defaultTagNames: typeof v === 'string' ? [v] : v })}
            />
          </Form.Item>
        </>
      )}
      {value?.from === 'custom' && (
        <Form.Item
          label={
            <CraftSettingLabel>
              {formatMessage(programMessages.ProgramCollectionSelector.dataDisplay)}
            </CraftSettingLabel>
          }
        >
          {(value.idList || []).map((programId, idx) => (
            <div key={programId} className="my-2">
              <Select
                showSearch
                allowClear
                placeholder={formatMessage(programMessages.ProgramCollectionSelector.choiceData)}
                value={programId}
                options={programOptions.map(({ id, title }) => ({ key: id, value: id, label: title }))}
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
            {formatMessage(programMessages.ProgramCollectionSelector.addItem)}
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

import { gql, useQuery } from '@apollo/client'
import { Button, Form, InputNumber, Select } from 'antd'
import { ProgramContentCollectionProps } from 'lodestar-app-element/src/components/collections/ProgramContentCollection'
import { useIntl } from 'react-intl'
import hasura from '../../hasura'
import { craftPageMessages } from '../../helpers/translation'
import { CraftSettingLabel } from '../../pages/CraftPageAdminPage/CraftSettingsPanel'

type ProgramContentSourceOptions = ProgramContentCollectionProps['source']
const ProgramContentCollectionSelector: React.FC<{
  value?: ProgramContentSourceOptions
  onChange?: (value: ProgramContentSourceOptions) => void
}> = ({ value = { from: 'recentWatched' }, onChange }) => {
  const { formatMessage } = useIntl()
  const { data } = useQuery<hasura.GET_PROGRAM_CONTENT_ID_LIST>(GET_PROGRAM_CONTENT_ID_LIST)
  const programContentOptions = data?.program_content.map(pc => ({ id: pc.id, title: pc.title })) || []
  return (
    <div>
      <Form.Item label={<CraftSettingLabel>{formatMessage(craftPageMessages.label.ruleOfSort)}</CraftSettingLabel>}>
        <Select<typeof value.from>
          placeholder={formatMessage(craftPageMessages.label.choiceData)}
          value={value?.from}
          onChange={from => {
            switch (from) {
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
          <Select.Option key="recentWatched" value="recentWatched">
            {formatMessage(craftPageMessages.label.recentWatched)}
          </Select.Option>
          <Select.Option key="custom" value="custom">
            {formatMessage(craftPageMessages.label.custom)}
          </Select.Option>
        </Select>
      </Form.Item>
      {value?.from === 'recentWatched' && (
        <>
          <Form.Item
            label={<CraftSettingLabel>{formatMessage(craftPageMessages.label.displayAmount)}</CraftSettingLabel>}
          >
            <InputNumber
              value={value.limit}
              onChange={limit => onChange?.({ ...value, limit: limit ? Number(limit) : undefined })}
            />
          </Form.Item>
        </>
      )}
      {value?.from === 'custom' && (
        <Form.Item label={<CraftSettingLabel>{formatMessage(craftPageMessages.label.dataDisplay)}</CraftSettingLabel>}>
          {(value.idList || []).map((programContentId, idx) => (
            <div key={programContentId} className="my-2">
              <Select
                showSearch
                allowClear
                placeholder={formatMessage(craftPageMessages.label.choiceData)}
                value={programContentId}
                options={programContentOptions.map(({ id, title }) => ({ key: id, value: id, label: title }))}
                onChange={selectedProgramContentId =>
                  selectedProgramContentId &&
                  onChange?.({
                    ...value,
                    idList: [
                      ...(value.idList || []).slice(0, idx),
                      selectedProgramContentId,
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

const GET_PROGRAM_CONTENT_ID_LIST = gql`
  query GET_PROGRAM_CONTENT_ID_LIST {
    program_content(where: { published_at: { _lt: "now()" } }) {
      id
      title
    }
  }
`

export default ProgramContentCollectionSelector

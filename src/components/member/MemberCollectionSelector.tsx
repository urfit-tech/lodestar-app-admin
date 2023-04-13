import { gql, useQuery } from '@apollo/client'
import { defineMessages } from '@formatjs/intl'
import { Button, Form, InputNumber, Select } from 'antd'
import { MemberCollectionProps } from 'lodestar-app-element/src/components/collections/MemberCollection'
import { useIntl } from 'react-intl'
import hasura from '../../hasura'
import { craftPageMessages } from '../../helpers/translation'
import { CraftSettingLabel } from '../../pages/CraftPageAdminPage/CraftSettingsPanel'

const messages = defineMessages({
  appOwner: { id: 'craft.settings.appOwner', defaultMessage: '管理員' },
  contentCreator: { id: 'craft.settings.contentCreator', defaultMessage: '創作者' },
  generalMember: { id: 'craft.settings.generalMember', defaultMessage: '一般會員' },
})
type MemberSourceOptions = MemberCollectionProps['source']
const MemberCollectionSelector: React.FC<{
  value?: MemberSourceOptions
  onChange?: (value: MemberSourceOptions) => void
}> = ({ value = { from: 'role' }, onChange }) => {
  const { formatMessage } = useIntl()
  const { data } = useQuery<hasura.GET_MEMBER_ID_LIST>(GET_MEMBER_ID_LIST)
  const memberOptions =
    data?.member_public.filter(mp => mp.id && mp.name).map(mp => ({ id: mp.id || '', name: mp.name || '' })) || []
  return (
    <div>
      <Form.Item label={<CraftSettingLabel>{formatMessage(craftPageMessages.label.ruleOfSort)}</CraftSettingLabel>}>
        <Select<typeof value.from>
          placeholder={formatMessage(craftPageMessages.label.choiceData)}
          value={value?.from}
          onChange={from => {
            switch (from) {
              case 'role':
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
          <Select.Option key="role" value="role">
            {formatMessage(craftPageMessages.label.role)}
          </Select.Option>
          <Select.Option key="custom" value="custom">
            {formatMessage(craftPageMessages.label.custom)}
          </Select.Option>
        </Select>
      </Form.Item>
      {value?.from === 'role' && (
        <>
          <Form.Item>
            <Select value={value.role} onChange={role => onChange?.({ ...value, role })} allowClear>
              <Select.Option value="app-owner">{formatMessage(messages.appOwner)}</Select.Option>
              <Select.Option value="content-creator">{formatMessage(messages.contentCreator)}</Select.Option>
              <Select.Option value="general-member">{formatMessage(messages.generalMember)}</Select.Option>
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
        </>
      )}
      {value?.from === 'custom' && (
        <Form.Item label={<CraftSettingLabel>{formatMessage(craftPageMessages.label.dataDisplay)}</CraftSettingLabel>}>
          {(value.idList || [])?.map((memberId, idx) => (
            <div key={memberId} className="my-2">
              <Select
                showSearch
                allowClear
                placeholder={formatMessage(craftPageMessages.label.choiceData)}
                value={memberId}
                options={memberOptions.map(({ id, name }) => ({ key: id, value: id, label: name }))}
                onChange={selectedMemberId =>
                  selectedMemberId &&
                  onChange?.({
                    ...value,
                    idList: [
                      ...(value.idList || [])?.slice(0, idx),
                      selectedMemberId,
                      ...(value.idList || [])?.slice(idx + 1),
                    ],
                  })
                }
                onClear={() =>
                  onChange?.({
                    ...value,
                    idList: [...(value.idList || [])?.slice(0, idx), ...(value.idList || [])?.slice(idx + 1)],
                  })
                }
                filterOption={(input, option) =>
                  option?.label ? (option.label as string).toLowerCase().indexOf(input.toLowerCase()) >= 0 : true
                }
              />
            </div>
          ))}
          <Button type="link" onClick={() => onChange?.({ ...value, idList: [...(value.idList || [] || []), ''] })}>
            {formatMessage(craftPageMessages.label.addItem)}
          </Button>
        </Form.Item>
      )}
    </div>
  )
}

const GET_MEMBER_ID_LIST = gql`
  query GET_MEMBER_ID_LIST {
    member_public {
      id
      name
    }
  }
`

export default MemberCollectionSelector

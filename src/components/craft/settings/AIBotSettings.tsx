import { Button, Collapse, Form, Input } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import { AIBotProps } from 'lodestar-app-element/src/components/common/AIBot'
import { useIntl } from 'react-intl'
import {
  CraftElementSettings,
  CraftSettingLabel,
  StyledCollapsePanel,
} from '../../../pages/CraftPageAdminPage/CraftSettingsPanel'
import { AdminHeaderTitle } from '../../admin'
import SpaceStyleInput from '../inputs/SpaceStyleInput'
import craftMessages from '../translation'

type FieldValues = {
  system: string
  temperature: number
}
const AIBotSettings: CraftElementSettings<AIBotProps> = ({ props, onPropsChange }) => {
  const { formatMessage } = useIntl()
  const [form] = useForm<FieldValues>()

  return (
    <Form
      form={form}
      layout="vertical"
      colon={false}
      requiredMark={false}
      onValuesChange={() => {
        form.validateFields()
      }}
    >
      <Collapse ghost expandIconPosition="right" defaultActiveKey="setting">
        <StyledCollapsePanel
          key="setting"
          header={<AdminHeaderTitle>{formatMessage(craftMessages.AIBotSettings.setting)}</AdminHeaderTitle>}
        >
          <Form.Item label={formatMessage(craftMessages.AIBotSettings.systemPrompt)}>
            <Input.TextArea
              className="mb-2"
              rows={5}
              placeholder={formatMessage(craftMessages.AIBotSettings.systemPromptPlaceholder)}
              value={props.system}
              onChange={e => onPropsChange?.({ ...props, system: e.target.value })}
            />
          </Form.Item>
          <Form.Item label={formatMessage(craftMessages.AIBotSettings.assistantQuestions)}>
            {props.assistants.map((assistant, idx) => (
              <Input
                key={idx}
                className="mb-2"
                placeholder={formatMessage(craftMessages.AIBotSettings.assistantQuestionsPlaceholder)}
                value={assistant.content}
                onChange={e =>
                  onPropsChange?.({
                    ...props,
                    assistants: [
                      ...props.assistants.slice(0, idx),
                      {
                        ...assistant,
                        label: e.target.value,
                        placeholder: e.target.value,
                        content: e.target.value,
                      },
                      ...props.assistants.slice(idx + 1),
                    ],
                  })
                }
              />
            ))}
            <Button onClick={() => onPropsChange?.({ ...props, assistants: [...props.assistants, { content: '' }] })}>
              {formatMessage(craftMessages.AIBotSettings.addQuestion)}
            </Button>
          </Form.Item>
        </StyledCollapsePanel>
        <StyledCollapsePanel
          key="style"
          header={<AdminHeaderTitle>{formatMessage(craftMessages.AIBotSettings.style)}</AdminHeaderTitle>}
        >
          <Form.Item>
            <SpaceStyleInput
              value={props.customStyle}
              onChange={value => onPropsChange?.({ ...props, customStyle: { ...props.customStyle, ...value } })}
            />
          </Form.Item>
        </StyledCollapsePanel>

        <StyledCollapsePanel
          key="advancedSetting"
          header={<AdminHeaderTitle>{formatMessage(craftMessages['*'].advancedSetting)}</AdminHeaderTitle>}
        >
          <Form.Item label={<CraftSettingLabel>{formatMessage(craftMessages['*'].className)}</CraftSettingLabel>}>
            <Input
              className="mt-2"
              value={props.className}
              onChange={e => onPropsChange?.({ ...props, className: e.target.value.toString() })}
            />
          </Form.Item>
        </StyledCollapsePanel>
      </Collapse>
    </Form>
  )
}

export default AIBotSettings

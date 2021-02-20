import { useMutation } from '@apollo/react-hooks'
import { Button, DatePicker, Form, Input, InputNumber, message, Radio, Select, Skeleton } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import gql from 'graphql-tag'
import moment from 'moment'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import { handleError } from '../../helpers'
import { commonMessages, errorMessages, projectMessages } from '../../helpers/translation'
import types from '../../types'
import { ProjectAdminProps } from '../../types/project'
import { BREAK_POINT } from '../common/Responsive'
import CategorySelector from '../form/CategorySelector'

type FieldProps = {
  title: string
  categoryIds: string[]
  targetUnit: string
  targetAmount: number
  expiredAt: Date
  isParticipantsVisible: boolean
  isCountdownTimerVisible: boolean
}

const StyledFormItem = styled(Form.Item)`
  @media (min-width: ${BREAK_POINT}px) {
    .funding {
      width: calc(100% - 90px - 120px - 12px);
      position: absolute;
      right: 0;
    }
  }
`

const AmountInput: React.FC<{ unit?: string; value?: number; onChange?: (value?: number) => void }> = ({
  unit,
  value,
  onChange,
}) => {
  const { formatMessage } = useIntl()
  return (
    <InputNumber
      value={value}
      min={0}
      onChange={v => onChange && onChange(Number(v))}
      parser={value => (value ? value.replace(/\D/g, '') : '')}
      formatter={(value: string | number | undefined) =>
        unit === 'funds'
          ? `${formatMessage(commonMessages.label.amountDollar, { amount: value })}`
          : unit === 'participants'
          ? `${formatMessage(commonMessages.label.amountParticipants, { amount: value })}`
          : ''
      }
    />
  )
}

const ProjectBasicForm: React.FC<{
  project: ProjectAdminProps | null
  onRefetch?: () => void
}> = ({ project, onRefetch }) => {
  const { formatMessage } = useIntl()
  const [form] = useForm<FieldProps>()
  const [updateProjectBasic] = useMutation<types.UPDATE_PROJECT_BASIC, types.UPDATE_PROJECT_BASICVariables>(
    UPDATE_PROJECT_BASIC,
  )
  const [loading, setLoading] = useState(false)
  const [targetUnit, setTargetUnit] = useState(project?.targetUnit)

  if (!project) {
    return <Skeleton active />
  }

  const handleSubmit = (values: FieldProps) => {
    setLoading(true)

    updateProjectBasic({
      variables: {
        projectId: project.id,
        title: values.title,
        projectCategories: values.categoryIds.map((categoryId: string, index: number) => ({
          project_id: project.id,
          category_id: categoryId,
          position: index,
        })),
        targetUnit: values.targetUnit || 'funds',
        targetAmount: values.targetAmount,
        expiredAt: values.expiredAt,
        isParticipantsVisible: values.isParticipantsVisible,
        isCountdownTimerVisible: values.isCountdownTimerVisible,
      },
    })
      .then(() => {
        message.success(formatMessage(commonMessages.event.successfullySaved))
        onRefetch?.()
      })
      .catch(handleError)
      .finally(() => setLoading(false))
  }

  return (
    <Form
      form={form}
      colon={false}
      labelAlign="left"
      labelCol={{ md: { span: 4 } }}
      wrapperCol={{ md: { span: 12 } }}
      initialValues={{
        title: project.title,
        categoryIds: project.categories.map(category => category.id),
        targetUnit: project.targetUnit,
        targetAmount: project.targetAmount,
        expiredAt: project?.expiredAt ? moment(project.expiredAt) : null,
        isParticipantsVisible: project.isParticipantsVisible,
        isCountdownTimerVisible: project.isCountdownTimerVisible,
      }}
      onFinish={handleSubmit}
      onValuesChange={(_, values) => {
        values.targetUnit !== targetUnit && setTargetUnit(values.targetUnit)
      }}
    >
      <Form.Item label={formatMessage(projectMessages.label.projectTitle)} name="title">
        <Input />
      </Form.Item>
      <Form.Item label={formatMessage(commonMessages.term.category)} name="categoryIds">
        <CategorySelector classType="project" />
      </Form.Item>
      {project.projectType === 'funding' && (
        <Form.Item label={formatMessage(projectMessages.label.fundingTerm)}>
          <Input.Group compact>
            <Form.Item name="targetUnit" noStyle>
              <Select style={{ width: '90px' }}>
                <Select.Option key="funds" value="funds">
                  {formatMessage(commonMessages.label.funds)}
                </Select.Option>
                <Select.Option key="participants" value="participants">
                  {formatMessage(commonMessages.label.participants)}
                </Select.Option>
              </Select>
            </Form.Item>
            <Form.Item
              name="targetAmount"
              rules={[
                {
                  required: true,
                  message: formatMessage(errorMessages.form.isRequired, {
                    field: formatMessage(projectMessages.label.fundingTerm),
                  }),
                },
              ]}
            >
              <AmountInput unit={targetUnit} />
            </Form.Item>
            <StyledFormItem className="funding" name="expiredAt">
              <DatePicker
                style={{ width: '100%' }}
                format="YYYY-MM-DD HH:mm"
                showTime={{ format: 'HH:mm', defaultValue: moment('23:59:00', 'HH:mm:ss') }}
                showToday={false}
                placeholder={formatMessage(commonMessages.label.selectEndTime)}
                disabledDate={current => current && current < moment().endOf('day')}
              />
            </StyledFormItem>
          </Input.Group>
        </Form.Item>
      )}
      {project.projectType === 'pre-order' && (
        <Form.Item label={formatMessage(projectMessages.label.expireAt)}>
          <StyledFormItem
            name="expiredAt"
            rules={[
              {
                required: true,
                message: formatMessage(errorMessages.form.isRequired, {
                  field: formatMessage(projectMessages.label.expireAt),
                }),
              },
            ]}
          >
            <DatePicker
              style={{ width: '100%' }}
              format="YYYY-MM-DD HH:mm"
              showTime={{ format: 'HH:mm', defaultValue: moment('23:59:00', 'HH:mm:ss') }}
              showToday={false}
              placeholder={formatMessage(commonMessages.label.selectEndTime)}
              disabledDate={current => current && current < moment().endOf('day')}
            />
          </StyledFormItem>
        </Form.Item>
      )}
      <Form.Item label={formatMessage(projectMessages.label.participantsAmount)} name="isParticipantsVisible">
        <Radio.Group>
          <Radio value={true}>{formatMessage(commonMessages.status.visible)}</Radio>
          <Radio value={false}>{formatMessage(commonMessages.status.invisible)}</Radio>
        </Radio.Group>
      </Form.Item>
      <Form.Item label={formatMessage(projectMessages.label.projectCountdownTimer)} name="isCountdownTimerVisible">
        <Radio.Group>
          <Radio value={true}>{formatMessage(commonMessages.status.visible)}</Radio>
          <Radio value={false}>{formatMessage(commonMessages.status.invisible)}</Radio>
        </Radio.Group>
      </Form.Item>

      <Form.Item wrapperCol={{ md: { offset: 4 } }}>
        <Button className="mr-2" onClick={() => form.resetFields()}>
          {formatMessage(commonMessages.ui.cancel)}
        </Button>
        <Button type="primary" htmlType="submit" loading={loading}>
          {formatMessage(commonMessages.ui.save)}
        </Button>
      </Form.Item>
    </Form>
  )
}

const UPDATE_PROJECT_BASIC = gql`
  mutation UPDATE_PROJECT_BASIC(
    $projectId: uuid!
    $title: String
    $projectCategories: [project_category_insert_input!]!
    $targetUnit: String
    $targetAmount: numeric
    $expiredAt: timestamptz
    $isParticipantsVisible: Boolean!
    $isCountdownTimerVisible: Boolean!
  ) {
    update_project(
      where: { id: { _eq: $projectId } }
      _set: {
        title: $title
        target_unit: $targetUnit
        target_amount: $targetAmount
        expired_at: $expiredAt
        is_participants_visible: $isParticipantsVisible
        is_countdown_timer_visible: $isCountdownTimerVisible
      }
    ) {
      affected_rows
    }

    # update categories
    delete_project_category(where: { project_id: { _eq: $projectId } }) {
      affected_rows
    }
    insert_project_category(objects: $projectCategories) {
      affected_rows
    }
  }
`

export default ProjectBasicForm

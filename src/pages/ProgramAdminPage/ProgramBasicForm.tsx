import { QuestionCircleFilled } from '@ant-design/icons'
import { gql, useMutation } from '@apollo/client'
import { Text } from '@chakra-ui/react'
import { Button, Form, Input, message, Radio, Skeleton, Tooltip } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import { StyledTips } from '../../components/admin'
import CategorySelector from '../../components/form/CategorySelector'
import LanguageSelector from '../../components/form/LanguageSelector'
import { ProgramLayoutTemplateSelect } from '../../components/form/ProgramLayoutTemplateSelector'
import TagSelector from '../../components/form/TagSelector'
import { handleError } from '../../helpers'
import { useGetProgramLayoutTemplates, useProductSku } from '../../hooks/data'
import { useActivatedTemplateForProgram } from '../../hooks/programLayoutTemplate'
import { ProgramAdminProps } from '../../types/program'
import ProgramAdminPageMessages from './translation'

export const DEFAULT_TEMPLATE = 'default-template'

type FieldProps = {
  title: string
  categoryIds: string[]
  tags: string[]
  languages?: string[]
  isIssuesOpen: boolean
  isIntroductionSectionVisible?: boolean
  isEnrolledCountVisible: boolean
  displayHeader: boolean
  displayFooter: boolean
  programLayoutTemplateId: string
  label: string
  programLabelColor: number
}

const StyledProgramLabelColorRadio = styled(Radio)`
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  text-align: center;
`

const ProgramBasicForm: React.FC<{
  program: ProgramAdminProps | null
  onRefetch?: () => void
}> = ({ program, onRefetch }) => {
  const { formatMessage } = useIntl()
  const [form] = useForm<FieldProps>()
  const { enabledModules, settings } = useApp()
  const { loadingProduct, refetchProduct } = useProductSku(`Program_${program?.id}`)
  const { programLayoutTemplates } = useGetProgramLayoutTemplates()

  const [loading, setLoading] = useState(false)

  const currentProgramLayoutTemplateId = program?.programLayoutTemplateConfig?.ProgramLayoutTemplate?.id
  const [updateProgramBasic] = useMutation(UpdateProgramBasic)
  const { activatedTemplateForProgram } = useActivatedTemplateForProgram()
  let programLabelColorConfig = []

  if (!!settings['program_label_color.config'] && !!enabledModules.program_label) {
    try {
      programLabelColorConfig = JSON.parse(settings['program_label_color.config'])
    } catch (err) {
      console.error('App Setting: "program_label_color.config" Error:', err)
    }
  }

  if (!program || loadingProduct) {
    return <Skeleton active />
  }

  const handleSubmit = (values: FieldProps) => {
    setLoading(true)

    updateProgramBasic({
      variables: {
        programId: program.id,
        title: values.title || '',
        supportLocales: values.languages?.length ? values.languages : null,
        isIssuesOpen: values.isIssuesOpen,
        isIntroductionSectionVisible: values.isIntroductionSectionVisible ?? program.isIntroductionSectionVisible,
        isEnrolledCountVisible: values.isEnrolledCountVisible,
        programCategories: values.categoryIds.map((categoryId: string, index: number) => ({
          program_id: program.id,
          category_id: categoryId,
          position: index,
        })),
        tags: values.tags.map((programTag: string) => ({
          name: programTag,
          type: '',
        })),
        programTags: values.tags.map((programTag: string, index: number) => ({
          program_id: program.id,
          tag_name: programTag,
          position: index,
        })),
        productId: `Program_${program.id}`,
        displayHeader: values.displayHeader,
        displayFooter: values.displayFooter,
        label: values.label,
        labelColorType: values.programLabelColor.toString(),
      },
    })
      .then(async () => {
        const activateCourseTemplateId =
          values?.programLayoutTemplateId === DEFAULT_TEMPLATE ? null : values?.programLayoutTemplateId

        await activatedTemplateForProgram(program.id, activateCourseTemplateId)

        message.success(formatMessage(ProgramAdminPageMessages['*'].successfullySaved))
        refetchProduct()
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
      wrapperCol={{ md: { span: 8 } }}
      initialValues={{
        title: program.title || '',
        categoryIds: program.categories.map(category => category.id),
        tags: program.tags,
        languages: program.supportLocales,
        isIssuesOpen: program.isIssuesOpen,
        isIntroductionSectionVisible: program.isIntroductionSectionVisible,
        isEnrolledCountVisible: program.isEnrolledCountVisible,
        displayHeader: program.displayHeader,
        displayFooter: program.displayFooter,
        programLayoutTemplateId: currentProgramLayoutTemplateId,
        label: program.label || '',
        programLabelColor: Number(program.labelColorType) || 1,
      }}
      onFinish={handleSubmit}
    >
      <Form.Item label={formatMessage(ProgramAdminPageMessages.ProgramBasicForm.programTitle)} name="title">
        <Input />
      </Form.Item>

      {!!enabledModules.program_label && (
        <>
          <Form.Item label={'行銷小標'} name="label">
            <Input maxLength={16} />
            <Text color="var(--gary-dark)" size="sm">
              最多輸入16個半型文字
            </Text>
          </Form.Item>
          {programLabelColorConfig.length !== 0 && (
            <Form.Item
              label=" "
              name="programLabelColor"
              labelCol={{ xs: { span: 0 }, md: { span: 4 } }}
              wrapperCol={{ span: 14 }}
            >
              <Radio.Group style={{ display: 'flex', flexWrap: 'wrap' }}>
                {programLabelColorConfig.map(
                  (programLabelColor: { backgroundColor: string; textColor: string }, index: number) => (
                    <StyledProgramLabelColorRadio value={index + 1} key={programLabelColor.backgroundColor}>
                      <Text
                        backgroundColor={programLabelColor.backgroundColor}
                        color={programLabelColor.textColor}
                        borderRadius="4px"
                      >
                        樣式 {index + 1}
                      </Text>
                    </StyledProgramLabelColorRadio>
                  ),
                )}
              </Radio.Group>
            </Form.Item>
          )}
        </>
      )}

      <Form.Item label={formatMessage(ProgramAdminPageMessages.ProgramBasicForm.category)} name="categoryIds">
        <CategorySelector classType="program" />
      </Form.Item>
      <Form.Item label={formatMessage(ProgramAdminPageMessages.ProgramBasicForm.tag)} name="tags">
        <TagSelector />
      </Form.Item>
      <Form.Item
        label={
          <span className="d-flex align-items-center">
            {formatMessage(ProgramAdminPageMessages.ProgramBasicForm.languages)}
            <Tooltip
              placement="top"
              title={<StyledTips>{formatMessage(ProgramAdminPageMessages.ProgramBasicForm.locale)}</StyledTips>}
            >
              <QuestionCircleFilled className="ml-2" />
            </Tooltip>
          </span>
        }
        name="languages"
        className={enabledModules.locale ? '' : 'd-none'}
      >
        <LanguageSelector />
      </Form.Item>

      {enabledModules?.program_layout_template && (
        <Form.Item
          label={formatMessage(ProgramAdminPageMessages.ProgramBasicForm.programLayoutTemplate)}
          name="programLayoutTemplateId"
        >
          <ProgramLayoutTemplateSelect programLayoutTemplates={programLayoutTemplates} />
        </Form.Item>
      )}

      <Form.Item
        label={
          <span className="d-flex align-items-center">
            {formatMessage(ProgramAdminPageMessages.ProgramBasicForm.isIntroductionSectionVisible)}
            <Tooltip
              placement="top"
              title={<StyledTips>{formatMessage(ProgramAdminPageMessages.ProgramBasicForm.sectionVisible)}</StyledTips>}
            >
              <QuestionCircleFilled className="ml-2" />
            </Tooltip>
          </span>
        }
        name="isIntroductionSectionVisible"
      >
        <Radio.Group>
          <Radio value={true}>{formatMessage(ProgramAdminPageMessages.ProgramBasicForm.displayAllSection)}</Radio>
          <Radio value={false}>{formatMessage(ProgramAdminPageMessages.ProgramBasicForm.displayTrial)}</Radio>
        </Radio.Group>
      </Form.Item>

      <Form.Item label={formatMessage(ProgramAdminPageMessages.ProgramBasicForm.isIssuesOpen)} name="isIssuesOpen">
        <Radio.Group>
          <Radio value={true}>{formatMessage(ProgramAdminPageMessages.ProgramBasicForm.active)}</Radio>
          <Radio value={false}>{formatMessage(ProgramAdminPageMessages.ProgramBasicForm.closed)}</Radio>
        </Radio.Group>
      </Form.Item>
      <Form.Item
        label={formatMessage(ProgramAdminPageMessages.ProgramBasicForm.isEnrolledCountVisible)}
        name="isEnrolledCountVisible"
      >
        <Radio.Group>
          <Radio value={true}>{formatMessage(ProgramAdminPageMessages.ProgramBasicForm.active)}</Radio>
          <Radio value={false}>{formatMessage(ProgramAdminPageMessages.ProgramBasicForm.closed)}</Radio>
        </Radio.Group>
      </Form.Item>
      <Form.Item label={formatMessage(ProgramAdminPageMessages.ProgramBasicForm.displayHeader)} name="displayHeader">
        <Radio.Group>
          <Radio value={true}>{formatMessage(ProgramAdminPageMessages.ProgramBasicForm.display)}</Radio>
          <Radio value={false}>{formatMessage(ProgramAdminPageMessages.ProgramBasicForm.hide)}</Radio>
        </Radio.Group>
      </Form.Item>
      <Form.Item label={formatMessage(ProgramAdminPageMessages.ProgramBasicForm.displayFooter)} name="displayFooter">
        <Radio.Group>
          <Radio value={true}>{formatMessage(ProgramAdminPageMessages.ProgramBasicForm.display)}</Radio>
          <Radio value={false}>{formatMessage(ProgramAdminPageMessages.ProgramBasicForm.hide)}</Radio>
        </Radio.Group>
      </Form.Item>
      <Form.Item wrapperCol={{ md: { offset: 4 } }}>
        <Button className="mr-2" onClick={() => form.resetFields()}>
          {formatMessage(ProgramAdminPageMessages['*'].cancel)}
        </Button>
        <Button type="primary" htmlType="submit" loading={loading}>
          {formatMessage(ProgramAdminPageMessages['*'].save)}
        </Button>
      </Form.Item>
    </Form>
  )
}

const UpdateProgramBasic = gql`
  mutation UpdateProgramBasic(
    $programId: uuid!
    $title: String
    $supportLocales: jsonb
    $isIssuesOpen: Boolean
    $isEnrolledCountVisible: Boolean
    $isIntroductionSectionVisible: Boolean
    $productId: String
    $sku: String
    $programCategories: [program_category_insert_input!]!
    $tags: [tag_insert_input!]!
    $programTags: [program_tag_insert_input!]!
    $displayHeader: Boolean
    $displayFooter: Boolean
    $label: String
    $labelColorType: String
  ) {
    update_program(
      where: { id: { _eq: $programId } }
      _set: {
        title: $title
        support_locales: $supportLocales
        is_issues_open: $isIssuesOpen
        is_introduction_section_visible: $isIntroductionSectionVisible
        is_enrolled_count_visible: $isEnrolledCountVisible
        display_header: $displayHeader
        display_footer: $displayFooter
        label: $label
        label_color_type: $labelColorType
      }
    ) {
      affected_rows
    }
    update_product(where: { id: { _eq: $productId } }, _set: { sku: $sku }) {
      affected_rows
    }
    # update categories
    delete_program_category(where: { program_id: { _eq: $programId } }) {
      affected_rows
    }
    insert_program_category(objects: $programCategories) {
      affected_rows
    }

    # update tags
    insert_tag(objects: $tags, on_conflict: { constraint: tag_pkey, update_columns: [updated_at] }) {
      affected_rows
    }
    delete_program_tag(where: { program_id: { _eq: $programId } }) {
      affected_rows
    }
    insert_program_tag(objects: $programTags) {
      affected_rows
    }
  }
`

export default ProgramBasicForm

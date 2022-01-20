import { QuestionCircleFilled } from '@ant-design/icons'
import { useMutation } from '@apollo/react-hooks'
import { Button, Form, Input, message, Skeleton, Tooltip } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import BraftEditor, { EditorState } from 'braft-editor'
import gql from 'graphql-tag'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import { v4 as uuid } from 'uuid'
import { StyledTips } from '../../components/admin'
import AdminBraftEditor from '../../components/form/AdminBraftEditor'
import ImageInput from '../../components/form/ImageInput'
import VideoInput from '../../components/form/VideoInput'
import hasura from '../../hasura'
import { handleError } from '../../helpers'
import { commonMessages, programMessages } from '../../helpers/translation'
import { ProgramAdminProps } from '../../types/program'

type FieldProps = {
  coverVideoUrl: string
  abstract: string
  description: EditorState
}

const ProgramIntroForm: React.FC<{
  program: ProgramAdminProps | null
  onRefetch?: () => void
}> = ({ program, onRefetch }) => {
  const { formatMessage } = useIntl()
  const [form] = useForm<FieldProps>()
  const { id: appId } = useApp()
  const [updateProgramCover] = useMutation<hasura.UPDATE_PROGRAM_COVER, hasura.UPDATE_PROGRAM_COVERVariables>(
    UPDATE_PROGRAM_COVER,
  )
  const [updateProgramIntro] = useMutation<hasura.UPDATE_PROGRAM_INTRO, hasura.UPDATE_PROGRAM_INTROVariables>(
    UPDATE_PROGRAM_INTRO,
  )
  const [loading, setLoading] = useState(false)
  const coverId = uuid()
  if (!program) {
    return <Skeleton active />
  }

  const handleUpdateCover = () => {
    setLoading(true)
    updateProgramCover({
      variables: {
        programId: program.id,
        coverUrl: `https://${process.env.REACT_APP_S3_BUCKET}/program_covers/${appId}/${program.id}/${coverId}`,
      },
    })
      .then(() => {
        message.success(formatMessage(commonMessages.event.successfullySaved))
        onRefetch?.()
      })
      .catch(handleError)
      .finally(() => setLoading(false))
  }

  const handleSubmit = (values: FieldProps) => {
    setLoading(true)
    updateProgramIntro({
      variables: {
        programId: program.id,
        abstract: values.abstract,
        description: values.description?.getCurrentContent().hasText() ? values.description.toRAW() : null,
        coverVideoUrl: values.coverVideoUrl,
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
      wrapperCol={{ md: { span: 10 } }}
      initialValues={{
        coverVideoUrl: program.coverVideoUrl,
        abstract: program.abstract,
        description: BraftEditor.createEditorState(program.description),
      }}
      onFinish={handleSubmit}
    >
      <Form.Item
        label={
          <span className="d-flex align-items-center">
            {formatMessage(programMessages.label.programCover)}
            <Tooltip placement="top" title={<StyledTips>{formatMessage(programMessages.text.imageTips)}</StyledTips>}>
              <QuestionCircleFilled className="ml-2" />
            </Tooltip>
          </span>
        }
      >
        <ImageInput
          path={`program_covers/${appId}/${program.id}/${coverId}`}
          image={{
            width: '160px',
            ratio: 9 / 16,
            shape: 'rounded',
          }}
          value={program.coverUrl}
          onChange={() => handleUpdateCover()}
        />
      </Form.Item>
      <Form.Item label={formatMessage(commonMessages.label.introductionVideo)} name="coverVideoUrl">
        <VideoInput appId={appId} productId={program.id} productType="program" />
      </Form.Item>
      <Form.Item label={formatMessage(programMessages.label.programAbstract)} name="abstract">
        <Input.TextArea rows={5} />
      </Form.Item>
      <Form.Item
        label={formatMessage(programMessages.label.programDescription)}
        wrapperCol={{ md: { span: 20 } }}
        name="description"
      >
        <AdminBraftEditor />
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

const UPDATE_PROGRAM_COVER = gql`
  mutation UPDATE_PROGRAM_COVER($programId: uuid!, $coverUrl: String) {
    update_program(where: { id: { _eq: $programId } }, _set: { cover_url: $coverUrl }) {
      affected_rows
    }
  }
`
const UPDATE_PROGRAM_INTRO = gql`
  mutation UPDATE_PROGRAM_INTRO($programId: uuid!, $abstract: String, $description: String, $coverVideoUrl: String) {
    update_program(
      where: { id: { _eq: $programId } }
      _set: { abstract: $abstract, description: $description, cover_video_url: $coverVideoUrl }
    ) {
      affected_rows
    }
  }
`

export default ProgramIntroForm

import { useMutation } from '@apollo/react-hooks'
import { Button, Icon, Input, message, Tooltip, Typography } from 'antd'
import Form, { FormComponentProps } from 'antd/lib/form'
import BraftEditor from 'braft-editor'
import gql from 'graphql-tag'
import React, { useContext, useState } from 'react'
import { defineMessages, useIntl } from 'react-intl'
import styled from 'styled-components'
import AppContext from '../../contexts/AppContext'
import { handleError } from '../../helpers'
import { commonMessages } from '../../helpers/translation'
import types from '../../types'
import { ProgramType } from '../../types/program'
import { StyledTips } from '../admin'
import AdminBraftEditor from '../admin/AdminBraftEditor'
import AdminCard from '../admin/AdminCard'
import { CustomRatioImage } from '../common/Image'
import { BREAK_POINT } from '../common/Responsive'
import SingleUploader from '../common/SingleUploader'

export const CoverBlock = styled.div`
  margin-bottom: 2rem;
  width: 100%;
  max-width: 12rem;
  overflow: hidden;
  border-radius: 4px;
  box-shadow: 0 4px 12px 0 rgba(0, 0, 0, 0.06);

  @media (min-width: ${BREAK_POINT}px) {
    margin-right: 2rem;
    margin-bottom: 0;
  }
`
export const StyledSingleUploader = styled(SingleUploader)`
  && {
    width: auto;
  }

  .ant-upload.ant-upload-select-picture-card {
    margin: 0;
    height: auto;
    width: 120px;
    border: none;
    background: none;

    .ant-upload {
      padding: 0;
    }
  }
`

const messages = defineMessages({
  programIntroduction: { id: 'program.label.programIntroduction', defaultMessage: '課程介紹' },
  programCover: { id: 'program.label.programCover', defaultMessage: '課程封面' },
  introductionVideo: { id: 'program.label.introductionVideo', defaultMessage: '介紹影片' },
  videoPlaceholder: { id: 'program.text.videoPlaceholder', defaultMessage: '貼上影片網址' },
  programAbstract: { id: 'program.label.programAbstract', defaultMessage: '課程摘要' },
  programDescription: { id: 'program.label.programDescription', defaultMessage: '課程描述' },
  imageTips: { id: 'program.text.programImgTips', defaultMessage: '建議圖片尺寸：1200*675px' },
})

type ProgramIntroAdminCardProps = FormComponentProps & {
  program: ProgramType | null
  onRefetch?: () => void
}
const ProgramIntroAdminCard: React.FC<ProgramIntroAdminCardProps> = ({ program, form, onRefetch }) => {
  const { id: appId } = useContext(AppContext)
  const { formatMessage } = useIntl()
  const [updateProgramCover] = useMutation<types.UPDATE_PROGRAM_COVER, types.UPDATE_PROGRAM_COVERVariables>(
    UPDATE_PROGRAM_COVER,
  )
  const [updateProgramIntro] = useMutation<types.UPDATE_PROGRAM_INTRO, types.UPDATE_PROGRAM_INTROVariables>(
    UPDATE_PROGRAM_INTRO,
  )

  const [loading, setLoading] = useState(false)

  const handleUpdateCover = () => {
    const uploadTime = Date.now()

    program &&
      form.validateFields((error, values) => {
        if (!error) {
          updateProgramCover({
            variables: {
              programId: program.id,
              coverUrl: values.coverImg
                ? `https://${process.env.REACT_APP_S3_BUCKET}/program_covers/${appId}/${program.id}?t=${uploadTime}`
                : undefined,
            },
          })
            .then(() => {
              onRefetch && onRefetch()
              message.success(formatMessage(commonMessages.event.successfullySaved))
            })
            .catch(handleError)
        }
      })
  }

  const handleSubmit = () => {
    program &&
      form.validateFields((error, values) => {
        if (!error) {
          setLoading(true)

          updateProgramIntro({
            variables: {
              programId: program.id,
              abstract: values.abstract || '',
              description: values.description.toRAW(),
              coverVideoUrl: values.coverVideoUrl,
            },
          })
            .then(() => {
              onRefetch && onRefetch()
              message.success(formatMessage(commonMessages.event.successfullySaved))
            })
            .catch(handleError)
            .finally(() => setLoading(false))
        }
      })
  }

  return (
    <AdminCard loading={!program}>
      <Typography.Title level={4}>{formatMessage(messages.programIntroduction)}</Typography.Title>

      {program && (
        <Form labelCol={{ span: 24, md: { span: 4 } }} wrapperCol={{ span: 24, md: { span: 10 } }}>
          <Form.Item
            label={
              <>
                {formatMessage(messages.programCover)}
                <Tooltip placement="topLeft" title={<StyledTips>{formatMessage(messages.imageTips)}</StyledTips>}>
                  <Icon type="question-circle" theme="filled" className="ml-2" />
                </Tooltip>
              </>
            }
          >
            <div className="d-flex align-items-center flex-wrap">
              {program.coverUrl && (
                <CoverBlock>
                  <CustomRatioImage src={program.coverUrl} width="100%" ratio={9 / 16} />
                </CoverBlock>
              )}
              {form.getFieldDecorator('coverImg')(
                <StyledSingleUploader
                  accept="image/*"
                  listType="picture-card"
                  path={`program_covers/${appId}/${program.id}`}
                  showUploadList={false}
                  onSuccess={() => handleUpdateCover()}
                  isPublic
                />,
              )}
            </div>
          </Form.Item>
        </Form>
      )}

      {program && (
        <Form
          onSubmit={e => {
            e.preventDefault()
            handleSubmit()
          }}
          labelCol={{ span: 24, md: { span: 4 } }}
          wrapperCol={{ span: 24, md: { span: 10 } }}
        >
          <Form.Item label={formatMessage(messages.introductionVideo)}>
            {form.getFieldDecorator('coverVideoUrl', {
              initialValue: program.coverVideoUrl,
            })(<Input placeholder={formatMessage(messages.videoPlaceholder)} />)}
          </Form.Item>
          <Form.Item label={formatMessage(messages.programAbstract)}>
            {form.getFieldDecorator('abstract', {
              initialValue: program.abstract,
            })(<Input.TextArea rows={5} />)}
          </Form.Item>
          <Form.Item label={formatMessage(messages.programDescription)} wrapperCol={{ md: { span: 20 } }}>
            {form.getFieldDecorator('description', {
              initialValue: BraftEditor.createEditorState(program.description),
            })(<AdminBraftEditor />)}
          </Form.Item>
          <Form.Item wrapperCol={{ md: { offset: 4 } }}>
            <Button onClick={() => form.resetFields()}>{formatMessage(commonMessages.ui.cancel)}</Button>
            <Button className="ml-2" type="primary" htmlType="submit" loading={loading}>
              {formatMessage(commonMessages.ui.save)}
            </Button>
          </Form.Item>
        </Form>
      )}
    </AdminCard>
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

export default Form.create<ProgramIntroAdminCardProps>()(ProgramIntroAdminCard)

import { useMutation } from '@apollo/react-hooks'
import { Button, Input, message, Typography } from 'antd'
import Form, { FormComponentProps } from 'antd/lib/form'
import BraftEditor from 'braft-editor'
import gql from 'graphql-tag'
import React, { useState } from 'react'
import styled from 'styled-components'
import { InferType } from 'yup'
import { handleError } from '../../helpers'
import { programSchema } from '../../schemas/program'
import types from '../../types'
import AdminCard from '../common/AdminCard'
import { BREAK_POINT } from '../common/Responsive'
import SingleUploader from '../common/SingleUploader'
import StyledBraftEditor from '../common/StyledBraftEditor'

const StyledProgramCover = styled.img`
  margin-bottom: 2rem;
  width: 100%;
  max-width: 12rem;
  border-radius: 4px;
  box-shadow: 0 4px 12px 0 rgba(0, 0, 0, 0.06);

  @media (min-width: ${BREAK_POINT}px) {
    margin-right: 2rem;
    margin-bottom: 0;
  }
`
const StyledSingleUploader = styled(SingleUploader)`
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

type ProgramIntroAdminCardProps = FormComponentProps & {
  program: InferType<typeof programSchema> | null
  onRefetch?: () => void
}
const ProgramIntroAdminCard: React.FC<ProgramIntroAdminCardProps> = ({ program, form, onRefetch }) => {
  const [updateProgramIntro] = useMutation<types.UPDATE_PROGRAM_INTRO, types.UPDATE_PROGRAM_INTROVariables>(
    UPDATE_PROGRAM_INTRO,
  )

  const [loading, setLoading] = useState(false)
  const [submitTimes, setSubmitTimes] = useState(Date.now())

  const submit = () => {
    program &&
      form.validateFields((error, values) => {
        if (!error) {
          setLoading(true)

          updateProgramIntro({
            variables: {
              programId: program.id,
              abstract: values.abstract || '',
              description: values.description.toRAW(),
              coverUrl: values.coverImg
                ? `https://${process.env.REACT_APP_S3_PUBLIC_BUCKET}/program_covers/${process.env.REACT_APP_ID}/${program.id}?t=${submitTimes}`
                : '',
              coverVideoUrl: values.coverVideoUrl,
            },
          })
            .then(() => {
              setSubmitTimes(submitTimes + 1)
              onRefetch && onRefetch()
              message.success('儲存成功')
            })
            .catch(handleError)
            .finally(() => setLoading(false))
        }
      })
  }

  return (
    <AdminCard loading={!program}>
      <Typography.Title level={4}>課程介紹</Typography.Title>
      {program && (
        <Form
          onSubmit={e => {
            e.preventDefault()
            submit()
          }}
          labelCol={{ span: 24, md: { span: 4 } }}
          wrapperCol={{ span: 24, md: { span: 10 } }}
        >
          <Form.Item label="課程封面">
            <div className="d-flex align-items-center flex-wrap">
              {program.coverUrl && (
                <StyledProgramCover src={`${program.coverUrl}?t=${submitTimes}`} alt="program cover" />
              )}
              {form.getFieldDecorator('coverImg')(
                <StyledSingleUploader
                  accept="image/*"
                  listType="picture-card"
                  path={`program_covers/${process.env.REACT_APP_ID}/${program.id}`}
                  showUploadList={false}
                  onSuccess={() => submit()}
                  isPublic
                />,
              )}
            </div>
          </Form.Item>
          <Form.Item label="介紹影片">
            {form.getFieldDecorator('coverVideoUrl', {
              initialValue: program.coverVideoUrl,
            })(<Input placeholder="貼上影片網址" />)}
          </Form.Item>
          <Form.Item label="課程摘要">
            {form.getFieldDecorator('abstract', {
              initialValue: program.abstract,
            })(<Input.TextArea rows={5} />)}
          </Form.Item>
          <Form.Item label="課程描述" wrapperCol={{ md: { span: 20 } }}>
            {form.getFieldDecorator('description', {
              initialValue: BraftEditor.createEditorState(program.description),
            })(
              <StyledBraftEditor
                language="zh-hant"
                controls={[
                  'headings',
                  { key: 'font-size', title: '字級' },
                  'line-height',
                  'text-color',
                  'bold',
                  'italic',
                  'underline',
                  'strike-through',
                  { key: 'remove-styles', title: '清除樣式' },
                  'separator',
                  'text-align',
                  'separator',
                  'list-ol',
                  'list-ul',
                  'blockquote',
                  { key: 'code', title: '程式碼' },
                  'separator',
                  'media',
                  { key: 'link', title: '連結' },
                  { key: 'hr', title: '水平線' },
                  'separator',
                  { key: 'fullscreen', title: '全螢幕' },
                ]}
              />,
            )}
          </Form.Item>
          <Form.Item wrapperCol={{ md: { offset: 4 } }}>
            <Button onClick={() => form.resetFields()}>取消</Button>
            <Button className="ml-2" type="primary" htmlType="submit" loading={loading}>
              儲存
            </Button>
          </Form.Item>
        </Form>
      )}
    </AdminCard>
  )
}

const UPDATE_PROGRAM_INTRO = gql`
  mutation UPDATE_PROGRAM_INTRO(
    $programId: uuid!
    $abstract: String
    $description: String
    $coverUrl: String
    $coverVideoUrl: String
  ) {
    update_program(
      _set: { abstract: $abstract, description: $description, cover_url: $coverUrl, cover_video_url: $coverVideoUrl }
      where: { id: { _eq: $programId } }
    ) {
      affected_rows
    }
  }
`

export default Form.create<ProgramIntroAdminCardProps>()(ProgramIntroAdminCard)

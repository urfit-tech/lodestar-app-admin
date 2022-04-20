import { QuestionCircleFilled } from '@ant-design/icons'
import { useMutation } from '@apollo/react-hooks'
import { Button, Form, message, Skeleton, Tooltip } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import axios, { Canceler } from 'axios'
import gql from 'graphql-tag'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import { useRef, useState } from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import { v4 as uuid } from 'uuid'
import { StyledTips } from '../../components/admin'
import ImageUploader from '../../components/common/ImageUploader'
import hasura from '../../hasura'
import { handleError, uploadFile } from '../../helpers'
import ProgramAdminPageMessages from './translation'

type FieldProps = {
  coverDefaultUrl: string
  coverMobileUrl: string
  coverThumbnailUrl: string
}

const FormWrapper = styled.div`
  .ant-form-item-label label {
    height: 100%;
  }
`

const StyledUploadWarning = styled.div`
  color: var(--gray-dark);
  font-size: 14px;
  letter-spacing: 0.4px;
  height: 100%;
`

const ProgramCoverForm: React.VFC<{
  programId: string | null
  coverDefaultUrl: string
  coverMobileUrl: string
  coverThumbnailUrl: string
  onRefetch?: () => void
}> = ({ programId, coverDefaultUrl, coverMobileUrl, coverThumbnailUrl, onRefetch }) => {
  const { id: appId } = useApp()
  const { authToken } = useAuth()
  const uploadCanceler = useRef<Canceler>()

  const [form] = useForm<FieldProps>()
  const { formatMessage } = useIntl()
  const [loading, setLoading] = useState(false)

  const [updateProgramCover] = useMutation<hasura.UPDATE_PROGRAM_COVER, hasura.UPDATE_PROGRAM_COVERVariables>(
    UPDATE_PROGRAM_COVER,
  )

  const [coverImage, setCoverImage] = useState<File | null>(null)
  const [coverMobileImage, setCoverMobileImage] = useState<File | null>(null)
  const [coverThumbnailImage, setCoverThumbnailImage] = useState<File | null>(null)

  if (!programId) return <Skeleton active />

  const handleSubmit = async (values: FieldProps) => {
    setLoading(true)
    const defaultCoverId = uuid()
    const mobileCoverId = uuid()
    const thumbnailCoverId = uuid()

    try {
      if (coverImage) {
        await uploadFile(`program_covers/${appId}/${programId}/${defaultCoverId}`, coverImage, authToken, {
          cancelToken: new axios.CancelToken(canceler => {
            uploadCanceler.current = canceler
          }),
        })
      }
      if (coverMobileImage) {
        await uploadFile(`program_covers/${appId}/${programId}/${mobileCoverId}`, coverMobileImage, authToken, {
          cancelToken: new axios.CancelToken(canceler => {
            uploadCanceler.current = canceler
          }),
        })
      }
      if (coverThumbnailImage) {
        await uploadFile(`program_covers/${appId}/${programId}/${thumbnailCoverId}`, coverThumbnailImage, authToken, {
          cancelToken: new axios.CancelToken(canceler => {
            uploadCanceler.current = canceler
          }),
        })
      }
    } catch (error) {
      process.env.NODE_ENV === 'development' && console.log(error)
      return error
    }

    await updateProgramCover({
      variables: {
        programId: programId,
        coverDefaultUrl: coverImage
          ? `https://${process.env.REACT_APP_S3_BUCKET}/program_covers/${appId}/${programId}/${defaultCoverId}/400`
          : coverDefaultUrl,
        coverMobileUrl: coverMobileImage
          ? `https://${process.env.REACT_APP_S3_BUCKET}/program_covers/${appId}/${programId}/${mobileCoverId}/400`
          : coverMobileUrl,
        coverThumbnailUrl: coverThumbnailImage
          ? `https://${process.env.REACT_APP_S3_BUCKET}/program_covers/${appId}/${programId}/${thumbnailCoverId}/400`
          : coverThumbnailUrl,
      },
    })
      .then(() => {
        setCoverImage(null)
        setCoverMobileImage(null)
        setCoverThumbnailImage(null)
        onRefetch?.()
        message.success(formatMessage(ProgramAdminPageMessages['*'].successfullySaved))
      })
      .catch(handleError)
      .finally(() => setLoading(false))
  }

  return (
    <FormWrapper>
      <Form
        form={form}
        colon={false}
        labelAlign="left"
        labelCol={{ md: { span: 4 } }}
        wrapperCol={{ md: { span: 10 } }}
        initialValues={{
          defaultCoverDefaultUrl: coverDefaultUrl,
          coverMobileUrl: coverMobileUrl,
          coverThumbnailUrl: coverThumbnailUrl,
        }}
        onFinish={handleSubmit}
      >
        <Form.Item
          name="defaultCover"
          label={
            <span className="d-flex align-items-center">
              {formatMessage(ProgramAdminPageMessages.ProgramCoverForm.default)}
              <Tooltip
                placement="top"
                title={
                  <StyledTips>{formatMessage(ProgramAdminPageMessages.ProgramCoverForm.defaultImageTips)}</StyledTips>
                }
              >
                <QuestionCircleFilled className="ml-2" />
              </Tooltip>
            </span>
          }
        >
          <div className="d-flex align-items-center">
            <ImageUploader file={coverImage} initialCoverUrl={coverDefaultUrl} onChange={file => setCoverImage(file)} />
            {coverImage && <StyledUploadWarning className="ml-2">* 尚未上傳</StyledUploadWarning>}
          </div>
        </Form.Item>

        <Form.Item
          label={
            <span className="d-flex align-items-center">
              {formatMessage(ProgramAdminPageMessages.ProgramCoverForm.mobile)}
            </span>
          }
        >
          <div className="d-flex align-items-center">
            <ImageUploader
              file={coverMobileImage}
              initialCoverUrl={coverMobileUrl}
              onChange={file => setCoverMobileImage(file)}
            />
            {coverMobileImage && <StyledUploadWarning className="ml-2">*尚未上傳</StyledUploadWarning>}
          </div>
        </Form.Item>

        <Form.Item
          label={
            <span className="d-flex align-items-center">
              {formatMessage(ProgramAdminPageMessages.ProgramCoverForm.thumbnail)}
              <Tooltip
                placement="top"
                title={
                  <StyledTips>{formatMessage(ProgramAdminPageMessages.ProgramCoverForm.thumbnailImageTips)}</StyledTips>
                }
              >
                <QuestionCircleFilled className="ml-2" />
              </Tooltip>
            </span>
          }
        >
          <div className="d-flex align-items-center">
            <ImageUploader
              file={coverThumbnailImage}
              initialCoverUrl={coverThumbnailUrl}
              onChange={file => setCoverThumbnailImage(file)}
            />
            {coverThumbnailImage && <StyledUploadWarning className="ml-2">*尚未上傳</StyledUploadWarning>}
          </div>
        </Form.Item>

        <Form.Item wrapperCol={{ md: { offset: 4 } }}>
          <Button
            className="mr-2"
            onClick={() => {
              setCoverImage(null)
              setCoverMobileImage(null)
              setCoverThumbnailImage(null)
              form.resetFields()
            }}
          >
            {formatMessage(ProgramAdminPageMessages['*'].cancel)}
          </Button>
          <Button type="primary" htmlType="submit" loading={loading}>
            {formatMessage(ProgramAdminPageMessages['*'].save)}
          </Button>
        </Form.Item>
      </Form>
    </FormWrapper>
  )
}

const UPDATE_PROGRAM_COVER = gql`
  mutation UPDATE_PROGRAM_COVER(
    $programId: uuid!
    $coverDefaultUrl: String
    $coverMobileUrl: String
    $coverThumbnailUrl: String
  ) {
    update_program(
      where: { id: { _eq: $programId } }
      _set: { cover_url: $coverDefaultUrl, cover_mobile_url: $coverMobileUrl, cover_thumbnail_url: $coverThumbnailUrl }
    ) {
      affected_rows
    }
  }
`

export default ProgramCoverForm

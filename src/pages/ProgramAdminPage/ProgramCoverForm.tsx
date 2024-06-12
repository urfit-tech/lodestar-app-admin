import { QuestionCircleFilled } from '@ant-design/icons'
import { gql, useMutation } from '@apollo/client'
import { Button, Checkbox, Form, message, Skeleton, Tooltip } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import axios, { Canceler } from 'axios'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import { isEmpty } from 'ramda'
import { useEffect, useRef, useState } from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import { v4 as uuid } from 'uuid'
import { StyledTips } from '../../components/admin'
import ImageUploader from '../../components/common/ImageUploader'
import hasura from '../../hasura'
import { getImageSizedUrl, handleError, isImageUrlResized, uploadFile } from '../../helpers'
import { commonMessages } from '../../helpers/translation'
import { Media } from '../../types/program'
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

const validateFile = (fileType: string): Media => {
  if (fileType.startsWith('video')) return 'video'
  else return 'image'
}

const ProgramCoverForm: React.VFC<{
  programId: string | null
  coverDefaultUrl: string
  coverMobileUrl: string
  coverThumbnailUrl: string
  coverType: string
  mobileCoverType: string
  onRefetch?: () => void
}> = ({ programId, coverDefaultUrl, coverMobileUrl, coverThumbnailUrl, coverType, mobileCoverType, onRefetch }) => {
  const { id: appId } = useApp()
  const { authToken } = useAuth()
  const uploadCanceler = useRef<Canceler>()

  const [form] = useForm<FieldProps>()
  const { formatMessage } = useIntl()
  const [loading, setLoading] = useState(false)

  const [updateProgramCover] = useMutation<hasura.UPDATE_PROGRAM_COVER, hasura.UPDATE_PROGRAM_COVERVariables>(
    UPDATE_PROGRAM_COVER,
  )

  const [coverMedia, setCoverMedia] = useState<File | null>(null)
  const [coverMobileMedia, setCoverMobileMedia] = useState<File | null>(null)
  const [coverThumbnailImage, setCoverThumbnailImage] = useState<File | null>(null)

  const [isShowOriginSizeCover, setIsShowOriginSizeCover] = useState(!isEmpty(coverDefaultUrl) && coverType === 'image')

  useEffect(() => {
    if (coverMedia) setIsShowOriginSizeCover(validateFile(coverMedia.type) === 'image')
  }, [coverMedia, coverMobileMedia])

  const [isUseOriginSizeCoverImage, setIsUseOriginSizeCoverImage] = useState(
    isEmpty(coverDefaultUrl) ? false : !isImageUrlResized(coverDefaultUrl),
  )
  const [isUseOriginSizeCoverMobileImage, setIsUseOriginSizeCoverMobileImage] = useState(
    isEmpty(coverMobileUrl) ? false : !isImageUrlResized(coverMobileUrl),
  )
  const [isUseOriginSizeCoverThumbnailImage, setIsUseOriginSizeCoverThumbnailImage] = useState(
    isEmpty(coverThumbnailUrl) ? false : !isImageUrlResized(coverThumbnailUrl),
  )

  if (!programId) return <Skeleton active />

  const handleSubmit = async (values: FieldProps) => {
    setLoading(true)
    const defaultCoverId = uuid()
    const mobileCoverId = uuid()
    const thumbnailCoverId = uuid()

    try {
      if (coverMedia) {
        await uploadFile(`program_covers/${appId}/${programId}/${defaultCoverId}`, coverMedia, authToken, {
          cancelToken: new axios.CancelToken(canceler => {
            uploadCanceler.current = canceler
          }),
        })
      }
      if (coverMobileMedia) {
        await uploadFile(`program_covers/${appId}/${programId}/${mobileCoverId}`, coverMobileMedia, authToken, {
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

    const defaultUploadCoverUrl = `https://${process.env.REACT_APP_S3_BUCKET}/program_covers/${appId}/${programId}/${defaultCoverId}`
    const uploadCoverUrl = !coverMedia
      ? coverDefaultUrl
      : validateFile(coverMedia.type) === 'image'
      ? getImageSizedUrl(isUseOriginSizeCoverImage, coverMedia ? defaultUploadCoverUrl : coverDefaultUrl)
      : defaultUploadCoverUrl

    const uploadMobileUrl = getImageSizedUrl(
      isUseOriginSizeCoverMobileImage,
      coverMobileMedia
        ? `https://${process.env.REACT_APP_S3_BUCKET}/program_covers/${appId}/${programId}/${mobileCoverId}`
        : coverMobileUrl,
    )

    const uploadThumbnailUrl = getImageSizedUrl(
      isUseOriginSizeCoverThumbnailImage,
      coverThumbnailImage
        ? `https://${process.env.REACT_APP_S3_BUCKET}/program_covers/${appId}/${programId}/${thumbnailCoverId}`
        : coverThumbnailUrl,
    )

    await updateProgramCover({
      variables: {
        programId: programId,
        coverDefaultUrl: uploadCoverUrl,
        coverMobileUrl: uploadMobileUrl,
        coverThumbnailUrl: uploadThumbnailUrl,
        coverType: coverMedia ? validateFile(coverMedia.type) : 'image',
        mobileCoverType: coverMobileMedia ? validateFile(coverMobileMedia.type) : 'image',
      },
    })
      .then(() => {
        setCoverMedia(null)
        setCoverMobileMedia(null)
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
        wrapperCol={{ md: { span: 13 } }}
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
                  <>
                    <StyledTips>{formatMessage(ProgramAdminPageMessages.ProgramCoverForm.defaultImageTips)}</StyledTips>
                    <StyledTips>{formatMessage(ProgramAdminPageMessages.ProgramCoverForm.defaultVideoTips)}</StyledTips>
                  </>
                }
              >
                <QuestionCircleFilled className="ml-2" />
              </Tooltip>
            </span>
          }
        >
          <div className="d-flex align-items-center">
            <ImageUploader
              file={coverMedia}
              initialCoverUrl={coverDefaultUrl}
              onChange={file => {
                setCoverMedia(file)
                setIsUseOriginSizeCoverImage(false)
              }}
              customName={formatMessage(commonMessages.ui.uploadMedia)}
            />
            {isShowOriginSizeCover && (
              <Checkbox
                className="ml-2"
                checked={isUseOriginSizeCoverImage}
                onChange={e => {
                  setIsUseOriginSizeCoverImage(e.target.checked)
                }}
              >
                {formatMessage(ProgramAdminPageMessages.ProgramCoverForm.showOriginSize)}
              </Checkbox>
            )}
            {coverMedia && (
              <StyledUploadWarning className="ml-2">
                {formatMessage(ProgramAdminPageMessages.ProgramCoverForm.notUploaded)}
              </StyledUploadWarning>
            )}
            {coverDefaultUrl && <StyledUploadWarning className="ml-2">{'檔案已上傳'}</StyledUploadWarning>}
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
              file={coverMobileMedia}
              initialCoverUrl={coverMobileUrl}
              onChange={file => setCoverMobileMedia(file)}
            />

            <Checkbox
              className="ml-2"
              checked={isUseOriginSizeCoverMobileImage}
              onChange={e => {
                setIsUseOriginSizeCoverMobileImage(e.target.checked)
              }}
            >
              {formatMessage(ProgramAdminPageMessages.ProgramCoverForm.showOriginSize)}
            </Checkbox>

            {coverMobileMedia && (
              <StyledUploadWarning className="ml-2">
                {formatMessage(ProgramAdminPageMessages.ProgramCoverForm.notUploaded)}
              </StyledUploadWarning>
            )}
            {coverMobileUrl && <StyledUploadWarning className="ml-2">{'檔案已上傳'}</StyledUploadWarning>}
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
            {(!isEmpty(coverThumbnailUrl) || coverThumbnailImage) && (
              <Checkbox
                className="ml-2"
                checked={isUseOriginSizeCoverThumbnailImage}
                onChange={e => {
                  setIsUseOriginSizeCoverThumbnailImage(e.target.checked)
                }}
              >
                {formatMessage(ProgramAdminPageMessages.ProgramCoverForm.showOriginSize)}
              </Checkbox>
            )}
            {coverThumbnailImage && (
              <StyledUploadWarning className="ml-2">
                {formatMessage(ProgramAdminPageMessages.ProgramCoverForm.notUploaded)}
              </StyledUploadWarning>
            )}
            {coverThumbnailUrl && <StyledUploadWarning className="ml-2">{'檔案已上傳'}</StyledUploadWarning>}
          </div>
        </Form.Item>

        <Form.Item wrapperCol={{ md: { offset: 4 } }}>
          <Button
            className="mr-2"
            onClick={() => {
              setCoverMedia(null)
              setCoverMobileMedia(null)
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
    $coverType: String!
    $mobileCoverType: String!
  ) {
    update_program(
      where: { id: { _eq: $programId } }
      _set: {
        cover_url: $coverDefaultUrl
        cover_mobile_url: $coverMobileUrl
        cover_thumbnail_url: $coverThumbnailUrl
        cover_type: $coverType
        mobile_cover_type: $mobileCoverType
      }
    ) {
      affected_rows
    }
  }
`

export default ProgramCoverForm

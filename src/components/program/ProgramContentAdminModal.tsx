import Icon, { EditOutlined, MoreOutlined, QuestionCircleFilled, UploadOutlined } from '@ant-design/icons'
import { Box } from '@chakra-ui/react'
import {
  Button,
  Checkbox,
  Dropdown,
  Form,
  Input,
  InputNumber,
  Menu,
  message,
  Modal,
  Radio,
  Select,
  Skeleton,
  Tooltip,
} from 'antd'
import { useForm } from 'antd/lib/form/Form'
import axios, { Canceler } from 'axios'
import BraftEditor, { EditorState } from 'braft-editor'
import Epub from 'epubjs'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import moment, { Moment } from 'moment'
import { last } from 'ramda'
import React, { useEffect, useRef, useState } from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import { v4 as uuidV4 } from 'uuid'
import { program_content_ebook_toc_insert_input } from '../../hasura'
import {
  contentTypeFormat,
  convertFileToArrayBuffer,
  generateUrlWithID,
  getFileDuration,
  getVideoIDByURL,
  handleError,
  uploadFile,
} from '../../helpers'
import { commonMessages, errorMessages } from '../../helpers/translation'
import { useMutateAttachment } from '../../hooks/data'
import { useMutateProgramContentEbook } from '../../hooks/ebook'
import { useMutateProgramContent, useProgramContentActions, useProgramContentBody } from '../../hooks/program'
import { ReactComponent as ExclamationCircleIcon } from '../../images/icon/exclamation-circle.svg'
import { ProgramContentProps } from '../../types/program'
import { StyledTips } from '../admin'
import AttachmentSelector, { AttachmentSelectorValue } from '../common/AttachmentSelector'
import FileUploader from '../common/FileUploader'
import { BREAK_POINT } from '../common/Responsive'
import AdminBraftEditor from '../form/AdminBraftEditor'
import DisplayModeSelector, { DisplayMode } from './DisplayModeSelector'
import ProgramPlanSelector from './ProgramPlanSelector'
import programMessages from './translation'
import type { NavItem } from 'epubjs/types/navigation'

const StyledRadio = styled(Radio)`
  && .ant-radio {
    top: -2px;
  }
  line-height: 3rem;
  height: 3rem;
  width: 6rem;
`

const StyledInput = styled(Input)<{ status?: string }>`
  && {
    width: 380px;
  }
  border: ${props => props.status === 'error' && '1px red solid'};
  @media (min-width: ${BREAK_POINT}px) {
    && {
      width: 400px;
      margin-right: 16px;
    }
  }
`
const StyledError = styled.div`
  font-size: 1rem;
  color: red;
  width: 160px;
  margin: 4px;
`
const StyledExternalLinkTitle = styled.div`
  font-size: 1rem;
  width: 300px;
  white-space: nowrap;
  overflow: hidden;
  span {
    display: inline-block;
    animation: marquee 12s linear infinite;
  }
  @keyframes marquee {
    0% {
      transform: translate(0, 0);
    }

    100% {
      transform: translate(-100%, 0);
    }
  }
`

type FieldProps = {
  publishedAt: Moment | null
  isNotifyUpdate: boolean
  title: string
  planIds?: string[]
  duration: number
  description: EditorState
  texttrack: any
  videoAttachment: AttachmentSelectorValue | null
  externalLink?: string
  displayMode: DisplayMode
  contentBodyType: string
}

type VideoPipeline = 'attachment' | 'externalLink'

const ProgramContentAdminModal: React.FC<{
  programId: string
  programContent: ProgramContentProps
  onRefetch?: () => void
}> = ({ programId, programContent, onRefetch }) => {
  const { formatMessage } = useIntl()
  const [form] = useForm<FieldProps>()
  const { id: appId, enabledModules } = useApp()
  const { authToken, currentMemberId } = useAuth()

  const { loadingProgramContentBody, programContentBody } = useProgramContentBody(programContent.id)
  const { updateProgramContent, updateProgramContentBody, deleteProgramContent } = useMutateProgramContent()
  const { updatePlans, updateMaterials, updateVideos, updateAudios } = useProgramContentActions(programContent.id)
  const { insertAttachment } = useMutateAttachment()
  const { insertProgramContentEbook, deleteProgramContentEbook, deleteProgramContentEbookToc } =
    useMutateProgramContentEbook()

  const uploadCanceler = useRef<Canceler>()
  const [visible, setVisible] = useState(false)
  const [videoPipeline, setVideoPipeline] = useState<VideoPipeline>('attachment')
  const [externalVideoInfo, setExternalVideoInfo] = useState<{
    status: 'idle' | 'success' | 'error'
    id?: string
    source?: string
    thumbnailUrl?: string
    url?: string
    title?: string
  }>({ status: 'idle', source: 'youtube' })

  const [loading, setLoading] = useState(false)
  const [materialFiles, setMaterialFiles] = useState<File[]>(programContentBody.materials.map(v => v.data) || [])
  const [audioFiles, setAudioFiles] = useState<File[]>(programContent.audios.map(v => v.data) || [])
  const [ebookFile, setEbookFile] = useState<File | null>(programContent.ebook?.data || null)

  const [isUploadFailed, setIsUploadFailed] = useState<{
    video?: boolean
    caption?: boolean
    materials?: boolean
    audio?: boolean
  }>({})
  const [failedUploadFiles, setFailedUploadFiles] = useState<File[]>([])
  const [uploadProgress, setUploadProgress] = useState<{
    [key: string]: number
  }>({})
  const [contentType, setContentType] = useState<string>(programContent.programContentType || 'video')

  const handleSubmit = async (values: FieldProps) => {
    setLoading(true)
    setIsUploadFailed({})
    setFailedUploadFiles([])
    setUploadProgress({})
    if (
      enabledModules.program_content_external_file &&
      videoPipeline === 'externalLink' &&
      externalVideoInfo?.status === 'error'
    ) {
      return setLoading(false)
    }

    const uploadError: typeof isUploadFailed = {}

    let updatedProgramContentBodyId = programContentBody.id

    // upload audio files
    const newAudioFiles = audioFiles.filter(
      file =>
        !programContent.audios.some(
          audio => audio.data.name === file.name && audio.data.lastModified === file.lastModified,
        ),
    )
    let audioDuration = newAudioFiles.length === 0 && audioFiles.length > 0 ? values.duration : 0
    if (contentType === 'audio') {
      if (newAudioFiles.length > 0) {
        for (const file of newAudioFiles) {
          await uploadFile(`audios/${appId}/${programId}/${programContent.id}`, file, authToken, {
            cancelToken: new axios.CancelToken(canceler => (uploadCanceler.current = canceler)),
            onUploadProgress: ({ loaded, total }) => {
              setUploadProgress(prev => ({ ...prev, [file.name]: Math.floor((loaded / total) * 100) }))
            },
          }).catch(() => {
            uploadError.materials = true
            setFailedUploadFiles(prev => [...prev, file])
          })
          audioDuration += await getFileDuration(file)
        }
      }
      form.setFieldsValue({ duration: audioDuration })
    }

    // upload materials when material is not empty and content type is video or text or audio
    const newMaterialFiles = materialFiles.filter(
      file =>
        !programContentBody.materials.some(
          material => material.data.name === file.name && material.data.lastModified === file.lastModified,
        ),
    )
    if (newMaterialFiles.length && (contentType === 'video' || contentType === 'text' || contentType === 'audio')) {
      for (const file of newMaterialFiles) {
        await uploadFile(`materials/${appId}/${programContent.id}_${file.name}`, file, authToken, {
          cancelToken: new axios.CancelToken(canceler => (uploadCanceler.current = canceler)),
          onUploadProgress: ({ loaded, total }) => {
            setUploadProgress(prev => ({ ...prev, [file.name]: Math.floor((loaded / total) * 100) }))
          },
        }).catch(() => {
          uploadError.materials = true
          setFailedUploadFiles(prev => [...prev, file])
        })
      }
    }
    setIsUploadFailed(uploadError)

    // upload ebook
    const newEbookFile = ebookFile?.lastModified !== programContent.ebook?.data?.lastModified ? ebookFile : null
    if (enabledModules.ebook && contentType === 'ebook' && newEbookFile) {
      if (programContent.programContentType !== 'ebook') {
        deleteProgramContentEbookToc({ variables: { programContentId: programContent.id } }).catch(handleError)
        deleteProgramContentEbook({ variables: { programContentId: programContent.id } }).catch(handleError)
      }

      await uploadFile(`ebooks/${appId}/${programContent.id}`, newEbookFile, authToken, {
        cancelToken: new axios.CancelToken(canceler => (uploadCanceler.current = canceler)),
        onUploadProgress: ({ loaded, total }) => {
          setUploadProgress(prev => ({ ...prev, [newEbookFile.name]: Math.floor((loaded / total) * 100) }))
        },
      }).catch(() => {
        uploadError.materials = true
        setFailedUploadFiles(prev => [...prev, newEbookFile])
      })

      const url = await convertFileToArrayBuffer(newEbookFile).catch(handleError)
      const book = Epub(url)
      const toc = (await book.loaded.navigation).toc as NavItem[]

      const convert = (toc: NavItem[]): program_content_ebook_toc_insert_input[] => {
        return toc.map((v, index) => ({
          label: v.label,
          href: v.href,
          position: index,
          subitems: v.subitems ? { data: convert(v.subitems) } : undefined,
        }))
      }

      insertProgramContentEbook({
        variables: {
          programContentEbook: {
            program_content_id: programContent.id,
            data: {
              name: newEbookFile.name,
              type: newEbookFile.type,
              size: newEbookFile.size,
              lastModified: newEbookFile.lastModified,
            },
            program_content_ebook_tocs: { data: convert(toc) },
          },
        },
      }).catch(handleError)
    }

    // update program content
    try {
      await updateProgramContent({
        variables: {
          programContentId: programContent.id,
          price: null,
          title: values.title || '',
          duration: values.contentBodyType === 'audio' ? audioDuration : values.duration,
          isNotifyUpdate: values.isNotifyUpdate,
          notifiedAt: values.isNotifyUpdate ? new Date() : programContent?.notifiedAt,
          programContentBodyId: updatedProgramContentBodyId,
          displayMode: values.displayMode,
          publishedAt: values.publishedAt
            ? values.publishedAt.toDate()
            : values.displayMode !== 'conceal'
            ? new Date()
            : null,
        },
      })
      if (videoPipeline === 'externalLink' && externalVideoInfo?.status === 'success') {
        const attachmentId = uuidV4()
        await insertAttachment({
          variables: {
            attachments: [
              {
                id: attachmentId,
                type: 'ProgramContent',
                target: programContent.id,
                app_id: appId,
                author_id: currentMemberId,
                name: externalVideoInfo.title || '',
                filename: externalVideoInfo.title || '',
                thumbnail_url: externalVideoInfo.thumbnailUrl,
                content_type: `video/${contentTypeFormat(externalVideoInfo?.source || '')}`,
                duration: values.duration,
                data: {
                  id: externalVideoInfo.id,
                  source: externalVideoInfo.source || null,
                  url: externalVideoInfo.url,
                },
              },
            ],
          },
        })
        await updateVideos([attachmentId])
      }
      await updateProgramContentBody({
        variables: {
          programContentId: programContent.id,
          description: values.description?.getCurrentContent().hasText() ? values.description.toRAW() : null,
          type: values.contentBodyType,
          data: {},
        },
      })
      await updatePlans(values.planIds || [])

      if (Object.values(uploadError).some(v => v)) {
        message.error(formatMessage(commonMessages.event.failedUpload))
      } else {
        message.success(formatMessage(commonMessages.event.successfullySaved))
        setUploadProgress({})
      }

      // video use media-library
      if (contentType === 'video' && videoPipeline === 'attachment') {
        await updateVideos(values.videoAttachment ? [values.videoAttachment.id] : [])
      }
      if (!uploadError.materials && (contentType === 'video' || contentType === 'text' || contentType === 'audio')) {
        await updateMaterials(materialFiles)
      }
      if (!uploadError.audio && contentType === 'audio') {
        await updateAudios(audioFiles)
      }
    } catch (error) {
      message.error(formatMessage(commonMessages.event.failedSave))
    }

    //init and reset form
    onRefetch?.()
    setVisible(false)
    setVideoPipeline('attachment')
    setExternalVideoInfo({ status: 'idle' })
    setLoading(false)
    form.resetFields()
  }

  useEffect(() => {
    if (!loadingProgramContentBody && programContentBody.materials.length) {
      setMaterialFiles(programContentBody.materials.map(v => v.data))
    }
  }, [programContentBody, loadingProgramContentBody])

  useEffect(() => {
    programContent?.videos?.length && form.setFieldsValue({ videoAttachment: last(programContent.videos) })
  }, [form, programContent?.videos])

  if (loadingProgramContentBody) return <Skeleton active />

  return (
    <>
      <EditOutlined onClick={() => setVisible(true)} />

      <Modal
        width="70vw"
        footer={null}
        maskStyle={{ background: 'rgba(255, 255, 255, 0.8)' }}
        maskClosable={false}
        closable={false}
        visible={visible}
      >
        <>
          {programContent && (
            <Form
              form={form}
              layout="vertical"
              initialValues={{
                videoAttachment: last(programContent.videos),
                publishedAt: programContent.publishedAt
                  ? moment(programContent.publishedAt)
                  : moment().startOf('minute'),
                isNotifyUpdate: programContent.isNotifyUpdate,
                title: programContent.title || '',
                planIds: programContent.programPlans?.map(programPlan => programPlan.id) || [],
                duration: programContent.duration || 0,
                video: programContentBody.data?.video,
                texttrack: programContentBody.data?.texttrack,
                description: BraftEditor.createEditorState(programContentBody.description),
                videoPipeline: 'attachment',
                selectedSource: 'youtube',
                displayMode: programContent.displayMode,
                contentBodyType: programContent.programContentType,
                ebookFile: programContent.ebook?.data || null,
              }}
              onValuesChange={(values: Partial<FieldProps>) => {
                form.setFieldsValue({
                  duration: values.videoAttachment?.duration || form.getFieldValue('duration') || 0,
                })
              }}
              onFinish={handleSubmit}
            >
              <div className="d-flex align-items-center justify-content-between mb-4">
                <div className="d-flex align-items-center">
                  <Form.Item name="contentBodyType" className="mb-0 mr-2">
                    <Select
                      onChange={v => {
                        if (typeof v === 'string') {
                          setContentType(v)
                        }
                      }}
                    >
                      <Select.Option value="video">{formatMessage(programMessages['*'].videoContent)}</Select.Option>
                      <Select.Option value="text">{formatMessage(programMessages['*'].articleContent)}</Select.Option>
                      <Select.Option value="audio">{formatMessage(programMessages['*'].audioContent)}</Select.Option>
                      {enabledModules.ebook ? (
                        <Select.Option value="ebook">{formatMessage(programMessages['*'].ebook)}</Select.Option>
                      ) : null}
                    </Select>
                  </Form.Item>

                  {programContent.displayMode && (
                    <DisplayModeSelector contentType={contentType} displayMode={programContent.displayMode} />
                  )}

                  <Form.Item name="isNotifyUpdate" valuePropName="checked" className="mb-0">
                    <Checkbox>{formatMessage(programMessages['*'].notifyUpdate)}</Checkbox>
                  </Form.Item>
                </div>

                <div className="d-flex align-items-center">
                  <Button
                    disabled={loading}
                    onClick={() => {
                      setVisible(false)
                      form.resetFields()
                    }}
                    className="mr-2"
                  >
                    {formatMessage(commonMessages.ui.cancel)}
                  </Button>
                  <Button type="primary" htmlType="submit" loading={loading} className="mr-2">
                    {formatMessage(commonMessages.ui.save)}
                  </Button>
                  <Dropdown
                    trigger={['click']}
                    placement="bottomRight"
                    overlay={
                      <Menu>
                        <Menu.Item
                          onClick={() =>
                            window.confirm(
                              formatMessage(programMessages.ProgramContentAdminModal.deleteContentWarning),
                            ) &&
                            deleteProgramContent({ variables: { programContentId: programContent.id } })
                              .then(() => onRefetch?.())
                              .catch(handleError)
                          }
                        >
                          {formatMessage(programMessages['*'].deleteContent)}
                        </Menu.Item>
                      </Menu>
                    }
                  >
                    <MoreOutlined />
                  </Dropdown>
                </div>
              </div>

              <Form.Item label={formatMessage(programMessages['*'].contentTitle)} name="title">
                <Input />
              </Form.Item>
              <Form.Item label={formatMessage(programMessages.ProgramContentAdminModal.contentPlan)} name="planIds">
                <ProgramPlanSelector
                  programId={programId}
                  placeholder={formatMessage(programMessages.ProgramContentAdminModal.contentPlan)}
                />
              </Form.Item>

              {contentType === 'video' ? (
                enabledModules.program_content_external_file ? (
                  <Form.Item label={formatMessage(commonMessages.label.video)} name="videoPipeline">
                    <Radio.Group value={videoPipeline} onChange={e => setVideoPipeline(e.target.value)}>
                      <div className={`d-flex align-items-center mb-3`}>
                        <StyledRadio value="attachment">{formatMessage(commonMessages.menu.mediaLibrary)}</StyledRadio>
                        <div className={` ${videoPipeline === 'attachment' ? '' : 'd-none'}`}>
                          <Form.Item className={`mb-0`} name="videoAttachment" noStyle>
                            <AttachmentSelector contentType="video/*" />
                          </Form.Item>
                        </div>
                      </div>

                      <div className="d-flex align-items-center">
                        <StyledRadio value="externalLink">
                          {formatMessage(commonMessages.label.externalLink)}
                        </StyledRadio>
                        <div className={`${videoPipeline === 'externalLink' ? '' : 'd-none'}`}>
                          <div className="d-lg-flex align-items-center">
                            <Form.Item name="selectedSource" noStyle>
                              <Select
                                style={{ width: '110px' }}
                                onChange={value =>
                                  setExternalVideoInfo({
                                    status: externalVideoInfo.status,
                                    source: value.toString(),
                                  })
                                }
                              >
                                <Select.Option key="youtube" value="youtube">
                                  YouTube
                                </Select.Option>
                              </Select>
                            </Form.Item>
                            <Form.Item name="externalLink" className="mb-0">
                              <StyledInput
                                status={externalVideoInfo?.status}
                                placeholder={formatMessage(commonMessages.placeholder.enterUrlLink)}
                                onChange={async e => {
                                  const id = getVideoIDByURL(e.target.value, externalVideoInfo?.source || '')
                                  const url = generateUrlWithID(id || '', externalVideoInfo?.source || '')
                                  const res = await axios.get(`https://noembed.com/embed?url=${url}`)
                                  if (e.target.value === '') {
                                    setExternalVideoInfo({ status: 'idle', source: externalVideoInfo.source })
                                  } else if (e.target.value !== '' && res.data.error) {
                                    setExternalVideoInfo({
                                      status: 'error',
                                      source: externalVideoInfo.source,
                                      url: e.target.value,
                                    })
                                  } else if (id && url) {
                                    form.setFieldsValue({ externalLink: url })
                                    setExternalVideoInfo({
                                      id: id,
                                      status: 'success',
                                      source: externalVideoInfo.source,
                                      thumbnailUrl: res.data?.thumbnail_url || null,
                                      url: e.target.value,
                                      title: res.data?.title || '',
                                    })
                                  }
                                }}
                              />
                            </Form.Item>

                            {externalVideoInfo?.status === 'error' ? (
                              <StyledError>{formatMessage(errorMessages.text.invalidUrl)}</StyledError>
                            ) : externalVideoInfo?.status === 'success' ? (
                              <StyledExternalLinkTitle>
                                <span>{externalVideoInfo.title}</span>
                              </StyledExternalLinkTitle>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    </Radio.Group>
                  </Form.Item>
                ) : (
                  <Form.Item label={formatMessage(commonMessages.label.video)} name="videoAttachment">
                    <AttachmentSelector contentType="video/*" />
                  </Form.Item>
                )
              ) : null}

              {contentType === 'audio' ? (
                <Form.Item
                  label={
                    <span className="d-flex align-items-center">
                      {formatMessage(programMessages.ProgramContentAdminModal.audioFile)}
                      <Tooltip
                        title={
                          <StyledTips>
                            {formatMessage(programMessages.ProgramContentAdminModal.audioFileTips)}
                          </StyledTips>
                        }
                      >
                        <QuestionCircleFilled className="ml-2" />
                      </Tooltip>
                    </span>
                  }
                >
                  <FileUploader
                    renderTrigger={({ onClick }) => (
                      <>
                        <Button icon={<UploadOutlined />} onClick={onClick}>
                          {formatMessage(programMessages['*'].uploadAudioFile)}
                        </Button>
                        {isUploadFailed.audio && (
                          <span className="ml-2">
                            <Icon component={() => <ExclamationCircleIcon />} className="mr-2" />
                            <span>{formatMessage(commonMessages.event.failedUpload)}</span>
                          </span>
                        )}
                      </>
                    )}
                    showUploadList
                    accept=".mp3"
                    fileList={audioFiles}
                    uploadProgress={uploadProgress}
                    failedUploadFiles={failedUploadFiles}
                    downloadableLink={file => `audios/${appId}/${programId}/${programContent.id}`}
                    onChange={files => setAudioFiles(files)}
                  />
                </Form.Item>
              ) : null}

              {(contentType === 'video' || contentType === 'audio') && (
                <Form.Item label={formatMessage(programMessages.ProgramContentAdminModal.duration)} name="duration">
                  <InputNumber
                    min={0}
                    formatter={v => Math.ceil(Number(v) / 60).toString()}
                    parser={v => Number(v) * 60}
                  />
                </Form.Item>
              )}

              {enabledModules.ebook && contentType === 'ebook' ? (
                <Form.Item label="電子書檔案">
                  <Box fontSize="14px" color="#9b9b9b" fontWeight="500" mt="4px" mb="20px">
                    {formatMessage(programMessages.ProgramContentAdminModal.uploadEbookFileTips)}
                  </Box>
                  <FileUploader
                    renderTrigger={({ onClick }) => (
                      <>
                        <Button icon={<UploadOutlined />} onClick={onClick}>
                          {formatMessage(programMessages.ProgramContentAdminModal.uploadFile)}
                        </Button>
                        {isUploadFailed.audio && (
                          <span className="ml-2">
                            <Icon component={() => <ExclamationCircleIcon />} className="mr-2" />
                            <span>{formatMessage(commonMessages.event.failedUpload)}</span>
                          </span>
                        )}
                      </>
                    )}
                    showUploadList
                    multiple={false}
                    accept=".epub"
                    fileList={ebookFile ? [ebookFile] : []}
                    uploadProgress={uploadProgress}
                    failedUploadFiles={failedUploadFiles}
                    downloadableLink={() => `ebooks/${appId}/${programId}/${programContent.id}`}
                    onChange={files => files && setEbookFile(files[0])}
                  />
                </Form.Item>
              ) : null}

              {enabledModules.program_content_material && contentType !== 'ebook' ? (
                <Form.Item label={formatMessage(commonMessages.label.material)}>
                  <FileUploader
                    renderTrigger={({ onClick }) => (
                      <>
                        <Button icon={<UploadOutlined />} onClick={onClick}>
                          {formatMessage(commonMessages.ui.selectFile)}
                        </Button>
                        {isUploadFailed.materials && (
                          <span className="ml-2">
                            <Icon component={() => <ExclamationCircleIcon />} className="mr-2" />
                            <span>{formatMessage(commonMessages.event.failedUpload)}</span>
                          </span>
                        )}
                      </>
                    )}
                    multiple
                    showUploadList
                    fileList={materialFiles}
                    uploadProgress={uploadProgress}
                    failedUploadFiles={failedUploadFiles}
                    downloadableLink={file => `materials/${appId}/${programContent.id}_${file.name}`}
                    onChange={files => setMaterialFiles(files)}
                  />
                </Form.Item>
              ) : null}

              {contentType !== 'ebook' ? (
                <Form.Item label={formatMessage(programMessages['*'].description)} name="description">
                  <AdminBraftEditor />
                </Form.Item>
              ) : null}
            </Form>
          )}
        </>
      </Modal>
    </>
  )
}

export default ProgramContentAdminModal

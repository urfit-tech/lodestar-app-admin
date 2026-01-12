import Icon, { EditOutlined, MoreOutlined, QuestionCircleFilled, UploadOutlined } from '@ant-design/icons'
import { Box, Flex } from '@chakra-ui/react'
import { Button, Checkbox, Dropdown, Form, Input, InputNumber, Menu, message, Modal, Radio, Select, Tooltip } from 'antd'
import { FormInstance } from 'antd/lib/form'
import axios, { Canceler } from 'axios'
import BraftEditor, { EditorState } from 'braft-editor'
import Epub from 'epubjs'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import moment, { Moment } from 'moment'
import { last } from 'ramda'
import React, { useRef, useState } from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import { DeepPick } from 'ts-deep-pick/lib'
import { v4 as uuidV4 } from 'uuid'
import { program_content_ebook_toc_insert_input } from '../../hasura'
import { contentTypeFormat, convertFileToArrayBuffer, generateUrlWithID, getFileDuration, getVideoIDByURL, handleError, uploadFile, uploadFileV2 } from '../../helpers'
import { commonMessages, errorMessages } from '../../helpers/translation'
import { useMutateAttachment } from '../../hooks/data'
import { useMutateProgramContentEbook } from '../../hooks/ebook'
import { useMutateProgramContent, useProgramContentActions } from '../../hooks/program'
import { ReactComponent as ExclamationCircleIcon } from '../../images/icon/exclamation-circle.svg'
import { ProgramContent } from '../../types/program'
import { StyledTips } from '../admin'
import AttachmentSelector, { AttachmentSelectorValue } from '../common/AttachmentSelector'
import FileUploader from '../common/FileUploader'
import { BREAK_POINT } from '../common/Responsive'
import AdminBraftEditor from '../form/AdminBraftEditor'
import DisplayModeSelector, { DisplayMode } from './DisplayModeSelector'
import ExerciseAdminModalBlock from './ExerciseAdminModalBlock'
import ExternalLinkAdminModalBlock from './ExternalLinkAdminModalBlock'
import PracticeAdminModalBlock from './PracticeAdminModalBlock'
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

export type FieldProps = {
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
  pinnedStatus: boolean
  trialPercentage: number
}

type VideoPipeline = 'attachment' | 'externalLink'

const ProgramContentAdminBlock: React.FC<{
  form: FormInstance<FieldProps>
  programContent:
    | (DeepPick<ProgramContent, '!videos'> &
        DeepPick<ProgramContent, 'videos.[].id' | 'videos.[].size' | 'videos.[].duration' | 'videos.[].options'>)
    | null
  programContentId: string
  programId: string
  onRefetch?: () => void
  onProgramContentRefetch?: () => void
}> = ({ form, programContent, programContentId, programId, onRefetch, onProgramContentRefetch }) => {
  const { formatMessage } = useIntl()
  const { authToken, currentMemberId } = useAuth()
  const { id: appId, enabledModules, settings } = useApp()
  const {
    insertProgramContentEbook,
    updateProgramContentEbook,
    deleteProgramContentEbook,
    deleteProgramContentEbookToc,
    deleteProgramContentEbookTocProgress,
  } = useMutateProgramContentEbook()
  const { updatePlans, updateMaterials, updateVideos, updateAudios } = useProgramContentActions(programContentId)
  const { insertAttachment } = useMutateAttachment()
  const uploadCanceler = useRef<Canceler>()
  const { updateProgramContent, updateProgramContentBody, deleteProgramContent } = useMutateProgramContent()

  const [loading, setLoading] = useState(false)
  const [displayMode, setDisplayMode] = useState<DisplayMode>(programContent?.displayMode || 'conceal')
  const [contentType, setContentType] = useState<string>(programContent?.programContentBody.type || 'video')
  const [audioFiles, setAudioFiles] = useState<File[]>(programContent?.audios?.map(v => v.data) || [])
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
  const [ebookFile, setEbookFile] = useState<File | null>(programContent?.ebook?.data || null)
  const [materialFiles, setMaterialFiles] = useState<File[]>(
    programContent?.programContentMaterials?.map(v => v.data) || [],
  )
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

  const isTrial = displayMode === 'trial' || displayMode === 'loginToTrial'

  const ebookTrialPercentageSetting = settings['ebook.trial.percentage']

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

    let updatedProgramContentBodyId = programContent?.programContentBody.id

    // upload audio files
    const newAudioFiles = audioFiles.filter(
      file =>
        !programContent?.audios?.some(
          audio => audio.data.name === file.name && audio.data.lastModified === file.lastModified,
        ),
    )
    let audioDuration = newAudioFiles.length === 0 && audioFiles.length > 0 ? values.duration : 0
    if (contentType === 'audio') {
      if (newAudioFiles.length > 0) {
        for (const file of newAudioFiles) {
          await uploadFile(`audios/${appId}/${programId}/${programContentId}`, file, authToken, {
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
        !programContent?.programContentMaterials.some(
          material => material.data.name === file.name && material.data.lastModified === file.lastModified,
        ),
    )
    if (newMaterialFiles.length && (contentType === 'video' || contentType === 'text' || contentType === 'audio')) {
      for (const file of newMaterialFiles) {
        await uploadFile(`materials/${appId}/${programContentId}_${file.name}`, file, authToken, {
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

    const newEbookFile = ebookFile?.lastModified !== programContent?.ebook?.data?.lastModified ? ebookFile : null

    if (
      enabledModules.ebook &&
      ((programContent?.programContentBody.type !== 'ebook' && contentType === 'ebook') ||
        (programContent?.programContentBody.type === 'ebook' && contentType !== 'ebook') ||
        !ebookFile)
    ) {
      deleteProgramContentEbookTocProgress({ variables: { programContentId } }).catch(handleError)
      deleteProgramContentEbookToc({ variables: { programContentId: programContentId } }).catch(handleError)
      deleteProgramContentEbook({ variables: { programContentId: programContentId } }).catch(handleError)
    }

    if (enabledModules.ebook && contentType === 'ebook') {
      if (newEbookFile) {
        await uploadFileV2(`${programContentId}.epub`, newEbookFile, 'ebook', authToken, appId, {
          cancelToken: new axios.CancelToken(canceler => (uploadCanceler.current = canceler)),
          onUploadProgress: ({ loaded, total }) => {
            setUploadProgress(prev => ({ ...prev, [newEbookFile.name]: Math.floor((loaded / total) * 100) }))
          },
        }).catch(error => {
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
              program_content_id: programContentId,
              data: {
                name: newEbookFile.name,
                type: newEbookFile.type,
                size: newEbookFile.size,
                lastModified: newEbookFile.lastModified,
              },
              trial_percentage: values.trialPercentage,
              program_content_ebook_tocs: { data: convert(toc) },
            },
          },
        }).catch(handleError)
      } else if (values.trialPercentage) {
        updateProgramContentEbook({
          variables: { programContentId: programContentId, trialPercentage: values.trialPercentage },
        })
      }
    }

    // update program content
    try {
      await updateProgramContent({
        variables: {
          programContentId: programContentId,
          price: null,
          title: values.title || '',
          duration: values.contentBodyType === 'audio' ? audioDuration : values.duration,
          isNotifyUpdate: values.isNotifyUpdate,
          notifiedAt: values.isNotifyUpdate ? new Date() : programContent?.notifiedAt,
          programContentBodyId: updatedProgramContentBodyId,
          displayMode: values.displayMode,
          pinnedStatus: values.pinnedStatus,
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
                target: programContentId,
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
          programContentId: programContentId,
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
    onProgramContentRefetch?.()
    setVisible(false)
    setVideoPipeline('attachment')
    setExternalVideoInfo({ status: 'idle' })
    setLoading(false)
    onRefetch?.()
  }

  return (
    <>
      <EditOutlined onClick={() => setVisible(true)} disabled={loading} />

      <Modal
        width="70vw"
        footer={null}
        maskStyle={{ background: 'rgba(255, 255, 255, 0.8)' }}
        maskClosable={false}
        closable={false}
        visible={visible}
        destroyOnClose={true}
      >
        <>
          {programContent &&
            (contentType === 'exercise' || contentType === 'exam' ? (
              <ExerciseAdminModalBlock
                programId={programId}
                programContent={programContent}
                displayMode={displayMode}
                onDisplayModeChange={(displayMode: DisplayMode) => setDisplayMode(displayMode)}
                onRefetch={() => {
                  onRefetch?.()
                  onProgramContentRefetch?.()
                }}
                onClose={() => setVisible(false)}
              />
            ) : contentType === 'practice' ? (
              <PracticeAdminModalBlock
                programId={programId}
                programContent={programContent}
                displayMode={displayMode}
                onDisplayModeChange={(displayMode: DisplayMode) => setDisplayMode(displayMode)}
                onRefetch={() => {
                  onRefetch?.()
                  onProgramContentRefetch?.()
                }}
                onClose={() => setVisible(false)}
              />
            ) : contentType === 'link' ? (
              <ExternalLinkAdminModalBlock
                programContentId={programContentId}
                programContent={programContent}
                displayMode={displayMode}
                onDisplayModeChange={(displayMode: DisplayMode) => setDisplayMode(displayMode)}
                onRefetch={() => {
                  onRefetch?.()
                  onProgramContentRefetch?.()
                }}
                onClose={() => setVisible(false)}
              />
            ) : (
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
                  video: programContent.videos,
                  texttrack: programContent.programContentBody?.data?.texttrack,
                  description: BraftEditor.createEditorState(programContent.programContentBody.description),
                  videoPipeline: 'attachment',
                  selectedSource: 'youtube',
                  displayMode: programContent.displayMode,
                  contentBodyType: programContent.programContentBody.type,
                  ebookFile: programContent.ebook?.data || null,
                  pinnedStatus: programContent.pinned_status,
                  trialPercentage: programContent.ebook?.trialPercentage || Number(ebookTrialPercentageSetting),
                }}
                onValuesChange={(values: Partial<FieldProps>) => {
                  form.setFieldsValue({
                    duration: values.videoAttachment?.duration || form.getFieldValue('duration') || 0,
                  })
                }}
                onFinish={handleSubmit}
              >
                <Flex
                  alignItems={{ base: 'flex-end', md: 'center' }}
                  justifyContent="space-between"
                  marginBottom="16px"
                  flexDirection={{ base: 'column-reverse', md: 'row' }}
                >
                  <Flex flexWrap="wrap" gridGap="2">
                    <Form.Item name="contentBodyType" className="mb-0">
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
                      <DisplayModeSelector
                        contentType={contentType}
                        displayMode={displayMode}
                        onDisplayModeChange={(displayMode: DisplayMode) => setDisplayMode(displayMode)}
                      />
                    )}
                    <Flex flexWrap="wrap">
                      <Form.Item name="isNotifyUpdate" valuePropName="checked" className="mb-0">
                        <Checkbox>{formatMessage(programMessages['*'].notifyUpdate)}</Checkbox>
                      </Form.Item>
                      <Form.Item name="pinnedStatus" valuePropName="checked" className="mb-0">
                        <Checkbox>{formatMessage(programMessages['*'].pinnedStatus)}</Checkbox>
                      </Form.Item>
                    </Flex>
                  </Flex>

                  <Flex alignItems="center" marginBottom={{ base: '12px', md: '0' }}>
                    <Button
                      disabled={loading}
                      onClick={() => {
                        form.resetFields()
                        setDisplayMode(programContent.displayMode)
                        setVisible(false)
                      }}
                      className="mr-2"
                    >
                      {formatMessage(commonMessages.ui.cancel)}
                    </Button>
                    <Button type="primary" htmlType="submit" loading={loading} className="mr-2">
                      {formatMessage(commonMessages.ui.save)}
                    </Button>
                    <Dropdown
                      trigger={['click', 'hover']}
                      placement="bottomRight"
                      overlayStyle={{ zIndex: 9999 }}
                      overlay={
                        <Menu>
                          <Menu.Item
                            onClick={() => {
                              window.confirm(
                                formatMessage(programMessages.ProgramContentAdminModal.deleteContentWarning),
                              ) &&
                                deleteProgramContent({ variables: { programContentId: programContentId } })
                                  .then(() => {
                                    onProgramContentRefetch?.()
                                    onRefetch?.()
                                  })
                                  .catch(err => handleError(err))
                            }}
                          >
                            {formatMessage(programMessages['*'].deleteContent)}
                          </Menu.Item>
                        </Menu>
                      }
                    >
                      <MoreOutlined />
                    </Dropdown>
                  </Flex>
                </Flex>

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
                          <StyledRadio value="attachment">
                            {formatMessage(commonMessages.menu.mediaLibrary)}
                          </StyledRadio>
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
                      downloadableLink={file => `audios/${appId}/${programId}/${programContentId}`}
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
                  <>
                    <Form.Item label={formatMessage(programMessages.ProgramContentAdminModal.ebookFile)}>
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
                        downloadableLinkV2={{ key: `${programContentId}.epub`, prefix: 'ebook' }}
                        onChange={files => files && setEbookFile(files[0])}
                      />
                    </Form.Item>
                    {!!ebookFile && !!isTrial && (
                      <Form.Item
                        label={formatMessage(programMessages.ProgramContentAdminModal.ebookTrialPercentageSetting)}
                        name="trialPercentage"
                      >
                        <InputNumber min={0} max={100} formatter={v => `${v}%`} width="200px" />
                      </Form.Item>
                    )}
                  </>
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
                      downloadableLink={file => `materials/${appId}/${programContentId}_${file.name}`}
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
            ))}
        </>
      </Modal>
    </>
  )
}
export default ProgramContentAdminBlock

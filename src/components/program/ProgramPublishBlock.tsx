import { DownOutlined, ExclamationCircleOutlined, RightOutlined } from '@ant-design/icons'
import { useMutation } from '@apollo/react-hooks'
import { Button, Dropdown, Menu, Modal, Skeleton, Typography } from 'antd'
import TextArea from 'antd/lib/input/TextArea'
import gql from 'graphql-tag'
import { sum } from 'ramda'
import React, { useContext, useRef, useState } from 'react'
import { defineMessages, useIntl } from 'react-intl'
import { Link } from 'react-router-dom'
import AppContext from '../../contexts/AppContext'
import { useAuth } from '../../contexts/AuthContext'
import { handleError } from '../../helpers'
import { commonMessages } from '../../helpers/translation'
import { ReactComponent as StatusAlertIcon } from '../../images/default/status-alert.svg'
import { ReactComponent as StatusOrdinaryIcon } from '../../images/default/status-ordinary.svg'
import { ReactComponent as StatusSearchIcon } from '../../images/default/status-search.svg'
import { ReactComponent as StatusSuccessIcon } from '../../images/default/status-success.svg'
import types from '../../types'
import { ProgramAdminProps, ProgramApprovalProps } from '../../types/program'
import { AdminBlock } from '../admin'
import { StyledModal, StyledModalParagraph, StyledModalTitle } from './ProgramDeletionAdminCard'

const messages = defineMessages({
  notYetApply: { id: 'program.label.notYetApply', defaultMessage: '尚未審核' },
  pending: { id: 'program.label.pending', defaultMessage: '審核中' },
  rejected: { id: 'program.label.rejected', defaultMessage: '審核失敗' },
  approved: { id: 'program.label.approved', defaultMessage: '審核通過，未發佈' },
  unpublishingTitle: { id: 'program.text.unpublishingTitle', defaultMessage: '確定要取消發佈？' },
  unpublishingWarning: {
    id: 'program.text.unpublishingWarning',
    defaultMessage: '課程將下架且不會出現在課程列表，已購買的學生仍然可以看到課程內容。',
  },
  isPublishedNotation: {
    id: 'program.text.isPublishedNotation',
    defaultMessage: '現在你的課程已經發佈，此課程並會出現在頁面上，學生將能購買此課程。',
  },
  isPubliclyPublishedNotation: {
    id: 'program.text.isPubliclyPublishedNotation',
    defaultMessage: '現在你的課程已公開發佈，此課程會出現在頁面上。',
  },
  isPrivatelyPublishedNotation: {
    id: 'program.text.isPrivatelyPublishedNotation',
    defaultMessage: '你的課程已經私密發佈，此課程不會出現在頁面上，學生僅能透過連結進入瀏覽。',
  },
  confirmPrivatelyPublishedTitle: {
    id: 'program.text.confirmPrivatelyPublishedTitle',
    defaultMessage: '確定要設為私密發佈？',
  },
  confirmPrivatelyPublishedNotation: {
    id: 'program.text.confirmPrivatelyPublishedNotation',
    defaultMessage: '課程將不會出現在列表，僅以私下提供連結的方式販售課程。',
  },
  isUnpublishedNotation: {
    id: 'program.text.isUnpublishedNotation',
    defaultMessage: '因你的課程未發佈，此課程並不會顯示在頁面上，學生也不能購買此課程。',
  },
  notCompleteNotation: {
    id: 'program.text.notCompleteNotation',
    defaultMessage: '請填寫以下必填資料，填寫完畢即可由此發佈',
  },
  notApprovedNotation: {
    id: 'program.text.notYetApplyNotation',
    defaultMessage: '因課程未審核通過，並不會顯示在頁面上',
  },
  checkNotation: {
    id: 'program.text.checkNotation',
    defaultMessage: '請檢查課程資訊與內容是否符合平台規範。',
  },
  jumpTo: { id: 'program.ui.jumpTo', defaultMessage: '前往填寫' },
  noProgramAbstract: { id: 'program.text.noProgramAbstract', defaultMessage: '尚未填寫課程摘要' },
  noProgramDescription: { id: 'program.text.noProgramDescription', defaultMessage: '尚未填寫課程敘述' },
  noProgramContent: { id: 'program.text.noProgramContent', defaultMessage: '尚未新增任何內容' },
  noPrice: { id: 'program.text.noPrice', defaultMessage: '尚未訂定售價' },
  apply: { id: 'program.ui.apply', defaultMessage: '立即送審' },
  cancel: { id: 'program.ui.cancel', defaultMessage: '取消送審' },
  reApply: { id: 'program.ui.reApply', defaultMessage: '重新送審' },
  reject: { id: 'program.ui.reject', defaultMessage: '退回案件' },
  approve: { id: 'program.ui.approve', defaultMessage: '審核通過' },
  applyModalTitle: { id: 'program.label.applyModalTitle', defaultMessage: '送審備註' },
  applyDescription: { id: 'program.applyDescription', defaultMessage: '備註(非必填)' },
  rejectModalTitle: { id: 'program.label.rejectModalTitle', defaultMessage: '退回案件' },
  rejectDescription: { id: 'program.label.rejectDescription', defaultMessage: '退件原因' },
})

const ProgramPublishBlock: React.FC<{
  program: ProgramAdminProps | null
  onRefetch?: () => void
}> = ({ program, onRefetch }) => {
  const { formatMessage } = useIntl()
  const { enabledModules } = useContext(AppContext)
  const { currentUserRole } = useAuth()
  const [publishProgram] = useMutation<types.PUBLISH_PROGRAM, types.PUBLISH_PROGRAMVariables>(PUBLISH_PROGRAM)
  const [sendProgramApproval] = useMutation<types.SEND_PROGRAM_APPROVAL, types.SEND_PROGRAM_APPROVALVariables>(
    SEND_PROGRAM_APPROVAL,
  )
  const [cancelProgramApproval] = useMutation<types.CANCEL_PROGRAM_APPROVAL, types.CANCEL_PROGRAM_APPROVALVariables>(
    CANCEL_PROGRAM_APPROVAL,
  )
  const [updateProgramApproval] = useMutation<types.UPDATE_PROGRAM_APPROVAL, types.UPDATE_PROGRAM_APPROVALVariables>(
    UPDATE_PROGRAM_APPROVAL,
  )

  const [publishState, setPublishState] = useState<string>(formatMessage(commonMessages.ui.publiclyPublished))
  const [isVisible, setVisible] = useState(false)
  const [isApprovalVisible, setIsApprovalVisible] = useState(false)
  const [loading, setLoading] = useState(false)
  const descriptionRef = useRef<TextArea | null>(null)

  if (!program) {
    return <Skeleton active />
  }

  const errors: { message: string; to: string }[] = []

  !program.abstract &&
    errors.push({
      message: formatMessage(messages.noProgramAbstract),
      to: `/programs/${program.id}?tab=general`,
    })
  !program.description &&
    errors.push({
      message: formatMessage(messages.noProgramDescription),
      to: `/programs/${program.id}?tab=general`,
    })
  sum(program.contentSections.map(section => section.programContents.length)) === 0 &&
    errors.push({
      message: formatMessage(messages.noProgramContent),
      to: `/programs/${program.id}?tab=content`,
    })

  program.isSubscription &&
    program.plans.length === 0 &&
    errors.push({
      message: formatMessage(messages.noPrice),
      to: `/programs/${program.id}?tab=plan`,
    })

  !program.isSubscription &&
    program.listPrice === null &&
    errors.push({
      message: formatMessage(messages.noPrice),
      to: `/programs/${program.id}?tab=plan`,
    })

  // program state
  const approvalStatus =
    !program.approvals[0] || program.approvals[0].status === 'canceled' ? 'notYetApply' : program.approvals[0].status
  const programStatus = program.publishedAt
    ? program.isPrivate
      ? 'publishedInPrivate'
      : 'published'
    : errors.length
    ? 'notValidated'
    : enabledModules.approval
    ? currentUserRole === 'app-owner' && approvalStatus === 'notYetApply'
      ? 'unpublished'
      : approvalStatus
    : 'unpublished'

  const programStatusMessage: {
    [status in typeof programStatus]: {
      title: string
      description: string
    }
  } = {
    published: {
      title: formatMessage(commonMessages.status.publiclyPublished),
      description: formatMessage(messages.isPubliclyPublishedNotation),
    },
    publishedInPrivate: {
      title: formatMessage(commonMessages.status.privatelyPublished),
      description: formatMessage(messages.isPrivatelyPublishedNotation),
    },
    unpublished: {
      title: formatMessage(commonMessages.status.unpublished),
      description: formatMessage(messages.isUnpublishedNotation),
    },
    notValidated: {
      title: formatMessage(commonMessages.status.notComplete),
      description: formatMessage(messages.notCompleteNotation),
    },
    notYetApply: {
      title: formatMessage(messages.notYetApply),
      description: formatMessage(messages.notApprovedNotation),
    },
    pending: {
      title: formatMessage(messages.pending),
      description:
        currentUserRole === 'app-owner'
          ? formatMessage(messages.checkNotation)
          : formatMessage(messages.notApprovedNotation),
    },
    rejected: {
      title: formatMessage(messages.rejected),
      description: formatMessage(messages.notApprovedNotation),
    },
    approved: {
      title: formatMessage(messages.approved),
      description: formatMessage(messages.isUnpublishedNotation),
    },
  }

  const handlePublish = (isPrivate?: boolean) => {
    if (isPrivate && !isVisible) {
      setVisible(true)
      return
    }

    publishProgram({
      variables: {
        programId: program.id,
        publishedAt: new Date(),
        isPrivate,
      },
    })
      .then(() => onRefetch && onRefetch())
      .catch(handleError)
  }
  const handleUnPublish = () => {
    Modal.confirm({
      title: formatMessage(messages.unpublishingTitle),
      content: formatMessage(messages.unpublishingWarning),
      onOk: () => {
        publishProgram({
          variables: {
            programId: program.id,
            publishedAt: null,
            isPrivate: false,
          },
        })
          .then(() => onRefetch && onRefetch())
          .catch(handleError)
      },
      onCancel: () => {},
    })
  }
  const handleSendApproval = (description?: string | null) => {
    setLoading(true)
    sendProgramApproval({
      variables: {
        programId: program.id,
        description,
      },
    })
      .then(() => onRefetch && onRefetch())
      .catch(handleError)
      .finally(() => {
        setLoading(false)
        setIsApprovalVisible(false)
      })
  }
  const handleCancelProgramApproval = () => {
    setLoading(true)
    cancelProgramApproval({
      variables: {
        programApprovalId: program.approvals[0].id,
      },
    })
      .then(() => onRefetch && onRefetch())
      .catch(handleError)
      .finally(() => setLoading(false))
  }
  const handleUpdateProgramApproval = (status: ProgramApprovalProps['status'], feedback?: string | null) => {
    setLoading(true)
    updateProgramApproval({
      variables: {
        programApprovalId: program.approvals[0].id,
        status,
        feedback,
      },
    })
      .then(() => onRefetch && onRefetch())
      .catch(handleError)
      .finally(() => {
        setLoading(false)
        setIsApprovalVisible(false)
      })
  }

  const overlay = (
    <Menu>
      {[formatMessage(commonMessages.ui.publiclyPublished), formatMessage(commonMessages.ui.privatelyPublished)]
        .filter(publishType => publishType !== publishState)
        .map(publishType => (
          <Menu.Item key={publishType}>
            <Button
              type="link"
              onClick={() => {
                setPublishState(publishType)
                handlePublish(publishType !== formatMessage(commonMessages.ui.publiclyPublished))
              }}
            >
              {publishType}
            </Button>
          </Menu.Item>
        ))}
    </Menu>
  )

  return (
    <AdminBlock>
      <div className="d-flex flex-column align-items-center py-3">
        <div className="mb-3">
          {programStatus === 'notValidated' || programStatus === 'rejected' ? (
            <StatusAlertIcon />
          ) : programStatus === 'unpublished' || programStatus === 'notYetApply' || programStatus === 'approved' ? (
            <StatusOrdinaryIcon />
          ) : programStatus === 'pending' ? (
            <StatusSearchIcon />
          ) : programStatus === 'published' || programStatus === 'publishedInPrivate' ? (
            <StatusSuccessIcon />
          ) : null}
        </div>

        <Typography.Title level={4} className="mb-2">
          {programStatusMessage[programStatus].title}
        </Typography.Title>

        <Typography.Paragraph type="secondary" className="mb-3">
          {programStatusMessage[programStatus].description}
        </Typography.Paragraph>

        {programStatus === 'notValidated' && (
          <div className="px-5 py-4 mb-3" style={{ backgroundColor: '#f7f8f8', width: '100%' }}>
            {errors.map((error, index) => (
              <div key={index} className="d-flex align-items-center mb-2">
                <ExclamationCircleOutlined className="mr-1" />
                <span className="mr-1">{error.message}</span>
                <span>
                  <Link to={error.to}>
                    {formatMessage(messages.jumpTo)} <RightOutlined />
                  </Link>
                </span>
              </div>
            ))}
          </div>
        )}

        {programStatus === 'notValidated' ? (
          <Dropdown.Button disabled icon={<DownOutlined />} overlay={overlay}>
            <div>{publishState}</div>
          </Dropdown.Button>
        ) : programStatus === 'published' || programStatus === 'publishedInPrivate' ? (
          <Button onClick={handleUnPublish}>{formatMessage(commonMessages.ui.cancelPublishing)}</Button>
        ) : programStatus === 'unpublished' || programStatus === 'approved' ? (
          <Dropdown.Button
            type="primary"
            icon={<DownOutlined />}
            overlay={overlay}
            onClick={() => handlePublish(publishState === formatMessage(commonMessages.ui.privatelyPublished))}
          >
            <div>{publishState}</div>
          </Dropdown.Button>
        ) : programStatus === 'notYetApply' ? (
          <Button type="primary" onClick={() => setIsApprovalVisible(true)}>
            {formatMessage(messages.apply)}
          </Button>
        ) : programStatus === 'pending' ? (
          currentUserRole === 'app-owner' ? (
            <div>
              <Button className="mr-2" onClick={() => setIsApprovalVisible(true)}>
                {formatMessage(messages.reject)}
              </Button>
              <Button type="primary" loading={loading} onClick={() => handleUpdateProgramApproval('approved')}>
                {formatMessage(messages.approve)}
              </Button>
            </div>
          ) : (
            <Button loading={loading} onClick={() => handleCancelProgramApproval()}>
              {formatMessage(messages.cancel)}
            </Button>
          )
        ) : programStatus === 'rejected' ? (
          <Button onClick={() => setIsApprovalVisible(true)}>{formatMessage(messages.reApply)}</Button>
        ) : null}
      </div>

      <StyledModal
        visible={isVisible}
        okText={formatMessage(commonMessages.ui.publishConfirmation)}
        cancelText={formatMessage(commonMessages.ui.back)}
        onOk={() => {
          handlePublish(true)
          setVisible(false)
        }}
        onCancel={() => setVisible(false)}
      >
        <StyledModalTitle className="mb-4">{formatMessage(messages.confirmPrivatelyPublishedTitle)}</StyledModalTitle>
        <StyledModalParagraph>{formatMessage(messages.confirmPrivatelyPublishedNotation)}</StyledModalParagraph>
      </StyledModal>

      {(programStatus === 'notYetApply' || programStatus === 'pending' || programStatus === 'rejected') && (
        <StyledModal
          visible={isApprovalVisible}
          okText={formatMessage(commonMessages.ui.send)}
          okButtonProps={{ loading }}
          cancelText={formatMessage(commonMessages.ui.back)}
          onOk={() =>
            programStatus === 'pending'
              ? handleUpdateProgramApproval('rejected', descriptionRef.current?.state.value)
              : handleSendApproval(descriptionRef.current?.state.value)
          }
          onCancel={() => setIsApprovalVisible(false)}
        >
          {programStatus === 'pending' ? (
            <>
              <StyledModalTitle className="mb-4">{formatMessage(messages.rejectModalTitle)}</StyledModalTitle>
              <StyledModalParagraph>{formatMessage(messages.rejectDescription)}</StyledModalParagraph>
            </>
          ) : (
            <>
              <StyledModalTitle className="mb-4">{formatMessage(messages.applyModalTitle)}</StyledModalTitle>
              <StyledModalParagraph>{formatMessage(messages.applyDescription)}</StyledModalParagraph>
            </>
          )}
          <TextArea ref={descriptionRef} />
        </StyledModal>
      )}
    </AdminBlock>
  )
}

const PUBLISH_PROGRAM = gql`
  mutation PUBLISH_PROGRAM($programId: uuid!, $publishedAt: timestamptz, $isPrivate: Boolean) {
    update_program(
      where: { id: { _eq: $programId } }
      _set: { published_at: $publishedAt, is_private: $isPrivate, position: -1 }
    ) {
      affected_rows
    }
  }
`
const SEND_PROGRAM_APPROVAL = gql`
  mutation SEND_PROGRAM_APPROVAL($programId: uuid!, $description: String) {
    insert_program_approval(objects: { program_id: $programId, description: $description }) {
      affected_rows
    }
  }
`
const CANCEL_PROGRAM_APPROVAL = gql`
  mutation CANCEL_PROGRAM_APPROVAL($programApprovalId: uuid!) {
    update_program_approval(where: { id: { _eq: $programApprovalId } }, _set: { status: "canceled" }) {
      affected_rows
    }
  }
`
const UPDATE_PROGRAM_APPROVAL = gql`
  mutation UPDATE_PROGRAM_APPROVAL($programApprovalId: uuid!, $status: String, $feedback: String) {
    update_program_approval(
      where: { id: { _eq: $programApprovalId } }
      _set: { status: $status, feedback: $feedback }
    ) {
      affected_rows
    }
  }
`

export default ProgramPublishBlock

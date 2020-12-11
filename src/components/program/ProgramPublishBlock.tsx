import { DownOutlined, ExclamationCircleOutlined, RightOutlined } from '@ant-design/icons'
import { useMutation } from '@apollo/react-hooks'
import { Button, Dropdown, Form, Menu, Modal, Skeleton, Typography } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import TextArea from 'antd/lib/input/TextArea'
import gql from 'graphql-tag'
import { sum } from 'ramda'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import { Link } from 'react-router-dom'
import { useApp } from '../../contexts/AppContext'
import { useAuth } from '../../contexts/AuthContext'
import { handleError } from '../../helpers'
import { commonMessages, programMessages } from '../../helpers/translation'
import { ReactComponent as StatusAlertIcon } from '../../images/default/status-alert.svg'
import { ReactComponent as StatusOrdinaryIcon } from '../../images/default/status-ordinary.svg'
import { ReactComponent as StatusSearchIcon } from '../../images/default/status-search.svg'
import { ReactComponent as StatusSuccessIcon } from '../../images/default/status-success.svg'
import types from '../../types'
import { ProgramAdminProps, ProgramApprovalProps } from '../../types/program'
import { AdminBlock } from '../admin'
import { StyledModal, StyledModalParagraph, StyledModalTitle } from './ProgramDeletionAdminCard'

type FieldProps = {
  description: string
}

const ProgramPublishBlock: React.FC<{
  program: ProgramAdminProps | null
  onRefetch?: () => void
}> = ({ program, onRefetch }) => {
  const { formatMessage } = useIntl()
  const [form] = useForm<FieldProps>()
  const { currentUserRole } = useAuth()
  const { enabledModules } = useApp()
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

  if (!program) {
    return <Skeleton active />
  }

  const errors: { message: string; to: string }[] = []

  !program.abstract &&
    errors.push({
      message: formatMessage(programMessages.text.noProgramAbstract),
      to: `/programs/${program.id}?tab=general`,
    })
  !program.description &&
    errors.push({
      message: formatMessage(programMessages.text.noProgramDescription),
      to: `/programs/${program.id}?tab=general`,
    })
  sum(program.contentSections.map(section => section.programContents.length)) === 0 &&
    errors.push({
      message: formatMessage(programMessages.text.noProgramContent),
      to: `/programs/${program.id}?tab=content`,
    })

  program.isSubscription &&
    program.plans.length === 0 &&
    errors.push({
      message: formatMessage(programMessages.text.noPrice),
      to: `/programs/${program.id}?tab=plan`,
    })

  !program.isSubscription &&
    program.listPrice === null &&
    errors.push({
      message: formatMessage(programMessages.text.noPrice),
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
      description: formatMessage(programMessages.text.isPubliclyPublishedNotation),
    },
    publishedInPrivate: {
      title: formatMessage(commonMessages.status.privatelyPublished),
      description: formatMessage(programMessages.text.isPrivatelyPublishedNotation),
    },
    unpublished: {
      title: formatMessage(commonMessages.status.unpublished),
      description: formatMessage(programMessages.text.isUnpublishedNotation),
    },
    notValidated: {
      title: formatMessage(commonMessages.status.notComplete),
      description: formatMessage(programMessages.text.notCompleteNotation),
    },
    notYetApply: {
      title: formatMessage(programMessages.label.notYetApply),
      description: formatMessage(programMessages.text.notApprovedNotation),
    },
    pending: {
      title: formatMessage(programMessages.label.pending),
      description:
        currentUserRole === 'app-owner'
          ? formatMessage(programMessages.text.checkNotation)
          : formatMessage(programMessages.text.notApprovedNotation),
    },
    rejected: {
      title: formatMessage(programMessages.label.rejected),
      description: formatMessage(programMessages.text.notApprovedNotation),
    },
    approved: {
      title: formatMessage(programMessages.label.approved),
      description: formatMessage(programMessages.text.isUnpublishedNotation),
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
      .then(() => onRefetch?.())
      .catch(handleError)
  }
  const handleUnPublish = () => {
    Modal.confirm({
      title: formatMessage(commonMessages.text.unpublishingTitle),
      content: formatMessage(programMessages.text.unpublishingWarning),
      onOk: () => {
        publishProgram({
          variables: {
            programId: program.id,
            publishedAt: null,
            isPrivate: false,
          },
        })
          .then(() => onRefetch?.())
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
      .then(() => onRefetch?.())
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
      .then(() => onRefetch?.())
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
      .then(() => onRefetch?.())
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
                    {formatMessage(commonMessages.ui.jumpTo)} <RightOutlined />
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
            {formatMessage(programMessages.ui.apply)}
          </Button>
        ) : programStatus === 'pending' ? (
          currentUserRole === 'app-owner' ? (
            <div>
              <Button className="mr-2" onClick={() => setIsApprovalVisible(true)}>
                {formatMessage(programMessages.ui.reject)}
              </Button>
              <Button type="primary" loading={loading} onClick={() => handleUpdateProgramApproval('approved')}>
                {formatMessage(programMessages.ui.approve)}
              </Button>
            </div>
          ) : (
            <Button loading={loading} onClick={() => handleCancelProgramApproval()}>
              {formatMessage(programMessages.ui.cancel)}
            </Button>
          )
        ) : programStatus === 'rejected' ? (
          <Button onClick={() => setIsApprovalVisible(true)}>{formatMessage(programMessages.ui.reApply)}</Button>
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
        <StyledModalTitle className="mb-4">
          {formatMessage(programMessages.text.confirmPrivatelyPublishedTitle)}
        </StyledModalTitle>
        <StyledModalParagraph>
          {formatMessage(programMessages.text.confirmPrivatelyPublishedNotation)}
        </StyledModalParagraph>
      </StyledModal>

      {(programStatus === 'notYetApply' || programStatus === 'pending' || programStatus === 'rejected') && (
        <StyledModal
          visible={isApprovalVisible}
          okText={formatMessage(commonMessages.ui.send)}
          okButtonProps={{ loading }}
          cancelText={formatMessage(commonMessages.ui.back)}
          onOk={() =>
            form
              .validateFields()
              .then(() => {
                const values = form.getFieldsValue()
                programStatus === 'pending'
                  ? handleUpdateProgramApproval('rejected', values.description)
                  : handleSendApproval(values.description)
              })
              .catch(() => {})
          }
          onCancel={() => setIsApprovalVisible(false)}
        >
          <StyledModalTitle className="mb-4">
            {programStatus === 'pending'
              ? formatMessage(programMessages.label.rejectModalTitle)
              : formatMessage(programMessages.label.applyModalTitle)}
          </StyledModalTitle>

          <Form form={form} layout="vertical" colon={false} hideRequiredMark>
            <Form.Item
              label={
                programStatus === 'pending'
                  ? formatMessage(programMessages.label.rejectDescription)
                  : formatMessage(programMessages.label.applyDescription)
              }
              name="description"
              rules={[{ required: programStatus === 'pending', message: '' }]}
            >
              <TextArea />
            </Form.Item>
          </Form>
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

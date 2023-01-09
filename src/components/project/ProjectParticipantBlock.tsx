import { PlusOutlined } from '@ant-design/icons'
import { Button, Form, Input, message, Modal, Select } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import axios from 'axios'
import dayjs from 'dayjs'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import { handleError } from '../../helpers'
import { commonMessages } from '../../helpers/translation'
import { useIdentity } from '../../hooks/identity'
import { useProject } from '../../hooks/project'
import RoleAdminBlock from '../admin/RoleAdminBlock'
import { AllMemberSelector } from '../form/MemberSelector'
import projectMessages from './translation'

const StyledModalTitle = styled.div`
  color: var(--gray-darker);
  font-size: 20px;
  font-weight: bold;
  line-height: 1.3;
  letter-spacing: 0.77px;
`

const StyledTextArea = styled(Input.TextArea)`
  boarder-radius: 4px;
  resize: none;
`

type FieldProps = {
  projectRoleId: string
  participant: string // uuid | email string
  participantTypeId: string
  participantName?: string
}

type RejectFormFieldProps = {
  projectRoleId: string
  rejectedReason: string
}

const ProjectParticipantBlock: React.FC<{
  projectId: string
  publishAt: Date | null
}> = ({ projectId, publishAt }) => {
  const { id: appId } = useApp()
  const { authToken, currentMember } = useAuth()
  const { formatMessage } = useIntl()
  const [form] = useForm<FieldProps>()
  const [rejectForm] = useForm<RejectFormFieldProps>()
  const { getProjectParticipantData, insertProjectRole, updateProjectRole, deleteProjectRole, rejectProjectRole } =
    useProject()
  const { participantList, participantListRefetch } = getProjectParticipantData(projectId)
  const { getIdentity } = useIdentity()
  const { identityList } = getIdentity('Project')
  const [loading, setLoading] = useState(false)
  const [isVisible, setVisible] = useState(false)
  const [isEdit, setIsEdit] = useState(false)
  const [isRejectModalVisible, setIsRejectModalVisible] = useState(false)
  const [rejectModalLoading, setRejectModalLoading] = useState(false)
  const [isUnregistered, setIsUnregistered] = useState(false)

  const handleSubmitRejectProjectRole = (values: RejectFormFieldProps) => {
    setRejectModalLoading(true)
    form
      .validateFields()
      .then(() =>
        rejectProjectRole({
          variables: { projectRoleId: values.projectRoleId, rejectedReason: values.rejectedReason },
        }),
      )
      .then(() => {
        rejectForm.resetFields()
        setIsRejectModalVisible(false)
      })
      .then(() => participantListRefetch())
      .catch(handleError)
      .finally(() => {
        setRejectModalLoading(false)
      })
  }

  const handleCancelRejectProjectRole = () => {
    rejectForm.resetFields()
    setIsRejectModalVisible(false)
  }

  const handleDelete = (deleteId: string) => {
    window.confirm(formatMessage(projectMessages.ProjectParticipantBlock.deleteWarnText)) &&
      deleteProjectRole({ variables: { projectRoleId: deleteId } })
        .then(() => {
          participantListRefetch()
          message.success(formatMessage(commonMessages.event.successfullyDeleted))
        })
        .catch(handleError)
  }

  const handleEdit = (editId: string) => {
    participantList?.forEach(participant => {
      if (participant.projectRoleId === editId) {
        form.setFieldsValue({
          projectRoleId: participant.projectRoleId,
          participant: participant.member.id,
          participantTypeId: participant.identity.id,
        })
        setIsEdit(true)
      }
    })
    setVisible(true)
  }

  const handleSubmit = (values: FieldProps) => {
    setLoading(true)
    form.validateFields().then(() => {
      if (isUnregistered) {
        axios
          .post(
            `${process.env.REACT_APP_API_BASE_ROOT}/register-project-portfolio-participant`,
            {
              appId,
              executorName: currentMember?.name || '',
              invitee: values.participantName,
              email: values.participant,
              identityId: values.participantTypeId,
              projectId: projectId,
            },
            {
              headers: { authorization: `Bearer ${authToken}` },
            },
          )
          .then(() => {})
          .catch(handleError)
          .finally(() => {
            setLoading(false)
            setIsUnregistered(false)
          })
      } else if (isEdit) {
        updateProjectRole({
          variables: {
            id: values.projectRoleId,
            memberId: values.participant,
            identityId: values.participantTypeId,
            hasSendedMarkedNotification: publishAt ? true : false,
          },
        })
          .then(() => {
            message.success(formatMessage(commonMessages.event.successfullySaved))
            form.resetFields()
            setIsEdit(false)
            setVisible(false)
            participantListRefetch()
          })
          .catch(handleError)
          .finally(() => setLoading(false))
      } else {
        insertProjectRole({
          variables: {
            projectId: projectId,
            memberId: values.participant,
            identityId: values.participantTypeId,
            hasSendedMarkedNotification: publishAt ? true : false,
          },
        })
          .then(() => {
            message.success(formatMessage(commonMessages.event.successfullyCreated))
            form.resetFields()
            setVisible(false)
            participantListRefetch()
          })
          .catch(handleError)
          .finally(() => setLoading(false))
      }
    })
  }

  return (
    <>
      {participantList
        ?.filter(participant => participant.agreedAt !== null)
        .map(participant => (
          <RoleAdminBlock
            key={participant.projectRoleId}
            name={`${participant.member.name} / ${participant.identity.name}`}
            pictureUrl={participant.member.pictureUrl}
            onEdit={() => handleEdit(participant.projectRoleId)}
            onDelete={() => handleDelete(participant.projectRoleId)}
          />
        ))}

      {participantList
        ?.filter(participant => participant.agreedAt === null)
        .map(participant => (
          <RoleAdminBlock
            key={participant.projectRoleId}
            name={`${participant.member.name} / ${participant.identity.name}`}
            pictureUrl={participant.member.pictureUrl}
            remainingDays={formatMessage(projectMessages.ProjectParticipantBlock.remainingDays, {
              remainingDays: dayjs(participant.createdAt).add(90, 'day').diff(new Date(), 'day'),
            })}
            onDelete={() => handleDelete(participant.projectRoleId)}
          />
        ))}

      <Button type="link" icon={<PlusOutlined />} size="small" onClick={() => setVisible(true)}>
        {formatMessage(commonMessages.ui.addParticipant)}
      </Button>

      <Modal
        footer={null}
        centered
        destroyOnClose
        visible={isVisible}
        onCancel={() => {
          if (isEdit) {
            setIsEdit(false)
          }
          form.resetFields()
          setIsUnregistered(false)
          setVisible(false)
        }}
      >
        <StyledModalTitle className="mb-4">
          {formatMessage(isEdit ? commonMessages.ui.editParticipant : commonMessages.ui.addParticipant)}
        </StyledModalTitle>
        <Form form={form} layout="vertical" colon={false} hideRequiredMark onFinish={handleSubmit}>
          <Form.Item label={formatMessage(commonMessages.label.selectParticipant)} name="projectRoleId" hidden>
            <Input />
          </Form.Item>
          <Form.Item
            label={formatMessage(commonMessages.label.selectParticipant)}
            name="participant"
            rules={[
              {
                required: !isUnregistered,
                message: formatMessage(projectMessages.ProjectParticipantBlock.participantFieldRequired),
              },
            ]}
          >
            <AllMemberSelector allowClear isAllowAddUnregistered={true} setIsUnregistered={setIsUnregistered} />
          </Form.Item>
          {isUnregistered ? (
            <Form.Item
              label={formatMessage(projectMessages.ProjectParticipantBlock.participantName)}
              name="participantName"
              rules={[
                {
                  required: true,
                  message: formatMessage(projectMessages.ProjectParticipantBlock.enterParticipantNamePlease),
                },
              ]}
            >
              <Input />
            </Form.Item>
          ) : null}
          <Form.Item
            label={formatMessage(commonMessages.label.participantOccupation)}
            name="participantTypeId"
            rules={[
              {
                required: true,
                message: formatMessage(projectMessages.ProjectParticipantBlock.occupationFieldRequired),
              },
            ]}
          >
            <Select>
              {identityList?.map(identity => (
                <Select.Option key={identity.id} value={identity.id}>
                  {identity.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item className="text-right">
            <Button
              className="mr-2"
              onClick={() => {
                if (isEdit) {
                  setIsEdit(false)
                }
                form.resetFields()
                setIsUnregistered(false)
                setVisible(false)
              }}
            >
              {formatMessage(commonMessages.ui.cancel)}
            </Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              {formatMessage(isEdit ? commonMessages.ui.confirm : commonMessages.ui.add)}
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        footer={null}
        destroyOnClose
        centered
        visible={isRejectModalVisible}
        onCancel={() => handleCancelRejectProjectRole()}
      >
        <StyledModalTitle className="mb-4">
          {formatMessage(projectMessages.ProjectRejectMarkModal.rejectMark)}
        </StyledModalTitle>
        <Form
          form={rejectForm}
          layout="vertical"
          colon={false}
          hideRequiredMark
          onFinish={handleSubmitRejectProjectRole}
        >
          <Form.Item name="projectRoleId" hidden>
            <Input />
          </Form.Item>
          <Form.Item
            label={formatMessage(commonMessages.label.reason)}
            name="rejectedReason"
            rules={[
              {
                required: true,
                message: formatMessage(commonMessages.placeholder.rejectedReason),
              },
            ]}
          >
            <StyledTextArea
              rows={5}
              maxLength={230}
              placeholder={formatMessage(commonMessages.placeholder.rejectedReason)}
            />
          </Form.Item>
          <Form.Item className="text-right">
            <Button className="mr-3" onClick={() => handleCancelRejectProjectRole()}>
              {formatMessage(commonMessages.ui.cancel)}
            </Button>
            <Button type="primary" htmlType="submit" loading={rejectModalLoading}>
              {formatMessage(commonMessages.ui.confirm)}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}

export default ProjectParticipantBlock

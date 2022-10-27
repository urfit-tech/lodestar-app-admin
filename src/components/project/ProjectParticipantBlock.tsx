import { PlusOutlined } from '@ant-design/icons'
import { Button, Form, Input, message, Modal, Select } from 'antd'
import { useForm } from 'antd/lib/form/Form'
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

type FieldProps = {
  projectRoleId: string
  memberId: string
  participantTypeId: string
}

const ProjectParticipantBlock: React.FC<{
  projectId: string
}> = ({ projectId }) => {
  const { formatMessage } = useIntl()
  const [form] = useForm<FieldProps>()
  const { getProjectParticipantData, insertProjectRole, updateProjectRole, deleteProjectRole } = useProject()
  const { participantList, participantListRefetch } = getProjectParticipantData(projectId)
  const { getIdentity } = useIdentity()
  const { identityList, identityListLoading, identityListRefetch } = getIdentity('Project')
  const [loading, setLoading] = useState(false)
  const [isVisible, setVisible] = useState(false)
  const [isEdit, setIsEdit] = useState(false)

  const handleDelete = (deleteId: string) => {
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
          memberId: participant.member.id,
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
      if (isEdit) {
        updateProjectRole({
          variables: { id: values.projectRoleId, memberId: values.memberId, identityId: values.participantTypeId },
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
          variables: { projectId: projectId, memberId: values.memberId, identityId: values.participantTypeId },
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
      {participantList?.map(participant => (
        <RoleAdminBlock
          key={participant.projectRoleId}
          name={`${participant.member.name} / ${participant.identity.name}`}
          pictureUrl={participant.member.pictureUrl}
          onEdit={() => handleEdit(participant.projectRoleId)}
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
            name="memberId"
            rules={[
              {
                required: true,
                message: formatMessage(projectMessages.ProjectParticipantBlock.participantFieldRequired),
              },
            ]}
          >
            <AllMemberSelector allowClear />
          </Form.Item>
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
    </>
  )
}

export default ProjectParticipantBlock

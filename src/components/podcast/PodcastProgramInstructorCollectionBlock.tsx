import { PlusOutlined } from '@ant-design/icons'
import { gql, useMutation } from '@apollo/client'
import { Button, Form, message, Modal, Skeleton } from 'antd'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import hasura from '../../hasura'
import { handleError } from '../../helpers'
import { commonMessages } from '../../helpers/translation'
import { PodcastProgramAdminProps } from '../../types/podcast'
import RoleAdminBlock from '../admin/RoleAdminBlock'
import ContentCreatorSelector from '../form/ContentCreatorSelector'

const StyledModalTitle = styled.div`
  color: var(--gray-darker);
  font-size: 20px;
  font-weight: bold;
`

const PodcastProgramInstructorCollectionBlock: React.FC<{
  podcastProgramAdmin: PodcastProgramAdminProps | null
  onRefetch?: () => void
}> = ({ podcastProgramAdmin, onRefetch }) => {
  const { formatMessage } = useIntl()
  const [updatePodcastProgramRole] = useMutation<
    hasura.UPDATE_PODCAST_PROGRAM_ROLE,
    hasura.UPDATE_PODCAST_PROGRAM_ROLEVariables
  >(UPDATE_PODCAST_PROGRAM_ROLE)

  const [visible, setVisible] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null)

  if (!podcastProgramAdmin) {
    return <Skeleton active />
  }

  const handleSubmit = () => {
    if (!selectedMemberId) {
      return
    }

    setLoading(true)

    updatePodcastProgramRole({
      variables: {
        updatedAt: new Date(),
        podcastProgramId: podcastProgramAdmin.id,
        podcastProgramRoles: [
          ...podcastProgramAdmin.instructors.map(instructor => instructor.id),
          selectedMemberId,
        ].map(instructorId => ({
          podcast_program_id: podcastProgramAdmin.id,
          member_id: instructorId,
          name: 'instructor',
        })),
      },
    })
      .then(() => {
        message.success(formatMessage(commonMessages.event.successfullySaved))
        setVisible(false)
        setSelectedMemberId(null)
        onRefetch?.()
      })
      .catch(handleError)
      .finally(() => setLoading(false))
  }

  const handleDelete = (targetId: string) => {
    updatePodcastProgramRole({
      variables: {
        updatedAt: new Date(),
        podcastProgramId: podcastProgramAdmin.id,
        podcastProgramRoles: podcastProgramAdmin.instructors
          .filter(instructor => instructor.id !== targetId)
          .map(instructor => ({
            podcast_program_id: podcastProgramAdmin.id,
            member_id: instructor.id,
            name: 'instructor',
          })),
      },
    })
      .then(() => {
        message.success(formatMessage(commonMessages.event.successfullySaved))
        onRefetch?.()
      })
      .catch(handleError)
  }

  return (
    <>
      {podcastProgramAdmin.instructors.map(instructor => (
        <RoleAdminBlock
          key={instructor.id}
          name={instructor.name}
          pictureUrl={instructor.pictureUrl}
          onDelete={() => handleDelete(instructor.id)}
        />
      ))}

      {podcastProgramAdmin.instructors.length < 1 && (
        <Button type="link" icon={<PlusOutlined />} size="small" onClick={() => setVisible(true)}>
          {formatMessage(commonMessages.ui.addInstructor)}
        </Button>
      )}

      <Modal title={null} footer={null} centered destroyOnClose visible={visible} onCancel={() => setVisible(false)}>
        <StyledModalTitle className="mb-4">{formatMessage(commonMessages.ui.addInstructor)}</StyledModalTitle>

        <Form layout="vertical" colon={false} hideRequiredMark onFinish={handleSubmit}>
          <Form.Item label={formatMessage(commonMessages.label.selectInstructor)}>
            <ContentCreatorSelector value={selectedMemberId || ''} onChange={value => setSelectedMemberId(value)} />
          </Form.Item>

          <Form.Item className="text-right">
            <Button onClick={() => setVisible(false)} className="mr-2">
              {formatMessage(commonMessages.ui.cancel)}
            </Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              {formatMessage(commonMessages.ui.add)}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}

const UPDATE_PODCAST_PROGRAM_ROLE = gql`
  mutation UPDATE_PODCAST_PROGRAM_ROLE(
    $podcastProgramId: uuid!
    $podcastProgramRoles: [podcast_program_role_insert_input!]!
    $updatedAt: timestamptz!
  ) {
    update_podcast_program(where: { id: { _eq: $podcastProgramId } }, _set: { updated_at: $updatedAt }) {
      affected_rows
    }
    delete_podcast_program_role(where: { podcast_program_id: { _eq: $podcastProgramId } }) {
      affected_rows
    }
    insert_podcast_program_role(objects: $podcastProgramRoles) {
      affected_rows
    }
  }
`

export default PodcastProgramInstructorCollectionBlock

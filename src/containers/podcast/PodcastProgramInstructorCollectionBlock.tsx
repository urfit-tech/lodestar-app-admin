import { useMutation } from '@apollo/react-hooks'
import { Button, Form, message, Modal, Skeleton } from 'antd'
import gql from 'graphql-tag'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import RoleAdminBlock from '../../components/admin/RoleAdminBlock'
import CreatorSelector from '../../components/common/CreatorSelector'
import { handleError } from '../../helpers'
import { commonMessages } from '../../helpers/translation'
import types from '../../types'
import { PodcastProgramProps } from '../../types/podcast'

const StyledModalTitle = styled.div`
  color: var(--gray-darker);
  font-size: 20px;
  font-weight: bold;
  line-height: 1.3;
  letter-spacing: 0.77px;
`

const PodcastProgramInstructorCollectionBlock: React.FC<{
  podcastProgram: PodcastProgramProps | null
  onRefetch?: () => Promise<any>
}> = ({ podcastProgram, onRefetch }) => {
  const { formatMessage } = useIntl()
  const [updatePodcastProgramRole] = useMutation<
    types.UPDATE_PODCAST_PROGRAM_ROLE,
    types.UPDATE_PODCAST_PROGRAM_ROLEVariables
  >(UPDATE_PODCAST_PROGRAM_ROLE)

  const [visible, setVisible] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null)

  if (!podcastProgram) {
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
        podcastProgramId: podcastProgram.id,
        podcastProgramRoles: [...podcastProgram.instructors.map(instructor => instructor.id), selectedMemberId].map(
          instructorId => ({
            podcast_program_id: podcastProgram.id,
            member_id: instructorId,
            name: 'instructor',
          }),
        ),
      },
    })
      .then(() => {
        onRefetch &&
          onRefetch().then(() => {
            setSelectedMemberId(null)
            setVisible(false)
            message.success(formatMessage(commonMessages.event.successfullySaved))
          })
      })
      .catch(error => handleError(error))
      .finally(() => setLoading(false))
  }

  const handleDelete = (targetId: string) => {
    updatePodcastProgramRole({
      variables: {
        updatedAt: new Date(),
        podcastProgramId: podcastProgram.id,
        podcastProgramRoles: podcastProgram.instructors
          .filter(instructor => instructor.id !== targetId)
          .map(instructor => ({
            podcast_program_id: podcastProgram.id,
            member_id: instructor.id,
            name: 'instructor',
          })),
      },
    })
      .then(() => {
        onRefetch && onRefetch()
        message.success(formatMessage(commonMessages.event.successfullySaved))
      })
      .catch(error => handleError(error))
  }

  return (
    <>
      {podcastProgram.instructors.map(instructor => (
        <RoleAdminBlock
          key={instructor.id}
          name={instructor.name}
          pictureUrl={instructor.pictureUrl}
          onDelete={() => handleDelete(instructor.id)}
        />
      ))}

      {podcastProgram.instructors.length < 1 && (
        <Button type="link" icon="plus" size="small" onClick={() => setVisible(true)}>
          {formatMessage(commonMessages.ui.addInstructor)}
        </Button>
      )}

      <Modal title={null} footer={null} centered destroyOnClose visible={visible} onCancel={() => setVisible(false)}>
        <StyledModalTitle>{formatMessage(commonMessages.ui.addInstructor)}</StyledModalTitle>

        <Form
          hideRequiredMark
          colon={false}
          onSubmit={e => {
            e.preventDefault()
            handleSubmit()
          }}
        >
          <Form.Item label={formatMessage(commonMessages.label.selectInstructor)}>
            <CreatorSelector value={selectedMemberId || ''} onChange={value => setSelectedMemberId(value)} />
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

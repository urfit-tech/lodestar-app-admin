import { gql, useMutation } from '@apollo/client'
import { Button, Form, message, Modal, Skeleton } from 'antd'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import hasura from '../../hasura'
import { handleError } from '../../helpers'
import { commonMessages } from '../../helpers/translation'
import { usePublicMember } from '../../hooks/member'
import { ActivityProps } from '../../types/activity'
import RoleAdminBlock from '../admin/RoleAdminBlock'
import ContentCreatorSelector from '../form/ContentCreatorSelector'

const StyledModalTitle = styled.div`
  color: var(--gray-darker);
  font-size: 20px;
  font-weight: bold;
`

const UpdateActivityOrganizer = gql`
  mutation UpdateActivityOrganizer($activityId: uuid!, $organizerId: String!, $updatedAt: timestamptz!) {
    update_activity(where: { id: { _eq: $activityId } }, _set: { organizer_id: $organizerId, updated_at: $updatedAt }) {
      affected_rows
    }
  }
`

const ActivityOrganizerCollectionBlock: React.FC<{
  activity: ActivityProps | null
  onRefetch?: () => void
}> = ({ activity, onRefetch }) => {
  const { formatMessage } = useIntl()
  const { member } = usePublicMember(activity?.organizerId || '')
  const [updateActivityOrganizer] = useMutation<
    hasura.UpdateActivityOrganizer,
    hasura.UpdateActivityOrganizerVariables
  >(UpdateActivityOrganizer)

  const [visible, setVisible] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null)

  if (!activity) {
    return <Skeleton active />
  }

  const handleSubmit = () => {
    if (!selectedMemberId) {
      return
    }

    setLoading(true)

    updateActivityOrganizer({
      variables: {
        activityId: activity.id,
        organizerId: selectedMemberId,
        updatedAt: new Date(),
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

  return (
    <>
      <RoleAdminBlock name={member.name} pictureUrl={member.pictureUrl} onEdit={() => setVisible(true)} />

      <Modal
        title={null}
        footer={null}
        centered
        destroyOnClose
        visible={visible}
        onCancel={() => {
          setVisible(false)
          setSelectedMemberId('')
        }}
      >
        <StyledModalTitle className="mb-4">{formatMessage(commonMessages.ui.edit)}</StyledModalTitle>

        <Form layout="vertical" colon={false} hideRequiredMark onFinish={handleSubmit}>
          <Form.Item label={formatMessage(commonMessages.label.selectOrganizer)}>
            <ContentCreatorSelector
              value={selectedMemberId || member.id}
              onChange={value => setSelectedMemberId(value)}
              allowedPermissions={['ACTIVITY_NORMAL']}
            />
          </Form.Item>

          <Form.Item className="text-right">
            <Button
              onClick={() => {
                setVisible(false)
                setSelectedMemberId('')
              }}
              className="mr-2"
            >
              {formatMessage(commonMessages.ui.cancel)}
            </Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              {formatMessage(commonMessages.ui.save)}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}

export default ActivityOrganizerCollectionBlock

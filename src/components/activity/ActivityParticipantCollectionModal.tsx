import { useQuery } from '@apollo/react-hooks'
import { Button, Tabs } from 'antd'
import gql from 'graphql-tag'
import { groupBy } from 'ramda'
import React from 'react'
import { defineMessages, useIntl } from 'react-intl'
import styled from 'styled-components'
import { useApp } from '../../contexts/AppContext'
import { downloadCSV, toCSV } from '../../helpers'
import { commonMessages } from '../../helpers/translation'
import types from '../../types'
import AdminModal, { AdminModalProps } from '../admin/AdminModal'

const StyledTitle = styled.div`
  color: var(--gray-darker);
  font-size: 20px;
  font-weight: bold;
  line-height: 1.3;
  letter-spacing: 0.77px;
`
const StyledBlock = styled.div`
  overflow-x: auto;
`
const StyledTable = styled.div`
  display: table;
  border-collapse: collapse;
  width: 100%;
  white-space: nowrap;
`
const StyledRow = styled.div`
  display: table-row;

  &:first-child {
    font-weight: bold;
  }
`
const StyledCell = styled.div`
  display: table-cell;
  padding: 0.75rem 1.25rem;
  color: var(--gray-darker);
  font-size: 14px;
  letter-spacing: 0.4px;

  &:first-child {
    padding-left: 0;
  }
  &:last-child {
    padding-right: 0;
  }
`

const messages = defineMessages({
  participantsList: { id: 'activity.ui.participantsList', defaultMessage: '參與名單' },
  downloadList: { id: 'activity.ui.downloadList', defaultMessage: '下載名單' },
  ticketType: { id: 'activity.label.ticketType', defaultMessage: '票種' },
  attended: { id: 'activity.label.attended', defaultMessage: '簽到' },
})

const ActivityParticipantCollectionModal: React.FC<
  AdminModalProps & {
    activityId: string
  }
> = ({ activityId, ...props }) => {
  const { formatMessage } = useIntl()
  const { enabledModules } = useApp()
  const { sessions } = useActivitySessionParticipants(activityId)

  return (
    <AdminModal
      renderTrigger={({ setVisible }) => (
        <Button type="link" size="small" onClick={() => setVisible(true)}>
          {formatMessage(messages.participantsList)}
        </Button>
      )}
      title={null}
      footer={null}
      width="41.25rem"
      {...props}
    >
      <StyledTitle className="mb-3">{formatMessage(messages.participantsList)}</StyledTitle>

      <Tabs>
        {sessions.map(session => {
          return (
            <Tabs.TabPane key={session.id} tab={`${session.title} (${session.participants.length})`}>
              <Button
                type="primary"
                className={`my-4 ${session.participants.length ? '' : 'd-none'}`}
                onClick={() => {
                  const data: string[][] = [
                    [
                      '',
                      formatMessage(commonMessages.label.name),
                      formatMessage(messages.ticketType),
                      formatMessage(messages.attended),
                      formatMessage(commonMessages.label.phone),
                      formatMessage(commonMessages.label.email),
                      formatMessage(commonMessages.label.orderLogId),
                    ],
                  ]
                  session.participants.forEach((participant, index) => {
                    data.push([
                      `${index + 1}`.padStart(2, '0'),
                      participant.name,
                      participant.activityTitle,
                      participant.attended ? 'v' : '',
                      participant.phone,
                      participant.email,
                      participant.orderLogId,
                    ])
                  })
                  downloadCSV(`${session.title}.csv`, toCSV(data))
                }}
              >
                {formatMessage(messages.downloadList)}
              </Button>
              <StyledBlock>
                <StyledTable>
                  <StyledRow>
                    <StyledCell></StyledCell>
                    <StyledCell>{formatMessage(commonMessages.label.name)}</StyledCell>
                    <StyledCell>{formatMessage(messages.ticketType)}</StyledCell>
                    {enabledModules.qrcode && <StyledCell>{formatMessage(messages.attended)}</StyledCell>}
                    <StyledCell>{formatMessage(commonMessages.label.phone)}</StyledCell>
                    <StyledCell>{formatMessage(commonMessages.label.email)}</StyledCell>
                  </StyledRow>

                  {session.participants.map((participant, index) => (
                    <StyledRow key={participant.id}>
                      <StyledCell>{`${index + 1}`.padStart(2, '0')}</StyledCell>
                      <StyledCell>{participant.name}</StyledCell>
                      <StyledCell>{participant.activityTitle}</StyledCell>
                      {enabledModules.qrcode && (
                        <StyledCell className="text-center">{participant.attended && 'v'}</StyledCell>
                      )}
                      <StyledCell>{participant.phone}</StyledCell>
                      <StyledCell>{participant.email}</StyledCell>
                    </StyledRow>
                  ))}
                </StyledTable>
              </StyledBlock>
            </Tabs.TabPane>
          )
        })}
      </Tabs>
    </AdminModal>
  )
}

const useActivitySessionParticipants = (activityId: string) => {
  const { loading, error, data, refetch } = useQuery<
    types.GET_ACTIVITY_PARTICIPANTS,
    types.GET_ACTIVITY_PARTICIPANTSVariables
  >(
    gql`
      query GET_ACTIVITY_PARTICIPANTS($activityId: uuid!) {
        activity_enrollment(where: { activity_id: { _eq: $activityId } }, order_by: {}) {
          activity_session_id
          order_log_id
          member_id
          member_name
          member_email
          member_phone
          order_log_id
          attended
          activity_ticket {
            id
            title
          }
        }
        activity_session(where: { activity_id: { _eq: $activityId } }, order_by: { started_at: asc }) {
          id
          title
          started_at
        }
      }
    `,
    { variables: { activityId } },
  )

  const sessions: {
    id: string
    title: string
    participants: {
      id: string
      name: string
      phone: string
      email: string
      orderLogId: string
      attended?: boolean
      activityTitle: string
    }[]
  }[] =
    loading || error || !data || !data.activity_enrollment
      ? []
      : (() => {
          const sessionParticipants = groupBy(enrollment => enrollment.activity_session_id, data.activity_enrollment)

          return data.activity_session.map(session => ({
            id: session.id,
            title: session.title,
            participants: sessionParticipants[session.id]
              ? sessionParticipants[session.id].map(participant => ({
                  id: participant.member_id || '',
                  name: participant.member_name || '',
                  phone: participant.member_phone || '',
                  email: participant.member_email || '',
                  orderLogId: participant.order_log_id || '',
                  attended: participant.attended || false,
                  activityTitle: participant.activity_ticket?.title || '',
                }))
              : [],
          }))
        })()

  return {
    loadingSessions: loading,
    errorSessions: error,
    sessions,
    refetchSessions: refetch,
  }
}

export default ActivityParticipantCollectionModal

import { Button, Skeleton, Tabs } from 'antd'
import axios from 'axios'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import React, { useCallback, useEffect, useState } from 'react'
import { defineMessages, useIntl } from 'react-intl'
import styled from 'styled-components'
import * as yup from 'yup'
import { downloadCSV, toCSV } from '../../helpers'
import { commonMessages } from '../../helpers/translation'
import { ActivitySessionParticipantResDto, ActivitySessionParticipantsDTO } from '../../types/activity'
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
      <ActivityParticipantCollectionTabs activityId={activityId} />
    </AdminModal>
  )
}

const ActivityParticipantCollectionTabs: React.VFC<{ activityId: string }> = ({ activityId }) => {
  const { formatMessage } = useIntl()
  const { enabledModules } = useApp()
  const { sessions, loadingSessions } = useActivitySessionParticipants(activityId)

  if (loadingSessions) return <Skeleton active />
  return (
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
                    formatMessage(commonMessages.label.memberName),
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
                    participant.activityTicketTitle,
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
                    <StyledCell>{participant.activityTicketTitle}</StyledCell>
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
  )
}

const rawActivitySessionResDataSchema = yup.array().of(
  yup.object({
    id: yup.string().required(),
    title: yup.string().nullable(),
    participants: yup.array().of(
      yup.object({
        id: yup.string().required(),
        name: yup.string().nullable(),
        phone: yup.string().nullable(),
        email: yup.string().nullable(),
        orderLogId: yup.string().required(),
        attended: yup.boolean().nullable(), // If the value is null, it indicates non-attendance
        activityTicketTitle: yup.string().nullable(),
      }),
    ),
  }),
)

const useActivitySessionParticipants = (activityId: string) => {
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [sessions, setSessions] = useState<ActivitySessionParticipantsDTO[]>([])
  const { authToken } = useAuth()

  const fetchActivitySessionParticipants = useCallback(
    async (activityId: string) => {
      if (authToken && activityId) {
        try {
          setLoading(true)
          const response = await axios.get(
            `${process.env.REACT_APP_LODESTAR_SERVER_ENDPOINT}/activity/${activityId}/participants`,
            {
              headers: {
                Authorization: `Bearer ${authToken}`,
              },
            },
          )
          const { activitySessions: data } = response.data

          try {
            await rawActivitySessionResDataSchema.validate(data)
          } catch (error) {
            const errorMessage = (error as Error).message || 'An unknown error occurred'
            console.error(activityId, errorMessage)
            setError(errorMessage)
            return
          }

          const mapApiDataToDto = (data: ActivitySessionParticipantResDto[]): ActivitySessionParticipantsDTO[] => {
            const idCounts: { [key: string]: number } = {}
            return data.map(sessionData => ({
              id: sessionData.id,
              title: sessionData.title ?? '',
              participants: sessionData.participants.map(participantData => {
                const originalId = participantData.id
                let uniqueId = originalId
                if (idCounts[originalId]) {
                  idCounts[originalId]++
                  uniqueId = `${originalId}-${idCounts[originalId]}`
                } else {
                  idCounts[originalId] = 1
                }
                return {
                  id: uniqueId,
                  name: participantData.name ?? '',
                  phone: participantData.phone ?? '',
                  email: participantData.email ?? '',
                  orderLogId: participantData.orderLogId,
                  attended: participantData.attended,
                  activityTicketTitle: participantData.activityTicketTitle ?? '',
                }
              }),
            }))
          }

          setSessions(mapApiDataToDto(data))
        } catch (error) {
          const errorMessage = (error as Error).message || 'An unknown error occurred'
          setError(errorMessage)
        } finally {
          setLoading(false)
        }
      }
    },
    [authToken],
  )

  useEffect(() => {
    fetchActivitySessionParticipants(activityId)
  }, [activityId, fetchActivitySessionParticipants])

  return {
    loadingSessions: loading,
    errorSessions: error,
    sessions,
    refetchSessions: () => fetchActivitySessionParticipants(activityId),
  }
}

export default ActivityParticipantCollectionModal

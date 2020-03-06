import { Button, Modal, Tabs } from 'antd'
import React, { useState } from 'react'
import { defineMessages, useIntl } from 'react-intl'
import styled from 'styled-components'
import { downloadCSV, toCSV } from '../../helpers'
import { commonMessages } from '../../helpers/translation'

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
  padding: 0.75rem 0.5rem;
`

const messages = defineMessages({
  participantsList: { id: 'activity.ui.participantsList', defaultMessage: '參與名單' },
  downloadList: { id: 'activity.ui.downloadList', defaultMessage: '下載名單' },
  ticketType: { id: 'activity.label.ticketType', defaultMessage: '票種' },
  attended: { id: 'activity.label.attended', defaultMessage: '簽到' },
})

export type ActivitySessionParticipantProps = {
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
}

const ActivityParticipantCollectionModal: React.FC<{
  sessions: ActivitySessionParticipantProps[]
}> = ({ sessions }) => {
  const [visible, setVisible] = useState(false)
  const { formatMessage } = useIntl()

  return (
    <>
      <Button type="link" size="small" onClick={() => setVisible(true)}>
        {formatMessage(messages.participantsList)}
      </Button>

      <Modal title={null} footer={null} onCancel={() => setVisible(false)} visible={visible}>
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
                      <StyledCell>{formatMessage(messages.attended)}</StyledCell>
                      <StyledCell>{formatMessage(commonMessages.label.phone)}</StyledCell>
                      <StyledCell>{formatMessage(commonMessages.label.email)}</StyledCell>
                    </StyledRow>

                    {session.participants.map((participant, index) => (
                      <StyledRow key={participant.id}>
                        <StyledCell>{`${index + 1}`.padStart(2, '0')}</StyledCell>
                        <StyledCell>{participant.name}</StyledCell>
                        <StyledCell>{participant.activityTitle}</StyledCell>
                        <StyledCell className="text-center">{participant.attended && 'v'}</StyledCell>
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
      </Modal>
    </>
  )
}

export default ActivityParticipantCollectionModal

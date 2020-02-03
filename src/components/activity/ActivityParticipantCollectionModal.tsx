import { Button, Modal, Tabs } from 'antd'
import React, { useState } from 'react'
import { defineMessages, useIntl } from 'react-intl'
import styled from 'styled-components'

const StyledTitle = styled.div`
  color: var(--gray-darker);
  font-size: 20px;
  font-weight: bold;
  line-height: 1.3;
  letter-spacing: 0.77px;
`
const StyledTable = styled.div`
  display: table;
  border-collapse: collapse;
  width: 100%;
`
const StyledRow = styled.div`
  display: table-row;
`
const StyledCell = styled.div`
  display: table-cell;
  padding: 0.75rem 0;
`

const messages = defineMessages({
  participantsList: { id: 'activity.ui.participantsList', defaultMessage: '參與名單' },
  downloadList: { id: 'activity.ui.downloadList', defaultMessage: '下載名單' },
})

export type ActivitySessionParticipantProps = {
  id: string
  title: string
  participants: {
    id: string
    name: string
    phone: string
    email: string
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
            const csvContent =
              'data:text/csv;charset=utf-8,' +
              'Name,Phone,Email\n' +
              session.participants
                .map(participant => `${participant.name},${participant.phone},"${participant.email}"`)
                .join('\n')

            return (
              <Tabs.TabPane key={session.id} tab={`${session.title} (${session.participants.length})`}>
                <Button
                  type="primary"
                  className={`my-4 ${session.participants.length ? '' : 'd-none'}`}
                  onClick={() => {
                    const downloadLink = document.createElement('a')
                    downloadLink.setAttribute('href', encodeURI(csvContent))
                    downloadLink.setAttribute('download', `${session.title}.csv`)
                    document.body.appendChild(downloadLink)
                    downloadLink.click()
                    document.body.removeChild(downloadLink)
                  }}
                >
                  {formatMessage(messages.downloadList)}
                </Button>

                <StyledTable>
                  {session.participants.map((participant, index) => (
                    <StyledRow key={participant.id}>
                      <StyledCell>{(index + 1).toString().padStart(2, '0')}</StyledCell>
                      <StyledCell>{participant.name}</StyledCell>
                      <StyledCell>{participant.phone}</StyledCell>
                      <StyledCell>{participant.email}</StyledCell>
                    </StyledRow>
                  ))}
                </StyledTable>
              </Tabs.TabPane>
            )
          })}
        </Tabs>
      </Modal>
    </>
  )
}

export default ActivityParticipantCollectionModal

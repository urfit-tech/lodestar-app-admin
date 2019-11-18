import { Button, Modal, Tabs } from 'antd'
import React, { useState } from 'react'
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

  return (
    <>
      <Button type="link" size="small" onClick={() => setVisible(true)}>
        參與名單
      </Button>

      <Modal title={null} footer={null} onCancel={() => setVisible(false)} visible={visible}>
        <StyledTitle className="mb-3">參與名單</StyledTitle>

        <Tabs>
          {sessions.map(session => {
            const csvContent =
              'data:text/csv;charset=utf-8;' +
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
                    const downloadlink = document.createElement('a')
                    downloadlink.setAttribute('href', encodeURI(csvContent))
                    downloadlink.setAttribute('download', `${session.title}.csv`)
                    document.body.appendChild(downloadlink)
                    downloadlink.click()
                    document.body.removeChild(downloadlink)
                  }}
                >
                  下載名單
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

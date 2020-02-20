import { Button, Modal, Tabs } from 'antd'
import React, { useState } from 'react'
import styled from 'styled-components'
import { downloadCSV, toCSV } from '../../helpers'

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
    orderLogId: string
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
            const data: string[][] = [['Name', 'Phone', 'Email', 'Order ID']]
            session.participants.forEach(participant => {
              data.push([participant.name, participant.phone, participant.email, participant.orderLogId])
            })

            return (
              <Tabs.TabPane key={session.id} tab={`${session.title} (${session.participants.length})`}>
                <Button
                  type="primary"
                  className={`my-4 ${session.participants.length ? '' : 'd-none'}`}
                  onClick={() => {
                    downloadCSV(`${session.title}.csv`, toCSV(data))
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

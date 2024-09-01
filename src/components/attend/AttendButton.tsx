import { Button, message } from 'antd'
import moment from 'moment'
import React from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import { handleError } from '../../helpers'
import { useAttend, useGetAttend } from '../../hooks/attend'
import attendMessages from './translation'

const NavbarClockButton = styled(Button)`
  @media screen and (max-width: 480px) {
    padding: 5px 10px;
    margin: 0px 0px;
    font-size: 15px;
  }
`

const AttendButton: React.FC<{ memberId: string }> = ({ memberId }) => {
  const { attend, refetchAttend } = useGetAttend(memberId)
  const { insertAttend, updateAttend } = useAttend()
  const { formatMessage } = useIntl()
  return (
    <NavbarClockButton
      className="mr-3"
      type="primary"
      onClick={
        attend.length !== 0
          ? async () => {
              await updateAttend({
                variables: { memberId: memberId, endedAt: moment().format() },
              })
                .then(() => {
                  refetchAttend()
                  message.success(formatMessage(attendMessages.AttendButton.clockOutSuccessfully))
                })
                .catch(handleError)
                .finally(() => {})
            }
          : async () => {
              await insertAttend({ variables: { memberId: memberId } })
                .then(() => {
                  refetchAttend()
                  message.success(formatMessage(attendMessages.AttendButton.clockInSuccessfully))
                })
                .catch(handleError)
                .finally(() => {})
            }
      }
      style={{
        backgroundColor: attend.length !== 0 ? '#1890ff' : '#52c41a',
        borderColor: attend.length !== 0 ? '#1890ff' : '#52c41a',
      }}
    >
      {attend.length !== 0
        ? formatMessage(attendMessages.AttendButton.clockOut)
        : formatMessage(attendMessages.AttendButton.clockIn)}
    </NavbarClockButton>
  )
}
export default AttendButton

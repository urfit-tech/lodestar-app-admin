import { Button, message } from 'antd'
import moment from 'moment'
import React from 'react'
import { handleError } from '../../helpers'
import { useAttend, useGetAttend } from '../../hooks/attend'

const AttendButton: React.FC<{ memberId: string }> = ({ memberId }) => {
  const { attend, refetchAttend } = useGetAttend(memberId)
  const { insertAttend, updateAttend } = useAttend()

  return (
    <Button
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
                  message.success('下班打卡成功，努力～')
                })
                .catch(handleError)
                .finally(() => {})
            }
          : async () => {
              await insertAttend({ variables: { memberId: memberId } })
                .then(() => {
                  refetchAttend()
                  message.success('上班打卡成功，努力～')
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
      {attend.length !== 0 ? '下班打卡' : '上班打卡'}
    </Button>
  )
}
export default AttendButton

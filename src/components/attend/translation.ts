import { defineMessages } from 'react-intl'

const attendMessages = {
  AttendButton: defineMessages({
    clockOut: { id: 'attendMessages.AttendButton.clockOut', defaultMessage: '下班打卡' },
    clockIn: { id: 'attendMessages.AttendButton.clockIn', defaultMessage: '上班打卡' },
    clockOutSuccessfully: { id: 'attendMessages.AttendButton.clockOutSuccessfully', defaultMessage: '上班打卡成功' },
    clockInSuccessfully: { id: 'attendMessages.AttendButton.clockInSuccessfully', defaultMessage: '下班打卡成功' },
  }),
}
export default attendMessages

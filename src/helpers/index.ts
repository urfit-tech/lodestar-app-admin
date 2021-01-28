import { message } from 'antd'
import axios from 'axios'

export const call = async ({ appId, apiHost, authToken, phone, salesTelephone }: {
  appId: string,
  apiHost: string,
  authToken: string | null,
  phone: string,
  salesTelephone: string
}) => {
  if (!window.confirm(`撥打號碼：${phone}`)) {
    return
  }

  axios
    .post(
      `//${apiHost}/call`,
      {
        appId,
        callFrom: salesTelephone,
        callTo: phone,
      },
      {
        headers: { authorization: `Bearer ${authToken}` },
      },
    )
    .then(({ data: { code } }) => {
      if (code === 'SUCCESS') {
        message.success('話機連結成功')
      } else {
        message.error('電話錯誤')
      }
    })
    .catch(error => {
      process.env.NODE_ENV === 'development' && console.error(error)
      message.error('連線異常，請再嘗試')
    })
}
import { message } from 'antd'
import { RcFile } from 'antd/lib/upload'
import axios, { AxiosRequestConfig } from 'axios'
import moment from 'moment'
import queryString from 'query-string'
import { css, FlattenSimpleInterpolation } from 'styled-components'
import { BREAK_POINT } from '../components/common/Responsive'

export const TPDirect = (window as any)['TPDirect']

export const getBase64 = (img: File, callback: (result: FileReader['result']) => void) => {
  const reader = new FileReader()
  reader.addEventListener('load', () => callback(reader.result))
  reader.readAsDataURL(img)
}

export const validateImage = (file: RcFile, fileSize?: number) => {
  const isImage = file.type.startsWith('image')
  if (!isImage) {
    message.error('請上傳圖片格式')
  }
  const size = fileSize || 2 * 1024 * 1024
  const inSize = file.size < size
  if (!inSize) {
    message.error(`圖片大小請小於 ${(size / 1024 / 1024).toFixed(0)}MB`)
  }
  return isImage && inSize
}

export const uploadFile = async (key: string, file: Blob, authToken: string | null, config?: AxiosRequestConfig) =>
  await axios
    .post(
      `${process.env.REACT_APP_BACKEND_ENDPOINT}/sys/sign-url`,
      {
        operation: 'putObject',
        params: {
          Key: key,
          ContentType: file.type,
        },
      },
      {
        headers: { authorization: `Bearer ${authToken}` },
      },
    )
    .then(res => res.data.result)
    .then(url => {
      const { query } = queryString.parseUrl(url)
      return axios.put<{ status: number; data: string }>(url, file, {
        ...config,
        headers: {
          ...query,
          'Content-Type': file.type,
        },
      })
    })

export const getFileDownloadableLink = async (key: string, authToken: string | null) => {
  const { data } = await axios.post(
    `${process.env.REACT_APP_BACKEND_ENDPOINT}/sys/sign-url`,
    {
      operation: 'getObject',
      params: {
        Key: key,
      },
    },
    {
      headers: { authorization: `Bearer ${authToken}` },
    },
  )
  return data.result
}

export const commaFormatter = (value?: number | string | null) =>
  value !== null && value !== undefined && `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')

export const currencyFormatter = (value?: number | string | null) =>
  value !== null && value !== undefined && `NT$ ${value < 0 ? 0 : value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')

export const dateFormatter = (value: Date, format?: string) => moment(value).format(format || `YYYY/MM/DD HH:mm`)

export const dateRangeFormatter: (props: {
  startedAt: Date
  endedAt: Date
  dateFormat?: string
  timeFormat?: string
}) => string = ({ startedAt, endedAt, dateFormat = 'YYYY/MM/DD', timeFormat = 'HH:mm' }) => {
  const startedMoment = moment(startedAt)
  const endedMoment = moment(endedAt)
  const isInSameDay = startedMoment.format('YYYYMMDD') === endedMoment.format('YYYYMMDD')

  return 'STARTED_DATE STARTED_TIME ~ ENDED_DATE ENDED_TIME'
    .replace('STARTED_DATE', startedMoment.format(dateFormat))
    .replace('STARTED_TIME', startedMoment.format(timeFormat))
    .replace('ENDED_DATE', isInSameDay ? '' : endedMoment.format(dateFormat))
    .replace('ENDED_TIME', endedMoment.format(timeFormat))
    .replace(/  +/g, ' ')
}

export const durationFormatter = (seconds: number) => {
  return `MINUTES:SECONDS`
    .replace('MINUTES', `${Math.floor(seconds / 60)}`.padStart(2, '0'))
    .replace('SECONDS', `${Math.floor(seconds % 60)}`.padStart(2, '0'))
}

export const rgba = (hexColor: string, alpha: number) => {
  hexColor = hexColor.replace('#', '')
  const r = parseInt(hexColor.slice(0, 2), 16)
  const g = parseInt(hexColor.slice(2, 4), 16)
  const b = parseInt(hexColor.slice(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

export const snakeToCamel = (snakeValue: string) =>
  snakeValue.replace(/([-_][a-z])/g, group => group.toUpperCase().replace('-', '').replace('_', ''))

export const handleError = (error: any) => {
  process.env.NODE_ENV === 'development' && console.error(error)
  if (error.response && error.response.data) {
    return message.error(error.response.data.message)
  }
  return message.error(error.message)
}

export const getUserRoleLevel = (userRole: string) => {
  switch (userRole) {
    case 'anonymous':
      return 0
    case 'general-member':
      return 1
    case 'content-creator':
      return 2
    case 'app-owner':
      return 3
    default:
      return -1
  }
}

export const notEmpty = <T>(value: T | null | undefined): value is T => {
  return value !== null && value !== undefined
}

export const toCSV: (data: string[][]) => string = data => {
  const columns = data.shift()

  if (!columns) {
    return ''
  }

  return `data:text/csv;charset=utf-8,${columns.map(column => `"${column}"`).join(',')}\n${data
    .map(row => row.map(col => `"${col}"`).join(','))
    .join('\n')}`
}

export const downloadCSV = (fileName: string, data: string) => {
  const downloadLink = document.createElement('a')
  downloadLink.setAttribute('href', encodeURI(data))
  downloadLink.setAttribute('download', fileName)
  document.body.appendChild(downloadLink)
  downloadLink.click()
  document.body.removeChild(downloadLink)
}

export const desktopViewMixin = (children: FlattenSimpleInterpolation) => css`
  @media (min-width: ${BREAK_POINT}px) {
    ${children}
  }
`

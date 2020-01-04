import { message } from 'antd'
import { RcFile } from 'antd/lib/upload'
import axios, { AxiosRequestConfig } from 'axios'
import moment from 'moment'
import queryString from 'query-string'
import { PeriodType } from '../schemas/common'
import { ProductType } from '../schemas/general'
import { ProgramRoleName } from '../schemas/program'

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

export const uploadFile = async (key: string, file: File | null, config?: AxiosRequestConfig, isPublic?: boolean) =>
  file &&
  axios
    .post(`${process.env.REACT_APP_BACKEND_ENDPOINT}/signUrl`, {
      isPublic,
      operation: 'putObject',
      params: {
        Key: key,
        ContentType: file.type,
        Expires: 86400,
      },
    })
    .then(res => res.data.signedUrl)
    .then(url => {
      const { query } = queryString.parseUrl(url)
      return axios.put<{ status: number; data: string }>(url, file, {
        ...config,
        headers: query,
      })
    })

export const getPeriodTypeLabel = (periodType: PeriodType | string) => {
  switch (periodType) {
    case 'W':
      return '每週'
    case 'M':
      return '每月'
    case 'Y':
      return '每年'
    default:
      return '未知週期'
  }
}

export const getCustomizedPeriodTypeLabel = (periodType: PeriodType | string) => {
  switch (periodType) {
    case 'D':
      return '天'
    case 'W':
      return '週'
    case 'M':
      return '個月'
    case 'Y':
      return '年'
    default:
      return '未知週期'
  }
}

export const getShortenPeriodTypeLabel = (periodType: PeriodType | string) => {
  switch (periodType) {
    case 'W':
      return '週'
    case 'M':
      return '月'
    case 'Y':
      return '年'
    default:
      return '未知週期'
  }
}

export const commaFormatter = (value?: number | string | null) =>
  value !== null && value !== undefined && `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')

export const currencyFormatter = (value?: number | string | null) =>
  value !== null && value !== undefined && `NT$ ${value < 0 ? 0 : value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')

export const dateFormatter = (value: Date, format?: string) => moment(value).format(format || `YYYY/MM/DD HH:mm`)

export const dateRangeFormatter = (startedAt: Date, endedAt: Date, timeFormat?: string) => {
  const fullTimeFormat = timeFormat || 'YYYY-MM-DD(dd) HH:mm'
  const shortTimeFormat = 'HH:mm'
  const startedDate = moment(startedAt).format('YYYYMMDD')
  const endedDate = moment(endedAt).format('YYYYMMDD')

  return (
    moment(startedAt).format(fullTimeFormat) +
    ' ~ ' +
    moment(endedAt).format(startedDate === endedDate ? shortTimeFormat : fullTimeFormat)
  )
}

export const productTypeFormatter = (value: ProductType) => {
  switch (value) {
    case 'Program':
    case 'ProgramPlan':
    case 'ProgramContent':
      return '課程'
    case 'ProgramPackagePlan':
      return '課程組合'
    case 'ProjectPlan':
      return '專案方案'
    case 'Card':
      return '會員卡'
    case 'ActivityTicket':
      return '活動'
    case 'Merchandise':
      return '商品'
    default:
      return '未知類別'
  }
}

export const programRoleFormatter = (value: ProgramRoleName) => {
  switch (value) {
    case 'owner':
      return '課程擁有者'
    case 'instructor':
      return '講師'
    case 'assistant':
      return '助教'
    default:
      return '未知角色'
  }
}

export const durationFormatter = (value?: number | null) => {
  return value && `約 ${(value / 60).toFixed(0)} 分鐘`
}

export const braftLanguageFn = (languages: { [lan: string]: any }, context: any) => {
  if (context === 'braft-editor') {
    languages['zh-hant'].controls.normal = '內文'
    return languages['zh-hant']
  }
}

export const getNotificationIconType = (type: string) => {
  switch (type) {
    case 'message':
      return 'message'
    case 'payment':
      return 'dollar'
    case 'content':
      return 'book'
    case 'reaction':
      return 'heart'
    default:
      return 'question'
  }
}

export const rgba = (hexColor: string, alpha: number) => {
  hexColor = hexColor.replace('#', '')
  const r = parseInt(hexColor.slice(0, 2), 16)
  const g = parseInt(hexColor.slice(2, 4), 16)
  const b = parseInt(hexColor.slice(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

export const snakeToCamel = (snakeValue: string) =>
  snakeValue.replace(/([-_][a-z])/g, group =>
    group
      .toUpperCase()
      .replace('-', '')
      .replace('_', ''),
  )

export const handleError = (error: any) => {
  process.env.NODE_ENV === 'development' && console.error(error)
  if (error.response && error.response.data) {
    return message.error(error.response.data.message)
  }
  return message.error(error.message)
}

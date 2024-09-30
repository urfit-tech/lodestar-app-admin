import { message } from 'antd'
import { RcFile } from 'antd/lib/upload'
import axios, { AxiosError, AxiosRequestConfig } from 'axios'
import moment, { Moment } from 'moment'
import queryString from 'query-string'
import { css, FlattenSimpleInterpolation } from 'styled-components'
import { BREAK_POINT } from '../components/common/Responsive'
import { useIntl } from 'react-intl'
import { errorMessages } from './translation'
import { salesMessages } from './translation'
import { memberMessages } from './translation'

export const TPDirect = (window as any)['TPDirect']

export const convertFileToArrayBuffer = (file: File): Promise<ArrayBuffer> => {
  return new Promise((resolve, reject) => {
    let reader = new FileReader()
    reader.addEventListener('loadend', e => {
      if (e.target && e.target.result) {
        resolve(e.target.result as ArrayBuffer)
      } else {
        reject(new Error('convert file to array buffer failed'))
      }
    })
    reader.addEventListener('error', reject)
    reader.readAsArrayBuffer(file)
  })
}

export const getBase64 = (img: File, callback: (result: FileReader['result']) => void) => {
  const reader = new FileReader()
  reader.addEventListener('load', () => callback(reader.result))
  reader.readAsDataURL(img)
}

export const validateImage = (file: RcFile, fileSize?: number) => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { formatMessage } = useIntl()
  const isImage = file.type.startsWith('image')
  if (!isImage) {
    message.error(formatMessage(errorMessages.text.uploadImageError))
  }
  const size = fileSize || 2 * 1024 * 1024
  const inSize = file.size < size
  if (!inSize) {
    message.error(formatMessage(errorMessages.text.imageSizeError, { size: (size / 1024 / 1024).toFixed(0) }))
  }
  return isImage && inSize
}

export const uploadFile = async (key: string, file: Blob, authToken: string | null, config?: AxiosRequestConfig) =>
  await axios
    .post(
      `${process.env.REACT_APP_API_BASE_ROOT}/sys/sign-url`,
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

export const uploadFileV2 = async (
  key: string,
  file: Blob,
  prefix: string,
  authToken: string | null,
  appId: string,
  config?: AxiosRequestConfig,
) => {
  const signUrl = await axios.post(
    `${process.env.REACT_APP_LODESTAR_SERVER_ENDPOINT}/storage/storage/upload`,
    {
      appId,
      fileName: key,
      prefix,
    },
    {
      headers: { authorization: `Bearer ${authToken}` },
    },
  )

  const s3UploadRes = await axios.put<{ status: number; data: string }>(signUrl.data, file, {
    ...config,
    headers: {
      'Content-Type': file.type,
    },
  })

  return s3UploadRes
}

export const getFileDownloadableLinkV2 = async (
  key: string,
  prefix: string,
  authToken: string | null,
  appId: string,
) => {
  const { data } = await axios.post(
    `${process.env.REACT_APP_LODESTAR_SERVER_ENDPOINT}/storage/storage/download`,
    {
      appId,
      fileName: key,
      prefix,
    },
    {
      headers: { authorization: `Bearer ${authToken}` },
    },
  )

  return data
}

export const getFileDownloadableLink = async (key: string, authToken: string | null) => {
  const { data } = await axios.post(
    `${process.env.REACT_APP_API_BASE_ROOT}/sys/sign-url`,
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

export const downloadFile = async (fileName: string, config: AxiosRequestConfig) =>
  await axios({ ...config, method: 'GET', responseType: 'blob' })
    .then((response: any) => {
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', fileName)
      document.body.appendChild(link)
      link.click()
    })
    .catch(error => console.error(error))

export const commaFormatter = (value?: number | string | null) =>
  value !== null && value !== undefined && `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')

export const merchandiseCurrencyFormatter = (value?: number | null, currencyId?: string, coinUnit?: string) => {
  if (value === null || value === undefined) {
    return
  } else if (currencyId === 'LSC') {
    return `${value} ${coinUnit || 'Coins'}`
  } else {
    return `NT$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  }
}

export const currencyFormatter = (value?: number | string | null, currencyId?: string, coinUnit?: string) => {
  if (value === null || value === undefined) {
    return
  } else if (currencyId === 'LSC') {
    return `${value} ${coinUnit || currencyId}`
  } else {
    return `NT$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  }
}

export const dateFormatter = (value: Date | string, format?: string) =>
  moment(value).format(format || `YYYY/MM/DD HH:mm`)

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
  if (seconds >= 3600) {
    const remainSeconds = seconds % 3600
    return `HOURS:MINUTES:SECONDS`
      .replace('HOURS', `${Math.floor(seconds / 3600)}`.padStart(2, '0'))
      .replace('MINUTES', `${Math.floor(remainSeconds / 60)}`.padStart(2, '0'))
      .replace('SECONDS', `${Math.floor(remainSeconds % 60)}`.padStart(2, '0'))
  } else {
    return `MINUTES:SECONDS`
      .replace('MINUTES', `${Math.floor(seconds / 60)}`.padStart(2, '0'))
      .replace('SECONDS', `${Math.floor(seconds % 60)}`.padStart(2, '0'))
  }
}

export const durationFormatToSeconds = (formattedDuration: string) => {
  const durationArr = formattedDuration.split(':')
  if (durationArr.length === 3) {
    return parseInt(durationArr[0]) * 60 * 60 + parseInt(durationArr[1]) * 60 + parseInt(durationArr[2])
  } else {
    return parseInt(durationArr[0]) * 60 + parseInt(durationArr[1])
  }
}

export const rgba = (hexColor: string, alpha: number) => {
  hexColor = (hexColor || '#2d313a').replace('#', '')
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

export const stableSort = (array: any[], customCompareFunction: (a: any[], b: any[]) => number) => {
  const arrayWithPosition = array.map((element, index) => [element, index])
  const compare = !!customCompareFunction
    ? customCompareFunction
    : (a: any, b: any) => {
        if (a > b) return 1
        if (a < b) return -1
        return 0
      }
  const stableCompare = (a: any[], b: any[]) => {
    const order = compare(a[0], b[0])
    return order !== 0 ? order : a[1] - b[1]
  }
  const sortedArray = arrayWithPosition.sort(stableCompare).map(element => element[0])
  return sortedArray
}

export const toCSV: (data: string[][]) => string = data => {
  const columns = data.shift()

  if (!columns) {
    return ''
  }

  return (
    `${columns.map(column => `"${column}"`).join(',')}\n` +
    data.map(row => row.map(col => `"${col}"`).join(',')).join('\n')
  )
}

export const downloadCSV = (fileName: string, csvString: string) => {
  const csvData = new Blob([csvString], { type: 'text/csv' })
  var csvUrl = URL.createObjectURL(csvData)

  const downloadLink = document.createElement('a')
  downloadLink.setAttribute('href', csvUrl)
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

export const isiPhoneChrome = () => {
  const userAgent = window.navigator.userAgent
  return userAgent.match(/iPhone/i) && userAgent.match(/CriOS/i)
}

export const isWebview = () => {
  var useragent = navigator.userAgent
  var rules = ['WebView', '(iPhone|iPod|iPad)(?!.*Safari/)', 'Android.*(wv|.0.0.0)']
  var regex = new RegExp(`(${rules.join('|')})`, 'ig')
  return Boolean(useragent.match(regex))
}

export const getFileDuration = (blob: Blob): Promise<number> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video')
    video.src = URL.createObjectURL(blob)

    video.onloadedmetadata = function () {
      // handle chrome's bug
      if (video.duration === Infinity) {
        // set it to bigger than the actual duration
        video.currentTime = 1e101
        video.ontimeupdate = function () {
          this.ontimeupdate = () => {
            return
          }
          video.currentTime = 0

          resolve(video.duration)
        }
      } else {
        resolve(video.duration)
      }
    }
  })
}

export const copyToClipboard = (str: string) => {
  const el = document.createElement('textarea')
  el.value = str
  el.setAttribute('readonly', '')
  el.style.position = 'absolute'
  el.style.left = '-9999px'
  document.body.appendChild(el)
  el.select()
  document.execCommand('copy')
  document.body.removeChild(el)
}

export const call = async ({
  appId,
  authToken,
  phone,
  salesTelephone,
  confirmMessage,
}: {
  appId: string
  authToken: string | null
  phone: string
  salesTelephone: string
  confirmMessage: string
}): Promise<{ data: { code: string } }> => {
  if (!window.confirm(confirmMessage)) {
    return { data: { code: 'CANCELED' } }
  }

  return axios.post(
    `https://${process.env.REACT_APP_API_BASE_ROOT}/call`,
    {
      appId,
      callFrom: salesTelephone,
      callTo: phone,
    },
    {
      headers: { authorization: `Bearer ${authToken}` },
    },
  )
}

export const getVideoIDByURL = (url: string, source: string) => {
  switch (source) {
    case 'youtube':
      const regex =
        /.*(?:(?:youtu.be\/|v\/|vi\/|u\/w\/|embed\/)|shorts\/|(?:(?:watch)??v(?:i)?=|&v(?:i)?=))([^#&?\/\s]*).*/
      const res = url.match(regex)?.[1] || null
      return res
    default:
      return null
  }
}

export const generateUrlWithID = (id: string, source: string) => {
  switch (source) {
    case 'youtube':
      return `https://www.youtube.com/watch?v=${id}`
    default:
      return null
  }
}

// MIME
export const contentTypeFormat = (source: string) => {
  switch (source.toLowerCase()) {
    case 'youtube':
      return 'vnd.youtube.yt'
    default:
      return null
  }
}

export const isHTMLString = (str: string) =>
  !(str || '')
    // replace html tag with content
    .replace(/<([^>]+?)([^>]*?)>(.*?)<\/\1>/gi, '')
    // remove remaining self closing tags
    .replace(/(<([^>]+)>)/gi, '')
    // remove extra space at start and end
    .trim()

export const getImageSizedUrl = (isUseOriginSize: boolean, imageUrl: string) => {
  if (imageUrl === '') return imageUrl
  let uploadUrl: string
  const isImageResized = isImageUrlResized(imageUrl)
  if (isImageResized && isUseOriginSize) {
    uploadUrl = imageUrl.replace(/\/\d{1,5}$/, '')
  } else if (!isImageResized && !isUseOriginSize) {
    uploadUrl = imageUrl + '/1080'
  } else {
    uploadUrl = imageUrl
  }
  return uploadUrl
}

export const isImageUrlResized = (imageUrl: string) => {
  return /\/\d{1,5}$/.test(imageUrl)
}

export const isValidEmail = (email: string) => {
  return /^[.\w%+-]+@\w+((\.|-)\w+)*\.[A-Za-z]+$/.test(email)
}

export const deleteZoomMeet = async (meetId: string, authToken: string | null) => {
  if (!meetId) return
  const response = await axios.delete(`${process.env.REACT_APP_KOLABLE_SERVER_ENDPOINT}/kolable/meets/${meetId}`, {
    headers: {
      authorization: `Bearer ${authToken}`,
    },
  })
  return response.status
}

export const updateMeeting = async (
  meetId: string,
  meetingMemberId: string | null,
  meetingStartedAt: Moment | null,
  meetingHours: number,
  appId: string,
  authToken: string | null,
) => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { formatMessage } = useIntl()
  if (!meetId) return
  try {
    await axios.put(
      `${process.env.REACT_APP_KOLABLE_SERVER_ENDPOINT}/kolable/meets/${meetId}`,
      {
        name: `${process.env.NODE_ENV === 'development' ? 'dev' : appId}-${meetingMemberId}`,
        autoRecording: true,
        service: 'zoom',
        nbfAt: moment(meetingStartedAt).add(-10, 'minutes').toDate(),
        expAt: moment(meetingStartedAt).add(meetingHours, 'hours').toDate(),
        startedAt: meetingStartedAt?.toDate(),
        endedAt: moment(meetingStartedAt).add(meetingHours, 'hours').toDate(),
      },
      {
        headers: {
          authorization: `Bearer ${authToken}`,
        },
      },
    )
    return { meetId, continueInsertTask: true }
  } catch (error) {
    const err = error as AxiosError
    const errorMessage = err.response?.data.message.split(':')[0]
    // if service not found, means the user does not use zoom , webex etc,
    // jitsi will be default meeting service, so don't need alert
    if ('E_MEET_SERVICES_NOTFOUND' === errorMessage) return { meetId: null, continueInsertTask: true }
    const continueInsertTask = window.confirm(formatMessage(memberMessages.text.zoomMeetingLimitReached))
    return { meetId: null, continueInsertTask }
  }
}
export const createMeeting = async (
  meetingMemberId: string | null,
  meetingStartedAt: Moment | null,
  meetingHours: number,
  appId: string,
  authToken: string | null,
) => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { formatMessage } = useIntl()
  try {
    const response = await axios.post(
      `${process.env.REACT_APP_KOLABLE_SERVER_ENDPOINT}/kolable/meets`,
      {
        autoRecording: true,
        service: 'zoom',
        nbfAt: moment(meetingStartedAt).add(-10, 'minutes').toDate(),
        expAt: moment(meetingStartedAt).add(meetingHours, 'hours').toDate(),
        startedAt: meetingStartedAt?.toDate(),
        endedAt: moment(meetingStartedAt).add(meetingHours, 'hours').toDate(),
      },
      {
        headers: {
          authorization: `Bearer ${authToken}`,
        },
      },
    )
    return { meetId: response.data.data.id, continueInsertTask: true }
  } catch (error) {
    const err = error as AxiosError
    const errorMessage = err.response?.data.message.split(':')[0]
    // if service not found, means the user does not use zoom , webex etc,
    // jitsi will be default meeting service, so don't need alert
    if ('E_MEET_SERVICES_NOTFOUND' === errorMessage) return { meetId: null, continueInsertTask: true }
    const continueInsertTask = window.confirm(`${formatMessage(memberMessages.text.zoomMeetingLimitReached)}\n`)
    return { meetId: null, continueInsertTask }
  }
}

export const getVideoDuration = (file: File): Promise<number> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video')
    video.preload = 'metadata'

    video.onloadedmetadata = function () {
      window.URL.revokeObjectURL(video.src)
      const duration = video.duration
      resolve(duration)
    }

    video.src = URL.createObjectURL(file)
  })
}

export const extractSizeNumber = (string?: string) => {
  return string?.match(/\d+/g)?.[0] ? Number(string.match(/\d+/g)?.[0]) : 0
}

export const extractSizeUnit = (string?: string) => string?.match(/px|%|rem|em|vw|vh/g)?.[0] || 'px'

export const convertToPx = (value: string) => {
  const unit = extractSizeUnit(value)
  const num = extractSizeNumber(value)
  switch (unit) {
    case 'px':
      return num
    case 'em':
      const rootFontSize = window.getComputedStyle(document.documentElement).fontSize
      const rootFontSizeValue = parseFloat(rootFontSize)
      return num * rootFontSizeValue
    case 'vh':
      return (num * window.innerHeight) / 100
    case 'vw':
      return (num * window.innerWidth) / 100
    default:
      return num
  }
}

export const convertPxToUnit = (value: number, unit: string) => {
  switch (unit) {
    case 'px':
      return `${value}px`
    case 'em':
      const rootFontSize = window.getComputedStyle(document.documentElement).fontSize
      const rootFontSizeValue = parseFloat(rootFontSize)
      return `${value / rootFontSizeValue}rem`
    case 'vh':
      return `${(value * 100) / window.innerHeight}vh`
    case 'vw':
      return `${(value * 100) / window.innerWidth}vw`
    default:
      return `${value}px`
  }
}

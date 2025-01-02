import { StringLiteral } from '@babel/types'
import Uppy from '@uppy/core'
import { DragDrop } from '@uppy/react'
import XHRUpload from '@uppy/xhr-upload'
import { Alert, Button, Modal } from 'antd'
import { ModalProps } from 'antd/lib/modal'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import { useCallback, useEffect, useState } from 'react'
import { defineMessages, useIntl } from 'react-intl'
import * as XLSX from 'xlsx'
import orderExampleData from './OrderExampleData'

const messages = defineMessages({
  description: { id: 'sales.orderImportModal.description', defaultMessage: '點此下載範本' },
  note: { id: 'sales.orderImportModal.note', defaultMessage: '檔案上限 10MB' },
  success: { id: 'sales.orderImportModal.success', defaultMessage: '上傳成功' },
  failed: { id: 'sales.orderImportModal.failed', defaultMessage: '上傳失敗' },
  numSuccess: { id: 'sales.orderImportModal.numSuccess', defaultMessage: '成功筆數' },
  numFailed: { id: 'sales.orderImportModal.numFailed', defaultMessage: '失敗筆數' },
  numTotal: { id: 'sales.orderImportModal.numTotal', defaultMessage: '總筆數' },
})

type OrderImportModalProps = ModalProps & {
  renderTrigger?: (ctx: { show: () => void }) => React.ReactElement
}
type ResponseBody =
  | {
      code: 'SUCCESS'
      message: string
      result: { total: number; success: number; failed: { index: number; error: string }[] }
    }
  | {
      code: string
      message: StringLiteral
      result: null
    }

const OrderImportModal: React.FC<OrderImportModalProps> = ({ renderTrigger, ...modalProps }) => {
  const { formatMessage } = useIntl()
  const { authToken } = useAuth()
  const [isVisible, setIsVisible] = useState(false)
  const [bodies, setBodies] = useState<ResponseBody[]>([])

  const [uppy, setUppy] = useState<Uppy | null>(null)

  const initUppy = useCallback(() => {
    const uppyInstance = new Uppy({
      autoProceed: true,
      restrictions: {
        maxNumberOfFiles: 1,
        maxTotalFileSize: 10 * 1024 * 1024,
        allowedFileTypes: ['.csv', '.xlsx', '.xls'],
      },
    })
      .use(XHRUpload, {
        endpoint: `${process.env.REACT_APP_API_BASE_ROOT}/sys/import-orders`,
        headers: {
          Authorization: `bearer ${authToken}`,
        },
      })
      .on('complete', result => {
        setBodies(result.successful.map(res => res.response?.body as ResponseBody))
      })
      .on('error', console.error)

    setUppy(uppyInstance)
    return uppyInstance
  }, [authToken])

  useEffect(() => {
    if (isVisible && !uppy) {
      initUppy()
    }
  }, [isVisible, initUppy, uppy])

  const cleanupUppy = useCallback(() => {
    if (uppy) {
      uppy.close()
      setUppy(null)
    }
  }, [uppy])

  useEffect(() => {
    return () => {
      cleanupUppy()
    }
  }, [cleanupUppy])

  const downloadSampleCsv = () => {
    const workbook = XLSX.utils.book_new()
    const worksheet = XLSX.utils.aoa_to_sheet(orderExampleData)
    XLSX.utils.book_append_sheet(workbook, worksheet)
    XLSX.writeFile(workbook, 'sample_orders.csv')
  }

  const handleCancel = () => {
    setBodies([])
    setIsVisible(false)
    cleanupUppy()
  }

  return (
    <>
      {renderTrigger?.({ show: () => setIsVisible(true) })}
      {isVisible && (
        <Modal visible footer={null} onCancel={handleCancel} {...modalProps}>
          <div className="text-center">
            <Button type="link" onClick={() => downloadSampleCsv()}>
              {formatMessage(messages.description)}
            </Button>
          </div>
          {bodies.length === 0 && uppy && (
            <DragDrop uppy={uppy} width="100%" height="100%" note={formatMessage(messages.note)} />
          )}
          {bodies.map(body => {
            switch (body.code) {
              case 'SUCCESS':
                return (
                  <Alert
                    type="success"
                    message={formatMessage(messages.success)}
                    description={
                      <div>
                        <div>
                          {formatMessage(messages.numTotal)}: {body.result?.total}
                        </div>
                        <div>
                          {formatMessage(messages.numSuccess)}: {body.result?.success}
                        </div>
                        <div>
                          {formatMessage(messages.numFailed)}: {body.result?.failed.length}
                          {body.result?.failed.length && (
                            <span>
                              ({' '}
                              {body.result?.failed.map(f => `row ${f.index + 2} failed message: ${f.error}`).join(', ')}{' '}
                              )
                            </span>
                          )}
                        </div>
                      </div>
                    }
                  />
                )
              default:
                return <Alert message={formatMessage(messages.failed)} type="error" description={body.message} />
            }
          })}
        </Modal>
      )}
    </>
  )
}

export default OrderImportModal

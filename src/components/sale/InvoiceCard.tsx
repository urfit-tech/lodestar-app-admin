import bwipjs from '@bwip-js/browser'
import { Button, message } from 'antd'
import axios from 'axios'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import { handleError } from 'lodestar-app-element/src/helpers'
import { render } from 'mustache'
import React, { useRef, useState } from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import saleMessages from './translation'

export type InvoiceRequest = {
  MerchantOrderNo: string
  BuyerName: string
  BuyerUBN?: string
  BuyerAddress?: string
  BuyerPhone?: string
  BuyerEmail?: string
  Category: string
  TaxType: string
  TaxRate: number
  Amt: number
  TaxAmt: number
  TotalAmt: number
  LoveCode?: string
  PrintFlag: string
  ItemName: string
  ItemCount: string
  ItemUnit: string
  ItemPrice: string
  ItemAmt: string
  ItemTaxType?: string
  Comment?: string
  AmtFree?: number
  AmtZero?: number
  CustomsClearance?: string
  AmtSales?: number
}

type InvoiceResponse = {
  MerchantID: string
  InvoiceTransNo: string
  MerchantOrderNo: string
  InvoiceNumber: string
  RandomNum: string
  BuyerName: string
  BuyerUBN?: string
  BuyerAddress?: string
  BuyerPhone?: string
  BuyerEmail: string
  InvoiceType: string
  Category: string
  TaxType: string
  TaxRate: string
  Amt: string
  TaxAmt: number
  TotalAmt: string
  LoveCode?: string
  PrintFlag: string
  CreateTime: string
  ItemDetail: string
  InvoiceStatus: string
  CreateStatusTime: string
  UploadStatus: string
  CheckCode: string
  CarrierType?: string
  CarrierNum?: string
  BarCode: string
  QRcodeL: string
  QRcodeR: string
  KioskPrintFlag?: string
}

const StyledCard = styled.div`
  padding: 16px;
  border-radius: 4px;
  border: solid 1px #ececec;
  margin-bottom: 16px;
`

const StyledInfoTitle = styled.div`
  color: var(--gray-darker);
  font-size: 16px;
  font-weight: 500;
  line-height: 24px;
  letter-spacing: 0.2px;
  width: 35%;
`
const StyledInfoMessage = styled.div`
  width: 65%;
`

const InvoiceCard: React.FC<{
  status: string
  invoiceIssuedAt: string
  invoiceNumber: string
  invoiceName: string
  invoicePhone: string
  invoiceEmail: string
  invoiceTarget: string
  donationCode: string
  invoiceCarrier: string
  uniformNumber: string
  uniformTitle: string
  invoiceAddress: string
  invoiceComment?: string
  invoicePrice?: number
  invoiceRandomNumber?: string
  invoiceGatewayId?: string
  onClose?: () => void
}> = ({
  status,
  invoiceIssuedAt,
  invoiceNumber,
  invoiceName,
  invoicePhone,
  invoiceEmail,
  invoiceTarget,
  donationCode,
  invoiceCarrier,
  uniformNumber,
  uniformTitle,
  invoiceAddress,
  invoiceComment,
  invoicePrice,
  invoiceRandomNumber,
  invoiceGatewayId,
  onClose,
}) => {
  const { formatMessage } = useIntl()
  const { enabledModules, id: appId, settings } = useApp()
  const { authToken } = useAuth()
  const [loading, setLoading] = useState(false)
  const [showInvoice, setShowInvoice] = useState(false)
  const receiptRef1 = useRef<HTMLDivElement | null>(null)
  const receiptRef2 = useRef<HTMLDivElement | null>(null)
  const receiptRef3 = useRef<HTMLDivElement | null>(null)

  const [invoiceResponse, setInvoiceResponse] = useState<InvoiceResponse>()
  const statusMessage = !status
    ? formatMessage(saleMessages.InvoiceCard.invoicePending)
    : status === 'SUCCESS'
    ? formatMessage(saleMessages.InvoiceCard.invoiceSuccess)
    : status === 'REVOKED'
    ? formatMessage(saleMessages.InvoiceCard.invoiceRevoked)
    : formatMessage(saleMessages.InvoiceCard.invoiceFailed, { errorCode: status })
  const contentList = [
    { title: formatMessage(saleMessages.InvoiceCard.invoiceStatus), message: statusMessage, isRender: true },
    {
      title: formatMessage(saleMessages.InvoiceCard.invoiceNumber),
      message: invoiceNumber,
      isRender: enabledModules.invoice,
    },
    {
      title: formatMessage(saleMessages.InvoiceCard.invoiceIssuedAt),
      message: invoiceIssuedAt,
      isRender: enabledModules.invoice,
    },
    { title: formatMessage(saleMessages.InvoiceCard.invoiceName), message: invoiceName, isRender: true },
    {
      title: formatMessage(saleMessages.InvoiceCard.invoicePrice),
      message: invoicePrice?.toLocaleString(),
      isRender: !!invoicePrice,
    },
    { title: formatMessage(saleMessages.InvoiceCard.invoicePhone), message: invoicePhone, isRender: !!invoicePhone },
    { title: formatMessage(saleMessages.InvoiceCard.invoiceEmail), message: invoiceEmail, isRender: true },
    { title: formatMessage(saleMessages.InvoiceCard.invoiceTarget), message: invoiceTarget, isRender: true },
    { title: formatMessage(saleMessages.InvoiceCard.donationCode), message: donationCode, isRender: !!donationCode },
    {
      title: formatMessage(saleMessages.InvoiceCard.invoiceCarrier),
      message: invoiceCarrier,
      isRender: !!invoiceCarrier,
    },
    { title: formatMessage(saleMessages.InvoiceCard.uniformNumber), message: uniformNumber, isRender: true },
    { title: formatMessage(saleMessages.InvoiceCard.uniformTitle), message: uniformTitle, isRender: true },
    {
      title: formatMessage(saleMessages.InvoiceCard.invoiceAddress),
      message: invoiceAddress,
      isRender: !!invoiceAddress,
    },
    {
      title: formatMessage(saleMessages.InvoiceCard.invoiceComment),
      message: invoiceComment,
      isRender: true,
    },
  ]

  const handlePrint = async () => {
    try {
      setLoading(true)

      const result: {
        data: {
          code: string
          message: string
          result: {
            Status: string
            Message: string
            Result: InvoiceResponse
          }
        }
      } = await axios.post(
        `${process.env.REACT_APP_LODESTAR_SERVER_ENDPOINT}/invoice/search`,
        {
          invoiceGatewayId,
          invoiceNumber,
          invoiceRandomNumber,
          appId,
        },
        { headers: { Authorization: `Bearer ${authToken}` } },
      )

      if (result.data.code === 'SUCCESS') {
        setInvoiceResponse(result.data.result.Result)
        setShowInvoice(true)

        setTimeout(() => {
          const printContents = window.document.getElementById('print-content')?.innerHTML

          const WinPrint = window.open('', '', 'width=900,height=650')
          WinPrint?.document.write('<html><head><title>Print</title>')
          WinPrint?.document.write('<style>')
          WinPrint?.document.write(`
          body {
            margin:0;
            padding:0;}
            @media print {
              .page-break {
                page-break-before: always;
                }
                }
                `)
          WinPrint?.document.write('</style></head><body>')
          WinPrint?.document.write(printContents || '')
          WinPrint?.document.write('</body></html>')

          WinPrint?.document.close()
          WinPrint?.focus()
          WinPrint?.print()
          WinPrint?.close()
          setShowInvoice(false)
        }, 1500)
      }
    } catch (error) {
      console.log(error)
    } finally {
      setLoading(false)
    }
  }
  return (
    <StyledCard>
      <div className="container" style={{ opacity: status === 'REVOKED' ? 0.4 : 1 }}>
        {contentList.map(
          (row, idx) =>
            row.isRender && (
              <div className="row mb-2 justify-content-between" key={idx}>
                <StyledInfoTitle className="column">{row.title}</StyledInfoTitle>
                <StyledInfoMessage className="column">{row.message}</StyledInfoMessage>
              </div>
            ),
        )}
      </div>
      {status === 'SUCCESS' && (
        <>
          {enabledModules.invoice_printer && (
            <>
              <Button onClick={handlePrint}>列印發票</Button>
              {showInvoice && (
                <div id="print-content" style={{ display: 'none' }}>
                  <div className="no-break">
                    <Receipt
                      ref={receiptRef1}
                      template={JSON.parse(settings['invoice.template'])?.main || ''}
                      templateVariables={{
                        year: new Date().getFullYear() - 1911,
                        month: `${(new Date().getMonth() + (1 % 2) === 0
                          ? new Date().getMonth() + 1 - 1
                          : new Date().getMonth() + 1
                        )
                          .toString()
                          .padStart(2, '0')}-${(
                          (new Date().getMonth() + (1 % 2) === 0
                            ? new Date().getMonth() + 1 - 1
                            : new Date().getMonth() + 1) + 1
                        )
                          .toString()
                          .padStart(2, '0')}`,
                        createdAt: invoiceResponse?.CreateTime,
                        randomNumber: invoiceResponse?.RandomNum,
                        sellerUniformNumber: '70560259',
                        totalPrice: invoiceResponse?.TotalAmt,
                        uniformTitle: invoiceResponse?.BuyerUBN && `賣方 ${invoiceResponse.BuyerUBN}`,
                        invoiceNo: `${invoiceResponse?.InvoiceNumber.substring(
                          0,
                          2,
                        )}-${invoiceResponse?.InvoiceNumber.substring(2, 10)}`,
                        barcode: generateBarcodeAndQRcode('barcode', invoiceResponse?.BarCode || ''),
                        qrCodeL: generateBarcodeAndQRcode('qrCode', invoiceResponse?.QRcodeL || ''),
                        qrCodeR: generateBarcodeAndQRcode('qrCode', invoiceResponse?.QRcodeR || ''),
                      }}
                    />
                  </div>
                  <div className="page-break"></div>
                  <div className="no-break">
                    <Receipt
                      ref={receiptRef2}
                      template={JSON.parse(settings['invoice.template'])?.detail1 || ''}
                      templateVariables={{
                        createdAt: invoiceResponse?.CreateTime,
                        invoiceNo: invoiceResponse?.InvoiceNumber,
                        ItemCount: JSON.parse(invoiceResponse?.ItemDetail || '{}')?.[0]?.ItemCount,
                        ItemPrice: JSON.parse(invoiceResponse?.ItemDetail || '{}')?.[0]?.ItemPrice,
                        ItemName: JSON.parse(invoiceResponse?.ItemDetail || '{}')?.[0]?.ItemName,
                        ItemNum: JSON.parse(invoiceResponse?.ItemDetail || '{}')?.[0]?.ItemNum,
                        ItemWord: JSON.parse(invoiceResponse?.ItemDetail || '{}')?.[0]?.ItemWord,
                        ItemAmount: JSON.parse(invoiceResponse?.ItemDetail || '{}')?.[0]?.ItemAmount,
                      }}
                    />
                  </div>
                  <div className="page-break"></div>
                  <div className="no-break">
                    <Receipt
                      ref={receiptRef3}
                      template={JSON.parse(settings['invoice.template'])?.detail2 || ''}
                      templateVariables={{
                        createdAt: invoiceResponse?.CreateTime,
                        invoiceNo: invoiceResponse?.InvoiceNumber,
                        ItemCount: JSON.parse(invoiceResponse?.ItemDetail || '{}')?.[0]?.ItemCount,
                        ItemPrice: JSON.parse(invoiceResponse?.ItemDetail || '{}')?.[0]?.ItemPrice,
                        ItemName: JSON.parse(invoiceResponse?.ItemDetail || '{}')?.[0]?.ItemName,
                        ItemNum: JSON.parse(invoiceResponse?.ItemDetail || '{}')?.[0]?.ItemNum,
                        ItemWord: JSON.parse(invoiceResponse?.ItemDetail || '{}')?.[0]?.ItemWord,
                        ItemAmount: JSON.parse(invoiceResponse?.ItemDetail || '{}')?.[0]?.ItemAmount,
                        month: new Date().getMonth() + 1,
                      }}
                    />
                  </div>
                </div>
              )}
            </>
          )}
          {settings['payment.v2'] === '1' && (
            <Button
              className="ml-2"
              type="primary"
              disabled={loading}
              loading={loading}
              onClick={() => {
                setLoading(true)
                axios
                  .post(
                    `${process.env.REACT_APP_LODESTAR_SERVER_ENDPOINT}/invoice/revoke`,
                    {
                      appId,
                      invoiceGatewayId,
                      invoiceNumber: invoiceNumber,
                      invalidReason: '發票作廢',
                    },
                    {
                      headers: {
                        Authorization: `Bearer ${authToken}`,
                      },
                    },
                  )
                  .then(r => {
                    if (r.data.code === 'SUCCESS') {
                      onClose?.()
                      message.success('發票作廢成功')
                    }
                  })
                  .catch(handleError)
                  .finally(() => {
                    setLoading(false)
                  })
              }}
            >
              作廢發票
            </Button>
          )}
        </>
      )}
    </StyledCard>
  )
}

const generateBarcodeAndQRcode = (type: 'barcode' | 'qrCode', text: string) => {
  try {
    const canvasElement = document.createElement('canvas') as HTMLCanvasElement
    canvasElement.style.display = 'none'
    document.body.appendChild(canvasElement)

    canvasElement && type === 'barcode'
      ? bwipjs.toCanvas(canvasElement, {
          bcid: 'code39',
          text: text,
          scale: 1,
        })
      : bwipjs.toCanvas(canvasElement, {
          bcid: 'qrcode',
          text: text,
          scale: 1,
        })

    return (canvasElement as HTMLCanvasElement | null)?.toDataURL('image/png')
  } catch (error) {
    console.log(error)
  }
}

const Receipt = React.forwardRef<HTMLDivElement, { template: string; templateVariables?: { [key: string]: any } }>(
  (props, ref) => {
    const { template, templateVariables } = props
    return (
      <div className="receipt" ref={ref as any}>
        <div
          dangerouslySetInnerHTML={{
            __html: render(template, templateVariables),
          }}
        />
      </div>
    )
  },
)

export default InvoiceCard

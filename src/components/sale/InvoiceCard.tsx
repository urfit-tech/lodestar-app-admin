import bwipjs from '@bwip-js/browser'
import { Button, message } from 'antd'
import axios from 'axios'
import dayjs from 'dayjs'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import { handleError } from 'lodestar-app-element/src/helpers'
import { render } from 'mustache'
import { defaultTo, pipe, prop, sum } from 'ramda'
import React, { useRef, useState } from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import AdminModal from '../admin/AdminModal'
import saleMessages from './translation'

type TaxType = '1' | '2' | '3' | '9'


type ActualInvoiceData = {
  no: string
  price: number
  createdAt: string
  revokedAt?: string | null
  options?: {
    Result?: {
      TaxType?: TaxType
      [key: string]: any
    }
    [key: string]: any
  }
}

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
  companyUniformNumber?: string
  executorName?: string
  memberId?: string
  paymentMethod?: string
  invoiceCompanyName?: string
  companyAddress?: string
  companyPhone?: string
  onClose?: () => void
  isAccountReceivable?: boolean
  isMemberZeroTaxProperty?: string
  actualInvoiceData?: ActualInvoiceData
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
  companyUniformNumber,
  executorName,
  memberId,
  paymentMethod,
  invoiceCompanyName,
  companyAddress,
  companyPhone,
  onClose,
  isAccountReceivable,
  isMemberZeroTaxProperty,
  actualInvoiceData,
}) => {
  const { formatMessage } = useIntl()
  const { enabledModules, id: appId, settings } = useApp()
  const { authToken } = useAuth()
  const [isRevokeInvoiceModalOpen, setIsRevokeInvoiceModalOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showInvoice, setShowInvoice] = useState(false)
  const receiptRef1 = useRef<HTMLDivElement | null>(null)
  const receiptRef2 = useRef<HTMLDivElement | null>(null)
  const receiptRef3 = useRef<HTMLDivElement | null>(null)

  const [invoiceResponse, setInvoiceResponse] = useState<InvoiceResponse>()

  const isMemberZeroTaxPropertyEnableSetting = settings['feature.is_member_zero_tax_property.enable'] === '1'
  const getTaxTypeName = (taxType: string) => {
    switch (taxType) {
      case '1':
        return formatMessage(saleMessages.SaleCollectionExpandRow.taxable) // '應稅'
      case '2':
        return formatMessage(saleMessages.SaleCollectionExpandRow.zeroTax) // '零稅'
      case '3':
        return formatMessage(saleMessages.SaleCollectionExpandRow.taxExempt) // '免稅'
      case '9':
        return formatMessage(saleMessages.SaleCollectionExpandRow.mixedTax) // '混合稅'
      default:
        return taxType || ''
    }
  }

  const getTaxTypeFromData = () => {
    if (actualInvoiceData?.options?.Result?.TaxType) {
      return getTaxTypeName(actualInvoiceData.options.Result.TaxType)
    }
    return ''
  }

  const revokeInvoice = () => {
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
          message.success(formatMessage(saleMessages.InvoiceCard.voidInvoiceSuccess))
        }
      })
      .catch(handleError)
      .finally(() => {
        setLoading(false)
      })
  }

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
      title: formatMessage(saleMessages.SaleCollectionExpandRow.taxType), // '課稅別'
      message: getTaxTypeFromData(),
      isRender: isMemberZeroTaxPropertyEnableSetting && getTaxTypeFromData() !== '',
    },
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
      isRender: !!invoiceAddress.trim(),
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

      if (result.data?.result.Status === 'SUCCESS') {
        setInvoiceResponse(result.data.result.Result)
        setShowInvoice(true)
        console.log('應收帳款',isAccountReceivable)
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
      } else {
        message.error(result.data?.result?.Message)
      }
    } catch (error) {
      console.log(error)
    } finally {
      setLoading(false)
    }
  }

  const INVOICE_RANGE: { [key: string]: string } = {
    '1': '01-02',
    '2': '01-02',
    '3': '03-04',
    '4': '03-04',
    '5': '05-06',
    '6': '05-06',
    '7': '07-08',
    '8': '07-08',
    '9': '09-10',
    '10': '09-10',
    '11': '11-12',
    '12': '11-12',
  }

  const getMinGuoYear = (date: Date) => date.getFullYear() - 1911
  const currentMonth = new Date().getMonth() + 1
  return (
    <StyledCard>
      <div className="container" style={{ opacity: status !== 'SUCCESS' ? 0.4 : 1 }}>
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
              <Button onClick={handlePrint}>{formatMessage(saleMessages.InvoiceCard.printInvoice)}</Button>
              {showInvoice && (
                <div id="print-content" style={{ display: 'none' }}>
                  <div className="no-break">
                    <Receipt
                      ref={receiptRef1}
                      template={JSON.parse(settings['invoice.template'])?.main || ''}
                      templateVariables={{
                        year: pipe(
                          (prop as any)('CreateTime'),
                          (defaultTo as any)(new Date()),
                          (_: string | Date) => new Date(_),
                          getMinGuoYear,
                        )(invoiceResponse),
                        month:
                          INVOICE_RANGE[
                            invoiceResponse?.CreateTime
                              ? (new Date(invoiceResponse?.CreateTime).getMonth() + 1).toString()
                              : currentMonth.toString()
                          ],
                        createdAt: invoiceResponse?.CreateTime,
                        randomNumber: invoiceResponse?.RandomNum,
                        sellerUniformNumber: companyUniformNumber,
                        totalPrice: Number(invoiceResponse?.TotalAmt || 0).toLocaleString(),
                        uniformTitle: invoiceResponse?.BuyerUBN && `買方 ${invoiceResponse.BuyerUBN}`,
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
                        itemBlock: JSON.parse(invoiceResponse?.ItemDetail || '{}').map(
                          (item: any) => `<div class='details'>
    <div style='display:flex;align-items:center;justify-content:space-between;gap:4px;width:100%;'><div>${
      item.ItemCount
    } * @ ${Number(
                            invoiceResponse?.Category === 'B2B' ? Math.round(item.ItemPrice) : item.ItemPrice,
                          ).toLocaleString()}</div><div>${Number(
                            invoiceResponse?.Category === 'B2B' ? Math.round(item.ItemAmount) : item.ItemAmount,
                          ).toLocaleString()}</div></div>
    <div>${item.ItemName}</div>
    <div>${item.ItemNum}${item.ItemWord}</div>
  </div>`,
                        ),
                        totalAmount: Number(invoiceResponse?.TotalAmt || 0).toLocaleString(),
                        companyUniformNumber,
                        invoiceCompanyName,
                        companyAddress,
                        companyPhone,
                        uniformTitle: invoiceResponse?.BuyerUBN && `統編：${invoiceResponse.BuyerUBN}`,
                        comment: invoiceComment,
                        taxBlock:
                          invoiceResponse?.BuyerUBN &&
                          `<div>稅額: ${Number(invoiceResponse?.TaxAmt || 0).toLocaleString()}</div>`,
                        accountReceivableBlock: isAccountReceivable ? `<div>應收帳款</div>` : '',
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
                        itemBlock: JSON.parse(invoiceResponse?.ItemDetail || '{}')?.map(
                          (item: any) => `<div class='receipt-detail-3-flex'>
      <div style='max-width:60%;'>${item.ItemName}</div>
      <div>x ${item.ItemCount} ${Number(
                            invoiceResponse?.Category === 'B2B' ? Math.round(item.ItemPrice) : item.ItemPrice,
                          ).toLocaleString()}</div>
    </div>`,
                        ),
                        totalAmount: Number(invoiceResponse?.TotalAmt || 0).toLocaleString(),
                        executor: executorName,
                        memberName: invoiceName,
                        memberId,
                        comment: invoiceComment,
                        length: JSON.parse(invoiceResponse?.ItemDetail || '{}')?.length || 0,
                        totalUnit: sum(
                          JSON.parse(invoiceResponse?.ItemDetail || '{}')?.map((item: any) => item.ItemCount) || 0,
                        ),
                        paymentMethod: paymentMethod,
                        invoiceCompanyName,
                        companyAddress,
                        companyPhone,
                        taxBlock:
                          invoiceResponse?.BuyerUBN &&
                          `<div class="receipt-detail-2-flex" style="margin-right: 16px">
    <div>稅額</div>
    <div>${Number(invoiceResponse?.TaxAmt || 0).toLocaleString()}</div>
  </div>`,
                        accountReceivableBlock: isAccountReceivable ? `<div>應收帳款</div>` : '',
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
                setIsRevokeInvoiceModalOpen(true)
              }}
            >
              {formatMessage(saleMessages.InvoiceCard.voidInvoice)}
            </Button>
          )}
          <AdminModal
            title="確認作廢發票"
            visible={isRevokeInvoiceModalOpen}
            onOk={() => {
              revokeInvoice()
              setIsRevokeInvoiceModalOpen(false)
            }}
            onCancel={() => setIsRevokeInvoiceModalOpen(false)}
          >
            <p>您即將作廢此發票，作廢後將無法恢復。</p>
            <p>請確認是否繼續？</p>
            <p>發票開立日期：{dayjs(invoiceIssuedAt).format('YYYY/MM/DD')}</p>
            <p>發票號碼：{invoiceNumber}</p>
            <p>發票金額：{invoicePrice}</p>
          </AdminModal>
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

import { DownloadOutlined } from '@ant-design/icons'
import { Button, Modal, Tabs } from 'antd'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import { downloadCSV, toCSV } from '../../helpers'
import { commonMessages, promotionMessages } from '../../helpers/translation'
import { useVoucherCode } from '../../hooks/checkout'

const StyledTriggerText = styled.span`
  color: ${props => props.theme['@primary-color']};
  font-size: 14px;
  cursor: pointer;
`
const StyledTitle = styled.div`
  color: var(--gray-darker);
  font-size: 20px;
  font-weight: bold;
  line-height: 1.3;
  letter-spacing: 0.77px;
`
const StyledVoucherCode = styled.div<{ isFinished: boolean }>`
  color: ${props => (props.isFinished ? 'var(--gray)' : 'var(--gray-darker)')};
`

type VoucherPlanDetailModalProps = {
  id: string
  title: string
}
const VoucherPlanDetailModal: React.FC<VoucherPlanDetailModalProps> = ({ id, title }) => {
  const { formatMessage } = useIntl()
  const [visible, setVisible] = useState(false)

  return (
    <>
      <StyledTriggerText className="mr-4" onClick={() => setVisible(true)}>
        {formatMessage(commonMessages.ui.detail)}
      </StyledTriggerText>

      <Modal centered destroyOnClose footer={null} visible={visible} onCancel={() => setVisible(false)}>
        <VoucherPlanDetailBlock title={title} voucherPlanId={id} />
      </Modal>
    </>
  )
}

const VoucherPlanDetailBlock: React.FC<{ title: string; voucherPlanId: string }> = ({ title, voucherPlanId }) => {
  const { formatMessage } = useIntl()
  const { loadingVoucherCodes, errorVoucherCodes, voucherCodes } = useVoucherCode(voucherPlanId)
  const [activeKey, setActiveKey] = useState('codes')

  const exportCodes = () => {
    const data: string[][] = [
      [formatMessage(promotionMessages.label.couponCodes), formatMessage(promotionMessages.status.used), 'Email'],
    ]

    voucherCodes.forEach(voucherCode => {
      voucherCode.vouchers.forEach(voucher => {
        data.push([voucherCode.code, voucher.used ? 'v' : '', voucher.memberEmail])
      })

      if (voucherCode.remaining) {
        for (let i = 0; i < voucherCode.remaining; i++) {
          data.push([voucherCode.code, '', ''])
        }
      }
    })

    downloadCSV(`${title}.csv`, toCSV(data))
  }

  return (
    <>
      <StyledTitle className="mb-4">{title}</StyledTitle>

      <Button
        type="primary"
        icon={<DownloadOutlined />}
        className="mb-4"
        onClick={exportCodes}
        loading={!!(loadingVoucherCodes || errorVoucherCodes)}
      >
        {formatMessage(promotionMessages.ui.exportCodes)}
      </Button>

      <Tabs activeKey={activeKey} onChange={key => setActiveKey(key)}>
        <Tabs.TabPane key="codes" tab={formatMessage(promotionMessages.label.voucherCode)} className="pt-4">
          {voucherCodes.map(voucherCode => (
            <StyledVoucherCode
              key={voucherCode.code}
              className="d-flex justify-content-between mb-2"
              isFinished={voucherCode.used === voucherCode.count}
            >
              <code>{voucherCode.code}</code>
              <div>
                {formatMessage(promotionMessages.text.exchangedCount, {
                  exchanged: voucherCode.count - voucherCode.remaining,
                  total: voucherCode.count,
                })}
              </div>
            </StyledVoucherCode>
          ))}
        </Tabs.TabPane>
      </Tabs>
    </>
  )
}

export default VoucherPlanDetailModal

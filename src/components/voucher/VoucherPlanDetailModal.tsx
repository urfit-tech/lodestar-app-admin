import { Modal, Tabs } from 'antd'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import { commonMessages, promotionMessages } from '../../helpers/translation'
import { VoucherCodeBriefProps } from '../../types/checkout'

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
  title: string
  voucherCodes: VoucherCodeBriefProps[]
}
const VoucherPlanDetailModal: React.FC<VoucherPlanDetailModalProps> = ({ title, voucherCodes }) => {
  const { formatMessage } = useIntl()
  const [visible, setVisible] = useState(false)
  const [activeKey, setActiveKey] = useState('codes')

  return (
    <>
      <StyledTriggerText className="mr-4" onClick={() => setVisible(true)}>
        {formatMessage(commonMessages.ui.detail)}
      </StyledTriggerText>

      <Modal centered destroyOnClose footer={null} visible={visible} onCancel={() => setVisible(false)}>
        <StyledTitle className="mb-4">{title}</StyledTitle>

        <Tabs activeKey={activeKey} onChange={key => setActiveKey(key)}>
          <Tabs.TabPane key="codes" tab={formatMessage(promotionMessages.term.voucherCode)} className="pt-4">
            {voucherCodes.map(voucherCode => (
              <StyledVoucherCode
                key={voucherCode.code}
                className="d-flex justify-content-between mb-2"
                isFinished={voucherCode.used === voucherCode.count}
              >
                <code>{voucherCode.code}</code>
                <div>
                  {formatMessage(promotionMessages.text.exchangedCount, {
                    exchanged: voucherCode.used,
                    total: voucherCode.count,
                  })}
                </div>
              </StyledVoucherCode>
            ))}
          </Tabs.TabPane>
        </Tabs>
      </Modal>
    </>
  )
}

export default VoucherPlanDetailModal

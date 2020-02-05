import { Modal, Tabs } from 'antd'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import { commonMessages, promotionMessages } from '../../helpers/translation'
import { ProductType } from '../../schemas/general'

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
  productCounts: {
    id: string
    name: string
    coverUrl?: string
    type: ProductType
    count: number
  }[]
  voucherCodes: {
    code: string
    used: number
    count: number
  }[]
}
const VoucherPlanDetailModal: React.FC<VoucherPlanDetailModalProps> = ({ title, productCounts, voucherCodes }) => {
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
          {/* <Tabs.TabPane key="status" tab="兌換狀態" className="pt-4">
            {productCounts.map(product => (
              <div key={product.id}>
                <div className="d-flex justify-content-between align-items-center">
                  <StyledCoverImage
                    src={product.coverUrl || EmptyCover}
                    alt={product.id}
                    className="flex-shrink-0 mr-3"
                  />
                  <Typography.Paragraph ellipsis={{ rows: 2 }} className="flex-grow-1 m-0 mr-5">
                    {product.name}
                  </Typography.Paragraph>
                  <StyledMeta className="mr-5">{ProductTypeLabel[product.type] || '未知'}</StyledMeta>
                  <StyledMeta>{product.count}</StyledMeta>
                </div>

                <Divider className="my-4" />
              </div>
            ))}
          </Tabs.TabPane> */}

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

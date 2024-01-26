import { gql } from '@apollo/client'
import { Button, Form, Modal } from 'antd'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import { salesLeadDeliveryPageMessages } from './translation'

interface SalesLeadLimitConfirmModelProps {
  visible: boolean
  setVisible: React.Dispatch<React.SetStateAction<boolean>>
  setCurrentStep: React.Dispatch<React.SetStateAction<number>>
  onConfirm: () => void
  anticipatedDispatchCount: number
  confirmationData: any
}

const StyledModalTitle = styled.div`
  color: var(--gray-darker);
  font-size: 20px;
  font-weight: bold;
`

const StyledHighlightedNumber = styled.span`
  color: var(--error);
  height: 24px;
`

const StyledFormItem = styled(Form.Item)`
  color: var(--gray-darker);
`

const StyledModal = styled(Modal)`
  color: ${props => props.theme['@normal-color']};

  .ant-modal-body {
    padding-bottom: 24px, 24px, 24px, 12px;
  }
`

const SalesLeadLimitConfirmModel: React.FC<SalesLeadLimitConfirmModelProps> = ({
  visible,
  setVisible,
  onConfirm,
  setCurrentStep,
  confirmationData,
  anticipatedDispatchCount,
}) => {
  const [loading, setLoading] = useState(false)

  const { formatMessage } = useIntl()

  const managerName = confirmationData?.manager?.name || 'Unknown Name'
  const managerEmail = confirmationData?.manager?.email || 'unknown@example.com'
  const currentHoldingsCount = confirmationData?.memberCount?.aggregate?.count || 0

  const totalAfterDispatch = anticipatedDispatchCount + currentHoldingsCount

  const UPDATE_LEAD_MANAGER = gql`
    mutation UPDATE_LEAD_MANAGER($memberIds: [String!], $managerId: String) {
      update_member(
        where: { id: { _in: $memberIds } }
        _set: { manager_id: $managerId, last_manager_assigned_at: "now()" }
      ) {
        affected_rows
      }
    }
  `

  const handleSubmit = async () => {
    setCurrentStep(step => step + 1)
    onConfirm()
  }

  return (
    <StyledModal
      title={null}
      footer={null}
      centered
      destroyOnClose
      visible={visible}
      onCancel={() => setVisible(false)}
      width={429}
    >
      <StyledModalTitle className="mb-4">
        {formatMessage(salesLeadDeliveryPageMessages.salesLeadLimitConfirmationModelPage.exceededLimitTitle)}
      </StyledModalTitle>
      <Form layout="vertical" colon={false} hideRequiredMark onFinish={handleSubmit}>
        <StyledFormItem className="text-left">
          <span>
            {formatMessage(salesLeadDeliveryPageMessages.salesLeadLimitConfirmationModelPage.dispatchTargetInfo, {
              managerName,
              managerEmail,
              currentHoldingsCount,
            })}
          </span>
        </StyledFormItem>
        <StyledFormItem className="text-left">
          <span>
            {formatMessage(salesLeadDeliveryPageMessages.salesLeadLimitConfirmationModelPage.dispatchConfirmationPart1)}{' '}
            <StyledHighlightedNumber>{anticipatedDispatchCount}</StyledHighlightedNumber>{' '}
            {formatMessage(salesLeadDeliveryPageMessages.salesLeadLimitConfirmationModelPage.dispatchConfirmationPart2)}{' '}
            <StyledHighlightedNumber>{totalAfterDispatch}</StyledHighlightedNumber>{' '}
            {formatMessage(salesLeadDeliveryPageMessages.salesLeadLimitConfirmationModelPage.dispatchConfirmationPart3)}
          </span>
        </StyledFormItem>
        <Form.Item className="text-right">
          <Button onClick={() => setVisible(false)} className="mr-2">
            {formatMessage(salesLeadDeliveryPageMessages.salesLeadLimitConfirmationModelPage.backButton)}
          </Button>
          <Button type="primary" htmlType="submit" loading={loading}>
            {formatMessage(salesLeadDeliveryPageMessages.salesLeadLimitConfirmationModelPage.dispatchButton)}
          </Button>
        </Form.Item>
      </Form>
    </StyledModal>
  )
}

export default SalesLeadLimitConfirmModel

import { gql, useLazyQuery, useMutation } from '@apollo/client'
import { Button, Form, Modal } from 'antd'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import hasura from '../../hasura'
import { commonMessages } from '../../helpers/translation'

interface ConfirmationData {
  managerId: string
  actionCount: number
}

interface SalesLeadLimitConfirmModelProps {
  visible: boolean
  setVisible: React.Dispatch<React.SetStateAction<boolean>>
  setCurrentStep: React.Dispatch<React.SetStateAction<number>>
  onConfirm: () => void
  anticipatedDispatchCount: number
  confirmationData: any
}

const StyledModalTitle = styled.div`
  color: var(--gray);
  font-size: 20px;
  font-weight: bold;
`

const StyledDeleteButton = styled(Button)`
  background-color: var(--gray-darker);
  color: white;
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
  console.log(confirmationData)
  const [loading, setLoading] = useState(false)

  const { currentUserRole, authToken } = useAuth()

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

  const [updateLeadManager] = useMutation<hasura.UPDATE_LEAD_MANAGER, hasura.UPDATE_LEAD_MANAGERVariables>(
    UPDATE_LEAD_MANAGER,
  )

  const GET_LEAD_CANDIDATES = gql`
    query GET_LEAD_CANDIDATES($condition: member_bool_exp, $limit: Int!) {
      member(where: $condition, limit: $limit) {
        id
      }
    }
  `

  const [getLeadManager] = useLazyQuery<hasura.GET_LEAD_CANDIDATES, hasura.GET_LEAD_CANDIDATESVariables>(
    GET_LEAD_CANDIDATES,
    { fetchPolicy: 'no-cache' },
  )

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
      width={384}
    >
      <StyledModalTitle className="mb-4">已超出名單上限</StyledModalTitle>
      <Form layout="vertical" colon={false} hideRequiredMark onFinish={handleSubmit}>
        <Form.Item className="text-left">
          <span>{`派發對象 ${managerName}（${managerEmail}），目前已持有 ${currentHoldingsCount} 筆名單`}</span>
        </Form.Item>
        <Form.Item className="text-left">
          <span>
            你預計再派發 {anticipatedDispatchCount} 筆名單給他，派發後將會超出上限數量，總計達到 {totalAfterDispatch}{' '}
            筆，確定要派發嗎？
          </span>
        </Form.Item>
        <Form.Item className="text-right">
          <Button onClick={() => setVisible(false)} className="mr-2">
            {formatMessage(commonMessages.ui.back)}
          </Button>
          <StyledDeleteButton htmlType="submit" loading={loading}>
            派發
          </StyledDeleteButton>
        </Form.Item>
      </Form>
    </StyledModal>
  )
}

export default SalesLeadLimitConfirmModel

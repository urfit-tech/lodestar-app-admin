import Icon from '@ant-design/icons'
import { Button, Popover, Tree } from 'antd'
import { DataNode } from 'antd/lib/tree'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import { memberMessages } from '../../helpers/translation'
import { ReactComponent as TableIcon } from '../../images/icon/table.svg'

const StyledButton = styled(Button)`
  && {
    color: var(--gray-darker);
  }
`
const StyledOverlay = styled.div`
  padding: 1rem;
  width: 20rem;
  max-height: 25rem;
  overflow: auto;
  background: white;
  border-radius: 4px;
  box-shadow: 0 5px 10px 0 var(--black-10);
`
const OverlayTitle = styled.div`
  margin-bottom: 0.75rem;
  color: var(--gray-dark);
  font-size: 14px;
`

const MemberContractFieldSelector: React.FC<{
  value: string[]
  onChange?: (value: string[]) => void
}> = ({ value, onChange }) => {
  const { formatMessage } = useIntl()

  const treeData: DataNode[] = [
    {
      title: '學生資料',
      key: 'member_data',
      children: [
        { title: '學生姓名/Email', key: 'member' },
        { title: '學生證明', key: 'studentCertification' },
        { title: '承辦人', key: 'managerName' },
      ],
    },
    {
      title: '合約資料',
      key: 'contract_data',
      children: [
        { title: '合約編號', key: 'contractId' },
        { title: '服務開始', key: 'startedAt' },
        { title: '合約建立者', key: 'authorName' },
        { title: '經銷單位', key: 'dealer' },
        { title: '訂單金額', key: 'price' },
        { title: '績效金額', key: 'recognizePerformance' },
        { title: '產品', key: 'projectPlanName' },
        { title: '備註', key: 'note' },
        // { title: '成交聯絡紀錄', key: 'memberNotes' },
        { title: '代幣', key: 'coin' },
        { title: '諮詢次數', key: 'appointment' },
        { title: '指定業師', key: 'appointmentCreator' },
        { title: '介紹人', key: 'referralMember' },
      ],
    },
    {
      title: '合約狀態',
      key: 'contract_status',
      children: [
        { title: '狀態', key: 'status' },
        { title: '審核通過日期', key: 'approvedAt' },
        { title: '取消日期', key: 'loanCanceledAt' },
        { title: '提出退費日期', key: 'refundAppliedAt' },
      ],
    },
    {
      title: '付款相關',
      key: 'payment_related',
      children: [
        { title: '付款方式', key: 'paymentMethod' },
        { title: '期數', key: 'installmentPlan' },
        { title: '金流編號', key: 'paymentNumber' },
        { title: '業務分潤', key: 'orderExecutors' },
      ],
    },
    {
      title: '廣告行銷',
      key: 'marketing_related',
      children: [
        { title: '最後填單行銷活動', key: 'lastActivity' },
        { title: '最後填單廣告組合', key: 'lastAdPackage' },
        { title: '最後填單廣告素材', key: 'lastAdMaterial' },
        { title: '會員建立日期', key: 'memberCreatedAt' },
        { title: '首次填單日期', key: 'firstFilledAt' },
        { title: '最後填單日期', key: 'lastFilledAt' },
        { title: '來源網址', key: 'sourceUrl' },
      ],
    },
  ]

  return (
    <Popover
      trigger="click"
      placement="bottomLeft"
      content={
        <StyledOverlay>
          <OverlayTitle>{formatMessage(memberMessages.label.fieldVisible)}</OverlayTitle>
          <Tree
            multiple
            checkable
            selectable={false}
            treeData={treeData}
            defaultCheckedKeys={value}
            onCheck={value => onChange?.(['agreedAt', 'revokedAt', ...(value as string[])])}
          />
        </StyledOverlay>
      }
    >
      <StyledButton type="link" icon={<Icon component={() => <TableIcon />} />} className="mr-2">
        {formatMessage(memberMessages.label.field)}
      </StyledButton>
    </Popover>
  )
}

export default MemberContractFieldSelector

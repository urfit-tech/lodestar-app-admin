import { ArrowLeftOutlined } from '@ant-design/icons'
import { Button, Layout } from 'antd'
import { useIntl } from 'react-intl'
import { Link } from 'react-router-dom'
import { ContractInfo } from '.'
import { AdminHeader } from '../../components/admin'
import { StyledLayoutContent } from '../../components/layout/DefaultLayout'
import bgBackground from '../../images/default/bg-background.png'
import pageMessages from '../translation'

const ContractLayout: React.FC<{ member: ContractInfo['member']; isMemberTypeBG: boolean }> = ({
  member,
  isMemberTypeBG,
  children,
}) => {
  const { formatMessage } = useIntl()
  return (
    <>
      <AdminHeader>
        <Link to={`/members/${member.id}/contract`}>
          <Button type="link" className="mr-3">
            <ArrowLeftOutlined />
          </Button>
        </Link>

        <a href={`/admin/members/${member.id}/order`} rel="noopener noreferrer">
          <Button>{formatMessage(pageMessages.ContractLayout.memberOrderHistory)}</Button>
        </a>
      </AdminHeader>
      <Layout>
        <StyledLayoutContent>
          <div
            style={{
              backgroundImage: isMemberTypeBG ? `url(${bgBackground})` : undefined,
            }}
          >
            {children}
          </div>
        </StyledLayoutContent>
      </Layout>
    </>
  )
}

export default ContractLayout

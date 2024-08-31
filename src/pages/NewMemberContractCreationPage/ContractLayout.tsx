import { ArrowLeftOutlined } from '@ant-design/icons'
import { Button, Layout } from 'antd'
import { Link } from 'react-router-dom'
import { ContractInfo } from '.'
import { AdminHeader } from '../../components/admin'
import { StyledLayoutContent } from '../../components/layout/DefaultLayout'
import bgBackground from '../../images/default/bg-background.png'

const ContractLayout: React.FC<{ member: ContractInfo['member'] }> = ({ member, children }) => {
  return (
    <>
      <AdminHeader>
        <Link to={`/members/${member.id}/contract`}>
          <Button type="link" className="mr-3">
            <ArrowLeftOutlined />
          </Button>
        </Link>

        <a href={`/admin/members/${member.id}/order`} rel="noopener noreferrer">
          <Button>會員訂單紀錄</Button>
        </a>
      </AdminHeader>
      <Layout>
        <StyledLayoutContent>
          <div
            style={{
              backgroundImage: member.isBG ? `url(${bgBackground})` : undefined,
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

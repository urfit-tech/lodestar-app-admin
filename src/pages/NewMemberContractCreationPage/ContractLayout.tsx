import { ArrowLeftOutlined } from '@ant-design/icons'
import { Button, Layout } from 'antd'
import { Link } from 'react-router-dom'
import { AdminHeader } from '../../components/admin'
import { StyledLayoutContent } from '../../components/layout/DefaultLayout'

const ContractLayout: React.FC<{ memberId: string; categories: string[] }> = ({ memberId, categories, children }) => {
  return (
    <>
      <AdminHeader>
        <Link to={`/members/${memberId}/contract`}>
          <Button type="link" className="mr-3">
            <ArrowLeftOutlined />
          </Button>
        </Link>

        <a href={`/admin/members/${memberId}/order`} rel="noopener noreferrer">
          <Button>會員訂單紀錄</Button>
        </a>
      </AdminHeader>
      <Layout>
        <StyledLayoutContent>
          <div
            style={{
              background: categories.some(c => ['B', 'G'].some(v => c.startsWith(v)))
                ? 'linear-gradient(to bottom, rgba(0, 0, 0, 0), rgba(0, 0, 0, 1))'
                : undefined,
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

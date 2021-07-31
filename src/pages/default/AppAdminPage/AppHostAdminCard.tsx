import { CardProps } from 'antd/lib/card'
import AdminCard from '../../../components/admin/AdminCard'

type AppHostAdminCardProps = CardProps
const AppHostAdminCard: React.VFC<AppHostAdminCardProps> = ({ ...cardProps }) => {
  return <AdminCard {...cardProps}>App Host Card</AdminCard>
}

export default AppHostAdminCard

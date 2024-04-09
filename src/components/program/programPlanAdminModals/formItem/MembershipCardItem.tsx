import { gql, useQuery } from '@apollo/client'
import { Form, Select } from 'antd'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import { useEffect, useState } from 'react'
import { useIntl } from 'react-intl'
import programMessages from '../../translation'

const { Option } = Select

interface MembershipCardType {
  label?: string
  name: string
  membershipId: string | undefined
  getMembershipCardTitle?: React.Dispatch<React.SetStateAction<string>>
}

interface cardType {
  id: string
  title: string
}

const GET_CARD_TITLE_BY_APPID = gql`
  query GET_CARD_TITLE_BY_APPID($appId: String) {
    card(where: { app_id: { _eq: $appId } }) {
      title
      id
    }
  }
`

const GET_CARD_TITLE_BY_ID = gql`
  query GET_CARD_TITLE_BY_ID($id: uuid) {
    card(where: { id: { _eq: $id } }) {
      title
    }
  }
`
const MembershipCard: React.FC<MembershipCardType> = ({ label, name, membershipId, getMembershipCardTitle }) => {
  const { formatMessage } = useIntl()
  const app = useApp()
  const _label = label ? label : formatMessage(programMessages.ProgramPlanAdminModal.identityMembership)
  const [card, setCard] = useState<cardType[]>([])
  const [placeholder, setPlaceholder] = useState('選擇會員卡')

  const { loading: loadingByAppId, data: dataByAppId } = useQuery(GET_CARD_TITLE_BY_APPID, {
    variables: { appId: app.id },
  })

  const { loading: loadingById, data: dataById } = useQuery(GET_CARD_TITLE_BY_ID, {
    variables: { id: membershipId },
  })

  useEffect(() => {
    !loadingByAppId && setCard(dataByAppId?.card.map((item: cardType) => item))

    if (!loadingById && membershipId) {
      setPlaceholder(dataById?.card[0].title)
      getMembershipCardTitle && getMembershipCardTitle(dataById?.card[0].title)
    }
  }, [dataByAppId?.card, dataById?.card, getMembershipCardTitle, loadingByAppId, loadingById, membershipId])

  return (
    <>
      <Form.Item label={_label} name={name} rules={[{ required: true, message: '請選擇一個會員卡' }]}>
        <Select placeholder={placeholder}>
          {card.map(item => (
            <Option value={item.id} key={item.id}>
              {item.title}
            </Option>
          ))}
        </Select>
      </Form.Item>
    </>
  )
}

export default MembershipCard

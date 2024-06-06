import { Form, Select } from 'antd'
import { useIntl } from 'react-intl'
import { commonMessages, errorMessages } from '../../../../helpers/translation'
import { useMembershipCardByAppId } from '../../../../hooks/programPlan'
import { MembershipItemProps } from '../../../../types/programPlan'
import programMessages from '../../translation'

const { Option } = Select

const MembershipItem: React.FC<MembershipItemProps> = ({ name, membershipId }) => {
  const { formatMessage } = useIntl()
  const { membershipCards } = useMembershipCardByAppId()

  return (
    <Form.Item
      label={formatMessage(programMessages.ProgramPlanAdminModal.identityMembership)}
      name={name}
      rules={[
        {
          required: true,
          message: formatMessage(errorMessages.form.selectIsRequired, {
            field: formatMessage(commonMessages.product.card),
          }),
        },
      ]}
      initialValue={membershipId}
    >
      <Select placeholder={formatMessage(programMessages.ProgramPlanAdminModal.selectMembershipCard)}>
        {membershipCards.map(card => (
          <Option value={card.id} key={card.id}>
            {card.title}
          </Option>
        ))}
      </Select>
    </Form.Item>
  )
}

export default MembershipItem

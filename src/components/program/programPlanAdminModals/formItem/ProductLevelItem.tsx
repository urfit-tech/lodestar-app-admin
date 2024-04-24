import { Spinner } from '@chakra-ui/react'
import { Form, InputNumber } from 'antd'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import { useIntl } from 'react-intl'
import { useProductLevel } from '../../../../hooks/data'
import programMessages from '../../translation'

interface ParticipantsProps {
  label?: string
  name: string
  programPlanId: string | undefined
}

const ParticipantsItem: React.FC<ParticipantsProps> = ({ label, name, programPlanId }) => {
  const { enabledModules } = useApp()
  const { loading: loadingProductLevel, productLevel } = useProductLevel(`ProgramPlan_${programPlanId}`)

  const { formatMessage } = useIntl()
  const _label = label ? label : formatMessage(programMessages.ProgramPlanAdminModal.productLevel)

  return (
    <>
      {enabledModules.product_level ? (
        loadingProductLevel ? (
          <Spinner />
        ) : (
          <Form.Item label={_label} name={name} initialValue={productLevel}>
            <InputNumber />
          </Form.Item>
        )
      ) : null}
    </>
  )
}

export default ParticipantsItem

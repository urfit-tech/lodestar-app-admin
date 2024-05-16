import { PlusOutlined } from '@ant-design/icons'
import { Button } from 'antd'

const ModalTriggerButton: React.FC<{
  title: string
  onOpen?: () => void
  onClose?: () => void
}> = ({ title, onOpen }) => {
  return (
    <div className="d-flex mb-4">
      <Button icon={<PlusOutlined />} type="primary" className="mr-2" onClick={() => onOpen?.()}>
        {title}
      </Button>
    </div>
  )
}

export default ModalTriggerButton

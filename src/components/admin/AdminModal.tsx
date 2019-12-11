import { Modal } from 'antd'
import { ModalProps } from 'antd/lib/modal'
import React, { useState } from 'react'
import styled from 'styled-components'
import { rgba } from '../../helpers'

const StyledIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.25rem;
  width: 50px;
  height: 50px;
  background: ${props => rgba(props.theme['@primary-color'], 0.1)};
  color: ${props => props.theme['@primary-color']};
  font-size: 24px;
  border-radius: 50%;
`
const StyledTitle = styled.h1`
  margin-bottom: 1.5rem;
  color: var(--gray-darker);
  font-size: 20px;
  font-weight: bold;
  line-height: 1.3;
  letter-spacing: 0.77;
`

export type AdminModalProps = ModalProps & {
  renderTrigger: React.FC<{
    setVisible: React.Dispatch<React.SetStateAction<boolean>>
  }>
  icon?: React.ReactNode
  renderFooter?: React.FC<{
    setVisible: React.Dispatch<React.SetStateAction<boolean>>
  }>
}
const AdminModal: React.FC<AdminModalProps> = ({
  title,
  footer,
  renderTrigger,
  renderFooter,
  children,
  icon,
  onCancel,
  ...ModalProps
}) => {
  const [visible, setVisible] = useState(false)

  return (
    <>
      {renderTrigger({ setVisible })}

      <Modal
        title={null}
        footer={null}
        centered
        destroyOnClose
        visible={visible}
        onCancel={e => {
          onCancel && onCancel(e)
          setVisible(false)
        }}
        {...ModalProps}
      >
        {icon && <StyledIcon>{icon}</StyledIcon>}
        {title && <StyledTitle>{title}</StyledTitle>}
        {children}

        <div className="text-right">{renderFooter && renderFooter({ setVisible })}</div>
      </Modal>
    </>
  )
}

export default AdminModal

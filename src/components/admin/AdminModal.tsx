import { Modal } from 'antd'
import { ModalProps } from 'antd/lib/modal'
import React, { useState } from 'react'
import styled from 'styled-components'
import { rgba } from '../../helpers'

const StyledModal = styled(Modal)`
  .ant-modal-footer {
    border-top: 0;
    padding: 1.5rem;
    padding-top: 0;
  }
`
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
  renderTrigger?: React.FC<{
    setVisible: React.Dispatch<React.SetStateAction<boolean>>
  }>
  icon?: React.ReactNode
  renderFooter?: React.FC<{
    setVisible: React.Dispatch<React.SetStateAction<boolean>>
  }>
}
const AdminModal: React.FC<AdminModalProps> = ({
  title,
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
      {renderTrigger?.({ setVisible })}

      <StyledModal
        title={null}
        centered
        destroyOnClose
        visible={visible}
        onCancel={e => {
          onCancel?.(e)
          setVisible(false)
        }}
        {...ModalProps}
      >
        {icon && <StyledIcon>{icon}</StyledIcon>}
        {title && <StyledTitle>{title}</StyledTitle>}
        {children}
        {renderFooter && <div className="text-right">{renderFooter({ setVisible })}</div>}
      </StyledModal>
    </>
  )
}

export default AdminModal

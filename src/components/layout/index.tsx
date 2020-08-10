import { Form } from 'antd'
import styled from 'styled-components'
import settings from '../../settings'

export const footerHeight = settings.footer.type === 'multiline' ? 108 : 53

export const StyledContent = styled.div<{ noFooter?: boolean; white?: boolean }>`
  min-width: 240px;
  height: calc(100vh - 64px - ${props => (props.noFooter ? 0 : footerHeight)}px);
  overflow-y: auto;
  overflow-x: hidden;
  ${props => (props.white ? 'background: white;' : '')}
`

export const StyledForm = styled(Form)`
  .ant-row {
    display: flex;
    align-items: center;
    flex-direction: column;
  }

  @media (min-width: 768px) {
    .ant-row {
      flex-direction: row;
    }
  }
`

import { useIntl } from 'react-intl'
import styled from 'styled-components'
import { LockIcon } from '../../images/icon'
import commonMessages from './translation'

const StyledCover = styled.div`
  background-color: rgba(255, 255, 255, 0.8);
  position: absolute;
  z-index: 2;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;

  .unauth__label {
    display: flex;
    background-color: #f7f8f8;
    padding: 8px 12px;
    border-radius: 18px;

    span {
      font-size: 14px;
      font-family: NotoSans;
      font-weight: 500;
      color: var(--gray-dark);
    }
  }
`

const UnAuthCover: React.VFC<{}> = () => {
  const { formatMessage } = useIntl()

  return (
    <StyledCover>
      <div className="unauth__label">
        <LockIcon className="mr-2" />
        <span>{formatMessage(commonMessages.UnAuthCover.unAuth)}</span>
      </div>
    </StyledCover>
  )
}

export default UnAuthCover

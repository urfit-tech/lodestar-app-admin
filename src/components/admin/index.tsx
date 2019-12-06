import styled from 'styled-components'

export const AdminHeader = styled.header`
  padding: 0 0.5rem;
  height: 64px;
  background: white;

  a:first-child {
    margin-left: 0.75rem;
  }

  .anticon {
    color: var(--gray-darker);
    font-size: 20px;
  }
`
export const AdminHeaderTitle = styled.div`
  color: var(--gray-darker);
  font-size: 16px;
  font-weight: bold;
  letter-spacing: 0.2px;
`
export const AdminTabBarWrapper = styled.div`
  background: white;

  .ant-tabs-nav-scroll {
    text-align: center;
  }
`

export const AdminPaneTitle = styled.h1`
  margin-bottom: 2.5rem;
  color: var(--gray-darker);
  font-size: 24px;
  font-weight: bold;
  letter-spacing: 0.2px;
`
export const AdminBlock = styled.div`
  margin-bottom: 1.25rem;
  padding: 2.5rem;
  background: white;
  border-radius: 4px;
  box-shadow: 0 4px 12px 0 rgba(0, 0, 0, 0.06);
`
export const AdminBlockTitle = styled.h2`
  margin-bottom: 2.5rem;
  color: var(--gray-darker);
  font-size: 18px;
  font-weight: bold;
  letter-spacing: 0.8px;
`
export const AdminBlockSubTitle = styled.div`
  color: var(--gray-dark);
  font-size: 14px;
  letter-spacing: 0.4px;
`
export const StyledTips = styled.div`
  font-size: 12px;
  letter-spacing: 0.58px;
  white-space: pre-line;
`

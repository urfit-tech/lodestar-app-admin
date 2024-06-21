import { InputNumber, Select } from 'antd'
import { SketchPicker } from 'react-color'
import styled from 'styled-components'
import { MemberTaskProps } from '../../types/member'

export const AdminPageTitle = styled.h1`
  display: flex;
  color: var(--gray-darker);
  font-size: 24px;
  font-weight: bold;
  line-height: 1;
  letter-spacing: 0.2px;
`
export const AdminPageBlock = styled.div`
  overflow: auto;
  padding: 2.5rem;
  background-color: white;
  border-radius: 4px;
  box-shadow: 0 4px 12px 0 rgba(0, 0, 0, 0.06);
`

export const AdminHeader = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1.5rem;
  height: 64px;
  background: white;

  > a .ant-btn {
    line-height: 1;
  }

  .anticon {
    color: var(--gray-darker);
    font-size: 20px;
  }
`
export const AdminHeaderTitle = styled.div`
  flex-grow: 1;
  color: var(--gray-darker);
  font-size: 16px;
  font-weight: bold;
  letter-spacing: 0.2px;
`
export const AdminTabBarWrapper = styled.div`
  background: white;

  .ant-tabs-nav-wrap {
    justify-content: center;
  }
`

export const AdminPaneTitle = styled.h1`
  margin-bottom: 2.5rem;
  color: var(--gray-darker);
  font-size: 24px;
  font-weight: bold;
  letter-spacing: 0.2px;
`
export const AdminPaneDescription = styled.div`
  color: var(--gray-darker);
  font-size: 14px;
  white-space: pre-line;
`
export const AdminBlock = styled.div`
  margin-bottom: 1.25rem;
  padding: 2rem;
  background: white;
  border-radius: 4px;
  box-shadow: 0 4px 12px 0 rgba(0, 0, 0, 0.06);
  overflow: scroll;
`
export const AdminBlockTitle = styled.h2`
  margin-bottom: 2rem;
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
export const AdminBlockDescription = styled.div`
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 0.4px;
  color: var(--gray-darker);
  margin-bottom: 20px;
`

export const EmptyBlock = styled.div`
  padding: 12.5rem 0;
  color: var(--gray-dark);
  font-size: 14px;
  text-align: center;
`

export const StyledTips = styled.div`
  font-size: 12px;
  letter-spacing: 0.58px;
  white-space: pre-line;
`
export const StyledSelect = styled(Select)`
  && {
    width: auto;
  }

  .ant-select-selection-selected-value {
    margin-right: 0.5rem;
  }
`
export const MemberTaskTag = styled.span<{ variant: MemberTaskProps['priority'] | MemberTaskProps['status'] }>`
  padding: 2px 6px;
  color: var(--gray-darker);
  font-size: 14px;
  background: ${props =>
    props.variant === 'high'
      ? '#ffcfd4'
      : props.variant === 'medium'
      ? '#fedfd1'
      : props.variant === 'low'
      ? 'rgba(255, 190, 30, 0.2)'
      : props.variant === 'pending'
      ? '#e6e6e4'
      : props.variant === 'in-progress'
      ? '#e1d5f9'
      : props.variant === 'done'
      ? '#cee7e1'
      : ''};
  border-radius: 2px;
  line-height: 2rem;
`

export const StyledInputNumber = styled(InputNumber)`
  width: 100% !important;
`
export const StyledFullWidthSelect = styled(Select)`
  && {
    width: 100%;
  }

  .ant-select-selection-selected-value {
    margin-right: 0.5rem;
  }
`
export const StyledSketchPicker = styled(SketchPicker)`
  width: auto !important;
`
export const StyleCircleColorInput = styled.div<{ background: string }>`
  background-color: ${props => props.background};
  border-radius: 50%;
  width: 16px;
  height: 16px;
  border: 1px solid #d8d8d8;
`

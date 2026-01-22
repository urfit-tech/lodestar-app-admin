import { Card, Collapse } from 'antd'
import styled from 'styled-components'

export const ScheduleCard = styled(Card)`
  .ant-card-head {
    min-height: 40px;
    padding: 0 16px;
  }

  .ant-card-head-title {
    padding: 12px 0;
    font-size: 14px;
    font-weight: 500;
  }

  .ant-card-body {
    padding: 16px;
    font-size: 14px;
    overflow: auto;
  }
`

export const CollapsibleScheduleCard = styled(Collapse)`
  user-select: none;

  &.ant-collapse {
    border: 1px solid #f0f0f0;
  }

  &.ant-collapse > .ant-collapse-item {
    border-bottom: none;
  }

  .ant-collapse-header {
    font-size: 14px;
    font-weight: 500;
    background-color: white;
    border: none !important;
  }

  .ant-collapse-content {
    border-top: 1px solid #f0f0f0;
  }

  .ant-collapse-content-box {
    border-top: none;
    background-color: white;
  }
`

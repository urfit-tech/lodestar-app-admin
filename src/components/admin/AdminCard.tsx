import { Card } from 'antd'
import styled, { css } from 'styled-components'

const AdminCard = styled(Card)<{ variant?: string }>`
  position: relative;
  box-shadow: 0 4px 12px 0 rgba(0, 0, 0, 0.06);

  &.mask::after {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    content: ' ';
    background: rgba(256, 256, 256, 0.6);
  }

  .ant-card-meta-title {
    white-space: normal;
  }

  ${props =>
    props.variant === 'program' &&
    css`
      overflow: hidden;

      .ant-card-body {
        height: 12rem;
      }

      .ant-card-meta {
        height: 100%;
      }

      .ant-card-meta-detail {
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
      }

      .ant-card-meta-title {
        height: 42px;

        h1 {
          font-size: 18px;
        }
      }

      .ant-card-meta-description {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        flex-grow: 1;

        .ant-typography {
          color: #9b9b9b;
        }
      }
    `}

  ${props =>
    props.variant === 'projectPlan' &&
    css`
      overflow: hidden;

      .ant-card-body {
        min-height: 18rem;
      }

      .ant-card-meta {
        height: 100%;
      }
      .ant-typography {
        p {
          line-height: 24px;
        }
      }
    `}
`

export default AdminCard

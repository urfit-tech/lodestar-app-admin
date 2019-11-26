import { Button } from 'antd'
import React from 'react'
import styled from 'styled-components'
import { BREAK_POINT } from '../../components/common/Responsive'
import BlurredBanner from '../common/BlurredBanner'

const StyledTitleBlock = styled.div<{ withChildren?: boolean }>`
  position: relative;
  padding: ${props => (props.withChildren ? '4rem 0 2rem' : '10rem 0')};
  color: white;
`
const StyledExtraBlock = styled.div`
  position: relative;
  margin-bottom: -1px;
  padding: 2px;
  background: linear-gradient(to bottom, transparent 60%, white 60%);
`
const StyledTitle = styled.h1`
  color: white;
  font-size: 40px;
  font-weight: bold;
  line-height: 1;
  letter-spacing: 1px;

  .categories {
    margin-bottom: 12px;

    .category {
      letter-spacing: 0.8px;
      margin-right: 20px;
      font-size: 14px;
      font-weight: 500;

      &::before {
        margin-right: 2px;
        content: '#';
      }
    }
  }

  @media (max-width: ${BREAK_POINT}px) {
    .category {
      span {
        margin-right: 20px;
      }
    }
  }
`
const StyledQRCode = styled.div`
  img {
    width: 291px;
    height: 291px;
    box-shadow: 0 2px 21px 0 rgba(0, 0, 0, 0.15);
  }
`

type ActivityBannerProps = {
  coverImage?: string
  activityCategories: {
    category: {
      id: string
      name: string
    }
  }[]
  activityTitle: string
}

const ActivityBanner: React.FC<ActivityBannerProps> = ({ coverImage, activityCategories, activityTitle, children }) => {
  return (
    <BlurredBanner coverUrl={coverImage}>
      <StyledTitleBlock withChildren={!!children} className="text-center">
        <div className="categories">
          {activityCategories.map(activityCategory => (
            <span className="category" key={activityCategory.category.id}>
              {activityCategory.category.name}
            </span>
          ))}
        </div>
        <StyledTitle className="m-0">{activityTitle}</StyledTitle>
      </StyledTitleBlock>

      {children && (
        <StyledExtraBlock className="text-center">
          <StyledQRCode className="mb-4">{children}</StyledQRCode>
          <Button type="link" onClick={() => window.print()}>
            列印
          </Button>
        </StyledExtraBlock>
      )}
    </BlurredBanner>
  )
}

export default ActivityBanner

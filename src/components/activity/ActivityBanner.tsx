import { Button } from 'antd'
import React from 'react'
import styled from 'styled-components'
import { BREAK_POINT } from '../../components/common/Responsive'

const StyledBanner = styled.div`
  position: relative;
  overflow: hidden;
  text-align: center;

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
const BlurredBackgroundWrapper = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  transform: scale(1.1);
`
const BlurredBackground = styled.div<{ coverUrl: string }>`
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  background-image: url(${props => props.coverUrl});
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  filter: blur(6px);
`
const StyledTitleBlock = styled.div<{ withChildren?: boolean }>`
  position: relative;
  padding: ${props => (props.withChildren ? '4rem 0 2rem' : '10rem 0')};
  background-color: rgba(0, 0, 0, 0.6);
  color: white;
`
const StyledExtraBlock = styled.div`
  position: relative;
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.6) 60%, white 60%);
`
const StyledTitle = styled.h1`
  color: white;
  font-size: 40px;
  font-weight: bold;
  line-height: 1;
  letter-spacing: 1px;
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
    <StyledBanner className="text-center">
      <BlurredBackgroundWrapper>
        <BlurredBackground coverUrl={coverImage || ''} />
      </BlurredBackgroundWrapper>

      <StyledTitleBlock withChildren={!!children}>
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
        <StyledExtraBlock>
          <StyledQRCode className="mb-4">{children}</StyledQRCode>
          <Button type="link" onClick={() => window.print()}>
            列印
          </Button>
        </StyledExtraBlock>
      )}
    </StyledBanner>
  )
}

export default ActivityBanner

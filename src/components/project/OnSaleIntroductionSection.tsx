import React from 'react'
import styled from 'styled-components'

type OnSaleIntroductionSectionProp = {
  introduction: string
}

const StyleSection = styled.section`
  .introduction {
    position: relative;
    background-color: #47293d;
    .wrapper {
      color: white;
      padding: 80px 0;
    }
    .decoration {
      display: none;
    }
    .feature {
      height: 260px;
      margin-bottom: 40px;
      h4 {
        width: 206px;
        font-size: 16px;
        font-weight: 500;
        letter-spacing: 0.2px;
        text-align: center;
        color: #ffffff;
      }
    }
    .slogan {
      h3 span {
        display: block;
        text-align: center;
        color: #ffffff;
        font-size: 28px;
      }
      p {
        margin: 54px auto 64px;
        height: 50px;
        line-height: 50px;
        background-color: #ffc129;
        color: #47293d;
        text-align: center;
        font-size: 16px;
        font-weight: bold;
        letter-spacing: 0.77px;
        color: #47293d;
      }
    }
    .button {
      display: none;
      margin: 0 auto;
      width: 177px;
      height: 44px;
      line-height: 44px;
      border-radius: 4px;
      background-color: #ff5760;
      font-size: 16px;
      font-weight: 500;
      text-align: center;
      color: white;

      &:hover {
        cursor: pointer;
      }
    }
  }

  @media (min-width: 992px) {
    .introduction {
      display: flex;
      margin: 0;
      height: 1256px;
      align-items: center;
      .decoration {
        display: block;
        position: absolute;
        &.left {
          bottom: 10px;
          left: 48px;
          width: 338px;
        }
        &.right {
          bottom: 145px;
          right: 0;
          width: 397px;
        }
      }
      .slogan {
        h3 span {
          font-size: 40px;
        }
        p {
          width: 360px;
          font-size: 20px;
        }
      }
      .feature {
        height: auto;
        img {
          margin-bottom: 20px;
        }
      }
      .button {
        display: block;
      }
    }
  }
`

const OnSaleIntroductionSection: React.FC<OnSaleIntroductionSectionProp> = ({ introduction }) => (
  <StyleSection>
    <div dangerouslySetInnerHTML={{ __html: introduction }}></div>
  </StyleSection>
)

export default OnSaleIntroductionSection

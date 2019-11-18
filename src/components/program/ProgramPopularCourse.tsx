import { Button, Typography } from 'antd'
import React from 'react'
import { Link } from 'react-router-dom'
import styled from 'styled-components'

const StyledSection = styled.div`
  margin: 0px auto 24px auto;
  overflow: hidden;
  background: url(${props => props.color});
  background-position: center;
  background-size: cover;
  position: relative;
  &::before {
    content: ' ';
    background-image: linear-gradient(to bottom, rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.8));
    width: 100%;
    left: 0;
    position: absolute;
    top: 0;
    height: 100%;
  }
`
const StyleBlock = styled.div`
  position: relative;
  padding: 25px;
  letter-spacing: 0.84px;
  text-align: left;
  height: 100%;
  @media (min-width: 768px) {
    padding: 40px;
    min-height: 253px;
  }
`
const StyledParagraph = styled.p`
  color: #b2b2b2;
  width: 90%;
  margin-top: 20px;
  margin-bottom: 40px;
  @media (max-width: 991px) {
    letter-spacing: 0.4px;
    margin-bottom: 0;
    width: 100%;
    font-size: 14px;
    font-weight: 500;
    color: #b2b2b2;
  }
`
const StyledLine = styled.div`
  border-bottom: solid 1px #16a4db;
  /* width: 75%; */
  flex: 1;
  margin-right: 20px;
  @media (max-width: 1199px) {
    width: 68%;
  }
  @media (max-width: 991px) {
    display: none;
  }
`
const StyledNumber = styled.p`
  font-size: 24px;
  text-align: right;
  margin-bottom: 0px;
  color: #16a4da;
  @media (max-width: 991px) {
    display: none;
  }
`

const StyledButton = styled(Button)`
  position: initial;
  transition: all 0.5s;
  &:hover {
    border: #16a4da;
    background: #fff;
    color: #16a4da;
  }
  @media (max-width: 991px) {
    margin-top: 60px;
  }
`

const P = styled.p`
  margin-bottom: 0;
  font-size: 14px;
  @media (max-width: 991px) {
    display: none;
  }
`

const ProgramPopularCourse: React.FC<{
  number: string
  background: string
  title: string
  paragraph: string
  link: string
}> = ({ background, number, title, paragraph, link }) => {
  return (
    <StyledSection color={background}>
      <StyleBlock>
        <Typography.Title level={4} className="white">
          {title}
        </Typography.Title>
        <StyledParagraph>{paragraph}</StyledParagraph>
        <Link to={link}>
          <StyledButton type="danger" style={{ width: 142, height: 44, fontSize: '14px' }}>
            查看課程
          </StyledButton>
        </Link>
        <StyledNumber>{number}</StyledNumber>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <StyledLine />
          <P style={{ color: '#16a4da' }}>線上課程</P>
        </div>
      </StyleBlock>
    </StyledSection>
  )
}

export default ProgramPopularCourse

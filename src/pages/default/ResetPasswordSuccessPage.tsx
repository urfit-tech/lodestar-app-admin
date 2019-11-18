import React from 'react'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import DefaultLayout from '../../components/layout/DefaultLayout'

const StyledContainer = styled.div`
  padding: 4rem 1rem;
  color: #585858;
  text-align: center;
`
const ResetPasswordSuccessPage = () => {
  return (
    <DefaultLayout noFooter centeredBox>
      <StyledContainer>
        <p>已重設您的密碼，請回首頁並重新登入。</p>
        <div>
          <Link to="/">回首頁</Link>
        </div>
      </StyledContainer>
    </DefaultLayout>
  )
}

export default ResetPasswordSuccessPage

import React from 'react'
import styled from 'styled-components'
import { NavLinks, SocialLinks, StyledFooter } from '.'
import settings from '../../../settings'
import { BREAK_POINT } from '../Responsive'

const StyledContainer = styled.div`
  @media (min-width: ${BREAK_POINT}px) {
    > :nth-child(1) {
      order: 2;
    }
    > :nth-child(2) {
      order: 1;
    }
  }
`
const StyledLinks = styled.div`
  padding-top: 1.25rem;
`

const DefaultFooter = () => (
  <StyledFooter>
    <div className="divider" />
    <StyledContainer className="container d-flex align-items-center justify-content-center flex-wrap">
      <StyledLinks className="d-flex align-items-center justify-content-center flex-wrap">
        <NavLinks />
        <div className="blank" />
        <SocialLinks />
      </StyledLinks>
      <div className="blank" />
      <div className="py-3 text-center">{settings.footer.copyright}</div>
    </StyledContainer>
  </StyledFooter>
)

export default DefaultFooter

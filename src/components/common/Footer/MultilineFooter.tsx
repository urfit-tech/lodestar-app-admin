import React from 'react'
import styled from 'styled-components'
import { NavLinks, SocialLinks, StyledFooter } from '.'
import settings from '../../../settings'

const StyledLinks = styled.div`
  padding-top: 1.25rem;

  && {
    a {
      font-size: 16px;
    }
  }
`

const MultilineFooter = () => (
  <StyledFooter>
    <div className="divider" />
    <div className="container">
      <StyledLinks className="d-flex align-items-center justify-content-center flex-wrap">
        <NavLinks />
        <div className="blank" />
        <SocialLinks />
      </StyledLinks>
    </div>

    <div className="divider" />
    <div className="py-3 text-center">{settings.footer.copyright || ''}</div>
  </StyledFooter>
)

export default MultilineFooter

import Icon from '@ant-design/icons'
import React from 'react'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import { ReactComponent as FacebookIcon } from '../../../images/icon/facebook.svg'
import { ReactComponent as GroupIcon } from '../../../images/icon/group.svg'
import { ReactComponent as InstagramIcon } from '../../../images/icon/instagram.svg'
import { ReactComponent as YoutubeIcon } from '../../../images/icon/youtube.svg'
import settings from '../../../settings'
import { BREAK_POINT } from '../Responsive'
import DefaultFooter from './DefaultFooter'
import MultilineFooter from './MultilineFooter'

export const StyledFooter = styled.footer`
  background: white;
  color: #9b9b9b;
  font-size: 0.75rem;

  a {
    margin-bottom: 1.25rem;
    color: #9b9b9b;
    font-size: 0.75rem;
    line-height: 1;
  }

  .blank {
    width: 100%;
  }
  .divider {
    border-top: 1px solid #ececec;
  }

  @media (min-width: ${BREAK_POINT}px) {
    .blank {
      width: auto;
      flex-grow: 1;
    }
  }
`
const StyledNavLink = styled(Link)`
  &:not(:first-child) {
    margin-left: 2rem;
  }
`
const StyledNavAnchor = styled.a`
  &:not(:first-child) {
    margin-left: 2rem;
  }
`
const StyledSocialAnchor = styled.a`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border: solid 0.5px #ececec;
  border-radius: 50%;

  &:not(:first-child) {
    margin-left: 0.75rem;
  }

  @media (min-width: ${BREAK_POINT}px) {
    .blank + & {
      margin-left: 2rem;
    }
  }
`

export const NavLinks = () => {
  return (
    <>
      {settings.footer.links.map(navLink =>
        navLink.external ? (
          <StyledNavAnchor key={navLink.label} href={navLink.href} target="_blank">
            {navLink.label}
          </StyledNavAnchor>
        ) : (
          <StyledNavLink key={navLink.label} to={navLink.href}>
            {navLink.label}
          </StyledNavLink>
        ),
      )}
    </>
  )
}

export const SocialLinks = () => {
  return (
    <>
      {settings.footer.socialMedias
        .filter(socialLink => socialLink.label)
        .map(socialLink => (
          <StyledSocialAnchor key={socialLink.label} href={socialLink.href} target="_blank">
            {socialLink.label === 'facebook' && <Icon component={() => <FacebookIcon />} />}
            {socialLink.label === 'group' && <Icon component={() => <GroupIcon />} />}
            {socialLink.label === 'youtube' && <Icon component={() => <YoutubeIcon />} />}
            {socialLink.label === 'instagram' && <Icon component={() => <InstagramIcon />} />}
          </StyledSocialAnchor>
        ))}
    </>
  )
}

const Footer = () => {
  const footerType = settings.footer.type

  if (footerType === 'multiline') {
    return <MultilineFooter />
  }

  return <DefaultFooter />
}

export default Footer

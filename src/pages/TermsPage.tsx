import { Card, Typography } from 'antd'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import React from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import DefaultLayout from '../components/layout/DefaultLayout'
import pageMessages from './translation'

const StyledTitle = styled(Typography.Title)`
  && {
    margin-bottom: 36px;
    font-size: 24px;
    font-weight: bold;
    line-height: 1.3;
    letter-spacing: 0.77px;
  }
`
const StyledSubTitle = styled(Typography.Title)`
  && {
    margin-top: 41px;
    margin-bottom: 13px;
    font-size: 20px;
    font-weight: bold;
  }
`
const StyledCard = styled(Card)`
  && {
    margin-bottom: 20px;
  }

  .ant-card-body {
    padding: 40px;
  }

  p,
  li {
    margin-bottom: 0;
    line-height: 1.69;
    letter-spacing: 0.2px;
  }

  ol {
    padding-left: 50px;
    li {
      padding-left: 16px;
    }
  }
`
const StyledSection = styled.section`
  background: #f7f8f8;
  padding-top: 56px;
  padding-bottom: 80px;
  text-align: justify;

  & > ${StyledTitle} {
    text-align: center;
  }
`

const TermsPage: React.FC = () => {
  const { name } = useApp()
  const { formatMessage } = useIntl()
  return (
    <DefaultLayout>
      <StyledSection>
        <StyledTitle level={1}>{formatMessage(pageMessages.TermsPage.termsOfUse)}</StyledTitle>

        <div className="container">
          <StyledCard>
            <StyledTitle level={2}>{formatMessage(pageMessages.TermsPage.privacyPolicy)}</StyledTitle>

            <StyledSubTitle level={3}>{formatMessage(pageMessages.TermsPage.privacyScope)}</StyledSubTitle>
            <p>{formatMessage(pageMessages.TermsPage.privacyScopeContent)}</p>

            <StyledSubTitle level={3}>{formatMessage(pageMessages.TermsPage.personalDataCollection)}</StyledSubTitle>
            <p>{formatMessage(pageMessages.TermsPage.personalDataCollectionContent1)}</p>
            <p>{formatMessage(pageMessages.TermsPage.personalDataCollectionContent2)}</p>

            <StyledSubTitle level={3}>{formatMessage(pageMessages.TermsPage.externalLinks)}</StyledSubTitle>
            <p>{formatMessage(pageMessages.TermsPage.externalLinksContent)}</p>

            <StyledSubTitle level={3}>{formatMessage(pageMessages.TermsPage.thirdPartyPolicy)}</StyledSubTitle>
            <p>{formatMessage(pageMessages.TermsPage.thirdPartyPolicyContent1)}</p>
            <p>{formatMessage(pageMessages.TermsPage.thirdPartyPolicyContent2, { name: name })}</p>

            <StyledSubTitle level={3}>{formatMessage(pageMessages.TermsPage.cookieUsage)}</StyledSubTitle>
            <p>{formatMessage(pageMessages.TermsPage.cookieUsageContent)}</p>
          </StyledCard>
          <StyledCard>
            <StyledTitle level={2}>{formatMessage(pageMessages.TermsPage.termsOfService)}</StyledTitle>

            <StyledSubTitle level={3}>{formatMessage(pageMessages.TermsPage.agreementTerms)}</StyledSubTitle>
            <p>{formatMessage(pageMessages.TermsPage.agreementTermsContent, { name: name })}</p>

            <StyledSubTitle level={3}>{formatMessage(pageMessages.TermsPage.registrationObligations)}</StyledSubTitle>
            <p>{formatMessage(pageMessages.TermsPage.registrationObligationsContent1)}</p>
            <p>{formatMessage(pageMessages.TermsPage.registrationObligationsContent2)}</p>
            <p>{formatMessage(pageMessages.TermsPage.registrationObligationsContent3)}</p>
            <p>{formatMessage(pageMessages.TermsPage.registrationObligationsContent4)}</p>

            <StyledSubTitle level={3}>{formatMessage(pageMessages.TermsPage.termsAndRegulations)}</StyledSubTitle>
            <p>{formatMessage(pageMessages.TermsPage.termsAndRegulationsContent)}</p>
            <ol className="mt-4">
              <li>{formatMessage(pageMessages.TermsPage.prohibitedAction1)}</li>
              <li>{formatMessage(pageMessages.TermsPage.prohibitedAction2)}</li>
              <li>{formatMessage(pageMessages.TermsPage.prohibitedAction3)}</li>
              <li>{formatMessage(pageMessages.TermsPage.prohibitedAction4)}</li>
              <li>{formatMessage(pageMessages.TermsPage.prohibitedAction5)}</li>
              <li>{formatMessage(pageMessages.TermsPage.prohibitedAction6)}</li>
              <li>{formatMessage(pageMessages.TermsPage.prohibitedAction7)}</li>
              <li>{formatMessage(pageMessages.TermsPage.prohibitedAction8)}</li>
              <li>{formatMessage(pageMessages.TermsPage.prohibitedAction9)}</li>
              <li>{formatMessage(pageMessages.TermsPage.prohibitedAction10, { name: name })}</li>
            </ol>

            <StyledSubTitle level={3}>{formatMessage(pageMessages.TermsPage.serviceTermination)}</StyledSubTitle>
            <p>{formatMessage(pageMessages.TermsPage.serviceTerminationContent1)}</p>
            <p>{formatMessage(pageMessages.TermsPage.serviceTerminationContent2)}</p>
            <p>{formatMessage(pageMessages.TermsPage.serviceTerminationContent3, { name: name })}</p>

            <StyledSubTitle level={3}>{formatMessage(pageMessages.TermsPage.report)}</StyledSubTitle>
            <p>{formatMessage(pageMessages.TermsPage.reportContent, { name: name })}</p>
          </StyledCard>
          <StyledCard>
            <StyledTitle level={2}>{formatMessage(pageMessages.TermsPage.refundPolicy)}</StyledTitle>

            <StyledSubTitle level={3}>{formatMessage(pageMessages.TermsPage.refundRegulations)}</StyledSubTitle>
            <p>{formatMessage(pageMessages.TermsPage.refundRegulationsContent1)}</p>
            <p>{formatMessage(pageMessages.TermsPage.refundRegulationsContent2)}</p>

            <StyledSubTitle level={3}>{formatMessage(pageMessages.TermsPage.refundMethod)}</StyledSubTitle>
            <p>{formatMessage(pageMessages.TermsPage.refundMethodContent1)}</p>
            <p>{formatMessage(pageMessages.TermsPage.refundMethodContent2)}</p>
          </StyledCard>
        </div>
      </StyledSection>
    </DefaultLayout>
  )
}

export default TermsPage

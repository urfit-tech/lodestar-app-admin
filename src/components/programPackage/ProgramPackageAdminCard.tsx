import { Typography } from 'antd'
import React from 'react'
import { useIntl } from 'react-intl'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import { currencyFormatter } from '../../helpers'
import { programMessages } from '../../helpers/translation'
import EmptyCover from '../../images/default/empty-cover.png'
import { PeriodTypeLabel } from '../common/Period'

const StyledWrapper = styled.div`
  overflow: hidden;
  background: white;
  border-radius: 4px;
  box-shadow: 0 4px 12px 0 rgba(0, 0, 0, 0.06);
`
const StyledCover = styled.div<{ src?: string | null }>`
  position: relative;
  padding-top: ${900 / 16}%;
  background-image: url(${props => props.src || EmptyCover});
  background-size: cover;
  background-position: center;
`
const StyledDescription = styled.div`
  padding: 1.25rem;
  min-height: 100px;
`
const StyledTitle = styled(Typography.Title)`
  && {
    margin: 0;
    color: var(--gray-darker);
    font-size: 18px;
    font-weight: bold;
    letter-spacing: 0.8px;
  }
`
const StyledSoldQuantity = styled.div`
  padding: 0.75rem 1rem;
  background-color: var(--gray-lighter);
  font-size: 14px;
  color: var(--gray-dark);
  text-align: center;
`
const StyledPriceLabel = styled.span`
  color: ${props => props.theme['@primary-color']};

  & > span:first-child:not(:last-child) {
    margin-right: 0.5rem;
    color: ${props => props.theme['@text-color-secondary']};
    text-decoration: line-through;
  }
`
const ProgramPackageAdminCard: React.FC<{
  id: string
  coverUrl?: string | null
  title: string
  programPackageEnrollment: number
  listPrice?: number | null
  salePrice?: number | null
  periodAmount?: number | null
  periodType?: string | null
}> = ({ id, coverUrl, title, programPackageEnrollment, listPrice, salePrice, periodAmount, periodType }) => {
  const { formatMessage } = useIntl()

  return (
    <StyledWrapper>
      <Link to={`/program-packages/${id}`}>
        <StyledCover src={coverUrl} />

        <StyledDescription>
          <StyledTitle ellipsis={{ rows: 2 }}>{title}</StyledTitle>
          {listPrice !== null && listPrice !== undefined && (
            <div className="text-right mt-2">
              <StyledPriceLabel>
                <span>{currencyFormatter(listPrice)}</span>
                {salePrice !== null && salePrice !== undefined && <span>{currencyFormatter(salePrice)}</span>}
                {!!periodType && (
                  <>
                    /<PeriodTypeLabel periodType={periodType} />
                  </>
                )}
              </StyledPriceLabel>
            </div>
          )}
        </StyledDescription>

        <StyledSoldQuantity>
          {formatMessage(programMessages.text.enrolledPerpetualCount, { count: programPackageEnrollment })}
        </StyledSoldQuantity>
      </Link>
    </StyledWrapper>
  )
}

export default ProgramPackageAdminCard

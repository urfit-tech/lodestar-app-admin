import { Card, Typography } from 'antd'
import { CardProps } from 'antd/lib/card'
import React from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import { currencyFormatter } from '../../helpers'
import { programMessages } from '../../helpers/translation'
import EmptyCover from '../../images/default/empty-cover.png'
import { ProgramPreviewProps } from '../../types/program'
import AdminCard from '../admin/AdminCard'
import { PeriodTypeLabel } from '../common/Period'

const ProgramCover = styled.div<{ src?: string | null }>`
  width: 100%;
  padding-top: 56.25%;
  background-image: url(${props => props.src || EmptyCover});
  background-size: cover;
  background-position: center;
`
const StyledPriceLabel = styled.span`
  color: ${props => props.theme['@primary-color']};

  & > span:first-child:not(:last-child) {
    margin-right: 0.5rem;
    color: ${props => props.theme['@text-color-secondary']};
    text-decoration: line-through;
  }
`
const ExtraContentBlock = styled.div`
  position: absolute;
  right: 0px;
  bottom: 0px;
  left: 0px;
  padding: 0.5rem 1rem;
  background-color: #f7f8f8;
  color: #9b9b9b;
  text-align: center;
`

const ProgramAdminCard: React.FC<ProgramPreviewProps & CardProps> = ({
  id,
  coverUrl,
  coverMobileUrl,
  coverThumbnailUrl,
  title,
  abstract,
  instructors,
  listPrice,
  salePrice,
  periodAmount,
  periodType,
  isPrivate,
  enrollment,
  ...props
}) => {
  const { formatMessage } = useIntl()

  return (
    <AdminCard
      variant="program"
      cover={<ProgramCover src={coverThumbnailUrl || coverUrl || coverMobileUrl} />}
      {...props}
    >
      <Card.Meta
        title={<Typography.Title ellipsis={{ rows: 2 }}>{title}</Typography.Title>}
        description={
          <>
            <Typography.Paragraph ellipsis={{ rows: 2 }} className="mb-0">
              {abstract}
            </Typography.Paragraph>
            <div className="text-right pb-3">
              <StyledPriceLabel>
                <span>{currencyFormatter(listPrice)}</span>
                {salePrice !== null && <span>{currencyFormatter(salePrice)}</span>}
                {!!periodType && (
                  <>
                    /<PeriodTypeLabel periodType={periodType} />
                  </>
                )}
              </StyledPriceLabel>
            </div>
            <ExtraContentBlock className="d-flex justify-content-center text-align-center">
              {formatMessage(programMessages.text.enrolledPerpetualCount, { count: enrollment })}
            </ExtraContentBlock>
          </>
        }
      />
    </AdminCard>
  )
}

export default ProgramAdminCard

import { LoadingOutlined } from '@ant-design/icons'
import { useQuery } from '@apollo/react-hooks'
import { Card, Spin, Typography } from 'antd'
import { CardProps } from 'antd/lib/card'
import gql from 'graphql-tag'
import { sum } from 'ramda'
import React from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import hasura from '../../hasura'
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
  title,
  abstract,
  instructors,
  listPrice,
  salePrice,
  periodAmount,
  periodType,
  isPrivate,
  ...props
}) => {
  const { formatMessage } = useIntl()
  const { loading, error, programEnrollment } = useProgramEnrollment(id)

  return (
    <AdminCard variant="program" cover={<ProgramCover src={coverUrl} />} {...props}>
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
                {!!salePrice && <span>{currencyFormatter(salePrice)}</span>}
                {!!periodType && (
                  <>
                    /<PeriodTypeLabel periodType={periodType} />
                  </>
                )}
              </StyledPriceLabel>
            </div>
            <ExtraContentBlock className="d-flex justify-content-center text-align-center">
              {loading || error ? (
                <Spin indicator={<LoadingOutlined />} />
              ) : (
                formatMessage(programMessages.text.enrolledPerpetualCount, { count: programEnrollment })
              )}
            </ExtraContentBlock>
          </>
        }
      />
    </AdminCard>
  )
}

const useProgramEnrollment = (programId: string) => {
  const { loading, error, data } = useQuery<hasura.GET_PROGRAM_ENROLLMENT, hasura.GET_PROGRAM_ENROLLMENTVariables>(
    gql`
      query GET_PROGRAM_ENROLLMENT($programId: uuid) {
        program(where: { id: { _eq: $programId } }) {
          program_plans(where: { published_at: { _lte: "now()" } }, order_by: { created_at: asc }) {
            id
            program_plan_enrollments_aggregate {
              aggregate {
                count
              }
            }
          }
        }
      }
    `,
    { variables: { programId } },
  )
  const programEnrollment =
    data?.program.map(v =>
      sum(v.program_plans.map(w => w.program_plan_enrollments_aggregate.aggregate?.count || 0)),
    )[0] || 0

  return {
    loading,
    programEnrollment,
    error,
  }
}

export default ProgramAdminCard

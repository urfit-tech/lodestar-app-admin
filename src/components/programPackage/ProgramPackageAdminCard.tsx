import { LoadingOutlined } from '@ant-design/icons'
import { useQuery } from '@apollo/react-hooks'
import { Spin, Typography } from 'antd'
import gql from 'graphql-tag'
import { sum } from 'ramda'
import React from 'react'
import { useIntl } from 'react-intl'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import hasura from '../../hasura'
import { programMessages } from '../../helpers/translation'
import EmptyCover from '../../images/default/empty-cover.png'

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
  height: 80px;
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
const ProgramPackageAdminCard: React.FC<{
  id: string
  coverUrl?: string | null
  title: string
}> = ({ id, coverUrl, title }) => {
  const { formatMessage } = useIntl()
  const { loading, error, programPackageEnrollment } = useProgramPackageEnrollment(id)

  return (
    <StyledWrapper>
      <Link to={`/program-packages/${id}`}>
        <StyledCover src={coverUrl} />

        <StyledDescription>
          <StyledTitle ellipsis={{ rows: 2 }}>{title}</StyledTitle>
        </StyledDescription>

        <StyledSoldQuantity>
          {loading || error ? (
            <Spin indicator={<LoadingOutlined />} />
          ) : (
            formatMessage(programMessages.text.enrolledPerpetualCount, { count: programPackageEnrollment })
          )}
        </StyledSoldQuantity>
      </Link>
    </StyledWrapper>
  )
}

const useProgramPackageEnrollment = (programPackageId: string) => {
  const { loading, error, data } = useQuery<
    hasura.GET_PROGRAM_PACKAGE_ENROLLMENT,
    hasura.GET_PROGRAM_PACKAGE_ENROLLMENTVariables
  >(
    gql`
      query GET_PROGRAM_PACKAGE_ENROLLMENT($programPackageId: uuid) {
        program_package(where: { id: { _eq: $programPackageId } }) {
          id
          program_package_plans {
            program_package_plan_enrollments_aggregate {
              aggregate {
                count
              }
            }
          }
        }
      }
    `,
    { variables: { programPackageId } },
  )
  const programPackageEnrollment =
    data?.program_package.map(v =>
      sum(v.program_package_plans.map(w => w.program_package_plan_enrollments_aggregate.aggregate?.count || 0)),
    )[0] || 0

  return {
    loading,
    error,
    programPackageEnrollment,
  }
}

export default ProgramPackageAdminCard

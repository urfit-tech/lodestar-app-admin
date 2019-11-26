import React from 'react'
import styled from 'styled-components'
import { InferType } from 'yup'
import { currencyFormatter } from '../../helpers'
import { useEnrolledProgramIds } from '../../hooks/program'
import { programSchema } from '../../schemas/program'
import ProgramPaymentButton from '../checkout/ProgramPaymentButton'

const StyledProgramPerpetualPlanCard = styled.div`
  background: white;
  box-shadow: 0 4px 12px 0 rgba(0, 0, 0, 0.06);
`

type ProgramPerpetualPlanCardProps = {
  memberId: string
  program: InferType<typeof programSchema>
}
const ProgramPerpetualPlanCard: React.FC<ProgramPerpetualPlanCardProps> = ({ memberId, program }) => {
  const { enrolledProgramIds } = useEnrolledProgramIds(memberId, true)
  // const { loading, error, data } = useQuery(GET_PROGRAM_ENROLLMENT, { variables: { programId: program.id } })

  const isEnrolled = enrolledProgramIds.includes(program.id)

  if (isEnrolled) {
    return null
  }

  return (
    <StyledProgramPerpetualPlanCard className="p-1 p-sm-3 px-sm-4">
      <div className="container">
        <div className="row">
          <div className="mb-2 mt-2 mt-sm-0 mb-sm-0 col-12 col-sm-8 d-flex align-items-center justify-content-center justify-content-sm-start">
            {program.soldAt && new Date() < program.soldAt ? (
              <div>
                <span
                  className="mr-1"
                  style={{
                    fontWeight: 600,
                  }}
                >
                  優惠價 {currencyFormatter(program.salePrice)}
                </span>
                <span
                  style={{
                    textDecoration: 'line-through',
                    fontSize: '14px',
                    color: '#9b9b9b',
                  }}
                >
                  {currencyFormatter(program.listPrice)}
                </span>
              </div>
            ) : (
              <div>{currencyFormatter(program.listPrice)}</div>
            )}
          </div>
          <div className="col-12 col-sm-4">
            <ProgramPaymentButton memberId={memberId} program={program} />
          </div>
        </div>
      </div>
    </StyledProgramPerpetualPlanCard>
  )
}

// const GET_PROGRAM_ENROLLMENT = gql`
//   query GET_PROGRAM_ENROLLMENT($programId: uuid!) {
//     program_enrollment_aggregate(where: { program_id: { _eq: $programId } }) {
//       aggregate {
//         count
//       }
//     }
//   }
// `

export default ProgramPerpetualPlanCard

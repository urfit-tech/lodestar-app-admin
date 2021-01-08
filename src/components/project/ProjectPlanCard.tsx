import { Typography } from 'antd'
import Card, { CardProps } from 'antd/lib/card'
import React from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import { commonMessages } from '../../helpers/translation'
import EmptyCover from '../../images/default/empty-cover.png'
import { ProjectPlanPeriodType, ProjectPlanProps } from '../../types/project'
import AdminCard from '../admin/AdminCard'
import PriceLabel from '../common/PriceLabel'
import { BraftContent } from '../common/StyledBraftEditor'

const CoverImage = styled.div<{ src: string }>`
  padding-top: calc(100% / 3);
  background-image: url(${props => props.src});
  background-size: cover;
  background-position: center;
`
const StyledTitle = styled.div`
  color: var(--gray-darker);
  font-size: 16px;
  font-weight: bold;
  letter-spacing: 0.2px;
`
const ExtraContentBlock = styled.div`
  position: absolute;
  right: 0px;
  bottom: 0px;
  left: 0px;
  padding: 0 24px 24px 24px;
  text-align: center;
`
const StyledOnSale = styled.div<{ status?: string }>`
  ::before {
    content: '';
    width: 8px;
    height: 8px;
    border-radius: 50%;
    display: inline-block;
    margin: 0 8px 2px 0;
    background: ${props => (props.status === 'onSale' ? '#4ed1b3' : 'var(--gray)')};
  }
`

const ProjectPlanCard: React.FC<
  {
    projectPlan: ProjectPlanProps
  } & CardProps
> = ({ projectPlan, ...props }) => {
  const { formatMessage } = useIntl()
  const isOnSale = (projectPlan.soldAt?.getTime() || 0) > Date.now()

  return (
    <>
      <AdminCard variant="projectPlan" cover={<CoverImage src={projectPlan.coverUrl || EmptyCover} />} {...props}>
        <Card.Meta
          title={<StyledTitle className="mb-2">{projectPlan.title}</StyledTitle>}
          description={
            <>
              <PriceLabel
                listPrice={projectPlan.listPrice}
                salePrice={isOnSale ? projectPlan.salePrice : undefined}
                downPrice={projectPlan.discountDownPrice || undefined}
                periodAmount={1}
                periodType={projectPlan.periodType as ProjectPlanPeriodType}
              />
              <Typography.Paragraph ellipsis={{ rows: 2 }} className="mt-4 mb-0">
                <BraftContent>{projectPlan.description}</BraftContent>
              </Typography.Paragraph>

              <ExtraContentBlock className="d-flex justify-content-between">
                <div>
                  {formatMessage(commonMessages.label.amountParticipants, {
                    amount: projectPlan.projectPlanEnrollment,
                  })}
                </div>
                {projectPlan.publishedAt ? (
                  <StyledOnSale status="onSale">發售中</StyledOnSale>
                ) : (
                  <StyledOnSale>已停售</StyledOnSale>
                )}
              </ExtraContentBlock>
            </>
          }
        />
      </AdminCard>
    </>
  )
}

export default ProjectPlanCard

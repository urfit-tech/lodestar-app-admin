import EditOutlined from '@ant-design/icons/lib/icons/EditOutlined'
import { Button, Divider, Tag, Typography } from 'antd'
import Card, { CardProps } from 'antd/lib/card'
import { BraftContent } from 'lodestar-app-element/src/components/common/StyledBraftEditor'
import PriceLabel from 'lodestar-app-element/src/components/labels/PriceLabel'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import React from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import { commonMessages } from '../../helpers/translation'
import { useProductChannelInfo } from '../../hooks/channel'
import EmptyCover from '../../images/default/empty-cover.png'
import { ProjectPlan, ProjectPlanPeriodType } from '../../types/project'
import AdminCard from '../admin/AdminCard'
import ProductSkuModal from '../common/ProductSkuModal'
import ProjectPlanAdminModal from './ProjectPlanAdminModal'
import projectMessages from './translation'

const CoverImage = styled.div<{ src: string }>`
  padding-top: calc(100% / 3);
  background-image: url(${props => props.src});
  background-size: cover;
  background-position: center;
`
const StyledTitleContainer = styled.div`
  display: flex;
  justify-content: space-between;
`
const StyledTitle = styled.div`
  color: var(--gray-darker);
  font-size: 16px;
  font-weight: bold;
  letter-spacing: 0.2px;
  width: 80%;
  overflow: hidden;
  text-overflow: ellipsis;
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

const StyledModalButton = styled(Button)`
  padding: 0;
  height: fit-content;

  span: {
    margin: 0;
  }
`

const ProjectPlanCard: React.FC<
  {
    projectPlan: ProjectPlan
    projectId: string
    onRefetch?: () => void
  } & CardProps
> = ({ projectPlan, projectId, onRefetch, ...props }) => {
  const { formatMessage } = useIntl()
  const { id: appId, enabledModules } = useApp()
  const { productChannelInfo, refetchProductChannelInfo } = useProductChannelInfo(
    appId,
    `ProjectPlan_${projectPlan.id}`,
  )
  const isOnSale = (projectPlan.soldAt?.getTime() || 0) > Date.now()
  const projectPlanType =
    projectPlan.periodAmount && projectPlan.periodType
      ? projectPlan.autoRenewed
        ? 'subscription'
        : 'period'
      : 'perpetual'

  return (
    <>
      <AdminCard variant="projectPlan" cover={<CoverImage src={projectPlan.coverUrl || EmptyCover} />} {...props}>
        <Card.Meta
          title={
            <StyledTitleContainer className="mb-2">
              <div className="d-flex align-items-center" style={{ width: '90%' }}>
                <Tag className="mr-2">
                  {projectPlanType === 'subscription'
                    ? formatMessage(commonMessages.ui.subscriptionPlan)
                    : projectPlanType === 'period'
                    ? formatMessage(commonMessages.ui.periodPlan)
                    : formatMessage(commonMessages.ui.perpetualPlan)}
                </Tag>
                <StyledTitle>{projectPlan.title}</StyledTitle>
              </div>
              <ProjectPlanAdminModal
                projectId={projectId}
                projectPlan={projectPlan}
                renderTrigger={({ onOpen }) => (
                  <div className="d-flex align-items-center">
                    <EditOutlined onClick={() => onOpen?.(projectPlanType)} />
                  </div>
                )}
                onRefetch={onRefetch}
              />
            </StyledTitleContainer>
          }
          description={
            <>
              <PriceLabel
                listPrice={projectPlan.listPrice}
                salePrice={isOnSale ? projectPlan.salePrice : undefined}
                downPrice={projectPlan.discountDownPrice || undefined}
                currencyId={projectPlan.currencyId}
                periodAmount={1}
                periodType={projectPlan.periodType as ProjectPlanPeriodType}
                variant="full-detail"
              />
              <Divider />
              <Typography.Paragraph ellipsis={{ rows: 2 }} className="mt-4 mb-5 pb-2">
                <BraftContent>{projectPlan.description}</BraftContent>
              </Typography.Paragraph>
              <ExtraContentBlock className="d-flex justify-content-between align-items-center">
                {enabledModules.sku ? (
                  <ProductSkuModal
                    productId={`ProjectPlan_${projectPlan.id}`}
                    renderTrigger={({ sku, onOpen }) => (
                      <div className="d-flex flex-column align-items-start">
                        <StyledModalButton type="link" onClick={() => onOpen?.()}>
                          {!sku &&
                            productChannelInfo?.filter(v => v.channelSku).length === 0 &&
                            formatMessage(projectMessages.ProjectPlanCard.skuSetting)}
                          {sku && `${formatMessage(projectMessages.ProjectPlanCard.sku)}: ${sku}`}
                        </StyledModalButton>
                        {productChannelInfo &&
                          productChannelInfo
                            .filter(v => v.channelSku)
                            .map(v => (
                              <StyledModalButton
                                key={v.appChannelId}
                                type="link"
                                onClick={() => onOpen?.()}
                              >{`${v.appChannelName}: ${v.channelSku}`}</StyledModalButton>
                            ))}
                      </div>
                    )}
                    onRefetch={() => refetchProductChannelInfo()}
                  />
                ) : (
                  <div></div>
                )}
                <div className="d-flex">
                  {projectPlan.publishedAt ? (
                    <StyledOnSale status="onSale">{formatMessage(projectMessages.ProjectPlanCard.onSale)}</StyledOnSale>
                  ) : (
                    <StyledOnSale>{formatMessage(projectMessages.ProjectPlanCard.notSale)}</StyledOnSale>
                  )}
                  <span style={{ whiteSpace: 'pre-wrap' }}> / </span>
                  {formatMessage(commonMessages.label.amountParticipants, {
                    amount: projectPlan.projectPlanEnrollment,
                  })}
                </div>
              </ExtraContentBlock>
            </>
          }
        />
      </AdminCard>
    </>
  )
}

export default ProjectPlanCard

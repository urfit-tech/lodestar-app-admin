import React from 'react'
import OnSaleCallToActionSection from './OnSaleCallToActionSection'
import OnSaleCommentSection from './OnSaleCommentSection'
import OnSaleComparisonSection from './OnSaleComparisonSection'
import OnSaleCoverSection from './OnSaleCoverSection'
import OnSaleIntroductionSection from './OnSaleIntroductionSection'
import OnSaleProjectPlanSection from './OnSaleProjectPlanSection'
import OnSaleRoadmapSection from './OnSaleRoadmapSection'
import OnSaleSkillSection from './OnSaleSkillSection'
import OnSaleTrialSection from './OnSaleTrialSection'
import { ProjectContentProps } from './ProjectContent'

const OnSaleContentBlock: React.FC<ProjectContentProps> = ({
  id,
  type,
  createdAt,
  publishedAt,
  expiredAt,
  coverType,
  coverUrl,
  title,
  abstract,
  description,
  targetAmount,
  template,
  introduction,
  contents,
  updates,
  comments,
  projectPlans,
}) => {
  return (
    <div>
      <OnSaleCoverSection
        cover={{ title, abstract, description, url: coverUrl, type: coverType }}
        {...contents.slogan}
      />

      <OnSaleIntroductionSection introduction={introduction} />

      <OnSaleSkillSection {...contents.skill} />
      <OnSaleRoadmapSection roadmaps={contents.roadmaps} />
      <OnSaleTrialSection {...contents.trial} />
      <OnSaleComparisonSection comparisons={contents.comparisons} />

      <OnSaleProjectPlanSection projectPlans={projectPlans} />

      <OnSaleCommentSection comments={comments} />
      <OnSaleCallToActionSection updates={updates} expiredAt={expiredAt} />
    </div>
  )
}

export default OnSaleContentBlock

import Icon from '@ant-design/icons'
import React from 'react'
import { useIntl } from 'react-intl'
import { AdminPageTitle } from '../../components/admin'
import ProductCreationModal from '../../components/common/ProductCreationModal'
import AdminLayout from '../../components/layout/AdminLayout'
import ProjectCollectionTabs from '../../components/project/ProjectCollectionTabs'
import { commonMessages, projectMessages } from '../../helpers/translation'
import { ReactComponent as ProjectIcon } from '../../images/icon/project.svg'

const ProjectFundingPage: React.FC<{}> = () => {
  const { formatMessage } = useIntl()

  return (
    <AdminLayout>
      <AdminPageTitle className="mb-4">
        <Icon component={() => <ProjectIcon />} className="mr-3" />
        <span>{formatMessage(commonMessages.menu.projectFunding)}</span>
      </AdminPageTitle>

      <div className="row mb-5">
        <div className="col-8">
          <ProductCreationModal
            memberPermission={''}
            withCreatorSelector
            creatorAppellation={formatMessage(projectMessages.label.Sponsor)}
            customTitle={formatMessage(projectMessages.term.title)}
            // onCreate={({ title, categoryIds, creatorId, isSubscription }) =>
            //   insertProgram({
            //     variables: {
            //       ownerId: currentMemberId,
            //       instructorId: creatorId || currentMemberId,
            //       appId,
            //       title,
            //       isSubscription: isSubscription || false,
            //       programCategories:
            //         categoryIds?.map((categoryId, index) => ({
            //           category_id: categoryId,
            //           position: index,
            //         })) || [],
            //     },
            //   }).then(res => {
            //     const programId = res.data?.insert_program?.returning[0]?.id
            //     programId && history.push(`/programs/${programId}`)
            //   })
            // }
          />
        </div>
      </div>
      <ProjectCollectionTabs />
    </AdminLayout>
  )
}

export default ProjectFundingPage

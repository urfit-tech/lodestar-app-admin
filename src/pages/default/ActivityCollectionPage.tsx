import { Button, Icon, Skeleton } from 'antd'
import { uniqBy, unnest } from 'ramda'
import React, { useState } from 'react'
import styled from 'styled-components'
import Activity from '../../components/activity/Activity'
import DefaultLayout from '../../components/layout/DefaultLayout'
import { usePublishedActivityCollection } from '../../hooks/activity'

const StyledBanner = styled.div`
  padding: 4rem 0;
  background-color: var(--gray-lighter);
`
const StyledTitle = styled.h1`
  margin-bottom: 2.5rem;
  color: var(--gray-darker);
  font-size: 24px;
  font-weight: bold;
  letter-spacing: 0.2px;
`
const StyledCollection = styled.div`
  padding: 2.5rem 0;
`

const ActivityCollectionPage = () => {
  const { loadingActivities, errorActivities, activities } = usePublishedActivityCollection()
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null)

  const categories: {
    id: string
    name: string
  }[] = uniqBy(
    category => category.id,
    unnest(
      activities.map(activity =>
        activity.categories.map(activityCategory => ({
          id: activityCategory.category.id,
          name: activityCategory.category.name,
        })),
      ),
    ),
  )

  return (
    <DefaultLayout white>
      <StyledBanner>
        <div className="container">
          <StyledTitle>
            <Icon type="appstore" theme="filled" className="mr-3" />
            <span>線下實體</span>
          </StyledTitle>

          <Button
            type={selectedCategoryId === null ? 'primary' : 'default'}
            shape="round"
            onClick={() => setSelectedCategoryId(null)}
            className="mb-2"
          >
            全部分類
          </Button>
          {categories.map(category => (
            <Button
              key={category.id}
              type={selectedCategoryId === category.id ? 'primary' : 'default'}
              shape="round"
              className="ml-2 mb-2"
              onClick={() => setSelectedCategoryId(category.id)}
            >
              {category.name}
            </Button>
          ))}
        </div>
      </StyledBanner>

      <StyledCollection>
        <div className="container">
          {loadingActivities && <Skeleton />}
          {errorActivities && <div>讀取錯誤</div>}

          <div className="row">
            {activities
              .filter(
                activity =>
                  selectedCategoryId === null ||
                  activity.categories.some(activityCategory => activityCategory.category.id === selectedCategoryId),
              )
              .map(activity => (
                <div key={activity.id} className="col-12 col-md-6 col-lg-4 mb-4">
                  <Activity {...activity} />
                </div>
              ))}
          </div>
        </div>
      </StyledCollection>
    </DefaultLayout>
  )
}

export default ActivityCollectionPage

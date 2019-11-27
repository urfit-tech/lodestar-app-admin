import { Button, Icon } from 'antd'
import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { StringParam, useQueryParam } from 'use-query-params'
import { BREAK_POINT } from '../../components/common/Responsive'
import DefaultLayout from '../../components/layout/DefaultLayout'
import ProgramCategorySelector from '../../components/program/ProgramCategorySelector'
import CreatorBriefCard from '../../components/reservation/CreatorBriefCard'

const StyledSection = styled.div`
  background: #f7f8f8;
`
const StyledButton = styled(Button)`
  padding: 0 20px;
  font-size: 14px;
`
const StyledCollectionBlock = styled.section`
  background: white;
  padding: 32px 0;
  @media (min-width: ${BREAK_POINT}px) {
    padding: 56px;
  }
`
const StyledTitle = styled.h4`
  margin-bottom: 32px;
  color: var(--gray-darker);
  font-size: 20px;
  font-weight: bold;
  line-height: 1.3;
  letter-spacing: 0.77px;

  @media (min-width: ${BREAK_POINT}px) {
    margin-bottom: 40px;
  }
`

const CreatorCollectionPage: React.FC = () => {
  const [defaultActive, setDefaultActive] = useQueryParam('active', StringParam)
  const [selectedCategoryId, setSelectedCategoryId] = useState(defaultActive)
  const featureCreators = [
    {
      title: 'name',
      meta: 'Lorem ipsum, dolor sit amet consectetur adipisicing elit. ',
      description:
        'Lorem ipsum, dolor sit amet consectetur adipisicing elit. Soluta et illum ,praesentium, deleniti maiores vel cum quo, iste nihil assumenda eaque harum facere quos ,ipsam. Molestias impedit repudiandae nulla tempora.',
      variant: 'featuring',
    },
    {
      title: 'name',
      meta: 'Lorem ipsum, dolor sit amet consectetur adipisicing elit. ',
      description:
        'Lorem ipsum, dolor sit amet consectetur adipisicing elit. Soluta et illum ,praesentium, deleniti maiores vel cum quo, iste nihil assumenda eaque harum facere quos ,ipsam. Molestias impedit repudiandae nulla tempora.',
      variant: 'featuring',
    },
    {
      title: 'name',
      meta: 'Lorem ipsum, dolor sit amet consectetur adipisicing elit. ',
      description:
        'Lorem ipsum, dolor sit amet consectetur adipisicing elit. Soluta et illum ,praesentium, deleniti maiores vel cum quo, iste nihil assumenda eaque harum facere quos ,ipsam. Molestias impedit repudiandae nulla tempora.',
      variant: 'featuring',
    },
  ]
  const creators = [
    {
      title: 'name',
      description:
        'Lorem ipsum, dolor sit amet consectetur adipisicing elit. Soluta et illum ,praesentium, deleniti maiores vel cum quo, iste nihil assumenda eaque harum facere quos ,ipsam. Molestias impedit repudiandae nulla tempora.',
    },
    {
      title: 'name',
      description:
        'Lorem ipsum, dolor sit amet consectetur adipisicing elit. Soluta et illum ,praesentium, deleniti maiores vel cum quo, iste nihil assumenda eaque harum facere quos ,ipsam. Molestias impedit repudiandae nulla tempora.',
    },
    {
      title: 'name',
      description:
        'Lorem ipsum, dolor sit amet consectetur adipisicing elit. Soluta et illum ,praesentium, deleniti maiores vel cum quo, iste nihil assumenda eaque harum facere quos ,ipsam. Molestias impedit repudiandae nulla tempora.',
    },
    {
      title: 'name',
      description:
        'Lorem ipsum, dolor sit amet consectetur adipisicing elit. Soluta et illum ,praesentium, deleniti maiores vel cum quo, iste nihil assumenda eaque harum facere quos ,ipsam. Molestias impedit repudiandae nulla tempora.',
    },
    {
      title: 'name',
      description:
        'Lorem ipsum, dolor sit amet consectetur adipisicing elit. Soluta et illum ,praesentium, deleniti maiores vel cum quo, iste nihil assumenda eaque harum facere quos ,ipsam. Molestias impedit repudiandae nulla tempora.',
    },
    {
      title: 'name',
      description:
        'Lorem ipsum, dolor sit amet consectetur adipisicing elit. Soluta et illum ,praesentium, deleniti maiores vel cum quo, iste nihil assumenda eaque harum facere quos ,ipsam. Molestias impedit repudiandae nulla tempora.',
    },
    {
      title: 'name',
      description:
        'Lorem ipsum, dolor sit amet consectetur adipisicing elit. Soluta et illum ,praesentium, deleniti maiores vel cum quo, iste nihil assumenda eaque harum facere quos ,ipsam. Molestias impedit repudiandae nulla tempora.',
    },
    {
      title: 'name',
      description:
        'Lorem ipsum, dolor sit amet consectetur adipisicing elit. Soluta et illum ,praesentium, deleniti maiores vel cum quo, iste nihil assumenda eaque harum facere quos ,ipsam. Molestias impedit repudiandae nulla tempora.',
    },
    {
      title: 'name',
      description:
        'Lorem ipsum, dolor sit amet consectetur adipisicing elit. Soluta et illum ,praesentium, deleniti maiores vel cum quo, iste nihil assumenda eaque harum facere quos ,ipsam. Molestias impedit repudiandae nulla tempora.',
    },
    {
      title: 'name',
      description:
        'Lorem ipsum, dolor sit amet consectetur adipisicing elit. Soluta et illum ,praesentium, deleniti maiores vel cum quo, iste nihil assumenda eaque harum facere quos ,ipsam. Molestias impedit repudiandae nulla tempora.',
    },
    {
      title: 'name',
      description:
        'Lorem ipsum, dolor sit amet consectetur adipisicing elit. Soluta et illum ,praesentium, deleniti maiores vel cum quo, iste nihil assumenda eaque harum facere quos ,ipsam. Molestias impedit repudiandae nulla tempora.',
    },
    {
      title: 'name',
      description:
        'Lorem ipsum, dolor sit amet consectetur adipisicing elit. Soluta et illum ,praesentium, deleniti maiores vel cum quo, iste nihil assumenda eaque harum facere quos ,ipsam. Molestias impedit repudiandae nulla tempora.',
    },
  ]

  useEffect(() => {
    setSelectedCategoryId(defaultActive)
  }, [defaultActive])

  return (
    <DefaultLayout>
      <StyledSection>
        <div className="py-5 container">
          <StyledTitle>
            <Icon type="appstore" theme="filled" className="mr-3" />
            <span>大師列表</span>
          </StyledTitle>
          <div>
            <StyledButton
              shape="round"
              className="mb-2 mr-2"
              onClick={() => setDefaultActive(undefined)}
              type={selectedCategoryId ? 'default' : 'primary'}
            >
              全部分類
            </StyledButton>

            <ProgramCategorySelector flatten value={selectedCategoryId} onChange={setDefaultActive} />
          </div>
        </div>
      </StyledSection>
      <StyledCollectionBlock>
        <div className="container">
          <StyledTitle>推薦大師</StyledTitle>
          <div className="row">
            {featureCreators.length &&
              featureCreators.map(creator => (
                <div className="col-lg-4 col-12">
                  <CreatorBriefCard
                    imageUrl=""
                    title={creator.title}
                    meta={creator.meta}
                    description={creator.description}
                    variant={creator.variant}
                  />
                </div>
              ))}
          </div>
        </div>
        <div className="container">
          <StyledTitle>所有大師</StyledTitle>
          <div className="row">
            {creators.length &&
              creators.map(creator => (
                <div className="col-lg-3 col-6">
                  <CreatorBriefCard title={creator.title} description={creator.description} />
                </div>
              ))}
          </div>
        </div>
      </StyledCollectionBlock>
    </DefaultLayout>
  )
}

export default CreatorCollectionPage

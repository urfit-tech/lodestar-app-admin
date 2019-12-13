import { Button, Icon } from 'antd'
import { flatten, uniqBy } from 'ramda'
import React, { useState } from 'react'
import styled from 'styled-components'
import DefaultLayout from '../../components/layout/DefaultLayout'
import { PodcastProgramCardProps } from '../../components/podcast/PodcastProgramCard'
import { PodcastProgramPopoverProps } from '../../components/podcast/PodcastProgramPopover'
import PodcastProgramTimeline from '../../components/podcast/PodcastProgramTimeline'
import PopularPodcastCollection from '../../containers/podcast/PopularPodcastCollection'

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

const PodcastProgramCollectionPage: React.FC = () => {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null)

  // ! fake data
  const podcastPrograms: (PodcastProgramPopoverProps &
    PodcastProgramCardProps & {
      id: string
      publishedAt: Date
    })[] = [
    {
      id: 'podcast-program-1',
      publishedAt: new Date('2019-12-02'),
      coverUrl:
        'https://images.unsplash.com/photo-1562887009-92ca32b341c6?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1489&q=80',
      title: '數位行銷：網紅趨勢ｘ精準出價全面掌握高效工作網紅趨勢ｘ精準出價全面掌握高效工作',
      description:
        '學會從開課以來一直深受好評，以市場上對折的價格，強調實戰應用，在很短的時間，就能論盤不用耗費許久光陰，老師特有的生活化解釋，讓原本死板的命盤可以活化，利用特別的活盤觀念讓星曜不需要背誦',
      duration: 1961,
      creator: {
        id: 'creator-1',
        name: '陳小珍',
      },
      meta: '陳小珍',
      listPrice: 1800,
      categories: [
        {
          id: 'category-1',
          name: '職場溝通',
        },
      ],
    },
    {
      id: 'podcast-program-2',
      publishedAt: new Date('2019-12-02'),
      coverUrl:
        'https://images.unsplash.com/photo-1574365826123-a6f2681128fc?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1267&q=80',
      title: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Maxime, quasi.',
      description:
        'Lorem ipsum dolor sit amet consectetur, adipisicing elit. Laborum at blanditiis necessitatibus debitis deserunt architecto harum voluptas repellat, neque excepturi vero nostrum? Praesentium dolores odit culpa dolore blanditiis iste illo magni assumenda accusantium impedit? Atque illo fugit modi eos quo.',
      duration: 120,
      creator: {
        id: 'creator-1',
        name: '陳小珍',
      },
      meta: '李小美',
      salePrice: 1000,
      listPrice: 1800,
      categories: [
        {
          id: 'category-1',
          name: '職場溝通',
        },
        {
          id: 'category-2',
          name: '領導力',
        },
      ],
    },
    {
      id: 'podcast-program-3',
      publishedAt: new Date('2019-12-01'),
      title: 'Empty',
      description: '',
      duration: 0,
      creator: {
        id: 'creator-1',
        name: '陳小珍',
      },
      meta: '王其其',
      listPrice: 0,
      categories: [],
    },
    {
      id: 'podcast-program-4',
      publishedAt: new Date('2019-11-27'),
      coverUrl:
        'https://images.unsplash.com/photo-1574346190599-fecc607f8ba2?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=634&q=80',
      title:
        'Lorem ipsum dolor sit amet consectetur, adipisicing elit. Minus officia, rerum alias animi deserunt ad reiciendis commodi facere esse consequatur!',
      description:
        'Lorem ipsum dolor sit amet consectetur adipisicing elit. Id velit porro quasi minus quod sit repellat reprehenderit, aliquam officia labore fugit natus sunt quisquam hic ex doloremque facere, inventore nisi qui! Aut fuga sunt sit voluptatem rerum nobis at corrupti provident optio. Dolorem architecto aliquid quisquam quaerat excepturi voluptas error ducimus, facere veniam? Voluptate rem sequi consequuntur, ex nemo, blanditiis non repellat adipisci aut sapiente ad nisi doloremque temporibus dicta, accusantium laudantium quae quos quo sint odio. Consequuntur officiis nulla saepe, rem necessitatibus beatae quo voluptatibus vel ab delectus, in maiores excepturi ipsa minus fugiat deleniti, odio commodi! Rem, alias.',
      duration: 9999,
      creator: {
        id: 'creator-1',
        name: '陳小珍',
      },
      meta: '李小美',
      salePrice: 900,
      listPrice: 1800,
      categories: [
        {
          id: 'category-2',
          name: '領導力',
        },
        {
          id: 'category-3',
          name: '行銷技巧',
        },
      ],
    },
    {
      id: 'podcast-program-5',
      publishedAt: new Date('2019-11-25'),
      coverUrl:
        'https://images.unsplash.com/photo-1558395932-2231f33572a9?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=634&q=80',
      title: '數位行銷：網紅趨勢ｘ精準出價全面掌握高效工作',
      description:
        '學會從開課以來一直深受好評，以市場上對折的價格，強調實戰應用，在很短的時間，就能論盤不用耗費許久光陰，老師特有的生活化解釋，讓原本死板的命盤可以活化，利用特別的活盤觀念讓星曜不需要背誦',
      duration: 1961,
      creator: {
        id: 'creator-1',
        name: '陳小珍',
      },
      meta: '李小美',
      listPrice: 1800,
      categories: [
        {
          id: 'category-3',
          name: '行銷技巧',
        },
      ],
    },
  ]

  const categories = uniqBy(
    category => category.id,
    flatten(podcastPrograms.map(podcastProgram => podcastProgram.categories)),
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

      <div className="container py-5">
        <div className="row">
          <div className="col-12 col-lg-8 mb-5">
            <PodcastProgramTimeline
              podcastPrograms={podcastPrograms.filter(
                podcastProgram =>
                  !selectedCategoryId || podcastProgram.categories.some(category => category.id === selectedCategoryId),
              )}
            />
          </div>
          <div className="col-12 col-lg-4 pl-4">
            <PopularPodcastCollection />
          </div>
        </div>
      </div>
    </DefaultLayout>
  )
}

export default PodcastProgramCollectionPage

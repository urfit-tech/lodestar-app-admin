import React from 'react'
import styled from 'styled-components'
import { BREAK_POINT } from '../../components/common/Responsive'
import { BraftContent } from '../../components/common/StyledBraftEditor'
import DefaultLayout from '../../components/layout/DefaultLayout'
import PodcastPlayer from '../../components/podcast/PodcastPlayer'
import PodcastProgramCover, { PodcastProgramCoverProps } from '../../components/podcast/PodcastProgramCover'
import CreatorCard from '../../containers/common/CreatorCard'

const StyledContentWrapper = styled.div`
  padding: 2.5rem 1rem 4rem;

  @media (min-width: ${BREAK_POINT}px) {
    padding: 6rem 1rem;
    height: calc(100vh - 64px);
    overflow-y: auto;

    > div {
      margin: 0 auto;
      max-width: 38.75rem;
    }
  }
`

const PodcastProgramContentPage: React.FC = () => {
  // ! fake data
  const podcast: PodcastProgramCoverProps & {
    id: string
    description?: string
  } = {
    id: 'podcast-1',
    coverUrl:
      'https://images.unsplash.com/photo-1574624046652-f6513419e6f7?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1350&q=80',
    publishedAt: new Date('2019-11-30'),
    title: '扭轉直覺偏誤，發現世界比你想像的更美好',
    categories: [
      {
        id: 'category-1',
        name: '職場溝通',
      },
      {
        id: 'category-2',
        name: '心理學',
      },
    ],
    description:
      '對大多數人而言，最大的問題不是無知，<br>而是知道的事情很多，卻都是錯的。<br><br>我們在面對問題的時候，經常會給出直覺的答案，但是很多我們以為理所當然的答案，事實上都不正確。那是因為，我們經常誤解自己所身處的世界。<br><br>世界級公共教育家漢斯．羅斯林發現了這個盲點，他希望幫助大家矯正認知上的偏誤，於是用他生命中最後的時光，提出了十種實用的思考工具，寫成《真確》一書。<br><br>這本書在談世界，談世界真正的樣子，以及你該如何真確思考，基於事實行動。<br>對大多數人而言，最大的問題不是無知，<br>而是知道的事情很多，卻都是錯的。<br><br>我們在面對問題的時候，經常會給出直覺的答案，但是很多我們以為理所當然的答案，事實上都不正確。那是因為，我們經常誤解自己所身處的世界。<br><br>世界級公共教育家漢斯．羅斯林發現了這個盲點，他希望幫助大家矯正認知上的偏誤，於是用他生命中最後的時光，提出了十種實用的思考工具，寫成《真確》一書。<br><br>這本書在談世界，談世界真正的樣子，以及你該如何真確思考，基於事實行動。',
  }

  return (
    <DefaultLayout noFooter>
      <div className="row no-gutters">
        <div className="col-12 col-lg-4">
          <PodcastProgramCover
            coverUrl={podcast.coverUrl}
            title={podcast.title}
            publishedAt={podcast.publishedAt}
            categories={podcast.categories}
          />
        </div>
        <div className="col-12 col-lg-8">
          <StyledContentWrapper>
            <div className="mb-5">
              <BraftContent>{podcast.description ? podcast.description : null}</BraftContent>
            </div>

            <div className="mb-5">
              <CreatorCard id="creator-1" />
            </div>
          </StyledContentWrapper>
        </div>
      </div>

      <PodcastPlayer />
    </DefaultLayout>
  )
}

export default PodcastProgramContentPage

import { Timeline } from 'antd'
import moment from 'moment'
import { groupBy } from 'ramda'
import React from 'react'
import styled from 'styled-components'
import PodcastProgramCard, { PodcastProgramCardProps } from './PodcastProgramCard'
import PodcastProgramPopover, { PodcastProgramPopoverProps } from './PodcastProgramPopover'

const StyledTitle = styled.div`
  color: var(--gray-darker);
  font-weight: bold;
  letter-spacing: 0.2px;
`
const StyledProgram = styled.div`
  margin-bottom: 1.25rem;
`

type PodcastProgramProps = PodcastProgramPopoverProps &
  PodcastProgramCardProps & {
    id: string
    publishedAt: Date
  }
const PodcastProgramTimeline: React.FC<{
  podcastPrograms: PodcastProgramProps[]
}> = ({ podcastPrograms }) => {
  const podcastProgramsGroupByDate: { [date: string]: PodcastProgramProps[] } = groupBy(
    podcast => moment(podcast.publishedAt).format('YYYY-MM-DD(dd)'),
    podcastPrograms,
  )

  return (
    <Timeline>
      {Object.keys(podcastProgramsGroupByDate).map((date: string) => (
        <Timeline.Item key={date}>
          <StyledTitle className="mb-4">{date}</StyledTitle>

          {podcastProgramsGroupByDate[date].map(podcastProgram => (
            <StyledProgram key={podcastProgram.id} className="pl-3" id={podcastProgram.id}>
              <PodcastProgramPopover
                title={podcastProgram.title}
                duration={podcastProgram.duration}
                description={podcastProgram.description}
                categories={podcastProgram.categories}
                creator={podcastProgram.creator}
              >
                <PodcastProgramCard
                  coverUrl={podcastProgram.coverUrl}
                  title={podcastProgram.title}
                  meta={podcastProgram.meta}
                  salePrice={podcastProgram.salePrice}
                  listPrice={podcastProgram.listPrice}
                />
              </PodcastProgramPopover>
            </StyledProgram>
          ))}
        </Timeline.Item>
      ))}
    </Timeline>
  )
}

export default PodcastProgramTimeline

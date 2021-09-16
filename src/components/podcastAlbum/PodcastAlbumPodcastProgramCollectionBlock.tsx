import React from 'react'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import { durationFormatter } from '../../helpers'
import EmptyCover from '../../images/default/empty-cover.png'
import { PodcastAlbumPodcastProgram } from '../../types/podcastAlbum'
import { CustomRatioImage } from '../common/Image'

const StyledWrapper = styled.div`
  margin-bottom: 1rem;
  background: white;
  border-radius: 4px;
  box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.1);
`
const StyledTitle = styled.div`
  overflow: hidden;
  color: var(--gray-darker);
  font-weight: bold;
  letter-spacing: 0.2px;
  white-space: nowrap;
  text-overflow: ellipsis;
`
const StyledDuration = styled.div`
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.58px;
  color: #fff;
  padding: 2px 4px;
  border-radius: 2px;
  background-color: rgba(0, 0, 0, 0.6);
`

const PodcastAlbumPodcastProgramCollectionBlock: React.FC<{
  podcastPrograms: Pick<PodcastAlbumPodcastProgram, 'id' | 'title' | 'coverUrl' | 'durationSecond'>[]
}> = ({ podcastPrograms }) => {
  return (
    <>
      {podcastPrograms.map(podcastProgram => (
        <Link
          key={podcastProgram.id}
          to={`/podcast-programs/${podcastProgram.id}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <StyledWrapper className="d-flex align-items-center justify-content-between">
            <div className="flex-grow-1 d-flex align-items-center justify-content-start">
              <CustomRatioImage
                width="100px"
                ratio={1}
                src={podcastProgram.coverUrl || EmptyCover}
                shape="rounded"
                className="mr-4"
              />
              <StyledTitle>{podcastProgram.title}</StyledTitle>
            </div>

            {
              <StyledDuration className="flex-shrink-0 text-right mr-4">
                {podcastProgram.durationSecond ? durationFormatter(podcastProgram.durationSecond) : '- - : - -'}
              </StyledDuration>
            }
          </StyledWrapper>
        </Link>
      ))}
    </>
  )
}

export default PodcastAlbumPodcastProgramCollectionBlock

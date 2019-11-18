import { Skeleton, Typography } from 'antd'
import React from 'react'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import EmptyCover from '../../images/default/empty-cover.png'

const StyledCard = styled.div`
  overflow: hidden;
  background: white;
  border-radius: 4px;
  box-shadow: 0 4px 12px 0 rgba(0, 0, 0, 0.15);
`
const StyledCover = styled.div<{ src: string }>`
  padding-top: 56.25%;
  background-image: url(${props => props.src});
  background-size: cover;
  background-position: center;
`
const StyledDescription = styled.div`
  padding: 1.25rem;
`
const StyledTitle = styled(Typography.Title)`
  && {
    margin-bottom: 1.25rem;
    color: var(--gray-darker);
    font-size: 18px;
    font-weight: bold;
    letter-spacing: 0.8px;
    height: 3rem;
  }
`
const StyledMeta = styled.div`
  color: var(--gray-dark);
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 0.4px;
`

type ProgramPackageCollectionBlockProps = {
  loading?: boolean
  error?: Error
  programPackages: {
    id: string
    coverUrl?: string
    title: string
    programCount: number
    totalDuration: number
  }[]
}
const ProgramPackageCollectionBlock: React.FC<ProgramPackageCollectionBlockProps> = ({
  loading,
  error,
  programPackages,
}) => {
  if (loading) {
    return (
      <div className="container py-3">
        <Typography.Title level={4}>課程組合</Typography.Title>
        <Skeleton active />
      </div>
    )
  }

  if (error) {
    return (
      <div className="container py-3">
        <Typography.Title level={4}>課程組合</Typography.Title>
        <div>讀取錯誤</div>
      </div>
    )
  }

  return (
    <div className="container py-3">
      <Typography.Title level={4} className="mb-4">
        課程組合
      </Typography.Title>
      <div className="row">
        {programPackages.map(programPackage => (
          <div key={programPackage.id} className="col-12 col-md-6 col-lg-4 mb-4">
            <Link to={`/program-packages/${programPackage.id}/content`}>
              <StyledCard>
                <StyledCover src={programPackage.coverUrl || EmptyCover} />
                <StyledDescription>
                  <StyledTitle level={2} ellipsis={{ rows: 2 }}>
                    {programPackage.title}
                  </StyledTitle>
                  {/* <StyledMeta>
                    {programPackage.programCount} 堂課・{Math.floor(programPackage.totalDuration / 60)} 分鐘
                  </StyledMeta> */}
                </StyledDescription>
              </StyledCard>
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ProgramPackageCollectionBlock

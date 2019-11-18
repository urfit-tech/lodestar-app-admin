import { Skeleton } from 'antd'
import React from 'react'
import ProgramCollection from './ProgramCollection'
import ProgramPackageBanner from './ProgramPackageBanner'

type ProgramPackageContentProps = {
  loading?: boolean
  error?: Error
  programPackage: {
    title: string
    coverUrl?: string
    programCount: number
    totalDuration: number
    programs: {
      id: string
      title: string
      coverUrl?: string
      categories: {
        id: string
        name: string
      }[]
    }[]
  }
}
const ProgramPackageContent: React.FC<ProgramPackageContentProps> = ({ loading, error, programPackage }) => {
  if (loading) {
    return <Skeleton active />
  }

  if (error) {
    return <div>讀取錯誤</div>
  }

  return (
    <div>
      <ProgramPackageBanner
        title={programPackage.title}
        coverUrl={programPackage.coverUrl}
        programCount={programPackage.programCount}
        totalDuration={programPackage.totalDuration}
      />
      <ProgramCollection programs={programPackage.programs} />
    </div>
  )
}

export default ProgramPackageContent

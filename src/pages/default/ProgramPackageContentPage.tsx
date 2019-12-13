import React from 'react'
import useRouter from 'use-react-router'
import DefaultLayout from '../../components/layout/DefaultLayout'
import ProgramPackageContent from '../../containers/package/ProgramPackageContent'

const ProgramPackageContentPage = () => {
  const { match } = useRouter<{ programPackageId: string }>()

  return (
    <DefaultLayout>
      <ProgramPackageContent programPackageId={match.params.programPackageId} />
    </DefaultLayout>
  )
}

export default ProgramPackageContentPage

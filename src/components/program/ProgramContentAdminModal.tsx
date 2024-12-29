import { Skeleton } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import { last } from 'ramda'
import React, { useEffect } from 'react'
import { useProgramContent } from '../../hooks/program'
import ProgramContentAdminBlock, { FieldProps } from './ProgramContentAdminBlock'

const ProgramContentAdminModal: React.FC<{
  programId: string
  programContentId: string
  onRefetch?: () => void
}> = ({ programId, programContentId, onRefetch }) => {
  const [form] = useForm<FieldProps>()
  const {
    loading: loadingProgramContent,
    programContent,
    refetch: refetchProgramContent,
  } = useProgramContent(programContentId)

  useEffect(() => {
    programContent?.videos?.length && form.setFieldsValue({ videoAttachment: last(programContent.videos) })
  }, [form, programContent?.videos])

  if (loadingProgramContent || !programContent) return <Skeleton active />

  return (
    <ProgramContentAdminBlock
      form={form}
      programContent={programContent}
      programContentId={programContentId}
      programId={programId}
      onRefetch={onRefetch}
      onProgramContentRefetch={refetchProgramContent}
    />
  )
}

export default ProgramContentAdminModal

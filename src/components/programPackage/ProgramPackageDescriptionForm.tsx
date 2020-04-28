import Form, { FormComponentProps } from 'antd/lib/form'
import React from 'react'
import { ProgramPackageProps } from '../../types/programPackage'

type ProgramPackageDescriptionFromProps = ProgramPackageProps & FormComponentProps

const ProgramPackageDescriptionForm: React.FC<ProgramPackageDescriptionFromProps> = ({
  form: { getFieldDecorator, resetFields, validateFields },
}) => {
  return <></>
}

export default Form.create<ProgramPackageDescriptionFromProps>()(ProgramPackageDescriptionForm)

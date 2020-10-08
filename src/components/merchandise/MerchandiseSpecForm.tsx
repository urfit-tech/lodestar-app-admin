import { CloseOutlined, UploadOutlined } from '@ant-design/icons'
import { useMutation } from '@apollo/react-hooks'
import { Button, Divider, Form, Input, message } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import axios, { Canceler } from 'axios'
import gql from 'graphql-tag'
import React, { Fragment, useContext, useRef, useState } from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import AppContext from '../../contexts/AppContext'
import { useAuth } from '../../contexts/AuthContext'
import { handleError, notEmpty, uploadFile } from '../../helpers'
import { commonMessages, errorMessages, merchandiseMessages } from '../../helpers/translation'
import { ReactComponent as PlusIcon } from '../../images/icon/plus.svg'
import { ReactComponent as TrashOIcon } from '../../images/icon/trash-o.svg'
import types from '../../types'
import { MerchandiseProps, MerchandiseSpecProps } from '../../types/merchandise'
import CurrencyInput from '../form/CurrencyInput'

const StyledLabel = styled.div`
  font-size: 14px;
`
const StyledDeleteButton = styled(Button)`
  margin-top: 33px;
`
const StyledFileItem = styled.div`
  color: var(--gray-darker);
  font-size: 14px;
  :hover {
    background-color: var(--gray-lighter);
  }
`

const MerchandiseSpecForm: React.FC<{
  merchandise: MerchandiseProps
  merchandiseId: string
  onRefetch?: () => void
}> = ({ merchandise, merchandiseId, onRefetch }) => {
  const { formatMessage } = useIntl()
  const [form] = useForm()
  const { authToken } = useAuth()
  const { id: appId } = useContext(AppContext)
  const uploadCanceler = useRef<Canceler>()
  const [insertMerchandiseSpecCollection] = useMutation<
    types.INSERT_MERCHANDISE_SPEC_COLLECTION,
    types.INSERT_MERCHANDISE_SPEC_COLLECTIONVariables
  >(INSERT_MERCHANDISE_SPEC_COLLECTION)
  const [loading, setLoading] = useState(false)
  const [specFiles, setSpecFiles] = useState<File[][]>(merchandise.specs.map(spec => spec.files.map(file => file.data)))

  const handleSubmit = (values: any) => {
    setLoading(true)
    const oldSpecIds: string[] = values.specs.map((spec: MerchandiseSpecProps) => spec.id).filter(notEmpty)
    console.log(specFiles)
    insertMerchandiseSpecCollection({
      variables: {
        merchandiseId,
        data: values.specs.map((spec: MerchandiseSpecProps, index: number) => ({
          merchandise_id: merchandiseId,
          id: spec.id || undefined,
          title: spec.title,
          list_price: spec.listPrice || 0,
          sale_price: spec.salePrice || null,
          quota: spec.quota || undefined,
          merchandise_spec_files: {
            data: specFiles[index].map(file => ({
              data: {
                lastModified: file.lastModified,
                name: file.name,
                size: file.size,
                type: file.type,
              },
            })),
          },
        })),
        archivedMerchandiseSpecIds: merchandise.specs
          .filter(spec => !oldSpecIds.includes(spec.id))
          .map(spec => spec.id),
      },
    })
      .then(async ({ data }) => {
        try {
          const existedFiles: File[] = merchandise.specs.map(spec => spec.files.map(file => file.data)).flat()
          for (const specFile of specFiles) {
            for (const file of specFile) {
              if (
                existedFiles.some(
                  existedFile => existedFile.name === file.name && existedFile.lastModified === file.lastModified,
                )
              ) {
                continue
              }
              await uploadFile(`merchandise_files/${appId}/${merchandiseId}_${file.name}`, file, authToken, {
                cancelToken: new axios.CancelToken(canceler => {
                  uploadCanceler.current = canceler
                }),
              })
            }
          }
        } catch (error) {
          return error
        }
        onRefetch && onRefetch()
        message.success(formatMessage(commonMessages.event.successfullySaved))
      })
      .catch(handleError)
      .finally(() => setLoading(false))
  }

  return (
    <Form
      form={form}
      layout="vertical"
      colon={false}
      hideRequiredMark
      initialValues={{
        specs: merchandise.specs.map(spec => ({
          ...spec,
          files: spec.files.map(file => file.data),
        })),
      }}
      onValuesChange={(values: any) => {
        const newFiles = values.specs.map((spec: any) => spec.files)
        if (typeof newFiles !== undefined) {
          setSpecFiles(specFiles.map((specFile, index) => newFiles[index] || specFile))
        }
      }}
      onFinish={handleSubmit}
    >
      <Form.List name="specs">
        {(fields, { add, remove }) => (
          <>
            {fields.map((field, index) => (
              <Fragment key={field.fieldKey}>
                {index !== 0 && <Divider className="my-4" />}
                <div className="d-flex justify-content-start">
                  <Form.Item className="d-none" name={[field.name, 'id']} fieldKey={[field.fieldKey, 'id']}>
                    <Input />
                  </Form.Item>
                  <Form.Item
                    name={[field.name, 'title']}
                    fieldKey={[field.fieldKey, 'title']}
                    label={<StyledLabel>{formatMessage(merchandiseMessages.label.specTitle)}</StyledLabel>}
                    rules={[
                      {
                        required: true,
                        message: formatMessage(errorMessages.form.isRequired, {
                          field: formatMessage(merchandiseMessages.label.specTitle),
                        }),
                      },
                    ]}
                    className="mb-0 mr-3"
                  >
                    <Input
                      placeholder={formatMessage(merchandiseMessages.text.specTitleHint)}
                      style={{ width: '320px' }}
                    />
                  </Form.Item>
                  <Form.Item
                    name={[field.name, 'listPrice']}
                    fieldKey={[field.fieldKey, 'listPrice']}
                    label={<StyledLabel>{formatMessage(commonMessages.term.listPrice)}</StyledLabel>}
                    className="mb-0 mr-3"
                    required
                  >
                    <CurrencyInput noUnit />
                  </Form.Item>
                  <Form.Item
                    name={[field.name, 'salePrice']}
                    fieldKey={[field.fieldKey, 'salePrice']}
                    label={<StyledLabel>{formatMessage(merchandiseMessages.label.specSalePrice)}</StyledLabel>}
                    className="mb-0 mr-3"
                  >
                    <CurrencyInput noUnit />
                  </Form.Item>

                  <Form.Item
                    name={[field.name, 'files']}
                    fieldKey={[field.fieldKey, 'files']}
                    label={<StyledLabel>{formatMessage(merchandiseMessages.label.deliveryItem)}</StyledLabel>}
                    className={!merchandise.isPhysical && !merchandise.isCustomized ? undefined : 'd-none'}
                  >
                    <MerchandiseSpecFileUpload />
                  </Form.Item>

                  {fields.length > 1 && (
                    <div className="flex-grow-1 text-right">
                      <StyledDeleteButton
                        type="link"
                        icon={<TrashOIcon />}
                        onClick={() => {
                          remove(field.name)
                          setSpecFiles(specFiles.filter((v, i) => i !== index))
                        }}
                      />
                    </div>
                  )}
                </div>
                <div>
                  {specFiles[index]?.map(file => (
                    <StyledFileItem
                      key={`${index}_${file.name}`}
                      className="d-flex align-items-center justify-content-between py-1 px-2"
                    >
                      <div>{file.name}</div>
                      <CloseOutlined
                        className="pointer-cursor"
                        onClick={() => {
                          setSpecFiles([
                            ...specFiles.slice(0, index),
                            specFiles[index].filter(v => v !== file),
                            ...specFiles.slice(index + 1),
                          ])
                        }}
                      />
                    </StyledFileItem>
                  ))}
                </div>
              </Fragment>
            ))}

            <Button
              type="link"
              icon={<PlusIcon />}
              className="my-4"
              onClick={() => {
                add({ listPrice: 0 })
                setSpecFiles([...specFiles, []])
              }}
            >
              {formatMessage(merchandiseMessages.ui.addSpec)}
            </Button>
          </>
        )}
      </Form.List>

      <div>
        <Button onClick={() => form.resetFields()} className="mr-2">
          {formatMessage(commonMessages.ui.cancel)}
        </Button>
        <Button type="primary" htmlType="submit" loading={loading}>
          {formatMessage(commonMessages.ui.save)}
        </Button>
      </div>
    </Form>
  )
}

const MerchandiseSpecFileUpload: React.FC<{
  value?: File[]
  onChange?: (value: File[]) => void
}> = ({ value, onChange }) => {
  const { formatMessage } = useIntl()
  const inputRef = useRef<HTMLInputElement | null>(null)

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        multiple
        hidden
        onChange={e => {
          if (!e.target.files || !e.target.files.length || !onChange) {
            return
          }

          const files: File[] = []
          for (let i = 0; i < e.target.files.length; i++) {
            const file = e.target.files.item(i)
            file && files.push(file)
          }

          onChange(files)
        }}
      />

      <Button icon={<UploadOutlined />} onClick={() => inputRef.current?.click()}>
        {formatMessage(commonMessages.ui.uploadFile)}
      </Button>
    </>
  )
}

const INSERT_MERCHANDISE_SPEC_COLLECTION = gql`
  mutation INSERT_MERCHANDISE_SPEC_COLLECTION(
    $merchandiseId: uuid!
    $data: [merchandise_spec_insert_input!]!
    $archivedMerchandiseSpecIds: [uuid!]!
  ) {
    delete_merchandise_spec_file(where: { merchandise_spec: { merchandise_id: { _eq: $merchandiseId } } }) {
      affected_rows
    }
    insert_merchandise_spec(
      objects: $data
      on_conflict: { constraint: merchandise_spec_pkey, update_columns: [title, list_price, sale_price, quota] }
    ) {
      returning {
        id
      }
    }
    update_merchandise_spec(where: { id: { _in: $archivedMerchandiseSpecIds } }, _set: { is_deleted: true }) {
      affected_rows
    }
  }
`

export default MerchandiseSpecForm

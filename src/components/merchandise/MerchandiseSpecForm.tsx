import { CloseOutlined, QuestionCircleFilled, UploadOutlined } from '@ant-design/icons'
import { gql, useMutation } from '@apollo/client'
import { Button, Checkbox, Divider, Form, Input, message, Tooltip } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import axios, { Canceler } from 'axios'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import { PeriodType } from 'lodestar-app-element/src/types/data'
import React, { Fragment, useEffect, useRef, useState } from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import hasura from '../../hasura'
import { handleError, notEmpty, uploadFile } from '../../helpers'
import { commonMessages, errorMessages, merchandiseMessages } from '../../helpers/translation'
import { ReactComponent as PlusIcon } from '../../images/icon/plus.svg'
import { ReactComponent as TrashOIcon } from '../../images/icon/trash-o.svg'
import { MerchandiseProps } from '../../types/merchandise'
import { StyledTips } from '../admin'
import CurrencyInput from '../form/CurrencyInput'
import PeriodSelector from '../form/PeriodSelector'

const StyledLabel = styled.div`
  font-size: 14px;
`
const StyledDeleteButton = styled(Button)`
  margin-top: 33px;
`
const StyledCloseIcon = styled(CloseOutlined)`
  color: transparent;
`
const StyledFileItem = styled.div`
  color: var(--gray-darker);
  font-size: 14px;

  :hover {
    background-color: var(--gray-lighter);
    ${StyledCloseIcon} {
      color: var(--gray-darker);
    }
  }
`

type FieldProps = {
  specs: {
    id: string
    title: string
    listPrice: number
    salePrice?: number | null
    quota?: number
  }[]
}

const MerchandiseSpecForm: React.FC<{
  merchandise: MerchandiseProps
  merchandiseId: string
  onRefetch?: () => void
}> = ({ merchandise, merchandiseId, onRefetch }) => {
  const { formatMessage } = useIntl()
  const [form] = useForm<FieldProps>()
  const { authToken } = useAuth()
  const { id: appId, enabledModules } = useApp()
  const [insertMerchandiseSpecCollection] = useMutation<
    hasura.INSERT_MERCHANDISE_SPEC_COLLECTION,
    hasura.INSERT_MERCHANDISE_SPEC_COLLECTIONVariables
  >(INSERT_MERCHANDISE_SPEC_COLLECTION)
  const [updateProductCoinBack] = useMutation<
    hasura.UPDATE_PRODUCT_COIN_BACK,
    hasura.UPDATE_PRODUCT_COIN_BACKVariables
  >(UPDATE_PRODUCT_COIN_BACK)

  const uploadCanceler = useRef<Canceler>()
  const [specFiles, setSpecFiles] = useState<File[][]>(merchandise.specs.map(spec => spec.files.map(file => file.data)))
  const [loading, setLoading] = useState(false)
  const [specsCoinBack, setSpecsCoinBack] = useState<
    { id?: string; hasCoinBack: boolean; coinBack?: number; coinBackPeriod?: { type: PeriodType; amount: number } }[]
  >(
    merchandise.specs.map(spec => ({
      id: spec.id,
      hasCoinBack: !!spec.coinBackPeriodType,
      coinBack: spec.coinBack || 0,
      coinBackPeriod: {
        type: spec.coinBackPeriodType ? (spec.coinBackPeriodType as PeriodType) : 'Y',
        amount: spec.coinBackPeriodAmount || 1,
      },
    })),
  )

  useEffect(() => {
    setSpecsCoinBack(
      merchandise.specs.map(spec => ({
        id: spec.id,
        hasCoinBack: !!spec.coinBackPeriodType,
        coinBack: spec.coinBack || 0,
        coinBackPeriod: {
          type: spec.coinBackPeriodType ? (spec.coinBackPeriodType as PeriodType) : 'Y',
          amount: spec.coinBackPeriodAmount || 1,
        },
      })),
    )
  }, [merchandise.specs])

  const handleSubmit = (values: FieldProps) => {
    setLoading(true)
    const currentSpecIds: string[] = values.specs.map(spec => spec.id).filter(notEmpty)
    insertMerchandiseSpecCollection({
      variables: {
        merchandiseId,
        data: values.specs.map((spec, index) => ({
          merchandise_id: merchandiseId,
          id: spec.id || undefined,
          title: spec.title || '',
          list_price: spec.listPrice || 0,
          sale_price: spec.salePrice ?? null,
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
          .filter(spec => !currentSpecIds.includes(spec.id))
          .map(spec => spec.id),
      },
    })
      .then(async ({ data }) => {
        // upload files
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
          process.env.NODE_ENV === 'development' && console.error(error)
          return error
        }

        // update coin back
        if (enabledModules.coin && enabledModules.coin_back) {
          const updatedProducts =
            data?.insert_merchandise_spec?.returning?.map((spec, index) => {
              const hasCoinBack = specsCoinBack[index].hasCoinBack
              const coinBack = specsCoinBack[index].coinBack
              const coinBackPeriod = specsCoinBack[index].coinBackPeriod
              return {
                id: `MerchandiseSpec_${spec.id}`,
                type: 'MerchandiseSpec',
                target: spec.id,
                coinBack: hasCoinBack ? coinBack : 0,
                coinPeriodAmount: hasCoinBack ? coinBackPeriod?.amount : null,
                coinPeriodType: hasCoinBack ? coinBackPeriod?.type : null,
              }
            }) || []
          try {
            for (const product of updatedProducts) {
              const productSetInput: hasura.UPDATE_PRODUCT_COIN_BACKVariables = {
                merchandiseSpecId: product.target,
                updated: {
                  coin_back: product.coinBack,
                  coin_period_type: product.coinPeriodType,
                  coin_period_amount: product.coinPeriodAmount,
                },
              }
              await updateProductCoinBack({ variables: productSetInput })
            }
          } catch (error) {}
        }
        message.success(formatMessage(commonMessages.event.successfullySaved))
        onRefetch?.()
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
          hasCoinBack: !!spec.coinBackPeriodType,
          coinBack: spec.coinBack,
          coinBackPeriod: { amount: spec.coinBackPeriodAmount || 1, type: spec.coinBackPeriodType as PeriodType },
          files: spec.files.map(file => file.data),
        })),
      }}
      onFinish={handleSubmit}
    >
      <Form.List name="specs">
        {(fields, { add, remove }) => (
          <>
            {fields.map((field, index) => (
              <Fragment key={field.fieldKey}>
                {index !== 0 && <Divider className="my-4" />}
                <div className="justify-content-start">
                  <Form.Item className="d-none" name={[field.name, 'id']} fieldKey={[field.fieldKey, 'id']}>
                    <Input />
                  </Form.Item>
                  <div className="d-flex mb-3">
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
                        style={{ width: '320px', minWidth: '60%' }}
                      />
                    </Form.Item>

                    <Form.Item
                      label={
                        <StyledLabel>
                          <span className="d-flex align-items-center">
                            {formatMessage(merchandiseMessages.label.deliveryItem)}
                            <Tooltip
                              placement="top"
                              title={
                                <StyledTips>{formatMessage(merchandiseMessages.text.deliveryItemHelp)}</StyledTips>
                              }
                            >
                              <QuestionCircleFilled className="ml-1" />
                            </Tooltip>
                          </span>
                        </StyledLabel>
                      }
                      className={!merchandise.isPhysical && !merchandise.isCustomized ? undefined : 'd-none'}
                    >
                      <MerchandiseSpecFileUpload
                        value={specFiles[index]}
                        onChange={value =>
                          setSpecFiles(specFiles.map((specFile, i) => (index === i ? value : specFile)))
                        }
                      />
                    </Form.Item>

                    {fields.length > 1 && (
                      <div className="flex-grow-1 text-right">
                        <StyledDeleteButton
                          type="link"
                          icon={<TrashOIcon />}
                          onClick={() => {
                            remove(field.name)
                            setSpecFiles(specFiles.filter((v, i) => i !== index))
                            setSpecsCoinBack(specsCoinBack.filter((v, i) => i !== index))
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
                        <div className="flex-grow-1">{file.name}</div>
                        <StyledCloseIcon
                          className="flex-shrink-0 ml-2 pointer-cursor"
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

                  <div className="d-flex" style={{ flexWrap: 'wrap' }}>
                    <div className="d-flex mb-3">
                      {/* 定價 */}
                      <Form.Item
                        name={[field.name, 'listPrice']}
                        fieldKey={[field.fieldKey, 'listPrice']}
                        label={<StyledLabel>{formatMessage(commonMessages.label.listPrice)}</StyledLabel>}
                        className="mb-0 mr-3"
                        required
                      >
                        <CurrencyInput noUnit />
                      </Form.Item>

                      {/* 優惠價 */}
                      {!!merchandise.soldAt && (
                        <Form.Item
                          name={[field.name, 'salePrice']}
                          fieldKey={[field.fieldKey, 'salePrice']}
                          label={<StyledLabel>{formatMessage(merchandiseMessages.label.specSalePrice)}</StyledLabel>}
                          className="mb-0 mr-3"
                        >
                          <CurrencyInput noUnit />
                        </Form.Item>
                      )}
                    </div>

                    {/* 加贈代幣 */}
                    {enabledModules.coin && enabledModules.coin_back && specsCoinBack[index]?.id && (
                      <div className="d-flex">
                        <div className="d-flex align-items-center mt-3">
                          <Checkbox
                            checked={specsCoinBack && specsCoinBack[index]?.hasCoinBack}
                            onChange={e =>
                              setSpecsCoinBack([
                                ...specsCoinBack.slice(0, index),
                                { ...specsCoinBack[index], hasCoinBack: e.target.checked },
                                ...specsCoinBack.slice(index + 1),
                              ])
                            }
                          >
                            {formatMessage(merchandiseMessages.ui.bonusTokens)}
                          </Checkbox>
                        </div>

                        {specsCoinBack[index].hasCoinBack && (
                          <>
                            <Form.Item
                              label={<StyledLabel>{formatMessage(merchandiseMessages.ui.tokenQuantity)}</StyledLabel>}
                              className="mb-0 mr-3"
                            >
                              <CurrencyInput
                                noUnit
                                value={specsCoinBack[index]?.coinBack}
                                onChange={value =>
                                  setSpecsCoinBack([
                                    ...specsCoinBack.slice(0, index),
                                    { ...specsCoinBack[index], coinBack: value || 0 },
                                    ...specsCoinBack.slice(index + 1),
                                  ])
                                }
                              />
                            </Form.Item>
                            <Form.Item
                              label={<StyledLabel>{formatMessage(merchandiseMessages.ui.expirationDate)}</StyledLabel>}
                              className="mb-0 mr-3"
                            >
                              <PeriodSelector
                                value={specsCoinBack[index]?.coinBackPeriod}
                                onChange={({ type, amount }) => {
                                  setSpecsCoinBack([
                                    ...specsCoinBack.slice(0, index),
                                    { ...specsCoinBack[index], coinBackPeriod: { type, amount } },
                                    ...specsCoinBack.slice(index + 1),
                                  ])
                                }}
                              />
                            </Form.Item>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </Fragment>
            ))}

            <Button
              type="link"
              icon={<PlusIcon />}
              className="my-4 d-flex align-items-center"
              onClick={() => {
                add({ listPrice: 0 })
                setSpecFiles([...specFiles, []])
                setSpecsCoinBack([
                  ...specsCoinBack,
                  { hasCoinBack: false, coinBack: 0, coinBackPeriod: { type: 'Y', amount: 1 } },
                ])
              }}
            >
              {formatMessage(merchandiseMessages.ui.addSpec)}
            </Button>
          </>
        )}
      </Form.List>

      <div>
        <Button
          onClick={() => {
            form.resetFields()
            setSpecFiles(merchandise.specs.map(spec => spec.files.map(file => file.data)))
            setSpecsCoinBack(
              merchandise.specs.map(spec => ({
                id: spec.id,
                hasCoinBack: !!spec.coinBackPeriodType,
                coinBack: spec.coinBack || 0,
                coinBackPeriod:
                  spec.coinBackPeriodType && spec.coinBackPeriodAmount
                    ? {
                        type: spec.coinBackPeriodType as PeriodType,
                        amount: spec.coinBackPeriodAmount,
                      }
                    : undefined,
              })),
            )
          }}
          className="mr-2"
        >
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

          // append new file into input value
          const files: File[] = value?.slice() || []
          for (let i = 0; i < e.target.files.length; i++) {
            const file = e.target.files.item(i)
            file && !files.some(v => v.name === file.name) && files.push(file)
          }

          onChange(files)
          e.target.value = ''
          e.target.files = null
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
        title
      }
    }
    update_merchandise_spec(where: { id: { _in: $archivedMerchandiseSpecIds } }, _set: { is_deleted: true }) {
      affected_rows
    }
  }
`

const UPDATE_PRODUCT_COIN_BACK = gql`
  mutation UPDATE_PRODUCT_COIN_BACK($merchandiseSpecId: String!, $updated: product_set_input!) {
    update_product(where: { target: { _eq: $merchandiseSpecId } }, _set: $updated) {
      affected_rows
      returning {
        id
        target
        type
        coin_back
        coin_period_type
        coin_period_amount
      }
    }
  }
`

export default MerchandiseSpecForm

import { QuestionCircleFilled } from '@ant-design/icons'
import { gql, useMutation, useQuery } from '@apollo/client'
import { FormControl, FormErrorMessage, Input, Radio, RadioGroup, Stack } from '@chakra-ui/react'
import { Button, message, Skeleton, Tooltip } from 'antd'
import axios, { Canceler } from 'axios'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import { uploadFile } from 'lodestar-app-element/src/helpers'
import React, { useRef, useState } from 'react'
import { Controller, SubmitHandler, useForm } from 'react-hook-form'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import { v4 as uuid } from 'uuid'
import hasura from '../../hasura'
import { handleError } from '../../helpers'
import { commonMessages } from '../../helpers/translation'
import { Gift } from '../../types/giftPlan'
import { StyledTips } from '../admin'
import AdminModal, { AdminModalProps } from '../admin/AdminModal'
import ImageUploader from '../common/ImageUploader'
import giftPlanMessages from './translation'

const StyledLabel = styled.label`
  margin-bottom: 4px;
  font-size: 14px;
  font-weight: 500;
  line-height: 1.71;
  letter-spacing: 0.4px;
  color: var(--gray-darker);
`
const StyledFormItem = styled.div`
  margin-bottom: 32px;
`

type GiftPlanFields = {
  giftPlanTitle?: string
  customGiftName?: string
  customGiftCoverUrl?: string
  isDeliverable?: boolean | string
}

const GiftPlanCollectionEditAdminModal: React.VFC<
  AdminModalProps & {
    giftPlan?: {
      id?: string
      title?: string
      giftPlanProductId?: string
    }
    giftId?: string
    setModalVisible?: (value: boolean) => void
    onRefetch?: () => void
  }
> = ({ giftPlan, giftId, setModalVisible, onRefetch, ...props }) => {
  const { formatMessage } = useIntl()
  const { id: appId } = useApp()
  const { currentMemberId, authToken } = useAuth()
  const uploadCanceler = useRef<Canceler>()
  const [loading, setLoading] = useState(false)
  const [coverImg, setCoverImg] = useState<File | null>(null)
  const { gift, refetchGift, giftLoading, giftError } = useGift({
    id: giftId !== undefined ? { _eq: giftId } : { _is_null: true },
  })
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<GiftPlanFields>()
  const [updateCustomGiftCoverUrl] = useMutation<
    hasura.UPDATE_CUSTOM_GIFT_COVER_URL,
    hasura.UPDATE_CUSTOM_GIFT_COVER_URLVariables
  >(UPDATE_CUSTOM_GIFT_COVER_URL)
  const [insertGiftPlan] = useMutation<hasura.INSERT_GIFT_PLAN, hasura.INSERT_GIFT_PLANVariables>(INSERT_GIFT_PLAN)
  const [updateGiftPlan] = useMutation<hasura.UPDATE_GIFT_PLAN, hasura.UPDATE_GIFT_PLANVariables>(UPDATE_GIFT_PLAN)
  const [upsertGift] = useMutation<hasura.UPSERT_GIFT, hasura.UPSERT_GIFTVariables>(UPSERT_GIFT)

  const onSubmit: SubmitHandler<GiftPlanFields> = values => {
    setLoading(true)
    const upsertGiftPlanProductId = giftPlan?.giftPlanProductId || uuid()
    const upsertGiftPlanId = giftPlan?.id || uuid()
    const upsertGiftId = gift.id || uuid()

    upsertGift({
      variables: {
        tokens: [
          {
            id: upsertGiftId,
            app_id: appId,
            type: 'gift',
            title: values.customGiftName,
            cover_url: values.customGiftCoverUrl,
            is_deliverable: values.isDeliverable === 'true',
          },
        ],
      },
    })
      .then(async () => {
        if (coverImg) {
          const coverId = uuid()
          try {
            await uploadFile(`gift_images/${appId}/${upsertGiftId || upsertGiftId}/${coverId}`, coverImg, authToken, {
              cancelToken: new axios.CancelToken(canceler => {
                uploadCanceler.current = canceler
              }),
            })
          } catch (error) {
            process.env.NODE_ENV === 'development' && console.log(error)
            return error
          }
          await updateCustomGiftCoverUrl({
            variables: {
              tokenId: upsertGiftId || upsertGiftId,
              coverUrl: `https://${process.env.REACT_APP_S3_BUCKET}/gift_images/${appId}/${
                upsertGiftId || upsertGiftId
              }/${coverId}/400`,
            },
          }).catch(handleError)
        }
      })
      .catch(handleError)
      .finally(() => {
        if (giftPlan?.giftPlanProductId !== undefined) {
          updateGiftPlan({
            variables: {
              giftPlanId: upsertGiftPlanId,
              title: values.giftPlanTitle || '',
            },
          })
            .then(() => {
              onRefetch?.()
              refetchGift().then(() => {
                setLoading(false)
                setModalVisible?.(false)
                message.success(formatMessage(commonMessages.event.successfullySaved))
              })
            })
            .catch(handleError)
        } else {
          insertGiftPlan({
            variables: {
              giftPlanId: upsertGiftPlanId,
              appId: appId,
              giftPlanTitle: values.giftPlanTitle || '',
              editorId: currentMemberId,
              giftPlanProductId: upsertGiftPlanProductId,
              productId: `Token_${upsertGiftId}`,
            },
          })
            .then(() => {
              onRefetch?.()
              refetchGift().then(() => {
                setLoading(false)
                setModalVisible?.(false)
                message.success(formatMessage(commonMessages.event.successfullySaved))
              })
            })
            .catch(handleError)
        }
        setCoverImg(null)
      })
  }

  return (
    <AdminModal
      title={formatMessage(giftPlanMessages.GiftPlanCollectionAdminModal.editGiftPlan)}
      footer={null}
      onCancel={() => setModalVisible?.(false)}
      {...props}
    >
      {giftLoading ? (
        <Skeleton active />
      ) : (
        <form onSubmit={handleSubmit(onSubmit)}>
          <FormControl id="giftPlanTitle" isInvalid={!!errors?.giftPlanTitle?.message}>
            <StyledFormItem>
              <StyledLabel htmlFor="giftPlanTitle">
                {formatMessage(giftPlanMessages.GiftPlanCollectionAdminModal.title)}
              </StyledLabel>
              <Controller
                name="giftPlanTitle"
                control={control}
                rules={{ required: formatMessage(giftPlanMessages.GiftPlanCollectionAdminModal.titleIsRequired) }}
                render={field => (
                  <>
                    <Input {...field} />
                    <FormErrorMessage>{errors.giftPlanTitle?.message}</FormErrorMessage>
                  </>
                )}
                defaultValue={giftPlan?.title || ''}
              />
            </StyledFormItem>
          </FormControl>
          <FormControl id="customGiftName" isInvalid={!!errors?.customGiftName?.message}>
            <StyledFormItem>
              <StyledLabel htmlFor="customGiftName">
                {formatMessage(giftPlanMessages.GiftPlanCollectionAdminModal.giftItemName)}
              </StyledLabel>
              <Controller
                name="customGiftName"
                control={control}
                rules={{
                  required: formatMessage(giftPlanMessages.GiftPlanCollectionAdminModal.customGiftNameIsRequired),
                }}
                render={field => (
                  <>
                    <Input {...field} />
                    <FormErrorMessage>{errors.customGiftName?.message}</FormErrorMessage>
                  </>
                )}
                defaultValue={gift.title || ''}
              />
            </StyledFormItem>
          </FormControl>
          <FormControl id="customGiftCoverUrl">
            <StyledFormItem>
              <StyledLabel className="d-flex align-items-center">
                {formatMessage(giftPlanMessages.GiftPlanCollectionAdminModal.giftCover)}
                <Tooltip
                  placement="top"
                  title={
                    <StyledTips>
                      {formatMessage(giftPlanMessages.GiftPlanCollectionAdminModal.giftCoverTips)}
                    </StyledTips>
                  }
                >
                  <QuestionCircleFilled className="ml-2" />
                </Tooltip>
              </StyledLabel>
              <Controller
                name="customGiftCoverUrl"
                control={control}
                render={field => {
                  return (
                    <ImageUploader
                      file={coverImg}
                      initialCoverUrl={gift.coverUrl || null}
                      onChange={file => setCoverImg(file)}
                    />
                  )
                }}
                defaultValue={gift.coverUrl || ''}
              />
            </StyledFormItem>
          </FormControl>
          <FormControl id="isDeliverable">
            <StyledFormItem>
              <StyledLabel className="d-flex align-items-center">
                {formatMessage(giftPlanMessages.GiftPlanCollectionAdminModal.giftDeliverMethod)}
              </StyledLabel>
              <Controller
                name="isDeliverable"
                control={control}
                render={field => (
                  <RadioGroup {...field}>
                    <Stack direction="column">
                      <Radio size="md" value="true">
                        {formatMessage(giftPlanMessages.GiftPlanCollectionAdminModal.isDeliverable)}
                      </Radio>
                      <Radio size="md" value="false">
                        {formatMessage(giftPlanMessages.GiftPlanCollectionAdminModal.isNotDeliverable)}
                      </Radio>
                    </Stack>
                  </RadioGroup>
                )}
                defaultValue={gift.isDeliverable?.toString() || 'true'}
              />
            </StyledFormItem>
          </FormControl>
          <div className="text-right">
            <Button className="mr-2" onClick={() => setModalVisible?.(false)}>
              {formatMessage(commonMessages['ui'].cancel)}
            </Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              {formatMessage(commonMessages['ui'].confirm)}
            </Button>
          </div>
        </form>
      )}
    </AdminModal>
  )
}

export default GiftPlanCollectionEditAdminModal

const useGift = (condition: hasura.GET_GIFTVariables['condition']) => {
  const { loading, error, data, refetch } = useQuery<hasura.GET_GIFT, hasura.GET_GIFTVariables>(GET_GIFT, {
    variables: {
      condition,
    },
  })

  const gift: Gift = {
    id: data?.token[0]?.id,
    title: data?.token[0]?.title || '',
    coverUrl: data?.token[0]?.cover_url || '',
    isDeliverable: data?.token[0]?.is_deliverable,
  } || {
    id: uuid(),
    title: '',
    coverUrl: '',
    isDeliverable: true,
  }

  return {
    gift: gift,
    refetchGift: refetch,
    giftLoading: loading,
    giftError: error,
  }
}

const GET_GIFT = gql`
  query GET_GIFT($condition: token_bool_exp!) {
    token(where: $condition) {
      id
      title
      cover_url
      is_deliverable
    }
  }
`

const UPSERT_GIFT = gql`
  mutation UPSERT_GIFT($tokens: [token_insert_input!]!) {
    insert_token(
      objects: $tokens
      on_conflict: { constraint: token_pkey, update_columns: [title, cover_url, is_deliverable] }
    ) {
      affected_rows
      returning {
        id
      }
    }
  }
`

const INSERT_GIFT_PLAN = gql`
  mutation INSERT_GIFT_PLAN(
    $giftPlanId: uuid!
    $appId: String!
    $giftPlanTitle: String!
    $editorId: String
    $giftPlanProductId: uuid!
    $productId: String!
  ) {
    insert_gift_plan(
      objects: {
        gift_plan_products: { data: { id: $giftPlanProductId, product_id: $productId } }
        id: $giftPlanId
        app_id: $appId
        title: $giftPlanTitle
        editor_id: $editorId
      }
      on_conflict: { constraint: gift_plan_pkey, update_columns: title }
    ) {
      affected_rows
      returning {
        id
      }
    }
  }
`

const UPDATE_GIFT_PLAN = gql`
  mutation UPDATE_GIFT_PLAN($giftPlanId: uuid!, $title: String!) {
    update_gift_plan(where: { id: { _eq: $giftPlanId } }, _set: { title: $title }) {
      affected_rows
      returning {
        app_id
      }
    }
  }
`

const UPDATE_CUSTOM_GIFT_COVER_URL = gql`
  mutation UPDATE_CUSTOM_GIFT_COVER_URL($tokenId: uuid!, $coverUrl: String!) {
    update_token(where: { id: { _eq: $tokenId } }, _set: { cover_url: $coverUrl }) {
      affected_rows
    }
  }
`

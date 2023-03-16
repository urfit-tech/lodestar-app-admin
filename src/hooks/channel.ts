import { useMutation, useQuery } from '@apollo/react-hooks'
import gql from 'graphql-tag'
import hasura from '../hasura'

export const useProductChannelInfo = (appId: string, productId: string) => {
  const { loading, error, data, refetch } = useQuery<
    hasura.GET_PRODUCT_CHANNEL_INFO,
    hasura.GET_PRODUCT_CHANNEL_INFOVariables
  >(
    gql`
      query GET_PRODUCT_CHANNEL_INFO($appId: String, $productId: String) {
        app_channel(where: { app_id: { _eq: $appId } }) {
          id
          name
          product_channels(where: { product_id: { _eq: $productId } }) {
            id
            channel_sku
          }
        }
      }
    `,
    {
      variables: { appId, productId },
    },
  )

  const productChannelInfo = data?.app_channel.map(appChannel => {
    const productChannel = appChannel.product_channels[0]
    return {
      appChannelId: appChannel.id,
      appChannelName: appChannel.name,
      productChannelId: productChannel?.id,
      channelSku: productChannel?.channel_sku,
    }
  })

  return {
    loadingProductChannelInfo: loading,
    errorProductChannelInfo: error,
    productChannelInfo,
    refetchProductChannelInfo: refetch,
  }
}

export const useUpsertProductChannel = () => {
  const [upsertProductChannel] = useMutation<hasura.UPSERT_PRODUCT_CHANNEL, hasura.UPSERT_PRODUCT_CHANNELVariables>(
    gql`
      mutation UPSERT_PRODUCT_CHANNEL($productChannel: [product_channel_insert_input!]!) {
        insert_product_channel(
          objects: $productChannel
          on_conflict: { constraint: product_channel_product_id_channel_id_key, update_columns: [channel_sku] }
        ) {
          affected_rows
        }
      }
    `,
  )
  return { upsertProductChannel }
}

export const useDeleteProductChannel = () => {
  const [deleteProductChannel] = useMutation<hasura.DELETE_PRODUCT_CHANNEL, hasura.DELETE_PRODUCT_CHANNELVariables>(
    gql`
      mutation DELETE_PRODUCT_CHANNEL($channelIds: [uuid!]!, $productId: String!) {
        delete_product_channel(
          where: { _and: [{ channel_id: { _in: $channelIds } }, { product_id: { _eq: $productId } }] }
        ) {
          affected_rows
        }
      }
    `,
  )
  return { deleteProductChannel }
}

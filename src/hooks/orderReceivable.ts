import { gql, useMutation, useQuery } from "@apollo/client";
import hasura from "../hasura";

const useSetOrderToReceivableStatusCommand = () => {
  const [updateOrderProductDeliver] = useMutation(UPDATE_ORDER_PRODUCTS_DELIVERED_AT);

  const setOrderToReceivableStatusCommand = async ({
    orderProductId,
    deliveredAt,
  }: {
    orderProductId: string;
    deliveredAt: Date | string;
  }) => {
    const formattedDate = deliveredAt 
      ? (deliveredAt instanceof Date ? deliveredAt : new Date(deliveredAt))
      : null;

    await updateOrderProductDeliver({
      variables: {
        orderProductId,
        deliveredAt: formattedDate,
      },
    });
  };

  return {
    setOrderToReceivableStatusCommand,
  };
};

const useOrderReceivableStatusQuery = (orderId: string) => {
  const { data, loading, error } = useQuery(GET_ORDER_RECEIVABLE_STATUS, {
    variables: {
      orderId: orderId || ''
    }
  });

  if (loading) return { loading: true }
  if (error) return { error: error }

  type Order = {
    orderId: string,
    orderStatus: string,
    orderProducts: {
      id: string,
      deliveredAt: string,
    }[],
    paymentLogs: {
      no: string,
      status: string,
      price: number,
    }[],
  }

  const order: Order = {
    orderId: data?.order_log[0]?.id,
    orderStatus: data?.order_log[0]?.status,
    orderProducts: data?.order_log[0]?.order_products.map((orderProduct: any) => ({
      id: orderProduct.id,
      deliveredAt: orderProduct.delivered_at,
    })),
    paymentLogs: data?.order_log[0]?.payment_logs.map((paymentLog: any) => ({
      no: paymentLog.no,
      status: paymentLog.status,
      price: paymentLog.price,
    })),
  }

  const accountReceivableCondition = (order: Order) => {

    const isNotSuccessOrderStatus = order?.orderStatus !== 'SUCCESS'

  
    const allProductsDelivered = order?.orderProducts?.every(
      (orderProduct: any) => orderProduct.deliveredAt !== null
    );

    return isNotSuccessOrderStatus && allProductsDelivered;
  };

  const notPayYetPaymentLogCondition = (order: Order) => {
    return order?.paymentLogs?.filter((paymentLog: {
      no: string,
      status: string,
    }) => paymentLog.status !== 'SUCCESS');
  }

  const isAccountReceivable = accountReceivableCondition(order)

  const notPayYetPaymentLog = notPayYetPaymentLogCondition(order)

  return { isAccountReceivable, notPayYetPaymentLog }
}

const UPDATE_ORDER_PRODUCTS_DELIVERED_AT = gql`
  mutation UPDATE_ORDER_PRODUCTS_DELIVERED_AT(
    $orderId: String
    $deliveredAt: timestamp
  ) {
    update_order_product(
      _set: { delivered_at: $deliveredAt }
      where: { order_id: { _eq: $orderId } }
    ) {
      affected_rows
    }
  }
`;


const GET_ORDER_RECEIVABLE_STATUS = gql`
  query GET_ORDER_RECEIVABLE_STATUS($orderId: String) {
    order_log(where: { id: { _eq: $orderId } }) {
      id,
      status,
      order_products {
        id,
        delivered_at
      }
      payment_logs {
        no,
        status,
        price
      }
    }
  }
`;


export { useSetOrderToReceivableStatusCommand, useOrderReceivableStatusQuery };


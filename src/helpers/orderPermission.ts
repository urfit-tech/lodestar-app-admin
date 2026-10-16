import axios from 'axios'

/**
 * 與 lodestar-app-backend src/helpers/orderGuards.ts 的 canOrderForOthers 同步（2026-10-13 盤點 doc §7）。
 * /order/create 只讓 app-owner、MEMBER_ORDER_CREATE、MEMBER_CONTRACT_INSERT、APPOINTMENT_PLAN_ADMIN 帶他人 memberId，
 * 否則回 403 E_ORDER_FIELD_FORBIDDEN。前端的代客下單入口用同一條規則決定要不要顯示。
 */
export const ORDER_FOR_OTHERS_PERMISSIONS = ['MEMBER_ORDER_CREATE', 'MEMBER_CONTRACT_INSERT', 'APPOINTMENT_PLAN_ADMIN']

export const canOrderForOthers = (currentUserRole: string, permissions: { [key: string]: boolean }) =>
  currentUserRole === 'app-owner' || ORDER_FOR_OTHERS_PERMISSIONS.some(permission => Boolean(permissions[permission]))

/** 後端 order guard 的 403：{ code: 'E_ORDER_FIELD_FORBIDDEN', message, result: null } */
export const isOrderFieldForbiddenError = (error: unknown): boolean =>
  axios.isAxiosError(error) &&
  error.response?.status === 403 &&
  (error.response.data as { code?: string } | undefined)?.code === 'E_ORDER_FIELD_FORBIDDEN'

import { useMutation } from '@apollo/react-hooks'
import { Button, Form, Input, InputNumber, message, Switch } from 'antd'
import { CardProps } from 'antd/lib/card'
import { useForm } from 'antd/lib/form/Form'
import gql from 'graphql-tag'
import { keys } from 'ramda'
import React, { useState } from 'react'
import { defineMessages, useIntl } from 'react-intl'
import { useApp } from '../../contexts/AppContext'
import hasura from '../../hasura'
import { handleError } from '../../helpers'
import { commonMessages } from '../../helpers/translation'
import AdminCard from '../admin/AdminCard'

export type AppSettings = {
  [key: string]: {
    value: string
    type: string
    options: any
    isProtected: boolean
    isRequired: boolean
  }
}

type FieldProps = { [key: string]: string }

const AppSettingCard: React.FC<
  CardProps & {
    appId: string
    settings: AppSettings
  }
> = ({ appId, settings, ...cardProps }) => {
  const { formatMessage } = useIntl()
  const [form] = useForm<FieldProps>()
  const { loading: loadingApp, refetch: refetchApp, settings: appSettings, ...app } = useApp()
  const [updateAppSettings] = useMutation<hasura.UPSERT_APP_SETTINGS, hasura.UPSERT_APP_SETTINGSVariables>(
    UPSERT_APP_SETTINGS,
  )
  const [loading, setLoading] = useState(false)

  const handleSubmit = (values: FieldProps) => {
    setLoading(true)
    updateAppSettings({
      variables: {
        appSettings: Object.keys(values)
          .filter(key => values[key as keyof FieldProps])
          .map(key => ({
            app_id: app.id,
            key,
            value: values[key as keyof FieldProps],
          })),
      },
    })
      .then(() => {
        message.success(formatMessage(commonMessages.event.successfullySaved))
        refetchApp?.()
      })
      .catch(handleError)
      .finally(() => setLoading(false))
  }

  return (
    <AdminCard {...cardProps} loading={loadingApp}>
      <Form
        form={form}
        labelAlign="left"
        labelCol={{ md: { span: 6 } }}
        wrapperCol={{ md: { span: 18 } }}
        colon={false}
        hideRequiredMark
        onFinish={handleSubmit}
        initialValues={appSettings}
      >
        {keys(settings).map(key => {
          const setting = settings[key]
          const label = formatMessage(messages[key as keyof typeof messages])
          return (
            <>
              {setting.type === 'string' && (
                <Form.Item key={key} label={label} name={key}>
                  <Input disabled={setting.isProtected} />
                </Form.Item>
              )}
              {setting.type === 'number' && (
                <Form.Item key={key} label={label} name={key}>
                  <InputNumber disabled={setting.isProtected} />
                </Form.Item>
              )}
              {setting.type === 'boolean' && (
                <Form.Item key={key} label={label} name={key}>
                  <Switch disabled={setting.isProtected} />
                </Form.Item>
              )}
            </>
          )
        })}
        <Form.Item wrapperCol={{ md: { offset: 6 } }}>
          <Button className="mr-2" onClick={() => form.resetFields()}>
            {formatMessage(commonMessages.ui.cancel)}
          </Button>
          <Button type="primary" htmlType="submit" loading={loading}>
            {formatMessage(commonMessages.ui.save)}
          </Button>
        </Form.Item>
      </Form>
    </AdminCard>
  )
}

const UPSERT_APP_SETTINGS = gql`
  mutation UPSERT_APP_SETTINGS($appSettings: [app_setting_insert_input!]!) {
    insert_app_setting(
      objects: $appSettings
      on_conflict: { update_columns: value, constraint: app_setting_app_id_key_key }
    ) {
      affected_rows
    }
  }
`

const messages = defineMessages({
  'admin.app_owner.redirect': { id: 'admin.app_owner.redirect', defaultMessage: '首頁轉址' },
  'admin_repo.branch': { id: 'admin_repo.branch', defaultMessage: 'admin_repo.branch' },
  'app_repo.branch': { id: 'app_repo.branch', defaultMessage: 'app_repo.branch' },
  'app_repo.name': { id: 'app_repo.name', defaultMessage: 'app_repo.name' },
  'auth.commonhealth.client_id': { id: 'auth.commonhealth.client_id', defaultMessage: 'auth.commonhealth.client_id' },
  'auth.commonhealth.endpoint': { id: 'auth.commonhealth.endpoint', defaultMessage: 'auth.commonhealth.endpoint' },
  'auth.facebook_app_id': { id: 'auth.facebook_app_id', defaultMessage: 'auth.facebook_app_id' },
  'auth.google_client_id': { id: 'auth.google_client_id', defaultMessage: 'auth.google_client_id' },
  'auth.line_client_id': { id: 'auth.line_client_id', defaultMessage: 'auth.line_client_id' },
  'auth.line_client_secret': { id: 'auth.line_client_secret', defaultMessage: 'auth.line_client_secret' },
  'auth.parenting_client_id': { id: 'auth.parenting_client_id', defaultMessage: 'auth.parenting_client_id' },
  'auth.parenting.endpoint': { id: 'auth.parenting.endpoint', defaultMessage: 'auth.parenting.endpoint' },
  'call_server.origin': { id: 'call_server.origin', defaultMessage: 'call_server.origin' },
  'chailease.api_key': { id: 'chailease.api_key', defaultMessage: 'chailease.api_key' },
  'chakraTheme.colors.primary.500': {
    id: 'chakraTheme.colors.primary.500',
    defaultMessage: 'chakraTheme.colors.primary.500',
  },
  'chakraTheme.colors.primary.600': {
    id: 'chakraTheme.colors.primary.600',
    defaultMessage: 'chakraTheme.colors.primary.600',
  },
  'coin.exchange_rate': { id: 'coin.exchange_rate', defaultMessage: 'coin.exchange_rate' },
  'coin.name': { id: 'coin.name', defaultMessage: 'coin.name' },
  'coin.unit': { id: 'coin.unit', defaultMessage: 'coin.unit' },
  currency_id: { id: 'currency_id', defaultMessage: 'currency_id' },
  customer_support_link: { id: 'customer_support_link', defaultMessage: 'customer_support_link' },
  'custom.project.plan_price_style': {
    id: 'custom.project.plan_price_style',
    defaultMessage: 'custom.project.plan_price_style',
  },
  default_group_buying_discount_ratio: {
    id: 'default_group_buying_discount_ratio',
    defaultMessage: 'default_group_buying_discount_ratio',
  },
  default_group_buying_limit: { id: 'default_group_buying_limit', defaultMessage: 'default_group_buying_limit' },
  description: { id: 'description', defaultMessage: 'description' },
  'extension.api': { id: 'extension.api', defaultMessage: 'extension.api' },
  'facebook.domain.verification': {
    id: 'facebook.domain.verification',
    defaultMessage: 'facebook.domain.verification',
  },
  favicon: { id: 'favicon', defaultMessage: 'favicon' },
  'feature.chailease_lookup': { id: 'feature.chailease_lookup', defaultMessage: 'feature.chailease_lookup' },
  'feature.modify_order_status': { id: 'feature.modify_order_status', defaultMessage: 'feature.modify_order_status' },
  'feature.swarmify.enabled': { id: 'feature.swarmify.enabled', defaultMessage: 'feature.swarmify.enabled' },
  'footer.type': { id: 'footer.type', defaultMessage: 'footer.type' },
  homepage_cover_slides: { id: 'homepage_cover_slides', defaultMessage: 'homepage_cover_slides' },
  'home.redirect': { id: 'home.redirect', defaultMessage: 'home.redirect' },
  host: { id: 'host', defaultMessage: 'host' },
  'line.account_link.is_already_linked_message': {
    id: 'line.account_link.is_already_linked_message',
    defaultMessage: 'line.account_link.is_already_linked_message',
  },
  'line.account_link.message': { id: 'line.account_link.message', defaultMessage: 'line.account_link.message' },
  'line.account_link.successfully_message': {
    id: 'line.account_link.successfully_message',
    defaultMessage: 'line.account_link.successfully_message',
  },
  'line.account_link.trigger_message': {
    id: 'line.account_link.trigger_message',
    defaultMessage: 'line.account_link.trigger_message',
  },
  'line.auto_reply.excluded_trigger_message': {
    id: 'line.auto_reply.excluded_trigger_message',
    defaultMessage: 'line.auto_reply.excluded_trigger_message',
  },
  'line.auto_reply.excluded_trigger_message.enable': {
    id: 'line.auto_reply.excluded_trigger_message.enable',
    defaultMessage: 'line.auto_reply.excluded_trigger_message.enable',
  },
  'line.auto_reply.message': { id: 'line.auto_reply.message', defaultMessage: 'line.auto_reply.message' },
  'line.carousel_template.empty_program': {
    id: 'line.carousel_template.empty_program',
    defaultMessage: 'line.carousel_template.empty_program',
  },
  'line.carousel_template.program': {
    id: 'line.carousel_template.program',
    defaultMessage: 'line.carousel_template.program',
  },
  'line.carousel_template.program.content': {
    id: 'line.carousel_template.program.content',
    defaultMessage: 'line.carousel_template.program.content',
  },
  'line.carousel_template.program.content_limit': {
    id: 'line.carousel_template.program.content_limit',
    defaultMessage: 'line.carousel_template.program.content_limit',
  },
  'line.carousel_template.program.trigger_message': {
    id: 'line.carousel_template.program.trigger_message',
    defaultMessage: 'line.carousel_template.program.trigger_message',
  },
  'line.carousel_template.program.trigger_message_unbind': {
    id: 'line.carousel_template.program.trigger_message_unbind',
    defaultMessage: 'line.carousel_template.program.trigger_message_unbind',
  },
  'line.channel_id': { id: 'line.channel_id', defaultMessage: 'line.channel_id' },
  'line.rich_menu.account_linked_id': {
    id: 'line.rich_menu.account_linked_id',
    defaultMessage: 'line.rich_menu.account_linked_id',
  },
  'line.rich_menu.action.already_linked_block_a': {
    id: 'line.rich_menu.action.already_linked_block_a',
    defaultMessage: 'line.rich_menu.action.already_linked_block_a',
  },
  'line.rich_menu.action.already_linked_block_b': {
    id: 'line.rich_menu.action.already_linked_block_b',
    defaultMessage: 'line.rich_menu.action.already_linked_block_b',
  },
  'line.rich_menu.action.already_linked_block_c': {
    id: 'line.rich_menu.action.already_linked_block_c',
    defaultMessage: 'line.rich_menu.action.already_linked_block_c',
  },
  'line.rich_menu.action.already_linked_block_d': {
    id: 'line.rich_menu.action.already_linked_block_d',
    defaultMessage: 'line.rich_menu.action.already_linked_block_d',
  },
  'line.rich_menu.action.already_linked_block_e': {
    id: 'line.rich_menu.action.already_linked_block_e',
    defaultMessage: 'line.rich_menu.action.already_linked_block_e',
  },
  'line.rich_menu.action.already_linked_block_f': {
    id: 'line.rich_menu.action.already_linked_block_f',
    defaultMessage: 'line.rich_menu.action.already_linked_block_f',
  },
  'line.rich_menu.action.block_a': {
    id: 'line.rich_menu.action.block_a',
    defaultMessage: 'line.rich_menu.action.block_a',
  },
  'line.rich_menu.action.block_b': {
    id: 'line.rich_menu.action.block_b',
    defaultMessage: 'line.rich_menu.action.block_b',
  },
  'line.rich_menu.action.block_c': {
    id: 'line.rich_menu.action.block_c',
    defaultMessage: 'line.rich_menu.action.block_c',
  },
  'line.rich_menu.action.block_d': {
    id: 'line.rich_menu.action.block_d',
    defaultMessage: 'line.rich_menu.action.block_d',
  },
  'line.rich_menu.action.block_e': {
    id: 'line.rich_menu.action.block_e',
    defaultMessage: 'line.rich_menu.action.block_e',
  },
  'line.rich_menu.action.block_f': {
    id: 'line.rich_menu.action.block_f',
    defaultMessage: 'line.rich_menu.action.block_f',
  },
  'line.rich_menu.default_id': { id: 'line.rich_menu.default_id', defaultMessage: 'line.rich_menu.default_id' },
  'line.rich_menu.param.already_linked_block_a': {
    id: 'line.rich_menu.param.already_linked_block_a',
    defaultMessage: 'line.rich_menu.param.already_linked_block_a',
  },
  'line.rich_menu.param.already_linked_block_b': {
    id: 'line.rich_menu.param.already_linked_block_b',
    defaultMessage: 'line.rich_menu.param.already_linked_block_b',
  },
  'line.rich_menu.param.already_linked_block_c': {
    id: 'line.rich_menu.param.already_linked_block_c',
    defaultMessage: 'line.rich_menu.param.already_linked_block_c',
  },
  'line.rich_menu.param.already_linked_block_d': {
    id: 'line.rich_menu.param.already_linked_block_d',
    defaultMessage: 'line.rich_menu.param.already_linked_block_d',
  },
  'line.rich_menu.param.already_linked_block_e': {
    id: 'line.rich_menu.param.already_linked_block_e',
    defaultMessage: 'line.rich_menu.param.already_linked_block_e',
  },
  'line.rich_menu.param.already_linked_block_f': {
    id: 'line.rich_menu.param.already_linked_block_f',
    defaultMessage: 'line.rich_menu.param.already_linked_block_f',
  },
  'line.rich_menu.param.block_a': {
    id: 'line.rich_menu.param.block_a',
    defaultMessage: 'line.rich_menu.param.block_a',
  },
  'line.rich_menu.param.block_b': {
    id: 'line.rich_menu.param.block_b',
    defaultMessage: 'line.rich_menu.param.block_b',
  },
  'line.rich_menu.param.block_c': {
    id: 'line.rich_menu.param.block_c',
    defaultMessage: 'line.rich_menu.param.block_c',
  },
  'line.rich_menu.param.block_d': {
    id: 'line.rich_menu.param.block_d',
    defaultMessage: 'line.rich_menu.param.block_d',
  },
  'line.rich_menu.param.block_e': {
    id: 'line.rich_menu.param.block_e',
    defaultMessage: 'line.rich_menu.param.block_e',
  },
  'line.rich_menu.param_block_f': {
    id: 'line.rich_menu.param_block_f',
    defaultMessage: 'line.rich_menu.param_block_f',
  },
  'locale.languages': { id: 'locale.languages', defaultMessage: 'locale.languages' },
  logo: { id: 'logo', defaultMessage: 'logo' },
  name: { id: 'name', defaultMessage: 'name' },
  'open_graph.description': { id: 'open_graph.description', defaultMessage: 'open_graph.description' },
  'open_graph.image': { id: 'open_graph.image', defaultMessage: 'open_graph.image' },
  'open_graph.title': { id: 'open_graph.title', defaultMessage: 'open_graph.title' },
  'open_graph.url': { id: 'open_graph.url', defaultMessage: 'open_graph.url' },
  'order.commonhealth.client_id': {
    id: 'order.commonhealth.client_id',
    defaultMessage: 'order.commonhealth.client_id',
  },
  'order.commonhealth.endpoint': { id: 'order.commonhealth.endpoint', defaultMessage: 'order.commonhealth.endpoint' },
  'order.parenting.client_id': { id: 'order.parenting.client_id', defaultMessage: 'order.parenting.client_id' },
  'order.parenting.enable': { id: 'order.parenting.enable', defaultMessage: 'order.parenting.enable' },
  'order.parenting.endpoint': { id: 'order.parenting.endpoint', defaultMessage: 'order.parenting.endpoint' },
  'order.parenting.id_regex': { id: 'order.parenting.id_regex', defaultMessage: 'order.parenting.id_regex' },
  'payment.commonhealth.client_account': {
    id: 'payment.commonhealth.client_account',
    defaultMessage: 'payment.commonhealth.client_account',
  },
  'payment.commonhealth.endpoint': {
    id: 'payment.commonhealth.endpoint',
    defaultMessage: 'payment.commonhealth.endpoint',
  },
  'payment.gateway.default': { id: 'payment.gateway.default', defaultMessage: 'payment.gateway.default' },
  'payment.gateway.default_method': {
    id: 'payment.gateway.default_method',
    defaultMessage: 'payment.gateway.default_method',
  },
  'payment_gateway.groupBuying': { id: 'payment_gateway.groupBuying', defaultMessage: 'payment_gateway.groupBuying' },
  'payment.matching_due_days': { id: 'payment.matching_due_days', defaultMessage: 'payment.matching_due_days' },
  'payment.parenting.client_account': {
    id: 'payment.parenting.client_account',
    defaultMessage: 'payment.parenting.client_account',
  },
  'payment.parenting.credit.enable': {
    id: 'payment.parenting.credit.enable',
    defaultMessage: 'payment.parenting.credit.enable',
  },
  'payment.parenting.endpoint': { id: 'payment.parenting.endpoint', defaultMessage: 'payment.parenting.endpoint' },
  'payment.paypal.credit.enable': {
    id: 'payment.paypal.credit.enable',
    defaultMessage: 'payment.paypal.credit.enable',
  },
  'payment.spgateway.barcode.enable': {
    id: 'payment.spgateway.barcode.enable',
    defaultMessage: 'payment.spgateway.barcode.enable',
  },
  'payment.spgateway.credit.enable': {
    id: 'payment.spgateway.credit.enable',
    defaultMessage: 'payment.spgateway.credit.enable',
  },
  'payment.spgateway.cvs.enable': {
    id: 'payment.spgateway.cvs.enable',
    defaultMessage: 'payment.spgateway.cvs.enable',
  },
  'payment.spgateway.instflag.enable': {
    id: 'payment.spgateway.instflag.enable',
    defaultMessage: 'payment.spgateway.instflag.enable',
  },
  'payment.spgateway.instflag.staging': {
    id: 'payment.spgateway.instflag.staging',
    defaultMessage: 'payment.spgateway.instflag.staging',
  },
  'payment.spgateway.unionpay.enable': {
    id: 'payment.spgateway.unionpay.enable',
    defaultMessage: 'payment.spgateway.unionpay.enable',
  },
  'payment.spgateway.vacc.enable': {
    id: 'payment.spgateway.vacc.enable',
    defaultMessage: 'payment.spgateway.vacc.enable',
  },
  'payment.spgateway.webatm.enable': {
    id: 'payment.spgateway.webatm.enable',
    defaultMessage: 'payment.spgateway.webatm.enable',
  },
  'program_collection_banner.enabled': {
    id: 'program_collection_banner.enabled',
    defaultMessage: 'program_collection_banner.enabled',
  },
  'program_collection_banner.img_url@0': {
    id: 'program_collection_banner.img_url@0',
    defaultMessage: 'program_collection_banner.img_url@0',
  },
  'program_collection_banner.img_url@425': {
    id: 'program_collection_banner.img_url@425',
    defaultMessage: 'program_collection_banner.img_url@425',
  },
  'program_collection_banner.link': {
    id: 'program_collection_banner.link',
    defaultMessage: 'program_collection_banner.link',
  },
  'seo.host': { id: 'seo.host', defaultMessage: 'seo.host' },
  'seo.logo': { id: 'seo.logo', defaultMessage: 'seo.logo' },
  'seo.meta': { id: 'seo.meta', defaultMessage: 'seo.meta' },
  'seo.name': { id: 'seo.name', defaultMessage: 'seo.name' },
  'seo.url': { id: 'seo.url', defaultMessage: 'seo.url' },
  'swarmify.cdn_key': { id: 'swarmify.cdn_key', defaultMessage: 'swarmify.cdn_key' },
  'tappay.app_id': { id: 'tappay.app_id', defaultMessage: 'tappay.app_id' },
  'tappay.app_key': { id: 'tappay.app_key', defaultMessage: 'tappay.app_key' },
  'tappay.dry_run': { id: 'tappay.dry_run', defaultMessage: 'tappay.dry_run' },
  'theme.@black': { id: 'theme.@black', defaultMessage: 'theme.@black' },
  'theme.@btn-border-radius-base': {
    id: 'theme.@btn-border-radius-base',
    defaultMessage: 'theme.@btn-border-radius-base',
  },
  'theme.@btn-danger-bg': { id: 'theme.@btn-danger-bg', defaultMessage: 'theme.@btn-danger-bg' },
  'theme.@btn-danger-border': { id: 'theme.@btn-danger-border', defaultMessage: 'theme.@btn-danger-border' },
  'theme.@btn-danger-color': { id: 'theme.@btn-danger-color', defaultMessage: 'theme.@btn-danger-color' },
  'theme.@btn-default-color': { id: 'theme.@btn-default-color', defaultMessage: 'theme.@btn-default-color' },
  'theme.@btn-font-size-lg': { id: 'theme.@btn-font-size-lg', defaultMessage: 'theme.@btn-font-size-lg' },
  'theme.@btn-font-size-sm': { id: 'theme.@btn-font-size-sm', defaultMessage: 'theme.@btn-font-size-sm' },
  'theme.@btn-primary-bg': { id: 'theme.@btn-primary-bg', defaultMessage: 'theme.@btn-primary-bg' },
  'theme.@btn-primary-border': { id: 'theme.@btn-primary-border', defaultMessage: 'theme.@btn-primary-border' },
  'theme.@btn-primary-color': { id: 'theme.@btn-primary-color', defaultMessage: 'theme.@btn-primary-color' },
  'theme.@error-color': { id: 'theme.@error-color', defaultMessage: 'theme.@error-color' },
  'theme.@font-size-base': { id: 'theme.@font-size-base', defaultMessage: 'theme.@font-size-base' },
  'theme.@font-size-lg': { id: 'theme.@font-size-lg', defaultMessage: 'theme.@font-size-lg' },
  'theme.@font-size-sm': { id: 'theme.@font-size-sm', defaultMessage: 'theme.@font-size-sm' },
  'theme.@heading-1-size': { id: 'theme.@heading-1-size', defaultMessage: 'theme.@heading-1-size' },
  'theme.@heading-2-size': { id: 'theme.@heading-2-size', defaultMessage: 'theme.@heading-2-size' },
  'theme.@heading-3-size': { id: 'theme.@heading-3-size', defaultMessage: 'theme.@heading-3-size' },
  'theme.@heading-4-size': { id: 'theme.@heading-4-size', defaultMessage: 'theme.@heading-4-size' },
  'theme.@heading-5-size': { id: 'theme.@heading-5-size', defaultMessage: 'theme.@heading-5-size' },
  'theme.@heading-color': { id: 'theme.@heading-color', defaultMessage: 'theme.@heading-color' },
  'theme.@layout-body-background': {
    id: 'theme.@layout-body-background',
    defaultMessage: 'theme.@layout-body-background',
  },
  'theme.@normal-color': { id: 'theme.@normal-color', defaultMessage: 'theme.@normal-color' },
  'theme.@primary-color': { id: 'theme.@primary-color', defaultMessage: 'theme.@primary-color' },
  'theme.@processing-color': { id: 'theme.@processing-color', defaultMessage: 'theme.@processing-color' },
  'theme.@success-color': { id: 'theme.@success-color', defaultMessage: 'theme.@success-color' },
  'theme.@text-color': { id: 'theme.@text-color', defaultMessage: 'theme.@text-color' },
  'theme.@text-color-secondary': { id: 'theme.@text-color-secondary', defaultMessage: 'theme.@text-color-secondary' },
  'theme.@warning-color': { id: 'theme.@warning-color', defaultMessage: 'theme.@warning-color' },
  'theme.@white': { id: 'theme.@white', defaultMessage: 'theme.@white' },
  title: { id: 'title', defaultMessage: 'title' },
  'tracking.fb_pixel_id': { id: 'tracking.fb_pixel_id', defaultMessage: 'tracking.fb_pixel_id' },
  'tracking.ga_id': { id: 'tracking.ga_id', defaultMessage: 'tracking.ga_id' },
  'tracking.gtm_id': { id: 'tracking.gtm_id', defaultMessage: 'tracking.gtm_id' },
  'tracking.hotjar_id': { id: 'tracking.hotjar_id', defaultMessage: 'tracking.hotjar_id' },
  'tracking.hotjar_sv': { id: 'tracking.hotjar_sv', defaultMessage: 'tracking.hotjar_sv' },
})

export default AppSettingCard

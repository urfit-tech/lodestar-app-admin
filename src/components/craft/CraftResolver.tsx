import { gql, useApolloClient } from '@apollo/client'
import * as CraftElement from 'lodestar-app-element/src/components/common/CraftElement'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import { useIntl } from 'react-intl'
import * as CraftSetting from '../../components/craft/settings'
import * as hasura from '../../hasura'
import { withResponsive } from './settings/ResponsiveSettings'

export const useResolver = () => {
  const apolloClient = useApolloClient()
  const { currentMemberId } = useAuth()
  const { formatMessage } = useIntl()
  CraftElement.CraftMemberCollection.craft = {
    displayName: formatMessage({ id: 'craft.resolver.MemberCollectionSettings', defaultMessage: '會員' }),
    related: {
      settings: withResponsive(CraftSetting.MemberCollectionSettings),
    },
  }
  CraftElement.CraftProgramCollection.craft = {
    displayName: formatMessage({ id: 'craft.resolver.ProgramCollectionSettings', defaultMessage: '課程' }),
    related: {
      settings: withResponsive(CraftSetting.ProgramCollectionSettings),
    },
  }
  CraftElement.CraftProgramContentCollection.craft = {
    displayName: formatMessage({ id: 'craft.resolver.ProgramContentCollectionSettings', defaultMessage: '課程單元' }),
    related: {
      settings: withResponsive(CraftSetting.ProgramContentCollectionSettings),
    },
  }
  CraftElement.CraftProgramPackageCollection.craft = {
    displayName: formatMessage({ id: 'craft.resolver.ProgramPackageCollectionSettings', defaultMessage: '課程組合' }),
    related: {
      settings: withResponsive(CraftSetting.ProgramPackageCollectionSettings),
    },
  }
  CraftElement.CraftActivityCollection.craft = {
    displayName: formatMessage({ id: 'craft.resolver.ActivityCollectionSettings', defaultMessage: '活動' }),
    related: {
      settings: withResponsive(CraftSetting.ActivityCollectionSettings),
    },
  }
  CraftElement.CraftProjectCollection.craft = {
    displayName: formatMessage({ id: 'craft.resolver.ProjectCollectionSettings', defaultMessage: '專案' }),
    related: {
      settings: withResponsive(CraftSetting.ProjectCollectionSettings),
    },
  }
  CraftElement.CraftPostCollection.craft = {
    displayName: formatMessage({ id: 'craft.resolver.PostCollectionSettings', defaultMessage: '文章' }),
    related: {
      settings: withResponsive(CraftSetting.PostCollectionSettings),
    },
  }
  CraftElement.CraftSection.craft = {
    displayName: formatMessage({ id: 'craft.resolver.SectionSettings', defaultMessage: '區塊' }),
    related: {
      settings: withResponsive(CraftSetting.SectionSettings),
    },
  }
  CraftElement.CraftButton.craft = {
    displayName: formatMessage({ id: 'craft.resolver.ButtonSettings', defaultMessage: '按鈕' }),
    related: {
      settings: withResponsive(CraftSetting.ButtonSettings),
    },
  }
  CraftElement.CraftCard.craft = {
    displayName: formatMessage({ id: 'craft.resolver.CardSettings', defaultMessage: '卡片' }),
    related: {
      settings: withResponsive(CraftSetting.CardSettings),
    },
  }
  CraftElement.CraftCarousel.craft = {
    displayName: formatMessage({ id: 'craft.resolver.CarouselSettings', defaultMessage: '輪播' }),
    related: {
      settings: withResponsive(CraftSetting.CarouselSettings),
    },
  }
  CraftElement.CraftCollapse.craft = {
    displayName: formatMessage({ id: 'craft.resolver.CollapseSettings', defaultMessage: '折疊' }),
    related: {
      settings: withResponsive(CraftSetting.CollapseSettings),
    },
  }
  CraftElement.CraftImage.craft = {
    displayName: formatMessage({ id: 'craft.resolver.ImageSettings', defaultMessage: '圖片' }),
    related: {
      settings: withResponsive(CraftSetting.ImageSettings),
    },
  }
  CraftElement.CraftLayout.craft = {
    displayName: formatMessage({ id: 'craft.resolver.LayoutSettings', defaultMessage: '佈局' }),
    related: {
      settings: withResponsive(CraftSetting.LayoutSettings),
    },
  }
  CraftElement.CraftParagraph.craft = {
    displayName: formatMessage({ id: 'craft.resolver.ParagraphSettings', defaultMessage: '段落' }),
    related: {
      settings: withResponsive(CraftSetting.ParagraphSettings),
    },
  }
  CraftElement.CraftTitle.craft = {
    displayName: formatMessage({ id: 'craft.resolver.TitleSettings', defaultMessage: '標題' }),
    related: {
      settings: withResponsive(CraftSetting.TitleSettings),
    },
  }
  CraftElement.CraftEmbedded.craft = {
    displayName: formatMessage({ id: 'craft.resolver.EmbeddedSettings', defaultMessage: '嵌入' }),
    related: {
      settings: withResponsive(CraftSetting.EmbeddedSettings),
    },
  }
  CraftElement.CraftAIBot.craft = {
    displayName: formatMessage({ id: 'craft.resolver.AIBotSettings', defaultMessage: '嵌入' }),
    related: {
      settings: withResponsive(CraftSetting.AIBotSettings),
    },
  }
  for (const resolvedName in CraftElement) {
    if (Object.prototype.hasOwnProperty.call(CraftElement, resolvedName)) {
      const element = CraftElement[resolvedName as keyof typeof CraftElement]
      element.craft = {
        ...element.craft,
        custom: {
          ...element.craft?.custom,
          editing: false,
          onSave: (template: { rootNodeId: string; serializedNodes: any }) => {
            const templateName = window.prompt(
              formatMessage({ id: 'pages.craft.promptTemplateName', defaultMessage: '請輸入樣板名稱' }),
            )
            currentMemberId &&
              templateName &&
              apolloClient
                .mutate<hasura.INSERT_APP_PAGE_TEMPLATE, hasura.INSERT_APP_PAGE_TEMPLATEVariables>({
                  mutation: gql`
                    mutation INSERT_APP_PAGE_TEMPLATE(
                      $currentMemberId: String!
                      $templateName: String!
                      $rootNodeId: String!
                      $serializedNodes: jsonb!
                    ) {
                      insert_app_page_template_one(
                        object: {
                          author_id: $currentMemberId
                          name: $templateName
                          root_node_id: $rootNodeId
                          data: $serializedNodes
                        }
                      ) {
                        id
                      }
                    }
                  `,
                  variables: {
                    currentMemberId,
                    templateName,
                    rootNodeId: template.rootNodeId,
                    serializedNodes: template.serializedNodes,
                  },
                })
                .then(() => alert('add into template'))
                .catch(() => alert('template already exists'))
          },
        },
      }
    }
  }
  return CraftElement
}

import { Card, Typography } from 'antd'
import React, { useContext } from 'react'
import styled from 'styled-components'
import DefaultLayout from '../../components/layout/DefaultLayout'
import AppContext from '../../contexts/AppContext'

const StyledTitle = styled(Typography.Title)`
  && {
    margin-bottom: 36px;
    font-size: 24px;
    font-weight: bold;
    line-height: 1.3;
    letter-spacing: 0.77px;
  }
`

const StyledSubTitle = styled(Typography.Title)`
  && {
    margin-top: 41px;
    margin-bottom: 13px;
    font-size: 20px;
    font-weight: bold;
  }
`

const StyledCard = styled(Card)`
  && {
    margin-bottom: 20px;
  }

  .ant-card-body {
    padding: 40px;
  }

  p,
  li {
    margin-bottom: 0;
    line-height: 1.69;
    letter-spacing: 0.2px;
  }

  ol {
    padding-left: 50px;
    li {
      padding-left: 16px;
    }
  }
`

const StyledSection = styled.section`
  background: #f7f8f8;
  padding-top: 56px;
  padding-bottom: 80px;
  text-align: justify;

  & > ${StyledTitle} {
    text-align: center;
  }
`

const TermsPage = () => {
  const { name } = useContext(AppContext)

  return (
    <DefaultLayout>
      <StyledSection>
        <StyledTitle level={1}>使用條款</StyledTitle>

        <div className="container">
          <StyledCard>
            <StyledTitle level={2}>隱私權條款</StyledTitle>

            <StyledSubTitle level={3}>隱私權保護政策的適用範圍</StyledSubTitle>
            <p>
              {`隱私權保護政策內容，包括本網站如何處理在您使用網站服務時收集到的個人識別資料。隱私權保護政策不適用於本網站以外的相關連結網站，也不適用於非本網站所委託或參與管理的人員。`}
            </p>

            <StyledSubTitle level={3}>個人資料的蒐集、處理及利用方式</StyledSubTitle>
            <p>
              {`當您造訪本網站或使用本網站所提供之功能服務時，我們將視該服務功能性質，請您提供必要的個人資料，並在該特定目的範圍內處理及利用您的個人資料；非經您書面同意，本網站不會將個人資料用於其他用途。`}
            </p>
            <p>
              {`於一般瀏覽時，伺服器會自行記錄相關行徑，包括您使用連線設備的IP位址、使用時間、使用的瀏覽器、瀏覽及點選資料記錄等，做為我們增進網站服務的參考依據，此記錄為內部應用，決不對外公佈。`}
            </p>

            <StyledSubTitle level={3}>網站對外的相關連結</StyledSubTitle>
            <p>
              {`本網站的網頁提供其他網站的網路連結，您也可經由本網站所提供的連結，點選進入其他網站。但該連結網站不適用本網站的隱私權保護政策，您必須參考該連結網站中的隱私權保護政策。`}
            </p>

            <StyledSubTitle level={3}>與第三人共用個人資料之政策</StyledSubTitle>
            <p>
              {`本網站絕不會提供、交換、出租或出售任何您的個人資料給其他個人、團體、私人企業或公務機關，但有法律依據或合約義務者，不在此限。`}
            </p>
            <p>
              {`${name} 如舉辦任何回饋活動，你所提供給主辦單位的得獎連絡資料，也僅供此活動使用。${name} 不會將活動資料直接交付或售予第三方。如果 ${name} 與第三方服務合作，亦應依法要求該第三方 ${name} 的會員網站使用對應的約定及隱私權政策，${name} 將會盡全力保障所有會員個人資料的安全性。`}
            </p>

            <StyledSubTitle level={3}>COOKIE之使用</StyledSubTitle>
            <p>
              {`為了提供您最佳的服務，本網站會在您的電腦中放置並取用我們的Cookie，若您不願接受Cookie的寫入，您可在您使用的瀏覽器功能項中設定隱私權等級為高，即可拒絕Cookie的寫入，但可能會導至網站某些功能無法正常執行。`}
            </p>
          </StyledCard>
          <StyledCard>
            <StyledTitle level={2}>使用者條款</StyledTitle>

            <StyledSubTitle level={3}>同意條款</StyledSubTitle>
            <p>
              {`非常歡迎您使用 ${name}（以下簡稱本服務），為了讓您能夠安心使用本網站的各項服務與資訊，特此向您說明本網站的隱私權保護政策，以保障您的權益，應詳細閱讀本條款所有內容。當您使用本服務時，即表示您已閱讀、了解並同意本條款所有內容。此外，因 ${name} 提供多種服務，某些服務可能因其特殊之性質而有附加條款，當您開始使用該服務即視為您同意該附加條款或相關規定亦屬本條款之一部份。${name} 有權於任何時間修改或變更本條款內容，建議您隨時注意該修改或變更。當您於任何修改或變更後繼續使用本服務，視為您已閱讀、了解並同意接受該修改或變更內容。如果使⽤者不同意 ${name} 對本條款進⾏的修改，請離開 ${name} 網站並⽴即停⽌使⽤ ${name} 服務。同時，會員應刪除個⼈檔案並註銷會員資格，${name} 亦有權刪除會員個⼈檔案並註銷會員資格。請您詳閱下列內容：`}
            </p>

            <StyledSubTitle level={3}>註冊義務、帳號密碼及資料保密</StyledSubTitle>
            <p>{`用戶登錄資料須提供使用者本人正確、最新及完整的資料。`}</p>
            <p>
              {`用戶登錄資料不得有偽造、不實、冒用等之情事(ex如個人資料及信用卡資料)，一經發現本公司可拒絕其加入用戶資格之權利。並得以暫停或終止其用戶資格，若違反中華民國相關法律，亦將依法追究。`}
            </p>
            <p>
              {`用戶應妥善保管密碼，不可將密碼洩露或提供給他人知道或使用；以同一個用戶身分證字號和密碼使用本服務所進行的所有行為，都將被認為是該用戶本人和密碼持有人的行為。`}
            </p>
            <p>
              {`若使⽤者本人未滿七歲，要由使⽤者的⽗⺟或法定監護⼈申請加⼊會員。若使⽤者已滿七歲未滿⼆⼗歲，則必須在申請加⼊會員之前，請⽗⺟或法定監護⼈閱讀本條款，並得到⽗⺟或監護⼈同意後，才可以申請、註冊及使⽤本網站所提供的服務；當使⽤者滿⼆⼗歲之前使⽤本網站服務，則必須向本公司擔保已取得⽗⺟或監護⼈的同意。`}
            </p>

            <StyledSubTitle level={3}>使用規定和條約</StyledSubTitle>
            <p>
              {`不論註冊與否，會員及一般使用者在使用本公司所提供之服務時，您應遵守相關法律，並同意不得利用本服務從事侵害他人權利或違法行為，此行為包含但不限於：`}
            </p>
            <ol className="mt-4">
              <li>
                {`上載、張貼、公布或傳送任何誹謗、侮辱、具威脅性、攻擊性、不雅、猥褻、不實、違反公共秩序或善良風俗或其他不法之文字、圖片或任何形式的檔案。`}
              </li>
              <li>{`侵害他人名譽、隱私權、營業秘密、商標權、著作權、專利權、其他智慧財產權及其他權利。`}</li>
              <li>{`違反法律、契約或協議所應負之保密義務。`}</li>
              <li>
                {`企圖入侵本公司伺服器、資料庫、破解本公司安全機制或其他危害本公司服務提供安全性或穩定性之行為。`}
              </li>
              <li>{`從事不法交易行為或張貼虛假不實、引人犯罪之訊息。`}</li>
              <li>
                {`未經本公司明確授權同意並具書面授權同意證明，不得利用本服務或本網站所提供其他資源，包括但不限於圖文、影音資料庫、編寫製作網頁之軟體等，從事任何商業交易行為，或招攬廣告商或贊助人。`}
              </li>
              <li>{`販賣槍枝、毒品、盜版軟體或其他違禁物。`}</li>
              <li>{`提供賭博資訊或以任何方式引誘他人參與賭博。`}</li>
              <li>{`濫發廣告訊息、垃圾訊息、連鎖信、違法之多層次傳銷訊息等。`}</li>
              <li>{`其他 ${name} 有正當理由認為不適當之行為。`}</li>
            </ol>

            <StyledSubTitle level={3}>暫停或終止服務</StyledSubTitle>
            <p>
              {`本服務於網站相關軟硬體設備進行更換、升級或維修時，得暫停或中斷本服務。如因維修或不可抗力因素，導致本公司網站服務暫停，暫停的期間造成直接或間接利益之損失，本公司不負損失賠償責任。`}
            </p>
            <p>
              {`如果本服務需有或內含可下載軟體，該軟體可能會在提供新版或新功能時，在您的裝置上自動更新。部分情況下可以讓您調整您的自動更新設定。`}
            </p>
            <p>
              {`您使用本服務之行為若有任何違反法令或本使用條款或危害本公司或第三者權益之虞時，在法律准許範圍內，於通知或未通知之情形下，立即暫時或永久終止您使用本服務之授權。此外，使⽤者同意若本服務之使⽤被中斷或終⽌帳號及相關信息和⽂件被關閉或刪除，${name} 對使⽤者或任何第三⼈均不承擔任何責任。`}
            </p>

            <StyledSubTitle level={3}>舉報</StyledSubTitle>
            <p>{`倘發現任何違反本服務條款之情事，請通知 ${name}。`}</p>
          </StyledCard>
          <StyledCard>
            <StyledTitle level={2}>退費辦法</StyledTitle>

            <StyledSubTitle level={3}>退費規定</StyledSubTitle>
            <p>
              {`已上架的課程，學員於購買七日之內（含購買當日）認為不符合需求，且未觀看課程者（除試看單元外），可透過「聯繫客服」的方式提出退費申請。`}
            </p>
            <p>{`退費作業僅退回實際花費金額，若原訂單有使用 折價券 折價、或是 點數 折抵購課，皆不予退回。`}</p>

            <StyledSubTitle level={3}>退費方式</StyledSubTitle>
            <p>{`匯款退費：如果您購課時採用ATM轉帳或超商付款，則採匯款退費方式。採匯款退費者須負擔手續費30元。`}</p>
            <p>{`退費申請流程：請您聯繫客服，將有專人回覆。`}</p>
          </StyledCard>
        </div>
      </StyledSection>
    </DefaultLayout>
  )
}

export default TermsPage

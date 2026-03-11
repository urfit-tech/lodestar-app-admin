const fs = require('fs')
const path = require('path')

const languages = ['zh-tw', 'zh-cn', 'en-us', 'vi', 'id', 'ja', 'ko', 'de-de']
const messagesFilePath = path.resolve(__dirname, 'build/messages/messages.json')
const translationsDirectory = path.resolve(__dirname, 'src/translations/locales')
const whitelistsDirectory = path.resolve(__dirname, 'src/translations/locales/whitelists')

const readJson = filePath => {
  if (!fs.existsSync(filePath)) {
    return null
  }

  return JSON.parse(fs.readFileSync(filePath, 'utf8'))
}

const writeJson = (filePath, value) => {
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`)
}

const sortEntries = object =>
  Object.fromEntries(Object.entries(object).sort(([leftKey], [rightKey]) => leftKey.localeCompare(rightKey)))

if (!fs.existsSync(messagesFilePath)) {
  throw new Error(`Missing extracted messages file: ${messagesFilePath}`)
}

fs.mkdirSync(translationsDirectory, { recursive: true })
fs.mkdirSync(whitelistsDirectory, { recursive: true })

const extractedMessages = sortEntries(readJson(messagesFilePath) || {})

languages.forEach(language => {
  const languageFilePath = path.join(translationsDirectory, `${language}.json`)
  const whitelistFilePath = path.join(whitelistsDirectory, `whitelist_${language}.json`)

  const existingTranslations = readJson(languageFilePath) || {}
  const existingWhitelist = readJson(whitelistFilePath) || []

  const nextTranslations = sortEntries(
    Object.keys(extractedMessages).reduce((result, key) => {
      result[key] = existingTranslations[key] ?? extractedMessages[key]
      return result
    }, {}),
  )

  const nextWhitelist = existingWhitelist
    .filter(key => Object.prototype.hasOwnProperty.call(extractedMessages, key))
    .sort((leftKey, rightKey) => leftKey.localeCompare(rightKey))

  writeJson(languageFilePath, nextTranslations)
  writeJson(whitelistFilePath, nextWhitelist)
})

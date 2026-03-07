import { appApi } from './app'
import { windowApi } from './window'
import { systemApi } from './system'
import { configApi } from './config'
import { fileApi } from './file'
import { miniWindowApi } from './miniWindow'
import { notificationApi, openApi, aesApi, zipApi, shortcutsApi, storeSyncApi } from './utility'
import { providerApi } from './provider'
import { knowledgeApi } from './knowledge'

export const api = {
  app: appApi,
  window: windowApi,
  system: systemApi,
  config: configApi,
  file: fileApi,
  miniWindow: miniWindowApi,
  notification: notificationApi,
  open: openApi,
  aes: aesApi,
  zip: zipApi,
  shortcuts: shortcutsApi,
  storeSync: storeSyncApi,
  provider: providerApi,
  knowledge: knowledgeApi
}

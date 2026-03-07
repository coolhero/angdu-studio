import { contextBridge } from 'electron'
import { api } from './api'

contextBridge.exposeInMainWorld('api', api)

export type WindowApiType = typeof api

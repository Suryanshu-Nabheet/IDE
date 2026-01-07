import { app } from 'electron'
import log from 'electron-log'

import { API_ROOT } from '../utils'
import { setupCommentIndexer } from './commentIndexer'
import { setupIndex } from './indexer'
import { setupLSPs } from './lsp'
import setupMainMenu from './menu'
import mainWindow from './window'
import { setupSearch } from './search'
import setupApplicationsFolder from './setup/appFolder'
import setupAutoUpdater from './setup/autoUpdater'
import { setupEnv } from './setup/env'
import setupIpcs from './setup/ipcs'
import setupGitIpcs from './setup/git'
import setupLogger from './setup/logger'
import setupProtocal from './setup/protocal'
import setupSingleInstance from './setup/singleInstance'
import setupTerminal from './setup/terminal'
import { setupStoreHandlers, store } from './storeHandler'
import { setupTestIndexer } from './testIndexer'

process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true'

setupEnv()
setupProtocal()
setupSingleInstance()
setupAutoUpdater()
setupLogger()

app.on('ready', () => {
    mainWindow.create()
    mainWindow.setup()
    mainWindow.load()
    setupMainMenu()

    setupApplicationsFolder()
    setupIpcs()
    setupGitIpcs()
    setupLSPs(store)
    setupTerminal()
    setupSearch()
    log.info('setting up index')
    setupCommentIndexer()
    setupTestIndexer()
    setupStoreHandlers()
    setupIndex(API_ROOT, mainWindow.win!)
    log.info('setup index')
})
app.on('window-all-closed', () => {
    app.quit()
})

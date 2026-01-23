import type * as LSP from 'vscode-languageserver-protocol'
import type { PluginValue } from '@codemirror/view'

export const LSLanguages = [
    'typescript',
    'html',
    'css',
    'python',
    'c', // Also c++
    'rust',
    'go',
    'csharp',
    'java',
    'php',
]

export type Language = (typeof LSLanguages)[number]

export interface LSPCustomCompletionParams extends LSP.CompletionParams {
    wordBefore: string
}

// Minimal definition to avoid importing Action from linter/lint which drags in CodeMirror
export interface Action {
    name: string
    payload: any[]
}

export interface DiagnosticWithAction extends LSP.Diagnostic {
    actions?: Action[]
}

// A map of request methods and their parameters and return types
export type LSPRequestMap = {
    initialize: [LSP.InitializeParams, LSP.InitializeResult]
    'textDocument/hover': [LSP.HoverParams, LSP.Hover]
    'textDocument/completion': [
        LSPCustomCompletionParams,
        LSP.CompletionItem[] | LSP.CompletionList | null
    ]
    'textDocument/documentSymbol': [
        LSP.DocumentSymbolParams,
        LSP.DocumentSymbol[]
    ]

    // Back to text document types
    'textDocument/definition': [
        LSP.DefinitionParams,
        LSP.Location | LSP.Location[] | LSP.LocationLink[] | null
    ]
    'textDocument/references': [LSP.ReferenceParams, LSP.Location[]]
    'textDocument/documentHighlight': [
        LSP.DocumentHighlightParams,
        LSP.DocumentHighlight[]
    ]
    'textDocument/symbol': [LSP.DocumentSymbolParams, LSP.SymbolInformation[]]
    'textDocument/codeAction': [
        LSP.CodeActionParams,
        (LSP.CodeAction | LSP.Command)[]
    ]
    'textDocument/documentLink': [LSP.DocumentLinkParams, LSP.DocumentLink[]]

    // Add a new entry for the workspace/symbol request and response
    'workspace/symbol': [LSP.WorkspaceSymbolParams, LSP.SymbolInformation[]]
    'workspaceSymbol/resolve': [LSP.SymbolInformation, LSP.SymbolInformation]

    // Copilot Commands
    'textDocument/semanticTokens/full': [
        LSP.SemanticTokensParams,
        LSP.SemanticTokens
    ]
    'textDocument/semanticTokens/full/delta': [
        LSP.SemanticTokensDeltaParams,
        LSP.SemanticTokensDelta
    ]
    'textDocument/semanticTokens': [
        LSP.SemanticTokensParams,
        LSP.SemanticTokens
    ]
    'completionItem/resolve': [LSP.CompletionItem, LSP.CompletionItem]
}

// A map of notification methods and their parameters
export type LSPNotifyMap = {
    initialized: LSP.InitializedParams
    'textDocument/didChange': LSP.DidChangeTextDocumentParams
    'textDocument/didOpen': LSP.DidOpenTextDocumentParams
    'textDocument/didClose': LSP.DidCloseTextDocumentParams

    'workspace/didChangeConfiguration': LSP.DidChangeConfigurationParams
}

// A map of event methods and their parameters
export interface LSPEventMap {
    'textDocument/publishDiagnostics': LSP.PublishDiagnosticsParams
    'window/logMessage': LSP.LogMessageParams
    'window/showMessage': LSP.ShowMessageParams
}

export interface LSRequestMap {
    'workspace/configuration': [LSP.ConfigurationParams, any]
    'client/registerCapability': [LSP.RegistrationParams, any]
}

// A type for notifications from the server
export type Notification = {
    [key in keyof LSPEventMap]: {
        jsonrpc: '2.0'
        id?: null | undefined
        method: key
        params: LSPEventMap[key]
    }
}[keyof LSPEventMap]

export type LSRequest = {
    [key in keyof LSRequestMap]: {
        jsonrpc: '2.0'
        id?: null | undefined
        method: key
        params: LSRequestMap[key][0]
    }
}[keyof LSRequestMap]

export interface LSPProcess {
    command: string
    args: string[]
}

// A type for the options to create a language server client
export interface LanguageServerClientOptions {
    language: Language
    rootUri: string | null
    workspaceFolders: LSP.WorkspaceFolder[] | null
    autoClose?: boolean
}

// A type for the plugins that can attach to the client
export interface LanguageServerPluginInterface extends PluginValue {
    processNotification: (notification: Notification) => void
    // processRequest: (request: LSRequest) => any
}

import React, { useState, useEffect, useRef } from 'react'
import { useAppDispatch, useAppSelector } from '../app/hooks'
import { untriggerInlineAI } from '../features/tools/toolSlice'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMagic, faSpinner } from '@fortawesome/free-solid-svg-icons'
import { streamAIResponseWithTools } from '../features/ai/providersWithTools'
import { getActiveProviderAPIKey } from '../features/ai/apiKeyUtils'
import { getSettings } from '../features/settings/settingsSelectors'
import { ReactCodeMirrorRef } from './react-codemirror'
import { getFilePath } from '../features/selectors'

interface InlineAIEditProps {
    editorRef: React.MutableRefObject<ReactCodeMirrorRef>
    tabId: number
}

export const InlineAIEdit: React.FC<InlineAIEditProps> = ({
    editorRef,
    tabId,
}) => {
    const dispatch = useAppDispatch()
    const isOpen = useAppSelector(
        (state: any) => state.toolState.inlineAITriggered
    )
    const settings = useAppSelector(getSettings)
    // @ts-ignore
    const tab = useAppSelector((state) => state.global.tabs[tabId])
    const filePath = useAppSelector(getFilePath(tab?.fileId))

    const [input, setInput] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [position, setPosition] = useState<{ top: number; left: number }>({
        top: 0,
        left: 0,
    })

    const inputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        if (isOpen && editorRef.current?.view) {
            const view = editorRef.current.view
            const cursor = view.state.selection.main.head
            const coords = view.coordsAtPos(cursor)

            if (coords) {
                setPosition({
                    top: coords.bottom + 5,
                    left: coords.left,
                })
            }
            // Focus input
            setTimeout(() => inputRef.current?.focus(), 50)
        }
    }, [isOpen])

    const handleClose = () => {
        dispatch(untriggerInlineAI())
        setInput('')
        setIsLoading(false)
        editorRef.current?.view?.focus()
    }

    const handleKeyDown = async (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') {
            handleClose()
        } else if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSubmit()
        }
    }

    const handleSubmit = async () => {
        if (!input.trim() || isLoading || !editorRef.current?.view) return

        setIsLoading(true)

        try {
            const view = editorRef.current.view
            const selection = view.state.selection.main
            const selectedText = view.state.doc.sliceString(
                selection.from,
                selection.to
            )
            const lineNumber = view.state.doc.lineAt(selection.from).number

            const providerInfo = await getActiveProviderAPIKey(settings)

            const prompt = `Task: ${input}
File: ${filePath}
Line: ${lineNumber}
${
    selectedText
        ? `Selected Code:\n\`\`\`\n${selectedText}\n\`\`\``
        : 'Insert at cursor focus.'
}

Instructions:
Provide ONLY the code to replace the selection (or insert). Do not include markdown fences unless necessary for the syntax. 
Just the raw code.
`

            if (!providerInfo) {
                alert('AI not configured')
                setIsLoading(false)
                return
            }

            const message = {
                role: 'user',
                content: prompt,
            }

            const providerConfig = {
                provider: settings.aiProvider || 'ollama',
                apiKey: providerInfo.apiKey,
                defaultModel: providerInfo.model,
                baseUrl: (settings as any).ollama?.baseUrl,
            }

            const stream = streamAIResponseWithTools(
                providerConfig,
                [message as any],
                { tools: [] }
            )

            let generatedCode = ''

            for await (const chunk of stream) {
                if (chunk.type === 'text') {
                    generatedCode += chunk.content
                }
            }

            // Apply edit
            const transaction = view.state.update({
                changes: {
                    from: selection.from,
                    to: selection.to,
                    insert: generatedCode.trim(),
                },
            })
            view.dispatch(transaction)

            handleClose()
        } catch (e) {
            console.error(e)
            alert('Failed to generate code')
        } finally {
            setIsLoading(false)
        }
    }

    if (!isOpen) return null

    return (
        <div
            className="fixed z-50 flex items-center gap-2 px-3 py-2 bg-[#1e1e1e] border border-[#333] rounded-lg shadow-xl"
            style={{
                top: position.top,
                left: position.left,
                minWidth: '300px',
            }}
        >
            <div
                className={`w-4 h-4 flex items-center justify-center ${
                    isLoading ? 'animate-spin' : ''
                }`}
            >
                <FontAwesomeIcon
                    icon={isLoading ? faSpinner : faMagic}
                    className="text-[var(--accent)] text-sm"
                />
            </div>
            <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Edit with AI..."
                className="flex-1 bg-transparent border-none outline-none text-sm text-[var(--ui-fg)] placeholder-[var(--ui-fg-muted)]"
                autoFocus
            />
            <div className="flex items-center gap-1">
                <span className="text-[10px] text-[var(--ui-fg-muted)] bg-[#333] px-1.5 py-0.5 rounded">
                    Esc to close
                </span>
                <span className="text-[10px] text-[var(--ui-fg-muted)] bg-[#333] px-1.5 py-0.5 rounded">
                    Enter
                </span>
            </div>
        </div>
    )
}

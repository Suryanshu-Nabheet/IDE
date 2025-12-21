import React from 'react'

// Professional VS Code-style file icons with proper logos and designs

interface FileIconProps {
    fileName: string
    isFolder?: boolean
    isOpen?: boolean
}

// Icon color palette matching VS Code Material Theme
const colors = {
    javascript: '#F7DF1E',
    typescript: '#3178C6',
    react: '#61DAFB',
    python: '#3776AB',
    pythonAlt: '#FFD43B',
    css: '#1572B6',
    html: '#E34F26',
    json: '#FFC107',
    markdown: '#519ABA',
    git: '#F05032',
    config: '#6B7280',
    image: '#10B981',
    text: '#9CA3AF',
    folder: '#90A4AE',
    folderOpen: '#90A4AE',
    tsx: '#3178C6',
}

// TypeScript Icon - Professional TS logo
const TypeScriptIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="24" height="24" rx="2" fill={colors.typescript} />
        <path
            d="M12.5 8.5h3v1h-1.5v5h-1v-5h-1.5v-1zm4.5 0h3.5v1h-2.5v1.5h2v1h-2v2h-1v-5.5z"
            fill="white"
        />
    </svg>
)

// JavaScript Icon - Professional JS logo
const JavaScriptIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="24" height="24" rx="2" fill={colors.javascript} />
        <path
            d="M13.5 8.5h1v4.5c0 1.1-.9 2-2 2s-2-.9-2-2h1c0 .6.4 1 1 1s1-.4 1-1v-4.5zm2.5 0h3.5v1h-2.5v1h2v1h-2v1.5h2.5v1h-3.5v-5.5z"
            fill="#000"
        />
    </svg>
)

// React/TSX Icon - React atom logo
const ReactIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="24" height="24" rx="2" fill="#20232A" />
        <ellipse
            cx="12"
            cy="12"
            rx="6.5"
            ry="2.5"
            stroke={colors.react}
            strokeWidth="0.8"
            fill="none"
        />
        <ellipse
            cx="12"
            cy="12"
            rx="6.5"
            ry="2.5"
            stroke={colors.react}
            strokeWidth="0.8"
            fill="none"
            transform="rotate(60 12 12)"
        />
        <ellipse
            cx="12"
            cy="12"
            rx="6.5"
            ry="2.5"
            stroke={colors.react}
            strokeWidth="0.8"
            fill="none"
            transform="rotate(120 12 12)"
        />
        <circle cx="12" cy="12" r="1.5" fill={colors.react} />
    </svg>
)

// Python Icon - Python logo style
const PythonIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="24" height="24" rx="2" fill="#20232A" />
        <path
            d="M12 6c-2.2 0-4 1.8-4 4v1h4v.5H8c-1.1 0-2 .9-2 2v2c0 1.1.9 2 2 2h1v-1.5c0-1.1.9-2 2-2h2c1.1 0 2-.9 2-2v-2c0-1.1-.9-2-2-2h-1z"
            fill={colors.python}
        />
        <path
            d="M12 18c2.2 0 4-1.8 4-4v-1h-4v-.5h4c1.1 0 2-.9 2-2v-2c0-1.1-.9-2-2-2h-1v1.5c0 1.1-.9 2-2 2h-2c-1.1 0-2 .9-2 2v2c0 1.1.9 2 2 2h1z"
            fill={colors.pythonAlt}
        />
        <circle cx="10" cy="9" r="0.7" fill="#fff" />
        <circle cx="14" cy="15" r="0.7" fill="#20232A" />
    </svg>
)

// CSS Icon - CSS3 shield logo
const CSSIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M5 3l1.5 16.5L12 21l5.5-1.5L19 3H5z" fill={colors.css} />
        <path
            d="M12 5v14l-4-1.1L7 5h5zm0 5.5h-3l.2 2h2.8v2h-2.5l-.2-1h-1l.3 2 3.4.9v-2.4h-2.8l-.2-1.5h3v-2z"
            fill="white"
        />
    </svg>
)

// HTML Icon - HTML5 shield logo
const HTMLIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M5 3l1.5 16.5L12 21l5.5-1.5L19 3H5z" fill={colors.html} />
        <path
            d="M12 5v14l-4-1.1L7 5h5zm-2 5v2h2v2h-2v2h3v-2h-1v-2h1v-2H10z"
            fill="white"
        />
    </svg>
)

// JSON Icon - Curly braces design
const JSONIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="24" height="24" rx="2" fill="#20232A" />
        <path
            d="M8 7c-.5 0-1 .5-1 1v2c0 .5-.5 1-1 1v2c.5 0 1 .5 1 1v2c0 .5.5 1 1 1h1v-1H8v-2.5c0-.8-.3-1.5-1-1.5 .7 0 1-.7 1-1.5V8h1V7H8zm8 0h-1v1h1v2.5c0 .8.3 1.5 1 1.5-.7 0-1 .7-1 1.5V16h-1v1h1c.5 0 1-.5 1-1v-2c0-.5.5-1 1-1v-2c-.5 0-1-.5-1-1V8c0-.5-.5-1-1-1z"
            fill={colors.json}
        />
    </svg>
)

// Markdown Icon - M with document
const MarkdownIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="24" height="24" rx="2" fill="#20232A" />
        <path
            d="M7 9v6h1.5v-4.5l1.5 1.8 1.5-1.8V15H13V9h-1.5L10 11.3 8.5 9H7zm7 0v4.5h1.5L18 11v4h1.5V9H18l-2.5 2.5L13 9h-1z"
            fill={colors.markdown}
        />
    </svg>
)

// Git Icon - Git logo
const GitIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="24" height="24" rx="2" fill="#20232A" />
        <path
            d="M11.3 5.7l-5.6 5.6c-.4.4-.4 1 0 1.4l5.6 5.6c.4.4 1 .4 1.4 0l5.6-5.6c.4-.4.4-1 0-1.4l-5.6-5.6c-.4-.4-1-.4-1.4 0z"
            fill={colors.git}
        />
        <circle cx="9.5" cy="12" r="1.2" fill="white" />
        <circle cx="14.5" cy="12" r="1.2" fill="white" />
    </svg>
)

// Config/Settings Icon - Gear
const ConfigIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="24" height="24" rx="2" fill="#20232A" />
        <circle
            cx="12"
            cy="12"
            r="2.5"
            stroke={colors.config}
            strokeWidth="1.2"
            fill="none"
        />
        <path
            d="M12 7v1.5M12 15.5V17M17 12h-1.5M8.5 12H7M15.5 8.5l-1 1M9.5 14.5l-1 1M15.5 15.5l-1-1M9.5 9.5l-1-1"
            stroke={colors.config}
            strokeWidth="1.2"
            strokeLinecap="round"
        />
    </svg>
)

// Image Icon - Picture frame
const ImageIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="24" height="24" rx="2" fill="#20232A" />
        <rect
            x="6"
            y="7"
            width="12"
            height="10"
            rx="1"
            stroke={colors.image}
            strokeWidth="1.2"
            fill="none"
        />
        <circle cx="9" cy="10" r="1.2" fill={colors.image} />
        <path
            d="M6 15l3-3 2 2 3-3 4 4v2H6v-2z"
            fill={colors.image}
            opacity="0.7"
        />
    </svg>
)

// Folder Icon - Professional folder design
const FolderIcon = ({ isOpen }: { isOpen?: boolean }) => (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        {isOpen ? (
            <>
                <path
                    d="M4 6c0-1.1.9-2 2-2h4l2 2h6c1.1 0 2 .9 2 2v1H4V6z"
                    fill={colors.folderOpen}
                    opacity="0.7"
                />
                <path
                    d="M4 9h16v9c0 1.1-.9 2-2 2H6c-1.1 0-2-.9-2-2V9z"
                    fill={colors.folderOpen}
                />
            </>
        ) : (
            <path
                d="M4 6c0-1.1.9-2 2-2h4l2 2h6c1.1 0 2 .9 2 2v10c0 1.1-.9 2-2 2H6c-1.1 0-2-.9-2-2V6z"
                fill={colors.folder}
            />
        )}
    </svg>
)

// Default File Icon - Generic document
const DefaultFileIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
            d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6z"
            fill={colors.text}
        />
        <path d="M14 2v6h6" fill="white" opacity="0.3" />
        <path d="M8 14h8M8 17h5" stroke="white" strokeWidth="1" opacity="0.5" />
    </svg>
)

// Main component
export const FileIcon: React.FC<FileIconProps> = ({
    fileName,
    isFolder,
    isOpen,
}) => {
    if (isFolder) {
        return (
            <div className="file-icon-container">
                <FolderIcon isOpen={isOpen} />
            </div>
        )
    }

    const ext = fileName.split('.').pop()?.toLowerCase() || ''
    const name = fileName.toLowerCase()

    // Special file names
    if (
        name === 'package.json' ||
        name === 'package-lock.json' ||
        name === 'tsconfig.json'
    ) {
        return (
            <div className="file-icon-container">
                <JSONIcon />
            </div>
        )
    }

    if (name === 'readme.md' || name === 'readme') {
        return (
            <div className="file-icon-container">
                <MarkdownIcon />
            </div>
        )
    }

    if (name === '.gitignore' || name === '.gitattributes' || name === '.git') {
        return (
            <div className="file-icon-container">
                <GitIcon />
            </div>
        )
    }

    if (
        name.includes('config') ||
        name === '.env' ||
        name === '.env.local' ||
        name === 'webpack.config.js' ||
        name === 'vite.config.js' ||
        name === '.eslintrc' ||
        name === '.prettierrc'
    ) {
        return (
            <div className="file-icon-container">
                <ConfigIcon />
            </div>
        )
    }

    // Extension-based icons
    switch (ext) {
        case 'js':
        case 'mjs':
        case 'cjs':
            return (
                <div className="file-icon-container">
                    <JavaScriptIcon />
                </div>
            )

        case 'ts':
            return (
                <div className="file-icon-container">
                    <TypeScriptIcon />
                </div>
            )

        case 'tsx':
        case 'jsx':
            return (
                <div className="file-icon-container">
                    <ReactIcon />
                </div>
            )

        case 'py':
        case 'pyw':
        case 'pyc':
            return (
                <div className="file-icon-container">
                    <PythonIcon />
                </div>
            )

        case 'css':
        case 'scss':
        case 'sass':
        case 'less':
            return (
                <div className="file-icon-container">
                    <CSSIcon />
                </div>
            )

        case 'html':
        case 'htm':
            return (
                <div className="file-icon-container">
                    <HTMLIcon />
                </div>
            )

        case 'json':
        case 'jsonc':
            return (
                <div className="file-icon-container">
                    <JSONIcon />
                </div>
            )

        case 'md':
        case 'markdown':
            return (
                <div className="file-icon-container">
                    <MarkdownIcon />
                </div>
            )

        case 'png':
        case 'jpg':
        case 'jpeg':
        case 'gif':
        case 'svg':
        case 'webp':
        case 'ico':
            return (
                <div className="file-icon-container">
                    <ImageIcon />
                </div>
            )

        default:
            return (
                <div className="file-icon-container">
                    <DefaultFileIcon />
                </div>
            )
    }
}

export default FileIcon

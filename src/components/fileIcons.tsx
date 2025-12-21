import React from 'react'

// Premium Material-style file icons with vibrant colors

interface FileIconProps {
    fileName: string
    isFolder?: boolean
    isOpen?: boolean
}

// Icon color palette
const colors = {
    javascript: '#F7DF1E',
    typescript: '#3178C6',
    react: '#61DAFB',
    python: '#3776AB',
    css: '#1572B6',
    html: '#E34F26',
    json: '#FFC107',
    markdown: '#0D1117',
    git: '#F05032',
    config: '#6B7280',
    image: '#10B981',
    text: '#9CA3AF',
    folder: '#6fa0ff',
    folderOpen: '#75c7ff',
}

// JavaScript Icon
const JavaScriptIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="24" height="24" rx="4" fill={colors.javascript} />
        <text
            x="12"
            y="17"
            fontSize="14"
            fontWeight="bold"
            fill="#000"
            textAnchor="middle"
            fontFamily="Arial"
        >
            JS
        </text>
    </svg>
)

// TypeScript Icon
const TypeScriptIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="24" height="24" rx="4" fill={colors.typescript} />
        <text
            x="12"
            y="17"
            fontSize="14"
            fontWeight="bold"
            fill="#fff"
            textAnchor="middle"
            fontFamily="Arial"
        >
            TS
        </text>
    </svg>
)

// React/JSX Icon
const ReactIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="24" height="24" rx="4" fill="#222" />
        <circle cx="12" cy="12" r="2" fill={colors.react} />
        <ellipse
            cx="12"
            cy="12"
            rx="8"
            ry="3"
            stroke={colors.react}
            strokeWidth="1.5"
            fill="none"
        />
        <ellipse
            cx="12"
            cy="12"
            rx="8"
            ry="3"
            stroke={colors.react}
            strokeWidth="1.5"
            fill="none"
            transform="rotate(60 12 12)"
        />
        <ellipse
            cx="12"
            cy="12"
            rx="8"
            ry="3"
            stroke={colors.react}
            strokeWidth="1.5"
            fill="none"
            transform="rotate(120 12 12)"
        />
    </svg>
)

// Python Icon
const PythonIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="24" height="24" rx="4" fill={colors.python} />
        <text
            x="12"
            y="17"
            fontSize="13"
            fontWeight="bold"
            fill="#FFD43B"
            textAnchor="middle"
            fontFamily="Arial"
        >
            PY
        </text>
    </svg>
)

// CSS Icon
const CSSIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="24" height="24" rx="4" fill={colors.css} />
        <text
            x="12"
            y="17"
            fontSize="13"
            fontWeight="bold"
            fill="#fff"
            textAnchor="middle"
            fontFamily="Arial"
        >
            CSS
        </text>
    </svg>
)

// HTML Icon
const HTMLIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="24" height="24" rx="4" fill={colors.html} />
        <text
            x="12"
            y="17"
            fontSize="11"
            fontWeight="bold"
            fill="#fff"
            textAnchor="middle"
            fontFamily="Arial"
        >
            HTML
        </text>
    </svg>
)

// JSON Icon
const JSONIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="24" height="24" rx="4" fill={colors.json} />
        <text
            x="12"
            y="17"
            fontSize="12"
            fontWeight="bold"
            fill="#000"
            textAnchor="middle"
            fontFamily="Arial"
        >
            JSON
        </text>
    </svg>
)

// Markdown Icon
const MarkdownIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="24" height="24" rx="4" fill={colors.markdown} />
        <text
            x="12"
            y="17"
            fontSize="13"
            fontWeight="bold"
            fill="#fff"
            textAnchor="middle"
            fontFamily="Arial"
        >
            MD
        </text>
    </svg>
)

// Git Icon
const GitIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="24" height="24" rx="4" fill={colors.git} />
        <path
            d="M11.5 3L20.5 12L11.5 21L2.5 12L11.5 3Z"
            fill="#fff"
            transform="translate(0.5, 0)"
        />
        <circle cx="12" cy="12" r="2.5" fill={colors.git} />
    </svg>
)

// Config Icon
const ConfigIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="24" height="24" rx="4" fill={colors.config} />
        <circle
            cx="12"
            cy="12"
            r="3"
            stroke="#fff"
            strokeWidth="1.5"
            fill="none"
        />
        <path
            d="M12 8V6M12 18V16M16 12H18M6 12H8"
            stroke="#fff"
            strokeWidth="1.5"
            strokeLinecap="round"
        />
        <path
            d="M14.5 9.5L16 8M8 16L9.5 14.5M14.5 14.5L16 16M8 8L9.5 9.5"
            stroke="#fff"
            strokeWidth="1.5"
            strokeLinecap="round"
        />
    </svg>
)

// Image Icon
const ImageIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="24" height="24" rx="4" fill={colors.image} />
        <rect
            x="5"
            y="7"
            width="14"
            height="10"
            rx="1"
            stroke="#fff"
            strokeWidth="1.5"
            fill="none"
        />
        <circle cx="9" cy="10.5" r="1.5" fill="#fff" />
        <path
            d="M5 15L8 12L11 15L15 11L19 15V16C19 16.5 18.5 17 18 17H6C5.5 17 5 16.5 5 16V15Z"
            fill="#fff"
        />
    </svg>
)

// Folder Icon
const FolderIcon = ({ isOpen }: { isOpen?: boolean }) => (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
            d="M4 6C4 4.89543 4.89543 4 6 4H9L11 6H18C19.1046 6 20 6.89543 20 8V18C20 19.1046 19.1046 20 18 20H6C4.89543 20 4 19.1046 4 18V6Z"
            fill={isOpen ? colors.folderOpen : colors.folder}
        />
        {isOpen && (
            <path
                d="M4 10H20V18C20 19.1046 19.1046 20 18 20H6C4.89543 20 4 19.1046 4 18V10Z"
                fill={colors.folderOpen}
                opacity="0.7"
            />
        )}
    </svg>
)

// Default File Icon
const DefaultFileIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
            d="M14 2H6C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V8L14 2Z"
            fill={colors.text}
        />
        <path d="M14 2V8H20" fill="#fff" opacity="0.3" />
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
    if (name === 'package.json' || name === 'package-lock.json') {
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

    if (name === '.gitignore' || name === '.gitattributes') {
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
        name === 'tsconfig.json' ||
        name === 'webpack.config.js' ||
        name === 'vite.config.js'
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

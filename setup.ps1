# CodeX IDE Setup Script for Windows
# This script sets up all necessary dependencies for CodeX IDE

$ErrorActionPreference = "Stop"

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  CodeX IDE Setup - Windows" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

function Print-Success {
    param([string]$Message)
    Write-Host "✓ $Message" -ForegroundColor Green
}

function Print-Error {
    param([string]$Message)
    Write-Host "✗ $Message" -ForegroundColor Red
}

function Print-Info {
    param([string]$Message)
    Write-Host "ℹ $Message" -ForegroundColor Yellow
}

# Check if Node.js is installed
try {
    $nodeVersion = node -v
    $nodeMajorVersion = [int]($nodeVersion -replace 'v(\d+)\..*', '$1')
    
    if ($nodeMajorVersion -lt 16) {
        Print-Error "Node.js version must be 16 or higher. Current version: $nodeVersion"
        exit 1
    }
    Print-Success "Node.js $nodeVersion detected"
} catch {
    Print-Error "Node.js is not installed!"
    Write-Host "Please install Node.js 16 or higher from https://nodejs.org/"
    exit 1
}

# Check if npm is installed
try {
    $npmVersion = npm -v
    Print-Success "npm $npmVersion detected"
} catch {
    Print-Error "npm is not installed!"
    exit 1
}

# Check if git is installed
try {
    $gitVersion = git --version
    Print-Success "$gitVersion detected"
} catch {
    Print-Error "git is not installed!"
    exit 1
}

# Check for Python
try {
    $pythonVersion = python --version 2>&1
    Print-Success "$pythonVersion detected"
} catch {
    Print-Info "Python not found in PATH (Recommended for full functionality)"
}

# Clean old builds
Print-Info "Cleaning old build artifacts..."
Remove-Item -Path ".webpack", "dist", "out" -Recurse -ErrorAction SilentlyContinue
Print-Success "Cleaned old builds"

# Install dependencies
Print-Info "Installing npm dependencies..."
try {
    npm ci
    if ($LASTEXITCODE -ne 0) {
        npm install
    }
    if ($LASTEXITCODE -eq 0) {
        Print-Success "Dependencies installed successfully"
    } else {
        throw "npm install failed"
    }
} catch {
    Print-Error "Failed to install dependencies"
    Write-Host "Try removing node_modules and package-lock.json, then run npm install"
    exit 1
}

# Create LSP directory structure
Print-Info "Setting up Language Server Protocol (LSP) directory..."
if (-not (Test-Path "lsp")) {
    New-Item -ItemType Directory -Path "lsp" -Force | Out-Null
}

# Create .env file if it doesn't exist
if (-not (Test-Path ".env")) {
    Print-Info "Creating .env file from template..."
    Copy-Item ".env.example" ".env"
    Print-Success ".env file created"
} else {
    Print-Info ".env file already exists"
}

# Setup complete
Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Print-Success "CodeX IDE setup completed successfully!"
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:"
Write-Host "  1. Review and update .env file if needed"
Write-Host "  2. Run 'npm start' to launch CodeX IDE"
Write-Host ""
Write-Host "For more information, see README.md"
Write-Host ""

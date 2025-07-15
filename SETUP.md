# BAD_DAO Developer Setup Guide

## 📋 Prerequisites

### Required Software

#### 1. DFX SDK (Internet Computer SDK)
**Version Required**: 0.23.0 or later

**Installation**:
```bash
# Install DFX SDK
sh -ci "$(curl -fsSL https://sdk.dfinity.org/install.sh)"

# Verify installation
dfx --version
```

**Troubleshooting**:
- If installation fails, ensure you have `curl` and `bash` installed
- On macOS, you may need to install Xcode Command Line Tools: `xcode-select --install`
- On Linux, ensure you have `glibc` version 2.17 or later

#### 2. Node.js & npm
**Version Required**: Node.js 18.0+ and npm 8.0+

**Installation Options**:

**Option A: Using Node Version Manager (Recommended)**
```bash
# Install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Restart terminal or source profile
source ~/.bashrc

# Install and use Node.js 18
nvm install 18
nvm use 18
```

**Option B: Direct Installation**
- Download from [nodejs.org](https://nodejs.org/)
- Or use package manager: `brew install node` (macOS) or `apt install nodejs npm` (Ubuntu)

**Verification**:
```bash
node --version  # Should be 18.0.0 or higher
npm --version   # Should be 8.0.0 or higher
```

#### 3. Git
**Installation**:
```bash
# macOS
brew install git

# Ubuntu/Debian
sudo apt install git

# Windows
# Download from https://git-scm.com/
```

### Optional but Recommended

#### 1. Visual Studio Code
- Download from [code.visualstudio.com](https://code.visualstudio.com/)
- **Recommended Extensions**:
  - Motoko Language Support
  - TypeScript and JavaScript Language Features
  - Tailwind CSS IntelliSense
  - ESLint
  - Prettier

#### 2. Internet Computer Browser Extension
- **IC Inspector**: Browser extension for canister debugging
- Available for Chrome and Firefox

## 🚀 Project Setup

### 1. Clone Repository

```bash
# Clone the repository
git clone https://github.com/BuildaDao/WCHL-ICP-2025.git

# Navigate to project directory
cd WCHL-ICP-2025

# Verify project structure
ls -la
```

**Expected Structure**:
```
WCHL-ICP-2025/
├── dfx.json
├── README.md
├── STATUS.md
├── SETUP.md
├── NEXT_STEPS.md
├── motoko/
│   ├── vault/
│   ├── splitter/
│   ├── governance/
│   └── fallback/
└── frontend/
    ├── package.json
    ├── src/
    └── ...
```

### 2. Install Frontend Dependencies

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Verify installation
npm list --depth=0
```

**Key Dependencies Installed**:
- `@dfinity/agent ^2.4.1`
- `@dfinity/auth-client ^2.4.1`
- `@dfinity/candid ^2.4.1`
- `@dfinity/principal ^2.4.1`
- `next 15.4.1`
- `react 19.1.0`
- `tailwindcss ^4`

### 3. Configure Development Environment

#### Create Environment File
```bash
# In frontend directory
cp .env.example .env.local  # If .env.example exists
# OR create new file
touch .env.local
```

#### Add Environment Variables
```bash
# Edit .env.local
echo "NODE_ENV=development" > .env.local
echo "NEXT_PUBLIC_DFX_NETWORK=local" >> .env.local
echo "NEXT_PUBLIC_IC_HOST=http://localhost:4943" >> .env.local
```

## 🔧 Local Development Setup

### 1. Start DFX Network

```bash
# Navigate to project root
cd ..  # If you're in frontend directory

# Start local DFX network in background
dfx start --background

# Verify network is running
dfx ping
```

**Expected Output**:
```
{
  "ic_api_version": "0.18.0"
}
```

**Troubleshooting**:
- If port 4943 is in use: `dfx start --background --host 127.0.0.1:8080`
- If network fails to start: `dfx stop && dfx start --clean --background`

### 2. Deploy Canisters

```bash
# Deploy all canisters
dfx deploy

# Or deploy individually
dfx deploy vault
dfx deploy splitter
dfx deploy governance
dfx deploy fallback
```

**Expected Output**:
```
Deploying all canisters.
Creating canisters...
Building canisters...
Installing canisters...
Deployed canisters.
URLs:
  Backend canister via Candid interface:
    vault: http://127.0.0.1:4943/?canisterId=...
    splitter: http://127.0.0.1:4943/?canisterId=...
    governance: http://127.0.0.1:4943/?canisterId=...
    fallback: http://127.0.0.1:4943/?canisterId=...
```

### 3. Configure Frontend with Canister IDs

```bash
# Get canister IDs and add to environment
echo "NEXT_PUBLIC_VAULT_CANISTER_ID=$(dfx canister id vault)" >> frontend/.env.local
echo "NEXT_PUBLIC_SPLITTER_CANISTER_ID=$(dfx canister id splitter)" >> frontend/.env.local
echo "NEXT_PUBLIC_GOVERNANCE_CANISTER_ID=$(dfx canister id governance)" >> frontend/.env.local
echo "NEXT_PUBLIC_FALLBACK_CANISTER_ID=$(dfx canister id fallback)" >> frontend/.env.local

# Verify environment file
cat frontend/.env.local
```

### 4. Start Frontend Development Server

```bash
# Navigate to frontend directory
cd frontend

# Start development server
npm run dev
```

**Expected Output**:
```
▲ Next.js 15.4.1
- Local:        http://localhost:3000
- Environments: .env.local

✓ Ready in 2.1s
```

## 🧪 Testing the Setup

### 1. Verify Canister Deployment

```bash
# Test vault canister
dfx canister call vault getVaultStats

# Test governance canister
dfx canister call governance getGovernanceStats

# Test splitter canister
dfx canister call splitter getSplitterStats

# Test fallback canister
dfx canister call fallback getFallbackStats
```

### 2. Test Frontend Application

1. **Open Browser**: Navigate to http://localhost:3000
2. **Check Pages**: Verify all pages load without errors
   - Dashboard: http://localhost:3000
   - Vault: http://localhost:3000/vault
   - Splitter: http://localhost:3000/splitter
   - Governance: http://localhost:3000/governance
   - Fallback: http://localhost:3000/fallback
3. **Check Console**: No JavaScript errors in browser console
4. **Test Navigation**: All navigation links work correctly

### 3. Test Canister Integration

```bash
# Test canister calls from frontend
# Open browser console and run:
# (This tests the agent configuration)
```

## 🔍 Development Workflow

### Daily Development Routine

1. **Start Development Environment**
   ```bash
   # Start DFX network (if not running)
   dfx start --background
   
   # Start frontend development server
   cd frontend && npm run dev
   ```

2. **Make Changes**
   - Edit Motoko canisters in `motoko/` directory
   - Edit frontend components in `frontend/src/` directory

3. **Deploy Changes**
   ```bash
   # Redeploy specific canister after changes
   dfx deploy vault
   
   # Or redeploy all canisters
   dfx deploy
   ```

4. **Test Changes**
   - Test canister functions via Candid UI
   - Test frontend changes in browser
   - Run unit tests: `cd frontend && npm test`

### Useful Development Commands

```bash
# DFX Commands
dfx canister status <canister_name>    # Check canister status
dfx canister logs <canister_name>      # View canister logs
dfx canister delete <canister_name>    # Delete canister
dfx identity list                      # List identities
dfx identity use <identity_name>       # Switch identity

# Frontend Commands
npm run dev                            # Start development server
npm run build                          # Build for production
npm run lint                           # Run ESLint
npm run type-check                     # Run TypeScript checks

# Git Commands
git status                             # Check git status
git add .                              # Stage all changes
git commit -m "Description"            # Commit changes
git push origin main                   # Push to repository
```

## 🐛 Troubleshooting

### Common Issues

#### 1. DFX Network Issues
**Problem**: `dfx start` fails or network unreachable
**Solutions**:
```bash
# Clean restart
dfx stop
dfx start --clean --background

# Check port availability
lsof -i :4943

# Use different port
dfx start --background --host 127.0.0.1:8080
```

#### 2. Canister Deployment Failures
**Problem**: Canister deployment fails
**Solutions**:
```bash
# Check canister status
dfx canister status --all

# Delete and redeploy
dfx canister delete --all
dfx deploy

# Check for syntax errors in Motoko code
dfx build
```

#### 3. Frontend Build Issues
**Problem**: npm install or build failures
**Solutions**:
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Check Node.js version
node --version  # Should be 18+
```

#### 4. Environment Variable Issues
**Problem**: Canister IDs not found in frontend
**Solutions**:
```bash
# Verify environment file exists
cat frontend/.env.local

# Regenerate canister IDs
dfx canister id vault
# Add to .env.local manually
```

### Getting Help

1. **Check Logs**:
   ```bash
   # DFX logs
   dfx canister logs <canister_name>
   
   # Frontend logs
   # Check browser console for errors
   ```

2. **Community Support**:
   - **DFINITY Forum**: https://forum.dfinity.org/
   - **Discord**: https://discord.gg/cA7y6ezyE2
   - **GitHub Issues**: Create issue in repository

3. **Documentation**:
   - **DFX Documentation**: https://internetcomputer.org/docs/current/developer-docs/setup/install
   - **Motoko Documentation**: https://internetcomputer.org/docs/current/motoko/intro
   - **Next.js Documentation**: https://nextjs.org/docs

## ✅ Setup Verification Checklist

- [ ] DFX SDK installed and version 0.23.0+
- [ ] Node.js 18+ and npm 8+ installed
- [ ] Repository cloned successfully
- [ ] Frontend dependencies installed without errors
- [ ] DFX network starts successfully
- [ ] All four canisters deploy successfully
- [ ] Canister IDs added to frontend environment
- [ ] Frontend development server starts on port 3000
- [ ] All pages load without JavaScript errors
- [ ] Canister calls work from Candid UI
- [ ] Browser console shows no errors

Once all items are checked, your development environment is ready for BAD_DAO development!

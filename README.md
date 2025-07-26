# BAD_DAO - Vault Engine

A comprehensive decentralized milestone vault system built on the Internet Computer Protocol (ICP) using Motoko for backend canisters and Next.js 14+ with TypeScript for the frontend.

## 🎯 Project Overview

BAD_DAO implements a developer-first revenue distribution system with milestone-based founder bonds, governance mechanisms, and emergency fallback protections. The system ensures sustainable funding for development teams while providing transparent governance and risk management.

## 🏗️ Architecture

### Core Components

#### Backend Canisters (Motoko)
- **🏦 Vault Canister**: Manages founder bonds with collateral requirements
- **💰 Splitter Canister**: Handles developer-first revenue distribution
- **🗳️ Governance Canister**: Provides token-weighted voting and proposals
- **🚨 Fallback Canister**: Emergency conversion and system protection

#### Frontend Application (Next.js 14+)
- **📊 Dashboard**: System overview and quick actions
- **🏦 Vault Management**: Bond creation and withdrawal interface
- **💰 Revenue Distribution**: Recipient management and distribution controls
- **🗳️ Governance Portal**: Proposal creation and voting interface
- **🚨 Emergency Dashboard**: System monitoring and emergency controls

## ✅ Implementation Status

### Completed Features

#### Motoko Canisters (100% Complete)
All four canisters are fully implemented with comprehensive functionality:

**Vault Canister** (`motoko/vault/src/Vault.mo`)
- Bond deposit/withdrawal system with configurable collateral ratios (minimum 1.5x)
- Bond status tracking (Active/Withdrawn/Liquidated)
- Founder bond indexing and comprehensive statistics
- Admin liquidation capabilities for risk management

**Splitter Canister** (`motoko/splitter/src/Splitter.mo`)
- Role-based revenue distribution (Developer/Founder/Investor/Other)
- Recipient management with percentage allocation
- Distribution history and status tracking with developer-first priority

**Governance Canister** (`motoko/governance/src/Governance.mo`)
- Proposal creation and management with multiple types
- Token-weighted voting system (Yes/No/Abstain)
- Voting deadline enforcement and participation tracking

**Fallback Canister** (`motoko/fallback/src/Fallback.mo`)
- Emergency bond conversion system with configurable thresholds
- System pause/resume controls and conversion rate management
- Emergency action logging and monitoring

#### Frontend Components (100% Complete)
All user interface components implemented with modern React patterns:

**Core Pages**: Dashboard, Vault, Splitter, Governance, and Fallback pages
**Shared Components**: Responsive navigation, loading states, interactive modals
**Real-time Features**: Statistics updates, status indicators, progress tracking

#### ICP Integration Layer (50% Complete)
**Agent Configuration**: HTTP agent setup with Internet Identity authentication
**Type Definitions**: Complete TypeScript interfaces for all Motoko types
**Service Layer**: Vault and Governance services with CRUD operations (Partial)

## 📁 Project Structure

```
BAD_DAO/
├── dfx.json                    # DFX configuration
├── README.md                   # This file
├── STATUS.md                   # Detailed project status
├── motoko/                     # Backend canisters
│   ├── vault/src/Vault.mo     # Vault canister implementation
│   ├── splitter/src/Splitter.mo # Revenue splitter canister
│   ├── governance/src/Governance.mo # Governance canister
│   └── fallback/src/Fallback.mo # Emergency fallback canister
└── frontend/                   # Next.js frontend application
    ├── package.json           # Dependencies and scripts
    ├── src/app/               # Next.js App Router pages
    │   ├── layout.tsx         # Main layout with navigation
    │   ├── page.tsx           # Dashboard page
    │   ├── vault/page.tsx     # Vault management
    │   ├── splitter/page.tsx  # Revenue distribution
    │   ├── governance/page.tsx # Governance portal
    │   └── fallback/page.tsx  # Emergency dashboard
    └── src/lib/               # Core utilities and services
        ├── agent.ts           # ICP agent configuration
        ├── types.ts           # TypeScript definitions
        ├── idl/               # Candid interface definitions
        └── services/          # Canister service layer
```

## 🛠️ Technology Stack

### Backend
- **Language**: Motoko (Internet Computer native)
- **Runtime**: Internet Computer Protocol (ICP)
- **Development**: DFX SDK 0.23.0
- **Architecture**: Actor-based canister system

### Frontend
- **Framework**: Next.js 14+ with App Router
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS 4.0
- **State Management**: React hooks and context
- **Authentication**: Internet Identity

### ICP Integration
- **Agent**: @dfinity/agent ^2.4.1
- **Authentication**: @dfinity/auth-client ^2.4.1
- **Types**: @dfinity/candid ^2.4.1
- **Principal**: @dfinity/principal ^2.4.1

## 🚀 Quick Start

### Prerequisites
- **DFX SDK**: Version 0.23.0 or later
- **Node.js**: Version 18.0 or later
- **npm**: Version 8.0 or later

### Installation

1. **Install DFX SDK**
   ```bash
   sh -ci "$(curl -fsSL https://sdk.dfinity.org/install.sh)"
   ```

2. **Clone Repository**
   ```bash
   git clone https://github.com/BuildaDao/WCHL-ICP-2025.git
   cd WCHL-ICP-2025
   ```

3. **Install Frontend Dependencies**
   ```bash
   cd frontend
   npm install
   cd ..
   ```

### Local Development

1. **Start Local DFX Network**
   ```bash
   dfx start --background
   ```

2. **Deploy All Canisters**
   ```bash
   dfx deploy
   ```

3. **Start Frontend Development Server**
   ```bash
   cd frontend
   npm run dev
   ```

4. **Access the Application**
   - Frontend: http://localhost:3000
   - Local DFX Network: http://127.0.0.1:8000

## 🔧 Development Scripts

### DFX Commands
```bash
dfx start                              # Start local DFX network
dfx start --background                 # Start DFX network in background
dfx deploy                            # Deploy all canisters
dfx deploy <canister_name>            # Deploy specific canister
dfx canister call <canister> <method> # Call canister methods
dfx stop                              # Stop local DFX network
```

### Frontend Commands
```bash
cd frontend
npm run dev                           # Start development server
npm run build                         # Build for production
npm run start                         # Start production server
npm run lint                          # Run ESLint
```

## 🎯 Core Features

### 🏦 Vault Management
- **Bond Operations**: Deposit and withdrawal with collateral requirements
- **Risk Management**: Configurable collateral ratios and liquidation
- **Statistics**: Real-time tracking of bonds, deposits, and withdrawals
- **Security**: Founder-specific bond access and admin controls

### 💰 Revenue Distribution
- **Developer-First**: Prioritized allocation to development teams
- **Role-Based**: Different percentages for Developers, Founders, Investors
- **Transparency**: Complete distribution history and recipient management
- **Flexibility**: Dynamic recipient addition and percentage updates

### 🗳️ Governance System
- **Proposals**: Create and manage system parameter changes
- **Voting**: Token-weighted voting with Yes/No/Abstain options
- **Types**: Parameter changes, bond floor updates, system upgrades
- **Participation**: Real-time participation rate tracking

### 🚨 Emergency Protection
- **Automatic Conversion**: Emergency bond conversion during crises
- **System Controls**: Pause/resume functionality for emergency situations
- **Monitoring**: Real-time collateral ratio and threshold monitoring
- **History**: Complete emergency action and conversion logging

## 📊 Current Status

- **Overall Progress**: ~85% complete
- **Motoko Canisters**: 4/4 complete (100%)
- **Frontend Pages**: 5/5 complete (100%)
- **ICP Integration**: 2/4 services complete (50%)
- **Next Phase**: Complete frontend-canister integration

## 📋 Next Steps

1. **Complete ICP Integration**: Finish connecting all frontend components to canisters
2. **Authentication Flow**: Implement Internet Identity login across all pages
3. **Testing**: End-to-end testing of all canister interactions
4. **Deployment**: Production deployment to ICP mainnet

## 📚 Documentation

- **[STATUS.md](STATUS.md)**: Detailed project status and progress tracking
- **[Motoko Documentation](https://internetcomputer.org/docs/current/motoko/intro)**: Official Motoko language documentation
- **[DFX Documentation](https://internetcomputer.org/docs/current/developer-docs/setup/install)**: DFX SDK setup and usage

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

MIT License - see LICENSE file for details

## 🔗 Links

- **Internet Computer**: https://internetcomputer.org/
- **Motoko Language**: https://internetcomputer.org/docs/current/motoko/intro
- **DFX SDK**: https://internetcomputer.org/docs/current/developer-docs/setup/install
- **Next.js**: https://nextjs.org/
- **Tailwind CSS**: https://tailwindcss.com/

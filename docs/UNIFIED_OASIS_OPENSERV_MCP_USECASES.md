# Unified OASIS + OpenSERV MCP - Use Cases

## 🎯 What Is This?

A unified MCP server that combines **OASIS Platform** (data, identity, blockchain) with **OpenSERV** (AI agents, workflows) into a single, powerful interface accessible directly from Cursor.

**Think of it as:**
- OASIS = Your data layer (avatars, wallets, NFTs, karma, holons, etc.)
- OpenSERV = Your AI brain (agents, workflows, reasoning)
- Unified MCP = One interface to rule them all! 👑

---

## 🚀 Real-World Use Cases

### Category 1: Data Analysis & Insights

#### Use Case 1.1: Analyze OASIS Data with AI

**You ask Cursor:**
> "Analyze all avatar karma scores and give me insights on user engagement patterns"

**What happens:**
1. Cursor uses unified MCP to query OASIS: `GET /api/karma/leaderboard`
2. Retrieves karma data for all avatars
3. Sends data to OpenSERV agent: `execute_workflow("data-analyst", "Analyze karma patterns", {data: karmaData})`
4. OpenSERV agent processes and generates insights
5. Results stored back in OASIS as a holon: `POST /api/data/save-holon`
6. Cursor shows you: "Users with karma > 1000 show 3x engagement. Top 10% drive 60% of activity."

**Value:** AI-powered insights from your OASIS data, automatically stored for future reference.

---

#### Use Case 1.2: Wallet Analysis & Recommendations

**You ask Cursor:**
> "Analyze wallet transaction patterns and suggest optimization strategies"

**What happens:**
1. Query OASIS wallets: `GET /api/wallet/get-all-wallets`
2. Get transaction history for each wallet
3. Execute OpenSERV workflow: `execute_workflow("financial-analyst", "Analyze transactions", {wallets: walletData})`
4. AI agent identifies patterns (high gas fees, unused tokens, etc.)
5. Generate recommendations stored as holon
6. Cursor shows: "Found 5 wallets with high gas fees. Consider consolidating transactions. 3 wallets have unused tokens worth $500."

**Value:** Intelligent financial analysis and actionable recommendations.

---

### Category 2: Agent Discovery & Orchestration

#### Use Case 2.1: Find Best Agent for Task

**You ask Cursor:**
> "Find an agent that can analyze Solana NFT data and execute the workflow"

**What happens:**
1. Query A2A agents: `GET /api/a2a/agents/by-service?service=nft-analysis`
2. Query OpenSERV agents: `list_openserv_agents()` filtered by "nft" capability
3. Check agent karma/reputation from OASIS: `GET /api/karma/get-karma/{agentId}`
4. Rank agents by capability + reputation
5. Execute workflow on best agent: `execute_workflow(bestAgentId, "Analyze Solana NFTs", {...})`
6. Cursor shows: "Found 3 agents. Selected 'nft-analyst-pro' (karma: 1250). Workflow executing..."

**Value:** Intelligent agent selection combining discovery, capabilities, and reputation.

---

#### Use Case 2.2: Multi-Agent Workflow with OASIS Data

**You ask Cursor:**
> "Use an NLP agent to analyze user feedback, then store insights in OASIS and award karma to top contributors"

**What happens:**
1. Query OASIS for user feedback: `GET /api/data/search?query=user+feedback`
2. Execute OpenSERV NLP workflow: `execute_workflow("nlp-agent", "Sentiment analysis", {feedback: data})`
3. Process results to identify top contributors
4. Store insights in OASIS: `POST /api/data/save-holon` (sentiment analysis results)
5. Award karma: `POST /api/karma/add-karma` (for top contributors)
6. Create NFT certificate: `POST /api/nft/mint-nft` (for top contributor)
7. Cursor shows: "Analyzed 500 feedback entries. 85% positive sentiment. Awarded karma to 10 top contributors. Created NFT certificate for #1 contributor."

**Value:** End-to-end workflow from data → AI analysis → storage → rewards.

---

### Category 3: Identity & Avatar Management

#### Use Case 3.1: AI-Powered Avatar Profile Enhancement

**You ask Cursor:**
> "Analyze avatar activity patterns and suggest profile improvements"

**What happens:**
1. Get avatar data: `GET /api/avatar/get-avatar/{id}`
2. Get avatar's holons, karma, social connections, wallet activity
3. Execute OpenSERV workflow: `execute_workflow("profile-optimizer", "Analyze profile", {avatar: avatarData})`
4. AI generates personalized recommendations
5. Store recommendations in avatar metadata: `PUT /api/avatar/update-avatar`
6. Cursor shows: "Profile analysis complete. Recommendations: Add 3 more skills, connect with 5 similar avatars, complete 2 quests to unlock next karma tier."

**Value:** AI-driven personalization for avatar profiles.

---

#### Use Case 3.2: Smart Avatar Matching

**You ask Cursor:**
> "Find avatars that would be good collaborators based on skills and karma"

**What happens:**
1. Query avatars: `GET /api/avatar/load-all-avatars`
2. Get skills, karma, and activity for each
3. Execute OpenSERV matching workflow: `execute_workflow("collaboration-matcher", "Find matches", {avatars: avatarData})`
4. AI analyzes compatibility (complementary skills, similar karma levels, etc.)
5. Store matches in OASIS: `POST /api/social/add-friend` (suggested connections)
6. Cursor shows: "Found 12 potential collaborators. Top match: 'data-scientist-42' (95% compatibility). Shared interests: AI, blockchain. Complementary skills: You have frontend, they have backend."

**Value:** AI-powered networking and collaboration discovery.

---

### Category 4: Blockchain & NFT Operations

#### Use Case 4.1: NFT Collection Analysis

**You ask Cursor:**
> "Analyze my NFT collection and suggest which ones to trade or hold"

**What happens:**
1. Get NFTs: `GET /api/nft/get-all-nfts-for-avatar/{avatarId}`
2. Get market data from OASIS blockchain providers
3. Execute OpenSERV analysis: `execute_workflow("nft-analyst", "Collection analysis", {nfts: nftData, market: marketData})`
4. AI analyzes rarity, market trends, price predictions
5. Store analysis in holon: `POST /api/data/save-holon`
6. Cursor shows: "Collection analysis: 3 NFTs are undervalued (hold), 2 are at peak (consider selling), 1 rare NFT missing from collection (worth acquiring)."

**Value:** Intelligent NFT portfolio management.

---

#### Use Case 4.2: Generate NFT from AI Workflow Results

**You ask Cursor:**
> "Run a data analysis workflow and mint an NFT certificate with the results"

**What happens:**
1. Execute OpenSERV workflow: `execute_workflow("data-analyst", "Analyze sales data", {data: salesData})`
2. Get workflow results
3. Generate NFT metadata from results
4. Mint NFT on blockchain: `POST /api/nft/mint-nft` (with workflow results as metadata)
5. Store NFT link in holon: `POST /api/data/save-holon`
6. Cursor shows: "Workflow complete. Analysis: Sales up 45% QoQ. Minted NFT certificate 'Q1-2026-Sales-Analysis' on Solana. NFT ID: abc123..."

**Value:** Blockchain-verified certificates for AI-generated insights.

---

### Category 5: Karma & Reputation System

#### Use Case 5.1: AI-Powered Karma Recommendations

**You ask Cursor:**
> "Analyze my karma history and suggest actions to improve my reputation"

**What happens:**
1. Get karma history: `GET /api/karma/get-karma-history/{avatarId}`
2. Get avatar activity data
3. Execute OpenSERV analysis: `execute_workflow("reputation-advisor", "Karma analysis", {karma: karmaData, activity: activityData})`
4. AI identifies patterns and suggests improvements
5. Store recommendations in holon
6. Cursor shows: "Karma analysis: You're in top 15%. To reach top 5%: Complete 3 more quests, contribute to 2 open-source projects, help 5 new users. Estimated time: 2 weeks."

**Value:** Personalized reputation improvement strategies.

---

#### Use Case 5.2: Agent Reputation Tracking

**You ask Cursor:**
> "Show me the reputation scores of all AI agents and rank them by performance"

**What happens:**
1. Get all A2A agents: `GET /api/a2a/agents`
2. Get all OpenSERV agents: `list_openserv_agents()`
3. For each agent, get karma: `GET /api/karma/get-karma/{agentId}`
4. Get agent task completion stats from OASIS
5. Execute ranking workflow: `execute_workflow("agent-ranker", "Rank agents", {agents: agentData})`
6. AI ranks by karma + performance metrics
7. Cursor shows: "Agent Rankings: 1. 'data-analyst-pro' (karma: 2500, 98% success), 2. 'nlp-master' (karma: 2100, 95% success)..."

**Value:** Transparent agent reputation and performance tracking.

---

### Category 6: Workflow Automation

#### Use Case 6.1: Automated Daily Reports

**You ask Cursor:**
> "Set up a daily workflow that analyzes OASIS activity and generates a report"

**What happens:**
1. Create scheduled workflow in OpenSERV
2. Daily execution:
   - Query OASIS stats: `GET /api/stats/get-all-stats`
   - Get avatar activity: `GET /api/avatar/load-all-avatars`
   - Execute report workflow: `execute_workflow("report-generator", "Daily report", {stats: statsData})`
   - Store report in OASIS: `POST /api/data/save-holon`
   - Send via messaging: `POST /api/messaging/send-message`
3. Cursor shows: "Daily report workflow configured. Will run at 9 AM daily. Reports stored in OASIS and sent to your inbox."

**Value:** Automated intelligence and reporting.

---

#### Use Case 6.2: Smart Data Pipeline

**You ask Cursor:**
> "Create a workflow that processes new OASIS data, analyzes it with AI, and stores insights"

**What happens:**
1. Set up webhook: OASIS → OpenSERV (when new data arrives)
2. Workflow triggers automatically:
   - Receive new holon data from OASIS
   - Execute analysis: `execute_workflow("data-processor", "Process new data", {holon: newHolon})`
   - Store insights: `POST /api/data/save-holon` (with analysis results)
   - Update related avatars: `PUT /api/avatar/update-avatar` (with insights)
3. Cursor shows: "Pipeline configured. New data → AI analysis → Insights stored. Last processed: 5 minutes ago. 12 insights generated today."

**Value:** Real-time AI processing of OASIS data.

---

### Category 7: Cross-Platform Integration

#### Use Case 7.1: Multi-Blockchain Analysis

**You ask Cursor:**
> "Analyze wallet activity across all blockchains and identify optimization opportunities"

**What happens:**
1. Get wallets from all providers: Solana, Ethereum, Polygon, etc.
2. Get transaction history for each
3. Execute OpenSERV workflow: `execute_workflow("multi-chain-analyst", "Cross-chain analysis", {wallets: allWallets})`
4. AI identifies cross-chain opportunities (arbitrage, consolidation, etc.)
5. Store recommendations in OASIS
6. Cursor shows: "Multi-chain analysis: Found 3 arbitrage opportunities ($50 profit potential), 2 wallets can be consolidated (save $5/month gas), 1 token should be bridged to cheaper chain."

**Value:** Cross-chain intelligence and optimization.

---

#### Use Case 7.2: Social Network Analysis

**You ask Cursor:**
> "Analyze the OASIS social network and identify key influencers and communities"

**What happens:**
1. Get social graph: `GET /api/social/get-all-friends`, `GET /api/social/get-followers`
2. Get karma and activity data
3. Execute OpenSERV network analysis: `execute_workflow("network-analyst", "Social analysis", {graph: socialData})`
4. AI identifies communities, influencers, connection patterns
5. Store analysis in holon
6. Cursor shows: "Network analysis: 5 distinct communities identified. Top 3 influencers: 'blockchain-guru' (2.5k followers), 'ai-researcher' (1.8k followers)... Strongest community: AI/Blockchain enthusiasts (450 members)."

**Value:** Social intelligence and community insights.

---

### Category 8: Agent Creation & Management

#### Use Case 8.1: Create New OpenSERV Agent

**You ask Cursor:**
> "Create a new OpenSERV agent for sentiment analysis with capabilities: nlp, sentiment-analysis, text-processing"

**What happens:**
1. Unified MCP calls OpenSERV registration: `POST /api/a2a/openserv/register`
   - Creates agent with specified capabilities
   - Registers with OpenSERV platform
2. Creates OASIS avatar: `POST /api/avatar/register` (AvatarType.Agent)
3. Registers A2A capabilities: `POST /api/a2a/agent/capabilities`
4. Registers with SERV infrastructure: `POST /api/a2a/agent/register-service`
5. Creates wallet for agent: `POST /api/wallet/create-wallet` (for payments)
6. Stores agent metadata in OASIS: `POST /api/data/save-holon`
7. Cursor shows: "Agent created! OpenSERV Agent ID: 'sentiment-analyzer-001', OASIS Avatar ID: 'abc-123-def', A2A Agent ID: 'xyz-789'. Capabilities: nlp, sentiment-analysis, text-processing. Registered with SERV. Wallet created on Solana. Agent is now discoverable and ready to use!"

**Value:** One command creates a fully integrated agent across all systems.

---

#### Use Case 8.2: Create A2A Agent with Custom Capabilities

**You ask Cursor:**
> "Create an A2A agent that specializes in NFT analysis with pricing, rarity, and market trend capabilities"

**What happens:**
1. Creates OASIS avatar: `POST /api/avatar/register` (AvatarType.Agent, username: "nft-analyst-pro")
2. Registers A2A capabilities: `POST /api/a2a/agent/capabilities`
   ```json
   {
     "services": ["nft-analysis", "nft-pricing", "rarity-analysis", "market-trends"],
     "skills": ["Blockchain", "NFT", "Market Analysis", "Data Science"],
     "pricing": {"nft-analysis": 0.1, "pricing": 0.05},
     "status": "Available"
   }
   ```
3. Registers with SERV: `POST /api/a2a/agent/register-service`
4. Creates Solana wallet: `POST /api/wallet/create-wallet` (for receiving payments)
5. Initializes karma: `POST /api/karma/add-karma` (starter karma: 100)
6. Stores agent profile: `POST /api/data/save-holon`
7. Cursor shows: "A2A Agent 'nft-analyst-pro' created! Agent ID: 'agent-456'. Services: NFT analysis, pricing, rarity, market trends. Registered with SERV. Solana wallet: 7xKXtg2... Initial karma: 100. Agent card available at: /api/a2a/agent-card/agent-456"

**Value:** Complete agent setup with identity, capabilities, and payment infrastructure.

---

#### Use Case 8.3: Create Agent from AI-Generated Specification

**You ask Cursor:**
> "I need an agent that can analyze DeFi protocols. Use AI to design the best agent specification, then create it"

**What happens:**
1. Executes OpenSERV workflow: `execute_workflow("agent-designer", "Design DeFi analysis agent", {requirements: "analyze DeFi protocols"})`
2. AI generates agent specification:
   ```json
   {
     "name": "defi-protocol-analyzer",
     "capabilities": ["defi-analysis", "smart-contract-review", "risk-assessment", "yield-optimization"],
     "skills": ["Solidity", "DeFi", "Risk Analysis", "Blockchain Security"],
     "pricing": {"defi-analysis": 0.2, "risk-assessment": 0.15},
     "description": "Specialized agent for DeFi protocol analysis and risk assessment"
   }
   ```
3. Creates OpenSERV agent: `POST /api/a2a/openserv/register` (with AI-generated spec)
4. Creates OASIS avatar with AI-generated profile
5. Registers all capabilities and services
6. Stores AI-generated agent design in OASIS: `POST /api/data/save-holon`
7. Cursor shows: "AI-designed agent created! Specification generated by AI. Agent: 'defi-protocol-analyzer'. Capabilities: DeFi analysis, smart contract review, risk assessment, yield optimization. Pricing model: $0.20 per analysis, $0.15 per risk assessment. Agent design document saved in OASIS."

**Value:** AI-assisted agent creation with optimized specifications.

---

#### Use Case 8.4: Clone and Customize Existing Agent

**You ask Cursor:**
> "Clone the 'data-analyst-pro' agent but specialize it for blockchain data analysis"

**What happens:**
1. Gets source agent: `GET /api/a2a/agent-card/{agentId}` (data-analyst-pro)
2. Gets agent capabilities and configuration
3. Executes OpenSERV workflow: `execute_workflow("agent-customizer", "Customize for blockchain", {sourceAgent: agentData, specialization: "blockchain"})`
4. AI generates customized specification (adds blockchain-specific capabilities)
5. Creates new agent: `POST /api/a2a/openserv/register` (with customized spec)
6. Links agents in OASIS: `POST /api/social/add-friend` (agent relationship)
7. Stores clone metadata: `POST /api/data/save-holon` (notes: "cloned from data-analyst-pro")
8. Cursor shows: "Agent cloned and customized! New agent: 'blockchain-data-analyst'. Based on: 'data-analyst-pro'. Added capabilities: blockchain-data, on-chain-analysis, transaction-tracing. Linked to parent agent. Ready to use!"

**Value:** Rapid agent creation by cloning and customizing existing agents.

---

#### Use Case 8.5: Create Agent Team/Network

**You ask Cursor:**
> "Create a team of 3 specialized agents: one for data collection, one for analysis, and one for reporting, then connect them"

**What happens:**
1. Creates Agent 1 (Data Collector):
   - `POST /api/a2a/openserv/register` (capabilities: ["data-collection", "api-integration"])
2. Creates Agent 2 (Analyzer):
   - `POST /api/a2a/openserv/register` (capabilities: ["data-analysis", "ml-models"])
3. Creates Agent 3 (Reporter):
   - `POST /api/a2a/openserv/register` (capabilities: ["report-generation", "visualization"])
4. Creates team holon: `POST /api/data/save-holon` (team structure)
5. Links agents: `POST /api/social/add-friend` (creates agent network)
6. Sets up workflow: Creates A2A workflow that chains: Collector → Analyzer → Reporter
7. Stores team configuration: `POST /api/data/save-holon` (workflow definition)
8. Cursor shows: "Agent team created! Team: 'data-pipeline-team'. Agents: 1. 'data-collector-001' (collection), 2. 'data-analyzer-001' (analysis), 3. 'report-generator-001' (reporting). Agents linked. Workflow configured: data → analysis → report. Team holon created. Ready for orchestrated workflows!"

**Value:** Create coordinated agent teams for complex workflows.

---

#### Use Case 8.6: Create Agent with Auto-Scaling Configuration

**You ask Cursor:**
> "Create a high-performance agent for image processing that can handle 100 concurrent requests"

**What happens:**
1. Creates agent with high-performance config:
   - `POST /api/a2a/openserv/register` (with performance metadata)
2. Sets agent metadata: `max_concurrent_tasks: 100`, `performance_tier: "high"`
3. Registers with SERV with load balancing: `POST /api/a2a/agent/register-service` (with load balancing config)
4. Creates monitoring holon: `POST /api/data/save-holon` (performance tracking)
5. Sets up auto-scaling rules in OASIS settings
6. Cursor shows: "High-performance agent created! Agent: 'image-processor-hp'. Max concurrent tasks: 100. Performance tier: High. Load balancing enabled. Auto-scaling configured. Monitoring set up. Agent ready for high-volume workloads!"

**Value:** Create production-ready agents with performance optimization.

---

### Category 9: Development & Debugging

#### Use Case 9.1: API Debugging with AI

**You ask Cursor:**
> "Analyze OASIS API errors from the last hour and suggest fixes"

**What happens:**
1. Query OASIS logs/errors: `GET /api/stats/get-errors` (if available)
2. Get API metrics: `GET /api/hyperdrive/metrics`
3. Execute OpenSERV analysis: `execute_workflow("debug-assistant", "Analyze errors", {errors: errorData, metrics: metricsData})`
4. AI identifies patterns, root causes, suggests fixes
5. Store analysis in holon
6. Cursor shows: "Error analysis: 12 errors in last hour. Root cause: Rate limiting on MongoDB provider. Solution: Enable auto-failover to SQLite. 3 endpoints need retry logic. Suggested code fixes: [shows code]"

**Value:** AI-powered debugging and optimization.

---

#### Use Case 9.2: Code Generation from OASIS Data

**You ask Cursor:**
> "Generate a TypeScript client for the OASIS API based on the current endpoints"

**What happens:**
1. Query OASIS API documentation: `GET /api/swagger` or analyze endpoints
2. Get OpenAPI spec if available
3. Execute OpenSERV code generation: `execute_workflow("code-generator", "Generate TypeScript client", {api: apiSpec})`
4. AI generates typed client with all endpoints
5. Store generated code in OASIS: `POST /api/files/upload-file`
6. Cursor shows: "TypeScript client generated. 150+ endpoints typed. Includes: AvatarClient, WalletClient, NFTClient... File saved to OASIS storage."

**Value:** Automated SDK generation from live API.

---

## 🎯 Advanced Combined Use Cases

### Use Case 10.1: Complete User Onboarding Workflow

**You ask Cursor:**
> "When a new avatar registers, analyze their profile, suggest initial connections, and create a personalized quest"

**What happens:**
1. New avatar registered in OASIS
2. Webhook triggers OpenSERV workflow
3. Workflow:
   - Get avatar data: `GET /api/avatar/get-avatar/{id}`
   - Analyze profile: `execute_workflow("profile-analyzer", "New user analysis", {avatar: avatarData})`
   - Find similar avatars: Query OASIS social graph
   - Generate personalized quest: `POST /api/quest/create-quest` (with AI-generated objectives)
   - Send welcome message: `POST /api/messaging/send-message`
   - Award starter karma: `POST /api/karma/add-karma`
4. Cursor shows: "Onboarding complete. Profile analyzed. 5 similar users found. Personalized quest created: 'Complete your first NFT trade' (estimated: 15 min, reward: 50 karma). Welcome message sent."

**Value:** Automated, personalized user onboarding.

---

### Use Case 10.2: AI-Powered Marketplace

**You ask Cursor:**
> "Create a smart marketplace that uses AI to match NFT buyers and sellers based on preferences and karma"

**What happens:**
1. Get all NFTs for sale: `GET /api/nft/get-all-nfts`
2. Get buyer preferences from avatars
3. Execute matching workflow: `execute_workflow("marketplace-matcher", "Match buyers/sellers", {nfts: nftData, buyers: buyerData})`
4. AI matches based on preferences, karma, price, rarity
5. Store matches in OASIS: `POST /api/data/save-holon`
6. Notify matched parties: `POST /api/messaging/send-message`
7. Cursor shows: "Marketplace matching: 12 matches found. Top match: 'rare-art-collector' wants your 'Digital-Mona-Lisa' NFT. Match score: 94%. Both have karma > 1000 (verified traders)."

**Value:** Intelligent marketplace with reputation-based matching.

---

### Use Case 10.3: Autonomous Agent Ecosystem

**You ask Cursor:**
> "Set up an autonomous agent that monitors OASIS activity, identifies opportunities, and executes actions"

**What happens:**
1. Create autonomous agent workflow
2. Agent continuously:
   - Monitors OASIS: `GET /api/stats/get-all-stats` (periodic)
   - Analyzes opportunities: `execute_workflow("opportunity-detector", "Find opportunities", {stats: statsData})`
   - Identifies actions (e.g., "User X needs help with Y", "Arbitrage opportunity on chain Z")
   - Executes actions via OASIS API (send message, create quest, etc.)
   - Reports activity: `POST /api/data/save-holon`
3. Cursor shows: "Autonomous agent active. Last 24h: Identified 8 opportunities, helped 3 users, created 2 quests, detected 1 arbitrage opportunity ($25 profit). Agent karma: +150."

**Value:** Self-operating intelligent agent ecosystem.

---

## 🔄 The Unified Flow

```
You (in Cursor)
    ↓
    "Analyze my OASIS data with AI"
    ↓
Cursor AI
    ↓
    "I need OASIS data + AI analysis"
    ↓
Unified MCP Server (OASIS + OpenSERV)
    ↓
    ├─→ OASIS API (get data)
    │   └─→ Returns: Avatars, Wallets, NFTs, Karma, etc.
    │
    └─→ OpenSERV API (AI workflow)
        └─→ Returns: Analysis, Insights, Recommendations
    ↓
Unified MCP Server
    ↓
    Combines results
    ↓
    Optionally stores back in OASIS
    ↓
Cursor AI
    ↓
    Shows you the complete answer
```

---

## 💡 Key Benefits

### 1. **Seamless Integration**
- One interface for data (OASIS) and AI (OpenSERV)
- No context switching between systems
- Unified authentication and permissions

### 2. **Intelligent Automation**
- AI workflows that understand your OASIS data
- Automated insights and recommendations
- Self-improving systems

### 3. **Complete Workflows**
- Data → AI Analysis → Storage → Actions
- End-to-end automation
- Blockchain verification of AI results

### 4. **Agent Creation & Management**
- Create agents with natural language
- AI-assisted agent design
- Clone and customize existing agents
- Build agent teams and networks
- Full lifecycle management from Cursor

### 5. **Developer Experience**
- Natural language interaction
- No need to learn multiple APIs
- Everything accessible from Cursor

### 6. **Ecosystem Intelligence**
- Agents that understand your platform
- Reputation-based agent selection
- Community-driven AI improvements

---

## 🎓 Example Conversation Flow

**You:** "Show me users with high karma who haven't been active recently, then send them a personalized re-engagement message"

**Cursor (via Unified MCP):**
1. Queries OASIS: Gets avatars, filters by karma > 1000, checks last activity
2. Finds: 15 inactive high-karma users
3. Executes OpenSERV: `execute_workflow("message-generator", "Create re-engagement messages", {users: userData})`
4. AI generates personalized messages for each user
5. Stores messages in OASIS: `POST /api/data/save-holon`
6. Sends messages: `POST /api/messaging/send-message` (15 messages)
7. **Response:** "Found 15 inactive high-karma users. Generated personalized re-engagement messages. Messages sent. Example: 'Hey blockchain-guru! You've been away for 30 days. Your karma (1250) puts you in top 5%! New quests available: [list]. Come back and claim your rewards!'"

---

## 🚀 Getting Started

Once the unified MCP server is implemented, you'll be able to:

1. **Query OASIS data naturally:**
   - "Show me all avatars with karma > 1000"
   - "What NFTs does avatar X own?"
   - "Get wallet balance for Solana address Y"

2. **Execute AI workflows:**
   - "Analyze this data with the NLP agent"
   - "Run a sentiment analysis on user feedback"
   - "Generate insights from wallet transactions"

3. **Combine both:**
   - "Analyze OASIS user activity and generate a report"
   - "Find the best agent to analyze my NFT collection"
   - "Create a workflow that processes new OASIS data automatically"

4. **Create and manage agents:**
   - "Create a new OpenSERV agent for sentiment analysis"
   - "Create an A2A agent with NFT analysis capabilities"
   - "Clone the data-analyst agent and customize it for blockchain"
   - "Create a team of 3 agents that work together"

---

**The unified OASIS + OpenSERV MCP turns Cursor into a powerful command center for your entire platform! 🎯**

---

## 🤖 Agent Creation: The Game Changer

### Why Agent Creation is Powerful

Creating agents via unified MCP means you can:

1. **Rapid Prototyping:** Create agents in seconds with natural language
   - "Create an agent for sentiment analysis"
   - "Make an NFT pricing agent"
   - "Build a DeFi risk analyzer"

2. **Full Integration:** Every agent is automatically:
   - ✅ Registered with OpenSERV (AI capabilities)
   - ✅ Registered with A2A Protocol (agent communication)
   - ✅ Has OASIS avatar (identity)
   - ✅ Registered with SERV (service discovery)
   - ✅ Has wallet (for payments)
   - ✅ Has karma (reputation)
   - ✅ Stored in OASIS (persistence)

3. **AI-Assisted Design:** Let AI help design optimal agents
   - AI suggests capabilities based on requirements
   - AI optimizes pricing models
   - AI recommends agent configurations

4. **Agent Networks:** Build teams and ecosystems
   - Create agent teams that work together
   - Link agents for complex workflows
   - Build agent marketplaces

### Example: Complete Agent Creation Flow

**You:** "Create a specialized agent for analyzing Solana NFT collections with pricing, rarity, and market trend capabilities"

**Unified MCP:**
1. **AI Design Phase:**
   - Executes OpenSERV workflow to design optimal agent spec
   - AI suggests: "Add on-chain data analysis capability"
   - AI recommends pricing: "$0.15 per collection analysis"

2. **Creation Phase:**
   - Creates OpenSERV agent: `POST /api/a2a/openserv/register`
   - Creates OASIS avatar: `POST /api/avatar/register` (AvatarType.Agent)
   - Registers A2A capabilities: `POST /api/a2a/agent/capabilities`
   - Registers with SERV: `POST /api/a2a/agent/register-service`
   - Creates Solana wallet: `POST /api/wallet/create-wallet`
   - Initializes karma: `POST /api/karma/add-karma` (starter: 100)

3. **Configuration Phase:**
   - Sets up agent metadata in OASIS
   - Configures payment settings
   - Links to related agents (if any)
   - Stores agent design document

4. **Response:**
   ```
   ✅ Agent Created Successfully!
   
   Agent Details:
   - Name: "solana-nft-analyzer"
   - OpenSERV ID: "agent-solana-nft-001"
   - OASIS Avatar ID: "abc-123-def-456"
   - A2A Agent ID: "xyz-789-uvw-012"
   
   Capabilities:
   - NFT Collection Analysis
   - Pricing Analysis
   - Rarity Calculation
   - Market Trend Analysis
   - On-Chain Data Analysis (AI-suggested)
   
   Infrastructure:
   - ✅ Registered with OpenSERV
   - ✅ Registered with A2A Protocol
   - ✅ Registered with SERV (discoverable)
   - ✅ Solana Wallet: 7xKXtg2CZ9qB2Y3...
   - ✅ Initial Karma: 100
   - ✅ Agent Card: /api/a2a/agent-card/xyz-789-uvw-012
   
   Pricing: $0.15 per collection analysis
   Status: Available and ready to use!
   ```

### Agent Creation Use Cases Summary

| Use Case | What You Say | What Happens |
|----------|--------------|--------------|
| **Simple Agent** | "Create a sentiment analysis agent" | Creates fully integrated agent in one command |
| **Specialized Agent** | "Create an NFT pricing agent" | Creates agent with specific capabilities |
| **AI-Designed Agent** | "Design and create a DeFi analyzer" | AI designs optimal spec, then creates agent |
| **Cloned Agent** | "Clone data-analyst and customize for blockchain" | Copies existing agent, adds new capabilities |
| **Agent Team** | "Create 3 agents: collector, analyzer, reporter" | Creates team of coordinated agents |
| **High-Performance** | "Create agent that handles 100 concurrent requests" | Creates agent with performance optimization |

### The Power of Unified Agent Creation

**Without Unified MCP:**
```
1. Create OpenSERV agent (via OpenSERV API)
2. Create OASIS avatar (via OASIS API)
3. Register A2A capabilities (via A2A API)
4. Register with SERV (via SERV API)
5. Create wallet (via Wallet API)
6. Initialize karma (via Karma API)
7. Link everything together manually
```

**With Unified MCP:**
```
"Create an agent for X"
→ Everything happens automatically
→ Fully integrated and ready to use
```

**That's the power of unification! 🚀**


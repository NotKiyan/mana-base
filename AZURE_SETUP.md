# Complete Azure Deployment Guide - Manual Setup

## Important Note
Your Azure for Students subscription has CLI restrictions. All resources must be created through the Azure Portal.

## Step 1: Create PostgreSQL Database

1. **Go to Azure Portal**: https://portal.azure.com
2. **Click "Create a resource"**
3. **Search for "Azure Database for PostgreSQL flexible servers"**
4. **Click "Create"**

### Configuration:
- **Subscription**: Azure for Students
- **Resource Group**: mana-nexus-rg (already created)
- **Server name**: mana-nexus-db
- **Region**: Southeast Asia
- **PostgreSQL version**: 16
- **Workload type**: Development
- **Compute + storage**: Burstable, B1ms (1 vCore, 2 GiB RAM, 32 GiB storage)

### Authentication:
- **Authentication method**: PostgreSQL authentication only
- **Admin username**: manaadmin
- **Password**: (Use a strong password - at least 12 characters with uppercase, lowercase, numbers, and symbols)
- **Confirm password**: (Same as above)

### Networking:
- **Connectivity method**: Public access (all IP addresses) - 0.0.0.0 - 255.255.255.255
- Or add your current IP and Azure services

### Review + Create:
- Review the settings
- Click **Create**
- Wait for deployment (5-10 minutes)

### After Creation:
1. Go to the PostgreSQL server resource
2. Click on "Connection strings" in the left menu
3. Copy the connection details - we'll need:
   - Server name (will be: mana-nexus-db.postgres.database.azure.com)
   - Port: 5432
   - Database: postgres (default)
   - Username: manaadmin
   - Password: (The password you set during creation)

### Create the MTGupdated Database:
1. In the PostgreSQL server page, click "Databases" in the left menu
2. Click "+ Add"
3. Name: MTGupdated
4. Click "Save"

---

## Step 2: Create Cosmos DB (MongoDB API)

1. **Go to Azure Portal**: https://portal.azure.com
2. **Click "Create a resource"**
3. **Search for "Azure Cosmos DB"**
4. **Select "Azure Cosmos DB for MongoDB"**
5. **Click "Create"**

### Configuration:
- **Subscription**: Azure for Students
- **Resource Group**: mana-nexus-rg
- **Account name**: mana-nexus-cosmos
- **Location**: Southeast Asia
- **Capacity mode**: Serverless (Recommended for students)
- **Version**: 4.2 or higher

### Networking:
- **Connectivity method**: All networks (or add your IP)
- **Allow access from Azure Portal**: Yes

### Review + Create and wait for deployment

### After Creation:
1. Go to Cosmos DB resource
2. Click "Connection String" in left menu
3. Copy the PRIMARY CONNECTION STRING
4. It will look like: `mongodb://mana-nexus-cosmos:...@mana-nexus-cosmos.mongo.cosmos.azure.com:10255/?ssl=true...`

---

## Step 3: Create App Service

1. **Go to Azure Portal**: https://portal.azure.com
2. **Click "Create a resource"**
3. **Search for "Web App"**
4. **Click "Create"**

### Basics:
- **Subscription**: Azure for Students
- **Resource Group**: mana-nexus-rg
- **Name**: mana-nexus (this will be your URL: mana-nexus.azurewebsites.net)
- **Publish**: Code
- **Runtime stack**: Node 20 LTS
- **Operating System**: Linux
- **Region**: Southeast Asia

### App Service Plan:
- **Linux Plan**: Create new → "mana-nexus-plan"
- **Pricing plan**: Free F1 (100 MB storage, 60 minutes/day compute)
  - Or Basic B1 if you need more resources

### Click "Review + Create" and wait for deployment

---

## Step 4: Configure App Service Settings

After the App Service is created:

1. **Go to your App Service** (mana-nexus)
2. **Click "Configuration"** in the left menu
3. **Click "+ New application setting"** for each:

```
PORT=8080
NODE_ENV=production

# PostgreSQL Settings
DB_HOST=mana-nexus-db.postgres.database.azure.com
DB_PORT=5432
DB_NAME=MTGupdated
DB_USER=manaadmin
DB_PASSWORD=ManaDB2026!Secure

# MongoDB Settings (paste your connection string from Cosmos DB)
MONGO_URI=mongodb://mana-nexus-cosmos:...@mana-nexus-cosmos.mongo.cosmos.azure.com:10255/?ssl=true...

# JWT Secret (generate a random strong secret)
JWT_SECRET=your-super-secret-jwt-key-change-this-to-random-string

# Frontend URL
FRONTEND_URL=https://mana-nexus.azurewebsites.net
```

4. **Click "Save"** at the top
5. **Click "Yes"** to restart the app

---

## Step 5: Configure Deployment

### Option A: GitHub Actions (Recommended)

1. In your App Service, click **"Deployment Center"** in left menu
2. Select **Source**: GitHub
3. Click **"Authorize"** to connect GitHub
4. Select:
   - **Organization**: Your GitHub username
   - **Repository**: mana-base
   - **Branch**: main
5. Click **"Save"**

Azure will:
- Auto-generate a GitHub Actions workflow
- Add a publish profile secret to your repo
- Trigger the first deployment

### Option B: Local Git Deploy

1. In Deployment Center, select **"Local Git"**
2. Copy the Git Clone URI
3. In your local terminal:
```bash
cd "/home/charan/Repos/mana base"
git remote add azure <paste-git-clone-uri>
git push azure main
```

---

## Step 6: Configure Startup Command

1. In App Service, go to **"Configuration"**
2. Click **"General settings"** tab
3. **Startup Command**: `/home/startup.sh`
4. **Stack settings**:
   - Major version: Node 20 LTS
   - Minor version: Node 20 LTS
5. Click **"Save"**

---

## Step 7: Verify Deployment

1. Wait 5-10 minutes for first deployment
2. Go to your App Service **"Overview"**
3. Click the **URL**: https://mana-nexus.azurewebsites.net
4. You should see your Mana Nexus app!

### Check Logs:
- Click **"Log stream"** in left menu to see real-time logs
- Or **"Diagnose and solve problems"** for troubleshooting

---

## Alternative: Use Free External Databases

If Azure databases are too expensive or restricted:

### Free PostgreSQL - Supabase:
1. Go to https://supabase.com
2. Create free account
3. Create new project (500MB free)
4. Get connection string from Settings → Database
5. Use in DB_HOST, DB_PORT, DB_USER, DB_PASSWORD

### Free MongoDB - MongoDB Atlas:
1. Go to https://www.mongodb.com/cloud/atlas
2. Create free account  
3. Create M0 Free cluster (512MB)
4. Get connection string
5. Use as MONGO_URI

---

## Once Complete, Let Me Know!
After setting up these resources, let me know and I'll help you:
- Push the updated code to GitHub
- Verify the deployment
- Test the application
- Troubleshoot any issues

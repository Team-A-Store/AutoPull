# AutoPull: Automatic FiveM Resource Updates (Hot-Reload)

A Node.js tool that watches your GitHub repositories and automatically updates your FiveM resources on your windows VPS server when changes are detected.

When new code is pushed to GitHub, it automatically downloads the changes and can restart the resource in TXAdmin - no manual intervention needed, works for private repositories.

![AutoPull Demo](screenshot.gif)

> [!WARNING]  
> These options require advanced knowledge of TXAdmin and server management.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Start the server:

```bash
npm start
# or
nodemon autopull.js
# or double click run.cmd instead..
```

> [!CAUTION]
> Use at your own risk.

## Adding a New Resource

> [!NOTE]  
> **Important:** Your Windows VPS must remain open for AutoPull to work correctly.

### 1. Configure the Resource

Add your resource configuration to `config.js`:

```javascript
'example-resource': {
    path: "C:/path/to/resource",
    txAdminRefresh: false,  // Set to true to auto-refresh TXAdmin
    txAdminEnsure: false,   // Set to true to auto-ensure the resource
},
```

This will create a webhook URL: `http://your-server-ip:8424/autopull/example-resource`

### About `txAdminRefresh` and `txAdminEnsure`

```javascript
'example-resource': {
    path: "C:/path/to/resource",
    txAdminRefresh: false,  // Set to true to auto-refresh TXAdmin
    txAdminEnsure: false,   // Set to true to auto-ensure the resource
},
```

> [!IMPORTANT]  
> Using these options incorrectly can cause unexpected behavior or server instability.

**Explanation:**

- `txAdminRefresh`: When set to `true`, this will automatically refresh the resource in TXAdmin after a Git pull. When set to `false`, the AutoPull script itself can still restart if changes are detected.
- `txAdminEnsure`: When set to `true`, this will automatically ensure the resource in TXAdmin, meaning it will start the resource if it is stopped or restart it if it is started. When set to `false`, it ensures the AutoPull service remains running but does not interfere with resource states.
- When both of the options are disabled it will just pull on changes, allowing you to sync any directory when push events are sent on GitHub! Cool right?

> [!TIP]
> Always keep a backup of your resources and server files before enabling these options.

### PowerShell Script Explanation

The provided PowerShell script is designed to automate the refresh and ensure process in TXAdmin by interacting with your browser.

**How It Works:**
1. The script expects **only one Google Chrome window** to be open on the VPS.
2. The script will automatically switch focus to the Chrome window and unminimize it if necessary.
3. **You must ensure that the Console tab in TXAdmin is selected, and the text cursor is blinking in the input area where you can type commands.**
4. Once Chrome is focused, the script automatically types:
   - `refresh` to reload the resource.
   - `ensure nameofscript` to start the specified resource.

**Important Requirements:**
- Make sure Chrome is open before starting the script.
- Ensure the Console tab in TXAdmin is open, and manually click inside the input field once to activate the text cursor before running the script.
- If the text cursor is not blinking, the commands will not be typed correctly.

### Benefits of Using AutoPull

- **Remote Development:** You can push code changes from your local machine (e.g., using VS Code) without needing to work directly on the VPS.
- **Real-Time Updates:** AutoPull automatically reloads and ensures the resource in-game, saving you from having to manually type `refresh` and `ensure` every time a change is made.
- **Team Collaboration:** Multiple developers can work on the same server codebase simultaneously, making collaboration more efficient.
- **Version Control:** By using Git, you have access to version control, which provides:
  - **Visual diff changes** through GitHub Desktop to see exactly what has changed.
  - **Automatic backups** of your code history, preventing accidental data loss.

### 2. Initialize Git Repository

Navigate to your resource directory and initialize Git:

```bash
cd C:/path/to/resource
git init
```

### 3. Setup GitHub Repository

1. Create a new private GitHub repository.
2. Push your local repository:
   - Using GitHub Desktop:
     - Add existing repository.
     - Select your resource path.
     - Commit and push to the new repository.
   - Or using command line:
     ```bash
     git remote add origin your-repo-url
     git add .
     git commit -m "Initial commit"
     git push -u origin master
     ```

### 4. Configure Webhook

1. Go to your GitHub repository settings.
2. Navigate to Webhooks > Add webhook.
3. Enter the webhook URL from step 1.
4. Save the webhook.

## How It Works

- When changes are pushed to GitHub, a webhook notification is sent to your server.
- The server automatically pulls the latest changes.
- If configured, it will:
  - Refresh TXAdmin.
  - Ensure the specific resource.
- Works with any directory by toggling `txAdminRefresh` and `txAdminEnsure` options.

## Example URL

```
C:\TheATeam\AutoPull>node autopull.js
Server is running on port 8424

http://serverpublicip:8424/autopull/example-resource
```

**Note:** You might need to open ports on your VPS to allow external connections to your webhook endpoint.

## UPDATE: Added non VPS version

Checkout the `non-vps-version` folder for more information

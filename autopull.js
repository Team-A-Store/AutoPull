const express = require('express');
const config = require('./config.js');
const { exec, spawn } = require('child_process');
const fs = require('node:fs');
const app = express();
app.use(express.json());

const PSTXAdminAutomation = `
Add-Type @"
using System;
using System.Runtime.InteropServices;
public class Tricks {
    [DllImport("user32.dll")]
    public static extern bool SetForegroundWindow(IntPtr hWnd);

    [DllImport("user32.dll")]
    public static extern bool ShowWindow(IntPtr hWnd, int nCmdShow);
}
"@
$SW_RESTORE = 9
$focusProcess = Get-Process chrome | Where-Object { $_.MainWindowHandle -ne 0 } | Select-Object -First 1
if ($focusProcess) {
    $h = $focusProcess.MainWindowHandle
    [Tricks]::ShowWindow($h, $SW_RESTORE)
    [void] [Tricks]::SetForegroundWindow($h)
    {SHOULD_REFRESH}
    {SHOULD_ENSURE}
} else {
    Write-Host "No active Chrome process found with a visible window."
}
`;

const PSTXAdminAutomationRefresh = `
    Add-Type -AssemblyName System.Windows.Forms
    [System.Windows.Forms.SendKeys]::SendWait('refresh')
    [System.Windows.Forms.SendKeys]::SendWait('{ENTER}')
`;

const PSTXAdminAutomationEnsure = `
    [System.Windows.Forms.SendKeys]::SendWait('ensure {RESOURCE_NAME}')
    [System.Windows.Forms.SendKeys]::SendWait('{ENTER}')
`;

const PSTXAdminAutomationDelay = `
    Start-Sleep -Milliseconds 500
`;

// Webhook endpoints
let activePulls = {};
for (const resourceName in config.resources) {
    const resourceData = config.resources[resourceName];
    // User input is validated thanks to the route name
    app.post('/autopull/' + resourceName, async (req, res) => {
        // Verify that the request is from GitHub
        if (req.headers['x-github-event'] !== 'push') return res.status(400).send('Not a push event');
        res.send('Ok Github!');
        console.log('Webhook received for ' + resourceName);
        // Run the git pull command with cwd
        while (activePulls[resourceName]) {
            console.log('Waiting for the last pull to finish for ' + resourceName)
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        // Pull the new changes:
        activePulls[resourceName] = true;
        exec('git pull origin master', { cwd: resourceData.path }, (err, stdout, stderr) => {
            if (err) {
                console.error(`Error: ${err} for ${resourceName}`);
                return res.status(500).send('Failed to pull');
            }
            if (stdout) console.log(`Git Output: ${stdout} for ${resourceName}`);
            if (stderr) console.log(`Git Error Output: ${stderr} for ${resourceName}`);
            let finalScript = PSTXAdminAutomation;
            if (resourceData.txAdminRefresh && resourceData.txAdminEnsure) {
                finalScript = finalScript.replace('{SHOULD_REFRESH}', PSTXAdminAutomationRefresh + PSTXAdminAutomationDelay)
                finalScript = finalScript.replace('{SHOULD_ENSURE}', PSTXAdminAutomationEnsure.replace('{RESOURCE_NAME}', resourceName))
            } else {
                if (resourceData.txAdminRefresh) {
                    finalScript = finalScript.replace('{SHOULD_REFRESH}', PSTXAdminAutomationRefresh)
                } else {
                    finalScript = finalScript.replace('{SHOULD_REFRESH}', '')
                }
                if (resourceData.txAdminEnsure) {
                    finalScript = finalScript.replace('{SHOULD_ENSURE}', PSTXAdminAutomationEnsure.replace('{RESOURCE_NAME}', resourceName))
                } else {
                    finalScript = finalScript.replace('{SHOULD_ENSURE}', '')
                }
            }
            // Execute the sequence after the pull
            const psScriptPath = 'auto-reload-script.ps1';
            fs.writeFile(psScriptPath, finalScript, err => {
                if (err) {
                    console.error(err);
                } else {
                    const ps = spawn('powershell.exe', [
                        '-NoProfile',
                        '-ExecutionPolicy', 'Bypass',
                        '-Command', `Start-Process powershell -ArgumentList '-NoProfile -ExecutionPolicy Bypass -File "${psScriptPath}"' -WindowStyle Hidden`
                    ]);
                    ps.on('error', (err) => {
                        console.error(`Error starting PowerShell: ${err} for ${resourceName}`);
                        activePulls[resourceName] = false;
                    });
                    ps.on('exit', (code) => {
                        console.log(`PowerShell process exited with code ${code} for ${resourceName}`);
                        activePulls[resourceName] = false;
                    });
                    if (resourceData.txAdminRefresh && resourceData.txAdminEnsure) {
                        console.log("Executed TXAdmin Hot Reload for " + resourceName);
                    }
                }
            });
        });
    });
}

// Start the server
app.listen(config.port, () => {
    console.log(`AutoPull v2.0.1 server is running on port ${config.port}`);
});

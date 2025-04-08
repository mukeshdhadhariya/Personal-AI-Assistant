import { exec } from "child_process";


const closeWhatsapp = () => {
    return new Promise((resolve, reject) => {
        exec('taskkill /IM WhatsApp.exe /F', (err, stdout, stderr) => {
            if (err) {
                console.error("Error closing WhatsApp:", err.message);
                return resolve();
            }

            if (stderr) {
                console.warn("stderr (WhatsApp):", stderr);
            }

            resolve();
        });
    });
};

const closeBrowser = () => {
    return new Promise((resolve, reject) => {
        exec('taskkill /F /IM msedge.exe', (err, stdout, stderr) => {
            if (err) {
                console.error("Error closing browser:", err.message);
                return resolve(); // Continue flow even on error
            }

            if (stderr) {
                console.warn("stderr (browser):", stderr);
            }

            resolve();
        });
    });
};

const closeVsCode = () => {
    return new Promise((resolve, reject) => {
        exec('taskkill /F /IM Code.exe', (err, stdout, stderr) => {
            if (err) {
                console.error("Error closing VS Code:", err.message);
                return resolve(); // Continue even on error
            }

            if (stderr) {
                console.warn("stderr (VS Code):", stderr);
            }

            console.log("Closed VS Code.");
            resolve();
        });
    });
};

const shutdownProcess = async () => {
    try {

        await closeBrowser();
        await closeWhatsapp();
        await closeVsCode();

        exec('shutdown /s /t 30', (err, stdout, stderr) => {
            if (err) {
                console.error("Shutdown error:", err.message);
                return;
            }

            if (stderr) {
                console.warn("Shutdown stderr:", stderr);
            }

        });

    } catch (error) {
        console.error("Something went wrong in shutdownProcess:", error.message);
    }
};


export const closeapp = async (message) => {
    const lowerMessage = message.toLowerCase().trim();
  
    const match = lowerMessage.match(/ok neha[,.]?\s*close\s+([\w\s.]+)[.]?$/i);
  
    if (match) {
      const app = match[1].toLowerCase().trim().replace(/\.$/, '');
      console.log("App to close:", app);
  
      if (app === "whatsapp") {
        closeWhatsapp();
        return `Closed ${app}.`;
      }
      if(app=="microsoft"){
        closeBrowser();
        return `Closed ${app}.`;
      }
      if(app=="code"){
        closeVsCode();
        return `Closed ${app}.`;
      }
      if(app=="pc"){
        shutdownProcess();
        return `closed ${app}`;
      }
    }
  
    return null;
};
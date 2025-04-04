import { exec } from "child_process";


const closeWhatsapp = function () {
    exec('taskkill /IM WhatsApp.exe /F', (err, stdout, stderr) => {

        if (err) {
            console.error("Error:", err.message);
            return ;
        }

        if (stderr) {
            console.error("stderr:", stderr);
            return;
        }

        console.log("Closed WhatsApp");

    });
};

const closeBrowser=function(){

    exec('taskkill /F /IM msedge.exe', (err, stdout, stderr) => {

        if (err) {
            console.error("Error:", err.message);
            return ;
        }

        if (stderr) {
            console.error("stderr:", stderr);
            return;
        }

        console.log("Closed browser");

    });

}

const closeVsCode=function(){

    exec('taskkill /F /IM Code.exe', (err, stdout, stderr) => {

        if (err) {
            console.error("Error:", err.message);
            return ;
        }

        if (stderr) {
            console.error("stderr:", stderr);
            return;
        }

        console.log("Closed VS code");

    });

}


export const closeapp = async (message) => {
    const lowerMessage = message.toLowerCase().trim();
  
    const match = lowerMessage.match(/hi neha[,.]?\s*close\s+([\w\s.]+)[.]?$/i);
  
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
    }
  
    return null;
};
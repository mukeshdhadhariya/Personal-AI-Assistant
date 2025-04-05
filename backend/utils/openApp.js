import { exec } from "child_process";

const commandActions = {
  youtube: "https://www.youtube.com/",
  whatsapp: "https://web.whatsapp.com",
  chatgpt: "https://chatgpt.com/",
  akhil:"https://www.youtube.com/watch?v=-cmBp_4u_cc&list=RDhVCYwwFwGEE&index=27",
  leetcode:"https://leetcode.com/u/mukeshhdhadhariya/",
  google:"https://www.google.co.in/",
  codeforce:"https://codeforces.com/problemset",
  jawani:"https://www.youtube.com/watch?v=c4JD7rEtIj8",
  choli:"https://www.youtube.com/watch?v=kFareDJmq2o",
  jeena:"https://www.youtube.com/watch?v=zFdi834FiZ4",
  duniya:"https://www.youtube.com/watch?v=hVCYwwFwGEE&list=RDGMEMPipJmhsMq3GHGrfqf4WIqA&start_radio=1&rv=zFdi834FiZ4",
  apna:"https://www.youtube.com/watch?v=ElZfdU54Cp8&list=RDGMEMPipJmhsMq3GHGrfqf4WIqA&index=4",
};

export const openApp = (message) => {
  const lowerMessage = message.toLowerCase().trim();

  const triggerPhrases = [
    "ok neha open ","ok neha play ",
    "ok baby open ","baby, open ","ok baby play  ",
    
  ];

  let appName = null;
  for (let phrase of triggerPhrases) {
    if (lowerMessage.startsWith(phrase)) {
      appName = lowerMessage.replace(phrase, "").trim(); 
      break;
    }
  }
  

  if (!appName) {
    return null;
  }


  appName = appName.replace(/[^\w]/g, "").trim(); 

  if (!commandActions[appName]) {
    console.error(`❌ App "${appName}" not found in commandActions.`);
    return null;
  }

  let command;
  if (process.platform === "win32") {
    command = `start "" "${commandActions[appName]}"`; 
  } else if (process.platform === "darwin") {
    command = `open "${commandActions[appName]}"`; 
  } else {
    command = `xdg-open "${commandActions[appName]}"`;
  }

  exec(command)

  return `Opening ${appName}...`;
};

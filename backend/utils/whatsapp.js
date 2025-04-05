import { exec } from "child_process";


const sendmessage = (phoneNumber, message) => {
  const whatsappURL = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
  exec(`start ${whatsappURL}`);
};


const contacts = {
  neeraj: "918770223682", 
  mukesh: "919982650365",
  gaurav:"916378602627",
  papa:"916376465707",
  manish:"917877573425",
  adi:"918582045005",
  govind:"919799753797",
  ravi:"919128596942",
};

export const WhatsApp = (message) => {

  const lowerMessage = message.toLowerCase().trim();


  const match = lowerMessage.match(/ok neha send message to (\w+) that (.+)/);

  if (match) {

    const recipient = match[1]; // Extract recipient name
    const textMessage = match[2]; // Extract message

    console.log(`🔹 Sending message to ${recipient}: "${textMessage}"`);

    if (contacts[recipient]) {

      sendmessage(contacts[recipient], textMessage);

      return `Sending "${textMessage}" to ${recipient} on WhatsApp.`;

    } else {
      return `I don't have a number for ${recipient}.`;
    }
  }

  return null;
};

// import { exec } from "child_process";


// const sendmessage = (phoneNumber, message) => {
//   const whatsappURL = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
//   exec(`start "" "${whatsappURL}"`);
// };


// const contacts = {
//   neeraj: "918770223682", 
//   mukesh: "919982650365",
//   gaurav:"916378602627",
//   papa:"916376465707",
//   manish:"917877573425",
//   adi:"918582045005",
//   govind:"919799753797",
//   ravi:"919128596942",
// };

// export const WhatsApp = (message) => {

//   const lowerMessage = message.toLowerCase().trim();


//   const match = lowerMessage.match(/ok neha send message to (\w+) that (.+)/);

//   if (match) {

//     const recipient = match[1];
//     const textMessage = match[2];

//     console.log(`🔹 Sending message to ${recipient}: "${textMessage}"`);

//     if (contacts[recipient]) {

//       sendmessage(contacts[recipient], textMessage);

//       return `Sending "${textMessage}" to ${recipient} on WhatsApp.`;

//     } else {
//       return `I don't have a number for ${recipient}.`;
//     }
//   }

//   return null;
// };
import fetch from "node-fetch";

export const WhatsApp = async (message) => {
  
  message = message.toLowerCase().trim();

  const match = message.match(/ok neha send message to (\w+) that (.+)/);
  if (!match) return null;

  try {
    const response = await fetch("http://localhost:5001/send_message", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });

    console.log(response)

    const contentType = response.headers.get("content-type");

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Server Error: ${response.status} - ${errorText}`);
    }

    if (contentType && contentType.includes("application/json")) {
      const data = await response.json();
      return data.result;
    } else {
      const text = await response.text();
      throw new Error(`Expected JSON but got: ${text}`);
    }
  } catch (error) {
    console.error("Error in WhatsApp function:", error.message);
    throw error;
  }
};

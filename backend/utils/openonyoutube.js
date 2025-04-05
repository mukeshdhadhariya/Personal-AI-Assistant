import { exec } from "child_process";

export const Playsong = async (message) => {
  const lowerCaseMsg = message.toLowerCase();

  if (!lowerCaseMsg.startsWith("ok neha play my song")) return null;

  const songName = lowerCaseMsg.replace("ok neha play my song", "").trim();

  if (!songName) return "Please tell me which song to play.";

  const query = encodeURIComponent(songName);
  const youtubeURL = `https://www.youtube.com/results?search_query=${query}`;

  exec(`start ${youtubeURL}`, (err) => {
    if (err) {
      console.error("Failed to open browser:", err);
    }
  });

  return `Playing "${songName}" for you mukesh`;
};

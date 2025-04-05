import { useState, useEffect, useRef } from "react";
import { Send, Mic, MicOff } from "lucide-react";

export default function ChatApp() {
  const [messages, setMessages] = useState([
    { sender: "Neha", text: "neha and mukesh dhadhariya", audio: "" }
  ]);
  const [input, setInput] = useState("");
  const [audioSrc, setAudioSrc] = useState("");
  const [isListening, setIsListening] = useState(false);

  const recognitionRef = useRef(null);
  const isProcessingRef = useRef(false);
  const shouldResumeListeningAfterReply = useRef(false); // NEW FLAG

  useEffect(() => {
    initSpeechRecognition();
  }, []);

  const initSpeechRecognition = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Your browser doesn't support Speech Recognition.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = true;
    recognition.interimResults = false;

    recognition.onresult = (event) => {
      if (isProcessingRef.current) return;

      const rawTranscript =
        event.results[event.results.length - 1][0].transcript;
      const cleanedTranscript = rawTranscript
        .replace(/[.,!?]/g, "")
        .replace(/\s+/g, " ")
        .trim()
        .toLowerCase();

      if (cleanedTranscript === "stop neha") {
        stopListening();
        return;
      }

      isProcessingRef.current = true;
      sendMessage(cleanedTranscript);
    };

    recognition.onend = () => {
      if (isListening && !audioSrc) {
        recognition.start();
      }
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
    };

    recognitionRef.current = recognition;
  };

  const startListening = () => {
    if (!recognitionRef.current || isListening) return;
    isProcessingRef.current = false;
    recognitionRef.current.start();
    setIsListening(true);
  };

  const stopListening = () => {
    if (recognitionRef.current) recognitionRef.current.stop();
    setIsListening(false);
  };

  const toggleListening = () => {
    isListening ? stopListening() : startListening();
  };

  const sendMessage = async (message) => {
    if (!message.trim()) return;

    const newMessage = { sender: "You", text: message };
    setMessages((prev) => [...prev, newMessage]);
    setInput("");
    stopListening();

    shouldResumeListeningAfterReply.current = true; // <- important

    try {
      const response = await fetch("http://localhost:5000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });

      const data = await response.json();
      setMessages((prev) => [
        ...prev,
        { sender: "Neha", text: data.reply, audio: data.audio },
      ]);
      setAudioSrc(data.audio);
    } catch (error) {
      console.error("Error:", error);
      shouldResumeListeningAfterReply.current = false;
      isProcessingRef.current = false;
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") sendMessage(input);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white p-3 sm:p-6">
      <h1 className="text-lg sm:text-2xl font-bold text-center text-pink-400 drop-shadow-lg bg-black bg-opacity-60 p-2 rounded-md w-max mx-auto">
        💖 Neha 💖
      </h1>

      <div
        className="flex-1 overflow-y-auto p-2 sm:p-4 mt-2 bg-gray-800 rounded-xl shadow-lg mx-2 sm:mx-8"
        style={{
          backgroundImage: "url('https://wallpaperaccess.com/full/1850841.jpg')",
          backgroundSize: "400px",
          backgroundPosition: "top center",
          opacity: "0.8",
          backgroundRepeat: "no-repeat",
        }}
      >
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`p-2 sm:p-3 my-2 rounded-lg text-white shadow-lg ${
              msg.sender === "You"
                ? "bg-blue-500 self-end ml-auto"
                : "bg-pink-500 self-start"
            }`}
            style={{
              maxWidth: "85%",
              width: "fit-content",
              fontSize: "0.875rem",
              padding: "8px 12px",
              marginLeft: msg.sender === "You" ? "auto" : "5px",
              marginRight: msg.sender === "You" ? "5px" : "auto",
            }}
          >
            <strong>{msg.sender}: </strong> {msg.text}
            {msg.audio && (
              <audio
                controls
                autoPlay
                className="mt-2 w-full"
                volume={0.5}
                onLoadedMetadata={(e) => {
                  e.target.playbackRate = 1.5;
                }}
                onEnded={() => {
                  setAudioSrc("");
                  isProcessingRef.current = false;

                  if (shouldResumeListeningAfterReply.current) {
                    shouldResumeListeningAfterReply.current = false;
                    startListening(); // 💥 Resume listening
                  }
                }}
              >
                <source src={msg.audio} type="audio/mp3" />
              </audio>
            )}
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-2 sm:mt-3 p-2 sm:p-3 bg-gray-800 rounded-xl shadow-md mx-2 sm:mx-8">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Type or speak a message..."
          className="flex-1 p-2 sm:p-3 rounded-lg bg-gray-700 text-white border border-gray-500 focus:outline-none w-full sm:w-auto"
        />
        <button
          onClick={() => sendMessage(input)}
          className="p-2 sm:p-3 bg-pink-600 hover:bg-pink-700 rounded-lg shadow-md"
        >
          <Send size={20} />
        </button>
        <button
          onClick={toggleListening}
          className="p-2 sm:p-3 bg-green-500 hover:bg-green-600 rounded-lg shadow-md"
        >
          {isListening ? <MicOff size={20} /> : <Mic size={20} />}
        </button>
      </div>
    </div>
  );
}

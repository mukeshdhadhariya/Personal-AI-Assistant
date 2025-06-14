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

  const isListeningRef = useRef(isListening);
  const audioSrcRef = useRef(audioSrc);

  useEffect(() => {
    initSpeechRecognition();
  }, []);

  useEffect(() => {
    isListeningRef.current = isListening;
    audioSrcRef.current = audioSrc;
  }, [isListening, audioSrc]);

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
      if (isListeningRef.current && !audioSrcRef.current) {
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

  // return (
  //   <div className="flex flex-col h-screen bg-gray-900 text-white p-3 sm:p-6">
  //     <h1 className="text-lg sm:text-2xl font-bold text-center text-pink-400 drop-shadow-lg bg-black bg-opacity-60 p-2 rounded-md w-max mx-auto">
  //       💖 Neha 💖
  //     </h1>

  //     <div
  //       className="flex-1 overflow-y-auto p-2 sm:p-4 mt-2 bg-gray-800 rounded-xl shadow-lg mx-2 sm:mx-8"
  //       style={{
  //         backgroundImage: "url('https://wallpaperaccess.com/full/1850841.jpg')",
  //         backgroundSize: "400px",
  //         backgroundPosition: "top center",
  //         opacity: "0.8",
  //         backgroundRepeat: "no-repeat",
  //       }}
  //     >
  //       {messages.map((msg, index) => (
  //         <div
  //           key={index}
  //           className={`p-2 sm:p-3 my-2 rounded-lg text-white shadow-lg ${
  //             msg.sender === "You"
  //               ? "bg-blue-500 self-end ml-auto"
  //               : "bg-pink-500 self-start"
  //           }`}
  //           style={{
  //             maxWidth: "85%",
  //             width: "fit-content",
  //             fontSize: "0.875rem",
  //             padding: "8px 12px",
  //             marginLeft: msg.sender === "You" ? "auto" : "5px",
  //             marginRight: msg.sender === "You" ? "5px" : "auto",
  //           }}
  //         >
  //           <strong>{msg.sender}: </strong> {msg.text}
  //           {msg.audio && (
  //             <audio
  //               controls
  //               autoPlay
  //               className="mt-2 w-full"
  //               volume={0.5}
  //               onLoadedMetadata={(e) => {
  //                 e.target.playbackRate = 1.5;
  //               }}
  //               onEnded={() => {
  //                 setAudioSrc("");
  //                 isProcessingRef.current = false;

  //                 if (shouldResumeListeningAfterReply.current) {
  //                   shouldResumeListeningAfterReply.current = false;
  //                   startListening();
  //                 }
  //               }}
  //             >
  //               <source src={msg.audio} type="audio/mp3" />
  //             </audio>
  //           )}
  //         </div>
  //       ))}
  //     </div>

  //     <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-2 sm:mt-3 p-2 sm:p-3 bg-gray-800 rounded-xl shadow-md mx-2 sm:mx-8">
  //       <input
  //         value={input}
  //         onChange={(e) => setInput(e.target.value)}
  //         onKeyDown={handleKeyPress}
  //         placeholder="Type or speak a message..."
  //         className="flex-1 p-2 sm:p-3 rounded-lg bg-gray-700 text-white border border-gray-500 focus:outline-none w-full sm:w-auto"
  //       />
  //       <button
  //         onClick={() => sendMessage(input)}
  //         className="p-2 sm:p-3 bg-pink-600 hover:bg-pink-700 rounded-lg shadow-md"
  //       >
  //         <Send size={20} />
  //       </button>
  //       <button
  //         onClick={toggleListening}
  //         className="p-2 sm:p-3 bg-green-500 hover:bg-green-600 rounded-lg shadow-md"
  //       >
  //         {isListening ? <MicOff size={20} /> : <Mic size={20} />}
  //       </button>
  //     </div>
  //   </div>
  // );


  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-gray-800 to-gray-900 text-white p-4">
      <header className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-2 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            AI Assistant
          </h1>
        </div>
        <div className="flex space-x-1">
          <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-400 animate-pulse"></div>
          <div className="w-3 h-3 rounded-full bg-red-400 animate-pulse"></div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto mb-4 rounded-xl bg-gray-800 bg-opacity-50 backdrop-blur-sm border border-gray-700 p-4">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex flex-col my-3 max-w-[90%] ${
              msg.sender === "You" ? "items-end ml-auto" : "items-start"
            }`}
          >
            <div className="text-xs font-semibold mb-1 px-2 text-gray-400">
              {msg.sender}
            </div>
            <div
              className={`p-3 rounded-2xl shadow-lg ${
                msg.sender === "You"
                  ? "bg-gradient-to-r from-blue-600 to-indigo-700 rounded-br-none"
                  : "bg-gradient-to-r from-gray-700 to-gray-800 rounded-bl-none border border-gray-700"
              }`}
            >
              <div className="flex items-start">
                <div className="flex-1 min-w-0">
                  {msg.text}
                </div>
              </div>
              {msg.audio && (
                <audio
                  controls
                  autoPlay
                  className="mt-3 w-full rounded-lg"
                  volume={0.5}
                  onLoadedMetadata={(e) => {
                    e.target.playbackRate = 1.5;
                  }}
                  onEnded={() => {
                    setAudioSrc("");
                    isProcessingRef.current = false;
                    if (shouldResumeListeningAfterReply.current) {
                      shouldResumeListeningAfterReply.current = false;
                      startListening();
                    }
                  }}
                >
                  <source src={msg.audio} type="audio/mp3" />
                </audio>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 p-2 bg-gray-800 rounded-xl border border-gray-700">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Message AI assistant..."
          className="flex-1 p-3 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div className="flex space-x-2">
          <button
            onClick={toggleListening}
            className={`p-3 rounded-lg transition-all ${
              isListening 
                ? "bg-red-500 hover:bg-red-600 animate-pulse" 
                : "bg-gray-700 hover:bg-gray-600"
            }`}
          >
            {isListening ? <MicOff size={20} /> : <Mic size={20} />}
          </button>
          <button
            onClick={() => sendMessage(input)}
            className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );


}

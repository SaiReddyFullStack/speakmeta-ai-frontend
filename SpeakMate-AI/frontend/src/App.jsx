
import axios from "axios";
import { useState, useRef } from "react";
import "./App.css";

export default function App() {
  const [listening, setListening] = useState(false);
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(false);

  const recognitionRef = useRef(null);

  const API = import.meta.env.VITE_API_URL;

  const startListening = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech Recognition not supported in this browser");
      return;
    }

    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.continuous = false;

    recognition.onstart = () => setListening(true);

    recognition.onresult = async (event) => {
      const text = event.results[0][0].transcript;

      try {
        setLoading(true);

        const res = await axios.post(`${API}/api/chat`, { text });

        const aiReply = res.data.reply;
        setReply(aiReply);

        const speech = new SpeechSynthesisUtterance(aiReply);
        speech.lang = "en-US";

        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(speech);

      } catch (err) {
        console.error("API Error:", err);
        alert("Failed to get AI response");
      } finally {
        setLoading(false);
      }
    };

    recognition.onend = () => setListening(false);

    recognition.onerror = (err) => {
      console.error("Speech error:", err);
      setListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setListening(false);
  };

  return (
    <div className="container">
      <h1>🎤 SpeakMeta AI</h1>
      <p>Speak English → Get AI Response</p>

      {!listening ? (
        <button onClick={startListening}>Start Speaking</button>
      ) : (
        <button className="listening" onClick={stopListening}>
          Stop Listening
        </button>
      )}

      <h3>
        {loading ? "🤖 Thinking..." : listening ? "🎙️ Listening..." : "Idle"}
      </h3>

      <div className="card">
        <h2>AI Reply</h2>
        <p>{reply || "No response yet..."}</p>
      </div>

      <div className="footer">
        © 2026 SaiReddy. All Rights Reserved !
      </div>
    </div>
  );
}
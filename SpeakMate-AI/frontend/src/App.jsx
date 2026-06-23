
import axios from "axios";
import { useState, useRef } from "react";
import "./App.css";

function App() {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(false);

  const recognitionRef = useRef(null);

  const startListening = () => {
    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech Recognition not supported");
      return;
    }

    setTranscript("");
    setReply("");

    const recognition = new SpeechRecognition();

    recognition.lang = "en-US";
    recognition.continuous = true;
    recognition.interimResults = true;

    recognitionRef.current = recognition;

    recognition.onstart = () => setListening(true);

    recognition.onresult = (event) => {
      let text = "";

      for (let i = 0; i < event.results.length; i++) {
        text += event.results[i][0].transcript;
      }

      setTranscript(text);
    };

    recognition.onend = () => setListening(false);

    recognition.start();
  };

  const stopListening = async () => {
    recognitionRef.current?.stop();

    if (!transcript.trim()) {
      alert("No speech detected");
      return;
    }

    try {
      setLoading(true);

      const res = await axios.post(
        "http://localhost:5000/api/chat",
        { text: transcript }
      );

      const aiReply = res.data.reply;

      setReply(aiReply);

      const speech = new SpeechSynthesisUtterance(aiReply);
      speech.lang = "en-US";

      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(speech);
    } catch (error) {
      console.error(error);
      alert("Failed to get AI response");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>🎤 SpeakMeta AI</h1>

      <p>Speak in English and get AI feedback</p>

      {!listening ? (
        <button onClick={startListening}>
          🎤 Start Speaking
        </button>
      ) : (
        <button
          onClick={stopListening}
          className="listening"
        >
          ⏹ Stop Speaking
        </button>
      )}

      {listening && <h3>🎙️ Listening...</h3>}
      {loading && <h3>🤖 Analyzing...</h3>}

      <div className="card">
        <h2>Your Speech</h2>
        <p>{transcript}</p>
      </div>

      <div className="card">
        <h2>AI Feedback</h2>
        <p>{reply}</p>
      </div>

      <footer className="footer">
        © 2026 Sai Reddy | Built with React & AI
      </footer>
    </div>
  );
}

export default App;
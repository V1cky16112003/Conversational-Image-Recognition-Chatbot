import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Upload, Mic, Play, Pause, StopCircle, Globe } from "lucide-react";
import Card from "./components/ui/Card";
import Input from "./components/ui/Input";
import Button from "./components/ui/Button";

const Chatbot = () => {
  const [message, setMessage] = useState("");
  const [response, setResponse] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [listening, setListening] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [language, setLanguage] = useState("en"); // Default language: English
  const audioRef = useRef(null);

  // ✅ Renamed from setLanguage to avoid conflict
  const updateLanguage = async (selectedLanguage) => {
    try {
      const res = await fetch("http://127.0.0.1:8000/set_language/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language: selectedLanguage }),
      });

      const data = await res.json();
      console.log("Language set response:", data);
    } catch (error) {
      console.error("Error setting language:", error);
    }
  };

  const sendMessage = async () => {
    if (!message.trim()) return alert("Please enter a message!");

    try {
      const res = await fetch("http://127.0.0.1:8000/chat/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: message.trim(), language }),
      });

      if (!res.ok) throw new Error("API error");
      const data = await res.json();
      setResponse(data.response || "No response received.");
    } catch (error) {
      console.error("Error:", error);
      setResponse("Error processing your request.");
    }
  };

  const uploadImage = async () => {
    if (!image) return alert("Please select an image!");
    const formData = new FormData();
    formData.append("image", image);
    formData.append("language", language);

    try {
      const res = await fetch("http://127.0.0.1:8000/process_image/", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Image processing failed.");
      const data = await res.json();
      setResponse(data.image_analysis || "No analysis received.");
      setMessage(data.image_analysis || "");
    } catch (error) {
      console.error("Error processing image:", error);
      setResponse("Error analyzing image.");
    }
  };

  const startSpeechRecognition = () => {
    if (!("webkitSpeechRecognition" in window)) {
      alert("Speech recognition is not supported in your browser. Try Chrome.");
      return;
    }

    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = language;
    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);
    recognition.onresult = (event) => setMessage(event.results[0][0].transcript);
    recognition.start();
  };

  const playTTS = async () => {
    try {
      if (audioRef.current && isPaused) {
        audioRef.current.play();
        setIsPaused(false);
        setIsPlaying(true);
        return;
      }

      const res = await fetch("http://127.0.0.1:8000/tts/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, language }), // ✅ Added message to TTS request
      });

      if (!res.ok) throw new Error("TTS API error");
      const audioBlob = await res.blob();

      if (audioBlob.size === 0) {
        throw new Error("Received empty TTS response.");
      }

      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      setIsPlaying(true);
      setIsPaused(false);
      audio.play();

      audio.onended = () => setIsPlaying(false);
    } catch (error) {
      console.error("Error playing TTS:", error);
      alert("Failed to generate speech. Please try again.");
      setResponse("Error playing TTS.");
    }
  };

  const pauseTTS = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPaused(true);
      setIsPlaying(false);
    }
  };

  const stopTTS = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPaused(false);
      setIsPlaying(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6 flex flex-col items-center">
      <motion.h1 className="text-2xl font-bold mb-4" animate={{ opacity: 1 }} initial={{ opacity: 0 }}>
        Conversational Image Recognition Chatbot
      </motion.h1>

      {/* Language Selection */}
      <Card className="w-full max-w-lg">
        <h2 className="text-lg font-semibold mb-2 flex items-center">
          <Globe className="mr-2" /> Select Language
        </h2>
        <select
          value={language}
          onChange={(e) => {
            const selectedLanguage = e.target.value;
            setLanguage(selectedLanguage);
            updateLanguage(selectedLanguage); // ✅ Call the correct function
            alert(`Language set to ${e.target.options[e.target.selectedIndex].text}`);
          }}
          className="bg-gray-800 text-white p-2 rounded-md w-full"
        >
          <option value="en">English</option>
          <option value="hi">Hindi</option>
          <option value="ta">Tamil</option>
          <option value="te">Telugu</option>
        </select>
      </Card>

      {/* Chat Input */}
      <Card className="w-full max-w-lg mt-4">
        <h2 className="text-lg font-semibold mb-2">Chat</h2>
        <Input value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Type a message..." />
        <div className="flex gap-2 mt-2">
          <Button className="bg-blue-500" onClick={sendMessage}>Send</Button>
          <Button className="bg-red-500" onClick={startSpeechRecognition}>
            <Mic className="inline-block mr-1" /> {listening ? "Listening..." : "Speak"}
          </Button>
        </div>
        {response && (
          <div className="mt-2 text-gray-300">
            <p>{response}</p>
            <div className="flex gap-2 mt-2">
              <Button className="bg-purple-500" onClick={playTTS}>
                <Play className="mr-2" /> {isPaused ? "Resume" : "Play"}
              </Button>
              <Button className="bg-yellow-500" onClick={pauseTTS} disabled={!isPlaying}>
                <Pause className="mr-2" /> Pause
              </Button>
              <Button className="bg-gray-500" onClick={stopTTS} disabled={!isPlaying && !isPaused}>
                <StopCircle className="mr-2" /> Stop
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Image Upload */}
      <Card className="w-full max-w-lg mt-4">
        <h2 className="text-lg font-semibold mb-2">Image Upload</h2>
        {imagePreview && <img src={imagePreview} alt="Preview" className="w-full rounded-md mb-2" />}
        <input type="file" className="mb-2" onChange={(e) => {
          setImage(e.target.files[0]);
          setImagePreview(URL.createObjectURL(e.target.files[0]));
        }} />
        <Button className="bg-green-500" onClick={uploadImage}>
          <Upload className="mr-2" /> Upload
        </Button>
      </Card>
    </div>
  );
};

export default Chatbot;

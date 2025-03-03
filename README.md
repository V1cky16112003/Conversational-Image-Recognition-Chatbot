# Conversational Image Recognition Chatbot  

## 📌 Overview  
The **Conversational Image Recognition Chatbot** is an AI-powered chatbot that can **recognize images, extract text (OCR), and engage in interactive conversations** with users. It integrates **Google Gemini API** for image recognition and contextual conversation, **Azure Speech Services** for speech-to-text (STT) and text-to-speech (TTS), and **multilingual support** in **English, Tamil, Hindi, and Telugu**.  

## 🚀 Features  
✅ **Image Recognition** – Identifies objects, scenes, and content in images using **Gemini 2.0 Flash**.  
✅ **OCR (Text Extraction)** – Extracts text from images using **Azure Computer Vision API** or **Google Vision API**.  
✅ **Conversational AI** – Uses **Google Gemini API** for natural language understanding and responses.  
✅ **Speech-to-Text (STT) & Text-to-Speech (TTS)** – Enables voice-based interaction using **Azure Speech Services**.  
✅ **Multilingual Support** – Works in **English, Tamil, Hindi, and Telugu**.  
✅ **Web-Based UI** – Built using **FastAPI/Flask (backend)** and **React.js (frontend)**.  

## 🏗️ Tech Stack  
### **Backend**  
- **FastAPI/Flask** – API development  
- **Google Gemini API** – Image recognition and conversational AI  
- **Azure Computer Vision API / Google Vision API** – OCR (text extraction from images)  
- **Azure Speech Services** – STT (speech-to-text) and TTS (text-to-speech)   

### **Frontend**  
- **React.js** – User interface  
- **Tailwind CSS** – Styling  
- **JavaScript** – Client-side logic  

### **Database**  
- No database (stateless chatbot, no user history stored)  

## 📸 Screenshots  
(Add images of UI and chatbot interaction here)  

## Set Up API Keys
**Create a .env file in the project root and add your API keys:**
```
GEMINI_API_KEY=your_gemini_api_key
AZURE_SPEECH_KEY=your_azure_speech_key
AZURE_COMPUTER_VISION_KEY=your_azure_vision_key
```

## Run Backend Server
```
uvicorn app:app --host 0.0.0.0 --port 8000
```
## install Frontend Dependencies
```
cd my-app
npm install
```

##  Run Frontend
```
npm run dev
```
  

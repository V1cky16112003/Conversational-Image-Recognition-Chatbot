from fastapi import FastAPI, UploadFile, File, HTTPException, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel
import google.generativeai as genai
import azure.cognitiveservices.speech as speechsdk
import os
import io
from dotenv import load_dotenv
from PIL import Image
from deep_translator import GoogleTranslator

# Load environment variables
load_dotenv()

# Initialize FastAPI
app = FastAPI()

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # You can specify exact domains instead of "*"
    allow_credentials=True,
    allow_methods=["*"],  # Allows all HTTP methods
    allow_headers=["*"],  # Allows all headers
)

# API Keys
GENAI_KEY = os.getenv("GENAI_KEY")
AZURE_SPEECH_KEY = os.getenv("AZURE_SPEECH_KEY")
AZURE_SPEECH_REGION = os.getenv("AZURE_SPEECH_REGION")

# Configure Gemini AI
if not GENAI_KEY:
    raise ValueError("Missing Google Gemini API Key")
genai.configure(api_key=GENAI_KEY)

# Store conversation context and language preference
conversation_history = []
user_language = "en"  # Default language is English
translator = GoogleTranslator(source="auto", target=user_language)

# API to Set Preferred Language
class LanguageRequest(BaseModel):
    language: str

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_text()
            await websocket.send_text(f"Received: {data}")
    except Exception as e:
        print("WebSocket Error:", e)

@app.post("/set_language/")
async def set_language(request: LanguageRequest):
    global user_language, translator
    user_language = request.language.lower()
    
    print(f"🔵 Received Language Update Request: {request.language}")  # Debug log
    print(f"🔵 Updated Global user_language: {user_language}")  # Debug log

    try:
        translator = GoogleTranslator(source="auto", target=user_language)  # Update translator
        test_translation = translator.translate("Hello, world!")  # Test translation
        print(f"✅ Translator updated. Test Output: {test_translation}")  # Debug log

        return {"message": f"Language set to {user_language}", "test_translation": test_translation}
    except Exception as e:
        print(f"⚠️ Translation Setup Error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to set language.")

# Image Processing & Description API
@app.post("/process_image/")
async def process_image(image: UploadFile = File(...)):
    try:
        global user_language, translator
        image_data = await image.read()
        img = Image.open(io.BytesIO(image_data))

        model = genai.GenerativeModel("gemini-2.0-flash")
        response = model.generate_content(["Describe this image in detail:", img])

        global conversation_history
        conversation_history = [response.text]  # Reset conversation history

        # ✅ Use the global translator object for translation
        translated_text = translator.translate(response.text)

        return {
            "image_analysis": translated_text,
            "original_analysis": response.text,
            "language": user_language
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Text-Based Chat with Gemini
class ChatRequest(BaseModel):
    message: str

@app.post("/chat/")
async def chat_with_gemini(chat_request: ChatRequest):
    try:
        global user_language, conversation_history, translator
        model = genai.GenerativeModel("gemini-2.0-flash")
        conversation_history.append(chat_request.message)

        response = model.generate_content(conversation_history)
        conversation_history.append(response.text)

        # ✅ Use the global translator object
        translated_text = translator.translate(response.text)

        return {"response": translated_text, "original_response": response.text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Speech-to-Text (STT) with Multilingual Support
@app.post("/speech_to_text/")
async def speech_to_text():
    try:
        global user_language
        speech_config = speechsdk.SpeechConfig(subscription=AZURE_SPEECH_KEY, region=AZURE_SPEECH_REGION)
        speech_recognizer = speechsdk.SpeechRecognizer(speech_config=speech_config, language=user_language)

        print("Speak now...")
        result = speech_recognizer.recognize_once()

        if result.reason == speechsdk.ResultReason.RecognizedSpeech:
            return {"text": result.text}
        else:
            return {"error": "Could not recognize speech."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Text-to-Speech (TTS) with Multilingual Support
@app.post("/tts/")
async def text_to_speech():
    try:
        global conversation_history, user_language, translator
        if not conversation_history:
            raise HTTPException(status_code=400, detail="No response available to convert to speech.")

        text = conversation_history[-1]
        translated_text = translator.translate(text)

        print(f"Generating TTS for: {translated_text}")

        speech_config = speechsdk.SpeechConfig(subscription=AZURE_SPEECH_KEY, region=AZURE_SPEECH_REGION)
        audio_filename = "response_speech.mp3"
        audio_config = speechsdk.audio.AudioOutputConfig(filename=audio_filename)

        azure_language_map = {
            "en": "en-US-JennyNeural", "fr": "fr-FR-DeniseNeural",
            "es": "es-ES-ElviraNeural", "hi": "hi-IN-MadhurNeural",
            "ta": "ta-IN-ValluvarNeural", "te": "te-IN-MohanNeural"
        }
        selected_voice = azure_language_map.get(user_language, "en-US-JennyNeural")
        speech_config.speech_synthesis_voice_name = selected_voice
        print(f"Using voice: {selected_voice}")

        synthesizer = speechsdk.SpeechSynthesizer(speech_config=speech_config, audio_config=audio_config)
        result = synthesizer.speak_text_async(translated_text).get()

        if result.reason != speechsdk.ResultReason.SynthesizingAudioCompleted:
            raise HTTPException(status_code=500, detail="Text-to-Speech conversion failed.")

        print("TTS successfully generated.")
        return FileResponse(audio_filename, media_type="audio/mpeg", filename="speech.mp3")

    except Exception as e:
        print("TTS Generation Error:", str(e))
        raise HTTPException(status_code=500, detail=str(e))

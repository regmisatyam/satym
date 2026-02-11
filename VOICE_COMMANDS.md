# Voice Command Feature

## Overview
The portfolio chatbot now supports voice commands, allowing users to interact with the AI assistant using their voice instead of typing.

## Features

### 🎤 Voice Input
- Click the microphone button to start voice recognition
- Speak naturally in English
- The transcribed text appears in the input field
- Voice commands are automatically sent to the AI assistant

### 🎨 Visual Feedback
- Microphone button pulses with red color when listening
- "Listening... Speak now" indicator appears above the input
- Button icon changes from microphone to microphone-off when active
- Smooth animations for all state transitions

### 🔧 Technical Implementation

#### Browser Support
- Uses Web Speech API (SpeechRecognition)
- Supported browsers:
  - Chrome/Edge (desktop & mobile)
  - Safari (desktop & mobile)
  - Opera
  - Not supported in Firefox (currently)

#### Key Features
- **Language**: English (en-US)
- **Auto-submit**: Voice commands are automatically sent after recognition
- **Continuous**: Single-phrase recognition (user clicks to speak each time)
- **Error Handling**: Graceful handling of microphone permissions and errors
- **Fallback**: Microphone button only appears if browser supports voice recognition

### 📝 Usage Examples

Users can say commands like:
- "Show me the projects"
- "Tell me about Satyam"
- "What are his skills?"
- "Go to the contact section"
- "What technologies does he know?"

### 🔒 Permissions
The browser will request microphone access on first use. Users must allow microphone permissions for the feature to work.

### ⚙️ Implementation Details

#### Components Modified
- `src/components/Chatbot.tsx` - Added voice recognition UI and logic
- `src/app/api/chat/route.ts` - Updated system context to mention voice support

#### Key Code Features
1. **State Management**
   - `isListening` - tracks if voice recognition is active
   - `isVoiceSupported` - checks browser compatibility
   - `recognitionRef` - stores the SpeechRecognition instance

2. **Voice Recognition Setup**
   - Initializes on component mount
   - Configures language and recognition parameters
   - Handles results, errors, and cleanup

3. **User Experience**
   - Visual pulsing animation when listening
   - Automatic submission after recognition
   - Smooth transitions between states
   - Error messages for permission issues

### 🎯 Future Enhancements
Potential improvements for future versions:
- Multi-language support
- Continuous listening mode
- Voice feedback (text-to-speech responses)
- Custom wake words
- Voice command shortcuts
- Offline voice recognition

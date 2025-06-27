import React, { useState, useEffect } from 'react';
import './VoiceRecorder.css';

const VoiceRecorder = ({ onTranscript }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    // 음성인식 API 확인 및 초기화
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      
      recognitionInstance.lang = 'ko-KR';
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      
      recognitionInstance.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        onTranscript(transcript);
        setIsRecording(false);
      };
      
      recognitionInstance.onerror = (event) => {
        console.error('음성인식 오류:', event.error);
        setError('음성인식 중 오류가 발생했습니다. 다시 시도해주세요.');
        setIsRecording(false);
      };
      
      recognitionInstance.onend = () => {
        setIsRecording(false);
      };
      
      setRecognition(recognitionInstance);
    } else {
      setError('이 브라우저는 음성인식을 지원하지 않습니다.');
    }
  }, [onTranscript]);

  const toggleRecording = () => {
    if (!recognition) return;
    
    if (isRecording) {
      recognition.stop();
    } else {
      setError('');
      recognition.start();
      setIsRecording(true);
    }
  };

  return (
    <div className="voice-recorder">
      <button 
        className={`record-button ${isRecording ? 'recording' : ''}`}
        onClick={toggleRecording}
        disabled={!recognition}
      >
        <span className="mic-icon">🎤</span>
        <span className="button-text">
          {isRecording ? '듣고 있습니다...' : '증상 말하기'}
        </span>
      </button>
      
      {error && (
        <div className="voice-error">
          <p>{error}</p>
        </div>
      )}
      
      <div className="instructions">
        <p>버튼을 누르고 아픈 곳이나 증상을 말씀해주세요.</p>
        <p>예: "머리가 아파요", "배가 아프고 속이 쓰려요"</p>
      </div>
    </div>
  );
};

export default VoiceRecorder;
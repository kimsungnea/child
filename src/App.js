import React, { useState } from 'react';
import './App.css';
import VoiceRecorder from './components/VoiceRecorder';
import HospitalList from './components/HospitalList';
import KakaoMap from './components/KakaoMap';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

function App() {
  const [symptom, setSymptom] = useState('');
  const [department, setDepartment] = useState('');
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [userLocation, setUserLocation] = useState({ lat: 37.5665, lng: 126.9780 });

  const analyzeSymptom = async (symptomText) => {
    setLoading(true);
    setError('');
    setSymptom(symptomText);
    
    try {
      // 1. GPT로 증상 분석
      const analyzeResponse = await axios.post(`${API_BASE_URL}/analyze-symptom`, {
        symptom: symptomText
      });
      
      const recommendedDepartment = analyzeResponse.data.department;
      setDepartment(recommendedDepartment);
      
      // 2. 사용자 위치 가져오기
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            setUserLocation({ lat, lng });
            await searchHospitals(recommendedDepartment, lat, lng);
          },
          async (error) => {
            console.error('위치 정보 오류:', error);
            // 기본 위치(서울시청)로 검색
            await searchHospitals(recommendedDepartment, userLocation.lat, userLocation.lng);
          }
        );
      } else {
        await searchHospitals(recommendedDepartment, userLocation.lat, userLocation.lng);
      }
    } catch (err) {
      console.error('분석 오류:', err);
      setError('증상 분석 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  const searchHospitals = async (dept, lat, lng) => {
    try {
      const searchResponse = await axios.get(`${API_BASE_URL}/search-hospitals`, {
        params: {
          department: dept,
          lat: lat,
          lng: lng
        }
      });
      
      setHospitals(searchResponse.data);
    } catch (err) {
      console.error('병원 검색 오류:', err);
      setError('병원 검색 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>🏥 어르신 병원 찾기</h1>
      </header>
      
      <main className="App-main">
        <VoiceRecorder onTranscript={analyzeSymptom} />
        
        {loading && (
          <div className="loading">
            <p>분석 중입니다...</p>
          </div>
        )}
        
        {error && (
          <div className="error-message">
            <p>{error}</p>
          </div>
        )}
        
        {symptom && !loading && (
          <div className="result-section">
            <div className="symptom-display">
              <h3>증상</h3>
              <p>{symptom}</p>
            </div>
            
            {department && (
              <div className="department-display">
                <h3>추천 진료과</h3>
                <p className="department-name">{department}</p>
              </div>
            )}
          </div>
        )}
        
        {hospitals.length > 0 && (
          <>
            <HospitalList hospitals={hospitals} />
            <KakaoMap 
              hospitals={hospitals} 
              userLocation={userLocation}
            />
          </>
        )}
      </main>
    </div>
  );
}

export default App;
import React, { useEffect, useRef } from 'react';
import './KakaoMap.css';

const KakaoMap = ({ hospitals, userLocation }) => {
  const mapContainer = useRef(null);
  const mapInstance = useRef(null);

  useEffect(() => {
    if (!mapContainer.current || hospitals.length === 0) return;

    const { kakao } = window;
    
    const mapOption = {
      center: new kakao.maps.LatLng(userLocation.lat, userLocation.lng),
      level: 5
    };

    const map = new kakao.maps.Map(mapContainer.current, mapOption);
    mapInstance.current = map;

    // 현재 위치 마커
    const userMarker = new kakao.maps.Marker({
      position: new kakao.maps.LatLng(userLocation.lat, userLocation.lng),
      map: map
    });

    const userInfowindow = new kakao.maps.InfoWindow({
      content: '<div style="padding:5px;font-size:12px;font-weight:bold;">현재 위치</div>'
    });
    userInfowindow.open(map, userMarker);

    // 병원 마커들
    hospitals.forEach((hospital, index) => {
      const markerPosition = new kakao.maps.LatLng(hospital.y, hospital.x);
      
      const marker = new kakao.maps.Marker({
        position: markerPosition,
        map: map
      });

      const infowindow = new kakao.maps.InfoWindow({
        content: `
          <div style="padding:8px;min-width:200px;">
            <strong>${index + 1}. ${hospital.placeName}</strong>
            <br/>
            <small>${hospital.addressName}</small>
          </div>
        `
      });

      kakao.maps.event.addListener(marker, 'click', function() {
        infowindow.open(map, marker);
      });

      // 첫 번째 병원은 기본으로 정보창 열기
      if (index === 0) {
        infowindow.open(map, marker);
      }
    });

    // 지도 범위 재설정
    const bounds = new kakao.maps.LatLngBounds();
    bounds.extend(new kakao.maps.LatLng(userLocation.lat, userLocation.lng));
    
    hospitals.forEach(hospital => {
      bounds.extend(new kakao.maps.LatLng(hospital.y, hospital.x));
    });
    
    map.setBounds(bounds);

  }, [hospitals, userLocation]);

  return (
    <div className="map-container">
      <h2>📍 병원 위치</h2>
      <div ref={mapContainer} className="kakao-map"></div>
    </div>
  );
};

export default KakaoMap;
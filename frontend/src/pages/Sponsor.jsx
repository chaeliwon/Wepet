import React from "react";
import { useNavigate } from "react-router-dom";
import "../css/Sponsor.css";
import freedomImage from "../assets/동물자유연대.png"; // 이미지 파일 import

const Sponsor = () => {
  const nav = useNavigate();

  const handleExternalLink = () => {
    window.location.href = "https://www.animals.or.kr/support/intro?utm_source=google&utm_medium=sa&utm_campaign=pc&utm_content=%EB%B8%8C%EB%9E%9C%EB%93%9C&utm_term=%EB%8F%99%EB%AC%BC%EC%9E%90%EC%9C%A0%EC%97%B0%EB%8C%80%20%ED%9B%84%EC%9B%90&gad_source=1&gclid=Cj0KCQjwvpy5BhDTARIsAHSilyk2I0SUlsuZxH0s0d-Nbo2oq77QbH4EuEdq_-dynhSXP_A2hCLaOToaAvJ4EALw_wcB";
  };

  return (
    <div className="sponsorPageBG">
      <div className="sponsorCard">
        <div className="sponsorCardBox">
          <div className="sponsorImgWrapper">
            <img src={freedomImage} alt="동물자유연대" className="sponsorImg" />
          </div>
          <div className="sponsorTxt">
            <span className="sponsorName">동물자유연대</span>
            <p>
              동물자유연대는 한국의 동물보호 및 동물권 단체로, 2000년에 시작된 자원봉사자
              모임에서 출발하여 2001년에 설립되었습니다. 이 단체는 인간과 동물 간의 생태적
              및 윤리적 조화를 목표로 하며, 인간에 의해 학대당하거나 생명의 존엄성을
              잃어가는 동물들의 구호를 위해 활동하고 있습니다.
            </p>
          </div>
        </div>
        <button className="sponsorButton" onClick={handleExternalLink}>
          후원하러 가기
        </button>
      </div>
    </div>
  );
};

export default Sponsor;

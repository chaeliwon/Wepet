import React from "react";
import "../css/Sponsor.css";
import 동물자유연대 from "../assets/동물자유연대.png"; 
import 동물권행동카라 from "../assets/동물권행동카라.png"; 
import 동물보호단체라이프 from "../assets/동물보호단체라이프.jpg"; 
import 동물복지문제연구소어웨이 from "../assets/동물복지문제연구소어웨이.png"; 

const Sponsor = () => {

  const handleExternalLink1 = () => {
    window.open("https://www.animals.or.kr/support/intro?utm_source=google&utm_medium=sa&utm_campaign=pc&utm_content=%EB%B8%8C%EB%9E%9C%EB%93%9C&utm_term=%EB%8F%99%EB%AC%BC%EC%9E%90%EC%9C%A0%EC%97%B0%EB%8C%80%20%ED%9B%84%EC%9B%90&gad_source=1&gclid=Cj0KCQjwvpy5BhDTARIsAHSilyk2I0SUlsuZxH0s0d-Nbo2oq77QbH4EuEdq_-dynhSXP_A2hCLaOToaAvJ4EALw_wcB", "_blank");
  };

  const handleExternalLink2 = () => {
    window.open("https://www.ekara.org/support/introduce", "_blank");
  };

  const handleExternalLink3 = () => {
    window.open("https://secure.donus.org/savelife/pay/step1", "_blank");
  };

  const handleExternalLink4 = () => {
    window.open("https://aware.kr/bbs/board.php?bo_table=B08", "_blank");
  };

  return (
    <div className="sponsorPageBG">

      <div className="sponsorCard1">
        <div className="sponsorCardBox1">
            <div className="sponsorImgWrapper1">
                <img src={동물자유연대} alt="동물자유연대" className="sponsorImg1" />
            </div>
            <div className="sponsorHeader1">
                <span className="sponsorName1">동물자유연대</span>
                <button className="sponsorButton1" onClick={handleExternalLink1}>
                    후원하러 가기
                </button>
            </div>
            <div className="sponsorTxt1">
                <p>
                &nbsp;동물자유연대는 한국의 동물보호 및 동물권 단체로, 2000년에 시작된 자원봉사자 모임에서 출발하여 2001년에 설립되었습니다. 이 단체는 인간과 동물 간의 생태적 및 윤리적 조화를 목표로 하며, 인간에 의해 학대당하거나 생명의 존엄성을 잃어가는 동물들의 구호를 위해 활동하고 있습니다.
                </p>
            </div>
        </div>
    </div>

      <div className="sponsorCard2">
        <div className="sponsorCardBox2">
          <div className="sponsorImgWrapper2">
            <img src={동물권행동카라} alt="동물권행동카라" className="sponsorImg2" />
          </div>
          <div className="sponsorHeader2">
            <button className="sponsorButton2" onClick={handleExternalLink2}>
                후원하러 가기
            </button>
            <span className="sponsorName2">동물권행동 카라</span>
          </div>

          <div className="sponsorTxt2">
            <p> 
            &nbsp;동물권행동 카라는 대한민국에서 활동하는 주요 동물보호 및 동물권 단체입니다. 이 단체는 유기동물 지원과 동물학대 예방을 주요 활동으로 하며, 주로 개, 고양이 등 반려포유동물의 보호에 중점을 두고 있습니다. 동물권행동 카라는 시민들의 후원을 통해 운영되며, 투명하고 정직한 활동을 원칙으로 하고 있습니다.
            </p>
            </div>
        </div>
    </div>

        <div className="sponsorCard3">
        <div className="sponsorCardBox3">
            <div className="sponsorImgWrapper3">
                <img src={동물보호단체라이프} alt="동물보호단체라이프" className="sponsorImg3" />
            </div>
            <div className="sponsorHeader3">
                <span className="sponsorName1">동물보호단체 라이프</span>
                <button className="sponsorButton1" onClick={handleExternalLink3}>
                    후원하러 가기
                </button>
            </div>
            <div className="sponsorTxt1">
                <p>
                &nbsp;동물보호단체 라이프는 전북 장수군을 중심으로 활동하는 단체입니다. 이 단체는 동물들의 보호와 돌봄을 주요 활동으로 하며, 직접적인 길거리 구조뿐만 아니라 사회적 관심과 참여를 촉구하는 활동도 진행합니다. 라이프는 다양한 사회 매체 플랫폼을 통해 활동 내용을 공유하고, 후원을 받고 있습니다. 부산을 포함한 다양한 지역에서 활동하며, 동물 보호와 관련된 다양한 정보와 인식 증진을 목표로 하고 있습니다.
                </p>
            </div>
        </div>
    </div>

    <div className="sponsorCard4">
        <div className="sponsorCardBox4">
          <div className="sponsorImgWrapper4">
            <img src={동물복지문제연구소어웨이} alt="동물복지문제연구소어웨이" className="sponsorImg2" />
          </div>
          <div className="sponsorHeader4">
            <button className="sponsorButton4" onClick={handleExternalLink4}>
                후원하러 가기
            </button>
            <span className="sponsorName4">동물복지문제연구소 어웨이</span>
          </div>

          <div className="sponsorTxt4">
            <p> 
            &nbsp;동물복지문제연구소 어웨어는 동물의 사회적 지위와 복지 기준을 높이기 위해 활동하는 비영리 단체입니다. 이 조직은 연구 및 교육을 통해 동물 보호와 관련된 정책 개선을 목표로 하고 있습니다. 동물의 복지 증진을 위한 다양한 활동과 보고서를 발표하여 사회적 인식을 높이고 있습니다.
            </p>
            </div>
        </div>
    </div>


      </div>
  );
};

export default Sponsor;

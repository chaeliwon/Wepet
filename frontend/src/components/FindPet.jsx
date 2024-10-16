import React from "react";
import "./css/findPetPage.css";
import BackButton from "./BackButton";

const FindPet = () => {
  const iconStyle = {
    width: "130px",
    position: "relative",
    left: "29%",
    top: "-24px",
  };
  const images = [
    "./static/침착맨/침착맨1.jpg",
    "./static/침착맨/침착맨2.jpg",
    "./static/침착맨/침착맨3.jpg",
    "./static/침착맨/침착맨4.jpg",
    "./static/침착맨/침착맨5.jpg",
    "./static/침착맨/침착맨6.jpg",
    "./static/침착맨/침착맨7.jpg",
    "./static/침착맨/침착맨8.jpg",
    "./static/침착맨/침착맨9.jpg",
    "./static/침착맨/침착맨10.jpg",
    "./static/침착맨/침착맨11.jpg",
    "./static/침착맨/침착맨12.jpg",
    "./static/침착맨/침착맨13.jpg",
    "./static/침착맨/침착맨14.jpg",
    "./static/침착맨/침착맨15.jpg",
    "./static/침착맨/침착맨16.jpg",
    "./static/침착맨/침착맨17.jpg",
    "./static/침착맨/침착맨18.jpg",
    "./static/침착맨/침착맨19.jpg",
    "./static/침착맨/침착맨20.jpg",
    "./static/침착맨/침착맨21.jpg",
  ];
  return (
    <div className="findPageBG">
      <BackButton />
      <img style={iconStyle} src="./static/findPageCloud.png" alt="" />
      <div className="petGallery">
        {images.map((image, index) => (
          <img key={index} src={image} alt="" className="petImage" />
        ))}
      </div>
    </div>
  );
};

export default FindPet;

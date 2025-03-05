import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CiSquarePlus, CiSquareMinus } from "react-icons/ci";
import "./AddRecipe.css";
import API_URL from "./config";

export default function AddRecipe() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [calorie, setCalorie] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [cookingMethod, setCookingMethod] = useState("");
  const [category, setCategory] = useState("");
  const [hashTag, setHashTag] = useState("");
  const [weight, setWeight] = useState("");
  const [imageSmall, setImageSmall] = useState(null);
  const [imageSmallPreview, setImageSmallPreview] = useState("");

  // 메인 사진 관련 state
  const [mainImageFile, setMainImageFile] = useState(null);
  const [mainImagePreview, setMainImagePreview] = useState("");

  const storedData = localStorage.getItem("jwt");
  const parsedData = JSON.parse(storedData);
  const userId = parsedData.userId;
  const token = parsedData.token;

  // steps를 배열로 관리: 각 step은 description, imageFile, imagePreview를 가짐
  const [steps, setSteps] = useState([
    { description: "", imageFile: null, imagePreview: "" }
  ]);

  const handleMainImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setMainImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setMainImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageSmallChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageSmall(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageSmallPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleStepDescriptionChange = (index, value) => {
    const updatedSteps = steps.map((step, idx) =>
      idx === index ? { ...step, description: value } : step
    );
    setSteps(updatedSteps);
  };

  const handleStepImageChange = (index, e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const updatedSteps = steps.map((step, idx) =>
          idx === index
            ? { ...step, imageFile: file, imagePreview: reader.result }
            : step
        );
        setSteps(updatedSteps);
      };
      reader.readAsDataURL(file);
    }
  };

  const addStep = () => {
    setSteps([...steps, { description: "", imageFile: null, imagePreview: "" }]);
  };

  const removeStep = (index) => {
    if (steps.length > 1) {
      const updatedSteps = steps.filter((_, idx) => idx !== index);
      setSteps(updatedSteps);
    } else {
      alert("최소 하나의 스텝은 필요합니다.");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // 필수 항목 확인: 제목, 메인 사진, 열량, 재료, 최소 1단계 설명
    if (
      !title ||
      //!mainImageFile ||
      !calorie ||
      !ingredients ||
      !steps[0].description ||
      !cookingMethod ||
      !category ||
      !hashTag ||
      !weight
      //!imageSmall
    ) {
      alert("필수 항목을 모두 입력해주세요.");
      return;
    }
  
    // 레시피 정보 JSON 객체로 구성
    const recipeData = {
      recipe: {
        title,
        cookingMethod,
        category,
        hashTag,
        weight,
        imageSmall: imageSmallPreview, // 작은 이미지 URL(여기서는 미리보기로 대신)
        imageLarge: mainImagePreview, // 메인 이미지 URL(여기서는 미리보기로 대신)
        ingredients,
        recipeSteps: steps.map((step, index) => ({
          stepNumber: index + 1,
          description: step.description,
          imageUrl: step.imagePreview // 각 스텝 미리보기 이미지
        }))
      }
    };
  
    // POST 요청 보내기
    fetch(`${API_URL}/api/recipes/${userId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(recipeData)
    })
      .then((response) => {
        if (response.ok) {
          alert("레시피가 등록되었습니다!");
          navigate("/"); // 성공 시 홈으로 이동
        } else {
          console.log(response);
          throw new Error("레시피 등록 실패");
        }
      })
      .catch((error) => {
        alert(error.message);
      });
  };
  

  return (
    <div className="add-recipe-container">
      <h2>레시피 등록</h2>
      <form onSubmit={handleSubmit} className="add-recipe-form">
        {/* 레시피 제목 */}
        <div className="form-group">
          <label>레시피 제목</label>
          <input
            type="text"
            placeholder="레시피 제목을 입력하세요"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        {/* 메인 사진 등록 */}
        <div className="form-group">
          <label>메인 사진 등록</label>
          <input type="file" accept="image/*" onChange={handleMainImageChange} />
          {mainImagePreview && (
            <img src={mainImagePreview} alt="메인 미리보기" className="image-preview" />
          )}
        </div>

        {/* 부가 사진 등록 */}
        <div className="form-group">
          <label>부가 사진 등록</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageSmallChange}
          />
          {imageSmallPreview && (
            <img
              src={imageSmallPreview}
              alt="부가 사진 미리보기"
              className="image-preview"
            />
          )}
        </div>

        {/* 카테고리 입력 */}
        <div className="form-group">
          <label>카테고리</label>
          <input
            type="text"
            placeholder="음식 종류를 입력하세요(찜, 조림, 볶음, 구이, 탕 등)"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
          />
        </div>

        {/* 재료 입력 */}
        <div className="form-group">
          <label>재료</label>
          <textarea
            placeholder="사용된 재료들을 입력하세요 (쉼표로 구분)"
            value={ingredients}
            onChange={(e) => setIngredients(e.target.value)}
            required
          ></textarea>
        </div>

        {/* 조리 방법 */}
        <div className="form-group">
          <label>조리 방법</label>
          <textarea
            placeholder="조리 방법을 입력하세요"
            value={cookingMethod}
            onChange={(e) => setCookingMethod(e.target.value)}
            required
          />
        </div>

        {/* 해시태그 입력 */}
        <div className="form-group">
          <label>해시태그</label>
          <input
            type="text"
            placeholder="레시피 해시태그를 입력하세요"
            value={hashTag}
            onChange={(e) => setHashTag(e.target.value)}
            required
          />
        </div>

        {/* 무게 입력 */}
        <div className="form-group">
          <label>무게</label>
          <input
            type="text"
            placeholder="레시피 무게를 입력하세요"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            required
          />
        </div>

        {/* 열량 입력 (숫자만 입력) */}
        <div className="form-group">
          <label>열량</label>
          <input
            placeholder="열량을 입력하세요 (kcal)"
            value={calorie}
            onChange={(e) => setCalorie(e.target.value)}
            required
          />
        </div>

        {/* 만드는 방법 - Step 별로 입력 */}
        <div className="form-group">
          <label>만드는 방법</label>
          {steps.map((step, index) => (
            <div key={index} className="step-group">
              <div className="step-header">
                <span>Step {index + 1}</span>
                {steps.length > 1 && (
                  <button
                    type="button"
                    className="remove-step-btn"
                    onClick={() => removeStep(index)}
                  >
                    <CiSquareMinus size={20} />
                  </button>
                )}
              </div>
              <div className="step-content">
                <input
                  type="text"
                  placeholder={`Step ${index + 1} 설명을 입력하세요`}
                  value={step.description}
                  onChange={(e) => handleStepDescriptionChange(index, e.target.value)}
                  required={index === 0}
                />
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleStepImageChange(index, e)}
                />
              </div>
              {step.imagePreview && (
                <img
                  src={step.imagePreview}
                  alt={`Step ${index + 1} 미리보기`}
                  className="step-image-preview"
                />
              )}
            </div>
          ))}
          <button type="button" className="add-step-btn" onClick={addStep}>
            <CiSquarePlus size={24} />
          </button>
        </div>

        <div className="form-actions">
          <button type="button" onClick={() => navigate(-1)}>
            취소
          </button>
          <button type="submit">등록</button>
        </div>
      </form>
    </div>
  );
}
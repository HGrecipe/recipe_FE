import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PiBowlFood } from "react-icons/pi";
import { LuBeef } from "react-icons/lu";
import { CiSearch } from "react-icons/ci";
import "./Main.css";
import API_URL from "./config";
  //로컬스토리지에서 토큰, userId 받기
  const storedData = localStorage.getItem("jwt");
  const parsedData = JSON.parse(storedData);
  const userId = parsedData.userId;
  const token = parsedData.token;

// CustomSelect 컴포넌트 (재사용 가능)
function CustomSelect({ options, placeholder, value, onChange }) {

  
  const [open, setOpen] = useState(false);

  const toggleOpen = (e) => {
    e.stopPropagation();
    setOpen(!open);
  };

  const handleSelect = (option) => {
    onChange(option);
    setOpen(false);
  };

  return (
    <div className="custom-select-container" onClick={toggleOpen}>
      <div className="custom-select-display">
        {value ? (
          <>
            {placeholder === "검색 옵션을 선택하세요" && value === "음식명으로 검색" ? (
              <PiBowlFood size={18} className="option-icon" />
            ) : placeholder === "검색 옵션을 선택하세요" && value === "재료로 검색" ? (
              <LuBeef size={18} className="option-icon" />
            ) : null}
            <span>{value}</span>
          </>
        ) : (
          <span className="placeholder">{placeholder}</span>
        )}
      </div>
      {open && (
        <div className="custom-select-dropdown">
          {/* "전체 검색" 혹은 "전체" 항목을 포함 */}
          <div
            className="custom-select-option"
            onClick={(e) => {
              e.stopPropagation();
              handleSelect(placeholder.includes("검색 옵션") ? "전체 검색" : "전체");
            }}
          >
            {placeholder.includes("검색 옵션") ? (
              <span>전체 검색</span>
            ) : (
              <span>전체</span>
            )}
          </div>
          {options.map((option, idx) => (
            <div
              key={idx}
              className="custom-select-option"
              onClick={(e) => {
                e.stopPropagation();
                handleSelect(option);
              }}
            >
              {placeholder.includes("검색 옵션") && option === "음식명으로 검색" ? (
                <PiBowlFood size={18} className="option-icon" />
              ) : placeholder.includes("검색 옵션") && option === "재료로 검색" ? (
                <LuBeef size={18} className="option-icon" />
              ) : null}
              <span>{option}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Main() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [recipes, setRecipes] = useState([]);
  const [searchOption, setSearchOption] = useState("전체 검색");
  const [searchFilter, setSearchFilter] = useState("전체");
  const [topRecipes, setTopRecipes] = useState([])

  // 검색 옵션
  const searchOptionOptions = ["음식명으로 검색", "재료로 검색"];
  // 검색 필터 옵션
  const filterOptions = ["전체", "반찬", "국&찌개", "후식", "일품", "구이"];

  // API 요청 핸들러
  const handleSearch = async (e) => {
    e.preventDefault();

    let apiUrl = `${API_URL}/api/recipesearch`;
    const params = new URLSearchParams();

    if (query.trim() !== "") {
      params.append("keyword", query);
    }

    if (searchOption === "음식명으로 검색") {
      apiUrl = `${API_URL}/api/recipesearch/title`;
      params.append("title", query);
    } else if (searchOption === "재료로 검색") {
      apiUrl = `${API_URL}/api/recipesearch/ingredients`;
      params.append("ingredient", query);
    }

    if (searchFilter !== "전체") {
      if (searchOption === "음식명으로 검색" || searchOption === "재료로 검색") {
        apiUrl = searchOption === "음식명으로 검색" ? `${API_URL}/api/recipesearch/categorytitle` : `${API_URL}/api/recipesearch/categoryingredient`;
        params.append("category", searchFilter);
      } else {
        apiUrl = `${API_URL}/api/recipesearch/category`;
        params.append("category", searchFilter);
      }
    }

    try {
      const response = await fetch(`${apiUrl}?${params.toString()}`,
      {
        headers: {
          "Authorization": `Bearer ${token}`,  // Bearer 방식으로 토큰 전달
          "Content-Type": "application/json",
        }
      });
      if (!response.ok) {
        throw new Error("API 요청 실패");
      }
      const data = await response.json();
      console.log("API 검색 결과:", data);

      // 응답 데이터에서 필요한 레시피 정보만 추출하여 상태에 저장
      setRecipes(data.map((recipe) => ({
        id: recipe.recipeId,
        title: recipe.title,
        category: recipe.category,
        image: recipe.imageSmall || "default-image.jpg", // imageSmall 없으면 기본 이미지
      })));
    } catch (error) {
      console.error("검색 중 오류 발생:", error);
    }
  };

    // 인기 레시피 불러오기
    const fetchTopRecipes = async () => {
      try {
        const response = await fetch(`${API_URL}/api/recipes/topliked`,
          {
            headers: {
              "Authorization": `Bearer ${token}`,  // Bearer 방식으로 토큰 전달
              "Content-Type": "application/json",
            }
          }
        );
        if (!response.ok) {
          throw new Error("API 요청 실패");
        }
        const data = await response.json();
        console.log("인기 레시피:", data); // 응답 데이터 확인
        setTopRecipes(data);  // 인기 레시피 데이터를 상태에 저장
      } catch (error) {
        console.error("인기 레시피 로드 실패:", error);
      }
    };
  
    useEffect(() => {
      fetchTopRecipes();
    }, []);

  return (
    <div className="main-container">
      <img src="home2.png" alt="홈" className="home-img" />

      <div className="main-container">
        {/* 검색 옵션 및 필터 영역 */}
        <div className="search-filters">
          <div className="filter-group">
            <CustomSelect
              options={searchOptionOptions}
              placeholder="검색 옵션을 선택하세요"
              value={searchOption === "전체 검색" ? "" : searchOption}
              onChange={(option) =>
                setSearchOption(option === "" ? "전체 검색" : option)
              }
            />
          </div>
          <div className="filter-group">
            <CustomSelect
              options={filterOptions.slice(1)} // "전체" 제외하고 나머지 옵션
              placeholder="검색 필터를 선택하세요"
              value={searchFilter === "전체" ? "" : searchFilter}
              onChange={(option) =>
                setSearchFilter(option === "" ? "전체" : option)
              }
            />
          </div>
        </div>

        {/* 검색 폼 */}
        <form className="search-form" onSubmit={handleSearch}>
          <div className="search-input-container">
            <input
              type="text"
              placeholder="레시피를 검색하세요"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button type="submit" className="search-btn">
              <CiSearch size={24} />
            </button>
          </div>
        </form>

        {/* 검색 결과 또는 인기 레시피 영역 */}
        {recipes.length > 0 ? (
        <div className="recipes-results">
          {recipes.map((recipe) => (
        <div
          key={recipe.id}
          className="recipe-card"
          onClick={() => navigate(`/recipe/${recipe.id}`)}
        >
          <img src={recipe.image} alt={recipe.title} />
          <h3>{recipe.title}</h3>
        </div>
    ))}
  </div>
) : (
  <h2>검색 결과가 없습니다.</h2> // 검색 결과가 없을 경우 메시지 표시
)}
      {/* 인기 레시피 영역 */}
      <div className="top-recipes">
          <h2>인기 레시피</h2>
          <div className="recipes-results">
            {topRecipes.length > 0 ? (
              topRecipes.map((recipe) => (
                <div
                  key={recipe.recipeId}
                  className="recipe-card"
                  onClick={() => navigate(`/recipe/${recipe.id}`)}
                >
                  <img src={recipe.imageLarge || "default-image.jpg"} alt={recipe.title} />
                  <h3>{recipe.title}</h3>
                </div>
              ))
            ) : (
              <p>인기 레시피를 불러오는 중입니다...</p>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}

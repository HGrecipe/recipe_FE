import React, { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "./UserContext";
import "./ScrapedRecipe.css";
import API_URL from "./config";

const storedData = localStorage.getItem("jwt");
const parsedData = JSON.parse(storedData);
const userId = parsedData.userId;
const token = parsedData.token;

export default function ScrapedRecipe() {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();

  const [scrapedRecipes, setScrapedRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) {
      setScrapedRecipes([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    const fetchScrapedRecipes = async () => {
      try {
        const response = await fetch(`${API_URL}/api/scrap/${userId}`);
        if (!response.ok) throw new Error("스크랩한 레시피를 불러오지 못했습니다.");
        
        const recipeIds = await response.json();
        if (!recipeIds.length) {
          setScrapedRecipes([]);
          setLoading(false);
          return;
        }

        const recipePromises = recipeIds.map(async (recipeId) => {
          try {
            const res = await fetch(`${API_URL}/api/recipes/${recipeId}?userId=${userId}`);
            if (!res.ok) throw new Error();
            return res.json();
          } catch {
            return null; // 개별 레시피 요청 실패 시 무시
          }
        });

        const recipeDetailsArray = (await Promise.all(recipePromises)).filter(Boolean);
        setScrapedRecipes(recipeDetailsArray);
      } catch (err) {
        console.error("스크랩한 레시피 불러오기 에러:", err);
        setError("레시피 데이터를 불러오는 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchScrapedRecipes();
  }, [user]);

  return (
    <div className="scraped-recipe-container">
      <h2>내가 스크랩한 레시피</h2>
      {loading ? (
        <p className="loading-message">데이터를 불러오는 중입니다...</p>
      ) : error ? (
        <p className="error-message">{error}</p>
      ) : scrapedRecipes.length > 0 ? (
        <div className="recipes-results">
          {scrapedRecipes.map((recipe) => (
            <div
              key={recipe.recipeId}
              className="recipe-card"
              onClick={() => navigate(`/recipe/${recipe.recipeId}`)}
            >
              <img
                src={recipe.imageLarge || "https://via.placeholder.com/300"}
                alt={recipe.RCP_NM}
              />
              <h3>{recipe.title}</h3>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-message">
          <p>스크랩한 레시피가 없습니다.</p>
          <button className="find-recipes-btn" onClick={() => navigate("/")}>레시피를 찾아보세요</button>
        </div>
      )}
    </div>
  );
}

import React, { useState, useEffect, useContext, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { UserContext } from "./UserContext";
import { MdOutlineRemoveRedEye, MdOutlineFileUpload } from "react-icons/md";
import { BiLike } from "react-icons/bi";
import { FaRegStar } from "react-icons/fa";
import "./RecipeDetail.css";
import API_URL from "./config";

export default function RecipeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(UserContext);

  const [recipe, setRecipe] = useState(null);
  const [views, setViews] = useState(0);  // 조회수 상태
  const [likes, setLikes] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [viewCountIncremented, setViewCountIncremented] = useState(false);
  const commentsEndRef = useRef(null);

  const [favoriteCount, setFavoriteCount] = useState(0);  // 좋아요 개수 상태 추가
  const [likeMessage, setLikeMessage] = useState(""); // 좋아요 메시지 상태 추가

  const [showRecipeDeleteModal, setShowRecipeDeleteModal] = useState(false);
  const [showRecipeReportModal, setShowRecipeReportModal] = useState(false);
  const [recipeReportTitle, setRecipeReportTitle] = useState("");
  const [recipeReportReason, setRecipeReportReason] = useState("");

  const [showCommentDeleteModal, setShowCommentDeleteModal] = useState(false);
  const [commentToDeleteIndex, setCommentToDeleteIndex] = useState(null);
  const [showCommentReportModal, setShowCommentReportModal] = useState(false);
  const [commentReportText, setCommentReportText] = useState("");
  const [commentReportIndex, setCommentReportIndex] = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/api/recipes/${id}?userId=6`)
      .then((response) => response.json())
      .then((data) => {
        setRecipe(data);
        setLikes(data.likes);
      })
      .catch((error) => console.error("Error fetching recipe data:", error));

    // 좋아요 개수 가져오기 API 호출
    fetch(`${API_URL}/api/favorites/count/${id}`)
      .then((response) => response.json())
      .then((data) => {
        setFavoriteCount(data.count);  // count 값을 favoriteCount 상태에 저장
      })
      .catch((error) => console.error("Error fetching favorite count:", error));

    // 조회수 가져오기 API 호출
    fetch(`${API_URL}/api/recipes/${id}/views`)
      .then((response) => response.json())
      .then((data) => {
        setViews(data);  // 조회수 상태에 값 저장
      })
      .catch((error) => console.error("Error fetching view count:", error));

      fetch(`${API_URL}/api/comments/recipe/${id}`)
      .then((response) => response.json())
      .then((data) => setComments(data))
      .catch((error) => console.error("Error fetching comments:", error));
  }, [id]);

  const formatDateTime = (dateTimeString) => {
    const date = new Date(dateTimeString);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
  };

  useEffect(() => {
    if (recipe && !viewCountIncremented) {
      setViews((prev) => prev + 1);  // 레시피 로드 후 조회수 1 증가
      setViewCountIncremented(true);
    }
  }, [recipe, viewCountIncremented]);

  const toggleLike = () => {
    if (!user) {
      alert("로그인이 필요합니다.");
      navigate("/login", { state: { redirectBack: window.location.pathname } });
      return;
    }

    fetch(`${API_URL}/api/favorites/${id}?userId=6`, {
      method: "POST",
    })
      .then((response) => {
        // 응답이 JSON인지 확인
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          return response.json(); // JSON이면 파싱하여 반환
        } else {
          return response.text(); // 일반 텍스트 응답
        }
      })
      .then((data) => {
        if (typeof data === "object" && data.message === "좋아요 추가 완료") {
          setLikeMessage("레시피에 좋아요를 누르셨습니다.");
          setFavoriteCount((prev) => prev + 1); // 좋아요 개수 증가
          setIsLiked(true);
        } else if (data === "Already liked this recipe") {
          // 이미 좋아요한 경우 DELETE 요청 보내기
          fetch(`${API_URL}/api/favorites/${id}?userId=6`, {
            method: "DELETE",
          })
            .then((deleteResponse) => deleteResponse.json())
            .then((deleteData) => {
              if (deleteData.message === "좋아요 취소 완료") {
                setLikeMessage("좋아요를 취소했습니다.");
                setFavoriteCount((prev) => Math.max(prev - 1, 0)); // 좋아요 개수 감소 (최소 0 유지)
                setIsLiked(false);
              } else {
                setLikeMessage("좋아요 취소에 실패했습니다.");
              }
            })
            .catch((error) => {
              console.error("Error removing favorite:", error);
              setLikeMessage("좋아요 취소에 실패했습니다.");
            });
        } else {
          setLikeMessage("오류가 발생했습니다.");
        }
      })
      .catch((error) => {
        console.error("Error adding favorite:", error);
        setLikeMessage("오류가 발생했습니다.");
      });
    
  };

  const toggleSave = () => {
    if (!user) {
      alert("로그인이 필요합니다.");
      navigate("/login", { state: { redirectBack: window.location.pathname } });
      return;
    }
    setIsSaved(!isSaved);
  };

  const handleShare = () => {
    navigator.clipboard
      .writeText(window.location.href)
      .then(() => alert("게시글 URL이 복사되었습니다."))
      .catch(() => alert("URL 복사에 실패했습니다."));
  };

  const openRecipeDeleteModal = () => {
    setShowRecipeDeleteModal(true);
  };

  const handleRecipeDeleteConfirm = () => {
    setShowRecipeDeleteModal(false);
    alert("삭제되었습니다.");
    navigate(-1);
  };

  const openRecipeReportModal = () => {
    setShowRecipeReportModal(true);
  };

  const handleRecipeReportSubmit = () => {
    if (!recipeReportTitle || !recipeReportReason) {
      alert("모든 항목을 입력해주세요.");
      return;
    }
    setShowRecipeReportModal(false);
    alert("신고가 완료되었습니다.");
    setRecipeReportTitle("");
    setRecipeReportReason("");
  };

  const openCommentDeleteModal = (index) => {
    setCommentToDeleteIndex(index);
    setShowCommentDeleteModal(true);
  };

  const handleCommentDeleteConfirm = () => {
    setComments(comments.filter((_, idx) => idx !== commentToDeleteIndex));
    setShowCommentDeleteModal(false);
    alert("삭제되었습니다.");
  };

  const openCommentReportModal = (index) => {
    setCommentReportIndex(index);
    setShowCommentReportModal(true);
  };

  const handleCommentReportSubmit = () => {
    if (!commentReportText) {
      alert("신고 내용을 입력해주세요.");
      return;
    }
    setShowCommentReportModal(false);
    alert("신고가 완료되었습니다.");
    setCommentReportText("");
  };

  const handleAddComment = (e) => {
    e.preventDefault();
    if (!user) {
      alert("로그인이 필요합니다.");
      navigate("/login", { state: { redirectBack: window.location.pathname } });
      return;
    }
    if (newComment.trim()) {
      const encodedContent = encodeURIComponent(newComment.trim());  // 입력된 댓글을 URL 안전하게 인코딩
  
      // 댓글 추가 API 요청
      fetch(`http://localhost:8080/api/comments/${id}?content=${encodedContent}&userId=6`, {
        method: "POST",
      })
        .then((response) => {
          if (!response.ok) {
            // 상태 코드가 200이 아니면 오류 처리
            throw new Error('댓글 추가 실패: ' + response.statusText);
          }
          return response.text();  // JSON이 아닌 텍스트 응답을 먼저 받아봄
        })
        .then(() => {
          alert("댓글을 등록하셨습니다.");  // 댓글 등록 성공 메시지
          window.location.reload();  // 페이지 새로고침
        })
        .catch((error) => {
          console.error("Error adding comment:", error);
          alert("댓글 등록에 실패했습니다.");
        });
    }
  };
  
  
  
  

  return (
    <div className="recipe-detail-container">
      <button className="back-btn" onClick={() => navigate(-1)}>
        뒤로가기
      </button>
      {recipe ? (
        <>
          <div className="recipe-title-container">
            <h1 className="recipe-title">{recipe.title}</h1>
          </div>
          <div className="recipe-main">
            <div className="recipe-left">
              <img src={recipe.imageLarge} alt={recipe.title} className="recipe-image" />
              <div className="recipe-ingredients">
                <h2>재료</h2>
                <p>{recipe.ingredients}</p>
              </div>
            </div>
            <div className="recipe-center">
              <div className="recipe-header">
                <h1 className="recipe-title">{recipe.title}</h1>
                <div></div>
                {user && user.email === recipe.owner ? (
                  <button className="report-delete-btn" onClick={openRecipeDeleteModal}>
                    삭제
                  </button>
                ) : (
                  <button className="report-delete-btn" onClick={openRecipeReportModal}>
                    신고
                  </button>
                )}
              </div>
              <div className="recipe-steps">
                {Array.isArray(recipe.steps)
                  ? recipe.steps.map((step) => (
                      <div key={step.stepId} className="recipe-step">
                        <div className="recipe-step-number">Step {step.stepNumber}</div>
                        <p>{step.description}</p>
                        {step.imageUrl && step.imageUrl !== "" && (
                          <img
                            src={step.imageUrl}
                            alt={`Step ${step.stepNumber}`}
                            className="step-image"
                          />
                        )}
                      </div>
                    ))
                  : recipe.steps.split("\n").map((line, index) => (
                      <p key={index}>{line}</p>
                    ))}
              </div>
            </div>
          </div>
          <div className="recipe-stats">
            <span className="stat-btn">
              <MdOutlineRemoveRedEye size={20} /> {views} {/* 조회수 표시 */}
            </span>
            <span onClick={toggleLike} className={`stat-btn ${isLiked ? "active" : ""}`}>
              <BiLike size={20} /> {favoriteCount} {/* 좋아요 개수 표시 */}
            </span>
            <span onClick={toggleSave} className={`stat-btn ${isSaved ? "active" : ""}`}>
              <FaRegStar size={20} />
            </span>
            <span onClick={handleShare} className="stat-btn">
              <MdOutlineFileUpload size={20} />
            </span>
          </div>

          {/* 좋아요 메시지 팝업 */}
          {likeMessage && (
            <div className="like-message-popup">
              <p>{likeMessage}</p>
            </div>
          )}

          <div className="comments-section">
            <div className="comments-list">
              {comments.length === 0 ? (
                <p>댓글이 없습니다.</p>
              ) : (
                comments.map((comment, index) => (
                  <div key={index} className="comment-item">
                    <span>{comment.content}</span>
                    {user && comment.author === user.email ? (
                      <button
                        className="comment-action-btn"
                        onClick={() => openCommentDeleteModal(index)}
                      >
                        삭제
                      </button>
                    ) : (
                      <button
                        className="comment-action-btn"
                        onClick={() => openCommentReportModal(index)}
                      >
                        신고
                      </button>
                    )}
                  </div>
                ))
              )}
              <div ref={commentsEndRef} />
            </div>
            
            <form onSubmit={handleAddComment} className="comment-form">
              <div className="comment-header">
                <span className="comment-title">댓글</span>
                <button type="submit" className="comment-btn">등록</button>
              </div>
              <textarea
                placeholder="댓글을 입력하세요"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                required
              ></textarea>
            </form>
          </div>

        </>
      ) : (
        <p className="error-message">해당 레시피를 찾을 수 없습니다.</p>
      )}
    </div>
  );
}

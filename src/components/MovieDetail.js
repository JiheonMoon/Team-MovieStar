import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchMovieDetails } from "../api/tmdb";
import { FaStar } from "react-icons/fa";
import moment from "moment";
import "../css/App.css";

// 별점 컴포넌트
const StarRating = ({ rating, setRating, size = 30, readOnly }) => (
  <div className="star-rating" style={{ cursor: "pointer" }}>
    {[...Array(5)].map((_, index) => (
      <FaStar
        key={index}
        size={size}
        color={index < rating ? "gold" : "lightgray"}
        onClick={readOnly ? () => { } : () => setRating(index + 1)}
        style={readOnly ? { pointerEvents: "none", } : {}}
      />
    ))}
  </div>
);

// 리뷰 작성 폼 컴포넌트
const ReviewForm = ({ rate, setRate, review, setReview, addReview }) => (
  <div className="review-form">
    <h3>리뷰 작성</h3>
    <StarRating rating={rate} setRating={setRate} />
    <input
      className="review-input"
      placeholder="리뷰 내용을 입력해주세요"
      value={review}
      onChange={(e) => setReview(e.target.value)}
    />
    <button className="review-submit-button" onClick={addReview}>
      올리기
    </button>
  </div>
);

// 리뷰 아이템 컴포넌트
const ReviewItem = ({
  item,
  onEdit,
  onRemove,
  editable,
  editState,
  updateReview,
  cancelEdit,
}) => (
  <li className="review-item">
    <div className="review-item-container">
      <span className="review-user">{item.user}</span>
      <StarRating rating={item.rate} size={15} readOnly />
      <span className="review-text">{item.review}</span>
      <span className="review-date">{item.date}</span>
      <button className="review-edit-button" onClick={() => onEdit(item)}>
        수정
      </button>
      <button className="review-delete-button" onClick={() => onRemove(item.id)}>
        삭제
      </button>
    </div>
    {editable && editState.id === item.id && (
      <div className="review-edit-form">
        <StarRating
          rating={editState.rate}
          setRating={(newRate) =>
            editState.setEditState((prev) => ({ ...prev, rate: newRate }))
          }
          size={15}
        />
        <input
          className="review-edit-input"
          placeholder="리뷰 내용을 입력해주세요"
          value={editState.review}
          onChange={(e) =>
            editState.setEditState((prev) => ({
              ...prev,
              review: e.target.value,
            }))
          }
        />
        <button className="review-update-button" onClick={updateReview}>
          수정하기
        </button>
        <button className="review-cancel-button" onClick={cancelEdit}>
          취소
        </button>
      </div>
    )}
  </li>
);

// 리뷰 리스트 컴포넌트
const ReviewList = ({
  reviews,
  onEdit,
  onRemove,
  editable,
  editState,
  updateReview,
  cancelEdit,
}) => (
  <ul className="review-list">
    {reviews.map((item) => (
      <ReviewItem
        key={item.id}
        item={item}
        onEdit={onEdit}
        onRemove={onRemove}
        editable={editable}
        editState={editState}
        updateReview={updateReview}
        cancelEdit={cancelEdit}
      />
    ))}
  </ul>
);

// 평균 평점 계산 함수
const calculateAverageRating = (reviews) => {
  if (reviews.length === 0) return 0;
  const total = reviews.reduce((acc, cur) => acc + cur.rate, 0);
  return (total / reviews.length).toFixed(2); // 소수점 2자리까지 표시
};

// 메인 MovieDetail 컴포넌트
const MovieDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [movie, setMovie] = useState(null);
  const [rate, setRate] = useState(5);
  const [review, setReview] = useState("");
  const [reviewList, setReviewList] = useState([]);
  const [editable, setEditable] = useState(false);
  const [editState, setEditState] = useState({ id: -1, rate: 5, review: "" });
  const averageRating = calculateAverageRating(reviewList)

  const addReview = () => {
    const newReview = {
      id: reviewList.length + 1,
      user: "유저 이름",
      rate,
      review,
      date: moment().format("MM/DD HH:mm"),
    };
    if (!review) {
      alert("리뷰 내용을 입력해주세요")
      return;
    }
    if (window.confirm("등록 하시겠습니까?")) {
      setReviewList((prev) => [newReview, ...prev]);
      setReview("");
      setRate(5)
    }
  };

  const handleRemove = (id) => {
    if (window.confirm("삭제 하시겠습니까?")) {
      setReviewList((prev) => prev.filter((item) => item.id !== id));
    }
  };

  const handleEdit = (item) => {
    setEditable(true);
    setEditState({ id: item.id, rate: item.rate, review: item.review });
  };

  const updateReview = () => {
    if (window.confirm("수정 하시겠습니까?")) {
      setReviewList((prev) =>
        prev.map((item) =>
          item.id === editState.id
            ? { ...item, rate: editState.rate, review: editState.review }
            : item
        )
      );
      setEditable(false);
      setEditState({ id: -1, rate: 5, review: "" });
    }
  };

  const cancelEdit = () => {
    setEditable(false);
    setEditState({ id: -1, rate: 5, review: "" });
  };

  useEffect(() => {
    const getMovieDetails = async () => {
      const movieDetails = await fetchMovieDetails(id);
      setMovie(movieDetails);
    };
    getMovieDetails();
  }, [id]);

  if (!movie) return <div>Loading...</div>;

  return (
    <div
      className="movie-detail"
      style={{
        background: `linear-gradient(to left, rgba(0, 0, 0, 0), rgba(0, 0, 0, 1)), 
        url(https://image.tmdb.org/t/p/original/${movie.backdrop_path})`,
        backgroundSize: "cover",
      }}
    >
      <div className="detail-container">
        <button className="back-button" onClick={() => navigate(-1)}>
          ← 뒤로 가기
        </button>
        <div className="detail-header">
          <div>
            <h1>{movie.title}</h1>
            <div className="detail-information">
              <span>
                <strong>개봉일:</strong> {movie.release_date}
              </span>
              <span>
                <strong>평점:</strong> {movie.vote_average}
              </span>
            </div>
            <p className="detail-overview">{movie.overview}</p>

            <p>
              <strong>유저 평점: </strong> {averageRating}
            </p>
          </div>
        </div>
        <ReviewForm
          rate={rate}
          setRate={setRate}
          review={review}
          setReview={setReview}
          addReview={addReview}
        />
        <h3>사용자 평</h3>
        <ReviewList
          reviews={reviewList}
          onEdit={handleEdit}
          onRemove={handleRemove}
          editable={editable}
          editState={{
            ...editState,
            setEditState,
          }}
          updateReview={updateReview}
          cancelEdit={cancelEdit}
        />
      </div>
    </div>
  );
};

export default MovieDetail;

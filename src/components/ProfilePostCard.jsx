// import axios from "axios";
// import { jwtDecode } from "jwt-decode";
import { useContext, useEffect, useState } from "react";
import { Button, Col, Image, Row } from "react-bootstrap";
import { useDispatch } from "react-redux";
import { likePost, removeLikeFromPost } from "../features/posts/postsSlice";
import { AuthContext } from "./AuthProvider";
import UpdatePostModal from "./UpdatePostModal";

export default function ProfilePostCard({ post }) {
  const { content, id: postId, imageUrl } = post;
  // const content = post.content
  // const postId = post.id

  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const handleShowUpdateModal = () => setShowUpdateModal(true);
  const handleCloseUpdateModal = () => setShowUpdateModal(false);

  const [likes, setLikes] = useState(post.likes || []);
  const dispatch = useDispatch();
  const { currentUser } = useContext(AuthContext);
  const userId = currentUser.uid;

  const isLiked = likes.includes(userId);

  // // Decoding to get the userId
  // const token = localStorage.getItem("authToken");
  // const decode = jwtDecode(token);
  // const userId = decode.id;

  const pic =
    "https://pbs.twimg.com/profile_images/1587405892437221376/h167Jlb2_400x400.jpg";
  const BASE_URL =
    "https://b73a3877-176d-4fe2-9b4b-e618d84b8e21-00-1ydd332cayr6f.sisko.replit.dev";

  // useEffect(() => {
  //   fetch(`${BASE_URL}/likes/post/${postId}`)
  //     .then((response) => response.json())
  //     .then((data) => setLikes(data))
  //     .catch((error) => console.error("Error:", error));
  // }, [postId]);

  // const isLiked = likes.some((like) => like.user_id === userId);

  const handleLike = () => (isLiked ? removeFromLikes() : addToLikes());

  const addToLikes = () => {
    setLikes([...likes, userId]); // [3, 2, 5, 7]
    dispatch(likePost({ userId, postId }));
  };

  const removeFromLikes = () => {
    setLikes(likes.filter((id) => id !== userId)); // [3, 2, 5]
    dispatch(removeLikeFromPost({ userId, postId }));
  };

  return (
    <Row
      className="p-3"
      style={{
        borderTop: "1px solid #D3D3D3",
        borderBottom: "1px solid #D3D3D3",
      }}
    >
      <Col sm={1}>
        <Image src={pic} fluid roundedCircle />
      </Col>

      <Col>
        <strong>Haris</strong>
        <span> @haris.samingan · Apr 16</span>
        <p>{content}</p>
        <Image src={imageUrl} style={{ width: 150 }} />
        <div className="d-flex justify-content-between">
          <Button variant="light">
            <i className="bi bi-chat"></i>
          </Button>
          <Button variant="light">
            <i className="bi bi-repeat"></i>
          </Button>
          <Button variant="light" onClick={handleLike}>
            {isLiked ? (
              <i className="bi bi-heart-fill text-danger"></i>
            ) : (
              <i className="bi bi-heart"></i>
            )}
            {likes.length}
          </Button>
          <Button variant="light">
            <i className="bi bi-graph-up"></i>
          </Button>
          <Button variant="light">
            <i className="bi bi-upload"></i>
          </Button>

          <Button variant="light">
            <i
              className="bi bi-pencil-square"
              onClick={handleShowUpdateModal}
            ></i>
          </Button>
          <Button variant="light">
            <i className="bi bi-trash"></i>
          </Button>
          <UpdatePostModal
            show={showUpdateModal}
            handleClose={handleCloseUpdateModal}
            postId={postId}
            originalPostContent={content}
          />
        </div>
      </Col>
    </Row>
  );
}

import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { jwtDecode } from "jwt-decode";
import axios from "axios";

// Data = posts[], loading(true/false)
// Actions = read posts                     , create a post, , update my posts, delete a post

const BASE_URL =
  "https://b73a3877-176d-4fe2-9b4b-e618d84b8e21-00-1ydd332cayr6f.sisko.replit.dev";

// Reading a post
export const fetchPostsByUser = createAsyncThunk(
  "posts/fetchByUser",
  async (userId) => {
    const response = await fetch(`${BASE_URL}/posts/user/${userId}`);
    return response.json(); // [1, 2, 3]
  }
);

export const savePost = createAsyncThunk(
  "posts/savePost",
  async (postContent) => {
    const token = localStorage.getItem("authToken"); //eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMn0.KMUFsIDTnFmyG3nMiGM6H9FNFUROf3wh7SmqJp-QV30
    const decode = jwtDecode(token); // { id:7, "name": "John Doe",  "iat": 1516239022 }
    const userId = decode.id; // 7

    const data = {
      title: "Post Title",
      content: postContent,
      user_id: userId,
    };

    const response = await axios.post(`${BASE_URL}/posts`, data);
    return response.data; // {id: 3, title: "Post Title", content: postContent, user_id: userId}
  }
);

const postsSlice = createSlice({
  name: "posts",
  initialState: { posts: [2, 3], loading: true },
  reducers: {}, // Synchronous operations only
  extraReducers: (builder) => {
    // Asynchronous operations
    builder.addCase(fetchPostsByUser.fulfilled, (state, action) => {
      state.posts = action.payload;
      state.loading = false;
    }),
      builder.addCase(savePost.fulfilled, (state, action) => {
        // {......, payload: {id: 3, title: "Post Title", content: postContent, user_id: userId}}
        state.posts = [action.payload, ...state.posts];
        //    posts = [{id: 3, title: "Post Title", content: postContent, user_id: userId}]
        //    posts = [{id: 3, title: "Post Title", content: postContent, user_id: userId}, 2, 3]
      });
  },
});
export default postsSlice.reducer;

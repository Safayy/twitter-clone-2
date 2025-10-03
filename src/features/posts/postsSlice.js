import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { db, storage } from "../../firebase";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";

export const fetchPostsByUser = createAsyncThunk(
  "posts/fetchByUser",
  async (userId) => {
    try {
      const postsRef = collection(db, `users/${userId}/posts`); // Made the url reference
      const querySnapshot = await getDocs(postsRef); // Access that link and take a snapshot
      const docs = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      return docs;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
);

export const savePost = createAsyncThunk(
  "posts/savePost",
  //                          file = null/undefined
  async ({ userId, postContent, file }) => {
    try {
      // null.name ❌❌❌
      let imageUrl = "";
      //   false
      if (file !== null) {
        const imageRef = ref(storage, `posts/${file.name}`); // posts/profile.png
        const response = await uploadBytes(imageRef, file);
        imageUrl = await getDownloadURL(response.ref); // www.twitter.com/123213cddasdc234/profile.png
      }
      const postsRef = collection(db, `users/${userId}/posts`);
      const newPostRef = doc(postsRef);
      await setDoc(newPostRef, { content: postContent, likes: [], imageUrl });
      const newPost = await getDoc(newPostRef);

      const post = {
        id: newPost.id,
        ...newPost.data(),
      };

      return post;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
);

export const updatePost = createAsyncThunk(
  "posts/updatePost",
  async ({ userId, postId, newPostContent, newFile }) => {
    try {
      // Upload the new file to the storage if it exists and get its URL
      let newImageUrl = "";
      if (newFile) {
        const imageRef = ref(storage, `posts/${newFile.name}`);
        const response = await uploadBytes(imageRef, newFile);
        newImageUrl = await getDownloadURL(response.ref);
      }
      // Reference to the existing post
      const postRef = doc(db, `users/${userId}/posts/${postId}`);
      // Get the current post data
      const postSnap = await getDoc(postRef);

      if (postSnap.exists()) {
        // Update the existing post
        const postData = postSnap.data();
        /*{
          content: 'hello from localhost',
          imageUrl: 'www.firebase.com/aiojsdf7343'
          }
        */

        const updatedData = {
          ...postData,
          content: newPostContent || postData.content,
          imageUrl: newImageUrl || postData.imageUrl,
        };
        /*{
            content: 'hello once again',
            imageUrl: 'www.firebase.com/image1'
            }
          */
        await updateDoc(postRef, updatedData);
        const updatedPost = { id: postId, ...updatedData };
        /*{
            id: 7
            content: 'hello once again',
            imageUrl: 'www.firebase.com/image1'
            }*/
        return updatedPost;
      } else {
        // Show a message that the post does not exist
        throw new Error("Post does not exist");
      }
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
);

export const likePost = createAsyncThunk(
  "posts/likePost",
  async ({ userId, postId }) => {
    try {
      const postRef = doc(db, `users/${userId}/posts/${postId}`);

      const docSnap = await getDoc(postRef);

      if (docSnap.exists()) {
        const postData = docSnap.data();
        const likes = [...postData.likes, userId];

        await setDoc(postRef, { ...postData, likes });
      }

      return { userId, postId };
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
);

export const removeLikeFromPost = createAsyncThunk(
  "posts/removeLikeFromPost",
  async ({ userId, postId }) => {
    try {
      const postRef = doc(db, `users/${userId}/posts/${postId}`);

      const docSnap = await getDoc(postRef);

      if (docSnap.exists()) {
        const postData = docSnap.data();
        const likes = postData.likes.filter((id) => id !== userId);

        await setDoc(postRef, { ...postData, likes });
      }

      return { userId, postId };
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
);
// data     = posts[], loading true/false
// actions  = see posts, create a post, like a post, remove a like from a post
const postsSlice = createSlice({
  name: "posts",
  initialState: { posts: [], loading: true },
  // reducers = when my actions happen immediately
  extraReducers: (builder) => {
    builder
      //                                          action = {..., payload: [{1},{2},{3}]}
      .addCase(fetchPostsByUser.fulfilled, (state, action) => {
        state.posts = action.payload;
        state.loading = false;
      })
      .addCase(savePost.fulfilled, (state, action) => {
        state.posts = [action.payload, ...state.posts];
      })
      .addCase(likePost.fulfilled, (state, action) => {
        const { userId, postId } = action.payload;

        const postIndex = state.posts.findIndex((post) => post.id === postId);

        if (postIndex !== -1) {
          state.posts[postIndex].likes.push(userId);
        }
      })
      .addCase(removeLikeFromPost.fulfilled, (state, action) => {
        const { userId, postId } = action.payload;

        const postIndex = state.posts.findIndex((post) => post.id === postId);

        if (postIndex !== -1) {
          state.posts[postIndex].likes = state.posts[postIndex].likes.filter(
            (id) => id !== userId
          );
        }
      })
      .addCase(updatePost.fulfilled, (state, action) => {
        const updatedPost = action.payload;
        /*{
            id: 7kskn4234lkjs
            content: 'hello once again',
            imageUrl: 'www.firebase.com/image1'
            }*/

        const postIndex = state.posts.findIndex(
          (post) => post.id === updatedPost.id
        ); // 2

        if (postIndex !== -1) {
          state.posts[postIndex] = updatedPost;
        }

        /*
        [
          {
            id: 1alksjdflk43
            content: 'hello',
            imageUrl: 'www.firebase.com/image1'
          },
          {
            id: 2vafdsasdfd
            content: 'hello',
            imageUrl: 'www.firebase.com/image2'
          },
          {
          id: 7kskn4234lkjs
            content: 'hello once again',
            imageUrl: 'www.firebase.com/image1'
            }
        ]
        */
      });
  },
});

export default postsSlice.reducer;

"use client";

import { useState, useEffect } from "react";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";
import { Amplify } from "aws-amplify";
import outputs from "@/amplify_outputs.json";

// Force reconfiguration to pick up latest schema
Amplify.configure(outputs, { ssr: false });
const client = generateClient<Schema>();

interface Post {
  id: string;
  title?: string | null;
  content?: string | null;
  author: string;
  createdAt?: string;
  updatedAt?: string;
}

export default function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    author: "",
  });

  // Create a new post
  const createPost = async () => {
    if (!formData.title || !formData.author) {
      alert("Title and Author are required!");
      return;
    }

    try {
      console.log("Available models:", Object.keys(client.models));
      console.log("Post model:", client.models.Post);
      
      if (!client.models.Post) {
        alert("Post model not available yet. Please wait for sandbox to redeploy.");
        return;
      }
      
      const result = await client.models.Post.create({
        title: formData.title,
        content: formData.content,
        author: formData.author,
      });
      
      console.log("Post created:", result);
      alert("Post created successfully!");
      resetForm();
    } catch (error) {
      console.error("Error creating post:", error);
      alert("Error creating post: " + (error as Error).message);
    }
  };

  // Get a specific post
  const getPost = async (id: string) => {
    try {
      const result = await client.models.Post.get({ id });
      console.log("Post retrieved:", result);
      
      if (result.data) {
        setSelectedPost(result.data);
      }
    } catch (error) {
      console.error("Error getting post:", error);
      alert("Error getting post: " + (error as Error).message);
    }
  };

  // Update a post
  const updatePost = async () => {
    if (!selectedPost || !formData.title || !formData.author) {
      alert("Please select a post and fill required fields!");
      return;
    }

    try {
      const result = await client.models.Post.update({
        id: selectedPost.id,
        title: formData.title,
        content: formData.content,
        author: formData.author,
      });
      
      console.log("Post updated:", result);
      alert("Post updated successfully!");
      setIsEditing(false);
      setSelectedPost(null);
      resetForm();
    } catch (error) {
      console.error("Error updating post:", error);
      alert("Error updating post: " + (error as Error).message);
    }
  };

  // Delete a post
  const deletePost = async (id: string) => {
    if (!confirm("Are you sure you want to delete this post?")) return;

    try {
      const result = await client.models.Post.delete({ id });
      console.log("Post deleted:", result);
      alert("Post deleted successfully!");
      
      if (selectedPost?.id === id) {
        setSelectedPost(null);
        resetForm();
      }
    } catch (error) {
      console.error("Error deleting post:", error);
      alert("Error deleting post: " + (error as Error).message);
    }
  };

  const resetForm = () => {
    setFormData({ title: "", content: "", author: "" });
    setIsEditing(false);
    setSelectedPost(null);
  };

  const startEditing = (post: Post) => {
    setSelectedPost(post);
    setFormData({
      title: post.title || '',
      content: post.content || '',
      author: post.author,
    });
    setIsEditing(true);
  };

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      <h1>Post Management</h1>
      
      {/* Form */}
      <div style={{ 
        border: "1px solid #ccc", 
        padding: "20px", 
        marginBottom: "20px",
        borderRadius: "8px"
      }}>
        <h2>{isEditing ? "Edit Post" : "Create New Post"}</h2>
        
        <div style={{ marginBottom: "10px" }}>
          <label>
            Title: <span style={{ color: "red" }}>*</span>
            <br />
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              style={{ width: "100%", padding: "8px", marginTop: "4px" }}
              placeholder="Enter post title"
            />
          </label>
        </div>

        <div style={{ marginBottom: "10px" }}>
          <label>
            Content:
            <br />
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              style={{ width: "100%", padding: "8px", marginTop: "4px", height: "100px" }}
              placeholder="Enter post content"
            />
          </label>
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label>
            Author: <span style={{ color: "red" }}>*</span>
            <br />
            <input
              type="text"
              value={formData.author}
              onChange={(e) => setFormData({ ...formData, author: e.target.value })}
              style={{ width: "100%", padding: "8px", marginTop: "4px" }}
              placeholder="Enter author name"
            />
          </label>
        </div>

        <div>
          {isEditing ? (
            <>
              <button 
                onClick={updatePost}
                style={{ 
                  padding: "10px 20px", 
                  marginRight: "10px",
                  backgroundColor: "#4CAF50",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer"
                }}
              >
                Update Post
              </button>
              <button 
                onClick={resetForm}
                style={{ 
                  padding: "10px 20px",
                  backgroundColor: "#f44336",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer"
                }}
              >
                Cancel
              </button>
            </>
          ) : (
            <button 
              onClick={createPost}
              style={{ 
                padding: "10px 20px",
                backgroundColor: "#008CBA",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer"
              }}
            >
              Create Post
            </button>
          )}
        </div>
      </div>

      {/* Test Get Post */}
      <div style={{ 
        border: "1px solid #ccc", 
        padding: "20px", 
        marginBottom: "20px",
        borderRadius: "8px"
      }}>
        <h2>Get Post by ID</h2>
        <input
          type="text"
          placeholder="Enter post ID"
          onKeyPress={(e) => {
            if (e.key === "Enter") {
              const id = (e.target as HTMLInputElement).value.trim();
              if (id) getPost(id);
            }
          }}
          style={{ width: "70%", padding: "8px", marginRight: "10px" }}
        />
        <button 
          onClick={() => {
            const input = document.querySelector('input[placeholder="Enter post ID"]') as HTMLInputElement;
            const id = input?.value.trim();
            if (id) getPost(id);
          }}
          style={{ 
            padding: "8px 16px",
            backgroundColor: "#FF9800",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer"
          }}
        >
          Get Post
        </button>
      </div>

      {/* Selected Post Display */}
      {selectedPost && (
        <div style={{ 
          border: "1px solid #4CAF50", 
          padding: "20px", 
          marginBottom: "20px",
          borderRadius: "8px",
          backgroundColor: "#f9f9f9"
        }}>
          <h2>Selected Post</h2>
          <p><strong>ID:</strong> {selectedPost.id}</p>
          <p><strong>Title:</strong> {selectedPost.title || 'No title'}</p>
          <p><strong>Content:</strong> {selectedPost.content || 'No content'}</p>
          <p><strong>Author:</strong> {selectedPost.author}</p>
          
          <div style={{ marginTop: "15px" }}>
            <button 
              onClick={() => startEditing(selectedPost)}
              style={{ 
                padding: "8px 16px",
                marginRight: "10px",
                backgroundColor: "#4CAF50",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer"
              }}
            >
              Edit
            </button>
            <button 
              onClick={() => deletePost(selectedPost.id)}
              style={{ 
                padding: "8px 16px",
                backgroundColor: "#f44336",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer"
              }}
            >
              Delete
            </button>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div style={{ 
        border: "1px solid #2196F3", 
        padding: "20px", 
        borderRadius: "8px",
        backgroundColor: "#e3f2fd"
      }}>
        <h2>How to Test</h2>
        <ol>
          <li><strong>Create:</strong> Fill the form and click "Create Post"</li>
          <li><strong>Read:</strong> Enter a post ID and click "Get Post"</li>
          <li><strong>Update:</strong> Select a post, click "Edit", modify fields, and click "Update"</li>
          <li><strong>Delete:</strong> Select a post and click "Delete"</li>
        </ol>
        <p><strong>Note:</strong> Check the browser console for detailed API responses and any errors.</p>
      </div>
    </div>
  );
}
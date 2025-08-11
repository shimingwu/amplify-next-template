"use client";

import { useState, useEffect } from "react";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";
import { useUserAuth } from "@/contexts/UserAuthContext";
import { Amplify } from "aws-amplify";
import outputs from "@/amplify_outputs.json";


Amplify.configure(outputs);

const client = generateClient<Schema>();

interface Post {
  id: string;
  title: string;
  content: string;
  author: string;
  createdAt?: string;
  updatedAt?: string;
}

export default function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
  });

  const { username, isAuthenticated, isAdmin } = useUserAuth();

  // Load all posts using the regular model (for listing)
  const loadPosts = async () => {
    try {
      setIsLoading(true);
      const response = await client.models.Post.list();
      setPosts(response.data as Post[]);
    } catch (error) {
      console.error("Error loading posts:", error);
      alert("Failed to load posts");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadPosts();
    }
  }, [isAuthenticated]);

  // Get a specific post using standard model
  const getPost = async (id: string) => {
    try {
      const response = await client.models.Post.get({ id });
      if (response.data) {
        setSelectedPost(response.data as Post);
        setFormData({
          title: response.data.title || "",
          content: response.data.content || "",
        });
      }
    } catch (error) {
      console.error("Error getting post:", error);
      alert("Failed to get post details");
    }
  };

  // Create a new post using standard model
  const createPost = async () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      alert("Please fill in both title and content");
      return;
    }

    setIsSubmitting(true);
    try {
      await client.models.Post.create({
        title: formData.title,
        content: formData.content,
        author: username || "Unknown"
      });

      // Refresh the list
      await loadPosts();
      resetForm();
      alert("Post created successfully!");
    } catch (error) {
      console.error("Error creating post:", error);
      alert("Failed to create post");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update a post using standard model
  const updatePost = async () => {
    if (!selectedPost || !formData.title.trim() || !formData.content.trim()) {
      alert("Please fill in both title and content");
      return;
    }

    // Check if user can edit this post
    if (!isAdmin && selectedPost.author !== username) {
      alert("You can only edit your own posts");
      return;
    }

    setIsSubmitting(true);
    try {
      await client.models.Post.update({
        id: selectedPost.id,
        title: formData.title,
        content: formData.content,
        author: selectedPost.author
      });

      // Refresh the list
      await loadPosts();
      resetForm();
      alert("Post updated successfully!");
    } catch (error) {
      console.error("Error updating post:", error);
      alert("Failed to update post");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete a post using standard model
  const deletePost = async (post: Post) => {
    // Check if user can delete this post
    if (!isAdmin && post.author !== username) {
      alert("You can only delete your own posts");
      return;
    }

    if (!confirm(`Are you sure you want to delete "${post.title}"?`)) {
      return;
    }

    try {
      await client.models.Post.delete({ id: post.id });
      
      // Refresh the list
      await loadPosts();
      if (selectedPost?.id === post.id) {
        resetForm();
      }
      alert("Post deleted successfully!");
    } catch (error) {
      console.error("Error deleting post:", error);
      alert("Failed to delete post");
    }
  };

  const resetForm = () => {
    setFormData({ title: "", content: "" });
    setSelectedPost(null);
    setIsEditing(false);
  };

  const startEdit = (post: Post) => {
    setSelectedPost(post);
    setFormData({
      title: post.title,
      content: post.content,
    });
    setIsEditing(true);
  };

  // Loading state
  if (isLoading) {
    return (
      <div style={{ padding: "20px", fontFamily: "Arial, sans-serif", textAlign: "center" }}>
        <h1>📰 Post Management</h1>
        <p>Loading posts...</p>
      </div>
    );
  }

  // Authentication check
  if (!isAuthenticated) {
    return (
      <div style={{ padding: "20px", fontFamily: "Arial, sans-serif", textAlign: "center" }}>
        <h1>📰 Post Management</h1>
        <p>Please sign in to manage posts.</p>
      </div>
    );
  }

  return (
    <main style={{ 
      padding: "20px", 
      fontFamily: "Arial, sans-serif", 
      maxWidth: "1400px", 
      margin: "0 auto",
      backgroundColor: "white",
      minHeight: "100vh"
    }}>
      {/* Header */}
      <div style={{ marginBottom: "30px" }}>
        <div style={{ 
          marginBottom: "20px",
          position: "fixed",
          top: "20px",
          left: "20px",
          zIndex: 1000
        }}>
          <button 
            onClick={() => window.location.href = '/'}
            style={{
              backgroundColor: "#6c757d",
              color: "white",
              border: "none",
              padding: "8px 16px",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "14px",
              boxShadow: "0 2px 4px rgba(0,0,0,0.2)"
            }}
          >
            ← Back to Home
          </button>
        </div>
        
        <h1 style={{ color: "#2c3e50", marginBottom: "10px", marginTop: "40px" }}>
          📰 Post Management
        </h1>
        <p style={{ color: "#6c757d", marginBottom: "20px" }}>
          Manage posts using <strong>Amplify Data Models (GraphQL + DynamoDB)</strong>
        </p>
        <div style={{ 
          backgroundColor: "#e3f2fd", 
          padding: "12px", 
          borderRadius: "6px", 
          border: "1px solid #bbdefb",
          marginBottom: "20px"
        }}>
          <p style={{ margin: "0", color: "#1565c0", fontSize: "14px" }}>
            👤 Signed in as: <strong>{username}</strong> {isAdmin && "🔑 (Admin)"}
          </p>
          <p style={{ margin: "5px 0 0 0", fontSize: "12px", color: "#1565c0" }}>
            {isAdmin ? "You can edit/delete all posts" : "You can only edit/delete your own posts"}
          </p>
        </div>
      </div>

      {/* Two-column layout */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "400px 1fr", 
        gap: "20px",
        marginBottom: "20px"
      }}>
        
        {/* Left Column - Create/Edit Form */}
        <div style={{
          backgroundColor: "white",
          padding: "20px",
          borderRadius: "8px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          height: "fit-content"
        }}>
          <h3 style={{ marginBottom: "20px", color: "#2c3e50" }}>
            {isEditing ? "✏️ Edit Post" : "➕ Create New Post"}
          </h3>
          
          <div style={{ marginBottom: "15px" }}>
            <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
              Title:
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter post title..."
              style={{
                width: "100%",
                padding: "10px",
                border: "2px solid #e9ecef",
                borderRadius: "6px",
                fontSize: "16px",
                outline: "none"
              }}
              onFocus={(e) => e.target.style.borderColor = "#007bff"}
              onBlur={(e) => e.target.style.borderColor = "#e9ecef"}
            />
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
              Content:
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="Write your post content..."
              rows={6}
              style={{
                width: "100%",
                padding: "10px",
                border: "2px solid #e9ecef",
                borderRadius: "6px",
                fontSize: "16px",
                outline: "none",
                resize: "vertical"
              }}
              onFocus={(e) => e.target.style.borderColor = "#007bff"}
              onBlur={(e) => e.target.style.borderColor = "#e9ecef"}
            />
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            {isEditing ? (
              <>
                <button
                  onClick={updatePost}
                  disabled={isSubmitting}
                  style={{
                    backgroundColor: isSubmitting ? "#6c757d" : "#28a745",
                    color: "white",
                    border: "none",
                    padding: "12px 20px",
                    borderRadius: "6px",
                    cursor: isSubmitting ? "not-allowed" : "pointer",
                    fontSize: "16px",
                    flex: 1
                  }}
                >
                  {isSubmitting ? "Updating..." : "Update Post"}
                </button>
                <button
                  onClick={resetForm}
                  style={{
                    backgroundColor: "#6c757d",
                    color: "white",
                    border: "none",
                    padding: "12px 20px",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "16px"
                  }}
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                onClick={createPost}
                disabled={isSubmitting}
                style={{
                  backgroundColor: isSubmitting ? "#6c757d" : "#007bff",
                  color: "white",
                  border: "none",
                  padding: "12px 20px",
                  borderRadius: "6px",
                  cursor: isSubmitting ? "not-allowed" : "pointer",
                  fontSize: "16px",
                  width: "100%"
                }}
              >
                {isSubmitting ? "Creating..." : "Create Post"}
              </button>
            )}
          </div>
        </div>

        {/* Right Column - Posts List */}
        <div style={{
          backgroundColor: "white",
          borderRadius: "10px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          overflow: "hidden"
        }}>
          <div style={{ 
            padding: "20px", 
            borderBottom: "1px solid #e9ecef",
            backgroundColor: "white"
          }}>
            <h3 style={{ margin: "0", color: "#2c3e50" }}>
              📋 All Posts ({posts.length})
            </h3>
          </div>

          {posts.length === 0 ? (
            <div style={{ 
              padding: "40px", 
              textAlign: "center", 
              color: "#6c757d" 
            }}>
              <div style={{ fontSize: "48px", marginBottom: "15px" }}>📰</div>
              <p style={{ fontSize: "18px", marginBottom: "10px" }}>No posts yet!</p>
              <p>Create your first post to get started.</p>
            </div>
          ) : (
            <div style={{ 
              overflowY: "auto", 
              padding: "15px",
              display: "grid",
              gridTemplateColumns: "1fr",
              gap: "12px",
              maxHeight: "400px"
            }}>
              {posts.map((post) => (
                <div
                  key={post.id}
                  style={{
                    padding: "15px",
                    border: "1px solid #e9ecef",
                    borderRadius: "6px",
                    backgroundColor: "white",
                    transition: "all 0.2s ease",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow = "0 4px 8px rgba(0,0,0,0.15)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.1)";
                  }}
                >
                  <div style={{ marginBottom: "10px" }}>
                    <h4 style={{ 
                      margin: "0 0 5px 0", 
                      color: "#2c3e50",
                      wordBreak: "break-word"
                    }}>
                      {post.title}
                    </h4>
                    <p style={{ 
                      margin: "0", 
                      fontSize: "12px", 
                      color: "#6c757d" 
                    }}>
                      by <strong>{post.author}</strong>
                      {post.createdAt && ` • ${new Date(post.createdAt).toLocaleDateString()}`}
                    </p>
                  </div>
                  
                  <p style={{ 
                    margin: "0 0 15px 0", 
                    color: "#495057",
                    lineHeight: "1.4",
                    wordBreak: "break-word"
                  }}>
                    {post.content.length > 100 
                      ? `${post.content.substring(0, 100)}...` 
                      : post.content
                    }
                  </p>

                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    <button
                      onClick={() => getPost(post.id)}
                      style={{
                        backgroundColor: "#17a2b8",
                        color: "white",
                        border: "none",
                        padding: "6px 12px",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontSize: "12px"
                      }}
                    >
                      👁️ View Details
                    </button>
                    
                    {(isAdmin || post.author === username) && (
                      <>
                        <button
                          onClick={() => startEdit(post)}
                          style={{
                            backgroundColor: "#ffc107",
                            color: "#212529",
                            border: "none",
                            padding: "6px 12px",
                            borderRadius: "4px",
                            cursor: "pointer",
                            fontSize: "12px"
                          }}
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => deletePost(post)}
                          style={{
                            backgroundColor: "#dc3545",
                            color: "white",
                            border: "none",
                            padding: "6px 12px",
                            borderRadius: "4px",
                            cursor: "pointer",
                            fontSize: "12px"
                          }}
                        >
                          🗑️ Delete
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Post Details Modal */}
      {selectedPost && !isEditing && (
        <div style={{
          position: "fixed",
          top: "0",
          left: "0",
          width: "100%",
          height: "100%",
          backgroundColor: "rgba(0,0,0,0.5)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: "white",
            padding: "30px",
            borderRadius: "10px",
            maxWidth: "600px",
            width: "90%",
            maxHeight: "80%",
            overflow: "auto"
          }}>
            <div style={{ marginBottom: "20px" }}>
              <h2 style={{ margin: "0 0 10px 0", color: "#2c3e50" }}>
                {selectedPost.title}
              </h2>
              <p style={{ margin: "0", fontSize: "14px", color: "#6c757d" }}>
                by <strong>{selectedPost.author}</strong>
                {selectedPost.createdAt && ` • ${new Date(selectedPost.createdAt).toLocaleString()}`}
              </p>
            </div>
            
            <div style={{ marginBottom: "20px" }}>
              <p style={{ 
                margin: "0", 
                lineHeight: "1.6", 
                color: "#495057",
                whiteSpace: "pre-wrap"
              }}>
                {selectedPost.content}
              </p>
            </div>

            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              {(isAdmin || selectedPost.author === username) && (
                <button
                  onClick={() => startEdit(selectedPost)}
                  style={{
                    backgroundColor: "#ffc107",
                    color: "#212529",
                    border: "none",
                    padding: "8px 16px",
                    borderRadius: "4px",
                    cursor: "pointer"
                  }}
                >
                  ✏️ Edit Post
                </button>
              )}
              <button
                onClick={() => setSelectedPost(null)}
                style={{
                  backgroundColor: "#6c757d",
                  color: "white",
                  border: "none",
                  padding: "8px 16px",
                  borderRadius: "4px",
                  cursor: "pointer"
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Info Section */}
      <div style={{
        marginTop: "20px",
        padding: "15px",
        backgroundColor: "#d1ecf1",
        border: "1px solid #bee5eb",
        borderRadius: "8px",
        flexShrink: 0
      }}>
        <h4 style={{ margin: "0 0 10px 0", color: "#0c5460" }}>
          💡 How it works
        </h4>
        <ul style={{ margin: "0", paddingLeft: "20px", color: "#0c5460" }}>
          <li>Uses <strong>Amplify Data Models</strong> for CRUD operations</li>
          <li>Standard GraphQL API with automatic DynamoDB integration</li>
          <li>Users can only edit/delete their own posts (unless admin)</li>
          <li>Role-based permissions enforced client-side (validate server-side in production)</li>
        </ul>
      </div>
    </main>
  );
}
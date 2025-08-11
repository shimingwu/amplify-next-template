"use client";

import { useState, useEffect } from "react";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";
import { useUserAuth } from "@/contexts/UserAuthContext";
import { Amplify } from "aws-amplify";
import outputs from "@/amplify_outputs.json";


Amplify.configure(outputs);

const client = generateClient<Schema>();

export default function TodosPage() {
  const [todos, setTodos] = useState<Array<Schema["Todo"]["type"]>>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newTodoContent, setNewTodoContent] = useState("");
  const { username, isLoading, isAuthenticated } = useUserAuth();

  function listTodos() {
    client.models.Todo.observeQuery().subscribe({
      next: (data) => setTodos([...data.items]),
    });
  }

  useEffect(() => {
    if (isAuthenticated) {
      listTodos();
    }
  }, [isAuthenticated]);

  async function createTodo() {
    if (!newTodoContent.trim()) {
      alert("Please enter todo content");
      return;
    }

    setIsCreating(true);
    try {
      await client.models.Todo.create({
        content: newTodoContent,
      });
      setNewTodoContent("");
      setIsCreating(false);
    } catch (error) {
      console.error("Error creating todo:", error);
      alert("Failed to create todo");
      setIsCreating(false);
    }
  }

  async function deleteTodo(id: string, content: string) {
    if (!confirm(`Are you sure you want to delete "${content}"?`)) {
      return;
    }

    try {
      await client.models.Todo.delete({ id });
    } catch (error) {
      console.error("Error deleting todo:", error);
      alert("Failed to delete todo");
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <div style={{ padding: "20px", fontFamily: "Arial, sans-serif", textAlign: "center" }}>
        <h1>📝 Todo Management</h1>
        <p>Loading...</p>
      </div>
    );
  }

  // Authentication check
  if (!isAuthenticated) {
    return (
      <div style={{ padding: "20px", fontFamily: "Arial, sans-serif", textAlign: "center" }}>
        <h1>📝 Todo Management</h1>
        <p>Please sign in to manage your todos.</p>
      </div>
    );
  }

  return (
    <main style={{ 
      padding: "20px", 
      fontFamily: "Arial, sans-serif", 
      maxWidth: "1000px", 
      margin: "0 auto",
      backgroundColor: "white",
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      width: "100%",
      boxSizing: "border-box"
    }}>
      {/* Header */}
      <div style={{ marginBottom: "30px", width: "100%", overflow: "visible" }}>
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
          📝 Todo Management
        </h1>
        <p style={{ color: "#6c757d", marginBottom: "20px" }}>
          Manage your personal todos using <strong>Amplify Data (GraphQL + DynamoDB)</strong>
        </p>
        <div style={{ 
          backgroundColor: "#e3f2fd", 
          padding: "12px", 
          borderRadius: "6px", 
          border: "1px solid #bbdefb",
          marginBottom: "20px"
        }}>
          <p style={{ margin: "0", color: "#1565c0", fontSize: "14px" }}>
            👤 Signed in as: <strong>{username}</strong>
          </p>
        </div>
      </div>

      {/* Create Todo Section */}
      <div style={{
        backgroundColor: "white",
        padding: "20px",
        borderRadius: "8px",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        marginBottom: "20px"
      }}>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <span style={{ fontSize: "18px" }}>➕</span>
          <input
            type="text"
            value={newTodoContent}
            onChange={(e) => setNewTodoContent(e.target.value)}
            placeholder="What needs to be done?"
            style={{
              flex: 1,
              padding: "10px",
              border: "2px solid #e9ecef",
              borderRadius: "6px",
              fontSize: "16px",
              outline: "none"
            }}
            onFocus={(e) => e.target.style.borderColor = "#007bff"}
            onBlur={(e) => e.target.style.borderColor = "#e9ecef"}
            onKeyPress={(e) => {
              if (e.key === "Enter" && !isCreating) {
                createTodo();
              }
            }}
          />
          <button
            onClick={createTodo}
            disabled={isCreating || !newTodoContent.trim()}
            style={{
              backgroundColor: isCreating ? "#6c757d" : "#28a745",
              color: "white",
              border: "none",
              padding: "10px 16px",
              borderRadius: "6px",
              cursor: isCreating ? "not-allowed" : "pointer",
              fontSize: "14px",
              minWidth: "80px"
            }}
          >
            {isCreating ? "..." : "Add"}
          </button>
        </div>
      </div>

      {/* Todos List */}
      <div style={{
        backgroundColor: "white",
        borderRadius: "10px",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        overflow: "hidden",
        marginBottom: "20px"
      }}>
        <div style={{ 
          padding: "20px", 
          borderBottom: "1px solid #e9ecef",
          backgroundColor: "white"
        }}>
          <h3 style={{ margin: "0", color: "#2c3e50" }}>
            📋 Your Todos ({todos.length})
          </h3>
        </div>

        {todos.length === 0 ? (
          <div style={{ 
            padding: "40px", 
            textAlign: "center", 
            color: "#6c757d" 
          }}>
            <div style={{ fontSize: "48px", marginBottom: "15px" }}>📝</div>
            <p style={{ fontSize: "18px", marginBottom: "10px" }}>No todos yet!</p>
            <p>Create your first todo above to get started.</p>
          </div>
        ) : (
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", 
            gap: "15px", 
            padding: "20px",
            maxHeight: "400px",
            overflowY: "auto"
          }}>
            {todos.map((todo) => (
              <div
                key={todo.id}
                style={{
                  padding: "15px",
                  border: "1px solid #e9ecef",
                  borderRadius: "8px",
                  backgroundColor: "#ffffff",
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
                <div style={{ marginBottom: "12px" }}>
                  <p style={{ 
                    margin: "0", 
                    fontSize: "16px", 
                    color: "#2c3e50",
                    wordBreak: "break-word",
                    lineHeight: "1.4"
                  }}>
                    {todo.content}
                  </p>
                  {todo.createdAt && (
                    <p style={{ 
                      margin: "8px 0 0 0", 
                      fontSize: "12px", 
                      color: "#6c757d" 
                    }}>
                      📅 {new Date(todo.createdAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => deleteTodo(todo.id, todo.content || "")}
                  style={{
                    backgroundColor: "#dc3545",
                    color: "white",
                    border: "none",
                    padding: "6px 12px",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontSize: "12px",
                    width: "100%"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#c82333";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "#dc3545";
                  }}
                >
                  🗑️ Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Info Section */}
      <div style={{
        marginTop: "20px",
        padding: "15px",
        backgroundColor: "#fff3cd",
        border: "1px solid #ffeaa7",
        borderRadius: "8px",
        flexShrink: 0
      }}>
        <h4 style={{ margin: "0 0 10px 0", color: "#856404" }}>
          💡 How it works
        </h4>
        <ul style={{ margin: "0", paddingLeft: "20px", color: "#856404" }}>
          <li>Uses <strong>Amplify Data</strong> with GraphQL subscriptions for real-time updates</li>
          <li>Data is stored in <strong>Amazon DynamoDB</strong></li>
          <li>Todos are automatically synced across all your devices</li>
          <li>Each user can only see and manage their own todos</li>
        </ul>
      </div>
    </main>
  );
}
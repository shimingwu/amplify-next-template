"use client";

import { useState } from "react";
import { signOut } from "aws-amplify/auth";
import { useUserAuth } from "@/contexts/UserAuthContext";

// Use Next.js API routes instead of direct external API calls
const API_BASE_URL = "/api/objects";

interface ApiObject {
  id?: string;
  name: string;
  data: {
    [key: string]: any;
  } | null;
  createdAt?: string;
  updatedAt?: string;
}

export default function ProductsPage() {
  const [objects, setObjects] = useState<ApiObject[]>([]);
  const [selectedObject, setSelectedObject] = useState<ApiObject | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    color: "",
    description: "",
  });
  const [response, setResponse] = useState<any>(null);

  // Get user authentication state from context
  const { isAuthenticated, isAdmin, isLoading, email } = useUserAuth();

  // Create a new object (POST)
  const createObject = async () => {
    if (!formData.name) {
      alert("Name is required!");
      return;
    }

    const payload = {
      name: formData.name,
      data: {
        price: formData.price ? parseFloat(formData.price) : null,
        color: formData.color || null,
        description: formData.description || null,
      },
    };

    try {
      const response = await fetch(API_BASE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        try {
          const errorBody = await response.text();
          if (errorBody) {
            errorMessage += `\n${errorBody}`;
          }
        } catch (e) {
          // Ignore error parsing response body
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      setResponse({ method: 'POST', url: API_BASE_URL, payload, response: result });
      resetForm();
    } catch (error) {
      console.error("Error creating object:", error);
      setResponse({ 
        method: 'POST', 
        url: API_BASE_URL, 
        payload, 
        error: (error as Error).message,
        errorDetails: {
          timestamp: new Date().toISOString(),
          operation: 'Create Product'
        }
      });
    }
  };

  // Get a specific object by ID (GET)
  const getObject = async (id: string) => {
    const url = `${API_BASE_URL}?id=${id}`;
    try {
      const response = await fetch(url);
      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        try {
          const errorBody = await response.text();
          if (errorBody) {
            errorMessage += `\n${errorBody}`;
          }
        } catch (e) {
          // Ignore error parsing response body
        }
        throw new Error(errorMessage);
      }
      const result = await response.json();
      setSelectedObject(result);
      setResponse({ method: 'GET', url, response: result });
    } catch (error) {
      console.error("Error getting object:", error);
      setResponse({ 
        method: 'GET', 
        url, 
        error: (error as Error).message,
        errorDetails: {
          timestamp: new Date().toISOString(),
          operation: 'GET Product by ID'
        }
      });
    }
  };

  // Delete an object (DELETE)
  const deleteObject = async (id: string) => {
    if (!confirm("Are you sure you want to delete this object?")) return;

    const url = `${API_BASE_URL}?id=${id}`;
    try {
      const response = await fetch(url, {
        method: "DELETE",
      });

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        try {
          const errorBody = await response.text();
          if (errorBody) {
            errorMessage += `\n${errorBody}`;
          }
        } catch (e) {
          // Ignore error parsing response body
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      setResponse({ method: 'DELETE', url, response: result });

      if (selectedObject?.id === id) {
        setSelectedObject(null);
        resetForm();
      }
    } catch (error) {
      console.error("Error deleting object:", error);
      setResponse({ 
        method: 'DELETE', 
        url, 
        error: (error as Error).message,
        errorDetails: {
          timestamp: new Date().toISOString(),
          operation: 'Delete Product'
        }
      });
    }
  };

  const resetForm = () => {
    setFormData({ name: "", price: "", color: "", description: "" });
    setIsEditing(false);
    setSelectedObject(null);
  };

  // Show loading state while checking user permissions
  if (isLoading) {
    return (
      <div style={{ padding: "20px", fontFamily: "Arial, sans-serif", textAlign: "center" }}>
        <h1>📦 Product Management</h1>
        <p>Loading...</p> 
      </div>
    );
  }

  // Handle unauthenticated state
  if (!isAuthenticated) {
    return (
      <div style={{ padding: "20px", fontFamily: "Arial, sans-serif", textAlign: "center" }}>
        <h1>📦 Product Management</h1>
        <p>Please sign in to access this page.</p> 
      </div>
    );
  }

  return (
    <div style={{ 
      padding: "20px", 
      fontFamily: "Arial, sans-serif", 
      minHeight: "100vh", 
      maxWidth: "1200px", 
      margin: "0 auto",
      backgroundColor: "white"
    }}>
      {/* Header */}
      <div style={{ marginBottom: "20px", borderBottom: "1px solid #ccc", paddingBottom: "10px" }}>
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
        
        <h1 style={{ marginTop: "40px" }}>📦 Product Management</h1>
        <div style={{ marginBottom: "10px" }}>
          <strong>User:</strong> {email} |
          <strong> Role:</strong> {isAdmin ? 'Admin' : 'User'} 
        </div>
      </div>

      {/* Main Content - 2 Panel Layout */}
      <div style={{ 
        display: "flex", 
        gap: "20px", 
        width: "100%",
        maxWidth: "100%",
        marginBottom: "20px",
        height: "100%"
      }}>
        
        {/* Left Panel - Actions */}
        <div style={{ 
          width: "400px", 
          minWidth: "400px",
          maxWidth: "400px",
          flexShrink: 0,
          border: "1px solid #ccc", 
          padding: "20px",
          overflow: "auto"
        }}>          
          {/* 1. Get Object */}
          <div style={{ marginBottom: "30px", padding: "15px", border: "1px solid #ddd" }}>
            <strong>1. Get Product By ID</strong>
            <br />
            <input
              id="productIdInput"
              type="text"
              placeholder="Enter product ID (e.g., 1, 2, 3...)"
              style={{ width: "200px", padding: "5px", marginRight: "10px", marginTop: "10px" }}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  const id = (e.target as HTMLInputElement).value.trim();
                  if (id) getObject(id);
                }
              }}
            />
            <button 
              onClick={() => {
                const input = document.getElementById('productIdInput') as HTMLInputElement;
                const id = input?.value.trim();
                if (id) {
                  getObject(id);
                } else {
                  alert("Please enter a product ID");
                }
              }}
              style={{ 
                padding: "5px 15px",
                backgroundColor: "#007bff",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer"
              }}
            >
              GET Product
            </button>

            {/* Object Table */}
            {selectedObject && (
              <div style={{ marginTop: "15px" }}>
                <h4>Product Details:</h4>
                <table style={{ width: "100%", border: "1px solid #ccc", borderCollapse: "collapse", tableLayout: "fixed" }}>
                  <tbody>
                    <tr>
                      <td style={{ border: "1px solid #ccc", padding: "5px", fontWeight: "bold", width: "30%", wordWrap: "break-word", overflow: "hidden" }}>ID</td>
                      <td style={{ border: "1px solid #ccc", padding: "5px", wordWrap: "break-word", overflow: "hidden" }}>{selectedObject.id}</td>
                    </tr>
                    <tr>
                      <td style={{ border: "1px solid #ccc", padding: "5px", fontWeight: "bold", wordWrap: "break-word", overflow: "hidden" }}>Name</td>
                      <td style={{ border: "1px solid #ccc", padding: "5px", wordWrap: "break-word", overflow: "hidden" }}>{selectedObject.name}</td>
                    </tr>
                    {selectedObject.data && Object.entries(selectedObject.data).map(([key, value]) => (
                      <tr key={key}>
                        <td style={{ border: "1px solid #ccc", padding: "5px", fontWeight: "bold", wordWrap: "break-word", overflow: "hidden" }}>{key}</td>
                        <td style={{ border: "1px solid #ccc", padding: "5px", wordWrap: "break-word", overflow: "hidden" }}>{String(value)}</td>
                      </tr>
                    ))}
                    {selectedObject.createdAt && (
                      <tr>
                        <td style={{ border: "1px solid #ccc", padding: "5px", fontWeight: "bold", wordWrap: "break-word", overflow: "hidden" }}>Created</td>
                        <td style={{ border: "1px solid #ccc", padding: "5px", wordWrap: "break-word", overflow: "hidden" }}>{selectedObject.createdAt}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* 2. Create Object */}
          <div style={{ marginBottom: "30px", padding: "15px", border: "1px solid #ddd" }}>
            <strong>2. Create Product</strong>
            <div style={{ marginBottom: "10px" }}>
              <label>Name*: </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., iPhone 15"
                style={{ width: "200px", padding: "3px" }}
              />
            </div>
            <div style={{ marginBottom: "10px" }}>
              <label>Price: </label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="999.99"
                style={{ width: "200px", padding: "3px" }}
              />
            </div>
            <div style={{ marginBottom: "10px" }}>
              <label>Color: </label>
              <input
                type="text"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                placeholder="Blue"
                style={{ width: "200px", padding: "3px" }}
              />
            </div>
            <div style={{ marginBottom: "10px" }}>
              <label>Description: </label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Product description"
                style={{ width: "200px", padding: "3px" }}
              />
            </div>
            <button onClick={createObject} style={{ padding: "5px 15px" }}>
              POST Create
            </button>
          </div>

          {/* 3. Delete Object */}
          <div style={{ marginBottom: "30px", padding: "15px", border: "1px solid #ddd" }}>
            <strong>3. Delete Product</strong>
            {selectedObject ? (
              <div>
                <p>Selected: <strong>{selectedObject.name}</strong> (ID: {selectedObject.id})</p>
                <button 
                  onClick={() => {
                    console.log('Delete button clicked, isAdmin:', isAdmin);
                    deleteObject(selectedObject.id!);
                  }}
                  disabled={!isAdmin}
                  style={{
                    backgroundColor: isAdmin ? '#dc3545' : '#6c757d',
                    color: 'white',
                    padding: '8px 16px',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: isAdmin ? 'pointer' : 'not-allowed',
                    opacity: isAdmin ? 1 : 0.6
                  }}
                  title={!isAdmin ? 'DELETE operations require admin privileges' : 'Delete this product'}
                >
                  DELETE {!isAdmin && '(Admin Only)'}
                </button>
              </div>
            ) : (
              <p style={{ color: "#666" }}>Select a product first using "Get Product"</p>
            )}
          </div>
        </div>

        {/* Right Panel - Request/Response */}
        <div style={{ 
          flex: "1",
          minWidth: "300px",
          maxWidth: "calc(100vw - 480px)",
          border: "1px solid #ccc", 
          padding: "20px",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden"
        }}>
          <h2>Request/Response</h2>
          
          {response ? (
            <>
              {/* Top - Request */}
              <div style={{ 
                flex: "1", 
                marginBottom: "20px", 
                border: "1px solid #ddd", 
                padding: "15px",
                overflow: "auto"
              }}>
                <h3>Request</h3>
                <p>{response.method} {response.url}</p>
                {response.payload && (
                  <>
                    <pre style={{ 
                      background: "white", 
                      padding: "10px", 
                      fontSize: "12px",
                      border: "1px solid #e9ecef",
                      borderRadius: "4px",
                      overflow: "auto",
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-word",
                      maxWidth: "100%"
                    }}>
                      {JSON.stringify(response.payload, null, 2)}
                    </pre>
                  </>
                )}
              </div>

              {/* Bottom - Response */}
              <div style={{ 
                flex: "1", 
                border: response.error ? "1px solid #dc3545" : "1px solid #ddd", 
                padding: "15px",
                overflow: "auto",
                backgroundColor: response.error ? "#fff5f5" : "white"
              }}>
                <h3 style={{ 
                  color: response.error ? "#dc3545" : "#333",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px"
                }}>
                  {response.error ? "❌ Error Response" : "✅ Success Response"}
                </h3>
                {response.error && (
                  <div style={{
                    backgroundColor: "#f8d7da",
                    color: "#721c24",
                    padding: "10px",
                    borderRadius: "4px",
                    marginBottom: "10px",
                    border: "1px solid #f5c6cb"
                  }}>
                    <strong>Error:</strong> {response.error}
                  </div>
                )}
                <pre style={{ 
                  background: response.error ? "#fff" : "white", 
                  padding: "10px", 
                  fontSize: "12px",
                  border: response.error ? "1px solid #f5c6cb" : "1px solid #e9ecef",
                  borderRadius: "4px",
                  overflow: "auto",
                  height: response.error ? "calc(100% - 80px)" : "100%",
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                  maxWidth: "100%"
                }}>
                  {JSON.stringify(response.response || response.error, null, 2)}
                </pre>
              </div>
            </>
          ) : (
            <div style={{ 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center", 
              height: "100%",
              color: "#666",
              textAlign: "center"
            }}>
              <p>No API calls made yet. Use the actions on the left to see requests and responses here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
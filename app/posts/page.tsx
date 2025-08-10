"use client";

import { useState, useEffect } from "react";
import { Amplify } from "aws-amplify";
import { signOut, fetchUserAttributes } from "aws-amplify/auth";
import outputs from "@/amplify_outputs.json";

// Configure Amplify (needed for authentication wrapper)
Amplify.configure(outputs);

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

export default function PostsPage() {
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
  const [userGroups, setUserGroups] = useState<string[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch user attributes and check groups
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const attributes = await fetchUserAttributes();
        console.log('User attributes:', attributes);
        
        // Debug: Log all attributes to see what's available
        console.log('All user attributes:', JSON.stringify(attributes, null, 2));
        
        const groups = attributes['family_name'];
        console.log('Groups value (in family_name):', groups, typeof groups);
        
        if (groups) {
          // Groups comes as JSON array string: "[f9cf5862-b96d-4e4b-a4c8-dbfabe70cd30, 20c2d0b1-da25-4589-bc3b-fba8e7325088]"
          let groupArray: string[] = [];
          
          if (typeof groups === 'string') {
            try {
              // The groups come as: "[f9cf5862-b96d-4e4b-a4c8-dbfabe70cd30, 20c2d0b1-da25-4589-bc3b-fba8e7325088]"
              // We need to parse this properly
              const cleaned = groups.replace(/^\[|\]$/g, ''); // Remove [ and ] from start/end
              groupArray = cleaned.split(',').map(g => g.trim()); // Split by comma and trim spaces
            } catch {
              // Fallback: treat as single group
              groupArray = [groups];
            }
          } else if (Array.isArray(groups)) {
            groupArray = groups;
          } else {
            groupArray = [String(groups)];
          }
          
          setUserGroups(groupArray);
          
          const adminCheck = groupArray.includes('f9cf5862-b96d-4e4b-a4c8-dbfabe70cd30');
          setIsAdmin(adminCheck);
          console.log('User groups:', groupArray);
          console.log('Is admin:', adminCheck);
        } else {
          console.log('No groups found in family_name. All attributes:');
          Object.keys(attributes).forEach(key => {
            console.log(`${key}:`, attributes[key]);
          });
        }
      } catch (error) {
        console.error('Error fetching user attributes:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserInfo();
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

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
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setResponse({ method: 'POST', url: API_BASE_URL, payload, response: result });
      resetForm();
    } catch (error) {
      console.error("Error creating object:", error);
      setResponse({ method: 'POST', url: API_BASE_URL, payload, error: (error as Error).message });
    }
  };

  // Get a specific object by ID (GET)
  const getObject = async (id: string) => {
    const url = `${API_BASE_URL}?id=${id}`;
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      setSelectedObject(result);
      setResponse({ method: 'GET', url, response: result });
    } catch (error) {
      console.error("Error getting object:", error);
      setResponse({ method: 'GET', url, error: (error as Error).message });
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
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setResponse({ method: 'DELETE', url, response: result });

      if (selectedObject?.id === id) {
        setSelectedObject(null);
        resetForm();
      }
    } catch (error) {
      console.error("Error deleting object:", error);
      setResponse({ method: 'DELETE', url, error: (error as Error).message });
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
        <h1>REST API Testing</h1>
        <p>Loading...</p> 
      </div>
    );
  }

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif", height: "100vh", backgroundColor: "white" }}>
      {/* Header */}
      <div style={{ marginBottom: "20px", borderBottom: "1px solid #ccc", paddingBottom: "10px" }}>
        <h1>REST API Testing</h1>
        <div style={{ marginBottom: "10px" }}>
          <strong>User Role:</strong> {isAdmin ? 'Admin' : 'User'} | 
          <strong> Groups:</strong> {userGroups.length > 0 ? userGroups.join(', ') : 'None'} | 
          {!isAdmin && <span style={{ color: 'orange' }}> DELETE operations disabled for non-admin users</span>}
        </div>
        <a href="/">← Back to Home</a>
      </div>

      {/* Main Content - 2 Panel Layout */}
      <div style={{ display: "flex", gap: "20px", height: "calc(100vh - 250px)" }}>
        
        {/* Left Panel - Actions */}
        <div style={{ 
          flex: "1", 
          border: "1px solid #ccc", 
          padding: "20px",
          overflow: "auto"
        }}>          
          {/* 1. Get Object */}
          <div style={{ marginBottom: "30px", padding: "15px", border: "1px solid #ddd" }}>
            <h3>1. Get Object</h3>
            <input
              type="text"
              placeholder="Enter object ID (e.g., 1, 2, 3...)"
              style={{ width: "200px", padding: "5px", marginRight: "10px" }}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  const id = (e.target as HTMLInputElement).value.trim();
                  if (id) getObject(id);
                }
              }}
            />
            <button 
              onClick={() => {
                const input = document.querySelector('input[placeholder*="Enter object ID"]') as HTMLInputElement;
                const id = input?.value.trim();
                if (id) getObject(id);
              }}
              style={{ padding: "5px 15px" }}
            >
              GET Object
            </button>

            {/* Object Table */}
            {selectedObject && (
              <div style={{ marginTop: "15px" }}>
                <h4>Object Details:</h4>
                <table style={{ width: "100%", border: "1px solid #ccc", borderCollapse: "collapse" }}>
                  <tbody>
                    <tr>
                      <td style={{ border: "1px solid #ccc", padding: "5px", fontWeight: "bold", width: "30%" }}>ID</td>
                      <td style={{ border: "1px solid #ccc", padding: "5px" }}>{selectedObject.id}</td>
                    </tr>
                    <tr>
                      <td style={{ border: "1px solid #ccc", padding: "5px", fontWeight: "bold" }}>Name</td>
                      <td style={{ border: "1px solid #ccc", padding: "5px" }}>{selectedObject.name}</td>
                    </tr>
                    {selectedObject.data && Object.entries(selectedObject.data).map(([key, value]) => (
                      <tr key={key}>
                        <td style={{ border: "1px solid #ccc", padding: "5px", fontWeight: "bold" }}>{key}</td>
                        <td style={{ border: "1px solid #ccc", padding: "5px" }}>{String(value)}</td>
                      </tr>
                    ))}
                    {selectedObject.createdAt && (
                      <tr>
                        <td style={{ border: "1px solid #ccc", padding: "5px", fontWeight: "bold" }}>Created</td>
                        <td style={{ border: "1px solid #ccc", padding: "5px" }}>{selectedObject.createdAt}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* 2. Create Object */}
          <div style={{ marginBottom: "30px", padding: "15px", border: "1px solid #ddd" }}>
            <h3>2. Create Object</h3>
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
                placeholder="Description"
                style={{ width: "200px", padding: "3px" }}
              />
            </div>
            <button onClick={createObject} style={{ padding: "5px 15px" }}>
              POST Create
            </button>
          </div>

          {/* 3. Delete Object */}
          <div style={{ marginBottom: "30px", padding: "15px", border: "1px solid #ddd" }}>
            <h3>3. Delete Object</h3>
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
                  title={!isAdmin ? 'DELETE operations require admin privileges' : 'Delete this object'}
                >
                  DELETE {!isAdmin && '(Admin Only)'}
                </button>
              </div>
            ) : (
              <p style={{ color: "#666" }}>Select an object first using "Get Object"</p>
            )}
          </div>
        </div>

        {/* Right Panel - Request/Response */}
        <div style={{ 
          flex: "1", 
          border: "1px solid #ccc", 
          padding: "20px",
          display: "flex",
          flexDirection: "column"
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
                <p><strong>Method:</strong> {response.method}</p>
                <p><strong>URL:</strong> {response.url}</p>
                {response.payload && (
                  <>
                    <p><strong>Payload:</strong></p>
                    <pre style={{ 
                      background: "#f8f9fa", 
                      padding: "10px", 
                      fontSize: "12px",
                      border: "1px solid #e9ecef",
                      borderRadius: "4px",
                      overflow: "auto"
                    }}>
                      {JSON.stringify(response.payload, null, 2)}
                    </pre>
                  </>
                )}
              </div>

              {/* Bottom - Response */}
              <div style={{ 
                flex: "1", 
                border: "1px solid #ddd", 
                padding: "15px",
                overflow: "auto"
              }}>
                <h3>Response</h3>
                <pre style={{ 
                  background: "#f8f9fa", 
                  padding: "10px", 
                  fontSize: "12px",
                  border: "1px solid #e9ecef",
                  borderRadius: "4px",
                  overflow: "auto",
                  height: "100%"
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

      {/* Footer */}
      <div style={{ marginTop: "20px", padding: "10px", borderTop: "1px solid #ccc", fontSize: "12px" }}>
        <strong>API:</strong> <a href="https://restful-api.dev/" target="_blank">https://api.restful-api.dev/objects</a>
      </div>
    </div>
  );
}
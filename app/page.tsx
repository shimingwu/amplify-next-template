"use client";

import { useAuthenticator } from "@aws-amplify/ui-react";
import { useUserAuth } from "@/contexts/UserAuthContext";
import "./../app/app.css";


export default function App() {
  const { signOut } = useAuthenticator();
  const { username, email, isAdmin, userGroups } = useUserAuth();

  const navigationCards = [
    {
      title: "Todo Management",
      description: "Manage your personal todo list using Amplify Data (GraphQL + DynamoDB)",
      icon: "📝",
      href: "/todos",
      tech: "Amplify Data + DynamoDB"
    },
    {
      title: "Product Management", 
      description: "Manage products using REST API endpoints",
      icon: "📦",
      href: "/products",
      tech: "REST API"
    },
    {
      title: "Post Management",
      description: "Manage posts using Amplify Data models with role-based permissions",
      icon: "📰", 
      href: "/posts",
      tech: "Amplify Data + Permissions"
    }
  ];

  return (
    <main style={{ 
      padding: "40px", 
      fontFamily: "Arial, sans-serif", 
      maxWidth: "1200px", 
      margin: "0 auto",
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column"
    }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "40px" }}>
        <h1 style={{ color: "#2c3e50", marginBottom: "10px" }}>
          🚀 Amplify Gen2 Demo App
        </h1>
        <p style={{ color: "#7f8c8d", fontSize: "18px", marginBottom: "20px" }}>
          Explore different data management approaches with Amplify
        </p>
        
        {/* User Info */}
        <div style={{ 
          backgroundColor: "white", 
          border: "1px solid #e0e0e0",
          padding: "15px", 
          borderRadius: "8px", 
          display: "inline-block",
          marginBottom: "30px"
        }}>
          <p style={{ margin: "0", color: "#495057" }}>
            <strong>Welcome, {username}!</strong> ({email})
          </p>
          <p style={{ margin: "5px 0 0 0", fontSize: "14px", color: "#6c757d" }}>
            Role: {isAdmin ? "🔑 Admin" : "👤 User"} | 
            Groups: {userGroups.length > 0 ? userGroups.join(", ") : "None"}
          </p>
        </div>
      </div>

            {/* Navigation Cards */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "1fr 1fr 1fr", 
        gap: "20px", 
        marginBottom: "40px",
        flex: "1",
        alignContent: "start"
      }}>
        {navigationCards.map((card, index) => (
          <div
            key={index}
            style={{
              backgroundColor: "white",
              border: "2px solid #e9ecef",
              borderRadius: "12px",
              padding: "30px",
              textAlign: "center",
              cursor: "pointer",
              transition: "all 0.3s ease",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
            }}
            onClick={() => window.location.href = card.href}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#007bff";
              e.currentTarget.style.transform = "translateY(-5px)";
              e.currentTarget.style.boxShadow = "0 8px 25px rgba(0,123,255,0.15)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "#e9ecef";
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 2px 4px rgba(0,0,0,0.1)";
            }}
          >
            <div style={{ fontSize: "20px", marginBottom: "15px" }}>
              {card.icon} {card.title}
            </div>
            <h3 style={{ color: "#2c3e50", marginBottom: "10px", fontSize: "20px" }}>
              
            </h3>
            <p style={{ color: "#6c757d", marginBottom: "15px", lineHeight: "1.5" }}>
              {card.description}
            </p>
            <div style={{
              backgroundColor: "#e9ecef",
              color: "#495057",
              padding: "5px 10px",
              borderRadius: "15px",
              fontSize: "12px",
              display: "inline-block"
            }}>
              {card.tech}
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div style={{ 
        textAlign: "center", 
        marginTop: "auto",
        paddingTop: "20px"
      }}>
        <div style={{ marginBottom: "20px" }}>
          <p style={{ color: "#6c757d", marginBottom: "10px" }}>
            🥳 App successfully hosted with enhanced authentication!
          </p>
          <a 
            href="https://docs.amplify.aws/react/"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#007bff", textDecoration: "none" }}
          >
            📚 Explore Amplify Gen2 Documentation →
          </a>
        </div>
        
        <button 
          onClick={signOut}
          style={{
            backgroundColor: "#dc3545",
            color: "white",
            border: "none",
            padding: "12px 24px",
            borderRadius: "6px",
            fontSize: "16px",
            cursor: "pointer",
            transition: "background-color 0.3s ease"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#c82333";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "#dc3545";
          }}
        >
          🚪 Sign Out
        </button>
      </div>
    </main>
  );
}

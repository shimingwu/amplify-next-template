"use client"

import { Authenticator } from "@aws-amplify/ui-react";
import { signInWithRedirect } from "aws-amplify/auth";

// Custom Sign-In Component with SAML option
function CustomSignIn() {
  const handleSAMLSignIn = () => {
    signInWithRedirect({
      provider: { custom: "MicrosoftEntraIDSAML" }
    });
  };

  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <h2>Choose Sign-In Method</h2>
      <button 
        onClick={handleSAMLSignIn}
        style={{
          padding: "10px 20px",
          margin: "10px",
          backgroundColor: "#0078d4",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer"
        }}
      >
        Sign in with Microsoft Entra ID
      </button>
      <div style={{ margin: "20px 0" }}>
        <strong>OR</strong>
      </div>
    </div>
  );
}

export default function AuthenticatorWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Authenticator
      components={{
        SignIn: {
          Header() {
            return <CustomSignIn />;
          }
        }
      }}
    >
      {children}
    </Authenticator>
  );
}
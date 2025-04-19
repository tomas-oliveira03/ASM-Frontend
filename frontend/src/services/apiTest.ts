/**
 * This file helps diagnose API connection issues
 */

// Function to test direct connection to backend
export const testDirectBackendConnection = async (): Promise<void> => {
  try {
    console.log("Testing direct backend connection to http://localhost:3001/api/crypto/BTC...");
    const response = await fetch("http://localhost:3001/api/crypto/BTC", {
      method: "GET",
      headers: { "Accept": "application/json" }
    });
    
    console.log(`Direct backend connection status: ${response.status}`);
    if (response.ok) {
      const data = await response.text();
      console.log("Response data (preview):", data.substring(0, 200) + "...");
    }
  } catch (error) {
    console.error("Direct backend connection failed:", error);
    console.log("This could be a network issue or the server might not be running.");
  }
};

// Function to test proxy connection
export const testProxyConnection = async (): Promise<void> => {
  try {
    console.log("Testing proxy connection to /api/crypto/BTC...");
    const response = await fetch("/api/crypto/BTC", {
      method: "GET",
      headers: { "Accept": "application/json" }
    });
    
    console.log(`Proxy connection status: ${response.status}`);
    if (response.ok) {
      const data = await response.text();
      console.log("Response data (preview):", data.substring(0, 200) + "...");
    } else {
      console.log("Server responded with an error. Status:", response.status);
      try {
        const errorText = await response.text();
        console.log("Error details:", errorText);
      } catch (e) {
        console.log("Could not read error details");
      }
    }
  } catch (error) {
    console.error("Proxy connection failed:", error);
  }
};

// Run these tests from the browser console to diagnose connection issues
window.testApiConnection = {
  testDirect: testDirectBackendConnection,
  testProxy: testProxyConnection
};

// Declare the global window type
declare global {
  interface Window {
    testApiConnection: {
      testDirect: () => Promise<void>;
      testProxy: () => Promise<void>;
    };
  }
}

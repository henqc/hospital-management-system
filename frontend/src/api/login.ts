"use client";

export async function HandleLogin(email: string, password: string) {
  try {
    console.log("Attempting login with:", email);
    
    const res = await fetch("http://127.0.0.1:8000/login", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const error = await res.json();
      console.error("Login failed:", error);
      throw new Error(error.message || "Login failed");
    }

    const data = await res.json();
    console.log("Login successful, got data:", data);
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('jwt_token', data.jwt_token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      console.log("Stored in localStorage:", {
        jwt_token: data.jwt_token,
        user: data.user
      });
    }
    
    return data.user;
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
}
"use client";

export async function HandleLogin(email: string, password: string) {
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
    throw new Error(error.message || "Login failed");
  }

  const data = await res.json();
  return data.user;
}

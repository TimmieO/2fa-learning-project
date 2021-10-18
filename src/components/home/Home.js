import React, { useState, useEffect } from "react";

export default function Home() {

  return (
    <div className="body">
      <h1>Hello</h1>
      <a href="/login">Sign In</a>
      <a href="/register">Sign Up</a>
      <a href="/auth">Auth</a>
    </div>
  );
}
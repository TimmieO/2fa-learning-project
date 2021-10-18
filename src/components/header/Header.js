import React, { useState, useEffect } from "react";
import "./header.css"
import fetchPageData from "../../helper/fetchPageDataHelper"

export default function Header() {

  const [fetchedData, setFetchedData] = useState({});

  useEffect(() => {
    getPageData();
  }, [fetchedData]);

  const getPageData = async () => {
    let data = await fetchPageData("header");
    console.log(data);
    setFetchedData(data)
  }
  return (
    <div className="header">
      <div>
        <a href="/login">Sign In</a>
      </div>
      <div>
        <a href="/register">Sign Up</a>
      </div>
      <div>
        <a href="/auth">Auth</a>
      </div>
    </div>
  );
}
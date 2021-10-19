import React, { useState, useEffect } from "react";

import checkAccess from "../../helper/userHasAccess"

export default function Home() {

  const [userHasAccess, setUserHasAccess] = useState()
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    accessCheck();
  }, [userHasAccess]);

  const accessCheck = async () => {
    let access = await checkAccess(window.location.pathname)
    setUserHasAccess(access)

    if(access == true){
      setLoading(false)
    }
  };

  return (
    <div className="body">
      {loading ? "Loading" :
      <h1>Hello</h1>
      }
    </div>
  );
}
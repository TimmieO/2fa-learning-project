import React, { useState, useEffect } from "react";
import "./auth.css";
import submitHelper from "../../helper/submitHelper";
import checkAccess from "../../helper/userHasAccess"

import { useHistory } from "react-router-dom";
export default function Login() {
  const [authInfo, setAuthInfo] = useState({
    auth: null
  });
  const [userHasAccess, setUserHasAccess] = useState()
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    accessCheck();
  }, [userHasAccess]);

  const accessCheck = async () => {
    let access = await checkAccess(window.location.pathname)
    setUserHasAccess(access)
    if(access == false){
      window.location.href = "/";
    }
    if(access == true){
      setLoading(false)
    }
  };

  //Change text in state onChange
  const onChangeUpdateStateText = async (e) => {
    let inpType = e.target.dataset.input;
    let inpVal = e.target.value;
    setAuthInfo((prevState) => ({
      ...prevState,
      [inpType]: inpVal,
    }));
  };

  const submitAuth = async (e) => {
    e.preventDefault();

    let status = await submitHelper("auth", authInfo);

    if (status.verified == true) {
      window.location.href = "/"; //Return user to home page
    }
    //Wrong info
    if (status.verified == false) {
      e.preventDefault();
    }
  };

  return (
    <div className="body">
      {loading ? "Loading!" :
        <div className="div-form">
          <form action="" className="form">
            <h1 className="form_title">Enter Auth</h1>
            <br/>
            <div className="form_div">
              <input
                type="text"
                className="form_input"
                data-input="auth"
                placeholder=""
                onChange={onChangeUpdateStateText}
              />
              <label className="form_label">Auth Token</label>
            </div>
            <input
              type="submit"
              className="form_button"
              value="Submit"
              onClick={submitAuth}
            />
          </form>
          <div id="navLink">
            <p onClick={() => window.location.href = "/signOut"} className="reg_button">
              Sign Out
            </p>
          </div>
        </div>
      }
    </div>
  );
}
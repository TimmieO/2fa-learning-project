import React, { useState, useEffect } from "react";
import "./auth.css";
import submitHelper from "../../helper/submitHelper";
import checkAccess from "../../helper/userHasAccess"
import fetchPageData from "../../helper/fetchPageDataHelper"

export default function Login() {
  const [authInfo, setAuthInfo] = useState({
    auth: null
  });
  const [userHasAccess, setUserHasAccess] = useState()
  const [loading, setLoading] = useState(true);
  const [fetchedData, setFetchedData] = useState({});

  useEffect(() => {
    accessCheck();
  }, [userHasAccess]);

  const accessCheck = async () => {
    let access = await checkAccess(window.location.pathname)
    setUserHasAccess(access)

    if(access == true){
      getPageData();
      setLoading(false)
    }
  };

  const getPageData = async () => {
    let data = await fetchPageData(window.location.pathname);
    console.log(data);
    setFetchedData(data)
  }

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

    let status = await submitHelper(fetchedData.formType, authInfo);

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
          {fetchedData.qrCode != false ? [<h1>Active 2FA </h1>, <img src={fetchedData.qrCode}/>]: null}
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
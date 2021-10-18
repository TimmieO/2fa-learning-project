const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mysql = require("mysql");
const port = 4000;
const host = "localhost";
const jwt = require('jsonwebtoken');
var CryptoJS = require("crypto-js");

const qrcode = require('qrcode');

const speakeasy = require('speakeasy')

require('dotenv').config({path: '../.env'});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const userData = {
  user_id: null,
  username: null,
  loggedIn: false,
  auth_active: null,
  auth :{
    secret: null,
    otpauth_url: null,
    qrCode: null,
  }
  }

//Handle user
app.post('/api/user/:action', function(req,res){
  var connectionObject = dbConnection();
  var data = req.body;
  let action_sql;

  switch(req.params.action){
    case "register":
    {
      action_sql = 'insert into user(firstname, lastname, email, username, password, user_salt, auth_active) values (?,?,?,?,?,?,?)';
      let inset_token_sql = 'insert into auth(user_id, secret, otpauth_url) values (?,?,?)';
      let pwd_info = encryptPassword(data);
      registerUser({action_sql, inset_token_sql}, data, pwd_info)
      break;
    }
    case "login":
    {
      let get_salt_sql = "SELECT user_salt FROM user WHERE username = ?";
      let action_sql = "SELECT user.user_id, user.username, auth.secret, auth.otpauth_url, user.auth_active FROM user JOIN auth ON auth.user_id = user.user_id WHERE username = ? and password = ?";

      loginUser({get_salt_sql : get_salt_sql, action_sql: action_sql}, data);

      break;
    }
    case "countUsername":
    {
      action_sql = "SELECT COUNT(user_id) AS count FROM user WHERE username = ?";
      checkUsername(action_sql, data);
      break;
    }
    case "countEmail":
    {
      action_sql = "SELECT COUNT(user_id) AS count FROM user WHERE email = ?";
      checkEmail(action_sql, data);
      break;
    }
    case "validate":
    {
      validate(data);
      break;
    }
    case "activateAuth":
    {
      action_sql = "UPDATE user SET auth_active = 1 WHERE user_id = ?"
      activateAuth(action_sql, data);
      break;
    }
    case "access":
    {
      hasAccess(data);
      break;
    }
  }

  function checkEmail(sql, data){
    connectionObject.query(sql, [data.email], function (err, result) {
      if (err) {
        console.log(err);
      }
      else{
        let countTotal = result[0];
        return res.send(countTotal);
      }
    })
    connectionObject.end();
  }

  function checkUsername(sql, data){
    connectionObject.query(sql, [data.username], function (err, result) {
      if (err) {
        console.log(err);
      }
      else{
        let countTotal = result[0];
        return res.send(countTotal);
      }
    })
    connectionObject.end();
  }

  function encryptPassword(data){
    var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
    var string_length = 64;
    var salt_str = '';
    for (var i=0; i<string_length; i++) {
      var rnum = Math.floor(Math.random() * chars.length);
      salt_str += chars.substring(rnum,rnum+1);
    }
    var hash_pwd = CryptoJS.SHA256(process.env.PUBLIC_SALT + salt_str + data.password).toString(CryptoJS.enc.Hex);
    return {pwd: hash_pwd, user_salt: salt_str}
  }

  function registerUser(sql, data, pwd_info){
    let generatedSecret = speakeasy.generateSecret();
    connectionObject.query(sql.action_sql,
      [data.firstname,
        data.lastname,
        data.email,
        data.username,
        pwd_info.pwd,
        pwd_info.user_salt,
        0
      ],
      function (err, result) {
        if (err) {
          res.json({message: 'Error', error: true})
        }
        if(!err){

          connectionObject.query(sql.inset_token_sql,
            [result.insertId,
              generatedSecret.base32,
              generatedSecret.otpauth_url
            ],
            function (err, result) {
            console.log(result);
              if (err) {
                res.json({message: 'Error', error: true})
              }
              if(!err){
                res.json({message: 'Success', error: false})

              }
            }
          )
        }
        connectionObject.end();

      })
  }

  function loginUser(sql, data){
    connectionObject.query(sql.get_salt_sql, [data.username], function (err, result) {
      if (err) {
        console.log(err);
      }
      else{
        if(result.length > 0){ //If user_auth was found
          let user_salt = result[0].user_salt;
          let pwd = data.password;

          let hash_pwd = CryptoJS.SHA256(process.env.PUBLIC_SALT + user_salt + pwd).toString(CryptoJS.enc.Hex);
          connectionObject.query(sql.action_sql, [data.username, hash_pwd], async function (err, result) {
            if (err) {
              console.log(err)
            }
            else {
              if(result.length > 0){//User exists'
                const id = result[0].user_id;
                const username = result[0].username;
                const secret = result[0].secret;
                const otpauth_url = result[0].otpauth_url;
                const auth_active = result[0].auth_active

                userData.user_id = id;
                userData.username = username;
                userData.loggedIn = true;
                userData.validated = false;
                userData.auth.secret = secret;
                userData.auth.otpauth_url = otpauth_url;
                userData.auth_active = auth_active;

                await getOtpQrCode();

                return res.json({valid: true, qrCode: userData.auth.qrCode});

              }else{
                return res.json({valid: false, message: "Wrong info"});
              }
            }
          })
        }else{
          return res.send(result);
        }
      }
      connectionObject.end();
    })
  }

  function getOtpQrCode(){
    qrcode.toDataURL(userData.auth.otpauth_url, function(err, data){

      userData.auth.qrCode = data;

    })
    return
  }

  function validate(data){
    if(userData.auth_active == 0){
      res.json({message: "Error", error: true});
      return;
    }

    let token = data.enteredAuthToken;
    try {
      const secret = userData.auth.secret;

      const verified = speakeasy.totp.verify({
        secret,
        encoding: 'base32',
        token
      });
      if (verified) {
        userData.validated = true;
        res.json({verified: true});
      }
      if (!verified) {
        userData.validated = false;
        res.json({verified: false})
      }
    }
    catch (error){
    }
  }

  function activateAuth(sql, data){
    if(userData.auth_active == 1){
      res.json({message: "Error", error: true});
      return;
    }

    let token = data.enteredAuthToken;
    try {
      const secret = userData.auth.secret;

      const verified = speakeasy.totp.verify({
        secret,
        encoding: 'base32',
        token
      });
      if (verified) {
        userData.validated = true;
        userData.auth_active = true;

        connectionObject.query(sql, [userData.user_id], function (err, result) {
          if (err) {
            console.log(err);
          }
          else{
            return res.json({verified: true});
          }
        })
        connectionObject.end();


      }
      if (!verified) {
        userData.validated = false;
        res.json({verified: false})
      }
    }
    catch (error){
    }
  }

  function hasAccess(data){

    let page = data.path;

    const accessObj = {
      login: {
        loggedIn: false,
        validated: false,
      },
      register: {
        loggedIn: false,
        validated: false,
      },
      auth:{
        loggedIn: true,
        validated: false
      },
      logout: {
        loggedIn: true,
      },
      home: {

      },
    }

    if(page == '/login'){
      if(accessObj.login.loggedIn == userData.loggedIn && accessObj.login.validated == userData.validated){
        res.json({hasAccess: true});
        return;
      }
      if(userData.loggedIn == false){
        res.json({hasAccess: true});
        return;
      }
      if(accessObj.login.loggedIn != userData.loggedIn || accessObj.login.validated != userData.validated){
        res.json({hasAccess: false});
        return;
      }
    }
    if(page == '/register'){
      if(accessObj.register.loggedIn == userData.loggedIn && accessObj.register.validated == userData.validated){
        res.json({hasAccess: true});
        return;
      }
      if(userData.loggedIn == false){
        res.json({hasAccess: true});
        return;
      }
      if(accessObj.register.loggedIn != userData.loggedIn || accessObj.register.validated != userData.validated){
        res.json({hasAccess: false});
        return;
      }
    }
    if(page == '/auth'){
      if(accessObj.auth.loggedIn == userData.loggedIn && accessObj.auth.validated == userData.validated){
        res.json({hasAccess: true});
        return;
      }
      if(accessObj.auth.loggedIn != userData.loggedIn || accessObj.auth.validated != userData.validated){
        res.json({hasAccess: false});
        return;
      }
    }
    if(page == '/logout'){
      if(accessObj.logout.loggedIn == userData.loggedIn){
        res.json({hasAccess: true});
        return;
      }
      if(accessObj.logout.loggedIn != userData.loggedIn){
        res.json({hasAccess: false});
        return;
      }
    }
  }

})


app.post('/api/getPageData', function(req,res){

  var data = req.body;

  let retVal = {};

  switch(data.path){
    case "/auth":
    {
      authData(retVal);
      break;
    }
    case"header":
    {
      headerData();
      break;
    }
  }

  function authData(retVal){
    if(userData.auth_active == 1){
      retVal.qrCode = false;
      retVal.formType = 'auth'
    }
    if(userData.auth_active == 0){
      retVal.qrCode = userData.auth.qrCode;
      retVal.formType = 'activateAuth'
    }

    res.json(retVal);
    return;
  }

  function headerData(){
    
  }

})


//Conn to db
function dbConnection() {
  var con =
    mysql.createConnection({
      host: process.env.DB_ADMIN_HOST,
      user: process.env.DB_ADMIN_USER,
      password: process.env.DB_ADMIN_PASSWORD,
      database: process.env.DB_ADMIN_DATABASE

    })
  con.connect(function (err) {
    if (err) throw err;
  })
  return con;
}

app.use(express.static(__dirname + '/public'));

app.listen(port, host, function () {
  console.log("Running at http://" + host + ":" + port);
});
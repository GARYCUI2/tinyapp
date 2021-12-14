/* eslint-disable camelcase */
/* eslint-disable func-style */
const express = require("express");
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
const bcrypt = require('bcryptjs');

const {getUserByEmail,urlsForUser, generateRandomString} = require("./helpers/helpers");
const { urlDatabase, users } = require("./datebase");

const PORT = 8080; // default port 8080

const app = express();
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ["Pokemon"]
}));

app.set("view engine", "ejs");

//////////////////////////////
// new user registration
// Route: "/register"

//
//// POST registration
//
app.post("/register", (req, res) => {

  // generate a random user ID
  const newRandomId = generateRandomString();

  // check if no input for email or password
  const email = req.body.email;
  const password = req.body.password;
  if (!email || !password) {
    return res.redirect(400, "/register");
  }

  //hash password
  const hashedPassword = bcrypt.hashSync(password, 10);

  const newUser = {
    id: newRandomId,
    email: email,
    password: hashedPassword
  };

  // check if email has been already used
  const user = getUserByEmail(email,users);
  if (user) {
    console.log("error: email has been used");
    return res.redirect(400, "/register");
  }

  // store new user to db and set cookie
  users[newRandomId] = newUser;
  req.session.user_id = newRandomId;
    
  res.redirect("/urls");
});

//
//// GET registration
//
app.get("/register", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user: users[req.session.user_id]
  };
  
  res.render("urls_register",templateVars);
});

//////////////////////////////
// user login
// Route: "/login"

//
////GET login page
//
app.get("/login",(req,res) => {
  
  const templateVars = {
    urls: urlDatabase,
    user: users[req.session.user_id]
  };
  
  res.render("urls_login",templateVars);
});

//
////POST login form
//
app.post("/login",(req,res) => {
  const email = req.body.email;
  const password = req.body.password;
  
  // check if email is correct
  const user = getUserByEmail(email,users);

  // no user email found, redirect to login page
  if (!user) {
    console.log("error: email or password is wrong");
    return res.redirect(403, "/login");
  }
  
  // password is wrong, redirect to login page
  if (!bcrypt.compareSync(password, user.password)) {
    console.log("error: email or password is wrong");
    return res.redirect(403, "/login");
  }

  // set cookie and redirect to main page
  req.session.user_id = user.id;
  res.redirect("/urls");
});
  
//////////////////////////////
// user logout
// Route: "/logout"

//
////user logout
//
app.post("/logout", (req, res) => {
  //clear cookies
  req.session = null;
  
  // back to login
  res.redirect("/login");
});
  
 
//////////////////////////////
// main page urls
// Route: "/urls"

//
//// GET main page after login to display all stored urls
//
app.get("/urls", (req, res) => {
  // get user id from cookie
  let userID = req.session.user_id;

  //check if login
  if (!userID) {
    console.log("error: not login");
    return res.redirect("/login");
  }
  
  const templateVars = {
    urls: urlsForUser(userID),
    user: users[userID]
  };
 
  res.render("urls_index", templateVars);
});

//
//// POST create a short url for long url input for current user
//
app.post("/urls", (req, res) => {
  // get user id from cookie
  let userID = req.session.user_id;

  //check if login
  if (!userID) {
    console.log("error: not login");
    return res.redirect("/login");
  }

  // get long url input by user
  let longValue = req.body.longURL;

  // generate random short url for long url input by user
  let shortRandom = generateRandomString();

  // store to db
  urlDatabase[shortRandom] = {
    longURL: longValue,
    userID: userID
  };
  
  res.redirect("/urls/" + shortRandom);
});

//////////////////////////////
// Create a tinyURL for a new url
// Route: "/urls/new"

//
////GET create new tinURL page
//
app.get("/urls/new", (req, res) => {
  // check if login
  if (!req.session.user_id) {
    return res.redirect("/login");
  }

  const templateVars = {
    user: users[req.session.user_id]
  };
    
  res.render("urls_new", templateVars);
});

/////////////////////////////////////////////////////
// Update the longURL associated with a shortURL
// Route: "/urls/:id"

//
////GET show page for a certain shortURL
//
app.get("/urls/:shortURL", (req, res) => {
  // get user id from cookie
  const userID = req.session.user_id;
  const shortURL = req.params.shortURL;

  // check if login
  if (!userID) {
    console.log("not login yet, please login first");
    return res.redirect("/login");
  }

  // check if short url user id is current user
  if (urlDatabase[shortURL] && urlDatabase[shortURL].userID !== userID) {
    console.log("this url not belong your id");
    return res.redirect("/urls");
  }

  let urlItem = urlDatabase[shortURL];

  if (!urlItem) {
    console.log("no such short url in db");
    return res.redirect(404,"/urls");
  }

  const templateVars = {
    shortURL: shortURL,
    longURL: urlItem.longURL,
    user: users[req.session.user_id]
  };

  res.render("urls_show", templateVars);
});

//
//// POST update longURL associated with current shortURL
//
app.post("/urls/:id", (req, res) => {
  // get user id from cookie
  // get shortURL from req params
  const userID = req.session.user_id;
  let shortURL = req.params.id;

  // check if login
  if (!userID) {
    console.log("not login yet, please login first");
    return res.redirect("/login");
  }

  // check if short url user id is current user
  if (urlDatabase[shortURL] && urlDatabase[shortURL].userID !== userID) {
    console.log("this url not belong your id");
    return res.redirect("/urls");
  }

  // new long url input by user
  let newURL = req.body.newURL;
  urlDatabase[shortURL] = {
    longURL: newURL,
    userID: userID
  };
  res.redirect("/urls");
});
  
/////////////////////////////////////////////////////
// Delete a shortURL record in url db
// Route: "/urls/:shortURL/delete"

//
////DELETE a shortURL record in url db
//
app.get("/urls/:shortURL/delete", (req, res) => {
  // get user id from cookie
  // get shortURL from req params to delete
  const id = req.session.user_id;
  let deletItem = req.params.shortURL;

  // check if login
  if (!id) {
    console.log("not login yet, please login first");
    return res.redirect("/login");
  }

  // check if current user has access to deleting shortURL
  if (urlDatabase[deletItem] && urlDatabase[deletItem].userID !== id) {
    console.log("this url not belong your id");
    return res.redirect("/urls");
  }

  delete urlDatabase[deletItem];
  res.redirect("/urls");
});

/////////////////////////////////////////////////////
// Redirect to the long url with provided short url
// Route: "/u/:shortURL"

//
//// GET redirect to the long url with provided short url
//
app.get("/u/:shortURL", (req, res) => {
  // get short url from req params
  const short = req.params.shortURL;

  // check if this short url exists in url db
  const shortURLinDb = urlDatabase[short];
  if (!shortURLinDb) {
    return res.redirect(404, "/urls");
  }

  // get long url and redirect to the actual website
  const longURL = shortURLinDb.longURL;

  res.redirect(longURL);
});

//
////test for basic setup
//
app.get("/", (req, res) => {
  let userID = req.session.user_id;

  if (!userID) {
    return res.redirect("/login");
  }
  return res.redirect("/urls");
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});


app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

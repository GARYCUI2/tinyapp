/* eslint-disable camelcase */
/* eslint-disable func-style */
const express = require("express");
const bodyParser = require("body-parser");
const cookies = require("cookie-parser");

const PORT = 8080; // default port 8080

const app = express();
app.use(cookies());
app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine", "ejs");


//
////Generate Random String
//
function generateRandomString() {
  let result = '';
  let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let charactersLength = characters.length;
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

//
////find user by email
//
const findUserByEmail = (email) => {
  for (const userId in users) {
    const user = users[userId];
    if (user.email === email) {
      return user;
    }
  }
  return null;
};

//
////URL Database
//
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

//
////Users Database
//
const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};
//
////Login
//
app.post("/login",(req,res) => {
  const email = req.body.email;
  const password = req.body.password;
  
  const user = findUserByEmail(email);
  if (!user) {
    return res.status(403).send("a user with that email do not exist!!!");
  }

  if (user.password !== password) {
    return res.status(403).send("password wrong!!!");
  }
  
  res.cookie("user_id",user.id);
  res.redirect("/urls");

});

app.get("/login",(req,res) => {
  
  const templateVars = { urls: urlDatabase, user: null};
  
  if (req.cookies) {
    templateVars["user"] = users[req.cookies["user_id"]];
  }
  res.render("urls_login",templateVars);
});


//
////Registration
//
app.post("/register", (req, res) => {
  const newRandomId = generateRandomString();
  const newUseObj = {
    id: newRandomId,
    email: req.body.email,
    password: req.body.password
  };
  
  const email = newUseObj.email;
  const password = newUseObj.password;
  if (!email || !password) {
    return res.status(400).send("nothing input");
  }

  const user = findUserByEmail(email);
  if (!user) {
    return res.status(400).send("a user with that email do not exist!!!");
  }

  //happy path
  users[newRandomId] = newUseObj;
    
  res.cookie("user_id",newRandomId);
    
  res.redirect("/urls");
    
  
});


app.get("/register", (req, res) => {
  const templateVars = { urls: urlDatabase, user: null};
  
  if (req.cookies) {
    templateVars["user"] = users[req.cookies["user_id"]];
  }
  res.render("urls_register",templateVars);
});





// //cookies LOGIN
// app.post("/login", (req, res) => {
//   let userValue = req.body.username;
//   res.cookie("user_id",userValue);
  
//   res.redirect("/urls");
  
// });
  
  
  
//
////user logout
//
app.post("/logout", (req, res) => {
  //clear cookies
  res.clearCookie("user_id");
    
  res.redirect("/urls");
});
  
  
  
//
////update URL
//
app.post("/urls/:id", (req, res) => {
  let newURL = req.body.newURL;
    
  let shortURL = req.params.id;
  urlDatabase[shortURL] = newURL;
  
  res.redirect("/urls");
});
  
  
//
////creat new URL
//
app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: null
  };
    
  if (req.cookies) {
    templateVars["user"] = users[req.cookies["user_id"]];
  }
  res.render("urls_new", templateVars);
});
  
  
//
////DELETE
//
app.post("/urls/:shortURL/delete", (req, res) => {
  let deletItem = req.params.shortURL;
  delete urlDatabase[deletItem];
  res.redirect("/urls");
});

//
//// SHORT TO LONG URL
//
app.get("/u/:shortURL", (req, res) => {
  const short = req.params.shortURL;
  const longURL = urlDatabase[short];
  res.redirect(longURL);
});

//
////URL SERACH
//
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    user: null
  };
  
  if (req.cookies) {
    templateVars["user"] = users[req.cookies["user_id"]];
  }
  
  res.render("urls_show", templateVars);
});


//
//main urls
//
app.post("/urls", (req, res) => {
  let longValue = req.body.longURL;
  let shortRandom = generateRandomString();
  urlDatabase[shortRandom] = longValue;
  res.redirect("/urls/" + shortRandom);
  //res.send("Ok");         // Respond with 'Ok' (we will replace this)
});


app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase, user: null};
  
  if (req.cookies) {
    templateVars["user"] = users[req.cookies["user_id"]];
  }
  res.render("urls_index", templateVars);
});

//
////test for basic setup
//
app.get("/", (req, res) => {
  res.send("Hello!");
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
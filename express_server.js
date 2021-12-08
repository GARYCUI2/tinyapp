/* eslint-disable func-style */
const express = require("express");
const bodyParser = require("body-parser");
const cookies = require("cookie-parser");

const PORT = 8080; // default port 8080

const app = express();
app.use(cookies());
app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine", "ejs");

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

function generateRandomString() {
  let result = '';
  let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let charactersLength = characters.length;
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}
generateRandomString();
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase, username: null};

  if (req.cookies) {
    templateVars["username"] = req.cookies["username"];
  }
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  let longValue = req.body.longURL;
  let shortRandom = generateRandomString();
  urlDatabase[shortRandom] = longValue;
  res.redirect("/urls/" + shortRandom);
  //res.send("Ok");         // Respond with 'Ok' (we will replace this)
});

//cookies
app.post("/login", (req, res) => {
  let userValue = req.body.username;
  res.cookie("username",userValue);

  res.redirect("/urls");
  
});

//user logout
app.post("/logout", (req, res) => {
  //clear cookies
  res.clearCookie('username');

  res.redirect("/urls");
});

app.post("/urls/:shortURL/delete", (req, res) => {
  let deletItem = req.params.shortURL;
  delete urlDatabase[deletItem];
  res.redirect("/urls");
});

//update URL
app.post("/urls/:id", (req, res) => {
  let newURL = req.body.newURL;
  
  let shortURL = req.params.id;
  urlDatabase[shortURL] = newURL;
  //let updateItem = req.params.id;
  //urlDatabase[deletItem];
  res.redirect("/urls");
});


app.get("/u/:shortURL", (req, res) => {
  //console.log(req);
  const short = req.params.shortURL;
  const longURL = urlDatabase[short];
  res.redirect(longURL);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    username: null
  };

  if (req.cookies) {
    templateVars["username"] = req.cookies["username"];
  }
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    username: null
  };

  if (req.cookies) {
    templateVars["username"] = req.cookies["username"];
  }

  res.render("urls_show", templateVars);
});



app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});


app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

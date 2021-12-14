const { urlDatabase } = require("../datebase");
//
////find user in datebase by email
////return user object if found, otherwis null
//
const getUserByEmail = (email,database) => {
  for (const userId in database) {
    const user = database[userId];
    if (user.email === email) {
      return user;
    }
  }
  return null;
};

//
////Helper: Generate Random String as shortURL
//
const generateRandomString = () => {
  let result = '';
  let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let charactersLength = characters.length;
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

//
//// filter url db to return current user's urls
//// userID => urls
//
const urlsForUser = function(id) {
  const urls = {};
  for (let shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === id) {
      urls[shortURL] = urlDatabase[shortURL];
    }
  }

  return urls;
};





module.exports = {getUserByEmail, urlsForUser, generateRandomString};
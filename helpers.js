
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


module.exports = {getUserByEmail}
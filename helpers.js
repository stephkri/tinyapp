const generateRandomString = function() {
  return Math.random().toString(36).substr(2, 6);
};
const emailExists = function(object, email) {
  for (const user in object) {
    if (object[user].email === email) {
      return true;
    }
  }
  return false;
};
const urlsForUser = function(db, id) {
  let newObj = {};
  for (const url in db) {
    if (db[url].userID === id) {
      newObj[url] = db[url];
    }
  }
  return newObj;
};
const getUserByEmail = function(obj, email) {
  for (const user in obj) {
    if (obj[user].email === email) {
      return user;
    }
  }
  return null;
};
const isInUserURLs = function(obj, link) {
  for (const url in obj) {
    if (url === link) {
      return true;
    }
  }
  return false;
};

module.exports = { generateRandomString, emailExists, urlsForUser, getUserByEmail, isInUserURLs };
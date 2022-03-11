const bcrypt = require('bcrypt');

const generateRandomString = function() {
  return Math.random().toString(36).substr(2, 6);
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
const getUserIDByEmail = function(obj, email) {
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

const authenticateUser = function(db, email, plainPass) {
  for (const user in db) {
    if (db[user].email === email && bcrypt.compareSync(plainPass, db[user].password)) {
      return true;
    }
  }
  return false;
};

const generateUser = function(db, email, plainPass) {

};

module.exports = { generateRandomString, urlsForUser, getUserIDByEmail, isInUserURLs, authenticateUser, generateUser };
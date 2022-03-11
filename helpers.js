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
  console.log('Argument email: ', email);
  console.log('Argument plainpass: ', plainPass);
  console.log(db);
  for (const user in db) {
    console.log('User email: ', db[user].email);
    console.log('User pass: ', db[user].password);
    console.log(bcrypt.compareSync(plainPass, db[user].password));
    if (db[user].email === email && bcrypt.compareSync(plainPass, db[user].password)) {
      return true;
    }
  }
  return false;
};

module.exports = { generateRandomString, urlsForUser, getUserIDByEmail, isInUserURLs, authenticateUser };
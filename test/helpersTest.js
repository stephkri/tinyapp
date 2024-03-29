const { assert } = require("chai");
const bcrypt = require('bcrypt');

const { generateRandomString, urlsForUser, getUserIDByEmail, isInUserURLs, authenticateUser } = require('../helpers.js');

const testUsers = {
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

const testURLs = {
  "bz16wk": { longURL: "http://www.fender.com", userID: "7802sg" },
  "1gsd08": { longURL: "http://dophix.it", userID: "7802sg" },
  "sdagkj": { longURL: "http://www.schagerl.com", userID: "123456" },
  "89sdf7": { longURL: "http://www.youtube.com", userID: "123456"}
};

describe('getUserIDByEmail', () => {
  it('should return a user with valid email', () => {
    const user = getUserIDByEmail(testUsers, "user@example.com");
    const expectedOutput = "userRandomID";
    assert.equal(user, expectedOutput);
  });

  it('should return undefined with an invalid email', () => {
    const invalidUser = getUserIDByEmail(testUsers, "ijsdfjnbs@sjndf.com");
    assert.equal(invalidUser, undefined);
  });
});

describe('generateRandomString', () => {
  it('should return a random string with 6 characters', () => {
    const randomString = generateRandomString();
    assert.equal(randomString.length, 6);
  });
});

describe('urlsForUser', () => {
  it('should return an object with only the URLS from the specific user ID', () => {
    const userURLs = urlsForUser(testURLs, "123456");
    const expectedOutput = {
      "sdagkj": { longURL: "http://www.schagerl.com", userID: "123456" },
      "89sdf7": { longURL: "http://www.youtube.com", userID: "123456"}
    };
    assert.deepEqual(userURLs, expectedOutput);
  });
});

describe('isInUserURLs', () => {
  it('should return true if the link can be found in the object', () => {
    const userURLs = urlsForUser(testURLs, "7802sg");
    const short = "1gsd08";
    assert.equal(isInUserURLs(userURLs, short), true);
  });

  it('should return false if the link cannot be found in the object', () => {
    const userURLs = urlsForUser(testURLs, "7802sg");
    const short = "sdagkj";
    assert.equal(isInUserURLs(userURLs, short), false);
  });
});

/*
(can't figure out how to make this thing work)
describe('authenticateUser', () => {
  console.log(testUsers['userRandomID'].password);
  console.log(testUsers['user2RandomID'].password);
  const hashedPassOne = bcrypt.hashSync(testUsers['userRandomID'].password, 10);
  const hashedPassTwo = bcrypt.hashSync(testUsers['user2RandomID'].password, 10);
  console.log(hashedPassOne, hashedPassTwo);
  const authTestUsers = {
    "userRandomID": {
      id: "userRandomID",
      email: "user@example.com",
      password: hashedPassOne
    },
    "user2RandomID": {
      id: "user2RandomID",
      email: "user2@example.com",
      password: hashedPassTwo
    }
  };
  it('should return true if correct email and password are entered', () => {
    assert.isTrue(authenticateUser(authTestUsers, 'userRandomID', 'purple-monkey-dinosaur'));
  });
});
*/
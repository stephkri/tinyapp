const { assert } = require("chai");

const { generateRandomString, emailExists, urlsForUser, getUserByEmail, isInUserURLs } = require('../helpers.js');

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
}

describe('getUserByEmail', () => {
  it('should return a user with valid email', () => {
    const user = getUserByEmail(testUsers, "user@example.com");
    const expectedOutput = "userRandomID";
    assert.equal(user, expectedOutput);
  });

  it('should return undefined with an invalid email', () => {
    const invalidUser = getUserByEmail(testUsers, "ijsdfjnbs@sjndf.com");
    assert.equal(invalidUser, undefined);
  });
});

describe('emailExists', () => {
  it('should return true if the input email exists', () => {
    const doesItExist = emailExists(testUsers, "user@example.com");
    assert.equal(doesItExist, true);
  });

  it('should return false if the input email does not exist', () => {
    const doesItExist = emailExists(testUsers, "jndfsdf@dfkjnsfg.com");
    assert.equal(doesItExist, false);
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
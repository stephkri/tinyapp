const express = require('express');
const app = express();
const PORT = 8080;
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
const cookieSession = require('cookie-session');

// generateRandomString makes a 6-character alphanumeric string to use as both user ID's and short URL's
// urlsForUser looks inside the URL database and returns an object with only those URL's made by the specified user
// getUserIDByEmail looks inside the users object and returns the user ID if the email is present in the database. Returns null if there is no match
// isInUserUrls looks inside a single user's URL database and checks to see if a certain tiny URL has indeed been made by them
const { generateRandomString, urlsForUser, getUserIDByEmail, isInUserURLs, authenticateUser } = require('./helpers.js');

const hereGoBack = 'Click <a href="/urls">here</a> to go back to the database.';
const hereLogin = 'Click <a href="/login">here</a> to login.';
const hereRegister = 'Click <a href="/register">here</a> to register a new user.';
const hereLoginOrRegister = 'Click <a href="/register">here</a> to register a new user or click <a href="/login">here</a> to login as an existing user.';

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.use(cookieSession({
  name: 'session',
  keys: ['sdkfjnsdf', 'jsdfnj']
}));
app.set("view engine", "ejs");

// Database URLs; any URLs added by users will be objects, with "longURL" and "userID" keys
const urlDatabase = {};

// Object containing data of each user; for each user there will be an object with an ID, an email and a hashed password
const users = {};

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get('/', (req, res) => {
  res.send('Please go to /urls to begin using Tinyapp');
});

app.get('/urls', (req, res) => {
  const userID = req.session['user_id'];
  if (userID) {
    const user = users[userID];
    const userURLs = urlsForUser(urlDatabase, userID);
    const templateVars = {
      urls: userURLs,
      urlsZero: Object.keys(userURLs).length === 0 ? true : false,
      userID: userID,
      email: user ? user.email : null
    };
    res.render('urls_index', templateVars);
    return;
  }
  res.status(403);
  res.send('You must be logged in to view your URL database. ' + hereLoginOrRegister);
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.get('/urls/new', (req, res) => {
  const userID = req.session['user_id'];
  if (userID) {
    const user = users[userID];
    const templateVars = {
      userID: userID,
      email: user ? user.email : null
    };
    res.render("urls_new", templateVars);
    return;
  }
  res.status(403);
  res.send('You must be logged in to make a new URL. ' + hereLoginOrRegister);
});

app.get('/urls/:shortURL', (req, res) => {
  const userID = req.session['user_id'];
  const user = users[userID];
  const short = req.params.shortURL;
  const userURLs = urlsForUser(urlDatabase, userID);
  // if the link exists and has been made by the logged-in user
  if (isInUserURLs(userURLs, short)) {
    const templateVars = {
      urls: userURLs,
      shortURL: short,
      longURL: urlDatabase[short],
      userID: userID,
      email: user ? user.email : null
    };
    res.render("urls_show", templateVars);
    return;
  }
  // if the link exists, but hasn't been made by the logged-in user
  if (urlDatabase[short]) {
    res.status(403);
    res.send('This link can only be viewed by the user that created it. ' + hereGoBack);
    return;
  }
  // if the link doesn't exist
  res.status(404);
  res.send('This link does not exist in our database. ' + hereGoBack);
});

app.post('/urls', (req, res) => {
  const userID = req.session['user_id'];
  if (userID) {
    const longURL = req.body.longURL;
    // make a new ID for the soon-to-be-added URL
    const shortURL = generateRandomString();
    // add a URL to the database, as explained up top
    urlDatabase[shortURL] = {
      longURL: longURL,
      userID: userID
    };
    res.redirect(`/urls/${shortURL}`);
    return;
  }
  res.status(403);
  res.send('You must be logged in to make a new URL. ' + hereLoginOrRegister);
});

app.get('/henlo', (req, res) => {
  res.send('<html><body>henlo <b>bröther</b></body></html>');
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  if (longURL) {
    res.redirect(longURL.longURL);
    return;
  }
  res.status(404);
  res.send('This URL has not been properly registered or is not a valid URL. ' + hereGoBack);
  return;
});

app.post('/urls/:shortURL/delete', (req, res) => {
  const userID = req.session['user_id'];
  const user = users[userID];
  const longURL = urlDatabase[req.params.shortURL];
  const longID = longURL.userID;
  if (!user) {
    res.status(403);
    res.send('You must login before deleting a URL. ' + hereLogin);
    return;
  }
  // if the user is trying to delete somebody else's URL
  if (longID !== userID) {
    res.status(403);
    res.send('This URL can only be deleted by its creator. ' + hereGoBack);
    return;
  }
  // happy path
  if (longURL) {
    delete urlDatabase[req.params.shortURL];
    res.redirect('/urls');
    return;
  }
  // if there is no URL to actually delete
  res.send('Invalid URL! ' + hereGoBack);
});

// for when somebody changes the link of a short URL
app.post('/urls/:id', (req, res) => {
  const userID = req.session['user_id'];
  const shortURL = req.params.id;
  const urlID = urlDatabase[shortURL].userID;
  if (userID === urlID) {
    urlDatabase[shortURL] = {
      longURL: req.body.newURL,
      userID: userID
    };
    res.redirect('/urls');
    return;
  }
  if (userID && userID !== urlID) {
    res.status(403);
    res.send('You cannot edit this URL as you did not make it. ' + hereGoBack);
    return;
  }
  res.status(403);
  res.send('You cannot edit this as you are not logged in. ' + hereLogin);
});

app.get('/login', (req, res) => {
  const userID = req.session['user_id'];
  const user = users[userID];
  const templateVars = {
    userID: userID,
    email: user ? user.email : null
  };
  res.render("urls_login", templateVars);
});

app.post('/login', (req, res) => {
  const email = req.body.email;
  const userID = getUserIDByEmail(users, email);
  // if the email is in the database
  if (userID) {
    const hashedPassword = users[userID].password;
    // if the password is correct
    if (bcrypt.compareSync(req.body.password, hashedPassword)) {
      req.session['user_id'] = userID;
      res.redirect('/urls');
      return;
    }
    // if email exists but password is incorrect
    res.send('Invalid password. ' + hereLogin);
    return;
  }
  // if email does not exist
  res.send('Invalid username. ' + hereLoginOrRegister);
});

app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/urls');
});

app.get('/register', (req, res) => {
  const userID = req.session['user_id'];
  const user = users[userID];
  const templateVars = {
    userID: userID,
    email: user ? user.email : null
  };
  res.render("urls_register", templateVars);
});

app.post('/register', (req, res) => {
  const email = req.body.emailAddress;
  // plaintext password, then hash it
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
  const id = generateRandomString();
  // if the email already exists in the database
  if (getUserIDByEmail(users, email)) {
    res.status(403);
    res.send('The email you have provided is already in our user database. ' + hereRegister);
    return;
  }
  // if either email or password is empty
  if (email === "" || password === "") {
    res.status(403);
    res.send('Please enter an email and password. ' + hereRegister);
    return;
  }
  // if everything is good, add the user object to the main user database object
  const user = {
    id: id,
    email: email,
    password: hashedPassword
  };
  users[id] = user;
  req.session['user_id'] = user.id;
  res.redirect('/urls');
});
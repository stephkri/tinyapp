const express = require('express');
const app = express();
const PORT = 8080;
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
const cookieSession = require('cookie-session');

const { generateRandomString, emailExists, urlsForUser, getUserByEmail, isInUserURLs } = require('./helpers.js');

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

const urlDatabase = {
  'b2xVn2': 'http://www.lighthouselabs.ca',
  '9sm5xK': 'http://www.google.com'
};

const users = {};

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get('/', (req, res) => {
  res.send('henlo uwu');
});

app.get('/urls', (req, res) => {
  const userID = req.session['user_id'];
  const user = users[userID];
  const userURLs = urlsForUser(urlDatabase, userID);
  const templateVars = {
    urls: userURLs,
    urlsZero: Object.keys(userURLs).length === 0 ? true : false,
    userID: userID,
    email: user ? user.email : null
  };
  res.render('urls_index', templateVars);
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.get('/urls/new', (req, res) => {
  const userID = req.session['user_id'];
  const user = users[userID];
  const templateVars = {
    userID: userID,
    email: user ? user.email : null
  };
  res.render("urls_new", templateVars);
});

app.get('/urls/:shortURL', (req, res) => {
  const userID = req.session['user_id'];
  const user = users[userID];
  const short = req.params.shortURL;
  const userURLs = urlsForUser(urlDatabase, userID);
  if (isInUserURLs(userURLs, short)) {
    const templateVars = {
      urls: userURLs,
      shortURL: short,
      longURL: urlDatabase[short],
      userID: userID,
      email: user ? user.email : null
    };
    res.render("urls_show", templateVars);
  } else {
    res.status(403);
    res.send('This link can only be viewed by the user that created it. ' + hereGoBack);
  }
});

app.post('/urls', (req, res) => {
  const userID = req.session['user_id'];
  const longURL = req.body.longURL;
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = {
    longURL: longURL,
    userID: userID
  };
  res.redirect(`/urls/${shortURL}`);
});

app.get('/henlo', (req, res) => {
  res.send('<html><body>henlo <b>bröther</b></body></html>');
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  if (longURL.userID) {
    res.redirect(longURL.longURL);
  } else if (longURL && !longURL['user_id']) {
    res.redirect(longURL);
  } else {
    res.send('Invalid URL! ' + hereGoBack);
  }
});

app.post('/urls/:shortURL/delete', (req, res) => {
  const userID = req.session['user_id'];
  const user = users[userID];
  const longURL = urlDatabase[req.params.shortURL];
  if (!user) {
    res.status(403);
    res.send('You must login before deleting a URL. ' + hereLogin);
  }
  if (longURL) {
    delete urlDatabase[req.params.shortURL];
    res.redirect('/urls');
  } else {
    res.send('Invalid URL! ' + hereGoBack);
  }
});

app.post('/urls/:id', (req, res) => {
  const userID = req.session['user_id'];
  if (userID) {
    urlDatabase[req.params.id] = {
      longURL: req.body.newURL,
      userID: userID
    };
    res.redirect('/urls');
  } else {
    res.status(403);
    res.send('You cannot edit this as you are not logged in. ' + hereLogin);
  }
});

app.get('/login', (req, res) => {
  const userID = req.session['user_id'];
  const user = users[userID];
  const templateVars = {
    urls: urlDatabase,
    userID: userID,
    email: user ? user.email : null
  };
  res.render("urls_login", templateVars);
});

app.post('/login', (req, res) => {
  const email = req.body.email;
  const userID = getUserByEmail(users, email);
  if (userID) {
    const hashedPassword = users[userID].password;
    if (bcrypt.compareSync(req.body.password, hashedPassword)) {
      req.session['user_id'] = userID;
      res.redirect('/urls');
    } else {
      res.send('Invalid password. ' + hereLogin);
    }
  } else {
    res.send('Invalid username. ' + hereLoginOrRegister);
  }
});

app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/urls');
});

app.get('/register', (req, res) => {
  const userID = req.session['user_id'];
  const user = users[userID];
  const templateVars = {
    urls: urlDatabase,
    userID: userID,
    email: user ? user.email : null
  };
  res.render("urls_register", templateVars);
});

app.post('/register', (req, res) => {
  const email = req.body.emailAddress;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
  const id = generateRandomString();
  if (emailExists(users, email)) {
    res.status(403);
    res.send('The email you have provided is already in our user database. ' + hereRegister);
  } else if (email === "" || password === "") {
    res.status(403);
    res.send('Please enter an email and password. ' + hereRegister);
  } else {
    const user = {
      id: id,
      email: email,
      password: hashedPassword
    };
    users[id] = user;
    req.session['user_id'] = user.id;
    res.redirect('/urls');
  }
});
const express = require('express');
const app = express();
const PORT = 8080;
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const generateRandomString = function() {
 return Math.random().toString(36).substr(2, 6);
};
const emailLookup = function(object, email) {
  for (const user in object) {
    if (object[user].email === email) {
      return true;
    }
  }
  return false;
};
const passwordLookup = function(object, email, password) {
  for (const user in object) {
    if (object[user].email === email && object[user].password === password) {
      return true;
    }
  }
  return false;
};

const hereGoBack = 'Click <a href="/urls">here</a> to go back to the database.';

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
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
  console.log('Get URLs cookies', req.cookies);
  console.log('Users object:', users);
  const userID = req.cookies['user_id'];
  const user = users[userID];
  const templateVars = {
    urls: urlDatabase,
    userID,
    email: user ? user.email : null
  };
  res.render('urls_index', templateVars);
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.get('/urls/new', (req, res) => {
  const userID = req.cookies['user_id'];
  const user = users[userID];
  if (userID) {
    const templateVars = {
      userID,
      email: user ? user.email : null
    };
    res.render("urls_new", templateVars);
  } else {
    res.status(403);
    res.send('You must register and login to make a new URL. Click <a href="/login">here</a> to login.');
  }
});

app.get('/urls/:shortURL', (req, res) => {
  const userID = req.cookies['user_id'];
  const user = users[userID];
  const short = req.params.shortURL;
  const templateVars = {
    shortURL: short,
    longURL: urlDatabase[short],
    userID,
    email: user ? user.email : null
  };
  res.render("urls_show", templateVars);
});

app.post('/urls', (req, res) => {
  console.log('Post URLS cookies', req.cookies);
  console.log(users);
  const longURL = req.body.longURL;
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = longURL;
  //console.log(urlDatabase);
  res.redirect(`/urls/${shortURL}`);
});

app.get('/henlo', (req, res) => {
  res.send('<html><body>henlo <b>bröther</b></body></html>')
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  if (longURL) {
    res.redirect(longURL);
  } else {
    res.send('Invalid URL! ' + hereGoBack);
  }
});

app.post('/urls/:shortURL/delete', (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  if (longURL) {
    delete urlDatabase[req.params.shortURL];
    res.redirect('/urls');
  } else {
    res.send('Invalid URL! ' + hereGoBack);
  }
});

app.post('/urls/:id', (req, res) => {
  urlDatabase[req.params.id] = req.body.newURL;
  res.redirect('/urls');
});

app.get('/login', (req, res) => {
  const userID = req.cookies['user_id'];
  const user = users[userID];
  const templateVars = {
    urls: urlDatabase,
    userID,
    email: user ? user.email : null
  };
  res.render("urls_login", templateVars);
});

app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  let matches = 0;
  let userID = "";
  for (const user in users) {
    if (users[user].email === email && users[user].password === password) {
      matches += 1;
      userID += users[user].id;
    }
  }
  console.log(`UserID: ${userID}`);
  if (matches) {
    res.cookie('user_id', userID);
    res.redirect('/urls');
  } else {
    res.send('Invalid username or password. ' + hereGoBack);
  }
});

app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
});

app.get('/register', (req, res) => {
  console.log('Get register cookies', req.cookies);
  const userID = req.cookies['user_id'];
  const user = users[userID];
  const templateVars = {
    urls: urlDatabase,
    userID,
    email: user ? user.email : null
  };
  res.render("urls_register", templateVars);
});

app.post('/register', (req, res) => {
  console.log('Post register cookies', req.cookies);
  const email = req.body.emailAddress;
  const password = req.body.password;
  const id = generateRandomString();
  const user = {
    id,
    email,
    password
  };
  if (emailLookup(users, email)) {
    res.status(403);
    res.send('The email you have provided is already in our user database. ' + hereGoBack);
  } else if (email === "" || password === "") {
    res.status(403);
    res.send('Please enter an email and password. ' + hereGoBack);
  } else {
    users[id] = user;
    res.cookie('user_id', user.id);
    res.redirect('/urls');
  }
});
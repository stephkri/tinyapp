const express = require('express');
const app = express();
const PORT = 8080;
const bodyParser = require('body-parser');
const generateRandomString = function() {
 return Math.random().toString(36).substr(2, 6);
};

app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine", "ejs");

const urlDatabase = {
  'b2xVn2': 'http://www.lighthouselabs.ca',
  '9sm5xK': 'http://www.google.com'
};

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get('/', (req, res) => {
  res.send('henlo uwu');
});

app.get('/urls', (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render('urls_index', templateVars);
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.get('/urls/new', (req, res) => {
  res.render('urls_new');
});

app.get('/urls/:shortURL', (req, res) => {
  const short = req.params.shortURL;
  const templateVars = { shortURL: short, longURL: urlDatabase[short] };
  res.render("urls_show", templateVars);
});

app.post('/urls', (req, res) => {
  console.log(req.body);
  const longURL = req.body.longURL;
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = longURL;
  console.log(urlDatabase);
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
    res.send('Invalid URL! Click <a href="/urls">here</a> to go back to the database.');
  }
});

app.post('/urls/:shortURL/delete', (req, res) => {
  console.log("Delete something");
  const longURL = urlDatabase[req.params.shortURL];
  if (longURL) {
    delete urlDatabase[req.params.shortURL];
    console.log(urlDatabase, "object string lalala");
    res.redirect('/urls');
  } else {
    res.send('Invalid URL! Click <a href="/urls">here</a> to go back to the database.');
  }
});
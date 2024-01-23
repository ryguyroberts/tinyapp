const express = require("express");
const app = express();
const cookieParser = require('cookie-parser')
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())

// Variable Declarations (Instead of a database)
let urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// Some functions that will exist here for now
const generateRandomString = () => {
  // Might be a better way but this works.
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let randomString = "";
  for (let i = 0; i < 6; i++) {
    let char = characters.charAt(Math.floor(Math.random() * characters.length));
    randomString += char;
  }
  return randomString;
};

// Not sure if I need this anymore. But its the default get for root /
app.get("/", (req, res) => {
  res.send("Hello!");
});

// Page of all URLS
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase,
    username: req.cookies["username"],
  };
  res.render("urls_index", templateVars);
});

// Page to make new URLS
app.get("/urls/new", (req, res) => {
  const templateVars = { username: req.cookies["username"] };
  res.render("urls_new", templateVars);
});


// Page for unique shortened URLS
app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id,
    longURL: urlDatabase[req.params.id],
    username: req.cookies["username"],
  };
  res.render("urls_show", templateVars);
});

//Catch post and delete the requested URL ID
app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

//Catch new URLs being created generat random 6 digit for now
app.post("/urls", (req, res) => {
  let sixString = generateRandomString();
  urlDatabase[sixString] = req.body.longURL;
  res.redirect(`/urls/${sixString}`);
});

//Catch post and update the requested URL long value
app.post("/urls/:id", (req, res) => {
  //Quick error check
  if (urlDatabase[req.params.id]) {
    urlDatabase[req.params.id] = req.body.longURL;
    res.redirect("/urls");
  } else {
    res.status(404).send("Not Found: The specified redirect URL does not exist in the database.");
  }
});

// Catch post login and set a cookie
app.post("/login", (req, res) => {
  res.cookie("username", req.body.username);
  res.redirect("/urls"); //maybe use 'back' here
});

// Catch post logout and remove cookie for username
app.post("/logout", (req, res) => {
  res.clearCookie("username")
  res.redirect("/urls"); //maybe use 'back' here eventually
});


// Redirect if u/shorturl (Only things in "DB" of course)
app.get("/u/:id", (req, res) => {
  const redirURL = urlDatabase[req.params.id];

  // Check first with our DB var if it exists.
  if (redirURL) {
    res.redirect(redirURL);
  } else {
    res.status(404).send("Not Found: The specified redirect URL does not exist in the database.");
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


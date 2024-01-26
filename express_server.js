const express = require("express");
const methodOverride = require('method-override');
const app = express();
const cookieParser = require('cookie-session');
const PORT = 8080;
const bcrypt = require("bcryptjs");
const { findUserByEmail, generateRandomString, urlsForUser, currentTime } = require("./helpers");


// Config
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser({
  name: 'session',
  keys: ["12345679"], // Should be secret in a real app
  maxAge: 24 * 60 * 60 * 1000, // 24 hours
}));
app.use(methodOverride('_method'));

// Variable Declarations (Instead of a database)
let urlDatabase = {
  b2xVn2: {
    longURL: "http://www.lighthouselabs.ca",
    userID: "123456",
    totalVis: 0,
    uniqueVis: 0,
    created: currentTime()
  },
  i3BoGr: {
    longURL: "http://www.google.com",
    userID: "123456",
    totalVis: 0,
    uniqueVis: 0,
    created: currentTime()
  },
  i3Bodd: {
    longURL: "http://www.google.com",
    userID: "user2RandomID",
    totalVis: 0,
    uniqueVis: 0,
    created: currentTime()
  },
};
// Users with some pre-populated example
let users = {
  // Test user 1 ez creds
  "123456": {
    id: "123456",
    email: "user@example.com",
    password: bcrypt.hashSync("pass", 10)
  },
  "654321": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: bcrypt.hashSync("pass", 10),
  },
};

// UniqueVistors DB - For tracking
let visitors = {};

//Url visits DB - more intense tracking (Time, guest ID)
let urlVisits = {};

// GET routes

// If on root / Not logged in goes to login
app.get("/", (req, res) => {
  let userID = req.session.userId;
  if (users[userID]) {
    return res.redirect("/urls");
  }
  return res.redirect("/login");
});

// Page of all URLS
app.get("/urls", (req, res) => {
  let userID = req.session.userId;

  // If not logged in relevant error
  if (!users[userID]) {
    return res.status(403).send("Must be logged in to view URLs");
  }

  let passDatabase = urlDatabase;
  // If user exists URLdb becomes URL object of only users
  if (users[userID]) {
    passDatabase = urlsForUser(userID, urlDatabase);
  }

  const templateVars = {
    urls: passDatabase,
    user: users[userID],
  };
  res.render("urls_index", templateVars);
});

// Page to make new URLS
app.get("/urls/new", (req, res) => {
  let userID = req.session.userId;
  //Not logged in get out!
  if (!users[userID]) {
    return res.redirect("/login");
  }
  const templateVars = {
    user: users[userID],
  };
  return res.render("urls_new", templateVars);
});


// Page for unique shortened URLS
app.get("/urls/:id", (req, res) => {
  let userID = req.session.userId;

  // If not logged in foribidden access error
  if (!users[userID]) {
    return res.status(401).send("Must be logged in to access unique Urls");
  }

  // if that URL doesn't exists in DB.
  if (!urlDatabase[req.params.id]) {
    return res.status(400).send("That URL doesn't exist in DB");
  }

  // if link doesn't belong to user
  if (urlDatabase[req.params.id].userID !== userID) {
    return res.status(403).send("Cannot access links that don't belong to you");
  }

  const templateVars = {
    urlVisits: urlVisits,
    id: req.params.id,
    longURL: urlDatabase[req.params.id].longURL,
    user: users[userID],
    totalVis: urlDatabase[req.params.id].totalVis,
    uniqueVis: urlDatabase[req.params.id].uniqueVis,
    created: urlDatabase[req.params.id].created,
  };
  return res.render("urls_show", templateVars);
});

// Page for registration
app.get("/register", (req, res) => {
  let userID = req.session.userId;

  // redirect to URL if logged in And user exists in DB
  if (users[userID]) {
    return res.redirect("/urls");
  }
  const templateVars = {
    user: users[userID],
  };
  res.render("register", templateVars);
});

// Page for login
app.get("/login", (req, res) => {
  let userID = req.session.userId;
  // redirect to URL if logged in And user exists in DB
  if (users[userID]) {
    return res.redirect("/urls");
  }
  const templateVars = {
    user: users[userID],
  };
  return res.render("login", templateVars);
});

// Redirect if u/shorturl (Only things in "DB" of course)
app.get("/u/:id", (req, res) => {
  // Check first if ID exists in urlDB
  if (!urlDatabase[req.params.id]) {
    return res.status(400).send("Not Found: The specified redirect URL does not exist in the database.");
  }

  // Increment total visits when shortlink used everytime
  urlDatabase[req.params.id].totalVis += 1;

  // Logic for unique users (independent of login)

  //Check for unique cookie if not make one and increment specific URL.
  let uniqueCookie = req.session.unique;
  if (!uniqueCookie) {
    let visID = generateRandomString();
    req.session.unique = visID;
    //Increment URLs data base of uniqueVis and add to global visitor list.
    urlDatabase[req.params.id].uniqueVis += 1;
    visitors[visID] = [req.params.id];
  }
  
  let visID = req.session.unique;
  // Since DB goes away. If we have a visitor who doesnt exist in DB but has the right cookie make them quick
  if (!visitors[visID]) {
    visitors[visID] = [req.params.id];
    urlDatabase[req.params.id].uniqueVis += 1;
  }

  // User exists check if they've accessed it before, if not unique add.
  let idFound = visitors[visID].find(urlID => urlID === req.params.id);
  if (!idFound) {
    urlDatabase[req.params.id].uniqueVis += 1;
    visitors[visID].push(req.params.id);
  }

  // Tracking visit times
  let time = currentTime();
  // If link has never been visited create object with url ID
  if (!urlVisits[req.params.id]) {
    urlVisits[req.params.id] = {};
  }

  // If the link has been visited but not by this user add user ID.
  if (!urlVisits[req.params.id][visID]) {
    urlVisits[req.params.id][visID] = [];
  }

  // Makes it here and pushes the time
  urlVisits[req.params.id][visID].push(time);

  res.redirect(urlDatabase[req.params.id].longURL);
});

// POST Routes

//Catch new URLs being created generate random 6 digit for ID
app.post("/urls", (req, res) => {
  let userID = req.session.userId;
  // If not logged in can't make new URLS!
  if (!users[userID]) {
    return res.status(401).send("You cannot add a new URL unless you are logged in");
  }
  let sixString = generateRandomString();
  urlDatabase[sixString] = {
    longURL: req.body.longURL,
    userID: userID,
    totalVis: 0,
    uniqueVis: 0,
    created: currentTime()
  };
  return res.redirect(`/urls/${sixString}`);
});

//Catch post and update the requested URL long value
app.put("/urls/:id", (req, res) => {
  let userID = req.session.userId;
  
  // if not logged in no dice
  if (!users[userID]) {
    return res.status(401).send("Cannot update links unless signed in");
  }

  // It it doesn't exist can't update
  if (urlDatabase[req.params.id] === undefined) {
    res.status(400).send("Not Found: The specified URL does not exist in the database to update.");
  }

  // If not your URL cannot update
  if (urlDatabase[req.params.id].userID !== userID) {
    return res.status(403).send("Cannot update links that don't belong to you");
  }

  //Makes it here update the URL
  urlDatabase[req.params.id].longURL = req.body.longURL;
  res.redirect("/urls");

});

//Catch post and delete the requested URL ID
app.delete("/urls/:id/delete", (req, res) => {
  let userID = req.session.userId;

  // if not logged in no dice
  if (!users[userID]) {
    return res.status(401).send("Cannot access unique links unless signed in");
  }

  // If Id doesn't exist can't delete
  if (!urlDatabase[req.params.id]) {
    return res.status(400).send("That URL id does not exist");
  }

  // if not your URL no delete
  if (urlDatabase[req.params.id].userID !== userID) {
    return res.status(403).send("Cannot delete links that don't belong to you");
  }
  
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

// Catch post login and set a cookie
app.post("/login", (req, res) => {
  if (req.body.email.trim() === "" || req.body.password.trim() === "") {
    return res.status(400).send("Error: Cannot have empty email or password values");
  }
  //Lookup object in DB
  let user = findUserByEmail(req.body.email, users);
  if (user) {
    let id = user.id;
    // Found user check P/W
    if (bcrypt.compareSync(req.body.password, user.password)) {
      //Set user cookie & redirect
      req.session.userId = id;
      res.redirect("/urls");
    // Pw don't match
    } else {
      return res.status(400).send("Error: Password doesn't match");
    }
  // No user found error
  } else {
    return res.status(400).send("Error: That user email was not found");
  }
});

// Catch post logout and remove cookie for username
app.delete("/logout", (req, res) => {
  // Specific cookie, cause I don't want to clear uniqueuser Cookie
  req.session.userId = null;
  res.redirect("/login");
});

//Catch post register and create user in DB var
app.post("/register", (req, res) => {
  // If either email or pass empty error code.
  if (req.body.email.trim() === "" || req.body.password.trim() === "") {
    return res.status(400).send("Error: Cannot have empty email or password values");
  }

  // If you register with an email that already exists
  if (findUserByEmail(req.body.email, users)) {
    return res.status(400).send("Error: That email already exists as a user");
  }

  // If no errors gets here makes new user
  let id = generateRandomString();
  users[id] = {
    id: id,
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, 10)
  };
  req.session.userId = id;
  res.redirect("/urls");
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

module.exports = {
  urlDatabase,
};
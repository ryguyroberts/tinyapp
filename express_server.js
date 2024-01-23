const express = require("express");
const app = express();
const cookieParser = require('cookie-parser')
const PORT = 8080; // default port 8080

// Config
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())

// Variable Declarations (Instead of a database)
let urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// Users with some pre-populated example
const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
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

// find user in email object return null if no user or Obj if user.
const findUser = (email) => {
  const keyArr = Object.keys(users)
  let foundUserID = keyArr.find(id => users[id].email === email );
  if (foundUserID) {
    return users[foundUserID];
  }
  return null;
};

// Not sure if I need this anymore. But its the default get for root /
app.get("/", (req, res) => {
  res.send("Hello!");
});

// Page of all URLS
app.get("/urls", (req, res) => {
  userName = req.cookies["user_id"]
  const templateVars = { urls: urlDatabase,
    user: users[userName],
  };
  res.render("urls_index", templateVars);
});

// Page to make new URLS
app.get("/urls/new", (req, res) => {
  userName = req.cookies["user_id"];
  const templateVars = {
    user: users[userName]
  };
  res.render("urls_new", templateVars);
});


// Page for unique shortened URLS
app.get("/urls/:id", (req, res) => {
  userName = req.cookies["user_id"];
  const templateVars = { id: req.params.id,
    longURL: urlDatabase[req.params.id],
    user: users[userName],
  };
  res.render("urls_show", templateVars);
});

// Page for registration
app.get("/register", (req, res) => {
  userName = req.cookies["user_id"];
  const templateVars = { id: req.params.id,
    longURL: urlDatabase[req.params.id],
    user: users[userName],
  };
  res.render("register", templateVars);
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
    res.status(400).send("Not Found: The specified redirect URL does not exist in the database.");
  }
});

// Catch post login and set a cookie // Not correct still referencing username // Need checks here for real login.
app.post("/login", (req, res) => {
  res.cookie("username", req.body.username);
  res.redirect("/urls"); //maybe use 'back' here
});

// Catch post logout and remove cookie for username
app.post("/logout", (req, res) => {
  res.clearCookie("user_id")
  res.redirect("/urls"); //maybe use 'back' here eventually
});

//Catch post register and create user in DB var
app.post("/register", (req, res) => {
  // If either email or pass empty error code.
  if (req.body.email === "" || req.body.password === "") {
    return res.status(400).send("Error: Cannot have empty email or password values");
  }

  // If you register with an email that already exists
  if (findUser(req.body.email)) {
    return res.status(400).send("Error: That email already exists as a user");
  }

  // If no errors gets here makes new user
  let id = generateRandomString();
  users[id] = {
    id: id,
    email: req.body.email,
    password: req.body.password
  };
  res.cookie("user_id", id);
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


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
  b2xVn2: {
    longURL: "http://www.lighthouselabs.ca",
    userID: "123456"
  },
  i3BoGr: {
    longURL: "http://www.google.com",
    userID: "123456"
  },
  i3Bodd: {
    longURL: "http://www.google.com",
    userID: "user2RandomID"
  },
}
// Users with some pre-populated example
let users = {
  // Test user 1 ez creds
  "123456": {
    id: "123456",
    email: "user@example.com",
    password: "password",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};


// Some functions that will exist here for now

// Generate 6digit id
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
const findUserByEmail = (email) => {
  const keyArr = Object.keys(users)
  let foundUserID = keyArr.find(id => users[id].email === email );
  if (foundUserID) {
    return users[foundUserID];
  }
  return null;
};

// Returns an Object of ONLY the urls belonging to specific user ID
const urlsForUser = (ID) => {
  keyArr = Object.keys(urlDatabase);
  returnObj = {};
  keyArr.forEach(key => {
    if (urlDatabase[key].userID === ID) {
      returnObj[key] = {
        longURL: urlDatabase[key].longURL
      }
    }
  });
return returnObj;
};


// Check to see if user ID exists in USER DB.
const userExists = (userID) => {
  const keyArr = Object.keys(users)
  foundUser = keyArr.find(id => id === userID)
  if (foundUser) {
    return true;
  }
  return false;
}

// Not sure if I need this anymore. But its the default get for root /
app.get("/", (req, res) => {
  res.send("Hello!");
});

// Page of all URLS
app.get("/urls", (req, res) => {
  let userID = req.cookies["user_id"]

  let passDatabase = urlDatabase;
  // If user exists URLdb becomes URL object of only users
  if (userExists(userID)) {
    passDatabase = urlsForUser(userID);
  }

  const templateVars = { urls: passDatabase,
    user: users[userID],
    userReal: userExists(userID),
  };
  res.render("urls_index", templateVars);
});

// Page to make new URLS
app.get("/urls/new", (req, res) => {
  let userID = req.cookies["user_id"];
  const templateVars = {
    user: users[userID],
    userReal: userExists(userID),
  };
  return res.render("urls_new", templateVars);
});


// Page for unique shortened URLS
app.get("/urls/:id", (req, res) => {
  let userID = req.cookies["user_id"];
  // If not logged in and not in our DB can't get here
  if (!userExists(userID)) {
    return res.status(401).send("Cannot access unique links unless signed in");
  }
  // if link doesn't belong to use
  if (urlDatabase[req.params.id].userID !== userID) {
    return res.status(401).send("Cannot access links that don't belong to you");
  }

    const templateVars = { id: req.params.id,
    longURL: urlDatabase[req.params.id].longURL,
    user: users[userID],
  };
  return res.render("urls_show", templateVars);
});

// Page for registration
app.get("/register", (req, res) => {
  let userID = req.cookies["user_id"];

  // redirect to URL if logged in And user exists in DB
  if (userExists(userID)) {
    return res.redirect("/urls");
  }
  const templateVars = {
    user: users[userID],
  };
  res.render("register", templateVars);
});

// Page for login
app.get("/login", (req, res) => {
  userID = req.cookies["user_id"];
  // redirect to URL if logged in And user exists in DB
  if (userExists(userID)) {
    return res.redirect("/urls");
  }
  const templateVars = {
    user: users[userID],
  };
  res.render("login", templateVars);
});

// Redirect if u/shorturl (Only things in "DB" of course)
app.get("/u/:id", (req, res) => {
  const redirURL = urlDatabase[req.params.id].longURL;
  // Check first with our DB var if it exists.
  if (redirURL) {
    res.redirect(redirURL);
  } else {
    res.status(403).send("Not Found: The specified redirect URL does not exist in the database.");
  }
});

//Catch post and delete the requested URL ID
app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

//Catch new URLs being created generate random 6 digit for now
app.post("/urls", (req, res) => {
  userID = req.cookies["user_id"];
  if (userID) {
    let sixString = generateRandomString();
    urlDatabase[sixString] = {
      longURL: req.body.longURL,
      userID: userID
    };
    return res.redirect(`/urls/${sixString}`);
  } else {
    res.status(403).send("You cannot add a new URL unless you are logged in");
  }
});

//Catch post and update the requested URL long value
app.post("/urls/:id", (req, res) => {
  //Quick error check
  if (urlDatabase[req.params.id]) {
    urlDatabase[req.params.id].longURL = req.body.longURL;
    res.redirect("/urls");
  } else {
    res.status(400).send("Not Found: The specified redirect URL does not exist in the database.");
  }
});

// Catch post login and set a cookie 
app.post("/login", (req, res) => {
  if (req.body.email.trim() === "" || req.body.password.trim() === "") {
    return res.status(400).send("Error: Cannot have empty email or password values");
  }
  //Lookup object in DB
  let user = findUserByEmail(req.body.email)
  if (user) {
    // Found user check P/W
    if (user.password === req.body.password) {
      res.cookie("user_id", user.id);
      res.redirect("/urls"); //maybe use 'back' here
    // Pw don't match
    } else {
      return res.status(403).send("Error: Password doesn't match");
    }
  // No user found error
  } else {
    return res.status(403).send("Error: That user email was not found");
  }
});

// Catch post logout and remove cookie for username
app.post("/logout", (req, res) => {
  res.clearCookie("user_id")
  res.redirect("/login");
});

//Catch post register and create user in DB var
app.post("/register", (req, res) => {
  // If either email or pass empty error code.
  if (req.body.email.trim() === "" || req.body.password.trim() === "") {
    return res.status(400).send("Error: Cannot have empty email or password values");
  }

  // If you register with an email that already exists
  if (findUserByEmail(req.body.email)) {
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


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


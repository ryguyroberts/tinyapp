const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

// Variable Declartions (Instead of a database)
const urlDatabase = {
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
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

// Page to make new URLS
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});


// Page for unique shortened URLS
app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id] };
  res.render("urls_show", templateVars);
});

//Catch post and delete the requested URL ID
app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});


app.post("/urls", (req, res) => {
  let sixString = generateRandomString();
  urlDatabase[sixString] = req.body.longURL;
  res.redirect(`/urls/${sixString}`);
  // res.send("Ok"); // Respond with 'Ok' (we will replace this)
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


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
  const characters ='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  randomString = "";
  for (let i = 0; i < 6; i++) {
    let char =characters.charAt(Math.floor(Math.random() * characters.length));
    randomString += char;
  }
  return randomString;
};


// Not sure if I need this anymore. But its the default get for root /
app.get("/", (req, res) => {
  res.send("Hello!");
});

// Old code, was prolly just an example. 
// app.get("/urls.json", (req, res) => {
//   res.json(urlDatabase);
// });

// Page of all URLS
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
})

// Page to make new URLS
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

// Page for unique shortened URLS
app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id] };
  res.render("urls_show", templateVars);
})

app.post("/urls", (req, res) => {
  console.log(req.body); // Log the POST request body to the console
  res.send("Ok"); // Respond with 'Ok' (we will replace this)
});

// Old code, was prolly just an example. 
// app.get("/hello", (req, res) => {
//   res.send("<html><body>Hello <b>World</b></body></html>\n");
// });

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


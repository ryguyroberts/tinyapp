// Return user object if found by email. Or null if not
const findUserByEmail = (email , database) => {
  const keyArr = Object.keys(database);
  let foundUserID = keyArr.find(id => database[id].email === email);
  if (foundUserID) {
    return database[foundUserID];
  }
  return null;
};

//generate a random 6 character string
const generateRandomString = () => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let randomString = "";
  for (let i = 0; i < 6; i++) {
    let char = characters.charAt(Math.floor(Math.random() * characters.length));
    randomString += char;
  }
  return randomString;
};

// Returns an Object of ONLY the object urls belonging to specific user ID
const urlsForUser = (ID, Database) => {
  let keyArr = Object.keys(Database);
  let returnObj = {};
  keyArr.forEach(key => {
    if (Database[key].userID === ID) {
      returnObj[key] = {
        longURL: Database[key].longURL,
        totalVis: Database[key].totalVis,
        uniqueVis: Database[key].uniqueVis,
        created: Database[key].created
      };
    }
  });
  return returnObj;
};

// Returns a string with formatted date/time
const currentTime = () => {
  let currentdate = new Date();
  let datetime = currentdate.getDate() + "/"
    + (currentdate.getMonth() + 1)  + "/"
    + currentdate.getFullYear() + " @ "
    + currentdate.getHours() + ":"
    + currentdate.getMinutes() + ":"
    + currentdate.getSeconds();
  return datetime;
};

module.exports = {
  findUserByEmail,
  generateRandomString,
  urlsForUser,
  currentTime,
};
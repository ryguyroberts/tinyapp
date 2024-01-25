const findUserByEmail = (email , database) => {
  const keyArr = Object.keys(database);
  let foundUserID = keyArr.find(id => database[id].email === email);
  if (foundUserID) {
    return database[foundUserID];
  }
  return null;
};

module.exports = { findUserByEmail };
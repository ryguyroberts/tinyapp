const chai = require("chai");
const chaiHttp = require("chai-http");
const expect = chai.expect;
chai.use(chaiHttp);



describe("Post /urls route tests", () => {

  it('Should return error 401 if not logged in ', () => {
    const agent = chai.request.agent("http://localhost:8080");
    return agent.post("/urls")
      .send({ longURL: "www.google.ca"})
      .then((createRes) => {
        expect(createRes).to.have.status(401);
      });
  });
});


describe("Post /urls/:id route tests", () => {
  it('should update the id for the URL if logged in and belongs to user', () => {
    const agent = chai.request.agent("http://localhost:8080");
    return agent
      //login with real ID
      .post("/login")
      .send({ email: "user@example.com", password: "pass" })
      .then(() => {
        //Post to valid ID which is owned by logged in user
        return agent.put("/urls/b2xVn2")
          .send({ longURL: "www.wowhead.com"})
          .then((redirRes) => {
            expect(redirRes).to.redirect;
            expect(redirRes).to.redirectTo("http://localhost:8080/urls");
          });
      });
  });

  it('Should return error 401 if not logged in trying to update a URL', () => {
    const agent = chai.request.agent("http://localhost:8080");
    //Post to valid ID but not logged in
    return agent.put("/urls/b2xVn2")
      .send({ longURL: "www.wowhead.com"})
      .then((accessRes) => {
        expect(accessRes).to.have.status(401);
      });
  });
    

  it('should return error 403 if logged in but not your ID to update', () => {
    const agent = chai.request.agent("http://localhost:8080");
    return agent
      //login with real ID
      .post("/login")
      .send({ email: "user@example.com", password: "pass" })
      .then(() => {
        //Post to valid ID which is NOT owned by logged in user
        return agent.put("/urls/i3Bodd")
          .send({ longURL: "www.wowhead.com"})
          .then((accessRes) => {
            expect(accessRes).to.have.status(403);
          });
      });
  });
});


describe("Post /urls/:id/delete route tests", () => {
  
  it('Should return error 401 if not logged in trying to delete a URL', () => {
    const agent = chai.request.agent("http://localhost:8080");
    // Post to valid ID but no login.
    return agent.delete("/urls/b2xVn2/delete")
      .then((accessRes) => {
        expect(accessRes).to.have.status(401);
      });
  });


  it('should return error 403 if logged in but not your ID to delete', () => {
    const agent = chai.request.agent("http://localhost:8080");
    return agent
      //login with real ID
      .post("/login")
      .send({ email: "user@example.com", password: "pass" })
      .then(() => {
        //Post to valid ID which is NOT owned by logged in user
        return agent.delete("/urls/i3Bodd/delete")
          .then((accessRes) => {
            expect(accessRes).to.have.status(403);
          });
      });
  });
});

describe("Post /login route tests", () => {
  // If matches user redirect to URL
  it('should redirect to urls if logged in with correct creds', () => {
    const agent = chai.request.agent("http://localhost:8080");
    return agent
      //login with real ID
      .post("/login")
      .send({ email: "user@example.com", password: "pass" })
      .then((loginRes) => {
        //Expect to be redirected to URLs
        expect(loginRes).to.redirect;
        expect(loginRes).to.redirectTo("http://localhost:8080/urls");
      });
  });

  it('if it doesnt match a user email expect error 400', () => {
    const agent = chai.request.agent("http://localhost:8080");
    return agent
      //login with real ID
      .post("/login")
      .send({ email: "madeupuser.com", password: "pass" })
      .then((loginRes) => {
        //Expect to be error 400
        expect(loginRes).to.have.status(400);
      });
  });

  it('if it doesnt match a user pass expect error 400', () => {
    const agent = chai.request.agent("http://localhost:8080");
    return agent
      //login with real ID
      .post("/login")
      // real user bad pass
      .send({ email: "user@example.com", password: "badpass" })
      .then((loginRes) => {
        //Expect to be error 400
        expect(loginRes).to.have.status(400);
      });
  });
});

describe("Post /register route tests", () => {

  it('If email empty return error 400', () => {
    const agent = chai.request.agent("http://localhost:8080");
    return agent
      //register with valid pass no email
      .post("/register")
      .send({ email: "  ", password: "pass" })
      .then((loginRes) => {
        expect(loginRes).to.have.status(400);
      });
  });

  it('If password empty return error 400', () => {
    const agent = chai.request.agent("http://localhost:8080");
    return agent
      //register with valid email no pass
      .post("/register")
      .send({ email: "newuser@email.com", password: "  " })
      .then((loginRes) => {
        expect(loginRes).to.have.status(400);
      });
  });

  it('If email taken expect error 400', () => {
    const agent = chai.request.agent("http://localhost:8080");
    return agent
      //login with real ID
      .post("/register")
      .send({ email: "user@example.com", password: "pass" })
      .then((loginRes) => {
        expect(loginRes).to.have.status(400);
      });
  });
});
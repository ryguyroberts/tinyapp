const chai = require("chai");
const chaiHttp = require("chai-http");
const expect = chai.expect;
chai.use(chaiHttp);



describe("Post /urls route tests", () => {
  it('should create a new URL in DB var and redirect to its unique page if logged in', () => {
    const agent = chai.request.agent("http://localhost:8080");
    return agent
      //Step 1 login with real ID
      .post("/login")
      .send({ email: "user@example.com", password: "pass" })
      .then((loginRes) => {
        // Expect post to URLs to create new URL object and then successfull redirect to unique URL page
        return agent.post("/urls")
        .send({ longURL: "www.google.ca"})
        .then((createRes) => {
          expect(createRes).to.have.status(200);
          expect(createRes).to.redirect; 
        })
      });
  });

  it('Should return error 401 if not logged in ', () => {
    const agent = chai.request.agent("http://localhost:8080");
    return agent.post("/urls")
    .send({ longURL: "www.google.ca"})
    .then((createRes) => {
      expect(createRes).to.have.status(401);
    })
  });
});


describe("Post /urls/:id route tests", () => {
  it('should update the id for the URL if logged in and belongs to user', () => {
    const agent = chai.request.agent("http://localhost:8080");
    return agent
      //Step 1 login with real ID
      .post("/login")
      .send({ email: "user@example.com", password: "pass" })
      .then((loginRes) => {
        //Post to valid ID which is owned by logged in user
        return agent.post("/urls/b2xVn2")
        .send({ longURL: "www.wowhead.com"})
        .then((redirRes) => {
          expect(redirRes).to.redirect;
          expect(redirRes).to.redirectTo("http://localhost:8080/urls");
        })
      });
    });

  it('Should return error 401 if not logged in trying to update a URL', () => {
    const agent = chai.request.agent("http://localhost:8080");

        //Post to valid ID which is owned by logged in user
        return agent.post("/urls/b2xVn2")
        .send({ longURL: "www.wowhead.com"})
        .then((accessRes) => {
          expect(accessRes).to.have.status(401);
        })
      });
    

  // If logged in and not the owner relevant error 403
  it('should return error 403 if logged in but not your ID to update', () => {
    const agent = chai.request.agent("http://localhost:8080");
    return agent
      //Step 1 login with real ID
      .post("/login")
      .send({ email: "user@example.com", password: "pass" })
      .then((loginRes) => {
        //Post to valid ID which is NOT owned by logged in user
        return agent.post("/urls/i3Bodd")
        .send({ longURL: "www.wowhead.com"})
        .then((accessRes) => {
          expect(accessRes).to.have.status(403);
        })
      });
    });
});



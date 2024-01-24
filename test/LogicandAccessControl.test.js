const chai = require("chai");
const chaiHttp = require("chai-http");
const expect = chai.expect;

chai.use(chaiHttp);

describe("Login and Access Control Test", () => {
   

  // Behavior 1. 
  it('should redirect to login with a status code of 302 for unauthorized access to "http://localhost:38080/"', () => {
    const agent = chai.request.agent("http://localhost:8080");
    return agent
      .get("/")
      .then((res) => {
        expect(res).to.redirect;
        expect(res).to.redirectTo("http://localhost:8080/login");
      });
  });

  //Behavior 2
  it('should redirect to login with a status code of 302 for unauthorized access to "http://localhost:8080/urls/new"', () => {
    const agent = chai.request.agent("http://localhost:8080");
    return agent
      .get("/urls/new")
      .then((res) => {
        expect(res).to.redirect;
        expect(res).to.redirectTo("http://localhost:8080/login");
      });
  });

  // Behavior 3
  it('should redirect to login with a status code of 302 for unauthorized access to "http://localhost:8080/urls/b2xVn2"', () => {
    const agent = chai.request.agent("http://localhost:8080");
    return agent
      .get("/urls/b2xVn2")
      .then((res) => {
        expect(res).to.redirect;
        expect(res).to.redirectTo("http://localhost:8080/login");
      });
  });

  //Behavior 4
  it('should return status code 400 for a made up URL followed by a GET request to "http://localhost:8080/urls/madeup"', () => {
    const agent = chai.request.agent("http://localhost:8080");
    return agent
      .post("/login")
      .send({ email: "user@example.com", password: "password" })
      .then((loginRes) => {
        return agent.get("/urls/madeup").then((accessRes) => {
          expect(accessRes).to.have.status(400);
        });
      });
  });

  //behavior 5
  it('should return 403 status code for unauthorized access to "http://localhost:8080/urls/i3Bodd"', () => {
    const agent = chai.request.agent("http://localhost:8080");

    // Step 1: Login with valid credentials
    return agent
      .post("/login")
      .send({ email: "user@example.com", password: "password" })
      .then((loginRes) => {
        // Step 2: Make a GET request to a protected resource
        return agent.get("/urls/i3Bodd").then((accessRes) => {
          // Step 3: Expect the status code to be 403
          expect(accessRes).to.have.status(403);
        });
      });
  });

  it('should return 200 status code for authorized access to "http://localhost:8080/urls/i3BoGr"', () => {
    const agent = chai.request.agent("http://localhost:8080");

    // Step 1: Login with valid credentials
    return agent
      .post("/login")
      .send({ email: "user@example.com", password: "password" })
      .then((loginRes) => {
        // Step 2: Make a GET request to a protected resource
        return agent.get("/urls/i3BoGr").then((accessRes) => {
          // Step 3: Expect the status code to be 200
          expect(accessRes).to.have.status(200);
        });
      });
  });
});



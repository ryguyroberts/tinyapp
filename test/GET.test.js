const chai = require("chai");
const chaiHttp = require("chai-http");
const expect = chai.expect;

chai.use(chaiHttp);

describe("Get / route tests", () => {
  it('should redirect from / to /urls if logged in', () => {
    const agent = chai.request.agent("http://localhost:8080");
    return agent
      //Step 1 login with real ID
      .post("/login")
      .send({ email: "user@example.com", password: "pass" })
      .then((loginRes) => {
        //Step 2: expect the be redirected to /urls from /
        return agent.get("/")
        .then((redirRes) => {
          expect(redirRes).to.redirect;
          expect(redirRes).to.redirectTo("http://localhost:8080/urls");
        })
      });
  });
  it('should redirect from / to /login if not logged in', () => {
    const agent = chai.request.agent("http://localhost:8080");
    // Go to / excpect to end up at login
    return agent
      .get("/")
      .then((redirRes) => {
        expect(redirRes).to.redirect;
        expect(redirRes).to.redirectTo("http://localhost:8080/login");
      })
  });
});

describe("Get /urls route tests", () => {
  it('if logged in get request to valid urls/:id is success', () => {
    const agent = chai.request.agent("http://localhost:8080");
    return agent
      //Step 1 login with real ID
      .post("/login")
      .send({ email: "user@example.com", password: "pass" })
      .then((loginRes) => {
        //Step 2: expect the be redirected to /urls from /
        return agent.get("/urls/b2xVn2")
        .then((accessRes) => {
          expect(accessRes).to.have.status(200);
        })

      });
  });
  // Don't test this for now - Get request to delete resource
  // it('if logged in post request to valid urls/:id/delete is success', () => {
  //   const agent = chai.request.agent("http://localhost:8080");
  //   return agent
  //     //Step 1 login with real ID
  //     .post("/login")
  //     .send({ email: "user@example.com", password: "pass" })
  //     .then((loginRes) => {
  //       //Step 2: expect the be redirected to /urls from /
  //       return agent
  //         .post("/urls/b2xVn2/delete")
  //         .then((accessRes) => {
  //           expect(accessRes).to.have.status(200);
  //           // Close the agent to clean up the session
  //        })
  //     });
  // });
});



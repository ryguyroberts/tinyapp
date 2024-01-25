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


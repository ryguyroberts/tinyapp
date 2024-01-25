const chai = require("chai");
const chaiHttp = require("chai-http");
const expect = chai.expect;

chai.use(chaiHttp);

describe("Get / route tests", () => {
  it('should redirect from / to /urls if logged in', () => {
    const agent = chai.request.agent("http://localhost:8080");
    return agent
      // login with real ID
      .post("/login")
      .send({ email: "user@example.com", password: "pass" })
      .then(() => {
        // expect the be redirected to /urls from /
        return agent.get("/")
          .then((redirRes) => {
            expect(redirRes).to.redirect;
            expect(redirRes).to.redirectTo("http://localhost:8080/urls");
          });
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
      });
  });
});

describe("Get /urls route tests", () => {
  it('if logged in get request to valid /urls is success', () => {
    const agent = chai.request.agent("http://localhost:8080");
    return agent
      //login with real ID
      .post("/login")
      .send({ email: "user@example.com", password: "pass" })
      .then(() => {
        //expect the be sucess
        return agent.get("/urls")
          .then((accessRes) => {
            expect(accessRes).to.have.status(200);
          });
      });
  });
  it('if NOT logged in get request to valid urls/:id get error 403 ', () => {
    const agent = chai.request.agent("http://localhost:8080");
    // Go to /urls not logged
    return agent
      .get("/urls")
      .then((accessRes) => {
        expect(accessRes).to.have.status(403);
      });
  });
});

describe("Get /urls/new route tests", () => {
  it('if NOT logged in get request redirected to login page ', () => {
    const agent = chai.request.agent("http://localhost:8080");
    // Go to /urls/new not logged
    return agent
      .get("/urls/new")
      .then((redirRes) => {
        expect(redirRes).to.redirect;
        expect(redirRes).to.redirectTo("http://localhost:8080/login");
      });
  });
});

describe("Get /urls/:id route tests", () => {
  it('should return 200 status code for authorized access to "http://localhost:8080/urls/i3BoGr"', () => {
    const agent = chai.request.agent("http://localhost:8080");
    //Login with valid credentials
    return agent
      .post("/login")
      .send({ email: "user@example.com", password: "pass" })
      .then(() => {
        // Make a GET request to a protected resource
        return agent.get("/urls/i3BoGr").then((accessRes) => {
          expect(accessRes).to.have.status(200);
        });
      });
  });

  it('should return 400 status code if logged in but that Id isnt in DB "http://localhost:8080/urls/madeup"', () => {
    const agent = chai.request.agent("http://localhost:8080");
    // Login with valid credentials
    return agent
      .post("/login")
      .send({ email: "user@example.com", password: "pass" })
      .then(() => {
        // Make a GET request to non real resouce
        return agent.get("/urls/madeup").then((accessRes) => {
          expect(accessRes).to.have.status(400);
        });
      });
  });

  it('should return 403 status code if logged in but not the owner of "http://localhost:8080/urls/i3Bodd"', () => {
    const agent = chai.request.agent("http://localhost:8080");
    // Login with valid credentials
    return agent
      .post("/login")
      .send({ email: "user@example.com", password: "pass" })
      .then(() => {
        //Make a GET request to a protected resource
        return agent.get("/urls/i3Bodd").then((accessRes) => {
          //Expect the status code to be 403
          expect(accessRes).to.have.status(403);
        });
      });
  });

  it('should return 401 status code if not logged in for "http://localhost:8080/urls/i3BoGr"', () => {
    const agent = chai.request.agent("http://localhost:8080");
    return agent
      .get("/urls/i3BoGr").then((accessRes) => {
        //Expect the status code to be 401
        expect(accessRes).to.have.status(401);
      });
  });
});

describe("Get /u/:id route tests", () => {
  it('should return 200 status code for "http://localhost:8080/u/i3BoGr"', () => {
    const agent = chai.request.agent("http://localhost:8080");
    return agent
      //Expect this is exist in long url DB.
      .get("/u/i3BoGr").then((accessRes) => {
        expect(accessRes).to.have.status(200);
      });
  });

  it('should return 400 status code for non real link "http://localhost:8080/u/madeup"', () => {
    const agent = chai.request.agent("http://localhost:8080");
    return agent
      //Expect this to not exist in DB
      .get("/u/madeup").then((accessRes) => {
        expect(accessRes).to.have.status(400);
      });
  });
});

describe("Get /login route tests", () => {
  it('should return 302 status code if logged in and GET to "http://localhost:8080/login"', () => {
    const agent = chai.request.agent("http://localhost:8080");
    // Login with valid credentials
    return agent
      .post("/login")
      .send({ email: "user@example.com", password: "pass" })
      .then(() => {
        //Make a GET request to login expect redirected
        return agent.get("/login").then((redirRes) => {
          expect(redirRes).to.redirect;
          expect(redirRes).to.redirectTo("http://localhost:8080/urls");
        });
      });
  });
});

describe("Get /register route tests", () => {
  it('should return 302 status code if logged in and GET to "http://localhost:8080/register"', () => {
    const agent = chai.request.agent("http://localhost:8080");
    //Login with valid credentials
    return agent
      .post("/login")
      .send({ email: "user@example.com", password: "pass" })
      .then(() => {
        //Make a GET request to register expect redirected
        return agent.get("/register").then((redirRes) => {
          expect(redirRes).to.redirect;
          expect(redirRes).to.redirectTo("http://localhost:8080/urls");
        });
      });
  });
});

const jwt = require('jsonwebtoken');

const collar = require("collar.js");
require("collar.js-dev-client");
collar.enableDevtool();  // enable dev tool
const ns = collar.ns("com.collarjs.example.auth");

const authInput = ns.input("auth-required input");
const nonAuthInput = ns.input("auth-not-required input");
const output = ns.output("output");

const jwtSecret = "JWT SECRET";

var users = {
  "collarjs" : {
    username : "collarjs",
    password : "collarjs123"
  }
}

nonAuthInput
  .when("'auth' event", signal => signal.get("event") === "auth")
  .do("input validation check, or throw error", signal => {
    var username = signal.get("username");
    var password = signal.get("password");
    // throw error, if no username or password found in signal
    if (!username || !password) throw new Error("Bad request");
    // otherwise pass to next node
  })
  .do("get user from db, or throw error", signal => {
    var username = signal.get("username");

    if (!users.hasOwnProperty(username)) {
      throw new Error("Unauthorized");
    }

    return users[username];
  })
  .do("verify credential, or throw error", signal => {
    var password = signal.get("password");
    var user = signal.getResult();

    if (password != user.password) {
      throw new Error("Unauthorized");
    }

    return user;
  })
  .map("generate token, or throw error", signal => {
    var user = signal.getResult();
    var token = jwt.sign(user, jwtSecret, {
      expiresIn: "24h" // expires in 24 hours
    });
    console.log(token);
    return signal.new({
      token : token
    });
  })
  .to(output)


  // authInput
  //   .when("'greeting'")
  //   .do("authenticate")
  //   .map("prepare greeting message")
  //   .to(output)

authInput
  .when("'greeting'", signal => signal.get("event") === "greeting")
  .actuator("authenticate, or throw error", (signal, done) => {
    var token = signal.get("token");

    if (!token) throw new Error("Unauthorized");

    jwt.verify(token, jwtSecret, function(err, decoded) {
      if (err) {
        done(err);
      } else {
        done(null, decoded)
      }
    });
  })
  .map("prepare greeting message", signal => {
    var user = signal.getResult();
    return signal.new({
      greeting : "Hello, " + user.username
    })
  })
  .to(output)

module.exports = {
  login : collar.toNode(nonAuthInput, output),
  greeting : collar.toNode(authInput, output)
}

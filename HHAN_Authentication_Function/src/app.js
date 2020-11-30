const CONFIG = require("./config.json");
const AWS = require("aws-sdk");
const AmazonCognitoIdentity = require("amazon-cognito-identity-js");
const CLIENT_ID = CONFIG.CLIENT_ID;
const USER_POOL_ID = CONFIG.USER_POOL_ID;
AWS.config.update({ region: CONFIG.region });

exports.handler = (event, context, callback) => {
  const body = JSON.parse(event.body);

  var authenticationData = {
    Username: body.username,
    Password: body.password,
  };

  var authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails(
    authenticationData
  );
  var poolData = {
    UserPoolId: USER_POOL_ID,
    ClientId: CLIENT_ID,
  };
  var userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
  var userData = {
    Username: body.username,
    Pool: userPool,
  };
  var cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
  cognitoUser.authenticateUser(authenticationDetails, {
    onSuccess: function (result) {
      // var accessToken = result.getAccessToken().getJwtToken();

      // var idToken = result.idToken.jwtToken;

      callback(null, {
        headers: { "Access-Control-Allow-Origin": "*" },
        statusCode: 200,
        body: "Authentication succeeded!",
      });
    },

    onFailure: function (err) {
      callback(null, {
        headers: { "Access-Control-Allow-Origin": "*" },
        statusCode: 500,
        body: "Error: " + err,
      });
    },
  });
};

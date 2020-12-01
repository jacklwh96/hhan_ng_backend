const CONFIG = require("./config.json");
const AWS = require("aws-sdk");
const cognitoidentityserviceprovider = new AWS.CognitoIdentityServiceProvider();
const AmazonCognitoIdentity = require("amazon-cognito-identity-js");
const CLIENT_ID = CONFIG.CLIENT_TESTID;
const USER_POOL_ID = CONFIG.USER_POOL_TESTID;
const HEADER = CONFIG.HEADER;
AWS.config.update({ region: CONFIG.region });

exports.handler = (event, context, callback) => {
  const body = JSON.parse(event.body);

  const authenticationData = {
    Username: body.username,
    Password: body.password,
  };

  const authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails(
    authenticationData
  );
  const poolData = {
    UserPoolId: USER_POOL_ID,
    ClientId: CLIENT_ID,
  };
  const userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
  const userData = {
    Username: body.username,
    Pool: userPool,
  };
  const cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
  const params = { UserPoolId: USER_POOL_ID, Username: body.username };
  cognitoidentityserviceprovider.adminGetUser(params, (lookup_err, data) => {
    if (lookup_err && lookup_err.code === "UserNotFoundException") {
      callback(null, {
        headers: HEADER,
        statusCode: 400,
        body: JSON.stringify({ statusCode: 400, error: lookup_err.code }),
        isBase64Encoded: false,
      });
    } else {
      cognitoUser.authenticateUser(authenticationDetails, {
        onSuccess: (result) => {
          const accessToken = result.getAccessToken().getJwtToken();
          const idToken = result.idToken.jwtToken;

          callback(null, {
            headers: HEADER,
            statusCode: 200,
            body: JSON.stringify({
              statusCode: 200,
              accessToken: accessToken,
              idToken: idToken,
              error: "",
            }),
            isBase64Encoded: false,
          });
          return;
        },

        onFailure: (err) => {
          callback(null, {
            headers: HEADER,
            statusCode: 400,
            body: JSON.stringify({ statusCode: 400, error: err.code }),
            isBase64Encoded: false,
          });
          return;
        },
      });
    }
  });
};

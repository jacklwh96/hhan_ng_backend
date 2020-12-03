const CONFIG = require("./config.json");
const AWS = require("aws-sdk");
const CLIENT_ID = CONFIG.CLIENT_TESTID;
const USER_POOL_ID = CONFIG.USER_POOL_TESTID;
const HEADER = CONFIG.HEADER;
const cognitoidentityserviceprovider = new AWS.CognitoIdentityServiceProvider();
AWS.config.update({ region: CONFIG.region });

//Migration function receives user attributes and create an user
//with given attributes in Cognito userpool.
/**
 *
 * @param {*} event //store JSON params in POST request
 * @param {*} context
 * @param {*} callback //return JSON body as response using callback function
 */
exports.handler = (event, context, callback) => {
  const body = JSON.parse(event.body);
  const user = body.user;
  const type = body.type;

  var params = { UserPoolId: USER_POOL_ID, Username: user.username };

  params = {
    UserPoolId: USER_POOL_ID,
    Username: user.username,
    MessageAction: "SUPPRESS", //suppress the sending of an invitation to the user
    TemporaryPassword: user.password,
    UserAttributes: [
      { Name: "family_name", Value: user.firstname },
      { Name: "given_name", Value: user.lastname },
      { Name: "phone_number", Value: user.phonenum },
      { Name: "custom:ID", Value: user.id },
      { Name: "custom:ISADMIN", Value: user.isadmin },
      { Name: "custom:ORGANIZATION", Value: user.organization },
      { Name: "custom:TITLE", Value: user.title },
      { Name: "custom:DEGREE", Value: user.degree },
      { Name: "custom:ALTEMAIL", Value: user.altemail },
      { Name: "custom:WORKEMAIL", Value: user.workemail },
      { Name: "custom:XLS_UPLOAD_PRIV", Value: user.xlsuploadpriv },
      { Name: "custom:USERNAME", Value: user.username },
      { Name: "custom:PASSWORD", Value: user.password },
      // { Name: "email_verified", Value: "true" },
    ],
  };
  cognitoidentityserviceprovider.adminCreateUser(params, (err, data) => {
    if (err) {
      callback(null, {
        headers: HEADER,
        statusCode: 500,
        body: JSON.stringify({ statusCode: 500, error: err }),
        isBase64Encoded: false,
      });
      return;
    } else {
      params = {
        //ADMIN_NO_SRP_AUTH
        AuthFlow: "ADMIN_USER_PASSWORD_AUTH",
        ClientId: CLIENT_ID,
        UserPoolId: USER_POOL_ID,
        AuthParameters: {
          USERNAME: user.username,
          PASSWORD: user.password,
        },
      };

      cognitoidentityserviceprovider.adminInitiateAuth(
        params,
        (signin_err, data) => {
          if (signin_err) {
            callback(null, {
              headers: HEADER,
              statusCode: 500,
              body: JSON.stringify({ statusCode: 500, error: signin_err }),
            });
          } else {
            if (data.ChallengeName !== "NEW_PASSWORD_REQUIRED") {
              callback(null, {
                headers: HEADER,
                statusCode: 500,
                body: { statusCode: 500, error: "Unexpected challenge name" },
                isBase64Encoded: false,
              });
            }
            params = {
              ChallengeName: "NEW_PASSWORD_REQUIRED",
              ClientId: CLIENT_ID,
              UserPoolId: USER_POOL_ID,
              ChallengeResponses: {
                NEW_PASSWORD: user.password,
                USERNAME: data.ChallengeParameters.USER_ID_FOR_SRP,
              },
              Session: data.Session,
            };

            cognitoidentityserviceprovider.adminRespondToAuthChallenge(
              params,
              (err, data) => {
                if (err) {
                  callback(null, {
                    headers: HEADER,
                    statusCode: 500,
                    body: {
                      statusCode: 500,
                      error: err,
                    },
                    isBase64Encoded: false,
                  });
                } else {
                  callback(null, {
                    headers: HEADER,
                    statusCode: 200,
                    body: JSON.stringify({ statusCode: 200 }),
                    isBase64Encoded: false,
                  });
                  return;
                }
              }
            );
          }
        }
      );
    }
  });
};

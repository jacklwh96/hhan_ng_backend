const CONFIG = require("./config.json");
const AWS = require("aws-sdk");
const HEADER = CONFIG.HEADER;
const USER_POOL_ID = CONFIG.USER_POOL_TESTID;
const cognitoidentityserviceprovider = new AWS.CognitoIdentityServiceProvider();
AWS.config.update({ region: CONFIG.region });

//Edit function calls Cognito API to delete/update exisiting user
//requires an access toekn to modify users
/**
 *
 * @param {*} event //store JSON params in POST request
 * @param {*} context
 * @param {*} callback //return JSON body as response using callback function
 */
exports.handler = (event, context, callback) => {
  const body = JSON.parse(event.body);
  const type = body.type;
  const user = body.user;
  const params = {
    AccessToken: body.accesstoken,
    PreviousPassword: body.oldpassword,
    ProposedPassword: user.password,
  };

  if (type === "DELETE") {
    cognitoidentityserviceprovider.adminDeleteUser(
      { UserPoolId: USER_POOL_ID, Username: user.username },
      (err, data) => {
        if (err) {
          callback(null, {
            headers: HEADER,
            statusCode: 500,
            body: JSON.stringify({ statusCode: 500, error: err }),
            isBase64Encoded: false,
          });
          return;
        } else {
          callback(null, {
            headers: HEADER,
            statusCode: 200,
            body: JSON.stringify({ statusCode: 200, error: "" }),
            isBase64Encoded: false,
          });
          return;
        }
      }
    );
  }

  cognitoidentityserviceprovider.changePassword(params, (err, data) => {
    if (err) {
      callback(null, {
        headers: HEADER,
        statusCode: 500,
        body: JSON.stringify({ statusCode: 500, error: err }),
        isBase64Encoded: false,
      });
      return;
    } else {
      cognitoidentityserviceprovider.adminUpdateUserAttributes(
        {
          UserAttributes: [
            { Name: "family_name", Value: user.firstname },
            { Name: "given_name", Value: user.lastname },
            { Name: "phone_number", Value: user.phonenum },
            { Name: "custom:ISADMIN", Value: user.isadmin },
            { Name: "custom:ORGANIZATION", Value: user.organization },
            { Name: "custom:TITLE", Value: user.title },
            { Name: "custom:DEGREE", Value: user.degree },
            { Name: "custom:ALTEMAIL", Value: user.altemail },
            { Name: "custom:WORKEMAIL", Value: user.workemail },
            { Name: "custom:XLS_UPLOAD_PRIV", Value: user.xlsuploadpriv },
            { Name: "custom:USERNAME", Value: user.username },
            { Name: "custom:PASSWORD", Value: user.password },
          ],
          UserPoolId: USER_POOL_ID,
          Username: user.username,
        },
        (err, data) => {
          if (err) {
            callback(null, {
              headers: HEADER,
              statusCode: 500,
              body: JSON.stringify({ statusCode: 500, error: err }),
              isBase64Encoded: false,
            });
            return;
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
  });
};

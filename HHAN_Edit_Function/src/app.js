const CONFIG = require("./config.json");
const AWS = require("aws-sdk");
const HEADER = CONFIG.HEADER;
const USER_POOL_ID = CONFIG.USER_POOL_TESTID;
const cognitoidentityserviceprovider = new AWS.CognitoIdentityServiceProvider();
AWS.config.update({ region: CONFIG.region });

exports.handler = (event, context, callback) => {
  const body = JSON.parse(event.body);
  const user = body.user;

  cognitoidentityserviceprovider.adminUpdateUserAttributes(
    {
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
};

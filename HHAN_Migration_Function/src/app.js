const CONFIG = require("./config.json");
const AWS = require("aws-sdk");
const CLIENT_ID = CONFIG.CLIENT_TESTID;
const USER_POOL_ID = CONFIG.USER_POOL_TESTID;
const HEADER = CONFIG.HEADER;
const cognitoidentityserviceprovider = new AWS.CognitoIdentityServiceProvider();
AWS.config.update({ region: CONFIG.region });
exports.handler = (event, context, callback) => {
  const body = JSON.parse(event.body);
  const user = body.user;
  const type = body.type;

  //Check to see if the user exists in the User Pool using AdminGetUser()
  var params = { UserPoolId: USER_POOL_ID, Username: user.username };

  // cognitoidentityserviceprovider.adminGetUser(params, (lookup_err, data) => {
  // User does not exist in the User Pool, try to migrate

  // if (lookup_err && lookup_err.code === "UserNotFoundException") {
  //   console.log(
  //     "User does not exist in User Pool, attempting migration: " +
  //       user.username
  //   );

  //Attempt to sign in the user or verify the password with existing system
  //This is a simple demo
  // if (type == "MIGRATION") {
  // console.log("Verified user with existing system: " + user.username);

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
  // }
  //  else {
  //   //User does not exist in the existing system, so tell the app not to retry sign-in
  //   console.log(
  //     "User does not exist in User Pool and existing system: " +
  //       user.username
  //   );
  //   callback(null, {
  //     headers: { "Access-Control-Allow-Origin": "*" },
  //     statusCode: 500,
  //     body:
  //       "Internal server error: " +
  //       "User does not exist in User Pool and existing system: " +
  //       user.username,
  //   });

  //   return;
  // }
  // }
  // else {
  //   console.log("User exists in User Pool so no migration: " + user.username);
  //   callback(null, {
  //     headers: { "Access-Control-Allow-Origin": "*" },
  //     statusCode: 200,
  //     body: "User exists in User Pool so no migration:  NO_RETRY",
  //   });
  //   return;
  // }
  // });
};

// const createUser = (params, user) => {
//   cognitoidentityserviceprovider.adminCreateUser(params, (err, data) => {
//     if (err) {
//       console.log(
//         "Failed to Create migrating user in User Pool: " + user.username
//       );
//       callback(null, {
//         headers: { "Access-Control-Allow-Origin": "*" },
//         statusCode: 500,
//         body: "Failed to Create migrating user in User Pool: " + err,
//       });
//       return;
//     } else {
//       //Successfully created the migrating user in the User Pool
//       console.log(
//         "Successful AdminCreateUser for migrating user: " + user.username
//       );

//       //Now sign in the migrated user to set the permanent password and confirm the user
//       params = {
//         AuthFlow: "ADMIN_NO_SRP_AUTH",
//         ClientId: CLIENT_ID,
//         UserPoolId: USER_POOL_ID,
//         AuthParameters: {
//           USERNAME: user.username,
//           PASSWORD: user.password,
//         },
//       };

//       cognitoidentityserviceprovider.adminInitiateAuth(
//         params,
//         (signin_err, data) => {
//           if (signin_err) {
//             console.log("Failed to sign in migrated user: " + user.username);
//             console.log(signin_err, signin_err.stack);

//             callback(null, {
//               headers: { "Access-Control-Allow-Origin": "*" },
//               statusCode: 500,
//               body: "Failed to sign in migrated user: " + signin_err,
//             });
//           } else {
//             //Confirm the challenge name is NEW_PASSWORD_REQUIRED
//             if (data.ChallengeName !== "NEW_PASSWORD_REQUIRED") {
//               // unexpected challenge name - log and exit
//               console.log(
//                 "Unexpected challenge name after adminInitiateAuth (" +
//                   data.ChallengeName +
//                   "), migrating user created, but password not set"
//               );
//               callback(null, {
//                 headers: { "Access-Control-Allow-Origin": "*" },
//                 statusCode: 500,
//                 body: "Unexpected challenge name",
//               });
//             }

//             params = {
//               ChallengeName: "NEW_PASSWORD_REQUIRED",
//               ClientId: CLIENT_ID,
//               UserPoolId: USER_POOL_ID,
//               ChallengeResponses: {
//                 NEW_PASSWORD: user.password,
//                 USERNAME: data.ChallengeParameters.USER_ID_FOR_SRP,
//               },
//               Session: data.Session,
//             };
//             cognitoidentityserviceprovider.adminRespondToAuthChallenge(
//               params,
//               (err, data) => {
//                 if (err) console.log(err, err.stack);
//                 // an error occurred
//                 else {
//                   // successful response
//                   console.log(
//                     "Successful response from RespondToAuthChallenge: " +
//                       user.username
//                   );
//                   callback(null, {
//                     headers: { "Access-Control-Allow-Origin": "*" },
//                     statusCode: 200,
//                     body: user.username + " has been successfully migrated.",
//                   });
//                   // callback(null, "RETRY"); // Tell client to retry sign-in
//                   return;
//                 }
//               }
//             );
//           }
//         }
//       );
//     }
//   });
// };

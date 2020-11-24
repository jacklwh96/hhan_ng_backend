"use strict";

const CLIENT_ID = "79cbq30uthlc0nalt80t9g80i";
const USER_POOL_ID = "us-east-1_TzP4z3oCR";
const AWS = require("aws-sdk");
AWS.config.update({ region: "us-east-1" });

console.log("Loading event");

exports.handler = function (event, context, callback) {
  const body = JSON.parse(event.body);
  var username = body.username;
  var password = body.password;

  var cognitoidentityserviceprovider = new AWS.CognitoIdentityServiceProvider();

  //Check to see if the user exists in the User Pool using AdminGetUser()
  var params = { UserPoolId: USER_POOL_ID, Username: username };

  cognitoidentityserviceprovider.adminGetUser(
    params,
    function (lookup_err, data) {
      if (lookup_err && lookup_err.code === "UserNotFoundException") {
        // User does not exist in the User Pool, try to migrate
        console.log(
          "User does not exist in User Pool, attempting migration: " + username
        );

        //Attempt to sign in the user or verify the password with existing system
        //This is a simple demo
        if (username === "test@gmail.com" && password == "aA@12345678") {
          console.log("Verified user with existing system: " + username);

          //Create the user with AdminCreateUser()
          params = {
            UserPoolId: USER_POOL_ID,
            Username: username,
            MessageAction: "SUPPRESS", //suppress the sending of an invitation to the user
            TemporaryPassword: password,
            UserAttributes: [
              { Name: "name", Value: "William" },
              { Name: "email", Value: username }, //using sign-in with email, so username is email
              { Name: "email_verified", Value: "true" },
            ],
          };
          cognitoidentityserviceprovider.adminCreateUser(
            params,
            function (err, data) {
              if (err) {
                console.log(
                  "Failed to Create migrating user in User Pool: " + username
                );
                callback(err);
                return;
              } else {
                //Successfully created the migrating user in the User Pool
                console.log(
                  "Successful AdminCreateUser for migrating user: " + username
                );

                //Now sign in the migrated user to set the permanent password and confirm the user
                params = {
                  AuthFlow: "ADMIN_NO_SRP_AUTH",
                  ClientId: CLIENT_ID,
                  UserPoolId: USER_POOL_ID,
                  AuthParameters: { USERNAME: username, PASSWORD: password },
                };

                cognitoidentityserviceprovider.adminInitiateAuth(
                  params,
                  function (signin_err, data) {
                    if (signin_err) {
                      console.log(
                        "Failed to sign in migrated user: " + username
                      );
                      console.log(signin_err, signin_err.stack);
                      callback(signin_err);
                    } else {
                      //Confirm the challenge name is NEW_PASSWORD_REQUIRED
                      if (data.ChallengeName !== "NEW_PASSWORD_REQUIRED") {
                        // unexpected challenge name - log and exit
                        console.log(
                          "Unexpected challenge name after adminInitiateAuth (" +
                            data.ChallengeName +
                            "), migrating user created, but password not set"
                        );
                        callback("Unexpected challenge name");
                      }

                      params = {
                        ChallengeName: "NEW_PASSWORD_REQUIRED",
                        ClientId: CLIENT_ID,
                        UserPoolId: USER_POOL_ID,
                        ChallengeResponses: {
                          NEW_PASSWORD: password,
                          USERNAME: data.ChallengeParameters.USER_ID_FOR_SRP,
                        },
                        Session: data.Session,
                      };
                      cognitoidentityserviceprovider.adminRespondToAuthChallenge(
                        params,
                        function (err, data) {
                          if (err) console.log(err, err.stack);
                          // an error occurred
                          else {
                            // successful response
                            console.log(
                              "Successful response from RespondToAuthChallenge: " +
                                username
                            );
                            callback(null, {
                              headers: { "Access-Control-Allow-Origin": "*" },
                              statusCode: 200,
                              body: "MIGRATED",
                            });
                            // callback(null, "RETRY"); // Tell client to retry sign-in
                            return;
                          }
                        }
                      );
                    }
                  }
                );
              }
            }
          );
        } else {
          //User does not exist in the existing system, so tell the app not to retry sign-in
          console.log(
            "User does not exist in User Pool and existing system: " + username
          );
          callback(null, {
            headers: { "Access-Control-Allow-Origin": "*" },
            statusCode: 502,
            body: "NO_RETRY",
          });
          // callback(null, "NO_RETRY");

          return;
        }
      } else {
        //User exists in the User Pool, so tell the app not to retry sign-in
        console.log("User exists in User Pool so no migration: " + username);

        callback(null, {
          headers: { "Access-Control-Allow-Origin": "*" },
          statusCode: 502,
          body: "NO_RETRY",
        });
        return;
      }
    }
  );
};

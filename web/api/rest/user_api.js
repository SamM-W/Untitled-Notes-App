import { addAuthorisedHandler, addHandler, assertFieldFormat } from "./rest_api.js";
import database from "../../../backend/database.js";
import { getGoogleTokenVerify } from "../../../backend/google-auth.js";
import { invalidateToken, issueNewToken } from "../../../backend/authentication.js";
import { createUser, getUserOfGsub, getUserOfId } from "../../../backend/interface/user_database.js";

export function buildUserApi(){
    addHandler("user_exists", async function (req) {
        var failedAssertionResponse = assertFieldFormat(req.body,
            ["gsub"],
            [/^[0-9]+$/]
        );
        if (failedAssertionResponse) return failedAssertionResponse;

        var existingUser = await getUserOfGsub(req.body.gsub);
        
        return {
            status: "success",
            exists: existingUser != null,
        };
    });

    addHandler("create_new_user", async function (req) {
        var googleVerify = await getGoogleTokenVerify(req.body.jwt);
        if (!googleVerify) {
            return {
                status: "error",
                message: "invalid token",
                non_fatal_error_id: "invalid_google_token",
            };
        }

        var userData = {
            name: req.body.name,
            email: googleVerify.email,
            picture: googleVerify.picture,
            gsub: googleVerify.sub,
        }
        var failedAssertionResponse = assertFieldFormat(userData,
            ["name", "email", "picture"],
            [ /^[ a-zA-Z0-9!?:_\-]+$/, /^[a-zA-Z0-9!#$%&'*+-/=?^_`{|}~;]+@gmail.com$/, /^https:\/\/lh3\.googleusercontent\.com\/a\/[a-zA-Z0-9_=-]+$/]
        );
        if (failedAssertionResponse) return failedAssertionResponse;

        var existingUser = await getUserOfGsub(googleVerify.sub);
        if (existingUser) {
            return {
                status: "error",
                message: "user with same google account already exists",
                non_fatal_error_id: "user_exists",
            };
        }

        console.log("Creating user:", userData);

        createUser(userData.name, userData.email, userData.picture, userData.gsub);
        var newUserId = (await database.getLastInsertedRowId()).id;

        console.log("Created new user! ID:", newUserId);

        return {
            status: "success",
            message: "user created successfully",
            non_fatal_error_id: "user_created",
            token: issueNewToken(newUserId),
        };
    });

    addHandler("sign_in", async function (req) {
        var googleVerify = await getGoogleTokenVerify(req.body.jwt);
        if (!googleVerify) {
            return {
                status: "error",
                message: "invalid token",
                non_fatal_error_id: "invalid_token",
            };
        }

        var existingUser = await getUserOfGsub(googleVerify.sub);
        if (!existingUser) {
            return {
                status: "error",
                message: "user with given google account does not exist",
                non_fatal_error_id: "user_does_not_exist",
            };
        }

        return {
            status: "success",
            message: "user signed in successfully",
            token: issueNewToken(existingUser.id),
        };
    });

    addAuthorisedHandler("invalidate_current_token", function (req, userId, token) {
        invalidateToken(token);
        return {
            status: "success",
            message: "invalidated user token"
        }
    });

    addAuthorisedHandler("get_self_user_info", async function (req, userId) {
        return {
            status: "success",
            message: "fetched user data successfully",
            userData: await getUserOfId(userId)
        }
    })
};
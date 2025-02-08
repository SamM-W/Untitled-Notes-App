//Called by google after the user signs in, giving a JWT token of the info
async function onGoogleSignIn(response) {
    var jwt = response.credential;
    const responsePayload = decodeJwtResponse(jwt);
    //Store the data in session storage so it can be accessed by the create_account page
    sessionStorage.setItem("google_account_auth", JSON.stringify(responsePayload));
    sessionStorage.setItem("google_account_auth_jwt", jwt);

    console.log("Signing in");
    callApi("/api/sign_in", { jwt: jwt })
        .then((data) => {
            //Save to cookie and go to homepage
            console.log("Sign in request successful", data);
            
            document.cookie = "authToken=" + data.token + ";expires="+new Date(Date.now() + 64 * 1000 * 60 * 60 * 24).toUTCString()+";";
            
            window.location.href = "/";
        })
        .catch((error) => {
            console.log("Error in sign-in", error);
            if (error.non_fatal_error_id == "user_does_not_exist") {
                //Go to create_account, and take the session storage google data with it
                window.location.href = "/create_account";
            }
        });
}

//Access data inside the token
function decodeJwtResponse(token) {
    let base64Url = token.split('.')[1];
    let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    let jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
}
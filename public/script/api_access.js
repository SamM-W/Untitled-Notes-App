//Used to call non-authorised endpoints (mainly for signing in)
function callApi(target, body) {
    if (!body) body = {};
    return new Promise ((accept, reject) => {
        fetch(target, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        }).then((response) => {
            return response.json();
        }).then((data) => {
            if (data.status == "success") {
                accept(data);
            } else {
                reject(data);
            }
        });
    });
}

//Used to call api endpoints on the server that require a token, and send the user to login if the token wasn't valid
function callAuthorisedApi(target, body) {
    if (!body) body = {};
    return new Promise ((accept, reject) => {
        fetch(target, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        })
            .then((response) => {
                return response.json();
            })
            .then((data) => {
                if (data.status == "success") {
                    accept(data);
                } else {
                    if (data.status == "error" && data.non_fatal_error_id == "invalid_token") {
                        console.log("Invalid auth token on an authorised api request, removing and redirecting to get_auth");
                        sessionStorage.removeItem("session_user_data");
                        document.cookie = "authToken=;expires=Thu, 01 Jan 1970 00:00:00 GMT;";
                        sessionStorage.setItem("redirect_from_missing_auth", true);
                        window.location.href = "/get_auth";
                    } else {
                        reject(data);
                    }
                }
            });
    });
}
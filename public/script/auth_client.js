const tokenOfCookieString = /authToken=([^;]+)/;

var match = document.cookie.match(tokenOfCookieString);
var isLoggedIn = match != null;
var currentAuthToken = match ? match[1].trim() : null;

//System for other scripts to recive the user info if its available
window.currentUserConsumers = [];
function getCurrentUserInfo(callback) {
    if (window.currentUser) callback(window.currentUser);
    else window.currentUserConsumers.push(callback);
}

if (!isLoggedIn) {
    console.log("No auth token redirecting to get_auth");
    sessionStorage.setItem("redirect_from_missing_auth", true);
    window.location.href = "/get_auth";
} else {
    var sessionUserData = sessionStorage.getItem("session_user_data");
    if (!sessionUserData) {
        console.log("Validating session token and fetching user data");
        callAuthorisedApi("/api/get_self_user_info")
            .then((data) => {
                console.log("Fetched user info", data)
                window.currentUser = data.userData;
                for (var callback of window.currentUserConsumers) {
                    callback(window.currentUser);
                }
                sessionStorage.setItem("session_user_data", JSON.stringify(data.userData));
            })
            .catch((error) => {
                console.log("Failed to get user data", error);
            })
    } else {
        window.currentUser = JSON.parse(sessionUserData);
    }
}
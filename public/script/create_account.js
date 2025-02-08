//Retrive sign-up info from session storage
var google_account_auth = sessionStorage.getItem("google_account_auth");
var google_account_auth_jwt = sessionStorage.getItem("google_account_auth_jwt");
if (!google_account_auth || !google_account_auth_jwt) {
    //If there was no google account given go back to get one
    window.location.href = "/get_auth";
}

//Fill in details based off the google info
google_account_auth = JSON.parse(google_account_auth);

var account_name_box = document.getElementById("account_name_box");
var fullName = google_account_auth.given_name + " " + google_account_auth.family_name;
account_name_box.value = fullName;

document.getElementById("account_info_image").src = google_account_auth.picture;
document.getElementById("account_info_name").innerText = fullName;
document.getElementById("account_info_email").innerText = google_account_auth.email;

//Tooltip for if the account name is invalid
var name_invalid_tippy;
addEventListener("load", () => {
    name_invalid_tippy = tippy(
        "#account_name_box", {
            trigger: "manual",
            delay: 500,
            content: "Account name invalid!",
            theme: "light",
        }
    )[0];
});

//Check theyre valid
var account_name_validate = /^[ a-zA-Z0-9!?:_\-]+$/;
function checkInputValidity() {
    var account_name_box = document.getElementById("account_name_box");
    if (!account_name_validate.test(account_name_box.value)) {
        account_name_box.classList.add("invalid-input-value");
        name_invalid_tippy.show();
        return { isValid: false, reason: "account_name_invalid" };
    } else {
        account_name_box.classList.remove("invalid-input-value");
    }

    return { isValid: true };
}

function submitButtonClicked() {
    if (!(checkInputValidity().isValid)) return;

    var account_name_box = document.getElementById("account_name_box");
    var create_data = {
        name: account_name_box.value,
        jwt: google_account_auth_jwt,
    };
    
    console.log("Data to submit", create_data);
    callApi("/api/create_new_user", create_data)
        .then((data) => {
            console.log("User created", data);

            //Set auth to new token and go token
            document.cookie = "authToken=" + data.token + ";expires="+new Date(Date.now() + 64 * 1000 * 60 * 60 * 24).toUTCString()+";";
            window.location.href = "/";
        })
        .catch((data) => { alert("Error in creating user" + JSON.stringify(data)); });
}
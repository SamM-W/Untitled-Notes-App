if (sessionStorage.getItem("redirect_from_missing_auth")) {
    document.getElementById("missing_auth_redirect_header").style.display = "block";
    document.getElementById("initial_header").style.display = "none";
}
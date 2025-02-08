import { OAuth2Client } from "google-auth-library";

const WEB_CLIENT_ID = "72817083579-kd1gu053ehj8os6snedmut08i4dgl6md.apps.googleusercontent.com";

const client = new OAuth2Client();
export async function getGoogleTokenVerify(token) {
    var ticket;
    try {
        ticket = await client.verifyIdToken({
            idToken: token,
            audience: WEB_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        return payload;
    } catch (error) {
        console.log("Recived invalid token " + token);
        return null;
    }
}
export function decodeJwtResponse(token) {
    let base64Url = token.split('.')[1];
    let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    let jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
}
// console.log(await getGoogleTokenVerify("eyJhbGciOiJSUzI1NiIsImtsZCI6ImZhMDcyZjc1Nzg0NjQyNjE1MDg3YzcxODJjMTAxMzQxZTE4ZjdhM2EiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJhenAiOiI3MjgxNzA4MzU3OS1rZDFndTA1M2VoajhvczZzbmVkbXV0MDhpNGRnbDZtZC5hcHBzLmdvb2dsZXVzZXJjb250ZW50LmNvbSIsImF1ZCI6IjcyODE3MDgzNTc5LWtkMWd1MDUzZWhqOG9zNnNuZWRtdXQwOGk0ZGdsNm1kLmFwcHMuZ29vZ2xldXNlcmNvbnRlbnQuY29tIiwic3ViIjoiMTA3OTU2NDQzMDY0NDg1MTMyMDUzIiwiZW1haWwiOiJzYW11ZWxtYWNrYXl3ZWVkQGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJuYmYiOjE3Mzg3ODIxMjEsIm5hbWUiOiJTYW0gTWFja2F5IiwicGljdHVyZSI6Imh0dHBzOi8vbGgzLmdvb2dsZXVzZXJjb250ZW50LmNvbS9hL0FDZzhvY0pGZEMzR3d3amczQklyelNaZExqZTQxNFBTQVdsaE1id3l1RTlpOGY5NjRQSWNIXzVDWXc9czk2LWMiLCJnaXZlbl9uYW1lIjoiU2FtIiwiZmFtaWx5X25hbWUiOiJNYWNrYXkiLCJpYXQiOjE3Mzg3ODI0MjEsImV4cCI6MTczODc4NjAyMSwianRpIjoiOWEwOGRiYjkzODIxMzViNjIxOWJiMjkyZDgzNWRjOWQ0NTI5Y2NmMCJ9.VgTw5zEuNSsqpxI0Xi2-Uaellg-io4dJLupNGs4EkEX_8xzaTXHvgr45RmbSyzx2a5LmH0QYNf3h0to39rPb5jWhmq3eHQihOwuAoUOD2CpE_kpBlg5vEtfVrHuqFxnXSVbdhauLTQG39A9TrwQ5eFWfhaMTWUceeHXYeKxs_xvor1ac_icO5_WPNTxISTlKDL9-5lWlRjhcUiV0WD22Yq9HdWXu5IiguWEt8FLwdnoN5I3qRMT5zb8JlWjuitQmKRBZy8jFfMD6jnEzA4vKyebCaWl7jj_hIA7QQZ5lNJo3U5nim76z9xStWGMLP_3dapmAEveMFL8oEziSTGFXMQ"));
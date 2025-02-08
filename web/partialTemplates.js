import fs from "fs";

//System for sharing components of HTML between pages
const partialsList = fs.readdirSync("./partial");
const rebuildPartialsOnRequest = true;

function buildPartials() {
    var partials = {};
    for (var filename of partialsList) {
        partials[filename.substring(0, filename.length - ".partial.html".length)] = fs.readFileSync("./partial/" + filename).toString();
    }
    return partials;
}

var partials = buildPartials();

export function useStaticTemplates(app) {
    app.use((req, res, next) => {
        if (req.path.endsWith('.html') || req.path.endsWith('.htm') || req.path == '/') {
            const filePath = `./public${req.path}`;
            if (fs.existsSync(filePath)) {            
                if (rebuildPartialsOnRequest) partials = buildPartials();

                let body = fs.readFileSync(filePath).toString();
                for (const [key, value] of Object.entries(partials)) {
                    body = body.replaceAll('${' + key.toUpperCase() + '}', value);
                }
                res.send(body);
                return;
            }
        }
        next();
    });
}
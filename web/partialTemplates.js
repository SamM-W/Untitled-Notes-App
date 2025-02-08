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
const compileDirStatement = /(?:\${COMPILE ")([a-zA-Z0-9\/_]+)(?:"})/;
function applyJsCompiles(body) {
    var result = "";
    var remaining = body;

    while (remaining != "") {
        var nextCompileDir = compileDirStatement.exec(remaining);
        if (nextCompileDir == null) {
            result += remaining;
            break;
        }
        var statementStart = nextCompileDir.index;
        var statementEnd = statementStart + nextCompileDir[0].length;

        var targetFolder = nextCompileDir[1];
        var compiled = "";
        for (var filename of fs.readdirSync("." + targetFolder)) {
            compiled += `//COMPILE SECT : ${"." + targetFolder + "/" + filename}\n`;
            compiled += fs.readFileSync("." + targetFolder + "/" + filename);
        }
        result += remaining.substring(0, statementStart) + compiled;
        remaining = remaining.substring(statementEnd);
    }

    return result;
}

export function useStaticCompiles(app) {
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
        } else if (req.path.endsWith('.compile.js')) {
            const filePath = `./public${req.path}`;
            if (fs.existsSync(filePath)) {
                let body = fs.readFileSync(filePath).toString();
                body = applyJsCompiles(body);
                res.send(body);
                return;
            }
        }
        next();
    });
}
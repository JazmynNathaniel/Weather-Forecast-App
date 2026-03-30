const http = require("http");
const fs = require("fs");
const path = require("path");

loadEnvFile();

const PORT = process.env.PORT || 3000;
const API_KEY = process.env.OPENWEATHER_API_KEY;
const OPENWEATHER_BASE_URL = "https://api.openweathermap.org/data/2.5";
const PUBLIC_DIR = __dirname;

const CONTENT_TYPES = {
    ".css": "text/css; charset=utf-8",
    ".html": "text/html; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".json": "application/json; charset=utf-8"
};

const server = http.createServer(async (request, response) => {
    try {
        const requestUrl = new URL(request.url, `http://${request.headers.host}`);

        if (requestUrl.pathname.startsWith("/api/")) {
            await handleApiRequest(requestUrl, response);
            return;
        }

        serveStaticFile(requestUrl.pathname, response);
    } catch (error) {
        respondJson(response, 500, { message: "Internal server error." });
    }
});

server.listen(PORT, () => {
    console.log(`Weather app running at http://localhost:${PORT}`);
});

async function handleApiRequest(requestUrl, response) {
    if (!API_KEY) {
        respondJson(response, 500, {
            message: "Server is missing OPENWEATHER_API_KEY."
        });
        return;
    }

    const endpoint = requestUrl.pathname.replace("/api/", "");
    const city = requestUrl.searchParams.get("city")?.trim();

    if (!city) {
        respondJson(response, 400, { message: "City is required." });
        return;
    }

    if (!["weather", "forecast"].includes(endpoint)) {
        respondJson(response, 404, { message: "Not found." });
        return;
    }

    const upstreamUrl = new URL(`${OPENWEATHER_BASE_URL}/${endpoint}`);
    upstreamUrl.searchParams.set("q", city);
    upstreamUrl.searchParams.set("appid", API_KEY);
    upstreamUrl.searchParams.set("units", "metric");

    const upstreamResponse = await fetch(upstreamUrl);
    const payload = await upstreamResponse.text();

    response.writeHead(upstreamResponse.status, {
        "Content-Type": "application/json; charset=utf-8"
    });
    response.end(payload);
}

function serveStaticFile(requestPath, response) {
    const normalizedPath = requestPath === "/" ? "/index.html" : requestPath;
    const filePath = path.join(PUBLIC_DIR, normalizedPath);
    const resolvedPath = path.resolve(filePath);

    if (!resolvedPath.startsWith(path.resolve(PUBLIC_DIR))) {
        respondText(response, 403, "Forbidden");
        return;
    }

    fs.readFile(resolvedPath, (error, fileBuffer) => {
        if (error) {
            if (error.code === "ENOENT") {
                respondText(response, 404, "Not found");
                return;
            }

            respondText(response, 500, "Internal server error");
            return;
        }

        const extension = path.extname(resolvedPath);

        response.writeHead(200, {
            "Content-Type": CONTENT_TYPES[extension] || "application/octet-stream"
        });
        response.end(fileBuffer);
    });
}

function respondJson(response, statusCode, body) {
    response.writeHead(statusCode, {
        "Content-Type": "application/json; charset=utf-8"
    });
    response.end(JSON.stringify(body));
}

function respondText(response, statusCode, body) {
    response.writeHead(statusCode, {
        "Content-Type": "text/plain; charset=utf-8"
    });
    response.end(body);
}

function loadEnvFile() {
    const envPath = path.join(__dirname, ".env");

    if (!fs.existsSync(envPath)) {
        return;
    }

    const envFile = fs.readFileSync(envPath, "utf8");

    for (const line of envFile.split(/\r?\n/u)) {
        const trimmedLine = line.trim();

        if (!trimmedLine || trimmedLine.startsWith("#")) {
            continue;
        }

        const separatorIndex = trimmedLine.indexOf("=");

        if (separatorIndex === -1) {
            continue;
        }

        const key = trimmedLine.slice(0, separatorIndex).trim();
        const value = trimmedLine.slice(separatorIndex + 1).trim();

        if (key && process.env[key] === undefined) {
            process.env[key] = value;
        }
    }
}

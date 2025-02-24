import fs from "fs"

export function load(settings?: { path?: string, service?: "redirecter" | "api" | "admin" }) {
    // Read environment from file: .env.json
    (global as any).STAMHOOFD = JSON.parse(fs.readFileSync(settings?.path ?? ".env.json", "utf-8"))

    // Mapping out environment for dependencies that need environment variables
    process.env.NODE_ENV = STAMHOOFD.environment === "production" ? "production" : "development"

    if (settings?.service === "redirecter") {
        return
    }

    if (!STAMHOOFD.domains.registration) {
        throw new Error("Expected environment variable domains.registration")
    }

    // Database
    process.env.DB_DATABASE = STAMHOOFD.DB_DATABASE+""
    process.env.DB_HOST = STAMHOOFD.DB_HOST+""
    process.env.DB_PASS = STAMHOOFD.DB_PASS+""
    process.env.DB_USER = STAMHOOFD.DB_USER+""

    // AWS
    process.env.AWS_ACCESS_KEY_ID = STAMHOOFD.AWS_ACCESS_KEY_ID+""
    process.env.AWS_SECRET_ACCESS_KEY = STAMHOOFD.AWS_SECRET_ACCESS_KEY+""
    process.env.AWS_REGION = STAMHOOFD.AWS_REGION+""
}

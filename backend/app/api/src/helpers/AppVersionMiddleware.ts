import { EncodedResponse, Request, RequestMiddleware,ResponseMiddleware } from "@simonbackx/simple-endpoints";
import { isSimpleError, isSimpleErrors, SimpleError } from "@simonbackx/simple-errors";
import { Version } from "@stamhoofd/structures";

function getRequestIP(request: Request): string {
    let ipAddress = request.request?.socket.remoteAddress;
    if (request.headers["x-real-ip"] && typeof request.headers["x-real-ip"] == "string" && (ipAddress == "127.0.0.1" || ipAddress == "0.0.0.0")) {
        ipAddress = request.headers["x-real-ip"];
    }
    if (!ipAddress) {
        ipAddress = '?';
    }

    return ipAddress.split(":", 2)[0]
}


export const AppVersionMiddleware: ResponseMiddleware & RequestMiddleware = {
    handleRequest(request: Request) {
        if (request.method == "OPTIONS") {
            if (STAMHOOFD.environment === "development") {
                console.log(getRequestIP(request)+": "+request.method+" "+request.host+request.url)
            }
            return
        }

        console.log(getRequestIP(request)+": "+request.method+" "+request.host+request.url)

        const platform = request.headers["x-platform"];
        const version = request.getVersion()
        if (version < 128) {
            // WARNING: update caddy config for on demand certificates, because we don't want to throw errors over there!
            if (platform === "web" || platform === undefined) {
                throw new SimpleError({
                    code: "client_update_required",
                    statusCode: 400,
                    message: "Er is een noodzakelijke update beschikbaar. Herlaad de pagina en wis indien nodig de cache van jouw browser.",
                    human: "Er is een noodzakelijke update beschikbaar. Herlaad de pagina en wis indien nodig de cache van jouw browser."
                })
            } else {
                throw new SimpleError({
                    code: "client_update_required",
                    statusCode: 400,
                    message: "Er is een noodzakelijke update beschikbaar. Update de app en probeer opnieuw!",
                    human: "Er is een noodzakelijke update beschikbaar. Update de app en probeer opnieuw!"
                })
            }
        }
    },

    handleResponse(request: Request, response: EncodedResponse, error?: Error) {
        const platform = request.headers["x-platform"];

        if (platform === "android" && STAMHOOFD.LATEST_ANDROID_VERSION) {
            response.headers["X-Platform-Latest-Version"] = STAMHOOFD.LATEST_ANDROID_VERSION
        }
        if (platform === "ios" && STAMHOOFD.LATEST_IOS_VERSION) {
            response.headers["X-Platform-Latest-Version"] = STAMHOOFD.LATEST_IOS_VERSION
        }
        if (platform === "web") {
            response.headers["X-Platform-Latest-Version"] = Version
        }
        

        if (error) {
            const IP = getRequestIP(request)
            if (isSimpleError(error) || isSimpleErrors(error)) {
                if (!error.hasCode("expired_access_token")) {
                    console.error("Request with error in response:\n"+IP+": "+request.method+" "+request.host+request.url+"\n"+JSON.stringify(error))

                    request.body.then((body) => {
                        console.error(IP+": Request body was\n"+body)
                    }).catch(console.error)
                }
            } else {
                console.error("Request with internal error:\n"+IP+": "+request.method+" "+request.host+request.url)
                console.error(error)
                request.body.then((body) => {
                    console.error(IP+": Request body was\n"+body)
                }).catch(console.error)
            }
        }
    }
}
import allowOrigins from "./allowOrigins";

import { CorsOptions } from "cors";

const corsOptions : CorsOptions = {
    //@ts-ignore
    origin: (
        origin: string,
        callback: (err: Error | null, isOk?: true) => any
    ) => {
        if(allowOrigins.indexOf(origin) !== -1 || !origin){
            callback(null, true)
        }
    },
    credentials: true,
    optionsSuccessStatus: 200
}

export default corsOptions
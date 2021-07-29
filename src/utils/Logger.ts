import { configure, getLogger } from "log4js";

configure({
    appenders: {
        consoleout: { type: "console" },
    },
    categories: {
        default: { appenders: ["consoleout"], level: "debug" },
        anything: { appenders: ["consoleout"], level: "debug" }
    }
})

const logger = getLogger();

import { registerSettings } from "./scripts/settings.js";
import CONSTANTS from "./scripts/constants.js";
import Logger from "./scripts/lib/Logger.js";

/* ------------------------------------ */
/* Initialize module */
/* ------------------------------------ */
Hooks.once("init", () => {
    // Do anything once the module is ready
    // if (!game.modules.get("lib-wrapper")?.active && game.user?.isGM) {
    //     let word = "install and activate";
    //     if (game.modules.get("lib-wrapper"))
    //         word = "activate";
    //     throw Logger.error(`Requires the 'libWrapper' module. Please ${word} it.`);
    // }
    // Register custom module settings
    registerSettings();

    // initHooks();
    // Assign custom classes and constants here
    // Register custom module settings
    // registerSettings();
    // fetchParams();
    // Preload Handlebars templates
    // await preloadTemplates();
    // Register custom sheets (if any)
});
/* ------------------------------------ */
/* Setup module */
/* ------------------------------------ */
Hooks.once("setup", () => {
    // Do anything after initialization but before ready
    // setupModules();
    // setupHooks();
});
/* ------------------------------------ */
/* When ready */
/* ------------------------------------ */
Hooks.once("ready", () => {
    // if (!game.modules.get("socketLib")?.active && game.user?.isGM) {
    // 	let word = "install and activate";
    // 	if (game.modules.get("socketLib")) word = "activate";
    // 	    throw Logger.error(`Requires the 'socketLib' module. Please ${word} it.`);
    // }
    // Do anything once the module is ready
    // prepareConfigurations();
    // readyHooks();
});

/* ------------------------------------ */
/* Other Hooks */
/* ------------------------------------ */

Hooks.once("devModeReady", ({ registerPackageDebugFlag }) => {
    registerPackageDebugFlag(CONSTANTS.MODULE_ID);
});

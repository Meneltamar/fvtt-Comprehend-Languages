import CONSTANTS from "../constants.js";
import { SYSTEMS } from "../systems.js";

const SETTINGS = {
    // Client settings
    DEBUG: "debug",

    // Module Settings

    // Style settings
    //   CSS_VARIABLES: "cssVariables",

    // System Settings
    ITEM_DESCRIPTION_PROPERTY: "itemDescription",
    JOURNAL_DESCRIPTION_PROPERTY: "journalDescription",
    JOURNALPAGE_DESCRIPTION_PROPERTY: "journalPageDescription",

    // Hidden settings
    SYSTEM_FOUND: "systemFound",
    SYSTEM_NOT_FOUND_WARNING_SHOWN: "systemNotFoundWarningShown",
    SYSTEM_VERSION: "systemVersion",

    GET_DEFAULT() {
        return foundry.utils.deepClone(SETTINGS.DEFAULTS());
    },

    GET_SYSTEM_DEFAULTS() {
        return Object.fromEntries(
            Object.entries(SETTINGS.GET_DEFAULT()).filter((entry) => {
                return entry[1].system;
            }),
        );
    },

    DEFAULTS: () => ({
        [SETTINGS.ITEM_DESCRIPTION_PROPERTY]: {
            name: `${CONSTANTS.MODULE_ID}.settings.itemDescription.name`,
            hint: `${CONSTANTS.MODULE_ID}.settings.itemDescription.hint`,
            scope: "world",
            config: false,
            system: true,
            default: SYSTEMS.DATA.ITEM_DESCRIPTION_PROPERTY,
            type: String,
        },

        [SETTINGS.JOURNAL_DESCRIPTION_PROPERTY]: {
            name: `${CONSTANTS.MODULE_ID}.settings.journalDescription.name`,
            hint: `${CONSTANTS.MODULE_ID}.settings.journalDescription.hint`,
            scope: "world",
            config: false,
            system: true,
            default: SYSTEMS.DATA.JOURNAL_DESCRIPTION_PROPERTY,
            type: String,
        },

        [SETTINGS.JOURNALPAGE_DESCRIPTION_PROPERTY]: {
            name: `${CONSTANTS.MODULE_ID}.settings.journalPageDescription.title`,
            hint: `${CONSTANTS.MODULE_ID}.settings.journalPageDescription.hint`,
            scope: "world",
            config: false,
            system: true,
            default: SYSTEMS.DATA.JOURNALPAGE_DESCRIPTION_PROPERTY,
            type: String,
        },

        [SETTINGS.SYSTEM_VERSION]: {
            scope: "world",
            config: false,
            default: "0.0.0",
            type: String,
        },

        [SETTINGS.SYSTEM_FOUND]: {
            scope: "world",
            config: false,
            default: false,
            type: Boolean,
        },

        [SETTINGS.SYSTEM_NOT_FOUND_WARNING_SHOWN]: {
            scope: "world",
            config: false,
            default: false,
            type: Boolean,
        },

        // [SETTINGS.PRICE_PRESETS]: {
        //   name: `${CONSTANTS.MODULE_ID}.settings.pricePresets.title`,
        //   label: `${CONSTANTS.MODULE_ID}.settings.pricePresets.label`,
        //   hint: `${CONSTANTS.MODULE_ID}.settings.pricePresets.hint`,
        //   scope: "world",
        //   icon: "fa fa-tags",
        //   application: "price-presets",
        //   config: false,
        //   default: [],
        //   type: Array
        // },

        [SETTINGS.ENABLE]: {
            name: `${CONSTANTS.MODULE_ID}.settings.enable.title`,
            hint: `${CONSTANTS.MODULE_ID}.settings.enable.hint`,
            scope: "world",
            config: true,
            default: true,
            type: Boolean,
        },

        [SETTINGS.ADD_CONVERT]: {
            name: `${CONSTANTS.MODULE_ID}.settings.addConvert.title`,
            hint: `${CONSTANTS.MODULE_ID}.settings.addConvert.hint`,
            scope: "world",
            config: true,
            default: false,
            type: Boolean,
        },

        // [SETTINGS.IGNORE_ELECTRUM]: {
        //   name: `${CONSTANTS.MODULE_ID}.settings.ignoreElectrum.title`,
        //   hint: `${CONSTANTS.MODULE_ID}.settings.ignoreElectrum.hint`,
        //   scope: "world",
        //   config: true,
        //   default: false,
        //   type: Boolean,
        // },

        [SETTINGS.CHAT_LOG]: {
            name: `${CONSTANTS.MODULE_ID}.settings.chatLog.title`,
            hint: `${CONSTANTS.MODULE_ID}.settings.chatLog.hint`,
            scope: "world",
            config: true,
            default: false,
            type: Boolean,
        },

        [SETTINGS.DEBUG]: {
            name: `${CONSTANTS.MODULE_ID}.settings.debug.title`,
            hint: `${CONSTANTS.MODULE_ID}.settings.debug.hint`,
            scope: "client",
            config: false,
            default: false,
            type: Boolean,
        },
    }),
};

export default SETTINGS;

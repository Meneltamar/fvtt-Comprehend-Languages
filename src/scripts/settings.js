import { SelectionTranslator } from "./SelectionTranslator.js";
import CONSTANTS from "./constants.js";
import SETTINGS from "./constants/settings.js";
import { addTranslateButton } from "./lib.js";
import Logger from "./lib/Logger.js";
export const registerSettings = function () {
    game.settings.registerMenu(CONSTANTS.MODULE_ID, "resetAllSettings", {
        name: `${CONSTANTS.MODULE_ID}.setting.reset.name`,
        hint: `${CONSTANTS.MODULE_ID}.setting.reset.hint`,
        icon: "fas fa-coins",
        type: ResetSettingsDialog,
        restricted: true,
    });

    // =========================================================================

    for (let [name, data] of Object.entries(SETTINGS.GET_DEFAULT())) {
        game.settings.register(CONSTANTS.MODULE_ID, name, data);
    }

    // ==========================================================================

    game.settings.register(CONSTANTS.MODULE_ID, CONSTANTS.SETTINGS.DEEPL_TOKEN, {
        name: "DeepL Token",
        config: true,
        hint: "Insert your DeepL Token here",
        type: String,
        default: "",
        scope: "world",
    });

    game.settings.register(CONSTANTS.MODULE_ID, CONSTANTS.SETTINGS.TARGET_LANG, {
        name: "Target Language",
        config: true,
        hint: "What should your target language be",
        type: String,
        default: "DE",
        choices: {
            BG: "Bulgarian",
            CS: "Czech",
            DA: "Danish",
            DE: "German",
            EL: "Greek",
            EN: "English",
            ES: "Spanish",
            ET: "Estonian",
            FI: "Finnish",
            FR: "French",
            HU: "Hungarian",
            IT: "Italian",
            JA: "Japanese",
            LT: "Lithuanian",
            LV: "Latvian",
            NL: "Dutch",
            PL: "Polish",
            PT: "Portuguese (all Portuguese varieties mixed)",
            RO: "Romanian",
            RU: "Russian",
            SK: "Slovak",
            SL: "Slovenian",
            SV: "Swedish",
            ZH: "Chinese",
        },
        scope: "world",
    });

    game.settings.register(CONSTANTS.MODULE_ID, CONSTANTS.SETTINGS.FORMALITY, {
        name: "Formality",
        config: true,
        hint: "How formal should the translations be (if the language supports it)",
        type: String,
        default: "prefer_more",
        choices: {
            prefer_more: "Prefer more formal",
            prefer_less: "Prefer less formal",
        },
        scope: "world",
    });
    game.settings.register(CONSTANTS.MODULE_ID, CONSTANTS.SETTINGS.ICON_ONLY, {
        name: "Icon Only",
        config: true,
        hint: "If enabled the header button will show with only the icon and no text",
        type: Boolean,
        default: false,
        scope: "world",
    });
    game.settings.register(CONSTANTS.MODULE_ID, CONSTANTS.SETTINGS.IN_PLACE, {
        name: "Translate In Place (Overwriting the original)",
        config: true,
        hint: "If enabled the original document will be overwritten with the translated text. The following three settings will be ignored if this is enabled.",
        type: Boolean,
        default: false,
        scope: "world",
    });
    game.settings.register(CONSTANTS.MODULE_ID, CONSTANTS.SETTINGS.SEPARATE_FOLDER, {
        name: "Separate Folder",
        config: true,
        hint: "If enabled the translated documents & items will be put into a separate folder.",
        type: Boolean,
        default: false,
        scope: "world",
    });

    game.settings.register(CONSTANTS.MODULE_ID, CONSTANTS.SETTINGS.TRANSLATE_FOLDER_NAME, {
        name: "Translate Folder Name",
        config: true,
        hint: "If enabled together with the *Separate Folder* setting, the name of the folder will be translated as well.",
        type: Boolean,
        default: false,
        scope: "world",
    });

    game.settings.register(CONSTANTS.MODULE_ID, CONSTANTS.SETTINGS.TRANSLATE_JOURNAL_NAME, {
        name: "Translate Document Names",
        config: true,
        hint: "If enabled the names of Journals, Journal Pages and Items will be translated as well and the language prefix omitted.",
        type: Boolean,
        default: false,
        scope: "world",
    });

    // ========================================================================
    game.settings.register(CONSTANTS.MODULE_ID, "debug", {
        name: `${CONSTANTS.MODULE_ID}.setting.debug.name`,
        hint: `${CONSTANTS.MODULE_ID}.setting.debug.hint`,
        scope: "client",
        config: true,
        default: false,
        type: Boolean,
    });

    // ==============================================
    // Keybindings
    // ==============================================

    game.keybindings.register(CONSTANTS.MODULE_ID, "translate-highlighted-text", {
        name: "Translate highlighted text",
        hint: "Translate the currently selected piece of text and pop it out into a Dialog",
        editable: [{ key: "KeyT", modifiers: ["Alt"] }],
        onDown: () => {
            SelectionTranslator.translateSelectedText();
            return true;
        },
    });
    // We replace the games window registry with a proxy object so we can intercept
    // every new application window creation event.
    const handler = {
        ownKeys: (target) => {
            return Reflect.ownKeys(target).filter((app) => {
                const appId = parseInt(app);
                if (!isNaN(appId)) {
                    // TODO DO SOMETHING ??
                    return false;
                }
                return true;
            });
        },
        /**
         *
         * @param {Record<number, Application>} obj
         * @param {number} prop
         * @param {FormApplication} value
         * @returns
         */
        set: (obj, prop, value) => {
            const result = Reflect.set(obj, prop, value);
            // console.log("Intercept ui-window create", value);
            if (value && value.object) {
                if (value.object instanceof JournalEntry) {
                    addTranslateButton(value).catch((err) => console.error(err));
                }
                if (value.object instanceof Item) {
                    addTranslateButton(value).catch((err) => console.error(err));
                }
            }
            return result;
        },
    };

    ui.windows = new Proxy(ui.windows, handler); // eslint-disable-line no-undef

    console.log("Installed window interceptor", ui.windows); // eslint-disable-line no-undef
};

export async function applyDefaultSettings() {
    const settings = SETTINGS.GET_SYSTEM_DEFAULTS();
    for (const [name, data] of Object.entries(settings)) {
        await game.settings.set(CONSTANTS.MODULE_ID, name, data.default);
    }
    await game.settings.set(CONSTANTS.MODULE_ID, SETTINGS.SYSTEM_VERSION, SYSTEMS.DATA.VERSION);
    // await patchCurrencySettings();
}

export function applySystemSpecificStyles(data = false) {
    // TODO ?
}

export async function checkSystem() {
    if (!SYSTEMS.HAS_SYSTEM_SUPPORT) {
        if (game.settings.get(CONSTANTS.MODULE_ID, SETTINGS.SYSTEM_NOT_FOUND_WARNING_SHOWN)) return;

        let settingsValid = true;
        for (const [name, data] of Object.entries(SETTINGS.GET_DEFAULT())) {
            settingsValid =
                settingsValid && game.settings.get(CONSTANTS.MODULE_ID, name).length !== new data.type().length;
        }

        if (settingsValid) return;

        new Dialog({
            title: game.i18n.localize(`${CONSTANTS.MODULE_ID}.Dialog.systemfound.title`),
            content: Logger.warn(game.i18n.localize(`${CONSTANTS.MODULE_ID}.Dialog.systemfound.content`), true),
            buttons: {
                confirm: {
                    icon: '<i class="fas fa-check"></i>',
                    label: game.i18n.localize(`${CONSTANTS.MODULE_ID}.Dialog.systemfound.confirm`),
                    callback: () => {
                        applyDefaultSettings();
                    },
                },
                cancel: {
                    icon: '<i class="fas fa-times"></i>',
                    label: game.i18n.localize("No"),
                },
            },
            default: "cancel",
        }).render(true);

        return game.settings.set(CONSTANTS.MODULE_ID, SETTINGS.SYSTEM_NOT_FOUND_WARNING_SHOWN, true);
    }

    if (game.settings.get(CONSTANTS.MODULE_ID, SETTINGS.SYSTEM_FOUND) || SYSTEMS.DATA.INTEGRATION) {
        const currentVersion = game.settings.get(CONSTANTS.MODULE_ID, SETTINGS.SYSTEM_VERSION);
        const newVersion = SYSTEMS.DATA.VERSION;
        debug(`Comparing system version - Current: ${currentVersion} - New: ${newVersion}`);
        if (foundry.utils.isNewerVersion(newVersion, currentVersion)) {
            debug(`Applying system settings for ${game.system.title}`);
            await applyDefaultSettings();
        }
        return;
    }

    await game.settings.set(CONSTANTS.MODULE_ID, SETTINGS.SYSTEM_FOUND, true);

    if (game.settings.get(CONSTANTS.MODULE_ID, SETTINGS.SYSTEM_NOT_FOUND_WARNING_SHOWN)) {
        Logger.dialogWarning(game.i18n.localize(`${CONSTANTS.MODULE_ID}.Dialog.nosystemfound.content`));
    }

    return applyDefaultSettings();
}

class ResetSettingsDialog extends FormApplication {
    constructor(...args) {
        //@ts-ignore
        super(...args);
        //@ts-ignore
        return new Dialog({
            title: game.i18n.localize(`${CONSTANTS.MODULE_ID}.dialogs.resetsettings.title`),
            content:
                '<p style="margin-bottom:1rem;">' +
                game.i18n.localize(`${CONSTANTS.MODULE_ID}.dialogs.resetsettings.content`) +
                "</p>",
            buttons: {
                confirm: {
                    icon: '<i class="fas fa-check"></i>',
                    label: game.i18n.localize(`${CONSTANTS.MODULE_ID}.dialogs.resetsettings.confirm`),
                    callback: async () => {
                        const worldSettings = game.settings.storage
                            ?.get("world")
                            ?.filter((setting) => setting.key.startsWith(`${CONSTANTS.MODULE_ID}.`));
                        for (let setting of worldSettings) {
                            Logger.log(`Reset setting '${setting.key}'`);
                            await setting.delete();
                        }
                        //window.location.reload();
                    },
                },
                cancel: {
                    icon: '<i class="fas fa-times"></i>',
                    label: game.i18n.localize(`${CONSTANTS.MODULE_ID}.dialogs.resetsettings.cancel`),
                },
            },
            default: "cancel",
        });
    }
    async _updateObject(event, formData) {
        // do nothing
    }
}

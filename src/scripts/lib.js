import { ComprehendLanguagesTranslator } from "./ComprehendLanguagesTranslator";
import CONSTANTS from "./constants";
import Logger from "./lib/Logger";

export const addTranslateButton = async function (app) {
    if (!game.user.isGM) {
        return;
    }
    const documentToTranslate = app.document;

    const TIMEOUT_INTERVAL = 50; // ms
    const MAX_TIMEOUT = 1000; // ms
    // Random id to prevent collision with other modules;
    const ID = randomID(24); // eslint-disable-line no-undef
    let waitRender = Math.floor(MAX_TIMEOUT / TIMEOUT_INTERVAL);
    while (
        app._state !== Application.RENDER_STATES.RENDERED && // eslint-disable-line no-undef
        waitRender-- > 0
    ) {
        await new Promise((r) => setTimeout(r, TIMEOUT_INTERVAL));
    }
    // eslint-disable-next-line no-undef
    if (app._state !== Application.RENDER_STATES.RENDERED) {
        console.log("Timeout out waiting for app to render");
        return;
    }

    let domID = appToID(app, ID);
    if (!document.getElementById(domID)) {
        // Don't create a second link on re-renders;
        /* eslint-disable no-undef */
        // class "header-button" is for compatibility with 🦋 Monarch
        let buttonText = game.i18n.localize("Translate");
        if (game && game.settings.get(CONSTANTS.MODULE_ID, "iconOnly")) {
            buttonText = "";
        }
        const link = $(
            `<a id="${domID}" class="popout"><i class="fas fa-language" data-tooltip="${game.i18n.localize(
                "Translate",
            )}"></i>${buttonText}</a>`,
        );
        /* eslint-enable no-undef */
        link.on("click", () => {
            if (documentToTranslate instanceof JournalEntry) {
                ComprehendLanguagesTranslator.buttonTranslateJournalEntry(documentToTranslate);
            } else if (documentToTranslate instanceof Item) {
                ComprehendLanguagesTranslator.buttonTranslateItem(documentToTranslate);
            } else {
                console.error(`comprehend-languages | The document type ${documentToTranslate} is not supported!`);
            }
        });
        // eslint-disable-next-line no-undef
        app.element.find(".window-title").after(link);
        // console.log("Attached", app);
    }
};

export const appToID = function (app, ID) {
    const domID = `comprehend-languages_${ID}_${app.appId}`;
    return domID;
};

export function _split_html(input_HTML) {
    let taglist = [];
    let output_HTML = [];
    [...input_HTML].forEach(function (value, i) {
        switch (["<", ">"].indexOf(value)) {
            case -1: {
                break;
            }
            case 0:
                taglist.push(i);
                break;
            case 1:
                taglist.push(i);
        }
    });
    let even = [];
    let uneven = [];
    taglist.forEach((value, index) => {
        if (index % 2 == 0) {
            even.push(value);
        } else {
            uneven.push(value);
        }
    });
    even.forEach((start_idx, index) => {
        const end_idx = uneven[index];
        const next_start_idx = even[index + 1];
        output_HTML.push(input_HTML.slice(start_idx, end_idx + 1)); //+ 1 - start_idx));
        if (next_start_idx - end_idx < 2 || isNaN(next_start_idx)) {
        } else {
            output_HTML.push(
                input_HTML.slice(end_idx + 1, even[index + 1]), //- end_idx - 1)
            );
        }
    });
    return output_HTML;
}

/**
 *
 * @param {string} inputHTML
 * @returns {string[]}
 */
export function _split_at_p(inputHTML) {
    let outputArray = inputHTML.split("</p>");
    outputArray = outputArray
        .filter((element) => {
            return element.length > 0;
        })
        .map((element) => {
            if (element.startsWith("<p")) {
                return element + "</p>";
            } else {
                return element;
            }
        });
    return outputArray;
}

/**
 * Translate html
 * @param {string} long_html
 * @param {string} token
 * @param {string} target_lang
 * @returns {Promise<string>}
 */
export async function translate_html(long_html, token, target_lang) {
    const split_html = _split_at_p(long_html);
    let translated_html = split_html.map(async (value) => {
        return await translate_text(value, token, target_lang);
    });
    const full_string = await Promise.all(translated_html);
    return full_string.join("");
}

/**
 * Translate text
 * @param {string} text
 * @param {string} token
 * @param {string} target_lang
 * @returns {Promise<string>} Translated text
 */
export async function translate_text(text, token, target_lang) {
    const formality = await game.settings.get(CONSTANTS.MODULE_ID, CONSTANTS.SETTINGS.FORMALITY);

    let newText = text;
    newText = replaceAll(newText, `@Scene[`, `@UUID[Scene.`);
    newText = replaceAll(newText, `@Actor[`, `@UUID[Actor.`);
    newText = replaceAll(newText, `@Item[`, `@UUID[Item.`);
    newText = replaceAll(newText, `@JournalEntry[`, `@UUID[JournalEntry.`);
    newText = replaceAll(newText, `@RollTable[`, `@UUID[RollTable.`);
    newText = replaceAll(newText, `@Cards[`, `@UUID[Cards.`);
    newText = replaceAll(newText, `@Folder[`, `@UUID[Folder.`);
    newText = replaceAll(newText, `@Playlist[`, `@UUID[Playlist.`);
    newText = replaceAll(newText, `@Compendium[`, `@UUID[Compendium.`);

    let data = new URLSearchParams(
        `auth_key=${token}&text=${encodeURIComponent(
            newText,
        )}&target_lang=${target_lang}&source_lang=EN&tag_handling=html&formality=${formality}`,
    );

    let response = await fetch("https://api-free.deepl.com/v2/translate?" + data, {
        method: "GET",
    });
    if (response.status == 200) {
        // translations: [{ text: string }];
        let translation = await response.json();
        return translation.translations[0].text;
    } else if (response.status == 456) {
        throw Logger.error(
            "You have exceeded your monthly DeepL API quota. You will be able to continue translating next month. For more information, check your account on the DeepL website.",
        );
    } else if (response.status == 401 || response.status == 403) {
        throw Logger.error("Your token is invalid. Please check your DeepL Token.");
    } else {
        throw Logger.error("Unknown Error");
    }
}

export function replaceAll(string, search, replace) {
    return string.split(search).join(replace);
}

/**
 * @returns {Promise<{apiProviderToken: string;target_lang: string;makeSeparateFolder: boolean;translateInPlace: boolean;}>}
 */
export async function getTranslationSettings() {
    const apiProviderToken = game.settings.get(CONSTANTS.MODULE_ID, CONSTANTS.SETTINGS.DEEPL_TOKEN);
    const target_lang = game.settings.get(CONSTANTS.MODULE_ID, CONSTANTS.SETTINGS.TARGET_LANG);
    const makeSeparateFolder = game.settings.get(CONSTANTS.MODULE_ID, CONSTANTS.SETTINGS.SEPARATE_FOLDER);
    const translateInPlace = game.settings.get(CONSTANTS.MODULE_ID, CONSTANTS.SETTINGS.IN_PLACE);

    return {
        apiProviderToken: apiProviderToken,
        target_lang: target_lang,
        makeSeparateFolder: makeSeparateFolder,
        translateInPlace: translateInPlace,
    };
}

export async function dialogApiProviderTokenMissing() {
    let d = new Dialog({
        title: "DeepL Token missing",
        content: "<p>Error: No DeepL token found. <br> Please add a DeepL Token to your Settings</p>",
        buttons: {
            one: {
                icon: '<i class="fas fa-check"></i>',
                label: "OK",
            },
        },
        default: "one",
    });
    d.render(true);
}

/**
 *
 * @param {JournalEntry | Item} translatable The journal entry or item to translate
 * @param {string} target_lang The code nation to translate
 * @param {boolean} makeSeparateFolder
 * @returns {Promise<Folder>} The new folder found or created
 */
export async function determineFolder(translatable, target_lang, makeSeparateFolder) {
    var newFolder = null;
    if (makeSeparateFolder) {
        if (!translatable.folder) {
            return null;
        }
        let oldFolderName = translatable.folder.name;
        var newFolderName = "";
        if (game.settings.get(CONSTANTS.MODULE_ID, CONSTANTS.SETTINGS.TRANSLATE_FOLDER_NAME)) {
            newFolderName = await translate_text(
                oldFolderName,
                game.settings.get(CONSTANTS.MODULE_ID, CONSTANTS.SETTINGS.DEEPL_TOKEN),
                game.settings.get(CONSTANTS.MODULE_ID, CONSTANTS.SETTINGS.TARGET_LANG),
            );
        } else {
            newFolderName = target_lang + "_" + oldFolderName;
        }
        let folderType = translatable.folder.type;
        let existingFolder = game.folders.filter((folder) => {
            return folder.name == newFolderName && folder.type == folderType;
        });
        if (existingFolder.length == 0) {
            var newFolders = await Folder.createDocuments([
                {
                    name: newFolderName,
                    type: folderType,
                },
            ]);
            newFolder = newFolders[0];
        } else {
            newFolder = existingFolder[0];
        }
    } else {
        newFolder = translatable.folder;
    }
    return newFolder;
}

/**
 *
 * @param {JournalEntry | JournalEntryPage | Item} documentToTranslate
 * @returns {string} New name of the document
 */
export async function determineNewName(documentToTranslate) {
    const { apiProviderToken, target_lang, makeSeparateFolder } = await getTranslationSettings();
    let newName = "";
    if (game.settings.get(CONSTANTS.MODULE_ID, CONSTANTS.SETTINGS.TRANSLATE_JOURNAL_NAME)) {
        newName = await translate_text(documentToTranslate.name, apiProviderToken, target_lang);
    } else {
        if (documentToTranslate instanceof JournalEntryPage) {
            return documentToTranslate.name;
        }
        newName = target_lang + "_" + documentToTranslate.name;
        // TODO a little better ?
        //newName = documentToTranslate.name + "|" + countryCodeEmoji(target_lang);
    }
    return newName;
}

/**
 * Parses the given object as an array.
 * If the object is a string, it splits it by commas and returns an array.
 * If the object is already an array, it returns the same array.
 * If the object is neither a string nor an array, it wraps it in an array and returns it.
 * @param {string|Array|any} obj - The object to be parsed as an array.
 * @returns {Array} - The parsed array.
 */
export function parseAsArray(obj) {
    if (!obj) {
        return [];
    }
    let arr = [];
    if (typeof obj === "string" || obj instanceof String) {
        arr = obj.split(",");
    } else if (obj.constructor === Array) {
        arr = obj;
    } else {
        arr = [obj];
    }
    return arr;
}


/**
 * convert country code to corresponding flag emoji
 * @param {string} cc - country code string
 * @returns {string} flag emoji
 */
export function countryCodeEmoji(cc) {
  // country code regex
  const CC_REGEX = /^[a-z]{2}$/i;

  // flag emoji use 2 regional indicator symbols, and each symbol is 2 chars
  const FLAG_LENGTH = 4;

  // offset between uppercase ascii and regional indicator symbols
  const OFFSET = 127397;

  if (!CC_REGEX.test(cc)) {
    const type = typeof cc;
    throw Logger.error(
      `cc argument must be an ISO 3166-1 alpha-2 string, but got '${
        type === 'string' ? cc : type
      }' instead.`,
    );
  }

  const codePoints = [...cc.toUpperCase()].map(c => c.codePointAt() + OFFSET);
  return String.fromCodePoint(...codePoints);
}

/**
 * convert flag emoji to corresponding country code
 * @param {string} flag - flag emoji
 * @returns {string} country code string
 */
export function emojiCountryCode(flag) {
  // country code regex
  const CC_REGEX = /^[a-z]{2}$/i;

  // flag emoji use 2 regional indicator symbols, and each symbol is 2 chars
  const FLAG_LENGTH = 4;

  // offset between uppercase ascii and regional indicator symbols
  const OFFSET = 127397;

  if (flag.length !== FLAG_LENGTH) {
    const type = typeof flag;
    throw Logger.error(
      `flag argument must be a flag emoji, but got '${
        type === 'string' ? flag : type
      }' instead.`,
    );
  }

  const codePoints = [...flag].map(c => c.codePointAt() - OFFSET);
  return String.fromCodePoint(...codePoints);
}

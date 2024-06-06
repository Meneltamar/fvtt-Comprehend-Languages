import { Translator } from "./Translator";
import { ErrorDialog } from "../ErrorDialog";
import {
    _split_at_p,
    _split_html,
    translate_html,
    getTranslationSettings,
    dialogApiProviderTokenMissing,
    determineFolder,
    translate_text,
    determineNewName,
    parseAsArray,
} from "../lib";
import SETTINGS from "../constants/settings";
import Logger from "../lib/Logger";
import CONSTANTS from "../constants";

export class ItemTranslator extends Translator {
    /**
     *
     * @param {Item} documentToTranslate
     * @returns {Promise<void>}
     */
    async translateButton(documentToTranslate) {
        const { apiProviderToken, target_lang, makeSeparateFolder, translateInPlace } = await getTranslationSettings();
        if (!apiProviderToken) {
            dialogApiProviderTokenMissing();
        } else {
            if (!translateInPlace) {
                await this.translateAndCreateItem(documentToTranslate, apiProviderToken, target_lang, makeSeparateFolder);
            } else {
                await this.translateAndReplaceOriginal(documentToTranslate, apiProviderToken, target_lang);
            }
        }
    }

    /**
     *
     * @param {Item} documentToTranslate
     * @param {string} token
     * @param {string} target_lang
     * @returns {Promise<void>}
     */
    async translateAndReplaceOriginal(documentToTranslate, token, target_lang) {
        // Not every system has the "description" property on system item
        const fieldsToTranslateValue = game.settings.get(CONSTANTS.MODULE_ID, SETTINGS.ITEM_DESCRIPTION_PROPERTY);
        const fieldsToTranslate = parseAsArray(fieldsToTranslateValue);
        if (fieldsToTranslate?.length > 0) {
            let objExpanded = {};
            for (const fieldToTranslate of fieldsToTranslate) {
                Logger.debug(`Translate in place on the item ${documentToTranslate.name} field ${fieldToTranslate}`);
                if (foundry.utils.hasProperty(documentToTranslate, fieldToTranslate)) {
                    const textToTranslate = foundry.utils.getProperty(documentToTranslate, fieldToTranslate);
                    if (textToTranslate) {
                        const newDescriptionText = await translate_html(
                            documentToTranslate.system.description.value,
                            token,
                            target_lang,
                        ).catch((e) => {
                            new ErrorDialog(e.message);
                        });
                        if (!newDescriptionText) {
                            // DO NOTHING
                            Logger.warn(
                                `Nothing translated on the item ${documentToTranslate.name} field ${fieldToTranslate}`,
                            );
                        } else {
                            const objFlat = {};
                            foundry.utils.setProperty(objFlat, fieldToTranslate, newDescriptionText);
                            foundry.utils.mergeObject(objExpanded, objFlat);
                        }
                    } else {
                        // DO NOTHING
                        Logger.warn(
                            `Nothing to translate on the item ${documentToTranslate.name} field ${fieldToTranslate}`,
                        );
                    }
                } else {
                    // DO NOTHING
                    Logger.warn(`No field ${fieldToTranslate} on the item ${documentToTranslate.name}`);
                }
            }

            // documentToTranslate.update({
            //     system: { description: { value: newDescriptionText } },
            // });
            objExpanded = foundry.utils.expandObject(objExpanded);
            await documentToTranslate.update(objExpanded);
        } else {
            Logger.warn(`Nothing to translate on the item ${documentToTranslate.name}`);
        }
    }

    /**
     *
     * @param {Item} documentToTranslate
     * @param {string} token
     * @param {string} target_lang
     * @param {boolean} makeSeparateFolder
     * @returns {Promise<void>}
     */
    async translateAndCreateItem(documentToTranslate, token, target_lang, makeSeparateFolder) {
        let newName = await determineNewName(documentToTranslate);
        const newFolder = await determineFolder(documentToTranslate, target_lang, makeSeparateFolder);
        const newItems = await Item.createDocuments([
            {
                ...documentToTranslate,
                name: newName,
                folder: newFolder,
                type: documentToTranslate.type,
            },
        ]);
        if (!newItems || newItems.length <= 0) {
            //
        }
        // Not every system has the "description" property on system item
        const fieldsToTranslateValue = game.settings.get(CONSTANTS.MODULE_ID, SETTINGS.ITEM_DESCRIPTION_PROPERTY);
        const fieldsToTranslate = parseAsArray(fieldsToTranslateValue);
        if (fieldsToTranslate?.length > 0) {
            let objExpanded = {};
            for (const fieldToTranslate of fieldsToTranslate) {
                Logger.debug(
                    `Translate not in place on the item ${documentToTranslate.name} field ${fieldToTranslate}`,
                );
                if (foundry.utils.hasProperty(documentToTranslate, fieldToTranslate)) {
                    const textToTranslate = foundry.utils.getProperty(documentToTranslate, fieldToTranslate);
                    if (textToTranslate) {
                        const newDescriptionText = await translate_html(textToTranslate, token, target_lang).catch(
                            (e) => {
                                new ErrorDialog(e.message);
                            },
                        );
                        if (!newDescriptionText) {
                            // DO NOTHING
                            Logger.warn(
                                `Nothing translated on the item ${documentToTranslate.name} field ${fieldToTranslate}`,
                            );
                        } else {
                            const objFlat = {};
                            foundry.utils.setProperty(objFlat, fieldToTranslate, newDescriptionText);
                            foundry.utils.mergeObject(objExpanded, objFlat);
                        }
                    } else {
                        // DO NOTHING
                        Logger.warn(
                            `Nothing to translate on the item ${documentToTranslate.name} field ${fieldToTranslate}`,
                        );
                    }
                } else {
                    // DO NOTHING
                    Logger.warn(`No field ${fieldToTranslate} on the item ${documentToTranslate.name}`);
                }
            }

            // await newItems[0].update({
            //     system: { description: { value: newDescriptionText } },
            // });
            objExpanded = foundry.utils.expandObject(objExpanded);
            await newItems[0].update(objExpanded);
        } else {
            Logger.warn(`Nothing to translate on the item ${documentToTranslate.name}`);
        }
    }
}

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
} from "../lib";

export class JournalEntryTranslator extends Translator {
    /**
     *
     * @param {JournalEntry} documentToTranslate
     * @returns {Promise<void>}
     */
    async translateButton(documentToTranslate) {
        const { apiProviderToken, target_lang, makeSeparateFolder, translateInPlace } = await getTranslationSettings();
        if (!apiProviderToken) {
            dialogApiProviderTokenMissing();
        } else {
            if (!translateInPlace) {
                await this.translateAndCreateJournalEntry(documentToTranslate, target_lang, makeSeparateFolder, apiProviderToken);
            } else {
                await this.translateAndReplaceOriginal(documentToTranslate, target_lang, apiProviderToken);
            }
        }
    }

    /**
     *
     * @param {JournalEntry} documentToTranslate
     * @param {string} target_lang
     * @param {string} token
     * @returns {Promise<void>}
     */
    async translateAndReplaceOriginal(documentToTranslate, target_lang, token) {
        const pages = documentToTranslate.pages;
        pages.map(async (page) => {
            const journalText = await this.getJournalPageText(page);
            let translation = await translate_html(journalText, token, target_lang);
            await page.update({
                text: {
                    content: translation,
                    format: CONST.JOURNAL_ENTRY_PAGE_FORMATS.HTML,
                },
            });
        });
    }

    /**
     *
     * @param {JournalEntry} documentToTranslate
     * @param {string} target_lang
     * @param {boolean} makeSeparateFolder
     * @param {string} token
     * @returns {Promise<void>}
     */
    async translateAndCreateJournalEntry(documentToTranslate, target_lang, makeSeparateFolder, token) {
        const folder = await determineFolder(documentToTranslate, target_lang, makeSeparateFolder);
        const pages = documentToTranslate.pages;
        let newName = await determineNewName(documentToTranslate);
        const newPages = await Promise.all(
            pages.map(async (page) => this.translateSinglePage(page, token, target_lang)),
        ).catch((e) => {
            new ErrorDialog(e.message);
        });
        if (newPages) {
            const newJournalEntry = await JournalEntry.createDocuments([
                { ...documentToTranslate, name: newName, folder: folder },
            ]);
            await newJournalEntry[0].createEmbeddedDocuments("JournalEntryPage", newPages.flat());
        }
    }

    /**
     *
     * @param {JournalEntryPage} journalPage
     * @param {string} token
     * @param {string} target_lang
     * @returns {Promise<JournalEntryPage>}
     */
    async translateSinglePage(journalPage, token, target_lang) {
        const journalText = await this.getJournalPageText(journalPage);
        let translation = await translate_html(journalText, token, target_lang);
        const newJournalPage = await this.createNewJournalEntry(journalPage, translation);
        return newJournalPage;
    }

    /**
     *
     * @param {JournalEntryPage} journalPage
     * @returns {Promise<string>}
     */
    async getJournalPageText(journalPage) {
        if (journalPage.text.content) {
            let text = journalPage.text.content;
            text = text.replace("#", "");
            return text;
        } else {
            return "";
        }
    }

    /**
     *
     * @param {JournalEntryPage} journal
     * @param {string} translation
     * @returns {Promise<JournalEntryPage[]>}
     */
    async createNewJournalEntry(journal, translation) {
        const newName = await determineNewName(journal);
        const newJournalPage = [
            {
                ...journal,
                name: newName,
                text: {
                    content: translation,
                    format: CONST.JOURNAL_ENTRY_PAGE_FORMATS.HTML,
                },
            },
        ];
        return newJournalPage;
    }
}

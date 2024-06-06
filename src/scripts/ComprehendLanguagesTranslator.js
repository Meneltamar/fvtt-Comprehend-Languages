import { ErrorDialog } from "./ErrorDialog";
import {
    _split_at_p,
    _split_html,
    translate_html,
    getTranslationSettings,
    dialogApiProviderTokenMissing,
    determineFolder,
    translate_text,
    determineNewName,
} from "./lib";
import { ItemTranslator } from "./transator/ItemTranslator";
import { JournalEntryTranslator } from "./transator/JournalEntryTranslator";

export class ComprehendLanguagesTranslator {
    /**
     *
     * @param {JournalEntry} journal
     * @returns {Promise<void>}
     */
    static async buttonTranslateJournalEntry(journal) {
        const translator = new JournalEntryTranslator();
        translator.translateButton(journal);
    }

    /**
     *
     * @param {Item} item
     * @returns {Promise<void>}
     */
    static async buttonTranslateItem(item) {
        const translator = new ItemTranslator();
        translator.translateButton(item);
    }
}

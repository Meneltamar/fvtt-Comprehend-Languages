export class SelectionTranslator {
    /**
     *
     * @returns {Promise<void>}
     */
    static async translateSelectedText() {
        const { apiProviderToken, target_lang, makeSeparateFolder } = await getTranslationSettings();
        const selectedText = window.getSelection().toString();
        const translatedText = await translate_html(selectedText, apiProviderToken, target_lang).catch((e) => {
            new ErrorDialog(e.message);
        });
        if (!translatedText) {
            return;
        }
        let d = new Dialog({
            title: "Translation",
            content: `<p>${translatedText}</p>`,
            buttons: {
                one: {
                    icon: '<i class="fas fa-check"></i>',
                    label: "Close Translation",
                },
            },
            default: "one",
        });
        d.render(true);
    }
}

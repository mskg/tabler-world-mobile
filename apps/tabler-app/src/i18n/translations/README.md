# Internationalization (I18N)

We use [POEditor](https://poeditor.com/projects/settings?id=317857) to streamline our translation process.

## Translator

### Update a language

1. Login to [POEditor](https://poeditor.com/projects/settings?id=317857)
1. Update and review the language
1. Please toggle the `Proofread` flag for all translations that you finished
1. Drop us a note that we can integrate your work in our project

### Preview a language

1. Drop us a note that you translate and we will enable the features in the App for you.
1. Goto `Menu | Settings | Erase all Content`
1. When the App refreshes, you will have an additional menu `Developer`. This gives you access to the live translations features. You can choose another language via `Override Language`. You see all available languages, even if they are not yet released.
1. You can refresh the translations any time via `Refresh Current Translations`. Translations are live downloaded from the POEditor service and applied to the App. Such, you can validate what you translated.
1. If you want to get back to the defaults, press `Reset Translations to Default`.

## Developer

### Internals
* We use a babel plugin `module-resolver` to provide moment with all languages pre-loaded (`moment/min/moment-with-locales`)
* Languages can be provided on the fly for an App release via `CDN:/translations/#channel#/#lang#.json`

### Add terms

If you added terms to the App, other languages need to translate that new terms.

1. **Update the english locale only!**
1. `yarn translations` and commit
1. Login to [POEditor](https://poeditor.com/projects/view?id=317857)
1. Settings | GitHub
1. Tick the language
1. Click `Get terms`
1. Notify translators about new terms

### Update a language

1. Login to [POEditor](https://poeditor.com/projects/view?id=317857)
1. Settings | GitHub
1. Tick the language
1. Export to GitHub
1. Languages can be published on the fly for an App via CDN


### Add language

1. Know you iso2 code (`XX`)
1. Add `XX_strings.json` with `{}`
1. Add `XX.ts`
```ts
import XX from './XX_strings.json';

XX.id = 'XX';
export default XX;
   ```
3. Add language to `translations.ts`, `loadLanguage`
3. Add language to `.env`, `APP_LANGUAGES`
3. Add the language to POEditor
3. Add a mapping for the file in POEditor
3. Find someone who can translate it :)
3. Make a new release build and publish it to the stores

When the language is approved, the add language to `azure-pipelines.yaml`, `APP_LANGUAGES`. This will publish the language together with the App.

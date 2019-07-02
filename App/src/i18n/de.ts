import en, { I18NType } from './en';

const countries = require("./countries/de.json");

const de: I18NType = {
    Whoops: {
        title: "Oooops?",
        try: "Wiederholen",
        partialData: "Daten konnten nicht geladen werden. Es werden gespeicherte Daten angezeigt.",
        refresh: "Aktualisieren"
    },

    Image: {
        Member: "Mitgliedsinformationen",
        Club: "Tischinformationen"
    },

    NavigationStyle: {
        paddingHorizontal: 4,
        fontSize: 10,
        textAlign: 'center',
        backgroundColor: 'transparent',
    },

    Loader: {
        title: "Aktualisierung verfügbar",
        text: "Eine neue Version wurde gefunden, Neustart erforderlich.",
        accept: "Fortfahren",
    },

    SignIn: {
        placeholderEMail: "vorname.nachname@123-de.roundtable.world",
        placeholderCode: "Authorisierungscode",

        continue: "Anmelden",
        confirm: "Bestätigen",
        cancel: "Abbrechen",

        welcomeBack: "Willkommen zurück,",
        signin: "melde Dich an um fortzufahren",
        confirmTitle: "Bitte bestätige Deine Anmeldung!",
        checkEmail: "Den Code dazu hast Du per E-Mail erhalten",
        codeWrong: "Authorisierungscode konnte nicht verifiziert werden, Du must von vorne anfangen.",
        accessDenied: "Mit dieser Anmeldungen kannst Du diese App nicht verweden. Wenn Du das Gefühl hast, dass das nicht stimmmen kann, dann kontaktiere das TABLER.WORLD Team bitte via E-Mail.",
        codeVerify: (tries) => `Der Authorisierungscode konnte nicht verifiziert werden. Du hast noch ${tries} Versuche übrig.`,
    },

    Structure: {
        title: "Verzeichnis",
        associations: "Assoziatio...",
        clubs: "Tische",
        areas: "Distrikte",

        president: "Präsident",

        board: "Präsidium",
        assist: "Referenten",

        details: "Tisch anzeigen"
    },

    Club: {
        title: "Tisch",

        board: "Präsidium",
        assist: "Referenten",

        members: "Mitglieder",
        member: "Mitglied",

        Actions: {
            web: "Web",
            facebook: "Facebook",
            instagram: "Instagram",
            twitter: "Twitter",
        },

        web: "Website",

        charter: "Datum der Chartner",

        national: "Internationaler Patentisch",
        international: "Nationaler Patentisch",

        account: "Bankverbindung",

        place: (n1, n2) => n1 > 1 ? `Treffpunkt ${n2}` : "Treffpunkt",

        meetings: "Monatliche Treffen am",
        expand: "Alle anzeigen"
    },

    World: {
        title: "TABLER.WORLD",
    },

    Albums: {
        title: "Alben",
        details: "Album anzeigen",
    },

    Album: {
        title: "Album",
    },

    ReadMore: {
        more: "Mehr anzeigen",
        less: "Weniger",
    },

    Member: {
        Menu: {
            email: "Sende E-mail",
            tel: "Anrufen",
            sms: "SMS senden",
            url: "Website öffnen",
            cancel: "Abbrechen",
        },

        Formats: {
            date: (date?: string) => {
                var dateOptions = { year: 'numeric', month: 'long', day: 'numeric' };
                return date == null
                    ? undefined
                    //@ts-ignore
                    : new Date(date).toLocaleDateString("de-de", dateOptions);
            },
        },

        email: (s) => {
            switch (s) {
                case "rt":
                    return "TABLER.WORLD";

                case "home":
                    return "Private E-Mail";

                case "work":
                    return "Geschäftliche E-Mail";

                case "other":
                    return "E-Mail";

                default:
                    return s;
            }
        },

        telephone: (s) => {
            switch (s) {
                case "home":
                    return "Telefon Privat";

                case "mobile":
                    return "Mobiltelefon";

                case "work":
                    return "Telefon Geschäftlich";

                case "other":
                    return "Telefon";

                default:
                    return s;
            }
        },

        Fields: {
            home: "Privatadresse",
            birthday: "Geburtstag",
            partner: "Bessere Hälfte",
            roles: "RT Ämter (dieses Jahr)",
            rtorg: "RT Organisation",

            companies: "Firma",
            educations: "Ausbildung"
        },

        Actions: {
            message: "Nachricht",
            call: "Anrufen",
            mail: "E-Mail",
            web: "TABLER.world",

            openweb: "Auf TABLER.WORLD anzeigen",
            favadd: "Zu Favoriten hinzufügen",
            remfav: "Aus den Favoriten entfernen",
            contact: "Ins Telefonbuch übertragen",

            linkedin: "Linkedin",
            facebook: "Facebook",
            instagram: "Instagram",
            twitter: "Twitter",

            clipboard: "Text kopiert",
        },
    },

    Search: {
        title: "Suchen",
        history: "Verlauf",
        search: "Suchen...",
        lru: "Zuletzt geöffnet",

        filter: "Filtern",

        results: (r) => r > 0 ? `Ergebnisse (${r})` : "Ergebnisse",

        roles: (r) => r > 0 ? `Rollen (${r})` : "Rollen",
        areas: (r) => r > 0 ? `Distrikte (${r})` : "Distrikte",
        tables: (r) => r > 0 ? `Tische (${r})` : "Tische",
    },

    Filter: {
        title: "Filter anpassen",
        area: "Distrikte",
        showAll: "Alle Mitglieder anzeigen",
        hideAll: "Keine Mitglieder anzeigen",

        favorites: "Favoriten",
        toggleFavorits: "All Favoriten",
        toggleOwnTable: "Mitglieder meines Tisches",
    },


    Settings: {
        title: "Einstellungen",

        logout: {
            title: "Abmeldung bestätigen!",
            text: "Wir werden ALLE lokalen Daten entfernen. Diese Aktion kann nicht rückgängig gemacht werden.",
        },

        reload: {
            title: "Neustart erforderlich",
            text: "Für dieses Feature müssen wir die App neu starten.",
        },

        sync: {
            title: "Wir werden ALLE lokalen Daten löschen!",
            text: "Diese Aktion kann nicht rückgängig gemacht werden.",
            date: (date: Date | null) => {
                var options = { year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric' };

                return date == null
                    ? "nie"
                    : new Date(date).toLocaleString("de-de", options);
            }
        },

        apps: en.Settings.apps,

        confirm: "OK",
        cancel: "Abbrechen",

        sections: {
            about: "Über die App",
            sync: "Telefon Addressbuch",
            reset: "Zurücksetzen",
            apps: "Bevorzugte Applikationen wählen",
            contacts: "Mitglieder",
            colors: "Farben",
            experiments: "Experimente"
        },

        texts: {
            contacts: "Mitglieder könnten in das Telefonbuch synchronisiert werden. Sollten jemand aus TABLER.WORLD entfernt werden, verbleibn diese auf Deinem Telefon. Mit jeder Änderung in TABLER.WORLD werden die Mitglieder auf Deinem Telefon aktualisiert.",
            experiments: "Dies sind experimentelle und nicht unterstützte Funktionen der TABLER.WORLD App. Diese Erweiterungen können jederzeit und ohne Vorwarnung verschwinden."
        },

        contactpermissions: "Die App kann nicht auf Deine Mitglieder zugreifen. Bitte erteile die entsprechenden Berechtigungen in den Einstellungen Deines Telefons.",

        firstlast: "Vorname, Nachname",
        lastfirst: "Nachname, Vorname",

        fields: {
            mail: "E-Mail",
            web: "Browser",
            sms: "Kurznachrichten",
            phone: "Anrufe",

            dark: "Nachtmodus",
            logout: "Abmelden und alle Einstellungen zurücksetzen",
            clear: "Alle Inhalte löschen",
            version: "Version",
            lastSync: "Letzte Synchronisierung",
            channel: "Kanal",
            syncFavorites: "Favoriten synchronisieren",
            syncOwnTable: "Tischmitglieder synchronisieren",
            sortOrder: "Sortierung",
            displayOrder: "Anzeige",

            experiment_albums: "Alben"
        },

        ReleaseNotes: "Versionshinweise (Englisch)",

        Legal: {
            title: "Rechtlichtes",
            thirdparty: "Lizenzinformationen zu Drittprodukten",

            docs: [
                {
                    title: "Datenschutzrichtlinien",
                    url: "https://hilfe.roundtable.world/knowledge-base/data-protection-policy/",

                },
                {
                    title: "Impressum",
                    url: "https://hilfe.roundtable.world/knowledge-base/imprint/"
                }
            ]
        }
    },

    Members: {
        me: "Mein Profil auf TABLER.WORLD",
        noresults: "Keine Resultate",
        search: "Suche...",
        title: "Mitglieder",
    },

    SnackBar: {
        dismiss: "OK",
        syncTablers: (m) => `Mitglieder konnten nicht aktualisiert werden (${m})`,
        syncStructure: (m) => `RTD Struktur konnten nicht aktualisiert werden (${m})`,

        error: (m) => `${m}`,
    },

    Countries: {
        translate: (c: string | undefined | null) => {
            if (c == null) return null;
            return countries.countries[c.toUpperCase()] || c;
        }
    },

    ContactSync: en.ContactSync,

    Notifications: {
        birthday: {
            title: "Geburtstagszeit...",
            text: (n) => `Gratuliere ${n}, damit es ein großartiger Tag wird.`,
        },
    },

    Timespan: {
        now: "Jetzt",

        seconds: "Sekunden",
        minutes: "Minuten",
        hours: "Stunden",
        days: "Tage",
        weeks: "Wochen",
        months: "Monate",
        years: "Jahre",

        toOne: (s: string) => s.substring(0, -1),
    },
};

export default de;
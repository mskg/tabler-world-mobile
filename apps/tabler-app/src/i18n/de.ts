import { differenceInYears, format } from 'date-fns';
import dateDE from 'date-fns/locale/de';
import 'moment';
import 'moment/locale/de';
import en, { I18NType } from './en';

// tslint:disable-next-line: no-var-requires
const countries = require('./countries/de.json');

const de: I18NType = {
    id: 'de',

    Whoops: {
        title: 'Oooops?',
        try: 'Wiederholen',
        partialData: 'Daten konnten nicht geladen werden. Es werden gespeicherte Daten angezeigt.',
        refresh: 'Aktualisieren',
        offline: 'Du bist offline.',
    },

    ErrorReport: {
        title: 'Ein Problem melden',
        text: 'Dein Feedback hilft uns die TABLER.APP zu verbessern.',
        report: 'Geht etwas nicht?',

        subject: 'TABLER.APP Problem',
        noMail: 'Kann es sein, dass Du keine E-Mails versenden kannst?',
        template: `Beschreibe bitte was passiert ist:`,
    },

    Image: {
        Member: 'Mitgliedsinformationen',
        Club: 'Tischinformationen',
    },

    NavigationStyle: {
        paddingHorizontal: 4,
        fontSize: 10,
        textAlign: 'center',
        backgroundColor: 'transparent',
    },

    Loader: {
        title: 'Aktualisierung verfügbar',
        text: 'Eine neue Version wurde gefunden, Neustart erforderlich.',
        accept: 'Fortfahren',
    },

    SignIn: {
        placeholderEMail: 'vorname.nachname@123-de.roundtable.world',
        placeholderCode: 'Authorisierungscode',

        continue: 'Anmelden',
        confirm: 'Bestätigen',
        cancel: 'Abbrechen',

        welcomeBack: 'Willkommen zurück,',
        signin: 'melde Dich an um fortzufahren',
        confirmTitle: 'Bitte bestätige Deine Anmeldung!',
        checkEmail: 'Den Code dazu hast Du per E-Mail erhalten',
        codeWrong: 'Authorisierungscode konnte nicht verifiziert werden, Du must von vorne anfangen.',
        accessDenied: 'Mit dieser Anmeldungen kannst Du diese App nicht verweden. Wenn Du das Gefühl hast, dass das nicht stimmmen kann, dann kontaktiere das TABLER.WORLD Team bitte via E-Mail.',
        codeVerify: (tries) => `Der Authorisierungscode konnte nicht verifiziert werden. Du hast noch ${tries} Versuche übrig.`,

        demoMode: 'App ausprobieren',
        join: 'Mitglied werden?',

        demo: {
            title: 'Demonstration',
            text: 'Nach Bestätigung wird die App neu gestartet. Zum Verlassen, bitte unter Einstellungen | abmelden wählen.',
        },
    },

    Pair: {
        action: 'Visitenkarten tauschen',
        title: 'Visitenkarte tauschen',
        scan: 'Code scannen',
        me: 'Mein Code',

        request: 'Berechtigungen für die Kamera',
        permission: 'Keine Berechtigungen für die Kamera',

        remove: 'Das Mitglied wurde zu Deinen Favoriten hinzugefügt',
        undo: 'Rückgängig',
    },

    Structure: {
        title: 'Verzeichnis',
        associations: 'Assoziatio...',
        clubs: 'Tische',
        areas: 'Distrikte',

        president: 'Präsident',

        board: 'Präsidium',
        assist: 'Referenten',

        details: 'Tisch anzeigen',
    },

    Club: {
        title: 'Tisch',

        board: 'Präsidium',
        assist: 'Referenten',

        members: 'Mitglieder',
        member: 'Mitglied',

        Actions: {
            web: 'Web',
            facebook: 'Facebook',
            instagram: 'Instagram',
            twitter: 'Twitter',
        },

        web: 'Website',

        charter: 'Datum der Charter',

        national: 'Nationaler Patentisch',
        international: 'Internationaler Patentisch',

        account: 'Bankverbindung',

        place: (n1, n2) => n1 > 1 ? `Treffpunkt ${n2}` : 'Treffpunkt',

        meetings: 'Monatliche Treffen am',
        expand: 'Alle anzeigen',
    },

    World: {
        title: 'TABLER.WORLD',
        tab: 'Online',
    },

    Albums: {
        title: 'Alben',
        details: 'Album anzeigen',
    },

    News: {
        title: 'Aktuelles',
    },

    Album: {
        title: 'Album',
    },

    ReadMore: {
        more: 'Mehr anzeigen',
        less: 'Weniger',
    },

    Member: {
        Menu: {
            email: 'Sende E-mail',
            tel: 'Anrufen',
            sms: 'SMS senden',
            url: 'Website öffnen',
            cancel: 'Abbrechen',
        },

        Formats: {
            date: (date?: string) => {
                if (date == null) return undefined;
                return `${format(date, 'D. MMMM YYYY', { locale: dateDE })} (${differenceInYears(Date.now(), date)})`;
            },
        },

        email: (s) => {
            switch (s) {
                case 'rt':
                    return 'TABLER.WORLD';

                case 'home':
                    return 'Private E-Mail';

                case 'work':
                    return 'Geschäftliche E-Mail';

                case 'other':
                    return 'E-Mail';

                default:
                    return s;
            }
        },

        telephone: (s) => {
            switch (s) {
                case 'home':
                    return 'Telefon Privat';

                case 'mobile':
                    return 'Mobiltelefon';

                case 'work':
                    return 'Telefon Geschäftlich';

                case 'other':
                    return 'Telefon';

                default:
                    return s;
            }
        },

        Fields: {
            home: 'Privatadresse',
            birthday: 'Geburtstag',
            partner: 'Partnerin/Partner',
            roles: 'RT Ämter (dieses Jahr)',
            rtorg: 'RT Organisation',

            companies: 'Firma',
            educations: 'Ausbildung',
        },

        Actions: {
            message: 'Nachricht',
            call: 'Anrufen',
            mail: 'E-Mail',
            web: 'TABLER.world',

            openweb: 'Auf TABLER.WORLD anzeigen',
            favadd: 'Zu Favoriten hinzufügen',
            remfav: 'Aus den Favoriten entfernen',
            contact: 'Ins Telefonbuch übertragen',
            chat: 'Nachricht schicken',

            linkedin: 'Linkedin',
            facebook: 'Facebook',
            instagram: 'Instagram',
            twitter: 'Twitter',

            clipboard: 'Text kopiert',
        },
    },

    Search: {
        title: 'Suchen',
        history: 'Verlauf',
        search: 'Suchen...',
        lru: 'Zuletzt geöffnet',

        filter: 'Filtern',

        results: (r) => r > 0 ? `Ergebnisse (${r})` : 'Ergebnisse',

        roles: (r) => r > 0 ? `Rollen (${r})` : 'Rollen',
        areas: (r) => r > 0 ? `Distrikte (${r})` : 'Distrikte',
        tables: (r) => r > 0 ? `Tische (${r})` : 'Tische',

        sectors: (r) => r > 0 ? `Sparten (${r})` : 'Sparte',

        sectorNames: {
            architecturalservices: 'Architektur',
            banking: 'Bankwesen',
            constructiontradesmining: 'Bau, Handel und Minenarbeit',
            consultingservices: 'Beratung/Consulting',
            biotechnologypharmaceutical: 'Biotechnologie und Pharmazie',
            accountingauditing: 'Buchhaltung/Finanzen',
            design: 'Design',
            scienceresearch: 'Forschung',
            voluntaryservices: 'Freiwilligendienst, Voluntariat',
            hospitalitytourism: 'Gastgewerbe und Tourismus',
            healthsocialcarepractitionertechnician: 'Gesundheits- und Sozialwesen',
            retailwholesale: 'Groß- und Einzelhandel',
            installationmaintenancerepair: 'Handwerk',
            realestate: 'Immobilienverwaltung',
            industry: 'Industrie',
            informationtechnology: 'Informationstechnologie',
            engineering: 'Ingenieurswesen',
            customerservicecallcenter: 'Kundendienst / Call Center',
            artsentertainmentmedia: 'Kunst, Unterhaltung und Medien',
            warehousingdistribution: 'Lagerung und Vertieb',
            agricultureforestryfishing: 'Land-, Forst-, Fischereiwirtschaft',
            aerospaceaviation: 'Luftfahrt/Raumfahrt',
            communitysocialservicesnonprofit: 'öffentlicher Dienst, gemeinnützige Einrichtungen',
            employmentrecruitmentagency: 'Personalvermittlung',
            humanresources: 'Personalwesen',
            personalcare: 'Pflegeberufe',
            manufacturingproduction: 'Produktion und Herstellung',
            legal: 'Rechtswesen',
            governmentpolicy: 'Regierung und Politik',
            restaurantfoodservice: 'Restaurant und Lebensmittel',
            educationtraininglibrary: 'Schulung, Training, Bibliothek',
            other: 'Sonstiges',
            lawenforcementsecurity: 'Strafverfolgung und Sicherheit',
            telecommunications: 'Telekommunikation',
            insurance: 'Versicherung',
            sales: 'Vertrieb',
            administrativesupportservices: 'Verwaltung',
            advertisingmarketingpublicrelations: 'Werbung, Marketing, PR',
            financeeconomics: 'Wirtschaft und Finanzen',
        },
    },

    Filter: {
        title: 'Filter anpassen',
        area: 'Distrikte',
        showAll: 'Alle Mitglieder anzeigen',
        hideAll: 'Keine Mitglieder anzeigen',

        favorites: 'Favoriten',
        toggleFavorits: 'All Favoriten',
        toggleOwnTable: 'Mitglieder meines Tisches',

        toggleAssociationBoard: 'Präsidium und Referenten',
        toggleAreaBoard: 'Beirat',
    },


    Settings: {
        title: 'Einstellungen',

        logout: {
            title: 'Abmeldung bestätigen!',
            text: 'Wir werden ALLE lokalen Daten entfernen. Diese Aktion kann nicht rückgängig gemacht werden.',
            button: 'ABMELDEN',
            demo: 'Du benutzt die App im Demonstrationsmodus. Um diesen zu verlassen, bitte abmelden.',
        },

        reload: {
            title: 'Neustart erforderlich',
            text: 'Für dieses Feature müssen wir die App neu starten.',
        },

        sync: {
            title: 'Wir werden ALLE lokalen Daten löschen!',
            text: 'Diese Aktion kann nicht rückgängig gemacht werden.',
            date: (date: Date | null) => {
                const options = { year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric' };

                return date == null
                    ? 'nie'
                    : new Date(date).toLocaleString('de-de', options);
            },
        },

        apps: en.Settings.apps,

        confirm: 'OK',
        cancel: 'Abbrechen',

        sections: {
            about: 'Über die App',
            sync: 'Telefon Addressbuch',
            reset: 'Zurücksetzen',
            apps: 'Bevorzugte Applikationen wählen',
            contacts: 'Mitglieder',
            colors: 'Farben',
            experiments: 'Experimente',
            locationservices: 'Ortungsdienste',
            // nearby: 'Mitglieder in der Nähe',
        },

        texts: {
            contacts: 'Mitglieder könnten in das Telefonbuch synchronisiert werden. Sollten jemand aus TABLER.WORLD entfernt werden, verbleibn diese auf Deinem Telefon. Mit jeder Änderung in TABLER.WORLD werden die Mitglieder auf Deinem Telefon aktualisiert.',
            experiments: 'Dies sind experimentelle und nicht unterstützte Funktionen der TABLER.APP. Diese Erweiterungen können jederzeit und ohne Vorwarnung verschwinden.',
            // nearby: 'Wenn du die Funktion einschaltest, dann können andere Mitglieder sehen in welcher Stadt du dich befindest. Wir speichern keine Standorthistorie, nur den letzten bekannten Standort.',
        },

        contactpermissions: 'Die App kann nicht auf Deine Mitglieder zugreifen. Bitte erteile die entsprechenden Berechtigungen in den Einstellungen Deines Telefons.',
        locationpermission: 'Die App kann nicht auf Deinen Standort zugreifen. Bitte erteile die entsprechenden Berechtigungen in den Einstellungen Deines Telefons.',
        locationfailed: 'Die Einstellungen konnten nicht aktualisiert werden.',

        firstlast: 'Vorname, Nachname',
        lastfirst: 'Nachname, Vorname',

        fields: {
            mail: 'E-Mail',
            web: 'Browser',
            sms: 'Kurznachrichten',
            phone: 'Anrufe',

            dark: 'Nachtmodus',
            logout: 'Abmelden und alle Einstellungen zurücksetzen',
            clear: 'Alle Inhalte löschen',
            cache: 'Temporären Speicher freigeben',
            version: 'Version',
            lastSync: 'Letzte Synchronisierung',
            channel: 'Kanal',
            syncFavorites: 'Favoriten synchronisieren',
            syncOwnTable: 'Tischmitglieder synchronisieren',
            sortOrder: 'Sortierung',
            displayOrder: 'Anzeige',

            experiments: 'Alben und Neuigkeiten',
            nearby: 'Meinen Standort teilen',
        },

        ReleaseNotes: 'Versionshinweise (Englisch)',

        Legal: {
            title: 'Rechtlichtes',
            thirdparty: 'Lizenzinformationen zu Drittprodukten',
            about: 'Über diese App',

            docs: [
                {
                    title: 'Datenschutzrichtlinien',
                    url: 'https://hilfe.roundtable.world/knowledge-base/data-protection-policy/',

                },
                {
                    title: 'Impressum',
                    url: 'https://hilfe.roundtable.world/knowledge-base/imprint/',
                },
            ],
        },

        cache: {
            title: 'Der Speicherplatz wurde freigegeben',
        },
    },

    Members: {
        noresults: 'Keine Resultate',
        search: 'Suche...',
        title: 'Mitglieder',
    },

    SnackBar: {
        dismiss: 'OK',
        syncTablers: (m) => `Mitglieder konnten nicht aktualisiert werden (${m})`,
        syncStructure: (m) => `RTD Struktur konnten nicht aktualisiert werden (${m})`,

        error: (m) => `${m}`,
    },

    Countries: {
        translate: (c: string | undefined | null) => {
            if (c == null) return null;
            return countries.countries[c.toUpperCase()] || c;
        },
    },

    ContactSync: en.ContactSync,

    Notifications: {
        birthday: {
            title: 'Geburtstagszeit...',
            text: (n) => `Gratuliere ${n}, damit es ein großartiger Tag wird.`,
        },
    },

    Timespan: {
        now: 'Jetzt',

        seconds: 'Sekunden',
        minutes: 'Minuten',
        hours: 'Stunden',
        days: 'Tage',
        weeks: 'Wochen',
        months: 'Monate',
        years: 'Jahre',

        toOne: (s: string) => s.substring(0, s.length - 1),
    },

    Distance: {
        m: 'm',
        km: 'km',
    },

    Menu: {
        title: 'Menü',
    },

    NearbyMembers: {
        title: 'Mitglieder in der Nähe',
        location: 'Dein Standort',

        near: (s: string | undefined) => s ? 'In der Nähe von ' + s : 'Unbekannter Standort',
        ago: (s: string) => `vor ${s}`,

        notsupported: 'Die Übermittlung der Position im Hintergrund wird von diesem Gerät nicht unterstützt.',
        permissions: 'Um \'Mitglieder in der Nähe\' nutzen zu können, muss die App auf Deinen Standort zugreifen. Du kannst dies jederzeit in den Einstellungen Deines Telefons aktivieren.',
        always: 'Um \'Mitglieder in der Nähe\' nutzen zu können benötigt die App dauerhaften Zugriff auf Deine Position.',

        setlocation: 'Standort auf immer setzen',
        on: 'Einschalten',

        off: '\'Mitglieder in der Nähe\' ist deaktiviert. Bitte aktiviere die Option in den Einstellungen, um deinen Standort zu teilen. Es wird nur die Stadt angezeigt in der du dich befindest. Wir speichern keine Standorthistorie.',

        Settings: {
            title: 'Mitglieder in der Nähe',
            on: {
                text: 'Wenn du die Funktion einschaltest, dann können andere Mitglieder sehen in welcher Stadt du dich befindest. Wir speichern keine Standorthistorie, nur den letzten bekannten Standort.',
                field: 'Teile Deinen Standort',
            },
            filter: {
                title: 'Filter',
                field: 'Verstecke Mitglieder Deines Clubs',
            },
        },
    },

    Feedback: {
        title: 'Feedback',
    },

    Conversations: {
        title: 'Nachrichten',
        network: 'Warte auf das Netzwerk...',
        retry: 'Erneut versuchen',
        copy: 'Kopieren',
    },
};

export default de;

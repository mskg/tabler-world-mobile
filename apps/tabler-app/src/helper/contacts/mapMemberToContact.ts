import { UrlParameters } from '@mskg/tabler-world-config-app';
import * as Contacts from 'expo-contacts';
import { Platform } from 'react-native';
import { I18N } from '../../i18n/translation';
import { ParameterName } from '../../model/graphql/globalTypes';
import { Member_Member } from '../../model/graphql/Member';
import { collectEMails, collectPhones } from '../collect';
import { makeMemberLink } from '../linking/makeMemberLink';
import { getParameterValue } from '../parameters/getParameterValue';
import { downloadPic } from './downloadPic';
import { logger } from './logger';
import { removeNulls } from './removeNulls';

// tslint:disable-next-line: max-func-body-length
export async function mapMemberToContact(member: Member_Member): Promise<Contacts.Contact> {
    // @ts-ignore all fields are present
    let contact: Contacts.Contact = {
        [Contacts.Fields.FirstName]: Platform.select({
            ios: member.firstname,
            android: `${member.firstname} ${member.lastname}`,
        }),

        [Contacts.Fields.LastName]: member.lastname || '',
        [Contacts.Fields.Company]: member.association.name,

        // android does not display department, we abuse title
        [Contacts.Fields.JobTitle]: Platform.select({
            ios: '',
            android: member.club.name,
        }),

        [Contacts.Fields.Department]: member.club.name,
        [Contacts.Fields.ContactType]: Contacts.ContactTypes.Person,
    };

    const emails = collectEMails(member);
    if (emails.length > 0) {
        contact[Contacts.Fields.Emails] = emails.map((e) => ({
            label: e.type,
            email: e.value,
            isPrimary: false,
        }));
    }

    const phones = collectPhones(member);
    if (phones.length > 0) {
        contact[Contacts.Fields.PhoneNumbers] = phones.map((e) => ({
            label: e.type,
            number: e.value,
            isPrimary: false,
        }));
    }

    if (member.address) {
        contact = {
            ...contact,

            [Contacts.Fields.Addresses]: [{
                label: I18N.ContactSync.primaryaddress,
                street: [member.address.street1, member.address.street2].filter(Boolean).join('\n'),
                city: member.address.city,
                postalCode: member.address.postal_code,
                isoCountryCode: I18N.countryName(member.address.country || 'de'),
                country: I18N.countryName(member.address.country || 'de'),
            }],
        };

    }

    if (member.pic != null) {
        const fileUri = await downloadPic(member.pic, member.id);
        if (fileUri != null) {
            contact = {
                ...contact,
                [Contacts.Fields.Image]: {
                    uri: fileUri,
                },
                
                [Contacts.Fields.ImageAvailable]: true,
                [Contacts.Fields.RawImage]: fileUri,
            };
        }
    }

    if (member.birthdate != null) {
        const date = new Date(member.birthdate);

        contact = {
            ...contact,

            // bug in iOS that does not export date
            // if year is set
            [Contacts.Fields.Birthday]: {
                day: date.getDate(),
                month: date.getMonth(),
                year: date.getFullYear(),
                calendar: 'gregorian',
            },
            // {
            //     label: 'birthday',
            //     day: date.getUTCDate(),
            //     month: date.getUTCMonth(),
            //     year: date.getUTCFullYear(),
            //     calendar: 'gregorian',
            // },
        };
    }

    const config = await getParameterValue<UrlParameters>(ParameterName.urls);
    const twUrl = config.profile
        .replace(/#id#/, member.id.toString())
        .replace(/#lang#/, I18N.id);

    const profiles: Contacts.SocialProfile[] = [];
    profiles.push({
        id: '',
        label: 'TABLER.WORLD',
        service: 'TABLER.WORLD',
        username: twUrl,
        url: makeMemberLink(member.id),
    });

    if (member.socialmedia) {
        if (member.socialmedia.facebook) {
            profiles.push({
                id: '',
                label: 'Facebook',
                service: 'Facebook',
                username: (member.socialmedia.facebook),
                url: member.socialmedia.facebook,
            });
        }

        if (member.socialmedia.instagram) {
            profiles.push({
                id: '',
                label: 'Instagram',
                service: 'Instagram',
                username: (member.socialmedia.instagram),
                url: member.socialmedia.instagram,
            });
        }

        if (member.socialmedia.linkedin) {
            profiles.push({
                id: '',
                label: 'LinkedIn',
                service: 'LinkedIn',
                username: (member.socialmedia.linkedin),
                url: member.socialmedia.linkedin,
            });
        }

        if (member.socialmedia.twitter) {
            profiles.push({
                id: '',
                label: 'Twitter',
                service: 'Twitter',
                username: (member.socialmedia.twitter),
                url: member.socialmedia.twitter,
            });
        }
    }

    contact = {
        ...contact,
        [Contacts.Fields.SocialProfiles]: profiles,
    };

    contact = removeNulls(contact);

    logger.debug(contact);
    return contact;
}

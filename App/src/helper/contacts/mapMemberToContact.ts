import * as Contacts from 'expo-contacts';
import { I18N } from '../../i18n/translation';
import { GetMemberQueryType_Member } from '../../screens/Member/Queries';
import { collectEMails, collectPhones } from '../collect';
import { downloadPic } from './downloadPic';
import { logger } from './logger';

export async function mapMemberToContact(member: GetMemberQueryType_Member): Promise<Contacts.Contact> {
    //@ts-ignore
    let contact: Contacts.Contact = {
        [Contacts.Fields.FirstName]: member.firstname,
        [Contacts.Fields.LastName]: member.lastname,
        [Contacts.Fields.Name]: member.firstname + " " + member.lastname,

        [Contacts.Fields.Company]: member.association.name,
        [Contacts.Fields.Department]: member.club.name,
        [Contacts.Fields.ContactType]: Contacts.ContactTypes.Person,
    };

    let i = 1;

    const emails = collectEMails(member);
    if (emails.length > 0) {
        //@ts-ignore
        contact[Contacts.Fields.Emails] = emails.map(e => ({
            // id: ++i,
            label: e.type,
            email: e.value,
            isPrimary: false,
        }))
    }

    const phones = collectPhones(member);
    if (phones.length > 0) {
        //@ts-ignore
        contact[Contacts.Fields.PhoneNumbers] = phones.map(e => ({
            // id: ++i,
            label: e.type,
            number: e.value,
            isPrimary: false,
        }))
    }

    if (member.address) {
        contact = {
            ...contact,

            //@ts-ignore
            [Contacts.Fields.Addresses]: [{
                // id: ++i,
                label: I18N.ContactSync.primaryaddress,
                street: [member.address.street1, member.address.street2].filter(Boolean).join('\n'),
                city: member.address.city,
                postalCode: member.address.postal_code,
                isoCountryCode: member.address.country,
            }],
        }

    }

    if (member.pic != null) {
        const fileUri = await downloadPic(member.pic, member.id);
        if (fileUri != null) {
            contact = {
                ...contact,
                [Contacts.Fields.Image]: {
                    uri: fileUri,
                },
            }
        }
    }

    if (member.birthdate != null) {
        const date = new Date(member.birthdate);

        contact = {
            ...contact,

            //@ts-ignore
            [Contacts.Fields.Birthday]: {
                day: date.getUTCDate(),
                month: date.getUTCMonth(),
                year: date.getUTCFullYear(),
                format: "gregorian",
            },
        }
    }

    logger.debug(contact);
    return contact;
}

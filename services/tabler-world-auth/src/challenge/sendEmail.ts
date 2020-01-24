import { readFileSync } from 'fs';
import { ses } from './create';

export async function sendEmail(emailAddress: string, secretLoginCode: string) {
    console.log('sending email');
    const filename = require('./mail.html').default;
    const content = readFileSync(filename, 'utf8');

    const maskEMail = emailAddress.replace(/(..)[^@]+@(\d)\d*-\w+\.roundtable\.world/ig, '$1****@$2****.roundtable.world');
    const replaceContent = content
        .replace(/##MAIL##/g, maskEMail)
        .replace(/##CODE##/g, secretLoginCode);

    const suffix = process.env.STAGE === 'prod' ? '' : ` (${process.env.STAGE})`;

    const params: AWS.SES.SendEmailRequest = {
        Destination: { ToAddresses: [emailAddress] },
        ReplyToAddresses: [process.env.SES_REPLY_ADDRESS || 'support@round-table.de'],
        Message: {
            Body: {
                Html: {
                    Charset: 'UTF-8',
                    Data: replaceContent,
                },
            },
            Subject: {
                Charset: 'UTF-8',
                Data: 'TABLER.WORLD Mobile Security Code' + suffix,
            },
        },
        Source: process.env.SES_FROM_ADDRESS as string,
    };

    await ses.sendEmail(params).promise();
}

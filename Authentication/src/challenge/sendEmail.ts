import { readFileSync } from "fs";
import { ses } from './create';

export async function sendEmail(emailAddress: string, secretLoginCode: string) {
    console.log("sending email");
    var filename = require("./mail.html");
    var content = readFileSync(filename, 'utf8');

    const maskEMail = emailAddress.replace(/(..)[^@]+@(\d)\d*-\w+\.roundtable\.world/ig, "$1****@$2****.roundtable.world");
    var replaceContent = content
        .replace(/##MAIL##/g, maskEMail)
        .replace(/##CODE##/g, secretLoginCode);

    const params: AWS.SES.SendEmailRequest = {
        Destination: { ToAddresses: [emailAddress] },
        Message: {
            Body: {
                Html: {
                    Charset: 'UTF-8',
                    Data: replaceContent
                },
            },
            Subject: {
                Charset: 'UTF-8',
                Data: 'TABLER.WORLD Mobile Security Code'
            }
        },
        Source: process.env.SES_FROM_ADDRESS as string
    };
    
    await ses.sendEmail(params).promise();
}

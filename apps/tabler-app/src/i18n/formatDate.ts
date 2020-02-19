import moment from 'moment';

type FormatTypes = keyof typeof DateFormats | 'custom';
export type FormatDateFunc = (date: null | undefined | string | Date | number, format: FormatTypes, custom?: string) => string | undefined;

const DateFormats = {
    Date_Long: 'LL',

    Time: 'HH:mm',  // we always use 24
    Time_Seconds: 'HH:mm:ss',

    Date_Short_Time: 'L HH:mm',
    Date_Long_Time: 'LL HH:mm',
};

export const formatDate: FormatDateFunc = (date, f, custom) => {
    if (date == null) { return undefined; }
    return moment(date).format(custom || DateFormats[f]);
};

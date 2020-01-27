export enum FieldNames {
    Id = 'id',
    Club = 'club',
    Area = 'area',
    Association = 'association',
    PrivacySettings = 'privacysettings',
    Phonenumbers = 'phonenumbers',
    Emails = 'emails',
    BirthDate = 'birthdate',
    Address = 'address',
    Companies = 'companies',
    Educations = 'educations',
    Partner = 'partner',
}

// tslint:disable-next-line: variable-name
export const system_fields = [
    'id',
    'area', 'areaname', 'areashortname',
    'association', 'associationname', 'associationshortname', 'associationflag',
    'club', 'clubnumber', 'clubname', 'clubshortname',
    'roles', 'modifiedon',
];

// tslint:disable-next-line: variable-name
export const standard_fields = [
    'firstname', 'lastname', 'pic', 'rtemail', 'socialmedia', 'datejoined',
];

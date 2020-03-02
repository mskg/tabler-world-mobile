export enum FieldNames {
    Id = 'id',
    Club = 'club',
    Area = 'area',
    Family = 'family',
    Association = 'association',
    PrivacySettings = 'privacysettings',
    AllFamiliesOptIn = 'allfamiliesoptin',
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
    'family',
    'area', 'areaname', 'areashortname',
    'association', 'associationname', 'associationshortname', 'associationflag',
    'club', 'clubnumber', 'clubname', 'clubshortname',
    'roles', 'modifiedon',
];

// tslint:disable-next-line: variable-name
export const standard_fields = [
    'firstname', 'lastname', 'pic', 'rtemail', 'socialmedia', 'datejoined',
];

// tslint:disable-next-line: variable-name
export const former_fields = [
    'id',
    'family',
    'area', 'areaname', 'areashortname',
    'association', 'associationname', 'associationshortname', 'associationflag',
    'club', 'clubnumber', 'clubname', 'clubshortname',
    'firstname', 'lastname',
    'removed',
];

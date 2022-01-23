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
    FieldNames.Id,

    FieldNames.Family,
    FieldNames.Area, 'areaname', 'areashortname',
    FieldNames.Association, 'associationname', 'associationshortname', 'associationflag',
    FieldNames.Club, 'clubnumber', 'clubname', 'clubshortname',

    'roles', 'modifiedon',

    // need to add this to be able to use it later
    FieldNames.AllFamiliesOptIn,
];

// tslint:disable-next-line: variable-name
export const standard_fields = [
    'firstname', 'lastname', 'pic', 'rtemail', 'socialmedia', 'datejoined',
];

// tslint:disable-next-line: variable-name
export const former_fields = [
    FieldNames.Id,

    FieldNames.Family,
    FieldNames.Area, 'areaname', 'areashortname',
    FieldNames.Association, 'associationname', 'associationshortname', 'associationflag',
    FieldNames.Club, 'clubnumber', 'clubname', 'clubshortname',

    'firstname', 'lastname',
    'removed',
];

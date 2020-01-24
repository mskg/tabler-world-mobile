/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

//==============================================================
// START Enums and Input Objects
//==============================================================

export enum CompanySector {
  accountingauditing = "accountingauditing",
  administrativesupportservices = "administrativesupportservices",
  advertisingmarketingpublicrelations = "advertisingmarketingpublicrelations",
  aerospaceaviation = "aerospaceaviation",
  agricultureforestryfishing = "agricultureforestryfishing",
  architecturalservices = "architecturalservices",
  artsentertainmentmedia = "artsentertainmentmedia",
  banking = "banking",
  biotechnologypharmaceutical = "biotechnologypharmaceutical",
  communitysocialservicesnonprofit = "communitysocialservicesnonprofit",
  constructiontradesmining = "constructiontradesmining",
  consultingservices = "consultingservices",
  customerservicecallcenter = "customerservicecallcenter",
  design = "design",
  educationtraininglibrary = "educationtraininglibrary",
  employmentrecruitmentagency = "employmentrecruitmentagency",
  engineering = "engineering",
  financeeconomics = "financeeconomics",
  governmentpolicy = "governmentpolicy",
  healthsocialcarepractitionertechnician = "healthsocialcarepractitionertechnician",
  hospitalitytourism = "hospitalitytourism",
  humanresources = "humanresources",
  industry = "industry",
  informationtechnology = "informationtechnology",
  installationmaintenancerepair = "installationmaintenancerepair",
  insurance = "insurance",
  lawenforcementsecurity = "lawenforcementsecurity",
  legal = "legal",
  manufacturingproduction = "manufacturingproduction",
  other = "other",
  personalcare = "personalcare",
  realestate = "realestate",
  restaurantfoodservice = "restaurantfoodservice",
  retailwholesale = "retailwholesale",
  sales = "sales",
  scienceresearch = "scienceresearch",
  telecommunications = "telecommunications",
  voluntaryservices = "voluntaryservices",
  warehousingdistribution = "warehousingdistribution",
}

export enum NearbyMemberState {
  Steady = "Steady",
  Traveling = "Traveling",
}

export enum ParameterName {
  fetch = "fetch",
  geo = "geo",
  timeouts = "timeouts",
  urls = "urls",
}

export enum ParameterPlatform {
  android = "android",
  ios = "ios",
}

export enum RoleType {
  area = "area",
  assoc = "assoc",
  club = "club",
  family = "family",
  region = "region",
  rti = "rti",
}

export enum SettingName {
  favorites = "favorites",
  language = "language",
  nearbymembers = "nearbymembers",
  nearbymembersMap = "nearbymembersMap",
  notifications = "notifications",
}

export enum UserRole {
  jobs = "jobs",
}

export interface AddressUpdateInput {
  member: number;
  address?: any | null;
}

export interface MyCurrentLocationInput {
  longitude: number;
  latitude: number;
}

export interface MyLocationInput {
  longitude: number;
  latitude: number;
  accuracy: number;
  speed: number;
  address?: any | null;
}

export interface ParameterInput {
  version: string;
  os: ParameterPlatform;
}

export interface SettingInput {
  name: SettingName;
  value: any;
}

//==============================================================
// END Enums and Input Objects
//==============================================================

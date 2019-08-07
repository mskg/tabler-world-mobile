const SECTORS = [
    "accounting-auditing",
    "administrative-support-services",
    "advertising-marketing-public-relations",
    "aerospace-aviation",
    "agriculture-forestry-fishing",
    "architectural-services",
    "arts-entertainment-media",
    "banking",
    "biotechnology-pharmaceutical",
    "community-social-services-non-profit",
    "construction-trades-mining",
    "consulting-services",
    "customer-service-call-center",
    "design",
    "education-training-library",
    "employment-recruitment-agency",
    "engineering",
    "finance-economics",
    "government-policy",
    "health-social-care-practitioner-technician",
    "hospitality-tourism",
    "human-resources",
    "industry",
    "information-technology",
    "installation-maintenance-repair",
    "insurance",
    "law-enforcement-security",
    "legal",
    "manufacturing-production",
    "other",
    "personal-care",
    "real-estate",
    "restaurant-food-service",
    "retail-wholesale",
    "sales",
    "science-research",
    "telecommunications",
    "warehousing-distribution",
    "voluntaryservices",
];

type MapType = {[key: string]: string};

export const SECTOR_MAPPING: MapType = SECTORS.reduce((p, c) => {
    p[c.replace(/-/ig, "") as string] = c;
    return p;
}, {} as MapType);
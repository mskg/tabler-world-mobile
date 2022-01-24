// we need stable names
const faker = require('faker');
const fs = require("fs");

const NUMER_OF_AREAS = 5;
const NUMER_OF_CLUBS = 30;
const NUMBER_OF_MEMBERS = 500;

function distribute(buckets, size) {
    const elements = [];
    for (let i = 0; i < buckets; ++i) {
        elements.push(Math.random());
    }

    const sum = elements.reduce((p, c) => p + c, 0);
    return elements
        // produces a list that sums up to 1 (100%)
        .map(e => e / sum)
        // mape from percentage to distribution
        .map(e => Math.floor(e * size));
}

const memberDistribution = distribute(NUMER_OF_CLUBS, NUMBER_OF_MEMBERS);
console.log(memberDistribution.reduce((p, c) => p + c, 0));

const areaDistribution = distribute(NUMER_OF_AREAS, NUMER_OF_CLUBS);
console.log(areaDistribution.reduce((p, c) => p + c, 0));

console.log("> generating members");
const members = [];

let club = 0;
let nextClub = memberDistribution[club];

for (let i = 0; i < NUMBER_OF_MEMBERS; ++i) {
    if (i > nextClub) {
        ++club;
        nextClub += memberDistribution[club];
    }

    members.push({
        id: i,
        club: club + 1,
        first: faker.name.firstName(),
        last: faker.name.lastName(),
        pic: faker.datatype.boolean() ? faker.image.avatar() : null,
    });
}

console.log(">> writing members");
fs.writeFileSync(__dirname + `/members.json`, JSON.stringify(members, null, 4));

// clubs
console.log(">> generating clubs");

const clubs = [];
let area = 0;
let nextArea = areaDistribution[area];

for (let i = 0; i < NUMER_OF_CLUBS + 1; ++i) {
    if (i > nextArea) {
        ++area;
        nextArea += areaDistribution[area];
    }

    clubs.push({
        id: i,
        area: area + 1,
        name: faker.address.city(),
        pic: faker.datatype.boolean() ? faker.image.city(500) + "?random=" + faker.datatype.number() : null,
    });
}

console.log(">> writing clubs");
fs.writeFileSync(__dirname + `/clubs.json`, JSON.stringify(clubs, null, 4));

console.log("done");

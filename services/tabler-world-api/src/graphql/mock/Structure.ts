import { MockList } from "graphql-tools";

// tslint:disable-next-line: export-name
export const Association = () => ({
  name: () => "RT Deutschland",

  board: () => new MockList(5),
  boardassistants: () => new MockList(3),
});

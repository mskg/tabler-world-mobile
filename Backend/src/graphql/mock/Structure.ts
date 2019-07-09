import { MockList } from 'graphql-tools';

export const Association = () => ({
  name: () => "RT Deutschland",

  board: () => new MockList(5),
  boardassistants: () => new MockList(3),
});



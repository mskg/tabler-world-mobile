
// https://docs.expo.io/versions/latest/distribution/building-standalone-apps/
export type BuildParams = {
  status: 'finished' | 'error';
  id: string;
  artifactUrl: string;
};

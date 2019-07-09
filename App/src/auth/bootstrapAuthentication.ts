
// import Amplify from 'aws-amplify';
import Auth from '@aws-amplify/auth';
import Amplify from '@aws-amplify/core';
import { getConfigValue } from '../helper/Configuration';
import { Categories, Logger } from '../helper/Logger';
import { SecureStorage } from './SecureStorage';

const logger = new Logger(Categories.Authentication);

export function bootstrapAuthentication() {
  if (__DEV__) {
    Amplify.Logger.LOG_LEVEL = 'INFO';
  }

  const region = getConfigValue("region");
  const userPoolId = getConfigValue("userPoolId");
  const userPoolWebClientId = getConfigValue("userPoolWebClientId");
  const api = getConfigValue("api");
  const identityPoolId = getConfigValue("identityPoolId");

  logger.log("region", region, "api", api);
  logger.log("pool", userPoolId, "client", userPoolWebClientId, "identity", identityPoolId);

  Auth.configure({
    identityPoolId,
    region,
    userPoolId,
    userPoolWebClientId,
    storage: SecureStorage,
  });
}
/*
  {
    "PlanUrl": "$(system.CollectionUri)",
    "ProjectId": "$(system.TeamProjectId)",
    "HubName": "$(system.HostType)",
    "PlanId": "$(system.PlanId)",
    "JobId": "$(system.JobId)",
    "TimelineId": "$(system.TimelineId)",
    "TaskInstanceId": "$(system.TaskInstanceId)",
    "AuthToken": "$(system.AccessToken)"
  }
*/

export type StartParams = {
  // https://expo.io/builds/5fa8ebe1-0031-4be6-99be-915db7fc35b6
  BuildUrl: string;
  PlanUrl: string;
  ProjectId: string;
  HubName: string;
  PlanId: string;
  TaskInstanceId: string;
  TimelineId: string;
  JobId: string;
  AuthToken: string;
};

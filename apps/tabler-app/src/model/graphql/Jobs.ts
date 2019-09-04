/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: Jobs
// ====================================================

export interface Jobs_Jobs_data_JobEmpty {
  __typename: "JobEmpty";
}

export interface Jobs_Jobs_data_JobError {
  __typename: "JobError";
  error: any | null;
}

export interface Jobs_Jobs_data_JobSync {
  __typename: "JobSync";
  records: number | null;
  readTime: number | null;
  refreshTime: number | null;
}

export interface Jobs_Jobs_data_JobSend {
  __typename: "JobSend";
  recipients: number | null;
  errors: number | null;
  hardFails: number | null;
  executionTime: number | null;
}

export type Jobs_Jobs_data = Jobs_Jobs_data_JobEmpty | Jobs_Jobs_data_JobError | Jobs_Jobs_data_JobSync | Jobs_Jobs_data_JobSend;

export interface Jobs_Jobs {
  __typename: "Job";
  runon: any;
  name: string;
  success: boolean;
  data: Jobs_Jobs_data | null;
}

export interface Jobs {
  Jobs: Jobs_Jobs[] | null;
}

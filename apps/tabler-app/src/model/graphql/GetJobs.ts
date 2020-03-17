/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { JobStatus } from "./globalTypes";

// ====================================================
// GraphQL query operation: GetJobs
// ====================================================

export interface GetJobs_Jobs_data_JobEmpty {
  __typename: "JobEmpty";
}

export interface GetJobs_Jobs_data_JobSync {
  __typename: "JobSync";
  records: number | null;
  readTime: number | null;
  refreshTime: number | null;
  modified: number | null;
}

export interface GetJobs_Jobs_data_JobSend {
  __typename: "JobSend";
  errors: number | null;
  hardFails: number | null;
  recipients: number | null;
  executionTime: number | null;
}

export interface GetJobs_Jobs_data_JobError {
  __typename: "JobError";
  error: any | null;
}

export type GetJobs_Jobs_data = GetJobs_Jobs_data_JobEmpty | GetJobs_Jobs_data_JobSync | GetJobs_Jobs_data_JobSend | GetJobs_Jobs_data_JobError;

export interface GetJobs_Jobs {
  __typename: "Job";
  id: string;
  runon: any;
  name: string;
  status: JobStatus;
  data: GetJobs_Jobs_data | null;
}

export interface GetJobs {
  Jobs: GetJobs_Jobs[] | null;
}

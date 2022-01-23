export type CommandForm = {
  projectId?: string;
  issueId: string;
  startedAt?: string;
  hours?: number;
  minutes?: number;
  seconds?: number;
  description?: string;
}

export type Project = {
  label: string;
  key: string;
};

export type Issue = {
  key: string;
  description: string;
};

export type Preferences = {
  domain: string;
  token: string;
  username: string;
}

export type IssueResponse = {
  key: string;
  fields: {
    summary: string;
  }
}

export type IssueBody = {
  issues: IssueResponse[];
}

export type ProjectBody = {
  values: {key: string, name: string}[]
}

export type TimeWorked = {
  seconds: number;
  minutes: number;
  hours: number;
};
import { getPreferenceValues } from "@raycast/api";
import { Issue, Project, Preferences } from "./types";
import { isValidIssueBody, isValidProjectBody } from "./validators";
import fetch from "node-fetch";

const prefs = getPreferenceValues<Preferences>()

const headers = {
  "Content-Type": "application/json",
  Accept: "application/json",
  Authorization: `Basic ${Buffer.from(`${prefs.username}:${prefs.token}`).toString("base64")}`,
};


export const getProjects = async (): Promise<Project[]> => {
  const opts = {
    method: "GET",
    headers,
  };

  const endpoint = `/rest/api/3/project/search`
  const url = `https://${prefs.domain}${endpoint}`;
  const res = await fetch(url, opts);
  const body = await res.json();
  if (isValidProjectBody(body)) {
  const projects = body.values.map((project) => ({key: project.key, label: project.name}));
  return projects;
  }   
  throw new Error("Bad response")
};
export const getIssues = async (projectId?: string): Promise<Issue[]> => {
  const opts = {
    method: "GET",
    headers,
  };

  const endpoint = `/rest/api/3/search?fields=summary,parent,project&maxResults=100&startAt=0&jql=${projectId ? 'project=' + projectId: ''}`
  const url = `https://${prefs.domain}${endpoint}`;
  const res = await fetch(url, opts);
  if (!res.ok) throw new Error('An error occurred while fetching the issues.')
  const body = await res.json();
  if (isValidIssueBody(body)) {
    const issues: Issue[] = body.issues.map((issue) => ({ key: issue.key, description: issue.fields.summary }));
    return issues;
  } else {
    throw new Error("Bad response")
  }
}

export const postTimeLog = async (timeSpentSeconds: number, issueId: string, description?: string) => {

  const opts = {
    method: "POST",
    headers,
    body: JSON.stringify({
      timeSpentSeconds,
      comment: {
        type: "doc",
        version: 1,
        content: [
          {
            type: "paragraph",
            content: [{
              text: description,
              type: 'text'
            }]
          }
        ]
      }
    }),
  };

  const endpoint = `/rest/api/3/issue/${issueId}/worklog?notifyUsers=false`;
  const url = `https://${prefs.domain}${endpoint}`;

  const res = await fetch(url, opts)
  if (!res.ok) {
    const body = await res.json()
    console.error(body)
    throw new Error('Bad request');
  }
  return true
};
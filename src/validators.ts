import { IssueBody, ProjectBody } from "./types";

export const isValidProjectBody = (body: unknown): body is ProjectBody => typeof body === 'object' && body !== null && 'values' in body;

export const isValidIssueBody = (body: unknown): body is IssueBody => typeof body === 'object' && body !== null && 'issues' in body;

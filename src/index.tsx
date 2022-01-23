import React from "react";
import { Form, ActionPanel, SubmitFormAction, showToast, ToastStyle } from "@raycast/api";
import { getIssues, getProjects, postTimeLog } from "./controllers";
import { toSeconds } from "./utils";
import { Project, Issue, TimeWorked } from "./types";

export default function Command() {
  const [projects, setProjects] = React.useState<Project[]>([]);
  const [issues, setIssues] = React.useState<Issue[]>([]);
  const [selectedProject, setSelectedProject] = React.useState<Project>();
  const [selectedIssue, setSelectedIssue] = React.useState<Issue>();
  const [description, setDescription] = React.useState("");
  const [timeWorked, setTimeWorked] = React.useState<TimeWorked>({
    seconds: 0,
    minutes: 0,
    hours: 0,
  });

  async function handleSubmit() {
    const totalTimeWorked = toSeconds(timeWorked.seconds, timeWorked.minutes, timeWorked.hours);
    if (totalTimeWorked && selectedIssue?.key) {
      try {
        const success = await postTimeLog(totalTimeWorked, selectedIssue?.key, description);
        if (success) {
          showToast(ToastStyle.Success, `You logged ${totalTimeWorked} seconds against ${selectedIssue?.key}.`);
        }
      } catch (e) {
        showToast(ToastStyle.Failure, "Error logging time");
      } finally {
        handleCleanup();
      }
    }
  }

  const handleCleanup = () => {
    // keep the project so more
    // time logs can easily
    // be performed
    setDescription("");
    setTimeWorked({
      hours: 0,
      minutes: 0,
      seconds: 0,
    });
    setSelectedIssue(undefined);
  };

  // fetch projects
  React.useEffect(() => {
    const fetchProjects = async () => {
      const projects = await getProjects();
      if (projects) {
        setProjects(projects);
        setSelectedProject(projects[0]);
      }
    };
    fetchProjects();
  }, []);

  // fetch issues
  React.useEffect(() => {
    if (selectedProject) {
      const fetchIssues = async () => {
        const issues = await getIssues(selectedProject?.key);
        if (issues) {
          setIssues(issues);
          setSelectedIssue(issues[0]);
        }
      };
      fetchIssues();
    }
  }, [selectedProject]);

  const handleSelectProject = (value: string) => {
    const selected = projects.find((project) => project.key === value);
    if (selected) setSelectedProject(selected);
  };

  const handleSelectIssue = (value: string) => {
    const selected = issues.find((issue) => issue.key === value);
    if (selected) setSelectedIssue(selected);
  };

  const handleEnterSeconds = (seconds: string) =>
    setTimeWorked({
      ...timeWorked,
      seconds: Number(seconds),
    });

  const handleEnterMinutes = (minutes: string) =>
    setTimeWorked({
      ...timeWorked,
      minutes: Number(minutes),
    });

  const handleEnterHours = (hours: string) =>
    setTimeWorked({
      ...timeWorked,
      hours: Number(hours),
    });

  const handleEnterDescription = (str: string) => setDescription(str);

  return (
    <Form
      actions={
        <ActionPanel>
          <SubmitFormAction onSubmit={handleSubmit} />
        </ActionPanel>
      }
    >
      <Form.Dropdown id="project-id" title="Project Id" onChange={handleSelectProject}>
        {projects.map((item) => (
          <Form.DropdownItem key={item.key} value={item.key} title={item.label} />
        ))}
      </Form.Dropdown>
      <Form.Dropdown id="issue-id" title="Issue Key*" onChange={handleSelectIssue} defaultValue={issues[0]?.key ?? ""}>
        {issues.map((item) => (
          <Form.DropdownItem key={item.key} value={item.key} title={`${item.key}: ${item.description}`} />
        ))}
      </Form.Dropdown>
      {/* <Form.DatePicker id="work-start" title="Work Started" value={new Date()} /> */}
      <Form.Separator />
      <Form.Dropdown id="hours" title="Hours Worked" value={String(timeWorked.hours)} onChange={handleEnterHours}>
        {Array(25)
          .fill(null)
          .map((_, i) => (
            <Form.DropdownItem title={`${i}`} key={"hours-" + i} value={String(i)} />
          ))}
      </Form.Dropdown>
      <Form.Dropdown
        id="minutes"
        title="Minutes Worked"
        value={String(timeWorked.minutes)}
        onChange={handleEnterMinutes}
      >
        {Array(60)
          .fill(null)
          .map((_, i) => (
            <Form.DropdownItem title={`${i}`} key={"minutes-" + i} value={String(i)} />
          ))}
      </Form.Dropdown>
      <Form.Dropdown
        id="seconds"
        title="Seconds Worked"
        value={String(timeWorked.seconds)}
        onChange={handleEnterSeconds}
      >
        {Array(60)
          .fill(null)
          .map((_, i) => (
            <Form.DropdownItem title={`${i}`} key={"seconds-" + i} value={String(i)} />
          ))}
      </Form.Dropdown>
      <Form.TextArea
        onChange={handleEnterDescription}
        id="ticket-description"
        title="Description"
        placeholder="Enter description of work completed"
      />
    </Form>
  );
}

import type { iActivityLog } from "$lib/interface";

export const formatLogMessage = (log: iActivityLog): string => {
  const { action, entity, details } = log;
  const parsedDetails = typeof details === 'string' ? JSON.parse(details) : details;

  switch (entity) {
    case "Child":
      return formatChildLog(action, parsedDetails);
    case "Parent":
      return formatParentLog(action, parsedDetails);
    case "Teacher":
      return formatTeacherLog(action, parsedDetails);
    case "Meeting":
      return formatMeetingLog(action, parsedDetails);
    case "Attendee":
      return formatAttendeeLog(action, parsedDetails);
    case "Score":
      return formatScoreLog(action, parsedDetails);
    case "ParentChild":
      return formatParentChildLog(action, parsedDetails);
    case "ChildFile":
      return formatChildFileLog(action, parsedDetails);
    case "TeacherFile":
      return formatTeacherFileLog(action, parsedDetails);
    default:
      return `${action.toLowerCase()}d ${entity}`;
  }
};

const formatChildLog = (action: string, details: any) => {
  const name = details?.name || "a child";
  switch (action) {
    case "CREATE":
      return `Registered a new child: ${name}`;
    case "UPDATE":
      return `Updated details for ${name}`;
    case "DELETE":
      return `Deleted child record: ${name}`;
    default:
      return `${action.toLowerCase()}d child ${name}`;
  }
};

const formatParentLog = (action: string, details: any) => {
  const name = details?.name || "a parent";
  switch (action) {
    case "CREATE":
      return `Registered a new parent: ${name}`;
    case "UPDATE":
      return `Updated details for ${name}`;
    case "DELETE":
      return `Deleted parent record: ${name}`;
    default:
      return `${action.toLowerCase()}d parent ${name}`;
  }
};

const formatTeacherLog = (action: string, details: any) => {
  const name = details?.name || "a teacher";
  switch (action) {
    case "CREATE":
      return `Registered a new teacher: ${name}`;
    case "UPDATE":
      return `Updated details for ${name}`;
    case "DELETE":
      return `Deleted teacher record: ${name}`;
    default:
      return `${action.toLowerCase()}d teacher ${name}`;
  }
};

const formatMeetingLog = (action: string, details: any) => {
  const type = details?.type || "a meeting";
  const date = details?.datetime ? new Date(details.datetime).toLocaleDateString() : "";
  switch (action) {
    case "CREATE":
      return `Scheduled a ${type} meeting${date ? ` for ${date}` : ""}`;
    case "UPDATE":
      return `Updated ${type} meeting details`;
    case "DELETE":
      return `Deleted ${type} meeting record`;
    default:
      return `${action.toLowerCase()}d meeting ${type}`;
  }
};

const formatAttendeeLog = (action: string, details: any) => {
  const child = details?.child || "a child";
  const meeting = details?.meeting || "a meeting";
  switch (action) {
    case "CREATE":
      return `Marked attendance for ${child} at ${meeting}`;
    case "UPDATE":
      return `Updated attendance for ${child} at ${meeting}`;
    case "DELETE":
      return `Removed attendance for ${child} at ${meeting}`;
    default:
      return `${action.toLowerCase()}d attendance for ${child}`;
  }
};

const formatScoreLog = (action: string, details: any) => {
  const child = details?.child || "a child";
  const type = details?.scoreType || "score";
  const points = details?.points;
  switch (action) {
    case "CREATE":
      return `Recorded ${points ? `${points} points` : "score"} for ${child} in ${type}`;
    case "UPDATE":
      return `Updated ${type} score for ${child}`;
    case "DELETE":
      return `Deleted ${type} score for ${child}`;
    default:
      return `${action.toLowerCase()}d score for ${child}`;
  }
};

const formatParentChildLog = (action: string, details: any) => {
  // These might not have names if we didn't update parentchild.ts to fetch them.
  // Assuming we might see IDs here if we didn't update it.
  // But let's try to be generic.
  switch (action) {
    case "CREATE":
      return `Linked parent and child`;
    case "UPDATE":
      return `Updated parent-child relationship`;
    case "DELETE":
      return `Unlinked parent and child`;
    default:
      return `${action.toLowerCase()}d parent-child link`;
  }
};

const formatChildFileLog = (action: string, details: any) => {
  switch (action) {
    case "CREATE":
      return `Uploaded a file for a child`;
    case "DELETE":
      return `Deleted a child's file`;
    default:
      return `${action.toLowerCase()}d child file`;
  }
};

const formatTeacherFileLog = (action: string, details: any) => {
  switch (action) {
    case "CREATE":
      return `Uploaded a file for a teacher`;
    case "DELETE":
      return `Deleted a teacher's file`;
    default:
      return `${action.toLowerCase()}d teacher file`;
  }
};

import LogoIcon from "$lib/components/icons/LogoIcon.svelte";
import type { iFetchMeta } from "$lib/interface";
import {
  FileText,
  LayoutDashboard,
  User,
  Users,
  Baby,
  GraduationCap,
  UserCircle,
  Trophy,
  Calendar,
  UserCheck,
  Shield,
  BookOpen,
  Activity,
  ClipboardList,
  Contact
} from "@lucide/svelte";

export enum Role {
  ADMIN = 'admin',
  EDITOR = 'editor',
  TEACHER = 'teacher',
  LEADER = 'leader',
  PARENT = 'parent',
  USER = 'user',
}

export enum Fields {
  USER = 'user',
  CHILD = 'child',
  CHILDREN = 'children',
  EDITOR = 'editor',
  ADMIN = 'admin',
  PARENT = 'parent',
  TEACHER = 'teacher',
  SCORE = 'score',
  MEETING = 'meeting',
  MEMORY = 'memories',
}


export enum FieldsPlural {
  ATTENDEE = 'attendees',
  USER = 'users',
  CHILD = 'childs',
  CHILDREN = 'children',
  PARENT = 'parents',
  TEACHER = 'teachers',
  SCORE = 'scores',
  MEETING = 'meetings',
  MEMORY = 'memories',
}

export const MAX_ITEMS_PER_PAGE = 28;

// File upload size limits (in bytes)
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
export const MAX_VIDEO_SIZE = 250 * 1024 * 1024; // 250MB
export const MAX_FILE_SIZE = 250 * 1024 * 1024; // 250MB (for general files)

export const ScoreTypes = {
  BIBLE_WRITING: "Bible Writing",
  BIBLE_STUDY_TEST: "Bible Study Test",
  ENTREPRENEURIAL_CLASS: "Entrepreneurial Class",
};

export const AgeGroups = {
  NURSERY: "Nursery",
  TODDLERS: "Toddlers",
  BEGINNERS: "Beginners",
  PRIMARY: "Primary",
  JUNIORS: "Juniors",
};

export const MeetingTypes = {
  TEACHING_WEEKEND: "Teaching Weekend",
  COMMUNITY_BIBLE_STUDY: "Community Bible Study",
  ISLAND_BIBLE_STUDY: "Island Bible Study",
  THRESHING_FLOOR: "Threshing Floor",
  THE_CONVERGENCE: "The Convergence",
  THE_VOICE_OF_ONE_CONFERENCE: "The Voice of One Conference",
  SISTERS_RETREAT: "Sisters Retreat",
  DAUGHTERS_OF_ZION: "Daughters of Zion",
  WOMEN_OF_FIRE_CONFERENCE: "Women of Fire Conference",
  PRAYERS: "Prayers",
  PRAYER_AND_FASTING: "Prayer & Fasting",
  APOSTOLIC_TEACHING: "Apostolic Teaching",
  SISTERS_BREAKFAST: "Sisters Breakfast",
  CROSS_OVER_SERVICE: "Cross Over Service",
  CAROL_SERVICE: "Carol Service",
  GENERAL_ASSEMBLY: "General Assembly",
  PRAYER_CONVOCATION: "Prayer Convocation",
  CHRISTMAS_SERVICE: "Christmas Service",
  CHRISTMAS_PARTY: "Christmas Party",
  NEW_YEAR_SERVICE: "New Year Service",
  NEW_YEAR_PARTY: "New Year Party",
};

export enum Constants {
  BRANDNAME = 'Remnant Christian Network Children Department',
  BRANDLOGO = 'https://children.rcnlagos.org/icons/android/android-launchericon-192-192.png',
  BRANDCOLOR = '#0f172b',
  SUPPORTEMAIL = 'arcnlagos@gmail.com',
  BRANDWEBSITE = "https://children.rcnlagos.org",
  CREDENTIAL = 'credential',
  GOOGLE = 'google',
  APPLE = 'apple',
  AFTERAUTH = '/'
}

export const TeacherType = {
  FULL_TIME: "Full Time",
  VOLUNTEER: "Volunteer",
  UTILITY: "Utility",
};

export const Locations = {
  APOSTOLIC_CENTER: "Apostolic Center",
  MAGODO_CHURCH: "Magodo Church",
  EGBEDA_CHURCH: "Egbeda Church",
  ISLAND_CHURCH: "Island Church",
  AJEGUNLE_CHURCH: "Ajegunle Church",
};

export type FileType = 'audio' | 'video' | 'file' | 'image';

export const adminRoles = [Role.ADMIN, Role.EDITOR]

export const adminAndTeachersRoles = [Role.ADMIN, Role.EDITOR, Role.TEACHER]

export const emptyMetalist: iFetchMeta = {
  total: 0,
  meta: {
    cursor: '',
    more: false,
    size: 0
  },
  data: []
}

export const attendeesRoles = [Role.ADMIN, Role.EDITOR, Role.TEACHER, Role.LEADER]
export const childrenRoles = [Role.ADMIN, Role.EDITOR, Role.TEACHER, Role.PARENT, Role.LEADER]
export const meetingRoles = [Role.ADMIN, Role.EDITOR, Role.TEACHER, Role.LEADER]
export const parentsRoles = [Role.ADMIN, Role.TEACHER, Role.EDITOR, Role.LEADER]
export const scoresRoles = [Role.ADMIN, Role.TEACHER, Role.EDITOR, Role.LEADER]
export const teachersRoles = [Role.ADMIN, Role.TEACHER, Role.EDITOR, Role.LEADER, Role.PARENT, Role.USER]
export const usersRoles = [Role.ADMIN]
export const profileRoles = [Role.ADMIN, Role.TEACHER, Role.EDITOR, Role.PARENT, Role.USER, Role.LEADER]
export const documentationRoles = [Role.ADMIN, Role.TEACHER, Role.EDITOR, Role.PARENT, Role.USER, Role.LEADER]
export const dashboardRoles = [Role.ADMIN, Role.TEACHER, Role.EDITOR, Role.PARENT, Role.LEADER]
export const memoriesRoles = [Role.ADMIN, Role.EDITOR, Role.TEACHER, Role.PARENT, Role.USER, Role.LEADER]

export const editors = [Role.ADMIN, Role.EDITOR, Role.TEACHER];

export type NavItem = {
  title: string;
  url: string;
  roles: Role[];
  icon: any;
  isActive: boolean;
};

export type NavGroup = {
  groupName: string;
  icon: any;
  items: NavItem[];
};

export const getNavigation = (reference: string) => {
  const isActive = (url: string) => reference === url;

  const data = {
    teams: [
      {
        name: "RCN Lagos",
        logo: LogoIcon,
        plan: "Children Department",
        url: "/"
      },
    ],
    // Flat list for backwards compatibility (used in popover)
    navMain: [
      {
        title: "Dashboard",
        url: "/dashboard",
        roles: dashboardRoles,
        icon: LayoutDashboard,
        isActive: isActive("/dashboard"),
      },
      {
        title: "Documentation",
        url: "/documentation",
        roles: documentationRoles,
        icon: FileText,
        isActive: isActive("/documentation"),
      },
      {
        title: "Attendees",
        url: "/attendees",
        roles: attendeesRoles,
        icon: UserCheck,
        isActive: isActive("/attendees"),
      },
      {
        title: "Meetings",
        url: "/meetings",
        roles: meetingRoles,
        icon: Calendar,
        isActive: isActive("/meetings"),
      },
      {
        title: "Scores",
        url: "/scores",
        roles: scoresRoles,
        icon: Trophy,
        isActive: isActive("/scores"),
      },
      {
        title: "Birthdays",
        url: "/birthdays",
        roles: childrenRoles,
        icon: Calendar,
        isActive: isActive("/birthdays"),
      },
      {
        title: "Memories",
        url: "/memories",
        roles: memoriesRoles,
        icon: Calendar,
        isActive: isActive("/memories"),
      },
      {
        title: "Children",
        url: "/children",
        roles: childrenRoles,
        icon: Baby,
        isActive: isActive("/children"),
      },
      {
        title: "Teachers",
        url: "/teachers",
        roles: teachersRoles,
        icon: GraduationCap,
        isActive: isActive("/teachers"),
      },
      {
        title: "Parents",
        url: "/parents",
        roles: parentsRoles,
        icon: UserCircle,
        isActive: isActive("/parents"),
      },
      {
        title: "Profile",
        url: "/profile",
        roles: profileRoles,
        icon: User,
        isActive: isActive("/profile"),
      },
      {
        title: "Users",
        url: "/users",
        roles: usersRoles,
        icon: Users,
        isActive: isActive("/users"),
      },
    ],
    // Grouped navigation for collapsible sidebar
    navGroups: [
      {
        groupName: "Overview",
        icon: LayoutDashboard,
        items: [
          {
            title: "Dashboard",
            url: "/dashboard",
            roles: dashboardRoles,
            icon: LayoutDashboard,
            isActive: isActive("/dashboard"),
          },
          {
            title: "Documentation",
            url: "/documentation",
            roles: documentationRoles,
            icon: FileText,
            isActive: isActive("/documentation"),
          },
        ],
      },
      {
        groupName: "Attendance",
        icon: ClipboardList,
        items: [
          {
            title: "Attendees",
            url: "/attendees",
            roles: attendeesRoles,
            icon: UserCheck,
            isActive: isActive("/attendees"),
          },
          {
            title: "Meetings",
            url: "/meetings",
            roles: meetingRoles,
            icon: Calendar,
            isActive: isActive("/meetings"),
          },
        ],
      },
      {
        groupName: "Records",
        icon: BookOpen,
        items: [
          {
            title: "Scores",
            url: "/scores",
            roles: scoresRoles,
            icon: Trophy,
            isActive: isActive("/scores"),
          },
          {
            title: "Leaderboard",
            url: "/scores/leaderboard",
            roles: scoresRoles,
            icon: Trophy,
            isActive: isActive("/scores/leaderboard"),
          },
          {
            title: "Birthdays",
            url: "/birthdays",
            roles: childrenRoles,
            icon: Calendar,
            isActive: isActive("/birthdays"),
          },
          {
            title: "Memories",
            url: "/memories",
            roles: memoriesRoles,
            icon: Calendar,
            isActive: isActive("/memories"),
          },
        ],
      },
      {
        groupName: "People",
        icon: Users,
        items: [
          {
            title: "Children",
            url: "/children",
            roles: childrenRoles,
            icon: Baby,
            isActive: isActive("/children"),
          },
          {
            title: "Teachers",
            url: "/teachers",
            roles: teachersRoles,
            icon: GraduationCap,
            isActive: isActive("/teachers"),
          },
          {
            title: "Parents",
            url: "/parents",
            roles: parentsRoles,
            icon: UserCircle,
            isActive: isActive("/parents"),
          },
        ],
      },
      {
        groupName: "Account",
        icon: User,
        items: [
          {
            title: "Profile",
            url: "/profile",
            roles: profileRoles,
            icon: User,
            isActive: isActive("/profile"),
          },
        ],
      },
      {
        groupName: "Admin",
        icon: Shield,
        items: [
          {
            title: "Users",
            url: "/users",
            roles: usersRoles,
            icon: Users,
            isActive: isActive("/users"),
          },
        ],
      },
    ] as NavGroup[],
  };

  return data;
}

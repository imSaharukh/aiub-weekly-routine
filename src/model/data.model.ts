// To parse this data:
//
//   import { Convert, CourseData } from "./file";
//
//   const courseData = Convert.toCourseData(json);

export interface CourseData {
    RegisterableCourses: RegisterableCourse[];
    Student:             Student;
}

export interface RegisterableCourse {
    ID:                   number;
    Title:                string;
    LecCredit:            number;
    SciCredit:            number;
    CompCredit:           number;
    LanCredit:            number;
    StudioCredit:         number;
    RegisterableSections: RegisterableSection[];
    CurriculumID:         number;
    Status:               string;
}

export interface RegisterableSection {
    ID:           number;
    ClassID:      string;
    Title:        string;
    Description:  string;
    Routine:      string;
    Capacity:     number;
    StudentCount: number;
    Registered:   boolean;
}

export interface Student {
    StudentID: string;
}

// Converts JSON strings to/from your types
export class Convert {
    public static toCourseData(json: string): CourseData {
        return JSON.parse(json);
    }

    public static courseDataToJson(value: CourseData): string {
        return JSON.stringify(value);
    }
}

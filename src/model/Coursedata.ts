export interface CourseDataModel {
    Sunday:    Day[];
    Monday:    Day[];
    Tuesday:   Day[];
    Wednesday: Day[];
    id:string
}

export interface Day {
    name:  string;
    start: string | number;
    end:   string | number;
}
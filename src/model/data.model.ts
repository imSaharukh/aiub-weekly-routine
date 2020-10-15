// To parse this data:
//
//   import { Convert, CourseData } from "./file";
//
//   const courseData = Convert.toCourseData(json);
//
// These functions will throw an error if the JSON doesn't
// match the expected interface, even if the JSON is valid.

export interface CourseData {
    RegisterableCourses: RegisterableCourse[];
    Student:             Student;
    Semester:            Semester;
    Curriculums:         Semester[];
}

export interface Semester {
    ID:    number;
    Title: string;
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
    Status:               Status;
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
    Dropped:      boolean;
    UserID:       number;
    DropRecord:   null;
}

export enum Status {
    None = "None",
    Registered = "Registered",
}

export interface Student {
    ID:                      number;
    StudentID:               string;
    Name:                    null;
    CreditCompleted:         number;
    CourseCompleted:         number;
    Cgpa:                    number;
    GradeType:               number;
    ImageUrl:                null;
    CoreCurriculumID:        number;
    MajorCurriculumID:       number;
    SecondMajorCurriculumID: number;
    MinorCurriculumID:       number;
    ElectiveCurriculumID:    number;
    CoreCurriculum:          Semester;
    MajorCurriculum:         null;
    SecondMajorCurriculum:   null;
    MinorCurriculum:         null;
    ElectiveCurriculum:      Semester;
}

// Converts JSON strings to/from your types
// and asserts the results of JSON.parse at runtime
export class Convert {
    public static toCourseData(json: string): CourseData {
        return cast(JSON.parse(json), r("CourseData"));
    }

    public static courseDataToJson(value: CourseData): string {
        return JSON.stringify(uncast(value, r("CourseData")), null, 2);
    }
}

function invalidValue(typ: any, val: any, key: any = ''): never {
    if (key) {
        throw Error(`Invalid value for key "${key}". Expected type ${JSON.stringify(typ)} but got ${JSON.stringify(val)}`);
    }
    throw Error(`Invalid value ${JSON.stringify(val)} for type ${JSON.stringify(typ)}`, );
}

function jsonToJSProps(typ: any): any {
    if (typ.jsonToJS === undefined) {
        const map: any = {};
        typ.props.forEach((p: any) => map[p.json] = { key: p.js, typ: p.typ });
        typ.jsonToJS = map;
    }
    return typ.jsonToJS;
}

function jsToJSONProps(typ: any): any {
    if (typ.jsToJSON === undefined) {
        const map: any = {};
        typ.props.forEach((p: any) => map[p.js] = { key: p.json, typ: p.typ });
        typ.jsToJSON = map;
    }
    return typ.jsToJSON;
}

function transform(val: any, typ: any, getProps: any, key: any = ''): any {
    function transformPrimitive(typ: string, val: any): any {
        if (typeof typ === typeof val) return val;
        return invalidValue(typ, val, key);
    }

    function transformUnion(typs: any[], val: any): any {
        // val must validate against one typ in typs
        const l = typs.length;
        for (let i = 0; i < l; i++) {
            const typ = typs[i];
            try {
                return transform(val, typ, getProps);
            } catch (_) {}
        }
        return invalidValue(typs, val);
    }

    function transformEnum(cases: string[], val: any): any {
        if (cases.indexOf(val) !== -1) return val;
        return invalidValue(cases, val);
    }

    function transformArray(typ: any, val: any): any {
        // val must be an array with no invalid elements
        if (!Array.isArray(val)) return invalidValue("array", val);
        return val.map(el => transform(el, typ, getProps));
    }

    function transformDate(val: any): any {
        if (val === null) {
            return null;
        }
        const d = new Date(val);
        if (isNaN(d.valueOf())) {
            return invalidValue("Date", val);
        }
        return d;
    }

    function transformObject(props: { [k: string]: any }, additional: any, val: any): any {
        if (val === null || typeof val !== "object" || Array.isArray(val)) {
            return invalidValue("object", val);
        }
        const result: any = {};
        Object.getOwnPropertyNames(props).forEach(key => {
            const prop = props[key];
            const v = Object.prototype.hasOwnProperty.call(val, key) ? val[key] : undefined;
            result[prop.key] = transform(v, prop.typ, getProps, prop.key);
        });
        Object.getOwnPropertyNames(val).forEach(key => {
            if (!Object.prototype.hasOwnProperty.call(props, key)) {
                result[key] = transform(val[key], additional, getProps, key);
            }
        });
        return result;
    }

    if (typ === "any") return val;
    if (typ === null) {
        if (val === null) return val;
        return invalidValue(typ, val);
    }
    if (typ === false) return invalidValue(typ, val);
    while (typeof typ === "object" && typ.ref !== undefined) {
        typ = typeMap[typ.ref];
    }
    if (Array.isArray(typ)) return transformEnum(typ, val);
    if (typeof typ === "object") {
        return typ.hasOwnProperty("unionMembers") ? transformUnion(typ.unionMembers, val)
            : typ.hasOwnProperty("arrayItems")    ? transformArray(typ.arrayItems, val)
            : typ.hasOwnProperty("props")         ? transformObject(getProps(typ), typ.additional, val)
            : invalidValue(typ, val);
    }
    // Numbers can be parsed by Date but shouldn't be.
    if (typ === Date && typeof val !== "number") return transformDate(val);
    return transformPrimitive(typ, val);
}

function cast<T>(val: any, typ: any): T {
    return transform(val, typ, jsonToJSProps);
}

function uncast<T>(val: T, typ: any): any {
    return transform(val, typ, jsToJSONProps);
}

function a(typ: any) {
    return { arrayItems: typ };
}

function u(...typs: any[]) {
    return { unionMembers: typs };
}

function o(props: any[], additional: any) {
    return { props, additional };
}

function m(additional: any) {
    return { props: [], additional };
}

function r(name: string) {
    return { ref: name };
}

const typeMap: any = {
    "CourseData": o([
        { json: "RegisterableCourses", js: "RegisterableCourses", typ: a(r("RegisterableCourse")) },
        { json: "Student", js: "Student", typ: r("Student") },
        { json: "Semester", js: "Semester", typ: r("Semester") },
        { json: "Curriculums", js: "Curriculums", typ: a(r("Semester")) },
    ], false),
    "Semester": o([
        { json: "ID", js: "ID", typ: 0 },
        { json: "Title", js: "Title", typ: "" },
    ], false),
    "RegisterableCourse": o([
        { json: "ID", js: "ID", typ: 0 },
        { json: "Title", js: "Title", typ: "" },
        { json: "LecCredit", js: "LecCredit", typ: 0 },
        { json: "SciCredit", js: "SciCredit", typ: 0 },
        { json: "CompCredit", js: "CompCredit", typ: 0 },
        { json: "LanCredit", js: "LanCredit", typ: 0 },
        { json: "StudioCredit", js: "StudioCredit", typ: 0 },
        { json: "RegisterableSections", js: "RegisterableSections", typ: a(r("RegisterableSection")) },
        { json: "CurriculumID", js: "CurriculumID", typ: 0 },
        { json: "Status", js: "Status", typ: r("Status") },
    ], false),
    "RegisterableSection": o([
        { json: "ID", js: "ID", typ: 0 },
        { json: "ClassID", js: "ClassID", typ: "" },
        { json: "Title", js: "Title", typ: "" },
        { json: "Description", js: "Description", typ: "" },
        { json: "Routine", js: "Routine", typ: "" },
        { json: "Capacity", js: "Capacity", typ: 0 },
        { json: "StudentCount", js: "StudentCount", typ: 0 },
        { json: "Registered", js: "Registered", typ: true },
        { json: "Dropped", js: "Dropped", typ: true },
        { json: "UserID", js: "UserID", typ: 0 },
        { json: "DropRecord", js: "DropRecord", typ: null },
    ], false),
    "Student": o([
        { json: "ID", js: "ID", typ: 0 },
        { json: "StudentID", js: "StudentID", typ: "" },
        { json: "Name", js: "Name", typ: null },
        { json: "CreditCompleted", js: "CreditCompleted", typ: 0 },
        { json: "CourseCompleted", js: "CourseCompleted", typ: 0 },
        { json: "Cgpa", js: "Cgpa", typ: 0 },
        { json: "GradeType", js: "GradeType", typ: 0 },
        { json: "ImageUrl", js: "ImageUrl", typ: null },
        { json: "CoreCurriculumID", js: "CoreCurriculumID", typ: 0 },
        { json: "MajorCurriculumID", js: "MajorCurriculumID", typ: 0 },
        { json: "SecondMajorCurriculumID", js: "SecondMajorCurriculumID", typ: 0 },
        { json: "MinorCurriculumID", js: "MinorCurriculumID", typ: 0 },
        { json: "ElectiveCurriculumID", js: "ElectiveCurriculumID", typ: 0 },
        { json: "CoreCurriculum", js: "CoreCurriculum", typ: r("Semester") },
        { json: "MajorCurriculum", js: "MajorCurriculum", typ: null },
        { json: "SecondMajorCurriculum", js: "SecondMajorCurriculum", typ: null },
        { json: "MinorCurriculum", js: "MinorCurriculum", typ: null },
        { json: "ElectiveCurriculum", js: "ElectiveCurriculum", typ: r("Semester") },
    ], false),
    "Status": [
        "None",
        "Registered",
    ],
};

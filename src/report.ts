import { Scope, courseCodeToInt } from "./course-code.js";
import { Course } from "./course.js";

export const scoredGrade = ['優上', '優', '良', '可', '不可', '欠席'] as const;
export const unscoredGrade = ['合格', '不合格'] as const;
export const unenrolledGrade = '未履修';
export type ScoredGrade = (typeof scoredGrade)[number];
export type UnscoredGrade = (typeof unscoredGrade)[number];
export type Grade = ScoredGrade | UnscoredGrade | typeof unenrolledGrade;

/**
 * 成績表の各行に対応するデータ型
 */
export interface ScoredReport {
  course: Course;
  grade: ScoredGrade;
  point: number;
}
export interface UnscoredReport {
  course: Course;
  grade: UnscoredGrade;
  point?: undefined;
}
export interface UnenrolledSpecificReport {
  course: Omit<Course, 'year' | 'term'>;
  grade: '未履修';
  point: 0;
  descriotion?: string;
}
export interface UnenrolledSomeReport {
  course?: undefined;
  scope: Scope;
  grade: '未履修';
  point: 0;
  descriotion?: string;
}
export type Report = ScoredReport | UnscoredReport | UnenrolledSpecificReport | UnenrolledSomeReport;

export type SpecificReport = ScoredReport | UnscoredReport | UnenrolledSpecificReport;
export const isSpecificReport = <T extends Report>(r: T): r is T & SpecificReport => 'course' in r;
export type ScoredCourseReport = ScoredReport | UnenrolledSpecificReport | UnenrolledSomeReport;
export const isScoredReport = <T extends Report>(r: T): r is T & ScoredCourseReport => 'point' in r;
export type SpecificScoredReport = SpecificReport & ScoredCourseReport;
export type UnenrolledReport = UnenrolledSpecificReport | UnenrolledSomeReport;

/**
 * p.56で頻出の「成績上位」のためにソートするときに使う関数．
 */
export const ordering = (a: SpecificScoredReport, b: SpecificScoredReport) => {
  const pointOrd = a.point - b.point;
  const codeOrd = courseCodeToInt(a.course.code) - courseCodeToInt(b.course.code);
  // 評点が等しい科目間の順序は公開されていないので，とりあえず整理番号表の順番ということにした．ただ実際の成績表では整理番号表通りに並んでいない箇所もあるため分析すべき．
  return pointOrd ? pointOrd : -codeOrd;
};

export const pointToGrade = (point: number): ScoredGrade | undefined => {
  if (point > 100) return void 0;
  if (90 <= point) return '優上';
  if (80 <= point) return '優';
  if (65 <= point) return '良';
  if (50 <= point) return '可';
  if (0 <= point) return '不可';
  return void 0;
};

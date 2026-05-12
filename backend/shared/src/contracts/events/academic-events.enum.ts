export enum AcademicExchangeName {
  STUDENT_CREATED = "academic.students.created.exchange",
  STUDENT_UPDATED = "academic.students.updated.exchange",
  STUDENT_DELETED = "academic.students.deleted.exchange",
  SUBJECT_CREATED = "academic.subjects.created.exchange",
  SUBJECT_UPDATED = "academic.subjects.updated.exchange",
  SUBJECT_DELETED = "academic.subjects.deleted.exchange",
  TEACHER_CREATED = "academic.teachers.created.exchange",
  TEACHER_UPDATED = "academic.teachers.updated.exchange",
  TEACHER_DELETED = "academic.teachers.deleted.exchange",
}

export enum AcademicRoutingKey {
  STUDENT_CREATED = "student.created",
  STUDENT_UPDATED = "student.updated",
  STUDENT_DELETED = "student.deleted",
  SUBJECT_CREATED = "subject.created",
  SUBJECT_UPDATED = "subject.updated",
  SUBJECT_DELETED = "subject.deleted",
  TEACHER_CREATED = "teacher.created",
  TEACHER_UPDATED = "teacher.updated",
  TEACHER_DELETED = "teacher.deleted",
}

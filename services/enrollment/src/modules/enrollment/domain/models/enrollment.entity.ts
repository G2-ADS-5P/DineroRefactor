export enum EnrollmentStatus {
  ACTIVE = "active",
  CANCELED = "canceled",
}

export class Enrollment {
  private readonly _id?: string;
  private _studentRefId: string;
  private _studentId: string;
  private _classOfferingRefId: string;
  private _classOfferingId: string;
  private _status: EnrollmentStatus;
  private _enrolledAt: Date;
  private _canceledAt?: Date | null;
  private readonly _createdAt?: Date;
  private readonly _updatedAt?: Date;

  private constructor(id?: string, createdAt?: Date, updatedAt?: Date) {
    this._id = id;
    this._createdAt = createdAt;
    this._updatedAt = updatedAt;
  }

  get id(): string | undefined {
    return this._id;
  }

  get studentId(): string {
    return this._studentId;
  }

  get studentRefId(): string {
    return this._studentRefId;
  }

  get classOfferingId(): string {
    return this._classOfferingId;
  }

  get classOfferingRefId(): string {
    return this._classOfferingRefId;
  }

  get status(): EnrollmentStatus {
    return this._status;
  }

  get enrolledAt(): Date {
    return this._enrolledAt;
  }

  get canceledAt(): Date | null | undefined {
    return this._canceledAt;
  }

  get createdAt(): Date | undefined {
    return this._createdAt;
  }

  get updatedAt(): Date | undefined {
    return this._updatedAt;
  }

  withStudentId(studentId: string) {
    this._studentId = studentId;
    return this;
  }

  withStudentRefId(studentRefId: string) {
    this._studentRefId = studentRefId;
    return this;
  }

  withClassOfferingId(classOfferingId: string) {
    this._classOfferingId = classOfferingId;
    return this;
  }

  withClassOfferingRefId(classOfferingRefId: string) {
    this._classOfferingRefId = classOfferingRefId;
    return this;
  }

  withStatus(status: EnrollmentStatus) {
    this._status = status;
    return this;
  }

  withEnrolledAt(enrolledAt: Date) {
    this._enrolledAt = enrolledAt;
    return this;
  }

  withCanceledAt(canceledAt: Date | null) {
    this._canceledAt = canceledAt;
    return this;
  }

  static restore(props?: {
    id?: string;
    studentRefId: string;
    studentId: string;
    classOfferingRefId: string;
    classOfferingId: string;
    status: EnrollmentStatus;
    enrolledAt: Date;
    canceledAt?: Date | null;
    createdAt?: Date;
    updatedAt?: Date;
  }): Enrollment | null {
    if (!props) return null;

    const enrollment = new Enrollment(
      props.id,
      props.createdAt,
      props.updatedAt,
    );

    enrollment._studentRefId = props.studentRefId;
    enrollment._studentId = props.studentId;
    enrollment._classOfferingRefId = props.classOfferingRefId;
    enrollment._classOfferingId = props.classOfferingId;
    enrollment._status = props.status;
    enrollment._enrolledAt = props.enrolledAt;
    enrollment._canceledAt = props.canceledAt ?? null;

    return enrollment;
  }
}

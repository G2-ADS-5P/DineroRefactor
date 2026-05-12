export enum ClassOfferingStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
}

export class ClassOffering {
  private readonly _id?: string;
  private _subjectRefId: string;
  private _subjectId: string;
  private _subjectName: string;
  private _teacherRefId: string;
  private _teacherId: string;
  private _teacherName: string;
  private _startDate: Date;
  private _endDate: Date;
  private _status: ClassOfferingStatus;
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

  get subjectId(): string {
    return this._subjectId;
  }

  get subjectRefId(): string {
    return this._subjectRefId;
  }

  get subjectName(): string {
    return this._subjectName;
  }

  get teacherId(): string {
    return this._teacherId;
  }

  get teacherRefId(): string {
    return this._teacherRefId;
  }

  get teacherName(): string {
    return this._teacherName;
  }

  get startDate(): Date {
    return this._startDate;
  }

  get endDate(): Date {
    return this._endDate;
  }

  get status(): ClassOfferingStatus {
    return this._status;
  }

  get createdAt(): Date | undefined {
    return this._createdAt;
  }

  get updatedAt(): Date | undefined {
    return this._updatedAt;
  }

  withSubjectId(subjectId: string) {
    this._subjectId = subjectId;
    return this;
  }

  withSubjectRefId(subjectRefId: string) {
    this._subjectRefId = subjectRefId;
    return this;
  }

  withSubjectName(subjectName: string) {
    this._subjectName = subjectName;
    return this;
  }

  withTeacherId(teacherId: string) {
    this._teacherId = teacherId;
    return this;
  }

  withTeacherRefId(teacherRefId: string) {
    this._teacherRefId = teacherRefId;
    return this;
  }

  withTeacherName(teacherName: string) {
    this._teacherName = teacherName;
    return this;
  }

  withStartDate(startDate: Date) {
    this._startDate = startDate;
    return this;
  }

  withEndDate(endDate: Date) {
    this._endDate = endDate;
    return this;
  }

  withStatus(status: ClassOfferingStatus) {
    this._status = status;
    return this;
  }

  static restore(props?: {
    id?: string;
    subjectRefId: string;
    subjectId: string;
    subjectName: string;
    teacherRefId: string;
    teacherId: string;
    teacherName: string;
    startDate: Date;
    endDate: Date;
    status: ClassOfferingStatus;
    createdAt?: Date;
    updatedAt?: Date;
  }): ClassOffering | null {
    if (!props) return null;

    const classOffering = new ClassOffering(
      props.id,
      props.createdAt,
      props.updatedAt,
    );

    classOffering._subjectRefId = props.subjectRefId;
    classOffering._subjectId = props.subjectId;
    classOffering._subjectName = props.subjectName;
    classOffering._teacherRefId = props.teacherRefId;
    classOffering._teacherId = props.teacherId;
    classOffering._teacherName = props.teacherName;
    classOffering._startDate = props.startDate;
    classOffering._endDate = props.endDate;
    classOffering._status = props.status;

    return classOffering;
  }
}

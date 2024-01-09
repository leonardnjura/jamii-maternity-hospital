import { Schema } from './my-schemas';

export interface IPath {
  params: { id: string };
}

export interface ICustomData {
  success?: boolean;
  message: string;
  verbose?: any;
  data?: any;
}

/*IUserData*/
export interface IAuthenticatedUserData {
  user: IUserData;
  jwt: string;
}

export interface IUserData {
  _id?: string;
  email: string;
  password?: string;
  roleId?: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  notes?: string;
  gender?: string;
  freemiumTokenExpiry?: string;
  status?: number; //todo: create statuses table
  clientAssignments?: IClientListAssignment[];
  createdBy?: string;
  updatedBy?: string;
  dateCreated?: string;
  dateUpdated?: string;
}

export const IUserDataSchema: Schema = {
  fields: {
    _id: 'string',
    email: 'string',
    password: 'string', //go see hack on how null passes validation in api, :|
    roleId: 'string',
    firstName: 'string',
    lastName: 'string',
    avatar: 'string', //go see hack on how null passes validation in api, :|
    notes: 'string',
    gender: 'string',
    freemiumTokenExpiry: 'string',
    status: 'number',
    clientAssignments: 'object',
    createdBy: 'string',
    updatedBy: 'string',
    dateCreated: 'string',
    dateUpdated: 'string',
  },
  required: ['email'], //if via postman we need at least email, otherwise copy email|fulu|avatar from oauth
};

export const IUserLoginSchema: Schema = {
  fields: {
    email: 'string',
    password: 'string',
  },
  required: ['email', 'password'],
};

export const IEmailInfoSchema: Schema = {
  fields: {
    email: 'string',
  },
  required: ['email'],
};

export interface IDataset {
  label: string;
  data: any[];
  borderColor: string;
  backgroundColor: string;
}

export interface IHospitalClient {
  _id?: string;
  clientEmail: string;
  firstName: string;
  lastName: string;
  hospitalizationDays: number;
  hospitalizationExpiry?: string;
  servedDays?: number;
  handlerMedicId?: string;
  notes?: string;
  discharged?: boolean;
  dateDischarged?: string;
  createdBy?: string;
  updatedBy?: string;
  dateCreated?: string;
  dateUpdated?: string;
}

export const IHospitalClientSchema: Schema = {
  fields: {
    _id: 'string',
    clientEmail: 'string',
    firstName: 'string',
    lastName: 'string',
    hospitalizationDays: 'number', //flexible, helps determine expiry on record creation
    hospitalizationExpiry: 'string', //projected discharge date
    servedDays: 'number',
    handlerMedicId: 'string', //auto; determination based on current alloc list
    notes: 'string',
    createdBy: 'string',
    updatedBy: 'string',
    dateCreated: 'string',
    dateUpdated: 'string',
  },
  required: ['clientEmail', 'hospitalizationDays'],
};

export const IHospitalClientUpdateSchema: Schema = {
  //only update schema has some fields
  fields: {
    _id: 'string',
    handlerMedicId: 'string',
    hospitalizationDays: 'number',
    hospitalizationExpiry: 'string',
    servedDays: 'number',
    discharged: 'boolean',
    dateDischarged: 'string', //actual discharge date
  },
  required: ['discharged'],
};

export const IHospitalClientTransferSchema: Schema = {
  fields: {
    receivingMidwifeId: 'string',
  },
  required: ['receivingMidwifeId'],
};

export interface IClientListAssignment {
  _id?: string;
  assignmentRef: string; //clientId
  createdBy?: string;
  updatedBy?: string;
  dateCreated?: string;
  dateUpdated?: string;
}

export const IClientListAssignmentSchema: Schema = {
  fields: {
    _id: 'string',
    assignmentRef: 'string',
  },
  required: ['assignmentRef'],
};

export const IClientListAssignmentUpdateSchema: Schema = {
  fields: {
    _id: 'string',
    assignmentRef: 'string',
    disabled: 'boolean',
  },
  required: ['disabled'],
};

export const IAuthorizationDataSchema: Schema = {
  fields: {
    _id: 'string',
    email: 'string',
    key: 'string',
    verb: 'string',
    entity: 'string',
    createdBy: 'string',
    updatedBy: 'string',
    dateCreated: 'string',
    dateUpdated: 'string',
  },
  required: ['email', 'verb', 'entity'],
};

export interface IMessageData {
  _id?: string;
  email: string;
  firstName: string;
  lastName?: string;
  surferMessage: string;
  surferCountry?: string;
  status?: string;
  createdBy?: string;
  updatedBy?: string;
  dateCreated?: string;
  dateUpdated?: string;
}

export const IMessageDataSchema: Schema = {
  //prevents wierd *ss fields being added that backend doesnt like, :)
  fields: {
    _id: 'string',
    email: 'string',
    firstName: 'string',
    lastName: 'string',
    surferMessage: 'string',
    surferCountry: 'string',
    status: 'string',
    createdBy: 'string',
    updatedBy: 'string',
    dateCreated: 'string',
    dateUpdated: 'string',
  },
  required: ['email', 'firstName', 'surferMessage'],
};

export interface IAuthorization {
  _id?: string;
  email: string;
  key?: string;
  verb: string;
  entity: string;
  keyHash?: string;
  revoked?: boolean;
  expiry?: string;
  createdBy?: string;
  updatedBy?: string;
  dateCreated?: string;
  dateUpdated?: string;
}

export interface ISimpleAuthorization {
  email: string;
  key: string;
  operation: string;
}

/**Captcha*/
export interface ICaptchaScore {
  action: string;
  dateOfBotChallenge: string;
  host: string;
  score: number;
  success: boolean;
}

export type IUserDataOrCustomData = IUserData[] | IUserData | ICustomData;

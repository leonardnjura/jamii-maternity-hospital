export type Schema = {
  fields: { [key: string]: string };
  required?: string[];
};

const required = (obj: any, required: string[]) => {
  for (let key of required) {
    if (obj[key] === undefined) return false;
  }
  return true;
};

export const validate = async (obj: any, model: Schema) => {
  if (model.required) {
    const status = required(obj, model.required);
    if (!status) return false;
  }

  for (let key of Object.keys(obj)) {
    if (model.fields[key] === undefined) return false;
    else if (typeof obj[key] !== model.fields[key]) return false;
  }
  return true;
};

export const stripFields = (obj: object, ignoreList: string[]) => {
  function replacer(key: string, value: any) {
    if (ignoreList.indexOf(key) > -1) return undefined;
    else return value;
  }

  return JSON.stringify(obj, replacer);
};

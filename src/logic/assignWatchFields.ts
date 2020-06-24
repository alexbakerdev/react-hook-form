import transformToNestObject from './transformToNestObject';
import get from '../utils/get';
import isEmptyObject from '../utils/isEmptyObject';
import isUndefined from '../utils/isUndefined';
import { DeepPartial } from '../types/utils';
import {
  FieldValue,
  FieldValues,
  InternalFieldName,
  UnpackNestedValue,
} from '../types/form';

export default <TFieldValues extends FieldValues>(
  fieldValues: TFieldValues,
  fieldName: InternalFieldName<TFieldValues>,
  watchFields: Set<InternalFieldName<TFieldValues>>,
):
  | FieldValue<TFieldValues>
  | UnpackNestedValue<DeepPartial<TFieldValues>>
  | undefined => {
  watchFields.add(fieldName);

  if (isEmptyObject(fieldValues)) {
    return undefined;
  }

  if (!isUndefined(fieldValues[fieldName])) {
    return fieldValues[fieldName];
  }

  return get(transformToNestObject(fieldValues), fieldName);
};

import * as React from 'react';
import { useFormContext } from './useFormContext';
import isUndefined from './utils/isUndefined';
import isString from './utils/isString';
import generateId from './logic/generateId';
import {
  UseWatchOptions,
  FieldValues,
  UnpackNestedValue,
  Control,
} from './types/form';
import { LiteralToPrimitive, DeepPartial } from './types/utils';

export function useWatch<TWatchFieldValues extends FieldValues>(props: {
  defaultValue?: UnpackNestedValue<DeepPartial<TWatchFieldValues>>;
  control?: Control;
}): UnpackNestedValue<DeepPartial<TWatchFieldValues>>;
export function useWatch<TWatchFieldValue extends any>(props: {
  name: string;
  control?: Control;
}): undefined | UnpackNestedValue<LiteralToPrimitive<TWatchFieldValue>>;
export function useWatch<TWatchFieldValue extends any>(props: {
  name: string;
  defaultValue: UnpackNestedValue<LiteralToPrimitive<TWatchFieldValue>>;
  control?: Control;
}): UnpackNestedValue<LiteralToPrimitive<TWatchFieldValue>>;
export function useWatch<TWatchFieldValues extends FieldValues>(props: {
  name: string[];
  defaultValue?: UnpackNestedValue<DeepPartial<TWatchFieldValues>>;
  control?: Control;
}): UnpackNestedValue<DeepPartial<TWatchFieldValues>>;
export function useWatch<TWatchFieldValues>({
  control,
  name,
  defaultValue,
}: UseWatchOptions): TWatchFieldValues {
  const methods = useFormContext();
  const { watchFieldsHookRef, watchFieldsHookRenderRef, watchInternal } =
    control || methods.control;
  const idRef = React.useRef<string>('');
  const defaultValueRef = React.useRef(defaultValue);
  const initialValueRef = React.useRef<unknown>();

  const [value, setValue] = React.useState<unknown>(
    isUndefined(defaultValue)
      ? isString(name)
        ? defaultValue
        : {}
      : defaultValue,
  );

  const nameCache = React.useMemo(
    () => name,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    Array.isArray(name) ? [...name] : [name],
  );

  React.useEffect(
    () => {
      const id = (idRef.current = generateId());
      const watchFieldsHook = watchFieldsHookRef.current;
      watchFieldsHook[id] = new Set();
      initialValueRef.current = undefined;

      return () => {
        delete watchFieldsHook[id];
      };
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [nameCache],
  );

  const updateWatchValue = React.useCallback(
    () =>
      setValue(
        watchInternal(nameCache, defaultValueRef.current, idRef.current),
      ),
    [nameCache, watchInternal],
  );

  React.useEffect(() => {
    const id = idRef.current;
    const watchFieldsHookRender = watchFieldsHookRenderRef.current;
    watchFieldsHookRender[id] = updateWatchValue;

    initialValueRef.current = watchInternal(
      nameCache,
      defaultValueRef.current,
      idRef.current,
    );

    return () => {
      delete watchFieldsHookRender[id];
    };
  }, [
    nameCache,
    idRef,
    defaultValueRef,
    updateWatchValue,
    watchFieldsHookRenderRef,
    watchInternal,
  ]);

  return (isUndefined(initialValueRef.current)
    ? isUndefined(value)
      ? defaultValueRef.current
      : value
    : isUndefined(value)
    ? initialValueRef.current
    : value) as TWatchFieldValues;
}

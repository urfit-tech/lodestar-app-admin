import { converge, curry, evolve, identity, map, mapObjIndexed, mergeRight, omit, pipe, values } from 'ramda'

const generatePartialWithNewKey =
  <O extends object, OldKey extends keyof O, Key extends keyof object>(keysMap: Record<Key, OldKey>) =>
  (obj: O) =>
    mapObjIndexed((oldKey: OldKey) => (obj?.[oldKey] ? obj[oldKey] : undefined))(keysMap)

export const renameKey: <O extends object, OldKey extends keyof O, Key extends string>(
  keysMap: Record<Key, OldKey>,
  obj: O,
) => Partial<O> & Record<Key, any> = <O extends object, OldKey extends keyof O, Key extends string>(
  keysMap: Record<Key, OldKey>,
  obj: O,
) =>
  pipe(
    converge(mergeRight as any, [generatePartialWithNewKey(keysMap as any) as any, identity as (obj: O) => O]),
    omit(values(keysMap) as Array<string>) as (
      obj: Record<OldKey, any> & Record<Key, any>,
    ) => Partial<O> & Record<Key, any>,
  )(obj)

export const evolveWithSelf = curry(
  <O extends object, Key extends keyof O>(keyMap: Record<Key, (obj: O) => Function>) =>
    converge(evolve as any, [obj => map((func: Function) => () => func(obj))(keyMap as any) as any, identity]),
)

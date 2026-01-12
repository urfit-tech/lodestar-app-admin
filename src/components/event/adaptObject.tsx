import { converge, curry, evolve, identity, ifElse, isNotNil, map, mapObjIndexed, mergeRight, omit, pipe, values } from 'ramda'

const generatePartialWithNewKey =
  <O extends object, OldKey extends keyof O, Key extends keyof object>(keysMap: Record<Key, OldKey>) =>
  (obj: O) =>
    mapObjIndexed((oldKey: OldKey) => (obj?.[oldKey] ? obj[oldKey] : undefined))(keysMap)

export const renameKey = curry(
  <O extends object, OldKey extends keyof O, Key extends string>(keysMap: Record<Key, OldKey>, obj: O) =>
    pipe<[O], Record<Key | OldKey, O[OldKey]>, Partial<O> & Record<Key, O[OldKey]>>(
      converge(mergeRight as any, [generatePartialWithNewKey(keysMap as any) as any, identity as (obj: O) => O]),
      omit(values(keysMap) as Array<string>) as (
        obj: Record<Key | OldKey, O[OldKey]>,
      ) => Partial<O> & Record<Key, O[OldKey]>,
    )(obj),
)

export const evolveWithSelf = curry(
  <O extends object, Key extends keyof O>(keyMap: Record<Key, (obj: O) => Function>) =>
    converge(evolve as any, [obj => map((func: Function) => () => func(obj))(keyMap as any) as any, identity]),
)

export const sealIf = curry<
  (cond: (...arg: Array<any>) => boolean, fn: (...arg: Array<any>) => any) => (...arg: Array<any>) => any
>((cond, fn) => ifElse(cond, fn, identity))

export const sealNil = sealIf(isNotNil)

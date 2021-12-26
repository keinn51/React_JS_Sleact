import { ChangeEvent, Dispatch, SetStateAction, useCallback, useState } from 'react';

type ReturnTypes<T = any> = [T, Dispatch<SetStateAction<T>> , (e: ChangeEvent<HTMLInputElement>) => void];

const useInput = <T = any>(initialData: T): ReturnTypes<T> => {
  const [value, setValue] = useState(initialData);
  const handler = useCallback((e) => {
    setValue(e.target.value);
  }, []);
  return [value, setValue, handler];
};

export default useInput;
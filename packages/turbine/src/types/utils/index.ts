type Modify<T, R> = Omit<T, keyof R> & R;
type RemoveIndex<T, K> = T extends K ? never : T;

export { Modify, RemoveIndex };
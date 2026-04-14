export interface ResponseAPI<T> {
    status: boolean;
    value: T;
    msg?: string;
}
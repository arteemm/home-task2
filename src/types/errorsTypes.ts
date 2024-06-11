export type ValidationResultError = {
    message: string;
    field: string;
};

export type ErrorObject = {
    errorsMessages : ValidationResultError[];
};


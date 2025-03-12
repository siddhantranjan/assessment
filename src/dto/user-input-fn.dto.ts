export interface UserInput {
    getCredentials: () => Promise<{ username: string; password: string }>;
    getFilterInput: (idMappedByYear: { [year: string]: string }) => Promise<string>;
    closeReadline: () => void;
    askForFilter: () => Promise<boolean>;
}
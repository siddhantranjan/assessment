
import * as readline from 'readline';
import { UserInput } from './dto/user-input-fn.dto';

export const getUserInput = async(): Promise<UserInput> => {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    const regexList: any = [/^(?:(?!\.{2,}).)*$/, /^([\p{L}\p{M}\p{N}+\-#$!%&_])([\p{L}\p{M}\p{N}.+\-#$!%&_]){0,99}@([\p{L}\p{M}\p{N}.+\-#$!%&_]{1,253}\.){1,8}[a-zA-Z]{2,63}$/u];

    const askQuestion = (query: string): Promise<string> => {
        return new Promise((resolve) => rl.question(query, (answer) => resolve(answer)));
    };

    const getCredentials = async (): Promise<{ username: string; password: string }> => {
        const username = await askQuestion('Enter your Amazon India username/email: ');
        const isEmailValid = regexList.every((regex: any) => regex.test(username));

        if (!isEmailValid) {
            console.error('Invalid email address. Please try again.');
            return getCredentials();
        }
        
        const password = await askQuestion('Enter your Amazon India password: ');
        return { username, password };
    };

    const getFilterInput = async (idMappedByYear: { [year: string]: string }): Promise<string> => {
        const year = await askQuestion(`Select time filter: ${Object.keys(idMappedByYear).join(' | ')}: `);
        return idMappedByYear[year];
    };

    const askForFilter = async (): Promise<boolean> => {
        const response = await askQuestion('Do you want to apply a filter? (yes/no): ');
        return ["yes", "y"].includes(response.toLowerCase());
    };

    const closeReadline = () => rl.close();
    return { getCredentials, getFilterInput, closeReadline, askForFilter };
}
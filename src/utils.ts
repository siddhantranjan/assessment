
import * as readline from 'readline';
import { UserInput } from './dto/user-input-fn.dto';

export const getUserInput = async(): Promise<UserInput> => {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    const askQuestion = (query: string): Promise<string> => {
        return new Promise((resolve) => rl.question(query, (answer) => resolve(answer)));
    };

    const getCredentials = async (): Promise<{ username: string; password: string }> => {
        const username = await askQuestion('Enter your Amazon India username/email: ');
        const password = await askQuestion('Enter your Amazon India password: ');
        return { username, password };
    };

    const getFilterInput = async (idMappedByYear: { [year: string]: string }): Promise<string> => {
        const year = await askQuestion(`Select time filter: ${Object.keys(idMappedByYear).join(' | ')}: `);
        return idMappedByYear[year];
    };

    const askForFilter = async (): Promise<boolean> => {
        const response = await askQuestion('Do you want to apply a filter? (yes/no): ');
        return response === 'yes' || response === 'y';
    };

    const closeReadline = () => rl.close();
    return { getCredentials, getFilterInput, closeReadline, askForFilter };
}
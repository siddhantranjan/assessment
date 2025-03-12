
import * as readline from 'readline';
import { UserInput } from './dto/user-input-fn.dto';

export const getUserInput = async(): Promise<UserInput> => {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    const getCredentials = async (): Promise<{ username: string; password: string }> => {
        const username = await new Promise<string>((resolve) => {
            rl.question('Enter your Amazon India username/email: ', (answer) => resolve(answer));
        });
    
        const password = await new Promise<string>((resolve) => {
            rl.question('Enter your Amazon India password: ', (answer) => resolve(answer));
        });
        return { username, password };
    }

    const getFilterInput = async (idMappedByYear: { [year: string]: string }): Promise<string> => {
        const year = await new Promise<string>((resolve) => {
            rl.question(`Select time filter : ${Object.keys(idMappedByYear).join(' | ')}: `, (answer) => resolve(answer));
        });
    
        return idMappedByYear[year];
    }

    const closeReadline = () => rl.close();
    return { getCredentials, getFilterInput, closeReadline };
}
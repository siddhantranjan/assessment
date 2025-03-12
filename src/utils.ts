
import * as readline from 'readline';

export const getCredentials = async(): Promise<{ username: string; password: string }> => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const username = await new Promise<string>((resolve) => {
    rl.question('Enter your Amazon India username/email: ', (answer) => resolve(answer));
  });

  const password = await new Promise<string>((resolve) => {
    rl.question('Enter your Amazon India password: ', (answer) => resolve(answer));
  });

  rl.close();
  return { username, password };
}
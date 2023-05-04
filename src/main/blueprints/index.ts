import { ipcMain } from 'electron';
import { readdirSync, readFileSync, statSync, rmSync, writeFileSync } from 'fs';
import path, { join } from 'path';

const projectPath =
  '/Users/michaelkriel/Documents/PersonalApps/music/visual-scripting-official/blueprints-test';

const recursiveDir = async (dirPath: string) => {
  const directory = await readdirSync(dirPath);
  const result: any = await Promise.all(
    directory.map(async (item) => {
      const itemPath = path.join(dirPath, item);
      const stats = await statSync(itemPath);
      return {
        name: item,
        path: itemPath,
        children: stats.isDirectory() ? await recursiveDir(itemPath) : [],
        isDirectory: stats.isDirectory(),
      };
    })
  );
  return result;
};

export const bluePrintsIPC = () => {
  ipcMain.on('get-project-directory', async (event, arg) => {
    const directory = await recursiveDir(projectPath);
    event.reply(
      'get-project-directory',
      JSON.stringify({
        name: 'base',
        children: directory,
      })
    );
  });

  ipcMain.on('get-file-contents', async (event, arg) => {
    const contents = await readFileSync(arg);
    event.reply('get-file-contents', {
      path: arg,
      contents: contents.toString(),
    });
  });

  ipcMain.on('create-blueprint', async (event, arg) => {
    await writeFileSync(
      join(arg.path, `${arg.name}.json`),
      JSON.stringify([], null, 2)
    );
    const directory = await recursiveDir(projectPath);
    event.reply(
      'get-project-directory',
      JSON.stringify({
        name: 'base',
        children: directory,
      })
    );
  });

  ipcMain.on('update-blueprint', async (event, arg) => {
    await writeFileSync(arg.path, arg.content);
  });

  ipcMain.on('remove-blueprint', async (event, arg) => {
    const contents = await rmSync(arg);
    const directory = await recursiveDir(projectPath);
    event.reply(
      'get-project-directory',
      JSON.stringify({
        name: 'base',
        children: directory,
      })
    );
  });
};

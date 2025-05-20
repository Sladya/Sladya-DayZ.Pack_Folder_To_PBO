import * as vscode from 'vscode';
import * as cp from 'child_process';

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand('pack-to-pbo.packClient', (uri: vscode.Uri) => {
      packFolder(uri, 'client');
    }),
    vscode.commands.registerCommand('pack-to-pbo.packServer', (uri: vscode.Uri) => {
      packFolder(uri, 'server');
    })
  );
}

async function packFolder(uri: vscode.Uri | undefined, target: 'client' | 'server') {
  if (!uri || !uri.fsPath) {
    vscode.window.showErrorMessage('Пожалуйста, выберите папку в проводнике');
    return;
  }

  // Проверяем, что выбран именно каталог
  try {
    const stat = await vscode.workspace.fs.stat(uri);
    if (stat.type !== vscode.FileType.Directory) {
      vscode.window.showErrorMessage('Выберите папку, а не файл');
      return;
    }
  } catch (error) {
    vscode.window.showErrorMessage('Не удалось проверить выбранный ресурс');
    return;
  }

  const folderPath = uri.fsPath;
  const config = vscode.workspace.getConfiguration('pack-to-pbo');

  const pboManagerPath = config.get<string>('pboManagerPath') || '';
  if (!pboManagerPath) {
    vscode.window.showErrorMessage('Не задан путь к PBOConsole.exe в настройках расширения');
    return;
  }

  let outputFolder = '';
  if (target === 'client') {
    outputFolder = config.get<string>('pboOutputClientFolder') || '';
  } else {
    outputFolder = config.get<string>('pboOutputServerFolder') || '';
  }

  if (!outputFolder) {
    vscode.window.showErrorMessage(`Не задана папка вывода для ${target} в настройках расширения`);
    return;
  }

  const pboOutput = `${outputFolder}\\${getFolderName(folderPath)}.pbo`;
  const args = ['-pack', folderPath, pboOutput];

  cp.execFile(pboManagerPath, args, (error, stdout, stderr) => {
    if (error) {
      vscode.window.showErrorMessage(`Ошибка упаковки: ${error.message}`);
      console.error(stderr);
      return;
    }
    vscode.window.showInformationMessage(`Папка упакована в ${pboOutput}`);
    console.log(stdout);
  });
}

function getFolderName(path: string): string {
  const parts = path.split(/[\\/]/);
  return parts[parts.length - 1];
}

export function deactivate() {}

"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode = require("vscode");
const cp = require("child_process");
function activate(context) {
    context.subscriptions.push(vscode.commands.registerCommand('pack-to-pbo.packClient', (uri) => {
        packFolder(uri, 'client');
    }), vscode.commands.registerCommand('pack-to-pbo.packServer', (uri) => {
        packFolder(uri, 'server');
    }));
}
exports.activate = activate;
function packFolder(uri, target) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!uri || !uri.fsPath) {
            vscode.window.showErrorMessage('Пожалуйста, выберите папку в проводнике');
            return;
        }
        // Проверяем, что выбран именно каталог
        try {
            const stat = yield vscode.workspace.fs.stat(uri);
            if (stat.type !== vscode.FileType.Directory) {
                vscode.window.showErrorMessage('Выберите папку, а не файл');
                return;
            }
        }
        catch (error) {
            vscode.window.showErrorMessage('Не удалось проверить выбранный ресурс');
            return;
        }
        const folderPath = uri.fsPath;
        const config = vscode.workspace.getConfiguration('pack-to-pbo');
        const pboManagerPath = config.get('pboManagerPath') || '';
        if (!pboManagerPath) {
            vscode.window.showErrorMessage('Не задан путь к PBOConsole.exe в настройках расширения');
            return;
        }
        let outputFolder = '';
        if (target === 'client') {
            outputFolder = config.get('pboOutputClientFolder') || '';
        }
        else {
            outputFolder = config.get('pboOutputServerFolder') || '';
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
    });
}
function getFolderName(path) {
    const parts = path.split(/[\\/]/);
    return parts[parts.length - 1];
}
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map
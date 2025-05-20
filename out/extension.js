"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const cp = __importStar(require("child_process"));
function activate(context) {
    context.subscriptions.push(vscode.commands.registerCommand('pack-to-pbo.packClient', (uri) => {
        packFolder(uri, 'client');
    }), vscode.commands.registerCommand('pack-to-pbo.packServer', (uri) => {
        packFolder(uri, 'server');
    }));
}
async function packFolder(uri, target) {
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
}
function getFolderName(path) {
    const parts = path.split(/[\\/]/);
    return parts[parts.length - 1];
}
function deactivate() { }
//# sourceMappingURL=extension.js.map
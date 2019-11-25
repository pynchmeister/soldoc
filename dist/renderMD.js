"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs_1 = __importDefault(require("fs"));
var path_1 = __importDefault(require("path"));
function renderContracts(contractsPreparedData, outputFolder, lineBreak) {
    contractsPreparedData.forEach(function (contract) {
        // transform the template
        var MDContent = "# " + contract.contractName + lineBreak;
        if (contract.contractData.contract !== undefined) {
            if (contract.contractData.contract.dev) {
                MDContent += "*" + contract.contractData.contract.dev + "*" + lineBreak;
            }
            if (contract.contractData.contract.notice) {
                MDContent += "" + contract.contractData.contract.notice + lineBreak;
            }
        }
        contract.contractData.functions.forEach(function (f) {
            MDContent += "## " + f.ast.name + lineBreak + lineBreak;
            if (f.comments === undefined) {
                return;
            }
            if (f.comments.dev) {
                MDContent += "*" + f.comments.dev + "*" + lineBreak + lineBreak;
            }
            if (f.comments.notice) {
                MDContent += "" + f.comments.notice + lineBreak + lineBreak;
            }
            var table = false;
            if (f.ast.parameters.length > 0) {
                table = true;
                MDContent += lineBreak + "|Input/Output|Data Type|Variable Name|Comment|" + lineBreak
                    + ("|----------|----------|----------|----------|" + lineBreak);
                f.ast.parameters.forEach(function (p) {
                    MDContent += "|input|" + p.typeName.name + "|" + p.name + "|" + f.comments.param.get(p.name) + "|" + lineBreak;
                });
            }
            if (f.ast.returnParameters !== null && f.ast.returnParameters.length > 0) {
                if (!table) {
                    MDContent += lineBreak + "|Input/Output|Data Type|Variable Name|Comment|" + lineBreak
                        + ("|----------|----------|----------|----------|" + lineBreak);
                }
                f.ast.returnParameters.forEach(function (p) {
                    MDContent += "|output|" + p.typeName.name + "|" + ((p.name === null) ? ('N/A') : (p.name)) + "|"
                        + (((f.comments.return.length === 0) ? ('N/A') : (f.comments.return)) + "|" + lineBreak);
                });
            }
            MDContent += lineBreak;
        });
        // write it to a file
        fs_1.default.writeFileSync(path_1.default.join(process.cwd(), outputFolder, contract.filename + ".md"), MDContent);
    });
}
exports.renderContracts = renderContracts;
function renderReadme(outputFolder) {
    var outputReadme;
    if (fs_1.default.existsSync(path_1.default.join(process.cwd(), 'README.md'))) {
        fs_1.default.copyFileSync(path_1.default.join(process.cwd(), 'README.md'), path_1.default.join(process.cwd(), outputFolder, 'README.md'));
        outputReadme = fs_1.default.readFileSync(path_1.default.join(process.cwd(), 'README.md'));
    }
    else {
        fs_1.default.writeFileSync(path_1.default.join(process.cwd(), outputFolder, 'README.md'), '# Hello');
        outputReadme = '# Hello';
    }
    // if there's an image reference in readme, copy it
    var files = [];
    // read dir
    var filesList = fs_1.default.readdirSync(process.cwd());
    // iterate over what was found
    filesList.forEach(function (file) {
        var stats = fs_1.default.lstatSync(path_1.default.join(process.cwd(), file));
        // if not, push file to list, only if it is valid
        if (stats.isFile() && (path_1.default.extname(file) === '.png' || path_1.default.extname(file) === '.jpg')) {
            files.push(file);
        }
    });
    // and if the file is n readme, copy it
    files.forEach(function (file) {
        if (outputReadme.includes(file)) {
            fs_1.default.copyFileSync(path_1.default.join(process.cwd(), file), path_1.default.join(process.cwd(), outputFolder, file));
        }
    });
}
exports.renderReadme = renderReadme;
function renderDocumentationIndex(content, outputFolder, contractsStructure, hasLICENSE, lineBreak) {
    var documentationIndexContent = content;
    if (hasLICENSE) {
        documentationIndexContent += "\t* [LICENSE](LICENSE.md)" + lineBreak;
        fs_1.default.copyFileSync(path_1.default.join(process.cwd(), 'LICENSE'), path_1.default.join(process.cwd(), outputFolder, 'LICENSE.md'));
    }
    documentationIndexContent += "* CONTRACTS" + lineBreak;
    contractsStructure.forEach(function (s) {
        documentationIndexContent += "\t* [" + s.name + "](" + s.name + ".md)" + lineBreak;
    });
    return documentationIndexContent;
}
exports.renderDocumentationIndex = renderDocumentationIndex;
//# sourceMappingURL=renderMD.js.map
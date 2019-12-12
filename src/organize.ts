import fs from 'fs';
import path from 'path';
import parser from 'solidity-parser-antlr';


function extendParamsAstWithNatspec(node: any) {
    if (node.parameters === null) {
        return null;
    }
    return node.parameters.map((parameter: any) => (
        {
            ...parameter,
            natspec:
                parameter.name === null ||
                    node.natspec === null ||
                    node.natspec.params === undefined
                    ? ''
                    : node.natspec.params[parameter.name],
        }
    ));
}
function extendReturnParamsAstWithNatspec(node: any) {
    if (node.returnParameters === null || node.returnParameters === undefined) {
        return null;
    }
    return node.returnParameters.map(
        (parameter: any) => (
            {
                ...parameter,
                natspec: node.natspec === null
                    ? ''
                    : node.natspec.return,
            }
        ));
}
/**
 * Merges the contract ast and comments into an array.
 * @param {string} solidityFile the file's path to be parsed
 */
function mergeInfoFile(solidityFile: string) {
    // read file
    const input = fs.readFileSync(solidityFile).toString();
    // parse it using solidity-parser-antlr
    const ast = parser.parse(input);
    // filter for contract definition
    const astContract = ast.children.filter((child: any) => child.type === 'ContractDefinition');
    // get basic information
    const rawContractData = { ast: astContract };
    // create an array to save the ast and comments
    const contractDataWithComments = {
        constructor: null,
        contract: undefined,
        events: [] as any,
        functions: [] as any,
    };
    // visit all the methods and add the commands to it
    parser.visit(rawContractData.ast, {
        ContractDefinition: (node: any) => {
            contractDataWithComments.contract = node;
        },
        EventDefinition: (node: any) => {
            contractDataWithComments.events.push({
                ast: node,
                parameters: extendParamsAstWithNatspec(node),
                returnParameters: extendReturnParamsAstWithNatspec(node),
            });
        },
        FunctionDefinition: (node: any) => {
            if (node.isConstructor) {
                contractDataWithComments.constructor = {
                    ast: node,
                    parameters: extendParamsAstWithNatspec(node),
                    returnParameters: extendReturnParamsAstWithNatspec(node),
                } as any;
            } else {
                contractDataWithComments.functions.push({
                    ast: node,
                    parameters: extendParamsAstWithNatspec(node),
                    returnParameters: extendReturnParamsAstWithNatspec(node),
                });
            }
        },
    });
    // return new info
    return [rawContractData.ast[0].name, contractDataWithComments];
}

/**
 * Prepare for the given file.
 * @param {string} solidityFilePath the file's path to be parsed
 */
export function prepareForFile(solidityFilePath: string) {
    // get current path folder
    const currentFolder = path.join(__dirname, '../');
    // get ast and comments
    const [contractName, contractData] = mergeInfoFile(solidityFilePath);
    // get the filename
    const filename = path.parse(solidityFilePath).name;
    return {
        contractData,
        contractName,
        currentFolder,
        filename,
        solidityFilePath,
    };
}

export function organizeContractsStructure(
    contractsPreparedData: any,
) {
    const contractsStructure: any = [];
    contractsPreparedData.forEach((contract: any) => {
        const contractInfo: any = {};
        // add name
        contractInfo.name = contract.contractName;
        contractInfo.filename = contract.filename;
        contractInfo.functions = [];
        // add functions name
        contract.contractData.functions.forEach((func: any) => {
            contractInfo.functions.push({ name: func.ast.name });
        });
        contractsStructure.push(contractInfo);
    });
    return contractsStructure;
}

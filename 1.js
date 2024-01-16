
//可以把JS源代码默认换成AST抽象语法树
const esprima = require('esprima');
//遍历语法树，可以用来修改树上的节点
const estraverse = require('estraverse');
//把修改后的语法树重新生成源代码
const escodegen = require('escodegen');

let sourceCode = `function ast(){}`;
//
let ast = esprima.parse(sourceCode);
let indent = 0;
const padding = ()=>' '.repeat(indent)
estraverse.traverse(ast,{
    enter(node){
        console.log(padding()+node.type+'进入');
        if(node.type === 'FunctionDeclaration'){
            node.id.name = 'newAst'
        }
        indent+=2;
    },
    leave(node){
        indent-=2;
        console.log(padding()+node.type+'离开');
    }
});
let code = escodegen.generate(ast);
console.log(code);

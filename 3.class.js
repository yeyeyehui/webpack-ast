// Babel 的编译器，核心 API 都在这里面，比如常见的 transform、parse,并实现了插件功能
const babelCore = require('@babel/core');
const types = require('@babel/types');
//用于 AST 节点的 Lodash 式工具库, 它包含了构造、验证以及变换 AST 节点的方法
const transformClasses = require('@babel/plugin-transform-classes');
const transformClasses2 = {
    visitor:{
        //如果是类的声明，就会进入此函数
        ClassDeclaration(path){
            console.log(`3.class.js 第10行第20列`,'path',path);
            const {node} = path;
            let id = node.id;//类名 Person
            let classMethods = node.body.body;//方法名
            let newNodes = [];//将要生成的新节点数组
            classMethods.forEach(classMethod=>{
                if(classMethod.kind === 'constructor'){
                    const constructorMethod = types.functionDeclaration(
                        id,//Person
                        classMethod.params,
                        classMethod.body
                    );
                    newNodes.push(constructorMethod);
                }else{
                    const memberExpression = types.memberExpression(
                        types.memberExpression(
                            id//Person
                            ,
                            types.identifier('prototype')//prototype
                        )
                        ,
                        classMethod.key //.getName
                    );
                    const functionExpression = types.functionExpression(
                        null,
                        classMethod.params,
                        classMethod.body
                    );
                    const assignmentExpression = types.assignmentExpression(
                        '=',
                        memberExpression,//Person.prototype.getName
                        functionExpression//function(){return this.name}
                    );
                    newNodes.push(assignmentExpression);
                }
            });
            //如果新创建的节点数量为0
            if(newNodes.length ===1){
                //在path上路径上，用唯一的一个新的节点替换掉老节点
                path.replaceWith(newNodes[0]);
            }else{
                //如果新节点是多个的话，使用多个节点替换一个节点
                path.replaceWithMultiple(newNodes);
            }
        }
    }
}
let sourceCode = `
 class Person {
    constructor(name) {
      this.name = name;
    }
    getName() {
      return this.name;
    }
  }
`;
let targetSource = babelCore.transform(sourceCode,{
    plugins:[
        transformClasses2
    ]
});
console.log(targetSource.code);

/**
var _this = this;
const sum = function (a, b) {
  console.log(_this);
  return a + b;
};

 */
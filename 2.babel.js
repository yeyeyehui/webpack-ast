// Babel 的编译器，核心 API 都在这里面，比如常见的 transform、parse,并实现了插件功能
const babelCore = require('@babel/core');
const { throwStatement } = require('@babel/types');
//用于 AST 节点的 Lodash 式工具库, 它包含了构造、验证以及变换 AST 节点的方法
const types = require('@babel/types');
//const arrowFunctions = require('babel-plugin-transform-es2015-arrow-functions');
const arrowFunctions2 = {
    visitor:{
        //当遍历语法遇到箭头函数的时候，执行此函数，参数是箭头函数的节点路径对象
        ArrowFunctionExpression(path){
            const {node} = path;
            hoistFunctionEnvironment(path);
            node.type = 'FunctionExpression';
            let body = node.body;
            //如果body不是一个块级语句的话 isXX用来判断某个AST语法树节点是不是某种类型
            if(!types.isBlockStatement(body)){
                //https://babeljs.io/docs/babel-types.html
                node.body = types.blockStatement([
                    types.returnStatement(body)
                ]);
            }
            //path.skip();
        }
    }
}
/**
 * 1.在函数的外部声明一个变量_this,值是this
 * 2.在函数体内把所有的this变成_this
 * @param {*} path 
 */
function hoistFunctionEnvironment(path){
    //indParent(callback)从当前节点一直向上找到根节点(不包括自己)
    const thisEnv = path.findParent(parent=>{
        //如果这个父节点是一个普通函数,或者是一个根节点的话返回此节点
      return (parent.isFunction()&&!parent.isArrowFunctionExpression())||parent.isProgram()
    });
    //1.需要确定在当前的作用域内是否使用到了this
    let thisPaths = getThisPaths(path);
    let thisBinding = '_this_';
    //const thisBinding = thisEnv.scope.generateUid('this');
    if(thisPaths.length>0){
       //在外层作用域中添加一个名为_this的变量，值为this,然后_this=this;
       //如果那个作用域里没有这个变量的话
       //_this=>__this=>___this
       if(!thisEnv.scope.hasBinding(thisBinding)){
            ///向thisEnv这个作用域内创建一个变量，变量名为_this,值为this
            thisEnv.scope.push({
                id:types.identifier(thisBinding),
                init:types.thisExpression()
            });
            
        } 
        thisPaths.forEach(thisPath=>{
            thisPath.replaceWith(types.identifier(thisBinding));
        });
    }
}
function getThisPaths(path){
    let thisPaths = [];
    //判断path的子节点
    path.traverse({
        ThisExpression(thisPath){
            thisPaths.push(thisPath);
        }
    });
    return thisPaths;
}
let sourceCode = `
let _this = 'xxx';
const sum = (a,b)=>{
    console.log(this);
    return a+b;
}
const minus = (a,b)=>{
    console.log(this);
    return a-b;
}
`;
let targetSource = babelCore.transform(sourceCode,{
    plugins:[
        arrowFunctions2
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
module.exports = {
  root: true,
  env: {
    node: true,
  },
  extends: [
    'plugin:vue/vue3-essential',
    'eslint:recommended',
    '@vue/typescript/recommended',
    'plugin:prettier/recommended',
  ],
  globals: {
    //忽略全局的变量
    $: true,
    defineProps: true,
    defineEmits: true,
    defineExpose: true,
  },
  parserOptions: {
    ecmaVersion: 2020,
  },
  // 0 代表关闭  1 代表警告  2 代表开启
  rules: {
    'prettier/prettier': 0,
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    //禁止使用异步函数作为 Promise executor
    'no-async-promise-executor': 1,
    // 禁止使用 await async
    'no-await-in-loop': 1,
    //函数参数不能重复
    'no-dupe-args': 2,
    //禁止正则表达式字面量中出现多个空格
    'no-regex-spaces': 2,
    //switch语句最后必须有default
    'default-case': 2,
    //禁止使用alert confirm prompt
    'no-alert': 0,
    //禁止使用数组构造器
    'no-array-constructor': 1,
    //禁止使用按位运算符
    'no-bitwise': 0,
    //禁止使用arguments.caller或arguments.callee
    'no-caller': 0,
    //禁止catch子句参数与外部作用域变量同名
    'no-catch-shadow': 2,
    //禁止给类赋值
    'no-class-assign': 0,
    //禁止在条件表达式中使用赋值语
    'no-cond-assign': 0,
    //禁止修改const声明的变量
    'no-const-assign': 0,
    //禁止在条件中使用常量表达式 if(true) if(1)
    'no-constant-condition': 0,
    //禁止使用continue
    'no-continue': 0,
    //禁止在正则表达式中使用控制字符
    'no-control-regex': 2,
    //不能对var声明的变量使用delete操作符
    'no-delete-var': 2,
    //不能使用看起来像除法的正则表达式/=foo/
    'no-div-regex': 1,
    //在创建对象字面量时不允许键重复 {a:1,a:1}
    'no-dupe-keys': 2,
    //switch中的case标签不能重复
    'no-duplicate-case': 2,
    //如果if语句里面有return,后面不能跟else语句
    'no-else-return': 0,
    //块语句中的内容不能为空
    'no-empty': 2,
    //正则表达式中的[]内容不能为空
    'no-empty-character-class': 2,
    //禁止对null使用==或!=运算符
    'no-eq-null': 1,
    //禁止使用eval
    'no-eval': 0,
    //禁止给catch语句中的异常参数赋值
    'no-ex-assign': 2,
    //禁止扩展native对象
    'no-extend-native': 0,
    //禁止不必要的函数绑定
    'no-extra-bind': 2,
    //禁止不必要的bool转换
    'no-extra-boolean-cast': 2,
    //禁止非必要的括号
    'no-extra-parens': 0,
    //禁止多余的冒号
    'no-extra-semi': 2,
    //禁止switch穿透
    'no-fallthrough': 1,
    //禁止省略浮点数中的0 .5 3.
    'no-floating-decimal': 2,
    //禁止重复的函数声明
    'no-func-assign': 2,
    //禁止隐式转换
    'no-implicit-coercion': 1,
    //禁止使用隐式eval
    'no-implied-eval': 2,
    //禁止行内备注
    'no-inline-comments': 1,
    //禁止在块语句中使用声明（变量或函数）
    'no-inner-declarations': [0, 'functions'],
    //禁止无效的正则表达式
    'no-invalid-regexp': 2,
    //禁止无效的this，只能用在构造器，类，对象字面量
    'no-invalid-this': 2,
    //不能有不规则的空格
    'no-irregular-whitespace': 2,
    //禁止使用__iterator__ 属性
    'no-iterator': 0,
    //label名不能与var声明的变量名相同
    'no-label-var': 2,
    //禁止标签声明
    'no-labels': 0,
    //禁止不必要的嵌套块
    'no-lone-blocks': 2,
    //禁止else语句内只有if语句
    'no-lonely-if': 1,
    //禁止在循环中使用函数（如果没有引用外部变量不形成闭包就可以）
    'no-loop-func': 1,
    //声明时不能混用声明类型
    'no-mixed-requires': [0, false],
    //禁止混用tab和空格
    'no-mixed-spaces-and-tabs': [2, false],
    //换行风格
    'linebreak-style': [0, 'windows'],
    //不能用多余的空格
    'no-multi-spaces': 1,
    //字符串不能用\换行
    'no-multi-str': 2,
    //空行最多不能超过2行
    'no-multiple-empty-lines': [1, { max: 2 }],
    //不能重写native对象
    'no-native-reassign': 0,
    //in 操作符的左边不能有!
    'no-negated-in-lhs': 2,
    //禁止使用嵌套的三目运算
    'no-nested-ternary': 0,
    //禁止在使用new构造一个实例后不赋值
    'no-new': 1,
    //禁止使用new Function
    'no-new-func': 1,
    //禁止使用new Object()
    'no-new-object': 1,
    //禁止使用new require
    'no-new-require': 1,
    //禁止使用new创建包装实例，new String new Boolean new Number
    'no-new-wrappers': 1,
    //不能调用内置的全局对象，比如Math() JSON()
    'no-obj-calls': 0,
    //禁止使用八进制数字
    'no-octal': 2,
    //禁止使用八进制转义序列
    'no-octal-escape': 2,
    //禁止给参数重新赋值
    'no-param-reassign': 0,
    //node中不能使用__dirname或__filename做路径拼接
    'no-path-concat': 0,
    //禁止使用++，--
    'no-plusplus': 1,
    //禁止使用process.env
    'no-process-env': 0,
    //禁止使用process.exit()
    'no-process-exit': 0,
    //禁止使用__proto__属性
    'no-proto': 0,
    //禁止重复声明变量
    'no-redeclare': 2,
    //如果禁用了指定模块，使用就会报错
    'no-restricted-modules': 0,
    //return 语句中不能有赋值表达式
    'no-return-assign': 1,
    //禁止使用javascript:void(0)
    'no-script-url': 0,
    //不能比较自身
    'no-self-compare': 2,
    //禁止使用逗号运算符
    'no-sequences': 0,
    //外部作用域中的变量不能与它所包含的作用域中的变量或参数同名
    'no-shadow': 0,
    //严格模式中规定的限制标识符不能作为声明时的变量名使用
    'no-shadow-restricted-names': 2,
    //函数调用时 函数名与()之间不能有空格
    'no-spaced-func': 2,
    //禁止稀疏数组， [1,,2]
    'no-sparse-arrays': 2,
    //nodejs 禁止同步方法
    'no-sync': 0,
    //禁止使用三目运算符
    'no-ternary': 0,
    //一行结束后面不要有空格
    'no-trailing-spaces': 1,
    //在调用super()之前不能使用this或super
    'no-this-before-super': 0,
    //禁止抛出字面量错误 throw "error";
    'no-throw-literal': 1,
    //不能有未定义的变量
    'no-undef': 1,
    //变量初始化时不能直接给它赋值为undefined
    'no-undef-init': 1,
    //不能使用undefined
    'no-undefined': 1,
    //避免多行表达式
    'no-unexpected-multiline': 2,
    //标识符不能以_开头或结尾
    'no-underscore-dangle': 1,
    //禁止不必要的嵌套 var isYes = answer === 1 ? true : false;
    'no-unneeded-ternary': 1,
    //不能有无法执行的代码
    'no-unreachable': 2,
    //禁止无用的表达式
    'no-unused-expressions': 0,
    //不能有声明后未被使用的变量或参数
    // 'no-unused-vars': [2, { vars: 'all', args: 'after-used' }],
    //未定义前不能使用
    'no-use-before-define': 0,
    //禁止不必要的call和apply
    'no-useless-call': 2,
    //禁用void操作符
    'no-void': 2,
    //禁用var，用let和const代替
    'no-var': 0,
    'no-empty-function': 'off',
    // 引号类型
    quotes: [1, 'single'],
    // 对象字面量中的属性名是否强制双引号
    'quote-props': [2, 'as-needed', { numbers: true }],
    'vue/multi-word-component-names': 'off',
    '@typescript-eslint/no-shadow': ['error'],
    //不能有声明后未被使用的变量或参数
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': [1],
    '@typescript-eslint/no-non-null-assertion': 'off',
    '@typescript-eslint/no-empty-function': 'off',
  },
  overrides: [
    {
      files: ['**/__tests__/*.{j,t}s?(x)', '**/tests/unit/**/*.spec.{j,t}s?(x)'],
      env: {
        jest: true,
      },
    },
  ],
};

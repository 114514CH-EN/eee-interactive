/* MSSE cards. [kind, question, answer] */
window.CARDS=window.CARDS||[];
(function(){const r=String.raw,N='https://app.notion.com/p/';
const D=(l,t,id,arr)=>arr.forEach((x,i)=>window.CARDS.push({id:l+'-'+(i+1),c:'SE',l,t,u:N+id,k:x[0],q:x[1],a:x[2]}));

D('SE1','模块概述与 Python 入门','3ea202737d7a8149bc8bfd8c41cfa6e8',[
['q',r`SDLC 的 10 个阶段？哪一个产出 Functional Requirements Document？`,r`Initiation → Concept Development → Planning → **Requirements Analysis（产出 FRD）** → Design → Development → Integration & Test → Implementation → O&M → Disposition`],
['q',r`V 模型左右四对是怎么对应的？`,r`- Operational Concepts ↔ Acceptance Testing
- Requirements ↔ System Testing
- Architecture ↔ Integration Testing
- Design ↔ Unit Testing
V 的底点是 Coding。`],
['q',r`Verification 和 Validation 的区别？举个例子。`,r`Verification：building the product **right**（符合规格）。Validation：building the **right** product（满足用户需求）。水壶 3 分钟烧开 = 验证通过；用户其实要 70 °C 泡茶 = 确认失败。`],
['q',r`Top-Down 和 Bottom-Up 的区别？`,r`Top-Down（decomposition）：从整体需求逐层拆成功能对象。Bottom-Up：把底层部件拼起来，涌现出更高层的系统。`],
['q',r`本模块考核由哪几部分组成？`,r`Lab Notebooks 30% · Weekly Quizzes 10% · Python Class Test 30% · SysML Report 30%`],
['q',r`编译型和解释型的区别？Python 为什么叫 glueing language？`,r`编译型先整体翻译（.java → .class）再运行；解释型直接执行源码。Python 容易和 C、各种系统对接，把不同语言写的组件粘成一个系统。`],
]);

D('SE2','Python 编程基础','3ea202737d7a8198b4e4d36a2616a394',[
['q',r`‹Print("Hi")› 和 ‹print("Hi"› 分别报什么错？`,r`前者 **NameError**（运行时找不到名字，区分大小写）；后者 **SyntaxError**（括号不配对，一行都不运行）。`],
['q',r`动态类型和强类型分别指什么？‹"a" + 1› 会怎样？`,r`动态：不用声明，运行时自动确定类型。强：不在不兼容类型之间隐式转换。‹"a" + 1› → TypeError，要 ‹"a" + str(1)›。`],
['q',r`Python 3 中 ‹7 // 2›、‹7 / 2›、‹'Python'[-1]›、‹'Python'[1:4]›？`,r`‹3›、‹3.5›、‹'n'›、‹'yth'›（切片左闭右开）`],
['q',r`‹2bob›、‹_2_bob_›、‹class›、‹Bob›、‹my-var› 哪些是合法变量名？`,r`合法：‹_2_bob_›、‹Bob›。不合法：‹2bob›（数字开头）、‹class›（保留字）、‹my-var›（被当成减法）。`],
['q',r`‹word[0] = "J"› 会怎样？怎样得到 "Jello"？`,r`TypeError：字符串不可变。新建一个：‹"J" + word[1:]› 或 ‹word.replace("H", "J")›。`],
['err',r`课件里哪些例子是按 Python 2 写的？`,r`- ‹5 / 2› 写成 2（Python 3 是 2.5，整除用 ‹//›）
- ‹'Hello'[1:2]› 写成 ‹'el'›（实际 ‹'e'›）
- ‹print x›、‹raw_input()›（Python 3：‹print(x)›、‹input()›）`],
]);

D('SE3','控制流与函数','3ea202737d7a81209a63caf40ccc3b70',[
['q',r`‹range(1, 10, 3)› 产生哪些数？Python 3 里 ‹range(10)› 返回什么？`,r`1, 4, 7（不含 10）。返回 range 对象，要看内容用 ‹list(range(10))›。`],
['q',r`循环后面的 else 什么时候执行？`,r`循环**正常结束、没有被 break 打断**时执行（no-break）。素数例子：找到因数就 break，找不到才打印 prime。else 和 for 对齐。`],
['q',r`parrot 的四个错误调用各错在哪？‹parrot()›、‹parrot(voltage=5.0, 'dead')›、‹parrot(110, voltage=220)›、‹parrot(actor='John')›`,r`- 缺必填参数 voltage
- 关键字参数后跟位置参数（SyntaxError）
- voltage 给了两次
- 没有叫 actor 的参数`],
['q',r`‹x = 10›；‹def g(): x = 5›；‹g()›；‹print(x)› 输出多少？怎样让 g 改外面的 x？`,r`10（函数里的 x 是新的局部变量）。在函数里先写 ‹global x›；更好的是 ‹return› 新值。`],
['q',r`‹f = make_incrementor(5)› 之后 ‹f(10)› 是多少？为什么？`,r`15。返回的 ‹lambda x: x + n› 记住了外层的 n = 5（闭包）。`],
['err',r`为什么不要写 ‹def f(x, L=[])›？`,r`默认值只在定义时算一次，同一个列表在多次调用间共享、越积越多。写 ‹L=None›，在函数里 ‹if L is None: L = []›。`],
['err',r`课件 Week 3 部分的 Python 2 写法有哪些？`,r`‹raw_input›、‹n/x›（应 ‹n // x›）、‹print(b),›（应 ‹end=' '›）、‹raise IOError, '...'›、弯引号 ’。`],
]);

D('SE4','序列、模块与异常','3ea202737d7a8120a8f0d3e1344dce5e',[
['q',r`list、tuple、str 哪些可以修改？‹('foo')› 和 ‹('foo',)› 是什么类型？`,r`只有 list 可改。‹('foo')› 是 str，‹('foo',)› 是 tuple——决定元组的是逗号。`],
['q',r`‹append› 和 ‹extend› 的区别？‹b = a.sort()› 得到什么？`,r`append 加一个元素（加列表会嵌套），extend 拆开加。‹sort()› 原地排序返回 None，要新列表用 ‹sorted(a)›。`],
['q',r`栈和队列分别怎么用列表实现？`,r`栈 LIFO：‹append› + ‹pop()›。队列 FIFO：‹append› + ‹pop(0)›（长列表建议 ‹collections.deque›）。课件把两者写反了。`],
['q',r`‹[x*y for x in [1, 2] for y in [10, 20]]› 的结果？`,r`[10, 20, 20, 40]——左边的 for 是外层。`],
['q',r`为什么列表不能当字典的键？`,r`字典靠键的哈希值定位；列表可变，改了哈希就对不上 → ‹TypeError: unhashable type: 'list'›。元组可以（元素也不可变时）。`],
['q',r`‹(1, 2) < (1, 2, -1)› 和 ‹'Pascal' < 'Python'›？规则是什么？`,r`都是 True。逐个比较，第一个不同的元素决定；全部相同时短的（前缀）更小；字符按编码比。`],
['q',r`‹import fibo› 和 ‹from fibo import fib› 的区别？`,r`前者要写 ‹fibo.fib()›，不会冲突；后者直接 ‹fib()›，但会覆盖当前同名的东西，且只导入了 fib。`],
['q',r`try / except 的执行流程？`,r`先执行 try → 没异常跳过 except → 有异常则 try 剩下的不执行，跳到匹配的 except → 没匹配就交给外层，最终未处理则程序终止。只捕获预料到的异常类型。`],
]);
D('SE5','面向对象与常见误区','3ea202737d7a81f2a6ceccc0045ede91',[
['q',r`类 class 和实例 instance 是什么关系？讲义用了什么比喻？`,r`类是模板（cookie cutter 饼干模具），实例是按模板造出来的对象（饼干）。每个实例有自己的数据；方法只在类里放一份，大家共用。`],
['q',r`‹__init__› 是做什么的？什么时候被调用？`,r`构造（初始化）方法。写 ‹student("Bob", 21)› 时 Python 先造一个空对象，再自动调用 ‹__init__(新对象, "Bob", 21)› 给它加属性。Python 没有 new 关键字。`],
['q',r`‹self› 是什么？为什么定义时要写、调用时不写？`,r`每个方法的第一个参数，指向调用这个方法的实例（类似 Java/C++ 的 this）。‹f.get_age()› 等价于 ‹student.get_age(f)›，Python 自动把 f 传给 self。`],
['q',r`方法定义漏了 self（‹def get_age():›）会怎样？`,r`调用 ‹s.get_age()› 时 Python 仍然传入 s，多出一个参数 → ‹TypeError: get_age() takes 0 positional arguments but 1 was given›（讲义第 30 页就漏了）。`],
['q',r`‹x = MyClass› 和 ‹x = MyClass()› 有什么区别？`,r`没括号：x 只是类本身的另一个名字；有括号：创建一个新实例。同理 ‹foo› 只是函数对象，‹foo()› 才是调用。`],
['q',r`类属性和实例属性有什么区别？‹x.i = 5› 之后 ‹MyClass.i› 是多少？`,r`类属性写在类体里，所有实例共享；实例属性用 ‹self.x = …› 或 ‹x.attr = …› 加在某个对象上。‹x.i = 5› 只给 x 自己加了 i，‹MyClass.i› 仍是 123。`],
['q',r`Python 查找名字的顺序？赋值写到哪一层？`,r`L → E → G → B：局部、外层函数、模块全局、内置。赋值默认只写最内层；改全局要 ‹global›，改外层函数的要 ‹nonlocal›。`],
['q',r`怎样定义子类？子类的 ‹__init__› 里通常先做什么？`,r`‹class Cs_student(student):›——父类写在括号里（没有 extends）。先调用父类初始化：‹super().__init__(n, a)›（或 ‹student.__init__(self, n, a)›），再加自己的属性。子类可重写（override）父类方法。`],
['q',r`Python 要不要手动释放对象？讲义说「没有析构函数」对吗？`,r`不用，引用全部消失后自动垃圾回收。但有 ‹__del__›（对象被回收前调用），只是时机不保证、很少用，所以讲义的说法不准确。`],
['q',r`讲义说的四种编程风格是什么？`,r`函数式（等式驱动，如 ‹functools.reduce›）、命令式（改变状态的语句）、面向对象（数据和方法打包在对象里）、过程式（步骤放进函数）。注意例子里 ‹sum = …› 会遮住内置函数 sum。`],
['q',r`下面哪些是语法错误（一行都不运行）？‹n-gon = 5› ‹123 = n› ‹if x = 0:› ‹setPenColor(blue)›`,r`前三个是 SyntaxError，编译时就报；‹setPenColor(blue)› 语法没问题，运行到那一行才 ‹NameError: name 'blue' is not defined›。`],
['q',r`‹x = 3; x =+ 2› 之后 x 是多少？‹a and b > 0› 的意思？`,r`x = 2（‹=+ 2› 是赋值为正 2，不报错）。‹a and b > 0› 是 ‹a and (b > 0)›，a 只要非零就算真；要写 ‹a > 0 and b > 0›。`],
['q',r`‹if x < 3 == True:› 在 x = 1 时为什么是 False？`,r`这是链式比较：‹(x < 3) and (3 == True)›，后半是 False。条件本身已是布尔值，不要再和 True 比。`],
['err',r`本讲最容易犯的错？`,r`- 方法漏写 self；方法里访问属性漏写 ‹self.›
- ‹MyClass› 和 ‹MyClass()› 混用
- 参数名、变量名遮住同名函数（‹left(90)› → 'str' object is not callable）
- ‹=+› / ‹=*› 写反，‹//› 当 ‹%› 用
- 拼错的名字只有运行到那一行才报错`],
['fix',r`讲义第 30 页的子类代码有哪些问题？`,r`- ‹Class› 首字母大写 → SyntaxError（第 14、29 页同）
- 父类定义成 ‹Student›，子类却写 ‹(student)›、‹student.__init__›
- ‹def get_age():› 漏了 self；用 print 而不是 return
- 弯引号 “ ” → invalid character`],
]);
D('SE7','SysML 概览与需求工程','3ea202737d7a816b82d6d467df8104fa',[
['q',r`SysML 和 UML 是什么关系？为什么系统工程用 SysML？`,r`SysML 基于 UML 2：复用其中一部分（UML4SysML），再加自己的扩展。建模单位从「类 class」换成「块 block」，一个 block 可以是软件、硬件、数据、流程、人员或设施，适合软硬件混合的团队。图从 UML 2 的 13 种减到 9 种。`],
['q',r`SysML 的 9 种图怎么分？本课 SysML-Lite 用哪 6 种？`,r`- 行为图：活动 act、序列 sd、状态机 stm、用例 uc
- 需求图 req
- 结构图：块定义 bdd、内部块 ibd、包 pkg，以及参数图 par
- SysML-Lite：包图、需求图、活动图、块定义图、内部块图、参数图`],
['q',r`什么是需求工程？系统需求是什么？`,r`需求工程：确定客户要系统提供哪些服务、系统在什么约束下运行和开发的过程。系统需求：这个过程中产出的、对系统服务和约束的描述。`],
['q',r`需求为什么要写「what 不写 how」？举讲义的例子。`,r`需求说要什么，怎么做留给设计。What：「中心办公室和每个售票亭之间要有安全的通信链路」。How：「用 Cisco 路由器的 802.11n MIMO 无线局域网」。过早写 how 会锁死设计选择；但客户或法规强制的技术是约束，可以写。`],
['q',r`功能需求、非功能需求、领域需求分别是什么？`,r`- 功能：系统提供什么服务、对输入怎么反应、特定情况下怎么表现
- 非功能：对服务的约束，比如时间、开发过程、标准
- 领域：来自应用领域本身的特点（医疗、汽车、法规等）`],
['q',r`讲义里需求分解的四类 directives 是什么？`,r`客户（使命、法律、标准、资金、专利）、功能（功能与性能需求、运行和维护概念）、质量（可靠、可用、灵活、可扩展、鲁棒、适应）、技术（约束、环境、架构和软件设计规定）。客户影响功能和质量，功能和质量再影响技术。`],
['q',r`非功能需求怎么写成可测量的？各举一个指标。`,r`- 速度：每秒处理事务数、响应时间
- 大小：MB
- 易用：培训时间
- 可靠：平均无故障时间 MTTF、可用率
- 鲁棒：故障后重启时间
- 可移植：依赖目标平台的语句比例`],
['q',r`需求工程的四个通用活动？为什么叫迭代过程？`,r`获取 elicitation、分析 analysis、确认 validation、管理 management。实际中交错进行：螺旋模型里每一圈都经过获取 → 规格说明 → 确认，从业务需求到用户需求再到系统需求越转越细。`],
['q',r`需求充分性的五条检查标准？`,r`- 完整：内部没有待定内容，外部没有遗漏信息
- 一致：需求之间不冲突
- 可追溯、可测试：每条都有具体的测试
- 无歧义：客观中立
- 原子：不用连词把几条需求塞进一句`],
['q',r`场景 scenario 应该包含哪五部分？`,r`起始状态、正常事件流程、可能出错的地方、同时进行的其他活动、结束时的状态。场景是结构化的用户故事。`],
['q',r`SysML 需求块必须包含什么？需求之间的箭头怎么画？`,r`‹«requirement»› 加名字，必须有 id 和 text。关系用虚线箭头，从依赖的下层元素（client）指向被依赖的上层元素（supplier）；containment 用 ⊕，画在父需求那头。`],
['q',r`deriveReqt 和 refine 有什么区别？`,r`deriveReqt：需求到需求，由分析源需求得出，一定加了新约束（Engine Power 从 Max Acceleration 推出）。refine：澄清意思、补充上下文，不一定加约束，可以连到用例、状态机等其他元素（Detection Scenario refine All Weather Operation）。`],
['q',r`satisfy 和 verify 有什么区别？`,r`satisfy：设计元素（block）断言自己满足某条需求，不证明。verify：测试用例、检查、演示或分析说明怎么验证；测试通过才证明 satisfy 成立。箭头都从设计 / 测试指向需求。`],
['err',r`containment、copy、trace 各在什么时候用？`,r`- containment：把复杂需求拆成几条简单的，意思不增不减
- copy：跨项目复用一条需求，副本只读，箭头从副本指向原件
- trace：通用弱关联，上面几种都不合适时用`],
['fix',r`7b 讲义里 SysML 关系名字有哪些笔误？`,r`- 第 30 页写 ‹«derive»›、第 33 页写 ‹«deriveReq»›：正确名字是 ‹«deriveReqt»›
- 第 37 页 Kettle 练习：两个 Step 2（第三个应为 Step 3），‹SySML› 拼错；「Define、Composite」关系在 SysML 里对应 deriveReqt 和 containment`],
]);
})();

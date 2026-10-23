/* Engineering Mathematics 1 (Year 1) cards. [kind, question, answer]; kind: q = self-test, err = common mistake, fix = slide erratum */
window.CARDS=window.CARDS||[];
(function(){const r=String.raw,N='https://app.notion.com/p/';
const D=(l,t,id,arr)=>arr.forEach((x,i)=>window.CARDS.push({id:l+'-'+(i+1),c:'M1',l,t,u:N+id,k:x[0],q:x[1],a:x[2]}));

D('M1-C1','三角公式、隐函数与参数求导','402202737d7a81d094dbd73314755eb8',[
['q',r`由 $\sin^2A+\cos^2A=1$ 怎样得到另外两个平方关系？`,r`两边同除 $\cos^2A$：$\tan^2A+1=\sec^2A$；同除 $\sin^2A$：$1+\cot^2A=\mathrm{cosec}^2A$。`],
['q',r`CAST 口诀：各象限哪些三角函数为正？`,r`第一象限全正（All），第二只有 sin（Sin），第三只有 tan（Tan），第四只有 cos（Cos）。从第一象限逆时针记 A → S → T → C。`],
['q',r`哪些是奇函数，哪些是偶函数？`,r`偶：cos、sec（$\cos(-A)=\cos A$）。奇：sin、tan、cot、cosec（$\sin(-A)=-\sin A$）。`],
['q',r`写出 $\cos 2A$ 的三种形式，以及两个降幂公式。为什么降幂公式重要？`,r`$\cos2A=\cos^2A-\sin^2A=2\cos^2A-1=1-2\sin^2A$。
$\cos^2A=\tfrac12(1+\cos2A)$，$\sin^2A=\tfrac12(1-\cos2A)$。
把平方变成一次的 cos 2A，才能积分 $\sin^2$、$\cos^2$（算平均功率、rms 都要用）。`],
['q',r`$\sin A+\sin B$ 化成乘积？怎么从和角公式推出来？`,r`$2\sin\frac{A+B}2\cos\frac{A-B}2$。把 $\sin(x+y)+\sin(x-y)=2\sin x\cos y$ 里的 $x+y$ 记作 A、$x-y$ 记作 B，则 $x=\frac{A+B}2$，$y=\frac{A-B}2$。`],
['q',r`隐函数求导的关键一步是什么？对 $x^2+xy-y^2=8$ 求 $dy/dx$。`,r`对含 y 的项先对 y 求导，再乘 $dy/dx$（链式法则）；xy 用乘积法则。
$2x+x\,y'+y-2y\,y'=0\Rightarrow y'=\dfrac{2x+y}{2y-x}$。`],
['q',r`用隐函数求导推出 $\frac{d}{dx}\sin^{-1}x$。为什么取正号？`,r`$y=\sin^{-1}x\Rightarrow\sin y=x\Rightarrow\cos y\,y'=1\Rightarrow y'=\dfrac1{\cos y}=\dfrac1{\sqrt{1-x^2}}$。
主值 $y\in[-\pi/2,\pi/2]$，那里 $\cos y\ge0$，所以取正号（反正弦是增函数）。`],
['q',r`$\frac{d}{dx}\tan^{-1}x$ = ？`,r`$\tan y=x\Rightarrow\sec^2y\,y'=1\Rightarrow y'=\dfrac1{\sec^2y}=\dfrac1{1+\tan^2y}=\dfrac1{1+x^2}$。`],
['q',r`什么时候用对数求导？对 $y=x^x$ 求导。`,r`函数是很多因子的乘积 / 商 / 幂，或者底和指数都含 x 时。
$\ln y=x\ln x\Rightarrow\frac{y'}y=\ln x+1\Rightarrow y'=x^x(\ln x+1)$。`],
['q',r`参数方程 $x=f(t)$、$y=g(t)$：写出 $dy/dx$ 和 $d^2y/dx^2$。`,r`$\dfrac{dy}{dx}=\dfrac{dy/dt}{dx/dt}$；$\dfrac{d^2y}{dx^2}=\dfrac{\frac{d}{dt}\left(\frac{dy}{dx}\right)}{dx/dt}$。`],
['err',r`参数求导的二阶导数，常见错误写法是什么？`,r`$\dfrac{d^2y/dt^2}{d^2x/dt^2}$ 是**错的**。要先把 $dy/dx$ 写成 t 的函数，对 t 求导，再**除以 $dx/dt$**（链式法则：$\frac{d}{dx}=\frac{dt}{dx}\frac{d}{dt}$）。`],
['q',r`电容电压 $v=V\cos\omega t$，求电流并说明相位关系。`,r`$i=C\frac{dv}{dt}=-\omega CV\sin\omega t=\omega CV\cos(\omega t+\pi/2)$（用 $\sin\theta=\cos(\pi/2-\theta)$ 或 $\cos(\pi/2+\theta)=-\sin\theta$）。电流超前电压 90°，幅度 $\omega CV$。`],
['q',r`最大功率定理：$P=\dfrac{V^2R_L}{(R_L+R_s)^2}$ 何时最大？最大值多少？`,r`$\dfrac{dP}{dR_L}=\dfrac{V^2(R_s-R_L)}{(R_L+R_s)^3}=0\Rightarrow R_L=R_s$；$P_{max}=\dfrac{V^2}{4R_L}$。
$R_L<R_s$ 时导数为正，$R_L>R_s$ 时为负 → 最大值。`],
['err',r`讲师为什么说判断最大 / 最小时「不要再求一次导」？`,r`二阶导数检验在 $f''=0$ 时什么也说明不了（$x^4$ 在 0 处 $f''=0$ 却是最小值）。看一阶导数在驻点两侧的**符号变化**总是可靠：+ → − 最大，− → + 最小。`],
['fix',r`Week 2 calculus examples 的两处笔误（例 5、例 6）`,r`例 5（第 3 页）：$\frac{d}{dx}3\ln(1+2x)=\frac{6}{1+2x}$，讲义写成 $\frac3{1+2x}$；最终答案里的 $3\sqrt{1-x}(1+2x)^2$ 应为 $6\sqrt{1-x}(1+2x)^2$。
例 6（第 4 页）：最后一行分母漏了 t，应为 $\dfrac{d^2y}{dx^2}=\dfrac{-3(t^2+1)}{16t(t^2-1)^3}$。`],
]);
D('M1-C2','不定积分与换元法','402202737d7a81239e7ac9c952700095',[
['q',r`定积分 $\int_a^bf(x)\,dx$ 的定义（面积是和的极限）是什么？`,r`把 a 到 b 分成 n 条宽 $\delta x$ 的长条：$\displaystyle\int_a^bf(x)\,dx=\lim_{\delta x\to0}\sum_{k=1}^nf(x_k)\,\delta x$。积分号 ∫ 就是拉长的 S（sum）。`],
['q',r`什么是原函数（antiderivative）？为什么不定积分要加 C？`,r`$F'(x)=f(x)$ 的 F 叫 f 的原函数。常数的导数是 0，所以 $F+C$ 也都是原函数（图像上下平移，斜率不变）。C 由初始条件确定。`],
['q',r`讲师要求背的标准积分有哪些？`,r`$\int k\,dx=kx+c$；$\int x^n dx=\frac{x^{n+1}}{n+1}+c\ (n\ne-1)$；$\int\frac1x dx=\ln|x|+c$；$\int e^x dx=e^x+c$；$\int\sin x\,dx=-\cos x+c$；$\int\cos x\,dx=\sin x+c$；$\int\sinh x\,dx=\cosh x+c$；$\int\cosh x\,dx=\sinh x+c$。`],
['q',r`为什么 $\int\frac1x dx=\ln|x|+c$ 要加绝对值？`,r`$\ln x$ 只对 $x>0$ 有定义。$x<0$ 时 $\frac{d}{dx}\ln(-x)=\frac{-1}{-x}=\frac1x$，所以两种情况合起来写 $\ln|x|$。`],
['q',r`换元法的步骤？它为什么成立？`,r`1. 找内层函数 $u=g(x)$；2. $du=g'(x)dx$；3. 把被积式全部换成 u（包括 dx）；4. 积分后把 u 换回 x。
成立的原因：它是链式法则 $\frac{d}{dx}F(g(x))=f(g(x))g'(x)$ 倒过来用。`],
['q',r`$\int\sin(3x+2)\,dx$ = ？`,r`$u=3x+2$，$dx=\frac13du$：$\frac13\int\sin u\,du=-\frac13\cos(3x+2)+C$。`],
['q',r`$\int\frac{dx}{2x+1}$ = ？`,r`$u=2x+1$，$dx=\frac12du$：$\frac12\ln|2x+1|+C$。（讲义例 3 漏了 ½。）`],
['q',r`$\int\sin^2x\cos x\,dx$ = ？`,r`$u=\sin x$，$du=\cos x\,dx$：$\int u^2du=\frac{\sin^3x}{3}+C$。`],
['q',r`$\int\tan x\,dx$ 和 $\int\cot x\,dx$ = ？`,r`$\tan x=\frac{\sin x}{\cos x}$，分子是分母导数的负数：$-\ln|\cos x|=\ln|\sec x|+C$。
$\cot x=\frac{\cos x}{\sin x}$：$\ln|\sin x|+C$。规律：$\int\frac{f'(x)}{f(x)}dx=\ln|f(x)|+C$。`],
['q',r`有空气阻力的落体 $m\frac{dv}{dt}=mg-kv$，$v(0)=0$。求 $v(t)$ 和终端速度。`,r`分离变量 $\int\frac{dv}{mg-kv}=\int\frac{dt}{m}$，换元 $u=mg-kv$：$-\frac1k\ln|mg-kv|=\frac tm+C$。
用 v(0) = 0 定 C，得 $v=\frac{mg}{k}\left(1-e^{-kt/m}\right)$，终端速度 $\frac{mg}{k}$。`],
['q',r`二极管里 $\frac{dE}{dx}=Q(x)$，Q 是分段常数。E(x) 是什么形状？`,r`每段 Q 为常数 → E 是直线（斜率 = Q）。n 区斜率 $+Q_n$ 上升，p 区斜率 $-Q_p$ 下降，用 E 连续把各段接起来，得到三角形，峰值在结处 $E(0)=Q_nw_n$。`],
['err',r`换元时最常漏掉什么？`,r`忘了把 **dx 也换成 du**（要乘 $\frac{dx}{du}$，例如 $dx=\frac13du$），或者积分完忘了把 u 换回 x。还有 $\int x^n$ 公式在 n = −1 时不能用。`],
['fix',r`Week 3 examples 的两处错误`,r`第 2 页例 3：$\int\frac{dx}{2x+1}=\frac12\ln|2x+1|+C$，讲义漏了 ½。
第 3 页例 5：应为 $du=\cos x\,dx$（写成了 $\cos u\,du$），答案应为 $\frac{\sin^3x}3+C$（写成了 $\cos^3x$）。`],
['fix',r`Week 3 slides 第 4 页的落体方程`,r`$m\frac{dv}{dt}=-mg$ 约掉 m 后应是 $\frac{dv}{dt}=-g$，讲义写成了 $-gt$（$-gt$ 是解出来的 $v$）。`],
]);
D('M1-C3','三角积分、双曲函数与三角代换','402202737d7a8145aaf6c3eb1844218f',[
['q',r`积分 $\sin^nx$、$\cos^nx$：偶次幂和奇次幂分别用什么方法？`,r`**偶次幂**：降幂（倍角）公式 $\cos^2x=\frac12(1+\cos2x)$，反复用直到没有平方。
**奇次幂**：拆出一个 $\cos x$（或 $\sin x$），其余偶次幂用 $\cos^2x=1-\sin^2x$ 改写，再令 $u=\sin x$。`],
['q',r`$\int\cos^4x\,dx$ = ？`,r`$\cos^4x=\frac14(1+\cos2x)^2=\frac38+\frac12\cos2x+\frac18\cos4x$，积分：$\frac{3x}8+\frac{\sin2x}4+\frac{\sin4x}{32}+C$。`],
['q',r`$\int\cos^5x\,dx$ = ？`,r`$\int(1-\sin^2x)^2\cos x\,dx$，令 $u=\sin x$：$\sin x-\frac23\sin^3x+\frac15\sin^5x+C$。`],
['q',r`$\int\cos3x\sin4x\,dx$ 怎么做？`,r`积化和差：$\sin4x\cos3x=\frac12(\sin7x+\sin x)$。积分得 $-\frac1{14}\cos7x-\frac12\cos x+C$。`],
['q',r`写出 sinh、cosh、tanh 的定义和取值范围。`,r`$\sinh x=\frac{e^x-e^{-x}}2$（取遍实数，奇），$\cosh x=\frac{e^x+e^{-x}}2$（$\ge1$，偶），$\tanh x=\frac{\sinh x}{\cosh x}$（在 ±1 之间，奇）。`],
['q',r`为什么叫「双曲」函数？`,r`$(\cosh u,\sinh u)$ 落在双曲线 $x^2-y^2=1$ 上，正如 $(\cos u,\sin u)$ 落在圆 $x^2+y^2=1$ 上；两种情况下 u 都等于阴影扇形面积的 2 倍。`],
['q',r`从三角恒等式怎样得到双曲恒等式？举两个例子。`,r`Osborn 规则：把 cos → cosh、sin → sinh，凡是**两个 sinh 相乘**的地方变号。
$\cos^2+\sin^2=1\to\cosh^2-\sinh^2=1$；$\cos(A+B)=\cos A\cos B-\sin A\sin B\to\cosh(A+B)=\cosh A\cosh B+\sinh A\sinh B$。`],
['q',r`$\frac{d}{dx}\sinh x$、$\frac{d}{dx}\cosh x$、$\frac{d}{dx}\tanh x$ = ？和三角函数有什么不同？`,r`$\cosh x$、$\sinh x$（**没有负号**）、$\mathrm{sech}^2x$。三角函数 $\frac{d}{dx}\cos x=-\sin x$ 有负号，双曲的没有。`],
['q',r`$\int\sinh^2x\,dx$ = ？它的降幂公式和 $\sin^2$ 的有什么区别？`,r`$\sinh^2x=\frac12(\cosh2x-1)$（$\sin^2x=\frac12(1-\cos2x)$，符号相反）。积分：$\frac14\sinh2x-\frac x2+C$。`],
['q',r`$\frac{d}{dx}\sinh^{-1}x$、$\frac{d}{dx}\cosh^{-1}x$、$\frac{d}{dx}\tanh^{-1}x$ = ？`,r`$\frac1{\sqrt{x^2+1}}$；$\frac1{\sqrt{x^2-1}}\ (x>1)$；$\frac1{1-x^2}\ (|x|<1)$。用隐函数求导推（同 C1 的反三角函数）。`],
['q',r`三角代换：$\sqrt{a^2-x^2}$、$a^2+x^2$、$\sqrt{x^2-a^2}$ 分别令 x = ？`,r`$x=a\sin u$（$a^2-a^2\sin^2u=a^2\cos^2u$）；$x=a\tan u$ 或 $a\sinh u$（$1+\tan^2=\sec^2$，$1+\sinh^2=\cosh^2$）；$x=a\cosh u$（$\cosh^2-1=\sinh^2$）。目的：用平方关系消掉根号。`],
['q',r`$\int\frac{dx}{\sqrt{4-9x^2}}$ = ？`,r`提出 2：$\frac12\int\frac{dx}{\sqrt{1-\frac94x^2}}$，令 $\sin u=\frac32x$：$\frac13\sin^{-1}\frac{3x}2+C$。`],
['q',r`$\int\frac{dx}{x^2+x+1}$ = ？关键一步是什么？`,r`**配方**：$x^2+x+1=(x+\frac12)^2+\frac34$。令 $\tan u=\frac{2x+1}{\sqrt3}$：$\frac{2}{\sqrt3}\tan^{-1}\frac{2x+1}{\sqrt3}+C$。`],
['err',r`降幂时最常见的错误？`,r`$\cos^4x=(\cos^2x)^2$，不是 $(\cos^2x)^4$；展开 $(1+\cos2x)^2$ 后 $\cos^22x$ 还要再降一次幂（变成 $\cos4x$）；积分 $\cos2x$ 时别忘了除以 2。`],
['fix',r`Week 4 examples 例 1（第 1 页）的错误`,r`$\cos^4x=(\cos^2x)^4$ 应为 $(\cos^2x)^2$；最终答案 $\frac38x+\sin2x+\frac1{32}\sin4x$ 中 $\sin2x$ 前漏了 $\frac14$，应为 $\frac{3x}8+\frac14\sin2x+\frac1{32}\sin4x+C$（上一行是对的）。`],
]);
D('M1-C4','定积分与平均值','402202737d7a81afafabcef78a969852',[
['q',r`怎样计算定积分 $\int_a^bf(u)\,du$？为什么不用加 C？`,r`找原函数 F（$F'=f$），$\int_a^bf\,du=\big[F(u)\big]_a^b=F(b)-F(a)$。
如果用 $F+C$，结果是 $(F(b)+C)-(F(a)+C)$，C 抵消了。`],
['q',r`函数在 [a, b] 上的平均值公式？几何意义？`,r`$f_{mean}=\dfrac1{b-a}\displaystyle\int_a^bf(x)\,dx$。以它为高、以 $b-a$ 为宽的矩形，面积等于曲线下的面积。`],
['q',r`$\sin\omega t$ 和 $\sin^2\omega t$ 在一个周期上的平均值？和 rms 有什么关系？`,r`$\sin$ 的平均值 0；$\sin^2=\frac12(1-\cos2\omega t)$ 的平均值 ½。
$V_{rms}=\sqrt{\overline{v^2}}=\sqrt{V_p^2/2}=V_p/\sqrt2$。`],
['q',r`定积分的四条代数性质？`,r`拆区间：$\int_a^b=\int_a^c+\int_c^b$；对调上下限变号：$\int_a^b=-\int_b^a$；$\int_a^a=0$；线性：$\int(f+g)=\int f+\int g$，$\int cf=c\int f$。`],
['q',r`$\int_1^52x^2dx$、$\int_5^12x^2dx$ 各是多少？`,r`$\left[\frac{2x^3}3\right]_1^5=\frac{2(125-1)}3=\frac{248}3$；对调上下限：$-\frac{248}3$。`],
['q',r`定积分换元时上下限怎么处理？两种正确做法？`,r`方法 1：把上下限也换成 u 的值（$u=g(a)$ 到 $u=g(b)$），积完直接代 u。
方法 2：上下限保持 x 的值并写明 $x=a$、$x=b$，积完先把 u 换回 x 再代。
**错误**：换了变量却还用 x 的上下限去代 u。`],
['q',r`$\int_1^2x^2\sqrt{2x^3-1}\,dx$ = ？`,r`$u=2x^3-1$，$du=6x^2dx$；x = 1 → u = 1，x = 2 → u = 15：$\frac16\int_1^{15}\sqrt u\,du=\frac19(15^{3/2}-1)\approx6.34$。`],
['q',r`弹簧质量系统：$F=F_0\cos\omega t$，$y=y_0\cos(\omega t+\phi)$，一个周期的平均吸收功率？`,r`$P=Fv$，$v=\dot y=-\omega y_0\sin(\omega t+\phi)$。展开后只有 $\cos^2\omega t$ 项平均值非零（½）：
$\langle P\rangle=-\frac\omega2F_0y_0\sin\phi$。`],
['q',r`电路里 $v=v_0\cos\omega t$、$i=i_0\cos(\omega t+\phi)$，平均功率是多少？`,r`$P=\frac1T\int_0^Tvi\,dt=\frac{v_0i_0}2\cos\phi$（Mock Exam 第 1(b) 题）。$\cos\phi$ 就是功率因数。`],
['err',r`算平均值时最常见的错误？`,r`忘了除以区间长度 $b-a$（或周期 T）；或者把 $\sin^2$ 的平均值当成 0。sin、cos 的平均值是 0，但它们**平方**的平均值是 ½，**乘积** $\sin\omega t\cos\omega t$ 的平均值是 0。`],
['fix',r`Week 5 examples 例 3（第 5 页）的小笔误`,r`方括号那一行漏了 $\frac1\omega$：$\int\frac12\sin2\omega t\,dt=-\frac{1}{4\omega}\cos2\omega t$，讲义写成 $-\frac14\cos2\omega t$；下一行代入时又写对了，最终结果 $-\frac\omega2F_0y_0\sin\phi$ 正确。`],
]);
D('M1-C5','分部积分与 Taylor 级数','402202737d7a81c7b19ef477a341bd11',[
['q',r`分部积分公式是什么？从哪来？`,r`$\int u\frac{dv}{dx}dx=uv-\int v\frac{du}{dx}dx$（定积分：$[uv]_a^b-\int_a^b v\,u'\,dx$）。
来自乘积法则 $(uv)'=uv'+vu'$ 两边积分再移项。`],
['q',r`分部积分怎么选 u 和 dv/dx？`,r`u 选求导后变简单的（多项式、ln x、反三角），dv/dx 选好积分的（$e^x$、sin、cos）。常用顺序 LIATE：对数、反三角、代数（多项式）、三角、指数，越靠前越适合当 u。`],
['q',r`$\int x\cos x\,dx$ = ？`,r`$u=x$，$v'=\cos x$，$v=\sin x$：$x\sin x-\int\sin x\,dx=x\sin x+\cos x+C$。`],
['q',r`$\int_0^\pi x^2\cos x\,dx$ = ？要用几次分部积分？`,r`两次（每次把 $x^2$ 的次数降 1）：$[x^2\sin x]_0^\pi+2[x\cos x]_0^\pi-2[\sin x]_0^\pi=0+2\pi(-1)-0=-2\pi$。`],
['q',r`$\int\ln x\,dx$ 不是乘积，怎么用分部积分？`,r`令 $u=\ln x$，$\frac{dv}{dx}=1$（讲义：u = 1 的技巧），$v=x$：$x\ln x-\int x\cdot\frac1x dx=x\ln x-x+C$。`],
['q',r`Taylor 级数公式？系数 $c_n$ 是怎么得到的？`,r`$f(x)=\sum_n\frac{f^{(n)}(x_0)}{n!}(x-x_0)^n$。
设 $f=c_0+c_1(x-x_0)+c_2(x-x_0)^2+\dots$，求 n 次导后令 $x=x_0$，只剩 $n!\,c_n=f^{(n)}(x_0)$。`],
['q',r`一阶近似（线性近似）是什么？几何意义？`,r`$f(x)\approx f(x_0)+f'(x_0)(x-x_0)$：用 $x_0$ 处的切线代替曲线。x 离 $x_0$ 越近越准。`],
['q',r`写出 sin x、cos x、eˣ 的 Maclaurin 级数。在什么范围成立？`,r`$\sin x=x-\frac{x^3}{3!}+\frac{x^5}{5!}-\dots$，$\cos x=1-\frac{x^2}{2!}+\frac{x^4}{4!}-\dots$，$e^x=1+x+\frac{x^2}{2!}+\frac{x^3}{3!}+\dots$。对所有 x 成立（x 用弧度）。`],
['q',r`二项式级数 $(1+x)^n$ 是什么？在哪里有效？`,r`$1+nx+\frac{n(n-1)}{2!}x^2+\frac{n(n-1)(n-2)}{3!}x^3+\dots$。n 不是正整数时只在 $-1<x<1$ 收敛；n 是正整数时级数有限项，处处成立。`],
['q',r`sin x 在 $x_0=\frac\pi2$ 的三阶近似？为什么和二阶一样？`,r`$f(\frac\pi2)=1$，$f'=\cos=0$，$f''=-\sin=-1$，$f'''=-\cos=0$：$\sin x\approx1-\frac12(x-\frac\pi2)^2$。三阶导数在这一点为 0，所以三阶项为 0。`],
['q',r`$e^{-(x-1)^2}$ 在 x = 1 的三阶 Taylor 近似？`,r`$f(1)=1$，$f'(1)=0$，$f''(1)=-2$，$f'''(1)=0$：$f\approx1-(x-1)^2$。`],
['q',r`$\sin(0.5)\approx0.5-\frac{0.5^3}{6}$ 有多准？为什么要用弧度？`,r`$0.47917$，真实值 $0.47943$，误差约 $2.6\times10^{-4}$。$\frac{d}{dx}\sin x=\cos x$ 只在弧度下成立，Taylor 系数都由导数决定，所以 x 必须是弧度（0.5 rad ≈ 28.6°）。`],
['err',r`Taylor 级数最常见的错误？`,r`忘了除以 $n!$；把 $f^{(n)}(x_0)$ 写成 $f^{(n)}(x)$（导数要在展开点取值）；用角度代入；在收敛范围外使用二项式级数。`],
]);
D('M1-C6','微积分应用：引力与转动惯量','402202737d7a81cfa261cd327fe816e6',[
['q',r`把 $F=\frac{GMm}{r^2}$ 在 $r=R_0$ 处展开到三阶（$h=r-R_0$）。`,r`导数：$-\frac{2GMm}{r^3}$、$\frac{6GMm}{r^4}$、$-\frac{24GMm}{r^5}$。
$F\approx\frac{GMm}{R_0^2}-\frac{2GMm}{R_0^3}h+\frac{3GMm}{R_0^4}h^2-\frac{4GMm}{R_0^5}h^3$。`],
['q',r`由 h = 0 怎样得到 g？`,r`$F(0)=\frac{GM_0m}{R_0^2}=mg\Rightarrow g=\frac{GM_0}{R_0^2}$。`],
['q',r`把引力写成 $F\approx mg\,S(h/R_0)$，S 是什么？`,r`$S=1-2\frac{h}{R_0}+3\left(\frac{h}{R_0}\right)^2-4\left(\frac{h}{R_0}\right)^3$，就是 $(1+\frac h{R_0})^{-2}$ 的二项式展开。`],
['q',r`$R_0\approx6000$ km 时，一阶、二阶、三阶项各在多高处贡献 10%？`,r`$2\frac h{R_0}=0.1\Rightarrow h\approx300$ km；$3(\frac h{R_0})^2=0.1\Rightarrow h\approx1100$ km；$4(\frac h{R_0})^3=0.1\Rightarrow h\approx1750$ km。`],
['q',r`为什么在地面附近可以把重力当常数？`,r`一阶修正是 $2h/R_0$。h 小于 30 km 时 $2h/R_0<1\%$，可以忽略；到几百公里就有约 10%，不能再当常数。`],
['q',r`转动惯量的定义？为什么要把物体切成小块？`,r`$I=\sum x^2\delta m\to\int x^2\,dm$，x 是到转轴的距离。各部分离轴的距离不同，所以要切成小块分别算再加起来（积分）。`],
['q',r`台球杆（圆锥）模型里，$\delta m$ 怎么写？`,r`$\delta m=\rho A(x)\delta x$，$\rho=\frac{M}{\frac13\pi R^2l}$，$A(x)=\pi R^2(1-\frac xl)^2$，所以 $\delta m=\frac{3M}l\left(1-\frac xl\right)^2\delta x$。`],
['q',r`绕粗端的转动惯量 $I=\frac{3M}l\int_0^lx^2(1-\frac xl)^2dx$ = ？和均匀细杆比呢？`,r`展开 $x^2-\frac{2x^3}l+\frac{x^4}{l^2}$ 积分：$\frac{3M}l\cdot l^3(\frac13-\frac12+\frac15)=\frac{Ml^2}{10}$。均匀细杆绕一端是 $\frac{Ml^2}3$，圆锥质量集中在转轴附近，所以小得多。`],
['err',r`积分 $\int_0^lx^2(1-\frac xl)^2dx$ 时常见的错误？`,r`不展开就想换元（讲义说「唯一的办法是展开」）；展开 $(1-\frac xl)^2$ 时漏了 $\frac{x^2}{l^2}$ 项或把交叉项写成 $-\frac xl$（应为 $-\frac{2x}l$）。`],
['fix',r`applied examples week 7 第 13 页的小笔误`,r`$\delta m=\frac{M}{\frac13\pi R^2l}\cdot\pi R^2(1-\frac xl)^2\delta x$，讲义分子漏了 π（写成 $R^2$）；π 本来就会约掉，最终 $\frac{3M}l(1-\frac xl)^2\delta x$ 正确。`],
]);
D('M1-V1','向量基础与点积','402202737d7a81539e6cfd57c0e4ad88',[
['q',r`向量和标量的区别？各举三个工程里的例子。`,r`向量有大小和方向，标量只有大小。向量：力、速度、电场、动量、转矩；标量：温度、质量、电压、能量、功。`],
['q',r`怎样把二维向量分解成分量？分量和夹角是什么关系？`,r`$a_x=|\vec a|\cos\alpha$，$a_y=|\vec a|\sin\alpha=|\vec a|\cos\beta$，α、β 是和 x、y 轴的夹角。三维同理：$a_z=|\vec a|\cos\gamma$。`],
['q',r`三维向量的模（长度）怎么算？$(5,4,3)$ 的模？`,r`勾股定理用两次：$|\vec a|=\sqrt{a_x^2+a_y^2+a_z^2}$。$\sqrt{25+16+9}=\sqrt{50}$。`],
['q',r`单位向量怎么求？$(3,1,-5)$ 方向的单位向量？`,r`除以模：$\hat a=\frac{\vec a}{|\vec a|}$。$\frac1{\sqrt{35}}(3,1,-5)$。`],
['q',r`从点 A(5, −4, 3) 到 B(3, 2, −1) 的向量？`,r`终点减起点：$\vec{AB}=\vec{OB}-\vec{OA}=(3-5,\ 2+4,\ -1-3)=(-2,6,-4)$。`],
['q',r`点积的两个公式？结果是什么类型的量？`,r`$\vec a\cdot\vec b=|\vec a||\vec b|\cos\theta=a_xb_x+a_yb_y+a_zb_z$。结果是**标量**（一个数）。`],
['q',r`为什么 $\vec a\cdot\vec b=a_xb_x+a_yb_y+a_zb_z$？`,r`展开 $(a_x\mathbf i+a_y\mathbf j+a_z\mathbf k)\cdot(b_x\mathbf i+\dots)$ 得 9 项。$\mathbf i\cdot\mathbf i=\mathbf j\cdot\mathbf j=\mathbf k\cdot\mathbf k=1$（平行），$\mathbf i\cdot\mathbf j$ 等 = 0（垂直），只剩 3 项。`],
['q',r`点积的几何意义？什么时候为 0、为负？`,r`一个向量在另一个方向上的投影 × 另一个的长度（只乘平行部分）。垂直时为 0，夹角大于 90° 时为负。`],
['q',r`怎样求两个向量的夹角？$\vec v=(18,-6,1)$、$\vec g=(8,4,1)$ 的夹角？`,r`$\cos\theta=\frac{\vec v\cdot\vec g}{|\vec v||\vec g|}=\frac{121}{19\times9}$，$\theta\approx44.96°$。`],
['q',r`方向余弦是什么？它们满足什么关系？`,r`$\cos\alpha=\frac{v_x}{|\vec V|}$、$\cos\beta=\frac{v_y}{|\vec V|}$、$\cos\gamma=\frac{v_z}{|\vec V|}$，就是单位向量 $\hat V$ 的三个分量，所以 $\cos^2\alpha+\cos^2\beta+\cos^2\gamma=1$。`],
['q',r`三个共面力 2 kN（60°）、3 kN（−90°）、4 kN（150°）的合力？`,r`分解后相加：$(1-2\sqrt3)\mathbf i+(\sqrt3-3+2)\mathbf j=-2.46\mathbf i+0.73\mathbf j$，大小 2.57 kN，方向约 163°。`],
['err',r`算 $\vec{AB}$ 时最常见的错误？`,r`写成「起点减终点」$\vec{OA}-\vec{OB}$，方向反了。记住：**终点减起点**，B − A。`],
['fix',r`Vectors Wk1 第 38、42 页的笔误`,r`第 38 页：$\hat e$ 应为 $\frac1{\sqrt{90}}(4,-5,-7)$，讲义抄成了 $\hat c$ 的 $(3,1,-5)$。
第 42 页：合力写成 $F_1+F_2+F_2$，应为 $F_1+F_2+F_3$（计算用的是 $F_3$，结果正确）。`],
]);
D('M1-V2','叉积（向量积）','402202737d7a8138921bebccf0bdc918',[
['q',r`叉积的几何定义？结果是什么？`,r`$\vec a\times\vec b=|\vec a||\vec b|\sin\theta\,\hat u$，结果是**向量**：大小 = a、b 张成的平行四边形面积，方向 $\hat u$ 垂直于 a 和 b（右手定则）。`],
['q',r`右手定则怎么用？`,r`食指指向第一个向量 a，中指指向第二个向量 b，拇指就是 $\vec a\times\vec b$ 的方向。（或：四指从 a 弯向 b，拇指方向。）`],
['q',r`$\vec b\times\vec a$ 和 $\vec a\times\vec b$ 是什么关系？`,r`$\vec b\times\vec a=-\vec a\times\vec b$：大小相同、方向相反。叉积**不满足交换律**，顺序很重要。`],
['q',r`写出 i、j、k 之间的叉积。`,r`$\mathbf i\times\mathbf i=\mathbf j\times\mathbf j=\mathbf k\times\mathbf k=0$；$\mathbf i\times\mathbf j=\mathbf k$，$\mathbf j\times\mathbf k=\mathbf i$，$\mathbf k\times\mathbf i=\mathbf j$（顺着 i→j→k 循环为正）；反过来为负：$\mathbf j\times\mathbf i=-\mathbf k$ 等。`],
['q',r`叉积的分量公式（行列式形式）？`,r`$\vec a\times\vec b=\begin{vmatrix}\mathbf i&\mathbf j&\mathbf k\\a_x&a_y&a_z\\b_x&b_y&b_z\end{vmatrix}=(a_yb_z-a_zb_y)\mathbf i-(a_xb_z-a_zb_x)\mathbf j+(a_xb_y-a_yb_x)\mathbf k$。注意 j 前面是负号。`],
['q',r`$(3,-2,5)\times(1,3,-3)$ = ？怎么检查？`,r`$(6-15,\ 5+9,\ 9+2)=(-9,14,11)$。检查：结果和两个原向量的点积都应为 0：$-27-28+55=0$ ✓，$-9+42-33=0$ ✓。`],
['q',r`两个向量平行时叉积是多少？垂直时呢？`,r`平行（θ = 0 或 180°）：$\sin\theta=0$，叉积为零向量。垂直：大小最大，$|\vec a||\vec b|$。`],
['q',r`力矩怎么用叉积表示？$\vec r=(3,-5,2)$、$\vec F=(5,3,-2)$ 的力矩？`,r`$\vec M=\vec r\times\vec F$（r 在前）。$|\vec M|=|\vec r||\vec F|\sin\theta$ = 力 × 力臂，方向是转轴。结果 $4\mathbf i+16\mathbf j+34\mathbf k$ N·m。`],
['q',r`三角形 ABC 和平行四边形的面积怎样用叉积求？`,r`平行四边形：$|\vec{AB}\times\vec{AC}|$；三角形：$\frac12|\vec{AB}\times\vec{AC}|$。不规则四边形拆成两个三角形相加。`],
['q',r`平行六面体的体积？`,r`$V=|\vec a\cdot(\vec b\times\vec c)|$：$|\vec b\times\vec c|$ 是底面积，$\vec a$ 在法向上的投影是高。`],
['q',r`怎样求同时垂直于 $\vec a$ 和 $\vec b$ 的单位向量？`,r`$\pm\frac{\vec a\times\vec b}{|\vec a\times\vec b|}$（两个方向都对）。例：$(5,2,-3)$、$(1,0,-1)$ → $(-2,2,-2)/(2\sqrt3)=\pm\frac1{\sqrt3}(-1,1,-1)$。`],
['err',r`算叉积时最容易错在哪里？`,r`j 分量的符号（行列式第二项要减，结果是 $a_zb_x-a_xb_z$）；顺序写反（$\vec F\times\vec r$ 得到相反的力矩）；以为叉积满足结合律（$(\vec a\times\vec b)\times\vec c\ne\vec a\times(\vec b\times\vec c)$）。`],
['err',r`为什么不用 $\sin\theta=\frac{|\vec a\times\vec b|}{|\vec a||\vec b|}$ 求夹角？`,r`$\sin^{-1}$ 只给 0–90°，分不清锐角和钝角。$(3,-2,5)$ 和 $(1,3,-3)$ 实际夹角 132°，用 sin 算出 48°。求夹角用点积（cos 在 0–180° 是单调的）。`],
]);
D('M1-M1','矩阵运算与行列式','402202737d7a81329160e54db86a88cb',[
['q',r`n × m 矩阵是什么意思？$a_{ij}$ 是哪个元素？`,r`n 行 m 列（先行后列）。$a_{ij}$ 是第 i 行第 j 列的元素。`],
['q',r`单位矩阵、对角矩阵、上 / 下三角矩阵、对称矩阵分别长什么样？`,r`I：对角线全 1、其余 0；对角：只有对角线非零；上三角：对角线以下全 0；下三角：对角线以上全 0；对称：$A^T=A$（关于对角线镜像相等）。`],
['q',r`两个矩阵什么时候能相加？什么时候能相乘？结果多大？`,r`相加：同阶（行列数都相同），对应元素相加。
相乘 AB：A 的**列数** = B 的**行数**；(n × k)(k × m) = n × m。`],
['q',r`矩阵乘积 AB 的 (i, j) 元素怎么算？`,r`A 的第 i 行和 B 的第 j 列对应相乘再相加：$c_{ij}=\sum_ka_{ik}b_{kj}$（就是行向量和列向量的点积）。`],
['q',r`矩阵乘法和普通乘法有哪三点不同？`,r`1. 一般 $AB\ne BA$；2. $AB=0$ 不代表 A 或 B 为零矩阵；3. $AC=AD$ 不能推出 $C=D$（即使 $A\ne0$）。`],
['q',r`转置是什么？$(AB)^T$ = ？`,r`行列互换：$(A^T)_{ij}=a_{ji}$，n × m 变成 m × n。$(AB)^T=B^TA^T$（顺序反过来）；$(A+B)^T=A^T+B^T$；$\det A^T=\det A$。`],
['q',r`2 × 2 行列式？3 × 3 行列式怎么展开？`,r`$\begin{vmatrix}a&b\\c&d\end{vmatrix}=ad-bc$。3 × 3：沿一行（或一列），每个元素 × 它的代数余子式，再相加：$a_{11}C_{11}+a_{12}C_{12}+a_{13}C_{13}$。`],
['q',r`余子式（minor）和代数余子式（cofactor）的区别？`,r`余子式 $M_{ij}$：去掉第 i 行第 j 列后剩下的行列式。代数余子式 $C_{ij}=(-1)^{i+j}M_{ij}$，符号按棋盘格 + − + / − + − / + − +。`],
['q',r`$\begin{vmatrix}4&3&2\\1&-1&7\\-5&8&0\end{vmatrix}$ = ？`,r`沿第一行：$4(0-56)-3(0+35)+2(8-5)=-224-105+6=-323$。`],
['q',r`为什么展开行列式时要选零最多的行或列？`,r`零乘以任何余子式都是 0，那一项不用算。例：$\begin{vmatrix}4&5&1\\3&0&7\\1&0&-1\end{vmatrix}$ 沿第 2 列只剩一项：$-5(3\cdot(-1)-7\cdot1)=50$。`],
['q',r`行列式的几何意义？det = 0 说明什么？`,r`2 × 2：两列（或两行）张成的平行四边形面积；3 × 3：平行六面体体积。det = 0 叫**奇异矩阵**：面积 / 体积为 0，向量共线 / 共面，没有逆矩阵。`],
['q',r`怎样用行列式求三角形面积、判断三点共线？`,r`面积 $=\frac12\left|\det\begin{pmatrix}a_x&a_y&1\\b_x&b_y&1\\c_x&c_y&1\end{pmatrix}\right|$。行列式 = 0 ⇔ 三点共线。`],
['q',r`交换矩阵的两行，行列式怎样变化？`,r`变号（Tutorial 11 第 2 题：三个矩阵行列式 −100、100、−100）。原因：交换行的初等矩阵行列式为 −1，$\det(e_1A)=\det e_1\det A=-\det A$。`],
['err',r`算 3 × 3 行列式最常见的错误？`,r`漏了中间一项的负号（$-a_{12}M_{12}$）；余子式里 $ad-bc$ 的顺序弄反；把余子式和代数余子式混用（cofactor 已经带了符号，不要再乘一次）。`],
]);
D('M1-M2','逆矩阵与解方程组','402202737d7a811ebdecef1e3f4b6e7a',[
['q',r`逆矩阵 $A^{-1}$ 的定义？什么矩阵才有逆？`,r`满足 $AA^{-1}=A^{-1}A=I$ 的矩阵。必须是**方阵**，而且 $\det A\ne0$（非奇异）。`],
['q',r`伴随矩阵法求逆的公式？每一项是什么？`,r`$A^{-1}=\dfrac{1}{\det A}\,\mathrm{adj}\,A$，$\mathrm{adj}\,A=C^T$：代数余子式矩阵 C 的**转置**。`],
['q',r`2 × 2 矩阵 $\begin{pmatrix}a&b\\c&d\end{pmatrix}$ 的逆？`,r`$\dfrac{1}{ad-bc}\begin{pmatrix}d&-b\\-c&a\end{pmatrix}$：主对角线互换，副对角线变号，除以行列式。`],
['q',r`为什么 $A\mathbf x=\mathbf b$ 的解是 $\mathbf x=A^{-1}\mathbf b$？`,r`两边**左乘** $A^{-1}$：$A^{-1}A\mathbf x=A^{-1}\mathbf b$，$A^{-1}A=I$，$I\mathbf x=\mathbf x$。注意是左乘，写成 $\mathbf bA^{-1}$ 连阶都对不上。`],
['q',r`用逆矩阵法解方程组的 4 步？`,r`1. 写成 $A\mathbf x=\mathbf b$；2. 求 adj A（先算 det，≠ 0 才继续）；3. 用 adj A 乘 b（先不除 det）；4. 最后除以 det，并代回原方程检查。`],
['q',r`$(AB)^{-1}$ = ？$(A^T)^{-1}$ = ？`,r`$(AB)^{-1}=B^{-1}A^{-1}$（顺序反过来）；$(A^T)^{-1}=(A^{-1})^T$。`],
['q',r`det A = 0 时方程组 $A\mathbf x=\mathbf b$ 会怎样？`,r`A 奇异，没有逆，逆矩阵法用不了。方程组要么**无解**（矛盾 inconsistent，例如两条平行线），要么**无穷多解**（不确定 indeterminate，两条线重合）。`],
['q',r`怎样检查算出来的逆矩阵对不对？`,r`乘回去：$A^{-1}A$ 应该等于单位矩阵 I（课件第 12 页）。解方程组时把 x 代回原方程。`],
['q',r`$A=\begin{pmatrix}2&-3\\-3&4\end{pmatrix}$ 的逆？解 $A\begin{pmatrix}x\\y\end{pmatrix}=\begin{pmatrix}6\\-2\end{pmatrix}$。`,r`det = 8 − 9 = −1，$A^{-1}=-\begin{pmatrix}4&3\\3&2\end{pmatrix}=\begin{pmatrix}-4&-3\\-3&-2\end{pmatrix}$。$\mathbf x=A^{-1}\mathbf b=(-24+6,\,-18+4)=(-18,-14)$。`],
['q',r`为什么求 adj 要把代数余子式矩阵转置？`,r`$A\,C^T$ 的 (i, j) 元素 = A 的第 i 行 · C 的第 j 行。i = j 时正好是沿第 i 行展开 = det A；i ≠ j 时相当于「两行相同的矩阵」的行列式 = 0。所以 $A\,C^T=(\det A)I$。`],
['q',r`几何上看，为什么 det = 0 的矩阵没有逆？`,r`矩阵把平面变形；det = 0 时整个平面被压成一条线（或一点），不同的点被送到同一点，无法唯一还原，所以没有逆变换。`],
['err',r`伴随矩阵法最常见的错误？`,r`忘了转置（直接用 C 当 adj）；代数余子式漏了符号格；没先检查 det ≠ 0；中间就除以 det 导致分数算错；把 $A^{-1}\mathbf b$ 写成 $\mathbf bA^{-1}$。`],
]);
D('M1-M3','高斯消元与高斯-约当法','402202737d7a8164acb8cbf1551c7e26',[
['q',r`三种不改变方程组解的行变换？`,r`1. 交换两行；2. 一整行乘一个**非零**常数；3. 一行加上（减去）另一行的倍数。`],
['q',r`高斯消元的两个阶段？`,r`① **消元**：用行变换把系数矩阵化成上三角（对角线下方全是 0）；② **回代**：从最后一行（只有一个未知数）开始往上逐个求解。`],
['q',r`消元因子 E 怎么算？新的一行怎么算？`,r`$E_i=\dfrac{\text{要消掉的数 }a_{iJ}}{\text{主元 }a_{(i-n)J}}$，新行 $c_{ij}=a_{ij}-E_i\,a_{(i-n)j}$。分母才是主元（pivot）。`],
['q',r`消元时最容易忘的一件事？`,r`右边的 b 也要做同样的行变换（课件：Must remember to do elimination on b matrix at same time）。写成增广矩阵 $[A\,|\,\mathbf b]$ 就不会忘。`],
['q',r`主元是 0 怎么办？`,r`不能做除数。和下面这一列非零的某一行**交换**（课件第 12 页）。换列也可以，但未知数的顺序要跟着换。`],
['q',r`$\begin{pmatrix}2&1&1\\4&1&0\\-2&2&1\end{pmatrix}\begin{pmatrix}u\\v\\w\end{pmatrix}=\begin{pmatrix}1\\-2\\7\end{pmatrix}$ 消元后的上三角？解？`,r`$R_2-2R_1$，$R_3+R_1$，$R_3+3R_2$ 得 $\begin{pmatrix}2&1&1\\0&-1&-2\\0&0&-4\end{pmatrix}\Big|\begin{pmatrix}1\\-4\\-4\end{pmatrix}$。回代：w = 1，v = 2，u = −1。`],
['q',r`增广矩阵消元后，怎样从最后一行判断解的情况？`,r`$0\ 0\ 0\,|\,c\ne0$：$0=c$ 不可能 → **无解**（矛盾 inconsistent）。$0\ 0\ 0\,|\,0$：多余的方程 → **无穷多解**（不确定 indeterminate）。最后一行主元不为 0 → **唯一解**。`],
['q',r`矩阵的秩（rank）是什么？怎样用它判断解？`,r`线性无关的行数 = 化成阶梯形后非零行的个数。n 个未知数：rank A = rank [A|b] = n → 唯一解；rank A = rank [A|b] < n → 无穷多解；rank A < rank [A|b] → 无解。`],
['q',r`无穷多解时怎样写出所有的解？`,r`令自由变量 = λ（任意数），其余未知数用 λ 表示。课件第 31 页：$x_3=\lambda$，$x_2=\frac13(14-\lambda)$，$x_1=\frac13(2-\lambda)$。`],
['q',r`高斯-约当法怎样求逆矩阵？`,r`写成 $[A\,|\,I]$，只用**行**变换把左边化成 I：先往下消（下三角变 0），再往上消，最后每行除以主元。左边变成 I 时右边就是 $A^{-1}$；左边出现全 0 行 → A 不可逆。`],
['q',r`为什么行变换不改变方程组的解？`,r`每一步都可以倒回去：交换可以再换回来，乘 k 可以除回来，加上 k 倍的另一行可以再减掉。新方程组和旧的互相推得出，所以解集相同。`],
['q',r`伴随矩阵法、高斯消元、高斯-约当法各适合什么情况？`,r`伴随矩阵：2×2、3×3 手算、题目要求「adjoint method」；高斯消元：只要解方程组、未知数多（电脑用的方法，例如有限元 FEA）；高斯-约当：要求逆、或想直接读出答案。考试按题目指定的方法做。`],
['err',r`高斯消元最常见的错误？`,r`忘了对 b 做同样的变换；E 的分子分母颠倒（分母是主元）；减的时候符号错（尤其 E 是负数时）；行乘 0；回代时从上往下代。`],
]);
D('M1-M4','特征值与特征向量','402202737d7a81579d13e4e9853a42fb',[
['q',r`特征值、特征向量的定义？`,r`方阵 A、非零向量 $\mathbf x$、数 λ 满足 $A\mathbf x=\lambda\mathbf x$：A 作用在 $\mathbf x$ 上只把它伸缩 λ 倍、不改变方向。λ 是特征值，$\mathbf x$ 是对应的特征向量。`],
['q',r`为什么特征值要满足 $\det(A-\lambda I)=0$？`,r`$A\mathbf x=\lambda\mathbf x\Rightarrow(A-\lambda I)\mathbf x=\mathbf 0$。要有**非零**解 $\mathbf x$，矩阵 $A-\lambda I$ 必须奇异（否则可逆，只能 $\mathbf x=\mathbf 0$），所以行列式为 0。这叫特征方程。`],
['q',r`为什么要写成 $A-\lambda I$，不能写 $A-\lambda$？`,r`矩阵不能减一个数。$\lambda\mathbf x=\lambda I\mathbf x$，所以 $A\mathbf x-\lambda I\mathbf x=(A-\lambda I)\mathbf x$：只在对角线上减 λ。`],
['q',r`$A=\begin{pmatrix}4&1\\3&2\end{pmatrix}$ 的特征值和特征向量？`,r`$(4-\lambda)(2-\lambda)-3=\lambda^2-6\lambda+5=0$，λ = 1、5。λ = 1：$3x_1+x_2=0$，$\mathbf x=k(1,-3)$；λ = 5：$-x_1+x_2=0$，$\mathbf x=k(1,1)$。`],
['q',r`求出 λ 后怎样求特征向量？`,r`把 λ 代回 $(A-\lambda I)\mathbf x=\mathbf 0$，用消元求出各分量的**比例**（会有一行变成 0），令一个分量为 1（或 k）写出其余分量。`],
['q',r`特征向量为什么不唯一？`,r`如果 $A\mathbf x=\lambda\mathbf x$，那么 $A(k\mathbf x)=\lambda(k\mathbf x)$。任何非零倍数都是同一个特征向量，只有**方向（各分量的比例）**确定。课件第 14 页：(1, −3)、(3, −9)、(−2, 6) 都对。`],
['q',r`特征值的和、积与矩阵有什么关系？`,r`所有特征值的**积 = det A**，**和 = 迹 tr A**（对角线之和）。例：$\begin{pmatrix}4&1\\3&2\end{pmatrix}$：1 × 5 = 5 = det，1 + 5 = 6 = 4 + 2。可以用来检查。`],
['q',r`3 × 3 例题 $\begin{pmatrix}2&0&1\\-1&4&-1\\-1&2&0\end{pmatrix}$ 的特征值和特征向量？`,r`$(2-\lambda)(\lambda^2-4\lambda+3)=0$，λ = 1、2、3。特征向量：λ = 1 → (1, 0, −1)；λ = 2 → (2, 1, 0)；λ = 3 → (1, 2, 1)。检查：1·2·3 = 6 = det，1 + 2 + 3 = 6 = tr。`],
['q',r`怎样用特征值求 $A^n$？`,r`$A\mathbf x=\lambda\mathbf x\Rightarrow A^n\mathbf x=\lambda^n\mathbf x$。把向量拆成特征向量的组合 $c_1\mathbf x_1+c_2\mathbf x_2$，则 $A^n(\cdot)=c_1\lambda_1^n\mathbf x_1+c_2\lambda_2^n\mathbf x_2$。|λ| < 1 的部分在 n 大时消失。`],
['q',r`$A=\begin{pmatrix}0.8&0.3\\0.2&0.7\end{pmatrix}$，$A^{100}$ ≈ ？为什么？`,r`特征值 1（特征向量 (0.6, 0.4)）和 0.5（特征向量 (1, −1)）。$0.5^{100}\approx0$，所以 $A^{100}(1,-1)^T\approx\mathbf 0$、$A^{100}(0.6,0.4)^T=(0.6,0.4)^T$，解得 $A^{100}\approx\begin{pmatrix}0.6&0.6\\0.4&0.4\end{pmatrix}$。`],
['q',r`振动问题里，特征值和特征向量分别代表什么？`,r`$M\ddot{\mathbf x}+K\mathbf x=\mathbf 0$，设 $\mathbf x=\mathbf x_0\sin\omega t$ 得 $(M^{-1}K-\omega^2I)\mathbf x_0=\mathbf 0$。特征值 $\lambda=\omega^2$（固有频率的平方），特征向量 = **振型**（各质量位移的比例）。`],
['q',r`两层楼（2m、2k；m、k）的两个振型？`,r`$\lambda_1=\frac{k}{2m}$，振型 (0.5, 1)：两层同相；$\lambda_2=\frac{2k}{m}$，振型 (−1, 1)：反相。固有频率 $\omega_1=\sqrt{k/2m}$，$\omega_2=\sqrt{2k/m}=2\omega_1$。`],
['q',r`重根特征值一定只有一个特征向量方向吗？`,r`不一定。Mock Exam 1 的 $G=\frac14\begin{pmatrix}2&1&1\\1&2&1\\1&1&2\end{pmatrix}$ 有重根 λ = 1/4，对应两个独立的特征向量 (−1, 1, 0)、(−1, 0, 1)；λ = 1 对应 (1, 1, 1)。`],
['err',r`求特征值 / 特征向量最常见的错误？`,r`写成 $A-\lambda$（应为 $A-\lambda I$，只减对角线）；展开行列式时漏负号；以为特征向量是唯一的一组数；代回 λ 后两行不成比例（说明 λ 算错了）；把 λ 当成固有频率（其实是 ω²）。`],
]);
D('M1-Z1','复数：标准形式与四则运算','402202737d7a817c9155dd9d42a1d169',[
['q',r`j 是什么？为什么工程里用 j 不用 i？`,r`$j=\sqrt{-1}$，$j^2=-1$。电气工程里 i 已经用来表示电流，所以用 j（数学里用 i）。`],
['q',r`$j^2,\ j^3,\ j^4$ = ？怎样算 $j^{103}$？`,r`$j^2=-1$，$j^3=-j$，$j^4=1$，每 4 次循环。103 = 4 × 25 + 3，$j^{103}=j^3=-j$。`],
['q',r`为什么需要复数？`,r`二次方程判别式 $b^2-4ac<0$ 时没有实数解，例如 $x^2-2x+4=0$ 的解是 $1\pm j\sqrt3$。电路里电感、电容的阻抗也是虚数：$j\omega L$、$\frac{1}{j\omega C}$。`],
['q',r`复数的标准形式？实部、虚部？`,r`$Z=x+jy$：$\mathrm{Re}(Z)=x$，$\mathrm{Im}(Z)=y$。注意虚部是 y（不带 j）。例：Re(3 + 4j) = 3，Im(3 + 4j) = 4。`],
['q',r`复数加减、乘法怎么算？`,r`加减：实部和实部、虚部和虚部分别算。乘法：像多项式一样展开，再用 $j^2=-1$：$(x+jy)(a+jb)=(xa-yb)+j(xb+ya)$。`],
['q',r`$(3+4j)(5+2j)$ = ？`,r`$15+6j+20j+8j^2=15+26j-8=7+26j$。乘法可交换。`],
['q',r`共轭是什么？$Z\bar Z$ 等于什么？`,r`$Z=x+jy$ 的共轭 $\bar Z=Z^*=x-jy$（只改虚部的符号）。$Z\bar Z=x^2+y^2$，是实数。`],
['q',r`复数除法怎么做？`,r`分子分母同乘**分母的共轭**，分母变成实数 $a^2+b^2$：$\dfrac{x+jy}{a+jb}=\dfrac{(xa+yb)+j(ya-xb)}{a^2+b^2}$。`],
['q',r`$\dfrac{2+j}{4+3j}$ = ？`,r`乘 $\frac{4-3j}{4-3j}$：$\frac{(8+3)+j(4-6)}{16+9}=\frac{11}{25}-j\frac{2}{25}$。`],
['q',r`在 Argand 图上，加法、共轭、乘 j 分别是什么几何操作？`,r`加法：向量相加（平行四边形）。共轭：关于实轴翻折。乘 j：绕原点逆时针转 90°。`],
['q',r`两个阻抗并联的总阻抗？`,r`$\frac{1}{Z_T}=\frac1{Z_1}+\frac1{Z_2}$，即 $Z_T=\frac{Z_1Z_2}{Z_1+Z_2}$。电阻 $Z=R$，电感 $Z=j\omega L=j2\pi fL$。最后乘分母的共轭化成 x + jy。`],
['err',r`复数运算最常见的错误？`,r`忘了 $j^2=-1$；虚部写成带 j 的 $4j$（应为 4）；除法只乘分母不乘分子；共轭把实部也变号；$\sqrt{-16}$ 写成 $-4$。`],
]);
D('M1-Z2','复数：极坐标与指数形式','402202737d7a81b3a864d5cd238d0ebd',[
['q',r`复数的极坐标形式？R 和 θ 怎么求？`,r`$Z=R(\cos\theta+j\sin\theta)=R\angle\theta$。模 $R=|Z|=\sqrt{x^2+y^2}$，辐角 θ 是从正实轴逆时针量到 Z 的角，$\tan\theta=\frac yx$。`],
['q',r`为什么不能直接用 $\theta=\tan^{-1}(y/x)$？`,r`计算器的 $\tan^{-1}$ 只给 −90° 到 90°（第一、四象限）。x < 0 时要加 180°（或减 180°）。例：$-1+j\sqrt3$：$\tan^{-1}(-\sqrt3)=-60°$，正确是 120°。先画图看象限。`],
['q',r`欧拉公式？指数形式？`,r`$e^{j\theta}=\cos\theta+j\sin\theta$，所以 $Z=R(\cos\theta+j\sin\theta)=Re^{j\theta}$。`],
['q',r`用指数表示 cos θ 和 sin θ？`,r`$\cos\theta=\dfrac{e^{j\theta}+e^{-j\theta}}{2}$，$\sin\theta=\dfrac{e^{j\theta}-e^{-j\theta}}{2j}$（把 $e^{j\theta}$ 和 $e^{-j\theta}$ 相加、相减）。`],
['q',r`指数形式的乘法和除法？`,r`$(Ae^{j\alpha})(Be^{j\beta})=ABe^{j(\alpha+\beta)}$：模相乘、角度相加。$\frac{Ae^{j\alpha}}{Be^{j\beta}}=\frac ABe^{j(\alpha-\beta)}$：模相除、角度相减。不用乘共轭。`],
['q',r`$70e^{j\pi/4}\times100e^{j5\pi/6}$ 和 $\div$ 分别 = ？`,r`乘：$7000e^{j13\pi/12}$（195°，也可写 −165°）。除：$0.7e^{-j7\pi/12}$（−105°）。`],
['q',r`棣莫弗定理？`,r`$Z^n=(Re^{j\theta})^n=R^ne^{jn\theta}=R^n(\cos n\theta+j\sin n\theta)$。`],
['q',r`怎样求 $Z^n=w$ 的 n 个根？`,r`把 w 写成 $Re^{j\theta}$，角度加上 $2\pi k$：$Z=R^{1/n}e^{j(\theta+2\pi k)/n}$，k = 0, 1, …, n − 1。n 个根模相同，在圆上等距分布，相邻差 $360°/n$。`],
['q',r`$Z^4=2\sqrt3+2j$ 的四个根？`,r`$2\sqrt3+2j=4e^{j\pi/6}$。根：$\sqrt2\,e^{j\pi/24}$、$\sqrt2\,e^{j13\pi/24}$、$\sqrt2\,e^{j25\pi/24}$、$\sqrt2\,e^{j37\pi/24}$，即 7.5°、97.5°、187.5°、277.5°。`],
['q',r`$j$、$-1$、$3$、$3j$ 的指数形式？`,r`$j=e^{j\pi/2}$，$-1=e^{j\pi}$，$3=3e^{j0}$，$3j=3e^{j\pi/2}$。`],
['q',r`传递函数一类的连乘连除，为什么换成指数形式？`,r`标准形式要一项项展开、乘共轭；指数形式只要模相乘除、角度相加减。课件第 26–28 页：$T=\frac{20e^{j5\pi/6}}{3e^{j\pi/3}\cdot6e^{j2\pi/3}\cdot4e^{j\pi/4}}=\frac5{18}e^{-j5\pi/12}\approx0.072-0.268j$。`],
['err',r`极坐标 / 指数形式最常见的错误？`,r`辐角象限错（直接用 $\tan^{-1}$）；度和弧度混用；指数形式漏了模 R（课件第 32 页 $e^{-0.896j}$ 漏了 $\sqrt{41}$）；求 n 次根只给一个根。`],
]);
D('M1-D1','常微分方程入门：分类与分离变量','402202737d7a81819e7adcfe88590ae6',[
['q',r`常微分方程（ODE）和偏微分方程的区别？`,r`ODE：未知函数只有一个自变量，例如 y(x)，只含 $\frac{dy}{dx}$ 这类导数。偏微分方程：未知函数有多个自变量，含 $\frac{\partial y}{\partial x}$、$\frac{\partial y}{\partial z}$。`],
['q',r`ODE 的阶（order）怎么看？`,r`方程里出现的**最高阶导数**。$\frac{d^3y}{dx^3}-\tan x\frac{dy}{dx}=\sec x$ 是三阶。注意 $\left(\frac{dz}{dx}\right)^2$ 仍是一阶（平方不改变阶）。`],
['q',r`什么样的 ODE 是线性的？`,r`能写成 $a_0(x)y^{(n)}+\cdots+a_{n-1}(x)y'+a_n(x)y=b(x)$：y 和它的导数只以**一次方**出现，没有 $y^2$、$y\,y'$、$\cos y$、$(y')^2$。系数可以是 x 的任意函数。`],
['q',r`齐次和非齐次（线性 ODE）？`,r`把含 y 的项放左边，右边 $b(x)=0$ 是齐次，$b(x)\ne0$ 是非齐次。例：$\frac{dy}{dt}=y\sin t$ 齐次；$\frac{dy}{dx}+y=x$ 非齐次。`],
['q',r`通解和特解的区别？`,r`通解含任意常数（一阶 1 个、二阶 2 个），是一整族曲线；特解是用初始 / 边界条件定出常数后的那一条。`],
['q',r`什么时候可以直接积分？`,r`$\frac{dy}{dx}=Q(x)$：右边只有 x，没有 y。两边积分 $y=\int Q(x)\,dx+C$。`],
['q',r`分离变量法适用于什么方程？步骤？`,r`$\frac{dy}{dx}=P(x)R(y)$（右边能拆成「x 的函数 × y 的函数」）。把 y 都移到左边：$\int\frac{dy}{R(y)}=\int P(x)\,dx$，两边积分，加一个常数，再用条件定常数。`],
['q',r`$\frac{dP}{dV}=-\frac{kP}{V}$ 怎样推出 $PV^k$ = 常数？`,r`分离：$\int\frac{dP}{P}=-k\int\frac{dV}{V}$，$\ln P=-k\ln V+\ln C$，$P=CV^{-k}$，即 $PV^k=C$（绝热过程）。`],
['q',r`RL 电路合上开关后电流？`,r`$L\frac{di}{dt}+Ri=V$，分离变量并用 i(0) = 0：$i=\frac VR\left(1-e^{-Rt/L}\right)$。时间常数 L/R，最终电流 V/R。`],
['q',r`牛顿冷却定律的方程和解？`,r`$\frac{d\theta}{dt}=-k(\theta-\theta_0)$，解 $\theta-\theta_0=(\theta_1-\theta_0)e^{-kt}$：温差按指数衰减。若 T 时间温差减半，$k=\frac{\ln2}{T}$，降到 $\frac{\theta_1+n\theta_0}{n+1}$ 要 $T\log_2(n+1)$。`],
['q',r`为什么分离变量后只加一个常数？`,r`两边各自积分会产生 $C_1$、$C_2$，但它们可以合并成一个 $C=C_2-C_1$。常数也常写成 $\ln C$ 以便化简对数。`],
['err',r`解一阶 ODE 最常见的错误？`,r`忘了加积分常数，或者在化简后才加；$\int\frac1y\,dy$ 写成 $\ln y$ 时丢了绝对值 / 正负；把非线性的 $y^2$ 当成线性；用初始条件时代错变量。`],
]);
D('M1-D2','一阶线性方程与积分因子','402202737d7a81dea0c4f24c85edf81a',[
['q',r`积分因子法适用于什么形式？`,r`一阶**线性**：$\frac{dy}{dx}+P(x)y=Q(x)$。先把 $\frac{dy}{dx}$ 的系数化成 1。`],
['q',r`积分因子是什么？`,r`$f(x)=e^{\int P(x)\,dx}$（不用加常数）。`],
['q',r`为什么乘了积分因子就能解？`,r`要求 $f'=Pf$，于是 $f\frac{dy}{dx}+Pfy=f\frac{dy}{dx}+f'y=\frac{d}{dx}(fy)$（乘积求导反过来）。方程变成 $\frac{d}{dx}(fy)=Qf$，直接积分。`],
['q',r`积分因子法的最终公式？`,r`$e^{\int P\,dx}\,y=\int Q\,e^{\int P\,dx}\,dx+C$，再除以积分因子。`],
['q',r`$\frac{dy}{dx}+y=x$ 的通解？`,r`积分因子 $e^x$：$(ye^x)'=xe^x$，$ye^x=(x-1)e^x+C$，$y=x-1+Ce^{-x}$。`],
['q',r`$x\frac{dy}{dx}+2y=x^2$ 的通解？`,r`先除以 x：$P=\frac2x$，积分因子 $e^{2\ln x}=x^2$。$(x^2y)'=x^3$，$y=\frac{x^2}4+\frac{C}{x^2}$。`],
['q',r`$\frac{dy}{dx}=-2xy$，$y(0)=1$ 的解？`,r`分离变量（或积分因子 $e^{x^2}$）：$y=Ce^{-x^2}$，$y(0)=1$ 得 $y=e^{-x^2}$（高斯曲线）。课件第 3 页写成 $e^{1-x^2}$ 是错的，那是 $y(1)=1$ 的解。`],
['q',r`同一个 RL 电路，用积分因子怎么解？`,r`$\frac{di}{dt}+\frac RLi=\frac VL$，积分因子 $e^{Rt/L}$：$ie^{Rt/L}=\frac VRe^{Rt/L}+C$，$i=\frac VR+Ce^{-Rt/L}$，和分离变量结果相同。`],
['q',r`积分因子里的常数为什么可以不要？`,r`$e^{\int P\,dx+c}=e^c\cdot e^{\int P\,dx}$，多出来的常数倍在方程两边同时出现，约掉了。`],
['q',r`分离变量和积分因子怎么选？`,r`右边能拆成 x 的函数 × y 的函数 → 分离变量；能写成 $y'+P(x)y=Q(x)$ → 积分因子。Q = 0 或 P、Q 都是常数时两种都行。`],
['err',r`积分因子法最常见的错误？`,r`没先把 $y'$ 的系数化成 1；P 的符号弄错（$y'-2y$ 的 P 是 −2）；左边忘了写成 $(fy)'$ 就积分；最后忘了除以 f；忘了 +C 或把 C 也乘错。`],
]);
D('M1-D3','二阶齐次方程：特征方程与阻尼振动','402202737d7a814db27ceb448ae7655d',[
['q',r`二阶常系数齐次方程的特征方程怎么来？`,r`$ay''+by'+cy=0$，设 $y=Ae^{rx}$，代入得 $Ae^{rx}(ar^2+br+c)=0$。$e^{rx}\ne0$，所以 $ar^2+br+c=0$（特征方程 / 辅助方程）。`],
['q',r`特征方程三种根对应的通解？`,r`两个不同实根：$y=C_1e^{r_1x}+C_2e^{r_2x}$；重根：$y=(C_1+C_2x)e^{rx}$；共轭复根 $\alpha\pm j\beta$：$y=e^{\alpha x}(C_1\cos\beta x+C_2\sin\beta x)$。`],
['q',r`为什么二阶方程的通解有两个常数？`,r`相当于积分了两次。要两个条件（例如初始位移和初始速度）才能定出特解。`],
['q',r`简谐运动 $m\ddot x+kx=0$ 的解？`,r`特征方程 $mr^2+k=0$，$r=\pm j\sqrt{k/m}$。$x=C_1\cos\omega t+C_2\sin\omega t=C\cos(\omega t+\delta)$，$\omega=\sqrt{k/m}$。`],
['q',r`课件弹簧例题（m = 2 kg，k = 128 N/m，x(0) = 0.2，x′(0) = 0）的解？`,r`$2r^2+128=0$，$r=\pm8j$，$x=C_1\cos8t+C_2\sin8t$。条件得 $C_1=0.2$、$C_2=0$：$x=0.2\cos8t$ m。`],
['q',r`阻尼振动方程？`,r`$m\ddot x+d\dot x+kx=0$，阻尼力 $-d\dot x$ 和速度成正比、方向相反。特征方程 $mr^2+dr+k=0$。`],
['q',r`过阻尼、临界阻尼、欠阻尼怎么判断？`,r`看 $d^2-4mk$：> 0 过阻尼（两个负实根，不振荡）；= 0 临界阻尼（重根，最快回零而不振荡，$d=2\sqrt{mk}$）；< 0 欠阻尼（复根，振荡衰减）。`],
['q',r`课件 d = 40 的例子是哪种？`,r`$2\ddot x+40\dot x+128x=0$ ⇒ $r^2+20r+64=(r+4)(r+16)=0$，根 −4、−16，过阻尼：$x=C_1e^{-4t}+C_2e^{-16t}$。`],
['q',r`欠阻尼时的振荡频率和衰减？`,r`根 $-\frac{d}{2m}\pm j\omega$，$\omega=\frac{\sqrt{4mk-d^2}}{2m}$。解 $e^{-dt/2m}(C_1\cos\omega t+C_2\sin\omega t)$：振荡，振幅按 $e^{-dt/2m}$ 衰减。`],
['q',r`$C_1\cos\omega t+C_2\sin\omega t$ 怎样写成一个余弦？`,r`$C\cos(\omega t+\delta)$，$C=\sqrt{C_1^2+C_2^2}$，$\cos\delta=\frac{C_1}C$，$\sin\delta=-\frac{C_2}C$（振幅和相位）。`],
['err',r`二阶齐次方程最常见的错误？`,r`复根时写成 $e^{(\alpha+j\beta)x}$ 不化成 cos、sin；把 β 写成 8j（应是实数 8）；重根忘了乘 x；只用一个条件定两个常数。`],
]);
D('M1-D4','二阶非齐次方程：特解与共振','402202737d7a81ae900fe3d413febd9d',[
['q',r`非齐次方程 $ay''+by'+cy=f(x)$ 的通解结构？`,r`$y=y_c+y_p$：余函数 $y_c$（齐次方程的通解，含两个常数）+ 特解 $y_p$（任意一个满足原方程的解）。`],
['q',r`为什么 $y_c+y_p$ 是解？`,r`代入后左边 = （$y_c$ 的部分 = 0）+（$y_p$ 的部分 = f(x)）= f(x)。方程是线性的，所以可以叠加。`],
['q',r`特解的形式怎么选（待定系数）？`,r`跟 f(x) 同类：常数 k → C；kx → Cx + D；$kx^2$ → $Cx^2+Dx+E$；$\sin x$ 或 $\cos x$ → $C\cos x+D\sin x$；$e^{kx}$ → $Ce^{kx}$。`],
['q',r`f(x) 和余函数「撞车」时怎么办？`,r`试的形式已经是齐次解，代入只得 0。要乘 x（重根时乘 $x^2$）：例如 $e^{rx}$ 而 r 是特征根 → $Cxe^{rx}$。`],
['q',r`$y''+6y'+9y=5\cos x$ 的通解？`,r`余函数 $(C_1+C_2x)e^{-3x}$（重根 −3）。设 $y_p=C_3\cos x+C_4\sin x$，比较系数 $8C_3+6C_4=5$、$8C_4-6C_3=0$，得 $y_p=\frac25\cos x+\frac3{10}\sin x$。`],
['q',r`受迫振动 $m\ddot x+kx=F_0\cos\omega t$（ω ≠ ω₀）的特解？`,r`$x_p=\frac{F_0}{m(\omega_0^2-\omega^2)}\cos\omega t$，$\omega_0=\sqrt{k/m}$。ω 越接近 ω₀，振幅越大。`],
['q',r`共振（ω = ω₀）时的特解？`,r`$\cos\omega_0t$ 已经是余函数，要乘 t：$x_p=\frac{F_0}{2m\omega_0}t\sin\omega_0t$。振幅随时间线性增长，没有上限。`],
['q',r`工程上怎样避免共振破坏？`,r`让外力频率远离固有频率（改刚度或质量），或者加阻尼（共振峰变低，振幅有限）。例：伦敦千禧桥加装阻尼器。`],
['q',r`有阻尼时，稳态振幅是多少？`,r`$\frac{F_0}{\sqrt{(k-m\omega^2)^2+(d\omega)^2}}$。阻尼越大，共振峰越低越平。余函数随时间衰减，最后只剩稳态。`],
['q',r`求特解的系数时用什么方法？`,r`把试探解和它的导数代回方程，令两边 cos、sin（或 x 的各次幂）的系数分别相等，解线性方程组。`],
['err',r`求特解最常见的错误？`,r`只写 $C\cos x$ 漏了 $D\sin x$；撞车时没乘 x；把条件代进特解而不是全解来定常数；把 $y_p$ 当作全部答案忘了加 $y_c$。`],
]);
D('M1-D5','数值方法：Newton–Raphson 与 Euler 法','402202737d7a8115b22fdc6eb8f1e352',[
['q',r`为什么需要数值方法？`,r`很多方程（例如 $e^x-2x-5=0$、$\frac{dy}{dx}=x^2+y^2$、Navier–Stokes 方程）没有解析解，只能逐步估计。有限元、CFD 软件都是这样做的。`],
['q',r`Newton–Raphson 公式？`,r`$x_{n+1}=x_n-\frac{f(x_n)}{f'(x_n)}$：在当前点作切线，切线和 x 轴的交点作为下一个估计。`],
['q',r`Newton–Raphson 公式怎么推出来？`,r`在 $x_n$ 处的切线 $y=f(x_n)+f'(x_n)(x-x_n)$，令 y = 0 解出 x，就是 $x_{n+1}$。`],
['q',r`$e^x-2x-5=0$ 从 $x_0=2$ 出发的 Newton 迭代？`,r`$f(2)=-1.6109$，$f'(2)=5.3891$，$x_1=2.2989$；再迭代 2.2530、2.2516……收敛到 2.251636。另一个根 −2.4572 要从负数（如 −2）出发。`],
['q',r`Newton–Raphson 什么时候会失败？`,r`起点处 $f'(x)\approx0$（切线几乎水平，会跳很远，例如 $x_0=0.75$ 跳到 38）；起点离根太远；迭代值来回振荡或越来越大（发散）。换一个更靠近根的起点。`],
['q',r`怎样判断 Newton 迭代收敛？`,r`相邻两次的 x 差值越来越小（收敛）。越来越大说明发散，变化很慢说明需要很多步。`],
['q',r`Euler 法公式？`,r`$x_{n+1}=x_n+h$，$y_{n+1}=y_n+h\,f(x_n,y_n)$，其中 $f=\frac{dy}{dx}$：沿着当前点的斜率走一小步。`],
['q',r`$\frac{dy}{dx}=x^2+y^2$，y(0) = 1，h = 0.1 求 y(0.3)？`,r`$y_1=1+0.1(0+1)=1.1$；$y_2=1.1+0.1(0.01+1.21)=1.222$；$y_3=1.222+0.1(0.04+1.4933)=1.3753$。准确值 1.4397。`],
['q',r`步长 h 对 Euler 法的影响？`,r`h 越小越准，但步数越多。Euler 是一阶方法：误差大约和 h 成正比（h 减半误差约减半）。`],
['q',r`为什么 Euler 法在 $\frac{dy}{dx}=x^2+y^2$ 上一直偏低？`,r`斜率随 x、y 增大而增大，Euler 每一步用的是**起点**的斜率，比这一步里的平均斜率小，所以每步都少走一点。`],
['q',r`比 Euler 更好的方法？`,r`Runge–Kutta 方法（例如 RK4）：一步里取几个点的斜率加权平均，同样步长下准确得多。Newton–Raphson 属于 Householder 方法族中最简单的一个。`],
['err',r`数值方法最常见的错误？`,r`Newton 公式写成 $x+\frac f{f'}$（符号错）；导数算错；Euler 用了新点的斜率；表格里四舍五入太早；没检查收敛就报答案。`],
]);
})();

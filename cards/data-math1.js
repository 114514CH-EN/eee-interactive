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
})();

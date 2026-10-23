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
})();

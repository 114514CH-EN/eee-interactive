/* Engineering Maths 2 cards (MA = Probability, MB = Laplace + Fourier). [kind, question, answer] */
window.CARDS=window.CARDS||[];
(function(){const r=String.raw,N='https://app.notion.com/p/';
const D=(c,l,t,id,arr)=>arr.forEach((x,i)=>window.CARDS.push({id:l+'-'+(i+1),c,l,t,u:N+id,k:x[0],q:x[1],a:x[2]}));

D('MA','MA1','PDF 与随机变量','3eb202737d7a81a6b4a2ef49c247d744',[
['q',r`连续 PDF 和离散 PMF 各需满足哪两个条件？连续 PDF 的值能大于 1 吗？`,r`非负 + 总面积（总和）= 1。连续 PDF 可以大于 1（如 [0, 0.5] 上的均匀分布高度为 2），只要面积是 1；PMF 每个值 ≤ 1。`],
['q',r`写出期望和方差的离散 / 连续公式，以及方差的常用算法。`,r`$E[r]=\sum x_nP(x_n)$ 或 $\int xp(x)\,dx$
$Var(r)=E[(r-E[r])^2]=E[r^2]-(E[r])^2$`],
['q',r`均匀分布 $[a,b]$ 的期望和方差？公平骰子呢？`,r`均匀：$\dfrac{a+b}{2}$、$\dfrac{(b-a)^2}{12}$。骰子：3.5、$\dfrac{35}{12}\approx2.92$（$E[r^2]=91/6$）。`],
['q',r`$Var(ar+b)$ 等于什么？$Var(r_1+r_2)$ 什么时候等于 $Var(r_1)+Var(r_2)$？`,r`$Var(ar+b)=a^2Var(r)$（平移不改变分散程度）。只有**不相关**（$Cov=0$，即 $E[r_1r_2]=E[r_1]E[r_2]$）时方差才能相加。`],
['q',r`为什么样本方差除以 N 会偏小？Bessel 修正怎么做？`,r`$\bar x$ 是使 $\sum(x_n-c)^2$ 最小的 c，样本点离 $\bar x$ 比离真值近；$E[v]=\frac{N-1}{N}Var$。改成除以 $N-1$。`],
['q',r`$p(x)=\frac{\sin x}{2}$（$0\le x\le\pi$）的期望和方差？`,r`$E=\pi/2$（分部积分）；$E[r^2]=\frac{\pi^2-4}{2}$；$Var=\frac{\pi^2}{4}-2\approx0.467$。`],
['err',r`概率这一周最常见的三个错误？`,r`- 把密度 $p(x)$ 当概率（要积分）
- $E[r^2]=(E[r])^2$
- 方差提常数忘了平方，或在相关时直接相加方差`],
]);

D('MA','MA2','Bayes 规则','3eb202737d7a811b98d0f6b2f75b521e',[
['q',r`先验、似然、联合、后验各是什么？用骰子例子说明。`,r`- 先验 $P(F)=43/49$：看数据前
- 似然 $P(6|F)=1/6$：如果是 F，出 6 有多容易
- 联合 $P(6,F)=$ 先验 × 似然
- 后验 $P(F|6)=215/359$：看到 6 之后`],
['q',r`写出 Bayes 规则和分母的全概率展开。`,r`$P(H_i|d)=\dfrac{P(d|H_i)P(H_i)}{\sum_jP(d|H_j)P(H_j)}$。后验 = 本假设联合 ÷ 所有假设联合之和。`],
['q',r`43 公平 + 6 灌铅（出 6 概率 0.8）。掷一次 6 推断什么？两次呢？为什么？`,r`似然比一次 4.8、两次 23.04；先验比 43/6 ≈ 7.17。一次：先验占优 → 公平（0.60）；两次：证据占优 → 灌铅（P(F) ≈ 0.24）。`],
['q',r`3 枚硬币中 1 枚双正面，随机取一枚抛出正面，它是双正面的概率？`,r`$P(H)=\frac13\cdot1+\frac23\cdot\frac12=\frac23$；$P(D|H)=\dfrac{1/3}{2/3}=\frac12$。`],
['q',r`独立和不相关有什么区别？哪个推出哪个？`,r`独立：联合分布处处 = 边缘乘积；不相关：只要 $E[r_1r_2]=E[r_1]E[r_2]$。独立 ⇒ 不相关，反之不成立（反例 $r_2=r_1^2$，$r_1\sim U[-1,1]$）。`],
['err',r`Bayes 题里的典型错误？`,r`- $P(A|B)$ 当成 $P(B|A)$
- 只看似然不乘先验（W₂ 出 6 概率最高却不是最可能）
- 分母漏了某个假设
- 中间值过早舍入（官方 Q3 得 0.76 而不是 0.78）
- 「先取一个再取一个」默认不放回，一红一白有两种顺序`],
['fix',r`讲义第 5 页「连掷两次 6」用的先验有什么问题？`,r`改用了 8/9、1/9，和前面的 43/49、6/49 不一致。按一致先验 $P(F|6,6)=1075/4531\approx0.237$（讲义 0.26），结论不变。`],
['q',r`课上例题：3 个湖，先验 0.7 / 0.2 / 0.1，钓到 C、C、T、B。为什么答案是湖 2 而不是似然最大的湖 3？`,r`似然（独立相乘）：湖 1 $0.1^2\times0.8\times0.05=4\times10^{-4}$，湖 2 $0.7^2\times0.1\times0.1=4.9\times10^{-3}$，湖 3 $0.3^3\times0.2=5.4\times10^{-3}$。乘先验：$2.8,\ 9.8,\ 5.4\ (\times10^{-4})$，总和 $1.8\times10^{-3}$ → 后验 0.156 / 0.544 / 0.300。湖 3 似然最大，但平时去得少（0.1），湖 2 先验是它的两倍，反超。顺序数 4!/2! = 12 三个湖都乘，约掉`],
]);

D('MA','MA3','中心极限定理与假设检验','3eb202737d7a8118be04f4228ea3503a',[
['q',r`推导 $E(\bar r)$ 和 $V(\bar r)$，哪一步需要不相关？`,r`$E(\bar r)=E(r)$（线性）；$V(\bar r)=\frac{1}{N^2}V(\sum r_n)=\frac{1}{N^2}\sum V(r_n)=\frac{V}{N}$——拆成方差之和那一步需要不相关。`],
['q',r`中心极限定理说了什么？为什么骰子平均值也能用 ±2σ 规则？`,r`N 个独立同分布变量的平均，N 大时 $\dot\sim\text{Gaussian}(m, v/N)$，不管原分布形状。检验用的是 $\bar r$，它近似高斯。`],
['q',r`68 / 95 / 99 规则？严格的 95%、99% 对应几个 σ？`,r`±1σ ≈ 68%，±2σ ≈ 95%（精确 95.45%），±3σ ≈ 99%（99.73%）。严格 95% ↔ 1.96σ，99% ↔ 2.58σ。本课用 2σ。`],
['q',r`写出 p = 0.05 假设检验的四步。`,r`1. 转化为「X 是不是 $\bar r$ 的样本」
2. $H_0$：正常；$H_1$：不正常
3. CLT：$\sigma(\bar r)=\sqrt{v/N}$
4. $|\hat r|=\frac{|X-m|}{\sigma(\bar r)}>2$ 就拒绝 $H_0$`],
['q',r`公平骰子掷 10 次平均 4，掷 50 次平均 4，结论分别是什么？`,r`N = 10：σ(r̄) = 0.54，r̂ = 0.93 → 接受 H₀。N = 50：σ(r̄) = 0.24，r̂ = 2.07 → 拒绝 H₀。`],
['q',r`要求 95% 置信样本均值在真值 ±ε 内，N 至少多少？`,r`$2\sqrt{V/N}\le\varepsilon\Rightarrow N\ge\dfrac{4V}{\varepsilon^2}$，向上取整（Tutorial Q1：V = 0.96、ε = 0.1 → 384）。`],
['err',r`假设检验最常见的错误？`,r`- 用单次 σ(r) 而不是 σ(r̄)
- 方差当标准差（巧克力题给的是 0.2 g²）
- N 没有向上取整
- 「接受 H₀」说成「证明了 H₀」`],
]);

D('MA','MA4','马尔可夫过程与 PageRank','3eb202737d7a81a5990ade814bc3a826',[
['q',r`马尔可夫模型由哪三样东西确定？$a_{n,m}$ 是什么意思？`,r`状态数 N、初始概率向量 $P^0$、转移矩阵 A。$a_{n,m}=P(x_t=m\mid x_{t-1}=n)$：从 n 走到 m 的概率，**每一行加起来是 1**。`],
['q',r`什么是马尔可夫性（Markov property）？`,r`下一步只取决于当前状态，和更早走过哪些状态无关（无记忆）。`],
['q',r`序列概率怎么算？讲义 $x=113231$ 的答案？`,r`$P(x|M)=P^0(x_1)\,a_{x_1x_2}\cdots a_{x_{J-1}x_J}$。$0.3\times0.2\times0.1\times0.2\times0.6\times0.5=0.00036$。`],
['q',r`状态概率怎样一步步更新？矩阵形式？`,r`$P^{k+1}(m)=\sum_nP^k(n)\,a_{n,m}$（所有能走到 m 的路加起来）。矩阵：$P^{k+1}=A^TP^k=(A^T)^{k+1}P^0$——注意是**转置**。`],
['q',r`PageRank 是什么？讲义 5 个网页的 PageRank？`,r`稳态 $P=A^TP$：$A^T$ 特征值 1 的特征向量，归一化使和为 1。讲义：$[5/22,\ 5/22,\ 0,\ 5/22,\ 7/22]$，网页 3 没有入链所以是 0。`],
['q',r`怎样从观测到的序列估计 $P^0$ 和 A？`,r`$P^0$：各状态作为**第一个**符号出现的频率。$a_{n,m}=\dfrac{n\to m\ \text{的次数}}{\text{从 n 出发的总次数}}$。Tutorial Q3：$P^0=[4/6,2/6]$，两行都是 $[0.625,0.375]$。`],
['q',r`Tutorial Q2：aabacb 来自 X 还是 Y？`,r`似然 $P(s|X)=0.00135$、$P(s|Y)=0.00002$；先验 3/4、1/4。后验 $P(X|s)\approx0.995$ → X。`],
['err',r`马尔可夫这一周最常见的错误？`,r`- 用 A 乘 $P^k$（应该用 $A^T$），或把行、列的含义搞反
- 序列概率漏乘起点 $P^0(x_1)$
- 稳态向量忘了归一化（和为 1）
- 估计 A 时用「总转移数」做分母，而不是「从该状态出发的次数」`],
['q',r`讲义 5 个网页：为什么 $P^1(5)=0.39$？算「到达」概率要看 A 的行还是列？`,r`看**列**（行 = 出发，列 = 到达）。第 5 列：谁能走到 5。$P^0(1)a_{1,5}+P^0(3)a_{3,5}+P^0(4)a_{4,5}=0.1\times0.4+0.3\times0.5+0.2\times1=0.39$。按列汇总写成矩阵就是 $A^T$。`],
['q',r`为什么稳态 $P=A^TP$ 一定存在？为什么解的时候还要补上 $\sum P=1$？`,r`A 每行和为 1 ⇒ $A\mathbf 1=\mathbf 1$，1 是 A 的特征值；转置不改变特征值 ⇒ 也是 $A^T$ 的。N 个方程加起来是恒等式，只有 N − 1 个独立，所以必须补归一化。`],
['q',r`2 个状态的稳态怎么直接写？直觉是什么？`,r`平衡：$P(1)a_{1,2}=P(2)a_{2,1}$（1→2 的流量 = 2→1 的流量）⇒ $P(1)=\dfrac{a_{2,1}}{a_{1,2}+a_{2,1}}$。越难离开的状态待得越久。例：$a_{1,2}=0.1$、$a_{2,1}=0.3$ → $[0.75,\ 0.25]$。`],
['q',r`Tutorial Q4：怎样用 $P^1$、$P^2$ 快速求「恰好生成 2 个符号」的概率？`,r`退出态只进不出，$P^t(3)$ = 到第 t 步为止已经退出的概率。恰好 2 个 = 第 2 步时已退出、第 1 步时还没退出：$P^2(3)-P^1(3)=0.51-0.29=0.22$（Solutions4 的做法），和列举 aa、ab、ba、bb 四条路径的结果一样。`],
['fix',r`Solutions4 的 Q2 哪里算错了？怎么发现？`,r`$P(Y|s)$ 应约为 0.005（$=0.000005/0.0010175$），官方写成 0.015，分子还把 0.00002 抄成了 0.0002。检查：两个后验加起来必须是 1，而 0.995 + 0.015 = 1.01。另外官方把 0.00135 舍成 0.0013、把 P(s) 舍成 0.001，按这些数算 P(X|s) 会得 0.975，所以中间结果要多留几位。`],
['q',r`例题课 BA：留存 85%、从别家抢 10%，现在份额 30%，每年飞 2 次，2 年后份额？长期呢？`,r`$A=\begin{bmatrix}0.85&0.15\\0.1&0.9\end{bmatrix}$，4 步：$P^4=(A^T)^4P^0$。$(A^T)^2=\begin{bmatrix}0.7375&0.175\\0.2625&0.825\end{bmatrix}$，再平方后乘 $[0.3,0.7]^T$ → 0.368（36.8%）。长期：$\frac{a_{2,1}}{a_{1,2}+a_{2,1}}=\frac{0.1}{0.25}=0.4$。检查：$(A^T)^k$ 每列和为 1（手写把 0.7375 抄成了 0.7325）`],
]);

D('MA','MA5','极值理论与 GEV 分布','3eb202737d7a8164a3bafe08e760e965',[
['q',r`为什么工程上要研究「最大值」的分布，而不是平均值？`,r`可靠性：海堤、大坝、楼要扛住整个寿命里**最坏**的那一次（最高潮位、最大风速、最大降雨），平均值说明不了这个。英国标准要求新建筑扛住「50 年一遇风速」。`],
['q',r`$M_n=\max\{X_1,\dots,X_n\}$ 的分布函数是什么？为什么？`,r`$P(M_n\le x)=F(x)^n$。最大值不超过 x ⇔ 每一个都不超过 x；各次独立同分布，概率相乘。`],
['q',r`为什么 $F(x)^n$ 直接取极限没有用，要先平移缩放？`,r`只要 $F(x)<1$，$F(x)^n\to0$：极限退化成一个点（F 的上端点）。和 CLT 一样，要用 $(M_n-b_n)/a_n$ 把它「拉开」才能看到形状。`],
['q',r`极值类型定理说了什么？`,r`如果存在 $a_n>0$、$b_n$ 使 $P\big((M_n-b_n)/a_n\le x\big)\to G(x)$ 且 G 不退化，那么 G 只能是三种之一：Gumbel、Fréchet、Weibull——不管原来的 F 是什么。是「最大值版的中心极限定理」。`],
['q',r`写出三种极值分布，各有什么特点？`,r`I Gumbel：$e^{-e^{-x}}$，无界，尾巴按指数衰减。II Fréchet：$e^{-x^{-\alpha}}$（x > 0），无界，尾巴最重（幂律）。III Weibull：$e^{-(-x)^{\alpha}}$（x < 0），**有上界**。`],
['q',r`GEV 的分布函数和三个参数？`,r`$G(x)=\exp\{-t(x)\}$，$t(x)=\big(1+\xi\frac{x-\mu}{\sigma}\big)^{-1/\xi}$（ξ = 0 时 $e^{-(x-\mu)/\sigma}$）。μ 位置、σ > 0 尺度、ξ 形状；只在 $1+\xi(x-\mu)/\sigma>0$ 上有定义。`],
['q',r`ξ 的正负分别对应哪种类型？`,r`ξ = 0 Gumbel；ξ > 0 Fréchet（α = 1/ξ，尾巴重）；ξ < 0 Weibull（α = −1/ξ，上界 $\mu-\sigma/\xi$）。`],
['q',r`讲义的 GEV 密度 $\frac1\sigma t^{\xi+1}e^{-t}$ 是怎么来的？`,r`对 $G=e^{-t}$ 求导：$G'=-e^{-t}\,t'$，而 $t'=-\frac1\sigma t^{\xi+1}$（链式法则），所以 $g=\frac1\sigma t^{\xi+1}e^{-t}$。`],
['q',r`Tutorial Q2：Exp(1) 的最大值，取 $a_n=1$、$b_n=\ln n$，极限是什么？`,r`$P(M_n-\ln n\le x)=(1-e^{-x-\ln n})^n=(1-e^{-x}/n)^n\to\exp(-e^{-x})$：Gumbel。`],
['q',r`Tutorial Q3：Fréchet(1) 的最大值，取 $a_n=n$、$b_n=0$，结果？`,r`$P(M_n/n\le x)=(e^{-1/(nx)})^n=e^{-1/x}$：对**每个** n 都正好是 Fréchet(1)，不需要取极限（max-stable）。`],
['q',r`Tutorial Q1：怎样用数据估计「超过 8.75 ft」的概率和 10 年一遇的高度？`,r`数个数：33/50 = 0.66（11.25 ft：6/50 = 0.12；14 ft：0）。10 年一遇 ⇔ 每年超过概率 1/10 ⇔ 50 年里有 5 年达到：第 5 大的数 11.8 ft。100 年一遇数据不够，要用极值理论外推。`],
['q',r`重现水平 $z_T$ 的定义和 GEV 公式（补充）？`,r`年最大值超过 $z_T$ 的概率 = 1/T。由 $G(z_T)=1-1/T$：$z_T=\mu-\frac\sigma\xi\big[1-(-\ln(1-1/T))^{-\xi}\big]$；ξ = 0 时 $z_T=\mu-\sigma\ln(-\ln(1-1/T))$。`],
['err',r`极值这一周最容易错的地方？`,r`- $P(M_n\le x)$ 是 $F(x)^n$，不是 $nF(x)$ 或 $1-(1-F)^n$（那是最小值）
- 「100 年一遇」不是「100 年内一定来一次」：50 年内至少出现一次的概率 $1-0.99^{50}\approx0.39$
- GEV 只在 $1+\xi(x-\mu)/\sigma>0$ 的范围内有定义
- ξ > 0 是 Fréchet（重尾），ξ < 0 才是有上界的 Weibull，别记反`],
['fix',r`PDF Tails 1 讲义里有哪些要改的地方？`,r`第 4 页 CLT 的缩放应是 $a_n=\sigma/\sqrt n$（写成 σ/n）；「→ G(X)」应为 G(x)；「样本均值以概率 1 收敛到 μ」是大数定律不是 CLT；第 2 页提到的 Figure 1.1 文件里没有；式 (5) 是密度，分布函数 $G=e^{-t(x)}$ 讲义没写出来。`],
]);

D('MA','MA6','PDF 尾部 2：拟合 GEV、QQ 图与重现水平','3eb202737d7a81d89c95fb16f7d4bbd1',[
['q',r`讲座 MATLAB 例子（EVT_EngMaths2_wk6.m）分析一组年最大值的五个步骤是什么？`,r`1. 画时间序列 ‹plot(year,data)› 和直方图 ‹histogram(data,13)›：看有没有趋势、离群点
2. 拟合 GEV：‹pd = fitdist(data.', 'GeneralizedExtremeValue')›（最大似然）
3. 检查拟合：‹qqplot(data, pd)›，点贴着对角线就合适
4. 算重现水平：‹rlevel(r, pd)›，r = 10、100、500 年
5. 看不确定性：‹pd.ParameterCovariance›（参数的协方差矩阵）`],
['q',r`fitdist 拟合 GEV 用的是什么方法？最大化的是什么？`,r`**最大似然**：找使对数似然最大的 (ξ, μ, σ)
$$\ell(\mu,\sigma,\xi)=\sum_{i=1}^n\ln g(x_i)=-n\ln\sigma+\sum_i\big[(\xi+1)\ln t(x_i)-t(x_i)\big]$$
其中 $t(x)=\big(1+\xi\frac{x-\mu}{\sigma}\big)^{-1/\xi}$，g 是 Week 5 的 GEV 密度。MATLAB 里 ξ 叫 ‹k›，σ 叫 ‹sigma›，μ 叫 ‹mu›`],
['q',r`讲座的 Wassaw 海浪数据拟合出的 GEV 参数是多少？是哪一型？`,r`ξ ≈ **−0.108**，μ ≈ **8.71** ft，σ ≈ **1.31** ft（标准误分别约 0.11、0.21、0.15）。
ξ 小于 0 → Weibull 型，有上界 μ − σ/ξ ≈ 20.8 ft；但 ξ 离 0 不到一个标准误，和 Gumbel 区分不开`],
['q',r`QQ 图是怎么画出来的？怎么看？`,r`- 把 n 个数据从小到大排好，第 i 个配上模型在累积概率 $(i-0.5)/n$ 处的分位数 $G^{-1}\big(\frac{i-0.5}{n}\big)$
- 横轴模型分位数、纵轴数据，画 n 个点，再画 y = x 虚线
- 点贴着虚线 → 模型合适；两头系统性弯出去（香蕉形）→ 模型尾巴的形状不对；最大的一两个点稍偏是正常的`],
['q',r`重现水平函数 rlevel 是怎么来的？`,r`r 年一遇：每年超过的概率 $1/r$，即 $G(z_r)=1-1/r$。令 $y_r=-\ln(1-1/r)$，由 $t(z_r)=y_r$ 解出
$$z_r=\mu+\frac{\sigma}{\xi}\Big[y_r^{-\xi}-1\Big]$$
就是 MATLAB 里的 ‹mu + (sigma/xi)*((-log(1-(1/r)))^(-xi)-1)›。ξ = 0 时要换成 $\mu-\sigma\ln y_r$（这个函数会除以 0）`],
['q',r`Wassaw 海浪的 10 年、100 年、500 年一遇各是多少？`,r`约 **11.33**、**13.46**、**14.64** ft。
- 10 年一遇和数个数的 11.8 ft 接近
- 500 年一遇的 95% 置信区间约 11.6 到 17.7 ft：外推越远越不确定`],
['q',r`Tutorial 6：Boston 1936–1985 年最大风速拟合出什么参数？150 年一遇是多少？`,r`ξ ≈ **0.046**（接近 0，近似 Gumbel），μ ≈ **51.70** mph，σ ≈ **6.89** mph。
150 年一遇：$y=-\ln(1-1/150)=0.006689$，$z=51.70+\frac{6.89}{0.046}(0.006689^{-0.046}-1)\approx$ **90.5 mph**`],
['q',r`Tutorial 6：100 mph 对应多少年一遇？`,r`先算每年超过的概率：$p=1-G(100)=1-\exp\big\{-\big(1+\xi\frac{100-\mu}{\sigma}\big)^{-1/\xi}\big\}\approx0.00228$
重现期 $T=1/p\approx$ **439 年**。MATLAB：‹T = 1/(1 - cdf(pd, 100))›`],
['q',r`为什么讲座最后要看参数的协方差？举 Boston 的例子`,r`50 个数据估出来的 ξ 很不准（标准误约 0.11）。ξ 只差一个标准误：
- ξ = 0.157 → 100 mph 约 120 年一遇
- ξ = 0.046 → 约 439 年
- ξ = −0.066 → 约 5400 年
三组参数的对数似然几乎一样。外推到数据范围（50 年）以外时，必须同时报告不确定性`],
['q',r`重现期 r 和 Week 5 的 T 是什么关系？「100 年一遇」是什么意思？`,r`是同一个东西：每年最大值超过 $z_r$ 的概率是 $1/r$，平均每 r 年超过一次。不是每 r 年一定来一次：r 年里至少来一次的概率 $1-(1-1/r)^r\approx63\%$`],
['err',r`这一讲最容易错在哪？`,r`- MATLAB 的形状参数 ‹k› 就是 ξ，符号约定相同；Python scipy 的 c 是 −ξ，别混
- QQ 图的横轴是模型分位数、纵轴是数据（‹qqplot(data, pd)›）
- 求「多少年一遇」要先算**每年超过的概率** $1-G(z)$，再取倒数；不要用 $G(z)$ 取倒数
- rlevel 里 ξ = 0 会除以 0，Gumbel 情况要单独用 $\mu-\sigma\ln y_r$
- 数据只有 50 年，外推到 150 年、439 年都是模型说的，不确定性很大`],
['fix',r`PDF Tails 2 的材料有哪些要注意的地方？`,r`- 没有 PDF 讲义：只有讲座视频（12:27）和 MATLAB 文件，课件页叫 Session 6A
- MATLAB 文件注释「quantil plot」应为 quantile；‹pd.ParameterCovariance;› 结尾有分号，不会显示任何东西，要去掉分号
- Tutorial 6 题目「assoicated」应为 associated
- 官方 Solution6.m 在 Canvas 上锁到 11 月 6 日 12:00`],
]);

D('MB','MB1','拉普拉斯变换 1','3eb202737d7a818c815af26ec67a07b3',[
['q',r`写出拉普拉斯变换的定义和七个必背变换。`,r`$\bar y(s)=\int_0^\infty e^{-st}y(t)\,dt$
$a\to a/s$，$t^n\to n!/s^{n+1}$，$e^{at}\to1/(s-a)$，$\sin kt\to k/(s^2+k^2)$，$\cos kt\to s/(s^2+k^2)$，$\sinh kt\to k/(s^2-k^2)$，$\cosh kt\to s/(s^2-k^2)$`],
['q',r`第一平移定理是什么？逆向怎么用？`,r`$\mathcal L\{e^{-at}y(t)\}=\bar y(s+a)$。分母里看到 $(s+a)$：先当它不存在求逆变换，再乘 $e^{-at}$。注意 $e^{+2t}$ 对应 $s\to s-2$。`],
['q',r`求 $\mathcal L^{-1}\left\{\frac{s+1}{s^2+2s+5}\right\}$。`,r`配方 $(s+1)^2+2^2$ → $e^{-t}\cos2t$。`],
['q',r`什么时候配方、什么时候部分分式？遮盖法什么时候不能直接用？`,r`分母二次式不能分解（判别式 < 0）→ 配方；能分解 → 部分分式。遮盖法只直接给出**不重复一次因子**的系数，重根或不可约二次因子要另外比较系数。`],
['q',r`$\mathcal L\{t\,f(t)\}$ 和 $\mathcal L\{f(t)/t\}$ 对应 s 域什么操作？`,r`$t\,f(t)\leftrightarrow-\dfrac{dF}{ds}$；$f(t)/t\leftrightarrow\displaystyle\int_s^\infty F(\sigma)\,d\sigma$。`],
['err',r`$\mathcal L\{f\cdot g\}$ 能写成 $\mathcal L\{f\}\mathcal L\{g\}$ 吗？遇到乘积怎么办？`,r`不能。含 $e^{-at}$ → 第一平移；含 t → s 域求导；$\sin^2$、$\cosh\cdot\cos$ → 先用恒等式或指数形式展开。`],
]);

D('MB','MB2','拉普拉斯变换 2：ODE、阶跃、冲激','3eb202737d7a81fab876d3e558c694ff',[
['q',r`写出 $\mathcal L\{y'\}$、$\mathcal L\{y''\}$，初值项从哪来？`,r`$s\bar y-y(0)$；$s^2\bar y-sy(0)-y'(0)$。来自分部积分的边界项；高阶就是反复套用一阶公式。`],
['q',r`s 域分母为 $s+3$、$s^2+16$、$(s+1)^2+4$ 时，时域响应分别是什么样？`,r`- $e^{-3t}$：单调衰减
- $\sin4t$ / $\cos4t$：等幅振荡
- $e^{-t}\sin2t$：衰减振荡
根的实部管衰减，虚部管振荡频率。`],
['q',r`$\mathcal L\{H(t-a)\}$ 和 $\mathcal L\{\delta(t-a)\}$ 各是什么？怎么推出来？`,r`$e^{-as}/s$：$\int_a^\infty e^{-st}dt$。$e^{-as}$：采样性质 $\int f\delta(t-a)=f(a)$，取 $f=e^{-st}$。`],
['q',r`第二平移定理是什么？看到 $e^{-as}$ 怎么做逆变换？`,r`$\mathcal L\{H(t-a)y(t-a)\}=e^{-as}\bar y(s)$。拿开 $e^{-as}$ → 正常求 $f(t)$ → 把所有 t 换成 t − a → 乘 $H(t-a)$。`],
['q',r`为什么 $\mathcal L\{H(t-2)\,t\}\ne e^{-2s}/s^2$？正确结果？`,r`H 后面必须是 $y(t-2)$。改写 $t=(t-2)+2$ → $e^{-2s}\left(\frac{1}{s^2}+\frac2s\right)$。`],
['q',r`解 $\ddot y+3\dot y+2y=\delta(t-1)$，零初值。`,r`$\bar y=\dfrac{e^{-s}}{(s+1)(s+2)}$ → $H(t-1)\left(e^{-(t-1)}-e^{-2(t-1)}\right)$。`],
['err',r`第二平移定理的常见错误？`,r`- 逆变换后只换了一部分 t（指数里的也要换：$e^{-2(t-5)}$）
- 和第一平移混用（$e^{-at}$ 在时域 → 平移 s；$e^{-as}$ 在 s 域 → 延迟）
- $\mathcal L\{\delta\}$ 多写了 $1/s$`],
['q',r`课上例 11：$y'+6y=3u(t-3)$，$y(0)=3$ 怎么解？结果由哪两部分组成？`,r`$s\bar y-3+6\bar y=\frac{3e^{-3s}}{s}$ → $\bar y=\frac{3}{s+6}+\frac12e^{-3s}\left(\frac1s-\frac{1}{s+6}\right)$ → $y=3e^{-6t}+\frac12u(t-3)\left[1-e^{-6(t-3)}\right]$。初值响应按 $e^{-6t}$ 衰减 + t = 3 打开的阶跃响应升到 0.5。另：$\frac{e^{-as}}{s^2}$ 只带来折点（连续），$\frac{e^{-as}}{s}$ 才带来跳变`],
]);

D('MB','MB3','拉普拉斯变换 3：卷积与传递函数','3eb202737d7a81169b2cefedc632e78f',[
['q',r`第一积分定理是什么？为什么没有初值项？`,r`$\mathcal L\left\{\int_0^ty\,dx\right\}=\bar y/s$。$\int_0^0=0$，起点已确定。`],
['q',r`卷积的定义和卷积定理？用「吃药」怎么理解？`,r`$f*g=\int_0^tf(u)g(t-u)\,du$；$\mathcal L\{f*g\}=FG$。u 时刻吃的药 f(u)，到 t 时剩 $f(u)g(t-u)$，全部加起来。`],
['q',r`用卷积求 $\mathcal L^{-1}\left\{\frac{1}{s(s+2)}\right\}$。`,r`$1*e^{-2t}=\int_0^te^{-2u}du=\dfrac{1-e^{-2t}}{2}$。`],
['q',r`解 $x'+2\int_0^tx\,dt=1$，$x(0)=0$。`,r`$s\bar x+\frac{2\bar x}{s}=\frac1s$ → 乘 s：$\bar x=\dfrac{1}{s^2+2}$ → $x=\dfrac{1}{\sqrt2}\sin\sqrt2t$。`],
['q',r`推导负反馈总传递函数。为什么求传递函数时初值取 0？`,r`$E=U-G_2Y$，$Y=G_1E$ → $G=\dfrac{G_1}{1+G_1G_2}$。传递函数只描述系统；用偏差变量时初值按定义为 0。`],
['q',r`传递函数和冲激响应是什么关系？`,r`冲激输入 $U=1$ → $Y=G$，所以冲激响应 $=\mathcal L^{-1}\{G(s)\}$（RC：$\frac{1}{RC}e^{-t/RC}$）。`],
['err',r`卷积与传递函数这一周最大的坑？`,r`- $\mathcal L^{-1}\{FG\}$ 是 $f*g$，**不是** $f\cdot g$
- 反馈分母符号和求和点相反（负反馈 ↔ $1+G_1G_2$）
- $\frac{1}{3s-1}$ 要先提出 $\frac13$
- 求 G 时不要先代入具体输入`],
['fix',r`讲义第 34 页 y(1) 的计算有什么错？`,r`写成 $\frac12(1.26+4.08+4.43)$，中间应为减号：$\frac12(1.26-4.08+4.43)=0.806$。`],
['q',r`课上例 3：$f=2t^2+\int_0^tf(t-\tau)e^{-\tau}d\tau$ 怎么解？`,r`积分是卷积 $f*e^{-t}$：$\bar f=\frac{4}{s^3}+\frac{\bar f}{s+1}$ → $\bar f\cdot\frac{s}{s+1}=\frac{4}{s^3}$ → $\bar f=\frac{4}{s^3}+\frac{4}{s^4}$ → $f=2t^2+\frac23t^3$。卷积定理不在考试表里，要背`],
]);
D('MB','MB4','傅里叶级数 1','3eb202737d7a81849207d1de04fcf8e9',[
['q',r`写出周期 2π 的傅里叶级数和三个系数公式。`,r`$f(x)=\dfrac{a_0}{2}+\sum_{n=1}^\infty(a_n\cos nx+b_n\sin nx)$
$a_n=\dfrac1\pi\int_{-\pi}^{\pi}f\cos nx\,dx$（n = 0 也适用），$b_n=\dfrac1\pi\int_{-\pi}^{\pi}f\sin nx\,dx$`],
['q',r`三个正交性积分？`,r`$\int_{-\pi}^{\pi}\sin nx\sin mx\,dx$、$\int\cos nx\cos mx\,dx$：$n=m$ 时为 π，$n\ne m$ 时为 0；$\int\sin nx\cos mx\,dx=0$（任何 n、m）。`],
['q',r`为什么常数项写成 $a_0/2$？它代表什么？`,r`$a_0/2$ = 一个周期上的**平均高度**。
- 求 $a_n$ 时右边剩 $a_n\int\cos^2nx\,dx$，$\cos^2nx$ 平均高度 ½，面积 π，所以公式除以 π
- n = 0 时乘的是 $1\times1$，平均高度 1，面积 2π；同一个公式却仍只除以 π → $a_0$ 是平均值的 **2 倍**
- 例：f = 3，$a_0=\frac1\pi\int3\,dx=6$，常数项应为 $a_0/2=3$`],
['q',r`$\sin kx$ 的周期？$\sin2x+\cos3x$ 的周期？$|\sin x|$ 呢？`,r`$\sin kx$：$2\pi/k$（kx 走完一圈）。相加取各周期的最小公倍数：π 和 2π/3 → **2π**。$|\sin x|$、$\sin^2x$：**π**（取绝对值 / 平方让周期减半）。`],
['q',r`$m\ddot x+kx=f(t)$，f 是周期驱动力。怎么用傅里叶级数求响应？为什么要关心高次谐波？`,r`方程线性 → 把 f 拆成 $\sum b_n\sin n\omega t$，每项单独求 $A_n=\dfrac{b_n}{k-mn^2\omega^2}$，再相加（叠加原理）。某个 $n\omega$ 接近固有频率 $\sqrt{k/m}$ 时分母≈0，这个谐波被放大（共振），即使它在驱动力里很小。`],
['q',r`讲义方波（$|x|\le\pi/2$ 时为 4，否则 0）的傅里叶级数？`,r`$2+\dfrac8\pi\left(\cos x-\frac13\cos3x+\frac15\cos5x-\cdots\right)$：$a_n=\dfrac{8}{n\pi}\sin\dfrac{n\pi}{2}$，$b_n=0$。偶函数 → 只有 cos；只有奇次谐波。`],
['q',r`傅里叶级数在函数跳变点取什么值？`,r`跳变两侧的平均值。Tutorial Q2 在 x = 4：$(4+(-2))/2=1$。`],
['q',r`偶函数、奇函数的傅里叶级数各有什么特点？`,r`偶 $f(x)=f(-x)$：只有 cos（$b_n=0$）。奇 $f(x)=-f(-x)$：只有 sin（$a_n=0$，包括 $a_0$）。方波平移 π/2 就从「只有 cos」变成「平均值 + 只有 sin」。`],
['q',r`$f(x)=2x$，$0\le x<2\pi$ 的傅里叶级数？`,r`$a_0/2=2\pi$，$a_n=0$，$b_n=-4/n$：$f=2\pi-4\left(\sin x+\frac12\sin2x+\frac13\sin3x+\cdots\right)$。`],
['err',r`算傅里叶系数最常见的错误？`,r`- 分段函数只积了一段，或上下限写错（必须积**一整个周期**）
- $\sin n\pi=0$、$\cos n\pi=(-1)^n$、$\sin(n\pi/2)$ 循环 1, 0, −1, 0 记错
- 忘了常数项是 $a_0/2$
- $\cos x\cos nx$ 这类题 n = 1 要单独算（分母 $n-1=0$）`],
['fix',r`Tutorial Q8 的官方答案哪里错了？`,r`奇次项系数应为 $a_3=-\frac1\pi$、$a_5=+\frac{1}{3\pi}$、$a_7=-\frac{1}{3\pi}$、$a_9=+\frac{1}{5\pi}$…，答案页写成 $-\frac1\pi(\cos3x-\frac12\cos5x+\frac13\cos7x-\frac14\cos9x)$。偶次项和 $a_0$、$a_1$ 正确。后来补发的逐题完整解答（Q8 Solution）算出的数值和这个一致。`],
['q',r`求傅里叶级数的六步？`,r`1. 画一个周期，写出各段
2. 看对称：偶只算 $a_n$，奇只算 $b_n$（减去平均值后也算）
3. 选分段最少的 2π 区间，值为 0 的段跳过
4. $a_0$（$a_0/2$ = 平均值，用图检查）
5. $a_n$、$b_n$：DI 表；代 $\cos n\pi=(-1)^n$；分母有 $n-1$ 就单独算 n = 1
6. 检查：跳变点取中点`],
['q',r`用 DI 表求 $\int x^2\cos nx\,dx$。`,r`D：$x^2,\ 2x,\ 2,\ 0$；I：$\cos nx,\ \frac{\sin nx}{n},\ -\frac{\cos nx}{n^2},\ -\frac{\sin nx}{n^3}$；D 每项乘 I 的下一行，符号 + − +：
$\dfrac{x^2\sin nx}{n}+\dfrac{2x\cos nx}{n^2}-\dfrac{2\sin nx}{n^3}$`],
['q',r`为什么级数在跳变点取两侧的平均？吉布斯现象是什么？`,r`部分和 = 把 x 附近的 f 做**左右对称**的加权平均，跳变点两侧各占一半 → 中点。权重像 sinc 有负瓣，台阶边上冲过头约为跳变高度的 9%；N 增大只变窄、不变矮。`],
['q',r`为什么方波系数按 $1/n$ 衰减，而 $|\sin x|$ 按 $1/n^2$？`,r`函数越光滑，高频成分越少。方波有跳变 → $\frac{8}{n\pi}$；$|\sin x|$ 连续、只有尖角 → $\frac{4}{\pi(n^2-1)}$，用 3 个谐波就几乎重合。`],
['q',r`全波整流 $V_p|\sin\omega t|$ 的直流分量和最低纹波频率？`,r`直流 $\frac{2}{\pi}V_p\approx0.64V_p$（DC 表读数）；最低交流成分在 $2\omega$（50 Hz 电网 → 100 Hz），幅度 $\frac{4}{3\pi}V_p\approx0.42V_p$。`],
]);
D('MB','MB5','傅里叶级数 2：任意周期与奇偶对称','3eb202737d7a811c9b11d75f76c08d4c',[
['q',r`周期为 2L 的函数，傅里叶级数和系数公式是什么？`,r`$f=\frac{a_0}{2}+\sum\big[a_n\cos\frac{n\pi x}{L}+b_n\sin\frac{n\pi x}{L}\big]$，$a_n=\frac1L\int_C^{C+2L}f\cos\frac{n\pi x}{L}dx$，$b_n=\frac1L\int_C^{C+2L}f\sin\frac{n\pi x}{L}dx$。L = π 时就是 Week 4 的公式。`],
['q',r`周期 2L 的公式是怎么推出来的？`,r`换变量 $x'=\pi x/L$：x 走一个周期 2L 时 x′ 正好走 2π。在 x′ 里套 2π 的公式，再把 $dx'=\frac\pi L dx$ 代回去，$\frac1\pi\cdot\frac\pi L=\frac1L$。`],
['q',r`周期 2L 时第 n 次谐波的角频率和频率？`,r`$\omega_n=\frac{n\pi}{L}$（rad/s），$f_n=\frac{n}{2L}$（Hz）。基波 $\omega_0=\pi/L=2\pi/T$，T = 2L。`],
['q',r`奇函数、偶函数的定义？各只剩哪些项？`,r`偶：$f(-x)=f(x)$（关于 y 轴对称）→ 只有 cos 和 $a_0$，$b_n=0$。奇：$f(-x)=-f(x)$（关于原点对称）→ 只有 sin，$a_0=a_n=0$。`],
['q',r`为什么偶函数的 $b_n=0$？`,r`$f(x)\sin nx$ 是偶 × 奇 = 奇，在对称区间 $[-\pi,\pi]$ 上积分正负抵消为 0。同理奇函数 × cos = 奇，所以 $a_n=0$。`],
['q',r`偶函数的 $a_n$ 为什么可以写成 $\frac2\pi\int_0^\pi$？`,r`$f\cos nx$ 是偶 × 偶 = 偶，左右两半面积相等，只积右半边再乘 2。奇函数的 $b_n=\frac2\pi\int_0^\pi f\sin nx\,dx$ 同理（奇 × 奇 = 偶）。`],
['q',r`既不奇也不偶的函数怎么办？`,r`① 先看减去平均值 $a_0/2$ 后是不是奇函数（如 3 / −5 的方波、x/2 锯齿），是就只有 sin；② 一般情况拆成偶部分 $\frac{f(x)+f(-x)}2$（给 cos）+ 奇部分 $\frac{f(x)-f(-x)}2$（给 sin）。`],
['q',r`什么时候只有奇次谐波？什么时候只有偶次？`,r`去掉平均值后 $f(x+\pi)=-f(x)$（平移半个周期上下翻转）→ 只有奇次；$f(x+\pi)=f(x)$（实际周期是一半）→ 只有偶次。原因：平移半个周期，第 n 次谐波乘 $(-1)^n$。`],
['q',r`傅里叶级数在跳变点等于什么？Dirichlet 条件是什么？`,r`等于两侧极限的平均 $\frac12[f(x_1^-)+f(x_1^+)]$。条件：周期、单值、只有有限个有限跳变、一个周期内有限个极值、一个周期上的积分收敛。`],
['q',r`线谱怎么画？$a_n\cos+b_n\sin$ 怎样合成一项？`,r`$a_n\cos\omega x+b_n\sin\omega x=R_n\cos(\omega x-\alpha_n)$，$R_n=\sqrt{a_n^2+b_n^2}$，$\tan\alpha_n=b_n/a_n$（按 $a_n$、$b_n$ 的正负判断象限）。在 $\omega_n=n\pi/L$ 处画高 $R_n$ 的竖线。`],
['q',r`Tutorial 2 Q1：$t^2$（0 ≤ t < 2，周期 2）的级数？`,r`L = 1：$a_0/2=4/3$，$a_n=\frac{4}{n^2\pi^2}$，$b_n=-\frac{4}{n\pi}$。$F=\frac43+\frac4{\pi^2}\sum\frac{\cos n\pi t}{n^2}-\frac4\pi\sum\frac{\sin n\pi t}{n}$；$R_1\approx1.34$、$R_2\approx0.64$。`],
['q',r`Tutorial 2 Q3：3（−2…0）、−5（0…2），周期 4？`,r`平均 −1；减掉后是 ±4 的奇方波，且半波反对称 → 只有奇次 sin：$F=-1-\frac{16}{\pi}\big(\sin\frac{\pi t}2+\frac13\sin\frac{3\pi t}2+\cdots\big)$。`],
['err',r`这一讲最常错的地方？`,r`- 周期 2L 时角度是 $n\pi x/L$，系数前面是 $1/L$，别还写 $1/\pi$
- 判断奇偶要看整个周期延拓后的图，不是只看定义的那一段
- 「只有奇次谐波」的判据要先减去平均值
- $\tan\alpha=b/a$ 求相位时注意象限（$a_n<0$ 时要加 180°）`],
['fix',r`Fourier 2 课件有哪些地方要改？`,r`第 57 页「Try this」的答案 sin 部分符号与第 55 页的图相反（图是 −x / 0，答案是 0 / x 的）；第 20、34 页奇方波级数末尾「− …」应为「+ …」；第 36 页标题「sawtooth (triangle)」实为锯齿波；课上例题扫描件页眉写 Week 9。`],
]);

D('MB','MB6','傅里叶变换','3eb202737d7a812cbd7fd41f10bd32db',[
['q',r`写出本课用的傅里叶变换和逆变换（讲义第 39 页）。ω 是什么？`,r`$$F(\omega)=\frac{1}{\sqrt{2\pi}}\int_{-\infty}^{\infty}f(t)e^{-j\omega t}dt,\qquad f(t)=\frac{1}{\sqrt{2\pi}}\int_{-\infty}^{\infty}F(\omega)e^{j\omega t}d\omega$$
ω 是角频率（rad/s，空间问题里是空间频率）。两边都放 $1/\sqrt{2\pi}$ 是 Kreyszig 的对称写法；别的书（通信课）可能用 $2\pi f$ 或把 $1/2\pi$ 全放在逆变换里`],
['q',r`傅里叶级数和傅里叶变换是什么关系？为什么周期变成无穷大以后求和变成积分？`,r`- 周期 2L 的函数只含 $\omega_n=n\pi/L$ 这些离散频率（线谱），间隔 $\pi/L$
- L → ∞：间隔 → 0，线越来越密，连成连续的 F(ω)；求和 $\sum\cdot\delta\omega$ 变成积分 $\int d\omega$
- 精确关系：$c_n=\frac{\sqrt{2\pi}}{2L}F(n\pi/L)$，复系数就是 F 在谐波处的取样`],
['q',r`复数形式的傅里叶级数是什么？cₙ 和 aₙ、bₙ 什么关系？（不考，但要看懂）`,r`$$f(x)=\sum_{n=-\infty}^{\infty}c_ne^{jn\pi x/L},\qquad c_n=\frac{1}{2L}\int_{-L}^{L}f(x)e^{-jn\pi x/L}dx$$
n ≥ 1 时 $c_n=\frac{a_n-jb_n}{2}$，$c_{-n}=c_n^*$，$c_0=\frac{a_0}{2}$。来源：$\cos x=\frac{e^{jx}+e^{-jx}}{2}$、$\sin x=\frac{e^{jx}-e^{-jx}}{2j}$ 代进实数形式`],
['q',r`讲义例题：$f(t)=\sqrt{2\pi}H(t)e^{-t}$ 的 F(ω)、模和相位？`,r`$F(\omega)=\int_0^\infty e^{-t(1+j\omega)}dt=\frac{1}{1+j\omega}=\frac{1}{1+\omega^2}-j\frac{\omega}{1+\omega^2}$
- $|F|=1/\sqrt{1+\omega^2}$（ω = 0 时 1，ω = 10 时约 0.1）
- $\theta=\arctan(-\omega)$
- 前面的 $\sqrt{2\pi}$ 正好和定义里的 $1/\sqrt{2\pi}$ 约掉`],
['q',r`宽为 a、高为 1 的矩形脉冲（中心在 0）的傅里叶变换？`,r`$$F(\omega)=\frac{1}{\sqrt{2\pi}}\int_{-a/2}^{a/2}e^{-j\omega t}dt=\frac{2}{\sqrt{2\pi}}\frac{\sin(\omega a/2)}{\omega}=\frac{a}{\sqrt{2\pi}}\,\mathrm{sinc}\Big(\frac{\omega a}{2}\Big)$$
sinc x = sin x / x。偶函数 → 实数；F(0) = 面积/√2π = a/√2π；第一个零点在 ω = 2π/a：脉冲越窄，频谱越宽`],
['q',r`把矩形脉冲移到 0 ≤ t ≤ a（课上例 3），变换有什么变化？`,r`$F(\omega)=\frac{a}{\sqrt{2\pi}}\mathrm{sinc}\big(\frac{\omega a}{2}\big)e^{-j\omega a/2}$：模完全不变，只多了相位 $-\omega a/2$。时间上平移 $t_0$ → 乘 $e^{-j\omega t_0}$（线性相位）`],
['q',r`课上例 2：$f(t)=\sqrt{2\pi}\,\delta(t-2)e^{-t}$ 的变换？`,r`用 δ 的取样性质 $\int\delta(t-a)g(t)dt=g(a)$：$F(\omega)=e^{-2(1+j\omega)}=e^{-2}e^{-2j\omega}$。模 $e^{-2}$ 对所有 ω 都一样（冲激含所有频率，强度相同），相位 $-2\omega$`],
['q',r`Tutorial 3 四题的答案？`,r`- Q1 $e^{-at}H(t)$：$\frac{1}{\sqrt{2\pi}(a+j\omega)}$，$|F|=\frac{1}{\sqrt{2\pi}\sqrt{a^2+\omega^2}}$
- Q2 1 / −1（$H(t+1)-2H(t)+H(t-1)$）：$\frac{4j}{\sqrt{2\pi}\omega}\sin^2(\omega/2)$
- Q3 三角 $1-|t|$：$\frac{1}{\sqrt{2\pi}}\mathrm{sinc}^2(\omega/2)$
- Q4 $e^{-a|t|}$：$\frac{2a}{\sqrt{2\pi}(a^2+\omega^2)}$`],
['q',r`为什么偶函数的变换是实数、奇函数的是纯虚数？`,r`$e^{-j\omega t}=\cos\omega t-j\sin\omega t$。偶函数乘 sin 是奇函数，积分为 0，只剩 cos 部分（实数）；奇函数乘 cos 积分为 0，只剩 $-j\int f\sin\omega t\,dt$（纯虚数）。例：Q3、Q4 是实数，Q2 是纯虚数，而且 F(0) = 0`],
['q',r`F(ω) 是复数，怎么画「幅度谱」？负频率有什么意义？`,r`写成极坐标 $F=|F|e^{j\theta}$，$|F|=\sqrt{\mathrm{Re}^2+\mathrm{Im}^2}$，$\tan\theta=\mathrm{Im}/\mathrm{Re}$，画 |F| 对 ω。实信号的 |F| 关于 ω = 0 对称：一个余弦 = 两个反向旋转的复指数 $e^{\pm j\omega t}$ 之和，负频率是这对里的另一半，不是「负的频率」`],
['err',r`这一讲最容易错在哪？`,r`- 忘了前面的 $1/\sqrt{2\pi}$，或者把它和别的书的约定（$2\pi f$、$1/2\pi$）混用
- $\int_0^\infty e^{-(a+j\omega)t}dt=\frac{1}{a+j\omega}$：上限代入是 0，下限代入要减，符号别丢
- 求模时分母 $a+j\omega$ 的模是 $\sqrt{a^2+\omega^2}$，不是 $a+\omega$
- sinc x 指 sin x / x（本课），numpy 的 sinc 是 sin(πx)/(πx)
- 相位不能只写 arctan：要看实部的符号确定象限`],
['fix',r`Fourier 3 讲义和答案有哪些要注意的地方？`,r`- 讲义第 45 页标题「Answer 4」应为「Answer (c)」
- 第 13 页把求和直接写成带 dx 的积分，只是示意，严格推导在第 35–38 页（不要求会证明）
- 课上手写例题标着「Week 10」，是往年的周次；例 4 第一行积分下限写成 ∞，应为 −∞
- Tutorial 答案 Q1 的题干写「magnitude … is F(ω) = 1/(√2π(a+jω))」：那是 F 本身，模是 $1/(\sqrt{2\pi}\sqrt{a^2+\omega^2})$
- 复数形式的傅里叶级数讲义注明不考`],
]);

D('MB','MB7','向量微积分 1：偏导数、梯度与方向导数','3eb202737d7a81a9aa1fc818e9350160',[
['q',r`什么是偏导数？$\partial f/\partial x$ 和 $df/dx$ 有什么区别？`,r`多元函数只对一个变量求导，其他变量当常数。几何上：固定 y 把曲面切一刀，得到一条曲线，$\partial f/\partial x$ 就是这条曲线的切线斜率。记号用 ∂ 提醒「还有别的变量被固定住了」。例：$f=x^2+y^3$，$f_x=2x$，$f_y=3y^2$`],
['q',r`二阶偏导有几个？混合偏导 $f_{xy}$ 和 $f_{yx}$ 什么关系？`,r`四个：$f_{xx},f_{yy},f_{xy},f_{yx}$。对课程里的光滑函数 $f_{xy}=f_{yx}$（先对谁求导结果一样），课上例 1、例 4 和 Tutorial Q1 都验证了。可以用它检查计算`],
['q',r`小增量公式是什么？为什么成立？`,r`$$\delta f\approx\frac{\partial f}{\partial x}\delta x+\frac{\partial f}{\partial y}\delta y+\frac{\partial f}{\partial z}\delta z$$
每个变量单独变一点，带来的变化 ≈ 斜率 × 变化量，再加起来。忽略了 $\delta x\,\delta y$ 这类二阶小量（圆柱 $\delta V=2\pi rh\,\delta r+\pi r^2\delta h$，角上的小块被忽略）`],
['q',r`圆柱 $V=\pi r^2h$，r 误差 1%、h 误差 3%，V 的最大误差？`,r`$\frac{\delta V}{V}=2\frac{\delta r}{r}+\frac{\delta h}{h}=2(1\%)+3\%=5\%$。求「最大」误差时各项取同号相加（讲义第 26 页）。幂函数 $x^ay^b/z^c$ 的百分比误差就是 $a\%_x+b\%_y-c\%_z$`],
['q',r`变化率问题（rate of change）怎么做？`,r`总微分除以 dt：$\frac{df}{dt}=\frac{\partial f}{\partial x}\frac{dx}{dt}+\frac{\partial f}{\partial y}\frac{dy}{dt}+\cdots$。例：斜边 $c=\sqrt{a^2+b^2}$，a = 20 以 4 cm/s 增加、b = 30 以 3 cm/s 增加：$\frac{dc}{dt}=\frac{20\cdot4+30\cdot3}{\sqrt{1300}}=4.71$ cm/s。减小的量代负的速率`],
['q',r`怎样找曲面的驻点并判断类型？`,r`① 解 $f_x=0,\ f_y=0$；② 在驻点算 $D=f_{xx}f_{yy}-f_{xy}^2$；③ $D>0,f_{xx}>0$ 极小；$D>0,f_{xx}<0$ 极大；$D<0$ 鞍点。例 Tutorial Q4：驻点 (−1, 1)，$D=36-4=32$，$f_{xx}=6$ → 极小`],
['err',r`$f_{xx}$、$f_{yy}$ 都是正的，一定是极小吗？`,r`不一定。$f=x^2+3xy+y^2$：$f_{xx}=f_{yy}=2$，但 $f_{xy}=3$，$D=4-9<0$，是鞍点（讲义第 36 页：鞍点不需要两个二阶导异号）。一定要算 D`],
['q',r`Tutorial Q10 / 课上例 9：$z=2x^3-3xy+2y^3$ 的驻点？`,r`$6x^2=3y$、$6y^2=3x$ → $y=2x^2$，代入得 $x(8x^3-1)=0$ → (0, 0) 和 (½, ½)。(0, 0)：$D=0\cdot0-9<0$ 鞍点；(½, ½)：$D=6\cdot6-9=27>0$，$f_{xx}=6>0$ 极小。课上例 9 的 $3x^3-xy+3y^3$ 同理：(0, 0) 鞍点，(1/9, 1/9) 极小`],
['q',r`梯度 grad φ 是什么？方向和大小各代表什么？`,r`$\nabla\phi=\frac{\partial\phi}{\partial x}\mathbf i+\frac{\partial\phi}{\partial y}\mathbf j+\frac{\partial\phi}{\partial z}\mathbf k$，作用在标量场上，结果是向量。方向 = φ 增加最快的方向（垂直于等值面）；大小 = 最大变化率。∇ 不能直接作用在向量上（讲义第 47 页）`],
['q',r`方向导数怎么算？`,r`$$\frac{d\phi}{ds}=\hat a\cdot\nabla\phi,\qquad\hat a=\frac{\mathbf A}{|\mathbf A|}$$
三步：求 ∇φ 代入 P → A 除以 |A| → 点乘。讲义例：∇φ = (10, 325, 146)，A = (2, 1, −2)，|A| = 3 → 53/3 = 17.67`],
['err',r`方向导数最常见的错？`,r`- 忘了把 A 归一化（直接 A·∇φ）
- |A| 算错：Tutorial Q12 答案写 77/√5，应为 77/√50（|A| = √(16+9+25)），数值 10.89 是对的
- 先代点再求导（顺序反了）
- 最陡方向写成 A 而不是 ∇φ`],
['q',r`课上例 12：φ 在 P 处沿哪个方向变化最快？最大变化率？`,r`$\frac{d\phi}{ds}=|\hat a||\nabla\phi|\cos\theta$，θ = 0 时最大，所以方向就是 ∇φ 自己。例：∇φ(1, −1, −1) = (−4, −4, −5)，方向 $\frac{1}{\sqrt{57}}(-4,-4,-5)$，最大变化率 $|\nabla\phi|=\sqrt{57}\approx7.55$`],
]);

D('MA','MA7','度量与 k-means 聚类','3eb202737d7a813993c0d55f1b7f3b01',[
['q',r`度量（metric）要满足哪四条？`,r`① $d(x,y)\ge0$；② $d(x,y)=0$ 当且仅当 $x=y$；③ 对称 $d(x,y)=d(y,x)$；④ 三角不等式 $d(x,y)\le d(x,z)+d(z,y)$。度量也叫距离函数`],
['q',r`写出 $d_1$、$d_2$、$d_\infty$ 和一般的 $d_p$`,r`$$d_p(x,y)=\Big(\sum_n|x_n-y_n|^p\Big)^{1/p}$$
$d_1=\sum|x_n-y_n|$（城市街区），$d_2=\sqrt{\sum(x_n-y_n)^2}$（欧氏），$d_\infty=\max_n|x_n-y_n|$。讲义式 (8) 漏了绝对值，p 为奇数时会出问题`],
['q',r`Tutorial Q1(a)：$x=(1,4)$、$y=(-5,2)$ 的三种距离？`,r`差 (6, 2)：$d_1=8$，$d_2=\sqrt{40}=6.32$，$d_\infty=6$。总有 $d_\infty\le d_2\le d_1$`],
['q',r`平方欧氏距离有什么用？它是度量吗？`,r`去掉开方省计算，只比较「谁最近」时结果和 $d_2$ 一样（平方是单调的）。但它不满足三角不等式：一维 0、1、2，$d^2(0,2)=4>1+1$，所以严格说不是度量`],
['q',r`单位球是什么？$d_1$、$d_2$、$d_\infty$ 在二维、三维各是什么形状？`,r`$U_d=\{x:d(x,0)=1\}$。二维：$d_1$ 菱形、$d_2$ 圆、$d_\infty$ 正方形。三维：$d_1$ 是正八面体（6 个顶点在坐标轴 ±1 处，Tutorial Q2），$d_2$ 球面，$d_\infty$ 立方体表面`],
['q',r`Distortion 怎么定义？`,r`每个数据点到「最近」中心的距离，取平均：$\mathrm{Dist}(C,X)=\frac1N\sum_n d(x_n,c_{i(n)})$。衡量一组中心代表数据有多好，越小越好`],
['q',r`k-means 的步骤？`,r`① 给 K 个初始中心；② 每个点分给最近的中心；③ 每个中心挪到分给它的点的平均位置；④ 重复 ②③，直到中心不再变`],
['q',r`为什么中心取「平均」？`,r`对平方欧氏距离之和 $\sum_{x\in X(k)}|x-c_k|^2$ 求导令其为 0：$\sum(x-c_k)=0$ → $c_k=$ 平均。但 $X(k)$ 本身依赖 $c_k$，所以没有闭式解，只能迭代（讲义式 (16)–(17)）`],
['err',r`k-means 能保证全局最优吗？`,r`不能。只保证局部最优，结果取决于初值（Tutorial Q4 两问都答 No）。例：三团数据，两个中心挤在同一团里、第三个中心在另外两团中间，算法会停在这个坏解上。实际做法：换多组初值跑，取 distortion 最小的`],
['q',r`讲义例题：8 个点、$c_1^0=(-3,5)$、$c_2^0=(2,2)$，d₁ 度量，一次迭代后中心？`,r`$X^0(1)=\{x_3,x_4,x_7\}$，$X^0(2)=\{x_1,x_2,x_5,x_6,x_8\}$。$c_1^1=(-2.33,5.33)$，$c_2^1=(2.6,-2)$。再分配一次没有点换簇，已收敛`],
['q',r`Tutorial Q3：distortion 从 4.27 降到多少？新中心？`,r`$c_1^1=(-0.4,3.4,-1.2)$，$c_2^1=(3.33,1,2)$，$\mathrm{Dist}(C^1,X)=2.55$。用 d₁ 分配，这组数据的归属和 d₂ 完全一样，所以第 4 问的新中心也相同`],
['q',r`Tutorial Q5：K 怎么选？`,r`没有标准答案。distortion 随 K 增大总是下降（K = N 时为 0），不能直接取最小。常用：画 distortion–K 曲线找「拐点」（elbow），或按应用背景（有几种工作状态、几类信号）定 K`],
]);

D('MB','MB8','向量微积分 2：线积分与做功','3eb202737d7a816f81dac1d2edc7e040',[
['q',r`线积分和普通定积分有什么不同？`,r`普通定积分 $\int_a^b f(x)\,dx$ 沿 x 轴从 a 走到 b。线积分沿一条曲线 C 走，把每一小段的贡献加起来：$\int_C f\,ds$（ds 是沿曲线的小段长度）或 $\int_C\mathbf F\cdot d\mathbf r$（只算 F 沿切线的分量）。闭合曲线写 $\oint_C$，逆时针为正方向`],
['q',r`$\int_C(x^2\,dx+(x-y^2)\,dy)$ 沿 $y=1+2x$ 从 (0, 1) 到 (1, 3) 怎么算？`,r`曲线是 y = g(x) 的形式时用代入法：$y=1+2x$，$dy=2\,dx$，全部换成 x，上下限用 x 的范围 0 → 1。$\int_0^1[x^2+(x-(1+2x)^2)\cdot2]\,dx=\int_0^1(-7x^2-6x-2)\,dx=-\frac{22}{3}$（讲义例 2）`],
['q',r`对弧长的线积分 $\int_C f\,ds$ 怎么化成对 x 的积分？$y=1+2x$ 从 x = 0 到 1 的长度是多少？`,r`$$ds=\sqrt{1+\left(\frac{dy}{dx}\right)^2}\,dx$$
（勾股定理：小段的水平长 dx、竖直长 dy）。$\frac{dy}{dx}=2$，长度 $=\int_0^1\sqrt5\,dx=\sqrt5$（讲义例 3）`],
['q',r`怎么参数化圆 $x^2+y^2=4$、螺旋线、直线？`,r`圆：$\mathbf r(t)=(2\cos t,2\sin t,0)$，$0\le t\le2\pi$，t 增加 = 逆时针。螺旋线：$(a\cos t,a\sin t,ct)$，c > 0 右手螺旋。过点 a、方向 b 的直线：$\mathbf r(t)=\mathbf a+t\mathbf b$；从 P 到 Q 的线段取 $\mathbf b=Q-P$、$0\le t\le1$`],
['q',r`参数化曲线上 $\mathbf F\cdot d\mathbf r$ 的线积分公式是什么？三种写法？`,r`$$W=\int_C\mathbf F(\mathbf r(t))\cdot\mathbf r'(t)\,dt=\int_a^b(F_1x'+F_2y'+F_3z')\,dt=\int_C(F_1dx+F_2dy+F_3dz)$$
步骤：① 写出 x(t)、y(t)、z(t)；② 把它们代进 F（F 只在曲线上取值）；③ 求 $\mathbf r'(t)$；④ 点乘、对 t 积分`],
['q',r`为什么做功是 $\int\mathbf F\cdot d\mathbf r$？`,r`恒力沿直线：$W=\mathbf F\cdot\mathbf d$（力在位移方向的分量 × 距离）。变力沿曲线：切成小段，每段近似恒力直线，$\Delta W_m\approx\mathbf F(\mathbf r(t_m))\cdot\mathbf r'(t_m)\Delta t_m$，加起来再令 $\Delta t\to0$，就是 $\int_a^b\mathbf F(\mathbf r(t))\cdot\mathbf r'(t)\,dt$（讲义第 36–38 页）`],
['q',r`讲义例 2：$\mathbf F=z\mathbf i-x\mathbf j+y\mathbf k$ 沿螺旋线 $(\cos t,\sin t,3t)$，$0\le t\le2\pi$ 的功？`,r`代入：$\mathbf F=(3t,-\cos t,\sin t)$，$\mathbf r'=(-\sin t,\cos t,3)$，点乘 $-3t\sin t-\cos^2t+3\sin t$。分部积分 $-3\int t\sin t=6\pi$，倍角公式 $\int\cos^2t=\pi$，$\int\sin t=0$。$W=6\pi-\pi=5\pi$。Tutorial Q8 把 −x 换成 +x，得 $7\pi$`],
['q',r`什么叫路径相关？讲义第 26 页的例子说明了什么？`,r`同样从 A(0, 0) 到 B(1, 1)，$\mathbf F=(0,xy,0)$：沿 $C_1:(t,t)$ 积分 $\int_0^1t^2dt=\frac13$，沿 $C_2:(t,t^2)$ 积分 $\int_0^12t^4dt=\frac25$。结果不同，所以一般的线积分和路径有关，必须说清走哪条路`],
['q',r`什么时候线积分和路径无关？为什么？`,r`当 $\mathbf F=\nabla f$（某个标量场的梯度，保守场）。证明：$F_1dx+F_2dy+F_3dz=f_xdx+f_ydy+f_zdz=df$，所以 $\int_C\mathbf F\cdot d\mathbf r=f(B)-f(A)$，只看起点、终点。等价说法：绕任意闭合曲线 $\oint\mathbf F\cdot d\mathbf r=0$。例：重力、静电场；摩擦力不保守`],
['q',r`怎么快速判断二维力场 $\mathbf F=P\mathbf i+Q\mathbf j$ 是否保守？课上例 1 能怎么秒算？`,r`（补充）检查 $\frac{\partial Q}{\partial x}=\frac{\partial P}{\partial y}$（区域无洞）。课上例 1：$P=4x+y$，$Q=x+3y$，$\frac{\partial Q}{\partial x}=1=\frac{\partial P}{\partial y}$ → 保守，$\phi=2x^2+xy+\frac32y^2$，$W=\phi(2,16)-\phi(1,7)=424-82.5=341.5$，和沿 $y=4+3x^2$ 硬算一样`],
['q',r`课上例 5：电子从 A(3, 12) 移到 C(1, 4)，沿 AC 和沿 A→B→C 的功为什么一样？`,r`点电荷的电场 $\mathbf E=\frac{Q}{4\pi\varepsilon_0}\frac{\mathbf r}{r^3}$ 是 $-\nabla V$（$V=10/r$），保守场。所以 $W=-q\int\mathbf E\cdot d\mathbf r=q[V(C)-V(A)]$ 只和起点终点在哪条等势线上有关：AC 是 $-2.587\times10^{-19}$ J，AB + BC $=-1.906-0.681=-2.587$（×10⁻¹⁹ J）`],
['err',r`易错：参数化以后忘了把 F 也换成 t`,r`F 只在曲线上取值。$\mathbf F=-y\mathbf i+xy\mathbf j$ 沿 $(\cos t,\sin t)$：要先写成 $\mathbf F=-\sin t\,\mathbf i+\cos t\sin t\,\mathbf j$，再和 $\mathbf r'=(-\sin t,\cos t)$ 点乘（课上例 3，$W=\frac\pi4+\frac13\approx1.119$ J）`],
['err',r`易错：分段路径、上下限和方向`,r`分段路径（Tutorial Q2）每段单独积分：y = 0 那段 dy = 0，x = 2 那段 dx = 0。上下限按「起点 → 终点」写，反着走（例 5 的 x 从 3 到 1）积分变号。$\int_C y\,dx$ 这类只含 dx 的积分，在竖直线段上为 0`],
['q',r`Tutorial 2 的 8 个答案是多少？`,r`Q1 265.33（$\frac{796}{3}$）；Q2 $44\frac13$；Q3 $4-\frac\pi2$；Q4 1；Q5 $-3\pi-3\approx-12.42$；Q6 $\frac{28}{3}$；Q7 $\frac75$；Q8 $7\pi\approx21.99$。全部用 SymPy 验算 ✓`],
['fix',r`本周资料里的笔误`,r`讲义第 43 页 $\mathbf r'=\frac{d\mathbf r}{dt}$ 后面漏了等号；课上例 5 写「$\frac{Q}{4\pi\varepsilon_0}$ = 10 C」，单位应为 V·m；$W_{AC}$ 中间一步 $3.88\times10^{-19}[-1+\frac13]$ 写成正的 $2.586\times10^{-19}$，漏了负号（最后结果 $-2.59\times10^{-19}$ J 对）`],
]);

D('MA','MA8','向量空间 2：向量空间、内积与范数','3eb202737d7a8103aad9d6b700342a6f',[
['q',r`向量空间由哪四样东西组成？什么叫线性运算？`,r`一组向量 V、一组标量 S（实数 ℝ 或复数 ℂ）、标量乘法规则、向量加法规则。只用到「标量乘」和「向量加」的运算叫线性运算（linear operations）。向量空间也叫线性空间，研究它的分支是线性代数，它是线性系统的数学基础`],
['q',r`向量空间的定义要满足哪些条件？`,r`封闭：$\lambda v\in\mathbb V$、$v+w\in\mathbb V$；$\lambda(v+w)=\lambda v+\lambda w$；有唯一的零向量 0 和唯一的负向量 −v；$u+v=v+u$；$(u+v)+w=u+(v+w)$；$(\lambda+\mu)v=\lambda v+\mu v$；$\lambda(\mu v)=(\lambda\mu)v$；$1v=v$。后面这些平时默认成立，真正要检查的是封闭性和零向量`],
['q',r`什么是封闭性？为什么单位圆盘 $\{\|v\|\le1\}$ 不是向量空间？`,r`封闭：对空间里的向量做标量乘、加法，结果必须还在这个集合里。单位圆盘里 $u_1=(1,0)$、$u_2=(0,1)$ 都在，但 $u_1+u_2=(1,1)$ 长度 $\sqrt2>1$，跑出去了，所以不是向量空间（讲义第 3 页）`],
['q',r`内积要满足哪四条？`,r`$\langle v,w\rangle=\overline{\langle w,v\rangle}$；$\langle\lambda v,w\rangle=\bar\lambda\langle v,w\rangle$、$\langle v,\lambda w\rangle=\lambda\langle v,w\rangle$；$\langle u+v,w\rangle=\langle u,w\rangle+\langle v,w\rangle$；$\langle u,u\rangle\ge0$（且只有 u = 0 时为 0）。实向量空间里共轭可以忽略`],
['q',r`复向量的点积为什么要取共轭？`,r`$v\cdot w=\bar v^Tw=\sum\bar v_nw_n$。不取共轭，长度就坏了：$v=(1,j)$ 时 $v^Tv=1+j^2=0$，非零向量「长度为 0」。取共轭后 $\bar v^Tv=\sum|v_n|^2=2$，是正实数，才能开方当长度`],
['q',r`讲义例：$v=(2+3j,1-2j)$，$w=(1+4j,-2+2j)$，$v\cdot w$ 和 $w\cdot v$ 是多少？`,r`$v\cdot w=(2-3j)(1+4j)+(1+2j)(-2+2j)=(14+5j)+(-6-2j)=8+3j$。$w\cdot v=8-3j$，正好是共轭：复内积交换顺序要取共轭，不是相等`],
['q',r`范数（norm）要满足什么？由内积怎样得到范数？`,r`$\|v\|\ge0$；$\|\lambda v\|=|\lambda|\|v\|$；$\|v+w\|\le\|v\|+\|w\|$（三角不等式）；$\|v\|=0\Rightarrow v=0$。任何内积都给出范数 $\|v\|=\sqrt{\langle v,v\rangle}$，实向量就是 $\sqrt{\sum v_n^2}$（欧氏长度）`],
['q',r`怎样把向量变成单位向量？$(3,4)$ 的单位向量是什么？`,r`除以自己的范数：$\hat v=\frac{v}{\|v\|}$。$\|(3,4)\|=5$，$\hat v=(0.6,0.8)$，长度为 1、方向不变。ℝ² 最常见的单位向量是 $e_1=(1,0)$、$e_2=(0,1)$`],
['q',r`两个实向量的夹角怎么算？为什么？`,r`$$\cos\theta=\frac{v\cdot w}{\|v\|\|w\|}$$
二维证明：$\cos\theta_v=v_1/\|v\|$、$\sin\theta_v=v_2/\|v\|$，w 同理；$\theta=\theta_v-\theta_w$，用差角公式 $\cos(\theta_v-\theta_w)=\cos\theta_v\cos\theta_w+\sin\theta_v\sin\theta_w$，代进去就是 $\frac{v_1w_1+v_2w_2}{\|v\|\|w\|}$`],
['q',r`和单位向量点乘有什么几何意义？`,r`i 是单位向量时，$v\cdot i=\|v\|\cos\theta$ = v 在 i 方向上的分量（投影长度，讲义图 2、式 (31)）。点积正：夹角小于 90°；为 0：垂直；为负：钝角`],
['q',r`什么是子空间？ℝ² 有哪些子空间？`,r`$\mathbb U\subset\mathbb V$ 且 $(\mathbb U,\mathbb S)$ 本身是向量空间，关键是封闭：$u_1+\lambda u_2\in\mathbb U$。ℝ² 里过原点的直线 $\{\lambda u\}$ 都是子空间；另外 {0} 和 ℝ² 本身也算（讲义说「所有子空间都是这种形式」漏了这两个）。不过原点的直线不是（没有零向量）`],
['q',r`Tutorial 8 Q1、Q2 的答案？`,r`Q1：$v\cdot w=\bar v^Tw=(-22-32j)+(-32+36j)+(34+18j)+(44-144j)=24-122j$。Q2：$\|v\|=\sqrt{|2+5j|^2+|-3-7j|^2+|10+2j|^2}=\sqrt{29+58+104}=\sqrt{191}\approx13.82$`],
['q',r`TF-IDF 权重什么时候大？Q3 的余弦相似度怎么算？`,r`$w_{t,d}=f_{t,d}\cdot\log\frac{N}{N_t}$：词在这篇里出现多（f 大）、在整个语料里出现少（IDF 大）时大。每篇文档变成 V 维向量，$\text{CosSim}=\frac{vec(d_1)\cdot vec(d_2)}{\|vec(d_1)\|\|vec(d_2)\|}$。d₁、d₂ 共享 cat、dog：$\frac{(\ln2)^2+(\ln\frac43)^2}{1.722\times1.576}=0.21$。log 的底数不影响结果`],
['err',r`易错：复内积的顺序和共轭`,r`本课约定 $v\cdot w=\bar v^Tw$：共轭的是第一个向量。$w\cdot v=\overline{v\cdot w}$，结果互为共轭。Q1 不取共轭会得到 $168-150j$（错）。范数一定是正实数：$|a+bj|^2=a^2+b^2$`],
['fix',r`讲义 Week 8 的笔误`,r`第 6 页两处「Equation (??)」是 LaTeX 引用断了：分别指式 (15)（三角不等式）和式 (20)（欧氏范数）；式 (20) 求和上限写成 n，应为 N；第 8 页 $u_1+\lambda_2u_2$ 多了下标 2，应为 $u_1+\lambda u_2$；第 3 页把 $u+v=v+u$ 叫 symmetry，通常叫交换律（commutativity）`],
]);

D('MB','MB9','向量微积分 3：二重积分与三重积分','3eb202737d7a8114b808d8beba236430',[
['q',r`二重积分 $\int_{y_1}^{y_2}\int_{x_1}^{x_2}f(x,y)\,dx\,dy$ 是怎么来的？`,r`把区域切成小块 $\delta a=\delta y\,\delta x$，先沿一个方向把小块加成一条，再把所有条加起来：$A=\sum\sum\delta y\,\delta x$。令 $\delta x,\delta y\to0$，求和变积分。f = 1 时得面积，一般 f 是「每单位面积上的量」（密度、y² 等）`],
['q',r`多重积分从哪一层开始算？`,r`从最里层开始，一层一层往外（讲义第 37 页）。算里层时外层变量当常数。最外层的上下限必须是常数；里层的上下限可以含外层的变量`],
['q',r`讲义例 4：$y=4x/5$、x 轴、x = 5 围成的面积，竖条和横条各怎么写？`,r`竖条（先 dy）：$\int_0^5\int_0^{4x/5}dy\,dx=\int_0^5\frac{4x}{5}dx=10$。横条（先 dx）：y 从 0 到 4，x 从 $\frac{5y}{4}$ 到 5：$\int_0^4\left(5-\frac{5y}{4}\right)dy=10$。次序不影响结果，「just get limits right」`],
['q',r`两条曲线围成的面积怎么设积分限？以 $y=x^2/9$ 和 $y=3\sqrt x$ 为例`,r`① 联立求交点：$\frac{x^2}{9}=3\sqrt x$ → $x^{3/2}=27$ → x = 0 或 9；② 画图看谁在上：$3\sqrt x$ 在上；③ $A=\int_0^9\int_{x^2/9}^{3\sqrt x}dy\,dx=\left[2x^{3/2}-\frac{x^3}{27}\right]_0^9=27$`],
['q',r`形心和二阶矩的公式？`,r`形心 $\bar x=\frac{\iint x\,dA}{A}$，$\bar y=\frac{\iint y\,dA}{A}$。二阶矩：$I_{xx}=\iint y^2\,dA$（绕 x 轴，用到 x 轴的距离 y），$I_{yy}=\iint x^2\,dA$，$I_{zz}=\iint(x^2+y^2)\,dA$（极惯性矩）`],
['q',r`为什么绕 x 轴的二阶矩 $I_{xx}$ 积的是 $y^2$？有什么用？`,r`绕 x 轴转（或弯曲）时，一小块面积到 x 轴的距离是 y，贡献按距离的平方算。离轴越远影响越大：2 × 6 的矩形竖放 $I=36$，平放只有 4。梁的抗弯刚度是 EI，所以工字钢把材料放在远离中性轴的地方`],
['q',r`极坐标下面积元是什么？为什么多一个 r？`,r`$dA=r\,dr\,d\theta$。小块的径向边长 dr，弧向边长是弧长 $r\,d\theta$（不是 dθ）。离原点越远，同样的 dθ 对应的弧越长。四分之一单位圆：$\int_0^{\pi/2}\int_0^1r\,dr\,d\theta=\frac\pi4$`],
['q',r`雅可比（Jacobian）是什么？公式？`,r`换元 x = x(u, v)、y = y(u, v) 时面积的缩放倍数：$$dx\,dy=\left|\frac{\partial(x,y)}{\partial(u,v)}\right|du\,dv,\quad J=\begin{vmatrix}x_u&x_v\\y_u&y_v\end{vmatrix}=x_uy_v-x_vy_u$$
要取绝对值（面积为正）。极坐标 J = r；三维球坐标 $r^2\sin\theta$`],
['q',r`课上例 6：平行四边形 (0,0)、(3,1)、(4,0)、(1,−1) 的 $I_{yy}$ 怎么用雅可比算？`,r`边平行于 $y=\frac x3$ 和 $y=-x$，令 $u=x+y$（0 → 4）、$v=\frac x3-y$（0 → 4/3），限都变常数。反解 $x=\frac34(u+v)$、$y=\frac14(u-3v)$，$|J|=\left|\frac34\cdot(-\frac34)-\frac34\cdot\frac14\right|=\frac34$。$I_{yy}=\int_0^{4/3}\int_0^4\frac{9}{16}(u+v)^2\cdot\frac34\,du\,dv=\frac{58}{3}\approx19.33$`],
['q',r`三重积分求体积：讲义例 1（z = 0 到 z = x + y，1 ≤ x ≤ 4，2 ≤ y ≤ 5）`,r`$V=\int_1^4\int_2^5\int_0^{x+y}dz\,dy\,dx$。先 z：$x+y$；再 y：$\left[xy+\frac{y^2}{2}\right]_2^5=3x+\frac{21}{2}$；再 x：$\left[\frac32x^2+\frac{21}{2}x\right]_1^4=54$。思路：小立方体 → 竖柱（z 方向）→ 片（y 方向）→ 整体（x 方向）`],
['q',r`柱坐标和球坐标的体积元？球的体积怎么算？`,r`柱坐标 $dV=r\,dr\,d\theta\,dz$；球坐标 $dV=r^2\sin\theta\,dr\,d\theta\,d\phi$（θ 是和 z 轴的夹角，0 到 π；φ 绕 z 轴，0 到 2π）。球：$\int_0^R r^2dr\int_0^{2\pi}d\phi\int_0^\pi\sin\theta\,d\theta=\frac{R^3}{3}\cdot2\pi\cdot2=\frac43\pi R^3$`],
['q',r`质量和质心的公式？`,r`$M=\iiint\rho\,dV$；一阶矩 $M_{yz}=\iiint x\rho\,dV$、$M_{xz}=\iiint y\rho\,dV$、$M_{xy}=\iiint z\rho\,dV$；质心 $(\bar x,\bar y,\bar z)=\left(\frac{M_{yz}}{M},\frac{M_{xz}}{M},\frac{M_{xy}}{M}\right)$。Tutorial Q20：单位立方体 ρ = x + 2y + 3z，M = 3，质心 $(\frac{19}{36},\frac59,\frac{7}{12})$`],
['q',r`Tutorial Q22：均匀圆锥（半径 R、高 H、质量 m）绕轴的转动惯量？`,r`柱坐标，$I_z=\rho_0\int_0^{2\pi}\int_0^R\int_{rH/R}^{H}r^2\cdot r\,dz\,dr\,d\theta=\frac{\rho_0\pi HR^4}{10}$。$m=\rho_0\cdot\frac13\pi R^2H$ 代掉 $\rho_0$：$I_z=\frac{3}{10}mR^2$。z 的限含 r，所以 z 要先积`],
['err',r`易错：二重积分的限和次序`,r`① 最外层限必须是常数，Tutorial Q2「$\int_0^x\int_1^2$」次序反了，结果还是 x 的函数；② 先画图确定谁在上、谁在下，联立求交点；③ 横条有时要拆段（$y=x^2$ 与 $y=x+2$ 在 y = 1 处）；④ 极坐标别忘了乘 r，球坐标别忘了 $r^2\sin\theta$`],
['fix',r`本周资料里的错误`,r`Tutorial 答案 Q14(a) 的 $\bar y=1.64$ 应为 1.6（$\iint y\,dA=7.2$，A = 4.5）；Q19 答案说「y = x 总在 $y=x^2$ 下面」应为 $y=x^2+1$；Jacobian 手写第 18 页 $y=r\cos\theta$ 应为 $r\sin\theta$；课上例 6 扫描第 9 页 $(u^2+uv+v^2)$ 漏了 2；讲义第 57 页密度 ρ = 1 − x 在 x > 1 时为负，物理上不成立`],
]);

})();

/* Electrical Engineering 1 (Year 1) cards. [kind, question, answer]; kind: q = self-test, err = common mistake, fix = slide erratum */
window.CARDS=window.CARDS||[];
(function(){const r=String.raw,N='https://app.notion.com/p/';
const D=(l,t,id,arr)=>arr.forEach((x,i)=>window.CARDS.push({id:l+'-'+(i+1),c:'EE',l,t,u:N+id,k:x[0],q:x[1],a:x[2]}));

D('EE-AA','模拟分析：正弦、相量、电抗、阻抗','2ff202737d7a80ee85bddbb288026f33',[
['q',r`写出 $f$、$T$、$\omega$ 的关系，以及 $V_{pp}$、$V_{rms}$ 和峰值的关系。`,r`$f=1/T$，$\omega=2\pi f$；$V_{pp}=2V_p$，$V_{rms}=V_p/\sqrt2\approx0.707V_p$（只对正弦成立）。`],
['q',r`rms 值的物理意义是什么？为什么是 $V_p/\sqrt2$？`,r`在电阻上产生同样热量的直流电压。发热 ∝ $v^2$，$\sin^2$ 一个周期平均为 1/2，所以 $V_{rms}^2=V_p^2/2$。`],
['q',r`$y=A\sin(\theta-\phi)$ 是超前还是滞后？在 θ = 90° 处，$5\sin(\theta+20°)$ 的瞬时值？`,r`减 φ = 右移 = **滞后**。$5\sin110°=4.70$ V（超前 20°）。`],
['q',r`相量的长度和角度各代表什么？+225° 还能写成什么？`,r`长度 = 峰值，角度 = 相位位置（逆时针为正）。+225° = −135°。`],
['q',r`电容和电感中，电流与电压谁超前？用 $i=C\,dv/dt$ 解释电容的情况。`,r`电容：**电流超前 90°**；电感：**电压超前 90°**（ELI the ICE man）。正弦电压在过零点最陡 → 电流最大，在峰值处斜率为 0 → 电流为 0。`],
['q',r`写出 $X_C$、$X_L$。频率翻倍时各怎么变？直流时各相当于什么？`,r`$X_C=\dfrac{1}{2\pi fC}$ 减半，直流时开路；$X_L=2\pi fL$ 翻倍，直流时短路（一根导线）。`],
['q',r`5 V rms、10 kHz 加在 0.0056 μF 上，电流多少？加在 100 mH 上呢？`,r`$X_C=2.84$ kΩ → 1.76 mA；$X_L=6283$ Ω → 796 μA。`],
['q',r`写出电容和电感储能的公式。`,r`$W=\frac12CV^2$（电场），$W=\frac12LI^2$（磁场）。`],
['q',r`串联 RC 的复数阻抗、模和角各是什么？`,r`$\mathbf Z=R-jX_C=R+\dfrac{1}{j\omega C}$；$Z=\sqrt{R^2+X_C^2}$；$\theta=-\tan^{-1}(X_C/R)$（电压滞后电流）。`],
['q',r`$\mathbf I=0.2\angle0°$ mA，R = 10 kΩ，C = 0.01 μF，f = 1 kHz，求 $\mathbf V_s$。`,r`$X_C=15.9$ kΩ，$\mathbf Z=18.8\angle-57.8°$ kΩ，$\mathbf V_s=\mathbf I\mathbf Z=3.76\angle-57.8°$ V。`],
['q',r`把 $-3+j4$ 化成极坐标。计算器直接按 $\tan^{-1}(4/-3)$ 会错在哪？`,r`5∠126.9°。$\tan^{-1}$ 只返回 ±90° 内的角，得到 −53.1°；第 2 象限要加 180°。`],
['q',r`并联阻抗怎么算？导纳有什么好处？`,r`$1/\mathbf Z_p=\sum1/\mathbf Z_k$；导纳 $\mathbf Y=1/\mathbf Z$，并联时直接相加 $\mathbf Y_p=\sum\mathbf Y_k$。`],
['err',r`交流电路计算最常见的错误？`,r`- μF、kHz、mH 没换成 F、Hz、H
- rms 和峰值混用（功率一定用 rms）
- $|Z|=R+X$（应开根号）
- 电容 / 电感的超前滞后弄反
- $\tan^{-1}$ 象限没修正；$\omega t$ 没用弧度`],
['fix',r`课件 p.52 的电容小结和 p.87 的结论各有什么笔误？`,r`p.52 把容抗写成 $X_L$（应为 $X_C$）；p.87「lags the current by −57.8°」双重否定，应为滞后 57.8°。`],
]);
})();

"""Regenerate index.html from the lab pages themselves.

Run from the repo root after adding or renaming a lab:   python3 tools/build_index.py
Each page contributes its <title>, its header description and its header <nav> links (#lab1, #lab2 …),
so the chips on the index always match the labs that actually exist.
Only GROUPS and BLURB below are maintained by hand.
"""
import html
import os
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# (group title, small caps line, [page dirs])
GROUPS = [
    ('复习与模拟器', 'REVIEW · SIMULATORS', ['cards', 'circuit-sim', 'logic-sim']),
    ('Year 2 · 数字电子与电机', 'DEEM · DIGITAL ELECTRONICS · ELECTRICAL MACHINES',
     ['logic-lab', 'fsm-lab', 'afsm-lab', 'ac-phase-lab', 'power-lab']),
    ('Year 2 · 工程数学 2', 'ENGINEERING MATHEMATICS 2 · PART A / PART B', ['prob-lab', 'laplace-lab', 'fourier-lab']),
    ('Year 2 · 通信系统', 'COMMUNICATION SYSTEMS', ['coding-lab', 'comms-lab']),
    ('Year 2 · 多学科系统与软件工程', 'MSSE · PYTHON · SYSML', ['msse-lab']),
    ('Year 1 · 电气工程 EE1', 'ELECTRICAL ENGINEERING 1',
     ['network-lab', 'amp-lab', 'digital-lab', 'acpower-lab', 'alu-lab', 'filter-lab', 'machines-lab', 'bench-lab']),
]

# course line + one-line summary shown on the card (kept short; the chips list the labs)
BLURB = {
    'cards': ('Year 1 EE + Year 2 全部笔记', '自测题、易错点、勘误做成卡片，间隔重复自动安排复习'),
    'circuit-sim': ('模拟器', '画电路仿真：运放、三极管、稳压管、LED、变压器；自动查错、极点 / 时间常数、戴维宁等效、Bode 图'),
    'logic-sim': ('模拟器', '门电路 / 触发器仿真；表达式化简：1–6 变量卡诺图、完全和、所有最简式、Q–M 表格法和代数推导步骤，检查自己的答案；自动生成电路、状态图'),
    'logic-lab': ('DE ①②③', 'K-map 最小化、触发器时序、同步状态机、静态冒险'),
    'fsm-lab': ('DE ①②', '布尔函数的几种写法、Moore vs Mealy、触发器互换、编码分配'),
    'afsm-lab': ('DE ③', '继电器河道闸门、竞争与虚拟状态、门级 AFSM 触发器'),
    'ac-phase-lab': ('EM Week 1–4', '超前与滞后、阻抗三角形、变压器压降相量图'),
    'power-lab': ('EM Week 1–2', '平均值与 RMS、电感伏秒平衡、理想变压器与折算阻抗'),
    'prob-lab': ('Part A · Week 1–4', '期望与方差、Bayes、中心极限定理、假设检验、马尔可夫与 PageRank'),
    'laplace-lab': ('Part B · Week 1–3', 's 平面极点与响应、第二平移定理、卷积'),
    'fourier-lab': ('Part B · Week 4 / EE1 Fourier', '级数合成与吉布斯现象、rect ⟷ sinc、采样与混叠、系数积分与正交性'),
    'coding-lab': ('Week 1 / 3', '熵、Huffman / Fano / Shannon、分贝'),
    'msse-lab': ('Python Lecture 1–2 / Module Overview', '切片、Python 2 vs 3 除法、列表推导式、浏览器里逐行跑 Python、Vee 模型'),
    'comms-lab': ('Week 3 + Useful Equations', '前缀码解码、分组编码、信道容量、链路预算、量化噪声、误码率、滤波器'),
    'network-lab': ('Network Theorems', '叠加原理、戴维宁 / 诺顿等效、节点电压法'),
    'amp-lab': ('Voltage Amplifiers', '加载效应、负反馈、运放四种接法与削顶、惠斯通电桥'),
    'digital-lab': ('Digital Fundamentals / Synthesis', '进制转换、Gray 码、布尔表达式、卡诺图、计数器设计'),
    'acpower-lab': ('AC Power', '瞬时功率、功率因数校正、最大功率传输、三相功率'),
    'alu-lab': ('Programmable Circuits / Lab 2', '补码转盘、4 位 ALU 与标志位、硬件 PWM、光敏电阻 + ADC'),
    'filter-lab': ('Communications Circuits', 'RC / RL 滤波器 Bode 图、串联 RLC 谐振、三种阻尼'),
    'machines-lab': ('Electrical Machines', '直流电机转矩–转速、变压器阻抗匹配、桥式整流与电容滤波'),
    'bench-lab': ('实验课 Lab 1 / 3 / 5', '分压器、示波器读数、RC 相移、热敏电阻温度计、LED 限流、机器人蛇'),
}


# extra search words (synonyms / English names) so e.g. 卡诺图 also finds the K-map lab
KEYWORDS = {
    'cards': '复习 review flashcards 卡片 间隔重复 自测',
    'circuit-sim': '电路 circuit 仿真 simulator 示波器 oscilloscope bode rc rlc 二极管 运放 op-amp 三极管 transistor 稳压管 zener led 变压器 transformer 戴维宁 thevenin 极点 pole',
    'logic-sim': '逻辑 logic 门 gate 触发器 flip-flop 真值表 truth table 仿真 冒险 hazard 卡诺图 karnaugh k-map 化简 simplify 最简 最小项 minterm 最大项 maxterm 质蕴含项 prime implicant quine mccluskey 表格法 完全和 状态图 state mux 译码器 decoder 数码管',
    'logic-lab': '卡诺图 k-map 质蕴含项 最小和 触发器 flip-flop 状态机 fsm 毛刺 冒险 hazard',
    'fsm-lab': '状态机 fsm 激励表 excitation moore mealy 布尔代数 编码 步进电机',
    'afsm-lab': '异步 asynchronous 竞争 race 冒险 hazard 继电器 relay 虚拟状态',
    'ac-phase-lab': '相位 phase 相量 phasor 阻抗 impedance 感抗 功率因数 变压器 压降',
    'power-lab': 'rms 有效值 平均值 变压器 transformer 伏秒 匝数比 折算',
    'prob-lab': '概率 probability 期望 方差 贝叶斯 bayes clt 正态 高斯 gaussian 假设检验 markov 马尔可夫 pagerank 稳态',
    'laplace-lab': 'laplace 拉氏 极点 pole s 平面 阶跃 冲激 heaviside 卷积 convolution 传递函数',
    'fourier-lab': 'fourier 傅立叶 频谱 spectrum 吉布斯 gibbs 采样 sampling 混叠 aliasing 正交 orthogonality sinc',
    'coding-lab': '熵 entropy 霍夫曼 huffman 香农 shannon fano 分贝 db 编码',
    'msse-lab': 'python 切片 slice 下标 index 除法 division 整除 floor 类型 type 列表推导式 list comprehension 循环 loop 别名 alias 字典 dict 异常 exception try except pyodide 逐行 trace vee 模型 验证 verification 确认 validation sysml 系统工程',
    'comms-lab': '前缀码 prefix 解码 decode 误码 信道容量 channel capacity shannon 带宽 snr 信噪比 天线 antenna friis 自由空间 路径损耗 链路预算 link budget 双径 量化 quantisation sqnr pcm 采样 nyquist 高斯 gaussian 误码率 ber 门限 butterworth chebyshev 滤波器',
    'network-lab': '叠加 superposition 戴维南 戴维宁 thevenin 诺顿 norton 节点 nodal 电导矩阵',
    'amp-lab': '放大器 amplifier 运放 op-amp 反馈 feedback 加载 loading 电桥 bridge 应变片',
    'digital-lab': 'k-map 卡诺图 二进制 binary 十六进制 hex gray 格雷码 布尔 德摩根 计数器 counter',
    'acpower-lab': '功率 power 功率因数 power factor 无功 视在 三相 three-phase 最大功率传输',
    'alu-lab': '补码 complement alu 加法器 标志位 pwm adc arduino 光敏电阻',
    'filter-lab': '滤波 filter bode 谐振 resonance q 带宽 阻尼 damping rc rl rlc 低通 高通',
    'machines-lab': '电机 motor 直流 转矩 torque 转速 变压器 匹配 整流 rectifier 电容滤波',
    'bench-lab': '实验 lab 实验课 virtualbench 分压器 voltage divider 示波器 oscilloscope 触发 trigger 探头 probe 电容 capacitor 相位 phase 热敏电阻 thermistor ntc 运放 op-amp led 数据表 datasheet 限流 机器人 robot snake arduino 光敏三极管',
}


def page_info(d):
    s = open(os.path.join(ROOT, d, 'index.html'), encoding='utf-8').read()
    title = re.search(r'<title>(.*?)</title>', s).group(1).strip()
    labs = []
    hdr = re.search(r'<header>(.*?)</header>', s, re.S)
    if hdr:
        labs = re.findall(r'<a href="#(lab\d+)"[^>]*>(.*?)</a>', hdr.group(1))
    if not labs:  # fall back to the section tags
        for sid, tag in re.findall(r'<section class="panel" id="(lab\d+)"[^>]*>\s*<div class="tag">(.*?)</div>', s):
            labs.append((sid, tag.replace(' · ', ' ', 1)))
    labs = [(sid, re.sub(r'^实验\s*\d+\s*', '', t).strip()) for sid, t in labs if re.match(r'实验', t)]
    return title, labs


def build():
    cards_html, n_pages, n_labs = [], 0, 0
    for gt, gsub, dirs in GROUPS:
        items = []
        for d in dirs:
            title, labs = page_info(d)
            course, blurb = BLURB[d]
            n_pages += 1
            n_labs += len(labs)
            chips = ''.join(
                f'<a class="chip" href="{d}/#{sid}"><i>{sid[3:]}</i>{html.escape(name)}</a>' for sid, name in labs)
            search = ' '.join([title, course, blurb, KEYWORDS.get(d, '')] + [n for _, n in labs]).lower()
            items.append(
                f'<article class="card" data-s="{html.escape(search)}">'
                f'<a class="main" href="{d}/"><small>{html.escape(course)}</small><b>{html.escape(title)}</b>'
                f'<span>{html.escape(blurb)}</span></a>'
                + (f'<div class="chips">{chips}</div>' if chips else '') + '</article>')
        cards_html.append(f'<section class="group"><div class="tag">{gsub}</div><h2>{gt}</h2>'
                          f'<div class="grid">{"".join(items)}</div></section>')
    return TEMPLATE.replace('{{GROUPS}}', '\n'.join(cards_html)).replace(
        '{{COUNT}}', f'{n_pages} 个页面 · {n_labs} 个小实验')


TEMPLATE = r'''<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>EEE 互动学习页</title>
<meta name="description" content="伯明翰大学 EEE Year 1–2 的互动学习页：配合 Notion 课程笔记，拖滑块看公式背后发生了什么。">
<meta property="og:type" content="website"><meta property="og:site_name" content="EEE 互动学习页"><meta property="og:title" content="EEE 互动学习页"><meta property="og:description" content="伯明翰大学 EEE Year 1–2 的互动学习页：配合 Notion 课程笔记，拖滑块看公式背后发生了什么。"><meta property="og:url" content="https://114514ch-en.github.io/eee-interactive/">
<meta name="theme-color" content="#f3f5f2" media="(prefers-color-scheme: light)"><meta name="theme-color" content="#0f1513" media="(prefers-color-scheme: dark)">
<link rel="icon" href="assets/favicon.svg" type="image/svg+xml">
<style>
/* generated by tools/build_index.py — edit GROUPS / BLURB there, then rerun */
:root{--bg:#f3f5f2;--panel:#fbfcfa;--ink:#1d2622;--muted:#5d6b64;--line:#d5ddd7;--accent:#0f7d6e;--chip:#e8efe9}
@media (prefers-color-scheme:dark){:root{--bg:#0f1513;--panel:#151d1a;--ink:#e4ece7;--muted:#97a69e;--line:#2a3631;--accent:#3fd0b8;--chip:#1c2622;color-scheme:dark}}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--ink);font:15px/1.7 "Noto Sans SC","PingFang SC","Microsoft YaHei",system-ui,sans-serif;
  padding:32px max(16px,env(safe-area-inset-right)) 56px max(16px,env(safe-area-inset-left))}
main{max-width:1040px;margin:0 auto;display:flex;flex-direction:column;gap:22px}
h1{font-size:clamp(26px,5vw,34px);margin:0;line-height:1.2}
h2{font-size:19px;margin:0 0 10px}
p{color:var(--muted);margin:0}
.tag{font:12px ui-monospace,Consolas,monospace;color:var(--accent);letter-spacing:.08em}
.bar{display:flex;flex-wrap:wrap;gap:10px 16px;align-items:center}
.bar input{flex:1 1 260px;font-size:15px;font-family:inherit;color:var(--ink);background:var(--panel);border:1px solid var(--line);border-radius:10px;padding:8px 12px}
.bar input:focus-visible{outline:2px solid var(--accent);outline-offset:1px}
.bar small{color:var(--muted);font-size:13px}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:12px}
.card{background:var(--panel);border:1px solid var(--line);border-radius:12px;display:flex;flex-direction:column;min-width:0}
.card:hover{border-color:var(--accent)}
.card a.main{display:block;padding:14px 16px 10px;color:inherit;text-decoration:none}
.card b{font-size:17px}
.card small{display:block;color:var(--accent);font-size:12px;line-height:1.5}
.card span{display:block;color:var(--muted);font-size:13.5px;line-height:1.6;margin-top:2px}
.chips{display:flex;flex-wrap:wrap;gap:6px;padding:0 16px 14px}
.chip{font-size:12.5px;color:var(--ink);background:var(--chip);border-radius:999px;padding:2px 10px 2px 3px;text-decoration:none;display:inline-flex;align-items:center;gap:6px;max-width:100%}
.chip i{font:600 11px ui-monospace,Consolas,monospace;font-style:normal;color:var(--panel);background:var(--accent);border-radius:999px;min-width:18px;height:18px;display:inline-grid;place-items:center}
.chip:hover{outline:1px solid var(--accent)}
.card a:focus-visible,.chip:focus-visible{outline:2px solid var(--accent);outline-offset:2px;border-radius:10px}
.empty{display:none;color:var(--muted)}
.hide{display:none}
</style></head><body><main>
<header>
<div class="tag">UNIVERSITY OF BIRMINGHAM · EEE YEAR 1–2</div>
<h1>EEE 互动学习页</h1>
<p>配合 Notion 课程笔记使用的互动页面，拖滑块看公式背后发生了什么。点卡片打开整页，点下面的小标签直接跳到某个实验。</p>
</header>
<div class="bar"><input id="q" type="search" placeholder="搜索：Bayes、卡诺图、整流、PageRank……" aria-label="搜索互动页"><small id="n">{{COUNT}}</small></div>
{{GROUPS}}
<p class="empty" id="none">没有找到，换个关键词试试。</p>
</main>
<script>
const q=document.getElementById('q'),cards=[...document.querySelectorAll('.card')],groups=[...document.querySelectorAll('.group')];
q.addEventListener('input',()=>{const t=q.value.trim().toLowerCase().split(/\s+/).filter(Boolean);let any=false;
  cards.forEach(c=>{const ok=t.every(w=>c.dataset.s.includes(w));c.classList.toggle('hide',!ok);any=any||ok;});
  groups.forEach(g=>g.classList.toggle('hide',!g.querySelector('.card:not(.hide)')));
  document.getElementById('none').style.display=any?'none':'block';});
</script>
</body></html>
'''

if __name__ == '__main__':
    out = build()
    with open(os.path.join(ROOT, 'index.html'), 'w', encoding='utf-8') as f:
        f.write(out)
    print('index.html written')

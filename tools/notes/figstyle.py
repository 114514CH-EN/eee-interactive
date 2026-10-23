"""Shared matplotlib style for note figures (Chinese labels, consistent palette).
usage:  import sys; sys.path.insert(0, '<repo>/tools/notes'); from figstyle import *
        ... draw ...; save('out/NAME.png')
Needs a CJK font: apt-get install -y fonts-noto-cjk (or any Noto Sans CJK).
"""
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import numpy as np
from PIL import Image
plt.rcParams.update({
 'font.family': ['Noto Sans CJK JP', 'Noto Sans CJK SC', 'DejaVu Sans'],
 'axes.unicode_minus': False, 'font.size': 11, 'axes.titlesize': 12,
 'axes.spines.top': False, 'axes.spines.right': False, 'axes.grid': True,
 'grid.alpha': 0.3, 'figure.dpi': 150, 'savefig.dpi': 170, 'savefig.bbox': 'tight',
 'mathtext.fontset': 'cm'})
# blue, red, green, purple, orange, cyan, slate
C = ['#2563eb', '#dc2626', '#16a34a', '#9333ea', '#ea580c', '#0891b2', '#64748b']
def save(name, maxw=1600):
    """Save the current figure and shrink it to at most maxw px wide (Notion renders ~1600)."""
    plt.savefig(name); plt.close()
    im = Image.open(name)
    if im.width > maxw:
        im.resize((maxw, int(im.height * maxw / im.width)), Image.LANCZOS).save(name)

#!/usr/bin/env python3
"""Compara, celda por celda, los resultados de la aplicación de Clínica Santa
María con los de la planilla original recalculada."""
import json, os, subprocess, sys
from evaluador_excel import Libro

XLS = sys.argv[1] if len(sys.argv) > 1 else os.path.join(os.path.dirname(__file__), 'planilla_csm.xlsx')
AQUI = os.path.dirname(os.path.abspath(__file__))

PACIENTES = []
for peso in (500, 780, 900, 1200, 1450, 2000, 2060, 2500, 3400, 4200):
    for eg in (25, 27, 29, 30, 32, 34, 35, 37, 40):
        for edad in (0, 3, 7, 8, 13, 14, 20, 28, 29, 45):
            PACIENTES.append({'pesoG': peso, 'egSem': eg, 'egDia': 0, 'edadDias': edad,
                              'igP': 10000, 'igD': 400, 'opioide': 'Fentanilo', 'dosisOpioide': 2})
for p_, d_ in ((5000, 400), (5000, 1000), (10000, 500), (10000, 1000)):
    PACIENTES.append({'pesoG': 1800, 'egSem': 31, 'egDia': 0, 'edadDias': 10,
                      'igP': p_, 'igD': d_, 'opioide': 'Morfina', 'dosisOpioide': 40})
PACIENTES.append({'pesoG': 2000, 'egSem': 33, 'egDia': 0, 'edadDias': 5,
                  'igP': 10000, 'igD': 400, 'opioide': 'Morfina', 'dosisOpioide': 25})

LIBRO = Libro(XLS)

def excel(p):
    lb = LIBRO
    lb.cache = {}
    lb.over = {
        ('MED BOLO', 'B3'): float(p['pesoG']),
        ('MED BIC', 'B3'): float(p['pesoG']),
        ('MED ORALES', 'C3'): float(p['pesoG']),
        ('ANTIBIOTICOS', 'B5'): float(p['pesoG']),
        ('ANTIBIOTICOS', 'F4'): float(p['egSem']),
        ('ANTIBIOTICOS', 'D4'): float(p['edadDias']),
        ('Hoja de Urgencia', 'C6'): float(p['pesoG']),
        ('DART', 'C4'): float(p['pesoG']),
        ('C Glucosa', 'C1'): float(p['pesoG']),
        ('GGlobulina ', 'B6'): float(p['pesoG']),
        ('GGlobulina ', 'B12'): float(p['igP']),
        ('GGlobulina ', 'D12'): float(p['igD']),
        ('WEANING OPIODES', 'H4'): float(p['pesoG']),
        ('WEANING OPIODES', 'C9'): float(p['dosisOpioide']),
        ('WEANING OPIODES', 'B5'): p['opioide'].upper(),
    }
    return lb

def iguales(a, b):
    if isinstance(a, bool):
        return b is None
    if isinstance(a, str):
        return b is None
    if b is None:
        return False
    try:
        return abs(float(a) - float(b)) <= 1e-9 * max(1.0, abs(float(a)))
    except (TypeError, ValueError):
        return False

print('Calculando %d pacientes en la aplicación…' % len(PACIENTES), flush=True)
SALIDA = json.loads(subprocess.run(['node', os.path.join(AQUI, 'valores_app.js'), json.dumps(PACIENTES)],
                                   capture_output=True, text=True, check=True).stdout)

fallos, revisados = [], 0
for i, pac in enumerate(PACIENTES):
    app = SALIDA[i]
    lb = excel(pac)
    for clave, valor_app in app.items():
        hoja, ref = clave.split('!')
        try:
            valor_xl = lb.celda(hoja, ref)
        except Exception as e:
            fallos.append((pac, clave, 'ERROR evaluador: %s' % e, valor_app))
            continue
        revisados += 1
        if not iguales(valor_xl, valor_app):
            fallos.append((pac, clave, valor_xl, valor_app))
    if (i + 1) % 100 == 0:
        print('  … %d/%d pacientes' % (i + 1, len(PACIENTES)), flush=True)

print('\nPacientes probados : %d' % len(PACIENTES))
print('Celdas comparadas  : %d' % revisados)
print('Diferencias        : %d' % len(fallos))
from collections import Counter
for celda, n in Counter(f[1] for f in fallos).most_common(25):
    ej = next(f for f in fallos if f[1] == celda)
    print('  %-28s %5d casos   planilla=%r  app=%r' % (celda, n, ej[2], ej[3]))
sys.exit(1 if fallos else 0)

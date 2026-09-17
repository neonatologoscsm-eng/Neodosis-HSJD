#!/usr/bin/env python3
"""Compara, celda por celda, los resultados de la aplicación con los que
entrega la planilla original recalculada para distintos pacientes."""
import json, subprocess, sys, os
from evaluador_excel import Libro

XLSX = sys.argv[1] if len(sys.argv) > 1 else os.path.join(os.path.dirname(__file__), 'planilla_original.xlsx')
AQUI = os.path.dirname(os.path.abspath(__file__))

PACIENTES = []
for peso in (450, 800, 1000, 1200, 1500, 2000, 2001, 2800, 3200, 4500):
    for eg in (24, 26, 27, 28, 29, 30, 32, 34, 36, 37, 40, 41):
        for edad in (0, 1, 3, 7, 8, 13, 14, 15, 28, 29, 30, 45, 90):
            PACIENTES.append({'pesoG': peso, 'egSem': eg, 'egDia': 0, 'edadDias': edad,
                              'igP': 10000, 'igD': 400})
# combinaciones de inmunoglobulina y EG con días
for p, d in ((5000, 400), (5000, 500), (5000, 1000), (10000, 400), (10000, 500), (10000, 1000)):
    PACIENTES.append({'pesoG': 2450, 'egSem': 31, 'egDia': 4, 'edadDias': 12, 'igP': p, 'igD': d})


LIBRO = Libro(XLSX)


def excel(paciente):
    """Reutiliza el libro cargado: sólo se reinicia la caché y los overrides."""
    lb = LIBRO
    lb.cache = {}
    lb.over = {
        ('Medicamentos', 'B6'): float(paciente['pesoG']),
        ('Medicamentos', 'D5'): float(paciente['edadDias']),
        ('Medicamentos', 'F5'): paciente['egSem'] + paciente['egDia'] / 7.0,
        ('Otros medicamentos', 'B6'): float(paciente['pesoG']),
        ('Inmunoglobulina', 'B12'): float(paciente['igP']),
        ('Inmunoglobulina', 'D12'): float(paciente['igD']),
    }
    return lb


def iguales(a, b):
    """a = valor de la planilla, b = valor de la aplicación."""
    if isinstance(a, bool) and a is False:
        return b is None
    if isinstance(a, str):
        return (b is None and a == 'error') or (isinstance(b, str) and b == a)
    if b is None:
        return False
    if isinstance(b, str):
        return False
    return abs(float(a) - float(b)) <= 1e-9 * max(1.0, abs(float(a)))


print('Calculando %d pacientes en la aplicación…' % len(PACIENTES), flush=True)
SALIDA = json.loads(subprocess.run(['node', os.path.join(AQUI, 'valores_app.js'), json.dumps(PACIENTES)],
                                   capture_output=True, text=True, check=True).stdout)

fallos, documentadas, revisados = [], [], 0
for i, pac in enumerate(PACIENTES):
    app = SALIDA[i]
    lb = excel(pac)
    for clave, valor_app in app.items():
        hoja, ref = clave.split('!')
        try:
            valor_xl = lb.celda(hoja, ref)
        except Exception as e:                       # pragma: no cover
            fallos.append((pac, clave, 'ERROR evaluador: %s' % e, valor_app))
            continue
        revisados += 1
        if not iguales(valor_xl, valor_app):
            # Divergencia esperada y documentada: cuando la cadena de SI() de la
            # planilla no cubre el caso, Excel devuelve FALSO y arrastra una dosis
            # de 0. La aplicación muestra «sin resultado» con una alerta.
            if valor_app is None and isinstance(valor_xl, float) and valor_xl == 0.0:
                documentadas.append((pac, clave))
            else:
                fallos.append((pac, clave, valor_xl, valor_app))
    if (i + 1) % 100 == 0:
        print('  … %d/%d pacientes' % (i + 1, len(PACIENTES)), flush=True)

print('\nPacientes probados : %d' % len(PACIENTES))
print('Celdas comparadas  : %d' % revisados)
print('Divergencias documentadas (FALSO de Excel → «sin resultado») : %d' % len(documentadas))
print('Diferencias no esperadas : %d' % len(fallos))
if documentadas:
    from collections import Counter as _C
    for celda, n in _C(c for _, c in documentadas).most_common():
        print('  %-28s %5d casos' % (celda, n))
from collections import Counter
resumen = Counter(f[1] for f in fallos)
for celda, n in resumen.most_common():
    ej = next(f for f in fallos if f[1] == celda)
    print('  %-28s %5d casos   planilla=%r  app=%r   ej: %s' %
          (celda, n, ej[2], ej[3], ej[0]))
sys.exit(1 if fallos else 0)

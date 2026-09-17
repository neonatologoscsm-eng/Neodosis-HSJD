# Verificación de fidelidad con la planilla original

Estas herramientas comprueban que la aplicación entrega **exactamente** los
mismos valores que la planilla Excel de la unidad.

| Archivo | Qué hace |
|---|---|
| `planilla_original.xlsx` | Copia de la planilla institucional usada como referencia |
| `evaluador_excel.py` | Intérprete independiente de las fórmulas de Excel (`SI`, `Y`, `O`, `INT`, aritmética, referencias entre hojas) con las reglas de comparación de Excel: número < texto < booleano |
| `valores_app.js` | Ejecuta el núcleo de cálculo de la app (`js/calculo.js` + datos) y emite los resultados con las referencias de celda de la planilla |
| `comparar.py` | Recalcula la planilla para 1.566 pacientes sintéticos y compara celda por celda |

## Ejecución

```bash
pip install openpyxl
python3 comparar.py planilla_original.xlsx
```

Salida esperada:

```
Pacientes probados : 1566
Celdas comparadas  : 447876
Divergencias documentadas (FALSO de Excel → «sin resultado») : 1100
Diferencias no esperadas : 0
```

Las divergencias documentadas corresponden a las celdas `Antimicrobianos!G21/L21`
(cefepime, bacteriemia) y `Antimicrobianos!G60/L60` (zidovudina VO), donde la
cadena de `SI()` de la planilla no cubre la combinación de EG y edad: Excel
devuelve `FALSO` y arrastra una dosis de 0 mg, mientras que la aplicación muestra
«sin resultado» junto a una alerta. Están descritas en el README principal.

## Rango de pacientes probados

- Pesos: 450, 800, 1.000, 1.200, 1.500, 2.000, 2.001, 2.800, 3.200 y 4.500 g
- Edad gestacional: 24, 26, 27, 28, 29, 30, 32, 34, 36, 37, 40 y 41 semanas
- Edad cronológica: 0, 1, 3, 7, 8, 13, 14, 15, 28, 29, 30, 45 y 90 días
- Las seis combinaciones de presentación y dosis de inmunoglobulina

"""Mini-intérprete de fórmulas de Excel (subconjunto usado por la planilla).

Recalcula las celdas originales del .xlsx con distintos pacientes para
contrastarlas contra los resultados de la aplicación.
Soporta: + - * /, comparaciones, paréntesis, IF/SI, AND/Y, OR/O, INT, TODAY,
referencias A1 y 'Hoja'!A1, con las reglas de comparación de Excel
(número < texto < booleano).
"""
import math
import re
import openpyxl

TOKEN = re.compile(r"""
    \s*(?:
      (?P<num>\d+(?:\.\d+)?)
    | (?P<str>"[^"]*")
    | (?P<ref>(?:'[^']+'|[A-Za-zÁÉÍÓÚÑáéíóúñ][\wÁÉÍÓÚÑáéíóúñ ]*!)?\$?[A-Z]{1,3}\$?\d{1,5}(?![\w(]))
    | (?P<func>[A-Za-z]+)\s*\(
    | (?P<op><=|>=|<>|[-+*/^<>=])
    | (?P<lp>\()
    | (?P<rp>\))
    | (?P<sep>[,;])
    )""", re.VERBOSE)


class Err(Exception):
    pass


def tipo(v):
    if isinstance(v, bool):
        return 2
    if isinstance(v, str):
        return 1
    return 0


def comparar(a, b, op):
    """Orden de Excel: cualquier número < cualquier texto < booleano."""
    ta, tb = tipo(a), tipo(b)
    if ta == tb:
        x, y = (a.lower(), b.lower()) if ta == 1 else (a, b)
    else:
        x, y = ta, tb
    if op == '=':
        return ta == tb and x == y
    if op == '<>':
        return not (ta == tb and x == y)
    if op == '<':
        return x < y
    if op == '>':
        return x > y
    if op == '<=':
        return x <= y
    if op == '>=':
        return x >= y
    raise Err(op)


def numero(v):
    if v is None:
        return 0
    if isinstance(v, bool):
        return 1 if v else 0
    if isinstance(v, str):
        raise Err('texto en aritmética: %r' % v)
    return v


def tokenizar(formula):
    s = formula[1:] if formula.startswith('=') else formula
    toks, i = [], 0
    while i < len(s):
        m = TOKEN.match(s, i)
        if not m or m.end() == i:
            if s[i:].strip() == '':
                break
            raise Err('token inesperado en %r' % s[i:])
        i = m.end()
        toks.append((m.lastgroup, m.group(m.lastgroup)))
    return toks


class Parser:
    """Un parser por fórmula: la evaluación de referencias es reentrante."""

    def __init__(self, toks, hoja, libro):
        self.toks, self.pos, self.hoja, self.libro = toks, 0, hoja, libro

    def mira(self):
        return self.toks[self.pos] if self.pos < len(self.toks) else (None, None)

    def come(self):
        t = self.mira()
        self.pos += 1
        return t

    def expr(self):
        v = self.suma()
        while self.mira()[0] == 'op' and self.mira()[1] in ('<', '>', '<=', '>=', '=', '<>'):
            op = self.come()[1]
            v = comparar(v, self.suma(), op)
        return v

    def suma(self):
        v = self.termino()
        while self.mira()[0] == 'op' and self.mira()[1] in '+-':
            op = self.come()[1]
            o = self.termino()
            v = numero(v) + numero(o) if op == '+' else numero(v) - numero(o)
        return v

    def termino(self):
        v = self.unario()
        while self.mira()[0] == 'op' and self.mira()[1] in '*/':
            op = self.come()[1]
            o = self.unario()
            v = numero(v) * numero(o) if op == '*' else numero(v) / numero(o)
        return v

    def unario(self):
        if self.mira()[0] == 'op' and self.mira()[1] in '+-':
            op = self.come()[1]
            v = self.unario()
            return numero(v) if op == '+' else -numero(v)
        return self.atomo()

    def atomo(self):
        k, t = self.come()
        if k == 'num':
            return float(t)
        if k == 'str':
            return t[1:-1]
        if k == 'ref':
            if '!' in t:
                h, r = t.split('!')
                h = h.strip("'")
            else:
                h, r = self.hoja, t
            return self.libro.celda(h, r.replace('$', ''))
        if k == 'lp':
            v = self.expr()
            if self.come()[0] != 'rp':
                raise Err('falta ) tras paréntesis')
            return v
        if k == 'func':
            args = []
            if self.mira()[0] != 'rp':
                args.append(self.expr())
                while self.mira()[0] == 'sep':
                    self.come()
                    args.append(self.expr())
            if self.come()[0] != 'rp':
                raise Err('falta ) en %s' % t)
            return self.funcion(t.upper(), args)
        raise Err('átomo inesperado %r' % ((k, t),))

    def funcion(self, nombre, a):
        if nombre in ('IF', 'SI'):
            cond = True if isinstance(a[0], str) else bool(a[0])
            if cond:
                return a[1]
            return a[2] if len(a) > 2 else False
        if nombre in ('AND', 'Y'):
            return all(True if isinstance(x, str) else bool(x) for x in a)
        if nombre in ('OR', 'O'):
            return any(True if isinstance(x, str) else bool(x) for x in a)
        if nombre == 'INT':
            return float(math.floor(numero(a[0])))
        if nombre == 'TODAY':
            return 0.0
        raise Err('función no soportada: %s' % nombre)


class Libro:
    def __init__(self, ruta, overrides=None):
        self.wb = openpyxl.load_workbook(ruta, data_only=False)
        self.over = overrides or {}
        self.cache = {}

    def celda(self, hoja, ref):
        clave = (hoja, ref)
        if clave in self.over:
            return self.over[clave]
        if clave in self.cache:
            return self.cache[clave]
        v = self.wb[hoja][ref].value
        if isinstance(v, str) and v.startswith('='):
            v = self.evaluar(v, hoja)
        elif v is None:
            v = 0
        self.cache[clave] = v
        return v

    def evaluar(self, formula, hoja):
        return Parser(tokenizar(formula), hoja, self).expr()

#!/usr/bin/env python
# -*- coding: utf-8 -*-

from django import template

register = template.Library()

def text_or_dash(t, form=u"%s"):
    return form % t if (t != None) else u'‒'

_colours = { 'black'    : {'hex':'#000000', 'sf':0,  'mult':0,  'tol':None, 'tc':250, 'invert':True},
            'brown'     : {'hex':'#964B00', 'sf':1,  'mult':1,  'tol':1, 'tc':100, 'invert':True},
            'red'       : {'hex':'#FF0000', 'sf':2,  'mult':2,  'tol':2, 'tc':50, 'invert':False},
            'orange'    : {'hex':'#FFA500', 'sf':3,  'mult':3,  'tol':None, 'tc':15, 'invert':False},
            'yellow'    : {'hex':'#FFFF00', 'sf':4,  'mult':4,  'tol':None, 'tc':25, 'invert':False},
            'green'     : {'hex':'#9ACD32', 'sf':5,  'mult':5,  'tol':0.5, 'tc':20, 'invert':False},
            'blue'      : {'hex':'#6495ED', 'sf':6,  'mult':6,  'tol':0.25, 'tc':10, 'invert':False},
            'violet'    : {'hex':'#EE82EE', 'sf':7,  'mult':7,  'tol':0.1, 'tc':5, 'invert':False},
            'grey'      : {'hex':'#A0A0A0', 'sf':8,  'mult':8,  'tol':0.05, 'tc':1, 'invert':False},
            'white'     : {'hex':'#FFFFFF', 'sf':9,  'mult':9,  'tol':None, 'tc':None, 'invert':False},
            'gold'      : {'hex':'#CFB53B', 'sf':None,  'mult':-1, 'tol' : 5, 'tc':None, 'invert':False},
            'silver'    : {'hex':'#C0C0C0', 'sf':None,  'mult':-2, 'tol' : 10, 'tc':None, 'invert':False},
            'none'      : {'hex':'#FFFFFF', 'sf':None,  'mult':None, 'tol': 20, 'tc':None, 'invert':False}
            }


@register.simple_tag
def resistor_code_row(colour):
    c = _colours[colour]
    return u"""<tr class="%s colour-table-row">
    <td class="colour-name">%s</td>
    <td class="colour-sf sf-1">%s</td>
    <td class="colour-sf sf-2">%s</td>
    <td class="colour-sf sf-3">%s</td>
    <td class="colour-mult">%s</td>
    <td class="colour-tol">%s</td>
    <td class="colour-tc">%s</td>
</tr>""" % (colour,
            colour.title(),
            text_or_dash(c['sf']),
            text_or_dash(c['sf']),
            text_or_dash(c['sf']),
            text_or_dash(c['mult'], u"10<sup>%s</sup>"),
            text_or_dash(c['tol'], u"±%s%%"),
            text_or_dash(c['tc'])
           )

def color_hex(colour):
    try:
        return _colours[colour]['hex']
    except AttributeError:
        return '#000'

@register.simple_tag
def print_styles():
    s = ''
    for colour in _colours:
        s += '.resistor-band.%s { fill: %s; fill-opacity: %d !important}\n' % (colour,
            _colours[colour]['hex'],
            0 if colour == 'none' else 1)
        s += 'tr.colour-table-row.%s { color: %s; background: %s }\n' % (colour,
                '#FFF' if _colours[colour]['invert'] else '#000',
                _colours[colour]['hex'] )

    return s;


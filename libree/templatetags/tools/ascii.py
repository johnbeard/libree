"""
Tags and filter for building character tables
"""

from django import template

from lxml.html import tostring
from lxml.html import builder as E

register = template.Library()

ascii = {
    0: {'char':'NUL', 'desc':'null character'},
    1: {'char':'SOH', 'desc':'start of heading'},
    2: {'char':'STX', 'desc':'start of text'},
    3: {'char':'ETX', 'desc':'end of text'},
    4: {'char':'EOT', 'desc':'end of transmission'},
    5: {'char':'ENQ', 'desc':'enquiry'},
    6: {'char':'ACK', 'desc':'acknowledgment'},
    7: {'char':'BEL', 'desc':'bell'},
    8: {'char':'BS', 'desc':'backspace'},
    9: {'char':'HT', 'desc':'horizontal tab'},
    10: {'char':'LF', 'desc':'line feed'},
    11: {'char':'VT', 'desc':'vertical tab'},
    12: {'char':'FF', 'desc':'form feed'},
    13: {'char':'CR', 'desc':'carriage return'},
    14: {'char':'SO', 'desc':'shift out'},
    15: {'char':'SI', 'desc':'shift in'},
    16: {'char':'DLE', 'desc':'data line escape'},
    17: {'char':'DC1', 'desc':'device control 1'},
    18: {'char':'DC2', 'desc':'device control 2'},
    19: {'char':'DC3', 'desc':'device control 3'},
    20: {'char':'DC4', 'desc':'device control 4'},
    21: {'char':'NAK', 'desc':'negative acknowledgement'},
    22: {'char':'SYN', 'desc':'synchronous idle'},
    23: {'char':'ETB', 'desc':'end of transmit block'},
    24: {'char':'CAN', 'desc':'cancel'},
    25: {'char':'EM', 'desc':'end of medium'},
    26: {'char':'SUB', 'desc':'substitute'},
    27: {'char':'ESC', 'desc':'escape'},
    28: {'char':'FS', 'desc':'file separator'},
    29: {'char':'GS', 'desc':'group separator'},
    30: {'char':'RS', 'desc':'record separator'},
    31: {'char':'US', 'desc':'unit separator'},
    32: {'char':'Space'},
    127: {'char':'DEL'}
}


def construct_row(cells, heading=False):
    
    row = E.TR()
    
    for cell in cells:
        f = E.TH if heading else E.TD
        td = f(cell)
        row.append(td)
    
    return row

@register.simple_tag
def ascii_table(className):
    
    table = E.TABLE(
        E.CLASS(className),
        E.TBODY()
    )
    
    cells = ['Dec', 'Hex', 'Oct', 'Char', 'Meaning',
        'Dec', 'Hex', 'Oct', 'Char',
        'Dec', 'Hex', 'Oct', 'Char',
        'Dec', 'Hex', 'Oct', 'Char'
    ]
    
    row = construct_row(cells, True)
    table.append(row)
    
    for i in range(32):
        
        cells = []
        
        for j in range(4):
            code = i + j*32;
            
            cells.append('%d' % code)
            cells.append('%02X' % code)
            cells.append('%03o' % code)
            
            if code in ascii:
                cells.append(ascii[code]['char'])
                
                if 'desc' in ascii[code]:
                    cells.append(ascii[code]['desc'])
            else:
                cells.append(chr(code))
                
            row = construct_row(cells)
        
        table.append(row)

    return tostring(table);


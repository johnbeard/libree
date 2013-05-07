import html_markup as H

"""
This is where general content is made into LibrEE-specific layout
"""

def button_group(group):

    buttons = ''
    for button in group:
        buttons += H.enclose('button', button, attr={'class':"btn"})
        buttons += '\n'

    return H.enclose('div', buttons, attr={'class': 'btn-group'})

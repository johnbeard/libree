

def link(url, text='', classes=''):
    """HTML link"""

    if not text:
        text = url

    if classes:
        classes = ' class="%s"' % classes

    return """<a href="%s"%s>%s</a>""" % (url, classes, text)

def enclose(tag, contents='', attr={}):
    """Enclose in a simple open-content-shut tag"""
    attrs = ''

    for k, v in attr.iteritems():
        attrs += " %s='%s'" % (k, v)

    return "<%s%s>%s</%s>\n" % (tag, attrs, contents, tag)

def selfclose(tag, attr={}):
    """Enclose in a simple open-content-shut tag"""
    attrs = ''
    for k, v in attr.iteritems():
        attrs += " %s='%s'" % (k, v)

    return "<%s%s/>\n" % (tag, attrs)

def inline_svg(filename):
    return open(filename, 'r').read()

def table_row(cells, attr={}, header=False):

    out = ''
    tag = 'th' if header else 'td'
    for cell in cells:
        out += '\t<%s>%s</%s>\n' % (tag, cell, tag)

    return enclose('tr', out, attr)

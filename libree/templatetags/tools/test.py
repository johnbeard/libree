#!/usr/bin/env python
# -*- coding: utf-8 -*-

from django import template
from ..utils import libree_tool

register = template.Library()

class NumberConverterTool(libree_tool.LibreeTool):

    description  ="General testing page"
    title = "Test"

    toolId = "test"
    template = "tools/test.html"
    icon = "test"
    tags = ["calculator"]
    categories = ['electronics']

    scripts = {}

    def __init__(self):
        pass


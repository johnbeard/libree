#!/usr/bin/env python
# -*- coding: utf-8 -*-

from django import template
from ..utils import libree_tool

register = template.Library()

class ResistorCodesTool(libree_tool.LibreeTool):

    description  ="Calculate various cryptographic hash functions of string or file data."
    title = "Hash calculator"

    toolId = "hashes"
    template = "tools/hashes.html"
    icon = "hashes"
    tags = ["calculator"]
    categories = ['computing']

    scripts = {}

    def __init__(self):
        pass


# tool_registry.py
#
# This file provides the central registry of available tools, along
# with metadata such as name, description, etc.
#
#  This program is free software; you can redistribute it and/or modify
#  it under the terms of the GNU General Public License as published by
#  the Free Software Foundation; either version 2 of the License, or
#  (at your option) any later version.
#  
#  This program is distributed in the hope that it will be useful,
#  but WITHOUT ANY WARRANTY; without even the implied warranty of
#  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
#  GNU General Public License for more details.
#  
#  You should have received a copy of the GNU General Public License
#  along with this program; if not, write to the Free Software
#  Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston,
#  MA 02110-1301, USA.
#

categories = {
    "mathematics": {'name': "Mathematics"},
    "electronics": {'name': "Electronic engineering and computing", 
        "desc": "Resources related to electrical, electronic and computer engineering, as well as programming and networking."},
    "physics": {'name': "Physics"},
    "chemistry": {'name': "Chemistry"},
    "mechanics": {'name': "Mechanical engineering"},
    "biology": {'name': "Biology"},
    "medicine": { 'name': "Medicine"},
    "economics": {'name': "Economics"},
    }

registry = {}

registry['resistor_codes'] = {
    "description":"Calculate the value, tolerance and other properties based on the markings of a resistor",
    "title":"Resistor codes calculator",

    "toolId": "resistor_codes",
    "template": "tools/resistor_codes.html",
    "icon": "resistor_codes",
    "tags" : ["calculator"],
    "categories" : ['electronics'],

    "scripts" : {'common':['jquery-svg-1.4.5a/jquery.svg.min.js',
                        'jquery-svg-1.4.5a/jquery.svgdom.js']
            }
}

registry['smd_resistor_codes'] = {
    "description": "Calculate the value and tolerance of an SMD resistor",
    "title": "SMD Resistor codes calculator",

    "toolId": "smd_resistor_codes",
    "template": "tools/smd_resistor_codes.html",
    "icon": "smd_resistor_codes",
    "tags": ["calculator"],
    "categories": ['electronics'],

    "scripts": {}
}

registry['number_converter'] = {
    "description":"Convert between various number formats and bases.",
    "title": "Number converter",
    "template": "tools/number_converter.html",
    "icon": "number_converter",
    "tags": ["calculator"],
    "categories": ['mathematics', 'electronics'],
    "scripts": {}
}

registry['ieee_converter'] = {
    "description":"Convert between normal numbers and IEEE754 floating point representations.",
    "title": "IEEE-754 converter",
    "template": "tools/ieee_converter.html",
    "icon": "ieee_converter",
    "tags": ["calculator"],
    "categories": ['electronics'],
    "scripts": {}
}

registry['led_resistor'] = {
    "description":"Calculate an appropriate resistor to use with an LED.",
    "title": "LED series resistor calculator",
    "template": "tools/led_resistor.html",
    "icon": "led_resistor",
    "tags": ["calculator"],
    "categories": ['electronics'],
    "scripts": {}
}

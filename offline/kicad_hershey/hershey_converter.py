#! /usr/bin/python

"""
Convert KiCad hershey font cpp file to something useful for us,
for example JSON
"""

import re
import json

class HersheyConverter():

    def __init__(self, filename):
        self.readData(filename)

    def readData(self, filename):

        f = open(filename, 'r')

        ST_READTOARRAY = 0
        ST_READBRACE = 1
        ST_READDATA = 2
        ST_DATADONE = 3

        state = ST_READTOARRAY
        index = 32

        self.coords = {}
        self.hershey = {}

        for line in f:
            if state == ST_READTOARRAY:
                if line.startswith("const char*"):
                    state = ST_READBRACE

            elif state == ST_READBRACE:
                state = ST_READDATA

            elif state == ST_READDATA:

                line = line.strip()

                if line.startswith('}'):
                    state = ST_DATADONE
                elif not line.startswith('"'):
                    continue #comment, or something
                else:
                    line = line.strip(' "')

                    charIndex = 0
                    limit = len(line)
                    glyphData = ""
                    while charIndex < limit:
                        if charIndex > 0 and line[charIndex] == '"' and line[charIndex - 1] != "\\":
                            break

                        glyphData += line[charIndex]
                        charIndex += 1

                    self.parseGlyph(glyphData, index)
                    index += 1
            elif state == ST_DATADONE:
                break;

    def parseGlyph(self, g, index):

        # ignore this one, it means a no-char box!
        if g == "F^K[KFYFY[K[":
            return

        self.hershey[index] = g.replace("\\\\", "\\");

    def outputToJSON(self, filename):

        of = open(filename, 'w')

        of.write(json.dumps(self.hershey, indent=1))


if __name__ == "__main__":

    h = HersheyConverter("newstroke_font.cpp");

    h.outputToJSON("/tmp/hershey.json")

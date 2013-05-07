/*
 * circuit_diagram.js
 * 
 * Copyright 2013 John Beard <john@libree.org>
 * 
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston,
 * MA 02110-1301, USA.
 * 
 * 
 * Basic SVG circuit diagram drawing implemented as a plugin of svg.js
 * 
 */

/* TODO
 * This currently refers to a global SVG object. It would be better to 
 * have this as a local variable via the parameter list, but then we
 * need to work out how to noConflict it.
 */
define(["./svg-0.32", "./svg.path"], function() {
    
    var SVGInvalidParameter = function() {}

    var C = function (draw) {
        this.dc = draw;
        
        return this
    };
    
    /*!
     * Transform a list of point by rotating around 0,0 and then
     * translating by x,y
     */
    var xfrmPts = function(list, x,y, angle) {
        for (var i = 0; i < list.length; i++) {
            list[i] = {
                x: x + Math.cos(angle*Math.PI/180)*list[i].x - Math.sin(angle*Math.PI/180)*list[i].y ,
                y: y + Math.sin(angle*Math.PI/180)*list[i].x + Math.cos(angle*Math.PI/180)*list[i].y
            }
        }
        
        return list;
    }
    
    C.prototype.wire = function(pts, vertFirst) {
        
        var posture = !vertFirst;
        
        var nodes = [[pts[0].x, pts[0].y]];
        var dir;
        
        for (var i = 1; i < pts.length; i++) {
            
            dir = vertFirst ? 'y' : 'x';
            //we have an offset in x
            if (pts[i-1][dir] !== pts[i][dir]) {
                nodes.push([pts[i - (vertFirst?1:0)].x, pts[i - (vertFirst?0:1)].y]);
            }
            
            dir = vertFirst ? 'x' : 'y';
            
            //we have an offset in y
            if (pts[i-1][dir] !== pts[i][dir]) {
                nodes.push([pts[i].x, pts[i].y]);
            }
        }
        
        var wire = this.dc.polyline(nodes)
            .fill('none')
            .stroke({width:2, linecap: 'square'});
        
        return wire;
    }
     
    /*!
     * Terminal circle. The reference point is the wire connection,
     * not the circle
     * 
     * @param orient orientation: O-- is left
     */ 
    C.prototype.terminal = function(orient, x, y, label, style){
        var r = 5;
        var l = 10;
        var margin = 3,
            ymargin = 9,
            grp = this.dc.group(),
            term = grp.group(),
            end;
        
        term.line(0, 0, -l, 0).stroke({ width: 2 });
        
        if (!style || style === 'circle')
            end = term.circle(r*2);
        else if (style === 'square')
            end = term.rect(r*2, r*2);
        
        end.stroke('#000000')
            .stroke({ width: 2 })
            .fill('none')
            .cx(-l-r)
            .cy(0);
            
        if (orient === 'right')
            term.rotate(180,0,0);
        else if (orient === 'up')
            term.rotate(90,0,0);
        else if (orient === 'down')
            term.rotate(-90,0,0);
        
        grp.add(term);
        
        if (typeof label === 'string')
        {
            var tx = orient === 'left' ? -l-r-r-margin : orient === 'right' ? l+r+r+margin: 0
            var ty = orient === 'up' ? -l-r-r-ymargin : orient === 'down' ? l+r+r+ymargin: 0
            
            var text = grp.text(label)
                .font({
                    size:     12,
                    anchor:   orient === 'left' ? 'end' : orient === 'right' ? 'start' : 'middle',
                    leading:  '1em'
                })
                .x(tx)
                .cy(ty);
        }
        
        grp.transform({x:x, y:y});
        
        grp.data('pins', [{x:x, y:y}]);

        return grp;
    }
    
    C.prototype.ground = function(x, y, style) {
        
        var leadLength = 15,
            grp = this.dc.group();
        
        grp.line(0,0, 0, leadLength).stroke({width:2});
        
        if (!style || style === 'normal') {
            
            for (var i = 0; i < 3; i++){
                var lx = 12 - 5*i,
                    ly = leadLength + 4*i;
                    
                grp.line(-lx, ly, lx, ly).stroke({width:2});
            }
        } else if (style === 'triangle') {
            grp.polygon([[-10, 0], [10, 0], [0, 9]])
                .translate(0,leadLength)
                .stroke({width:2})
                .fill('none');
        }
        
        grp.transform({x:x, y:y});
        
        grp.data('pins', [{x:x, y:y}]);
        
        return grp;
    }
        
    C.prototype.resistor = function(orient, x, y, valLabel, bands){
            
        var l = 30, 
            h = 10,
            leadLength =10,
            grp = this.dc.group();
        
        if (bands !== 'undefined')
        {
            var bandSpacing = Math.floor(l / bands.length) - 1;
            var bandWidth = bandSpacing - 2;
            
            for (var i = 0; i < bands.length; i++) {
                grp.rect(bandWidth, h).stroke('none')
                    .fill(bands[i])
                    .x(Math.floor(- (l/2) + bandSpacing * (i+0.5)))
                    .cy(0);
            }
        }
        
        grp.rect(l,h)
            .stroke('#000000')
            .stroke({ width: 2 })
            .fill('none')
            .center(0,0);  
            
        grp.line(-l/2, 0, -(l/2)-leadLength, 0).stroke({ width: 2 });
        grp.line(l/2, 0, (l/2)+leadLength, 0).stroke({ width: 2 });
        
        if (valLabel !== 'undefined')
        {
            var text = grp.text(valLabel)
                .font({
                    size:     12,
                    anchor:   'middle',
                    leading:  '1em'
                })
                .x(0)
                .cy(-15);
        }
        
        grp.data('pins', xfrmPts([{x:-l/2-leadLength, y:0}, {x:l/2+leadLength, y:0}], x, y, 0));

        grp.transform({x:x, y:y});
            
        return grp;
    }
    
    C.prototype.capacitor = function(orient, x, y, style){
            
        var leadLength = 16,
            h = 20,
            w;
            
        if (typeof style === 'undefined')
            style = 'unpol';
            
        var grp = this.dc.group();
        
        if (style === 'unpol') {
            w = 7;
            grp.line(-w/2, h/2, -w/2, -h/2).stroke({width: 3});
            grp.line(w/2, h/2, w/2, -h/2).stroke({width: 3});
        } else if (style === 'pol') {
            w = 11;
            grp.line(-w/2, h/2, -w/2, -h/2).stroke({width: 3});
            
            grp.rect(5, h-2)
                .fill('none')
                .stroke({width: 2})
                .cy(0);
        }
        
        w = Math.floor(w/2) * 2; //snap to pixels
        
        grp.line(w/2, 0, w/2 + leadLength, 0).stroke({width: 2});
        grp.line(-w/2, 0, -w/2 - leadLength, 0).stroke({width: 2});
        
        grp.transform({x: x, y: y});
        
        return grp;
            
    }
    
    // simple arrow, x,y being the pointy end, angle is the "maths"
    // convention: degrees anti-clockwise from horizontal, pointing left
    C.prototype.arrow = function(x, y, angle, headOnly, size) {
        var length = 15,
        grp = this.dc.group();
        
        //default size
        if (typeof size == 'undefined') {
            size = {l:7, h:5};
        }
        
        if (!headOnly)
            grp.line(-size.l+1, 0, -length, 0).stroke({width: 2});
        
        grp.polygon('0,0 '
                        + -size.l + ',' + size.h/2 + ' '
                        + -size.l + ',' + -size.h/2 + ' '
                    )
            .fill('black')
            .stroke('none');
            
        grp.translate(x,y).rotate(-angle, x, y);

        return grp;
    }
    
    // draw an arrow on an existing line, pointing to the end or start,
    // and at the given proportion (measured to the arrow point)
    C.prototype.arrowOnLine = function(line, end, pos, size) {
        
        var ax, ay, x, y;
        if (line instanceof SVG.Line)
        {
            x = line.x(),
            y = line.y();
        } else { //array of points
            x = {x1: line[0][0], x2: line[1][0]};
            y = {y1: line[0][1], y2: line[1][1]};
        }
        
        ax = x.x1 + ((x.x2 - x.x1) * pos);
        ay = y.y1 + ((y.y2 - y.y1) * pos);
        
        var angle = Math.atan((y.y1-y.y2)/(x.x2-x.x1))*(180/Math.PI);

        if (!end)
            angle += 180;
        
        return this.arrow(ax, ay, angle, true, size);
    }
    
    C.prototype.diode = function(orient, x, y, type, colour){
            
        var l = 18, h = 18, 
            leadLength = 10;
        
        var grp = this.dc.group()
        
        grp.polygon((-l/2) + ',' + 0 + ' '
                        + (-l/2) + ',' + h/2 + ' '
                        + l/2 + ',' + 0 + ' '
                        + (-l/2) + ',' + (-h/2)
                    )
            .fill(colour ? colour : 'none')
            .stroke({ width: 2 });
            
        //normal diodes have a straight line
        if (type === 'led' || type === 'normal')
            grp.line(l/2, h/2, l/2, -h/2)
                .stroke({width: 2});
                
        if (type === 'led') {
            grp.add(this.arrow(5, -23, 60));
            grp.add(this.arrow(10, -21, 60));
        }
            
        grp.line(l/2, 0, l/2 + leadLength, 0).stroke({width: 2});
        grp.line(-l/2, 0, -l/2 - leadLength, 0).stroke({width: 2});
            
        grp.transform({x: x, y: y});
            
        grp.data('pins', xfrmPts(
            [{x:-l/2-leadLength, y:0}, {x:l/2+leadLength, y:0}], 
            x, y, 0)
        );        
        return grp;
    }
    
    C.prototype.bjt = function (orient, x, y, pnp, circle) {
        var w = 6, h = 12,
            lineH = 8,
            diagOffset = 2;
            leadLength= 10,
            baseLength = 15;
            grp = this.dc.group();
            
        grp.line(-w+0.5, lineH, -w+0.5, -lineH).stroke({width: 3});
        
        grp.polyline([[-w, diagOffset], [w, h], [w, h+leadLength]]).stroke({width: 2}).fill('none');
        grp.polyline([[-w, -diagOffset], [w, -h], [w, -h-leadLength]]).stroke({width: 2}).fill('none');
        grp.line(-w, 0, -w-baseLength, 0).stroke({width: 2});
        
        grp.add(this.arrowOnLine([[-w, diagOffset], [w, h]], !pnp, pnp?0:1, {l:9, h:6}));
            
        if (circle)
            grp.circle(Math.sqrt(w*w + (h+leadLength)*(h+leadLength))+2).fill('none').stroke({width: 2}).center(0,0);
        
        grp.transform({x: x, y: y});
        
        return grp;
    }
    
    C.prototype.logic = function(orient, x, y, type, negate) {
        var l = 12, h = 10,
            leadLength = 10;
            leadOffset = 6;
            negDia = 6;
            grp = this.dc.group();
        
        var body
        
        if (type === 'and')
            body = grp.path().M(l-h, h).H(-l).V(-h).H(l-h).a(h,h,90,0,1, {x:0, y:2*h}).Z()
        
        body.fill('none')
            .stroke({width:2});
            
        //bubble
        if (negate)
            grp.circle(negDia).center(l+negDia/2, 0)
                .stroke({width:2})
                .fill('none');
            
            
        grp.line(negate ? l+negDia:l, 0, l + leadLength, 0).stroke({width:2});
        
        grp.line(-l, leadOffset, -l-leadLength, leadOffset).stroke({width:2});
        grp.line(-l, -leadOffset, -l-leadLength, -leadOffset).stroke({width:2});
            
        grp.transform({x: x, y: y});
        
        return grp; 
    }
    
    return C;
});

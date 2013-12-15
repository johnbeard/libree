/*
 * Mathematical Averages
 *
 * (c) John Beard 2013
 * Part of LibrEE.org
 *
 * Released under the GPLv3
 * See libree.org/license
 */
define(["../tools/libree_tools"], function(Libree) {
    "use strict"

    var Avg = function() {}

    Avg.arithmeticMean = function(vals) {
        if(vals.length === 0)
            return null;

        var total=0;

        for (var i = 0; i < vals.length; i++) {
            total += vals[i];
        }

        return total/vals.length;
    }

    Avg.geometricMean = function(vals) {
        if(vals.length === 0)
            return null;

        var total=1;

        for (var i=vals.length; i--;) {
            //doesn't make sense for negtive values
            if (vals[i] < 0)
                return null;

            total *= vals[i];
        }

        return Math.pow(total, 1/vals.length);
    }

    Avg.harmonicMean = function(vals) {
        if(vals.length === 0)
            return null;

        var total=0;

        for (var i = 0; i < vals.length; i++) {
            if (vals[i] < 0)
                return null;

            total += 1 / vals[i];
        }

        return (vals.length / total);
    }

    Avg.median = function(vals) {
        if(vals.length === 0)
            return null;

        vals.sort(function(a,b){return a-b});

        if (vals.length % 2) {
            //odd number of elements, this is easy
            return vals[(vals.length + 1)/2 - 1];
        } else {
            //mean of middle two
            return (vals[vals.length/2] + vals[(vals.length/2)-1]) / 2;
        }
    }

    /*!
     * Compute the mode, returning the first one in case of a tie
     */
    Avg.mode = function(vals) {
        if(vals.length === 0)
            return null;

        var elementOccurences = {};
        var maxVal = vals[0];
        var maxCount = 1;

        for(var i = 0; i < vals.length; i++) {
            var el = vals[i];

            if(elementOccurences[el] == null)
                elementOccurences[el] = 1;
            else
                elementOccurences[el]++;

            if(elementOccurences[el] > maxCount) {
                maxVal = el;
                maxCount = elementOccurences[el];
            }
        }

        if (maxCount === 1) //no repeated value
            return null;

        return maxVal;
    }

    Avg.types = {
    'mean-arith': {label: 'Arithmetic mean',
            func: Avg.arithmeticMean,
            formula: '\\frac{x_1 + x_2 + \\cdots + x_n}{n}',
            symbol: '\\bar{x}' },
    'mean-geom': {label: 'Geometric mean',
            func: Avg.geometricMean,
            formula: '\\sqrt[n]{x_1 x_2 \\cdots x_n}' },
    'median': {label: 'Median',
            func: Avg.median,
            formula: '',
            symbol: '\\tilde{x}'},
    'mean-harm': {label: "Harmonic mean",
            func: Avg.harmonicMean,
            formula: '\\frac{n}{\\frac{1}{x_1} + \\frac{1}{x_2} + \\cdots + \\frac{1}{x_n}}',},
    'mode': {label: 'Mode',
            func: Avg.mode,
            formula: '',
            symbol: '\\tilde{x}'},
    }


    return Avg;

});

/**
Copyright (c) 2015 The Chromium Authors. All rights reserved.
Use of this source code is governed by a BSD-style license that can be
found in the LICENSE file.
**/

require("../../base/statistics.js");
require("./rail_interaction_record.js");

'use strict';

global.tr.exportTo('tr.e.rail', function() {
  function RAILScore(opt_irs, opt_rangeOfInterest) {
    this.interactionRecords_ = [];
    if (opt_irs)
      this.interactionRecords_.push.apply(this.interactionRecords_, opt_irs);
    this.rangeOfInterest_ = opt_rangeOfInterest;
    if (!this.rangeOfInterest_ || this.rangeOfInterest_.isEmpty)
      this.rangeOfInterest_ = tr.b.Range.fromExplicitRange(
          -Number.MAX_VALUE, Number.MAX_VALUE);
  };

  RAILScore.prototype = {
    get interactionRecords() {
      return this.interactionRecords_;
    },

    get overallScore() {
      // The design of this algorithm is discussed here: https://goo.gl/Cc0H1z
      // TODO(benjhayden): Make doc public and remove below comment?
      // Until the doc is made public, this is basically a weighted average,
      // where the weights are tunable. The weights are recommended to be higher
      // for lower scores, so that lower scores will bring down the overallScore
      // more than higher scores bring it up. The optional fields provide an
      // opportunity to customize the tunable parameters based on IR type,
      // duration, etc. The continuity and monotonicity of the weighting
      // function are also important characteristics. The weighting function is
      // not composed of meaningful sub-expressions; it is a monolithic
      // combination of the score and tunable parameters, and is open to
      // reformulation.
      // The weighting function is graphed here: https://goo.gl/1blsXW

      function getScore(ir) {
        return ir.railScore;
      }

      function getWeight(ir) {
        // If this IR is not in the range of interest, then remove it from the
        // weightedMean calculation by setting its weight to zero.
        if (!this.rangeOfInterest_.intersectsExplicitRangeExclusive(
              ir.start, ir.end))
          return 0;

        var score = getScore(ir);

        var scale = ir.railScoreScale;
        if (scale === undefined)
          scale = 3;

        var power = ir.railScorePower;
        if (power === undefined)
          power = 0.3;

        var base = ir.railScoreBase;
        if (base === undefined)
          base = Math.exp(1);

        return Math.pow(base, -scale * Math.pow(score, power));
      }

      return tr.b.Statistics.weightedMean(
          this.interactionRecords, getWeight, getScore, this);
    },

    asDict: function() {
      return {
        overallScore: this.overallScore
      };
    }
  };

  RAILScore.fromModel = function(model, opt_rangeOfInterest) {
    var rirs = model.interactionRecords.filter(function(ir) {
      return ir instanceof tr.e.rail.RAILInteractionRecord;
    });

    if (rirs.length === 0)
      return undefined;

    return new RAILScore(rirs, opt_rangeOfInterest);
  };

  return {
    RAILScore: RAILScore
  };
});

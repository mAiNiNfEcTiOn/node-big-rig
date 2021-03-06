/**
Copyright (c) 2015 The Chromium Authors. All rights reserved.
Use of this source code is governed by a BSD-style license that can be
found in the LICENSE file.
**/

require("../../base/units/histogram.js");
require("./rail_interaction_record.js");

'use strict';

/**
 * @fileoverview The Load phase of RAIL.
 */
global.tr.exportTo('tr.e.rail', function() {
  // This histogram represents the number of people who we believe would have
  // comfort with a response level of a certain value. We have set this with
  // just a best-effort guess, though. In #1696, we plan to derive this
  // experimentally.
  var COMFORT_HISTOGRAM = tr.b.u.Histogram.fromDict({
    unit: 'unitless',
    min: 1000,
    max: 60000,
    centralBinWidth: 5900,
    underflowBin: {min: -Number.MAX_VALUE, max: 1000, count: 1000},
    centralBins: [
      {min: 1000, max: 6900, count: 901},
      {min: 6900, max: 12800, count: 574},
      {min: 12800, max: 18700, count: 298},
      {min: 18700, max: 24600, count: 65},
      {min: 24600, max: 30500, count: 35},
      {min: 30500, max: 36400, count: 23},
      {min: 36400, max: 42300, count: 16},
      {min: 42300, max: 48200, count: 10},
      {min: 48200, max: 54100, count: 5},
      {min: 54100, max: 60000, count: 2}
    ],
    overflowBin: {min: 60000, max: Number.MAX_VALUE, count: 0}
  });

  function LoadInteractionRecord(parentModel, start, duration) {
    tr.e.rail.RAILInteractionRecord.call(
        this, parentModel, 'Load', 'rail_load',
        start, duration);

    // |renderProcess| is the renderer process that contains the loading
    // RenderFrame.
    this.renderProcess = undefined;

    // |renderMainThread| is the CrRendererMain thread in the |renderProcess|
    // that contains the loading RenderFrame.
    this.renderMainThread = undefined;

    // |routingId| identifies the loading RenderFrame within the renderer
    // process.
    this.routingId = undefined;

    // |parentRoutingId| identifies the RenderFrame that created and contains
    // the loading RenderFrame.
    this.parentRoutingId = undefined;

    // |loadFinishedEvent|, if present, signals that this is a main frame.
    this.loadFinishedEvent = undefined;

    // Startup LoadIRs do not have renderProcess, routingId, or
    // parentRoutingId. Maybe RenderLoadIR should be a separate class?
  }

  LoadInteractionRecord.prototype = {
    __proto__: tr.e.rail.RAILInteractionRecord.prototype,

    get normalizedUserComfort() {
      return COMFORT_HISTOGRAM.getInterpolatedCountAt(this.duration) /
        COMFORT_HISTOGRAM.maxCount;
    }
  };

  return {
    LoadInteractionRecord: LoadInteractionRecord
  };
});

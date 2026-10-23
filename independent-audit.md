# Independent audit of the failed baseline autoroute

Audited the preserved `outputs/xiao-budget/evidence/routing-failed/circuit.json`, its `route.log` and PCB PNG, and the captured `evidence/routing-timeout/input.simple-route.json`. No circuit source or installed package was edited; no autorouter was started.

## Conclusion

The failed board contains real different-net copper overlaps and same-layer trace crossings. This is not explained by checker false positives, a layer-display illusion, or vias being enlarged during Circuit JSON conversion. The misleading `errors=0` is independently explained by the CLI counting an absent optional SRJ errors array rather than running final DRC. The exact internal phase that first creates each collision cannot be proved from the preserved final output alone.

## Dimensions are preserved

- Captured SRJ requests 0.6 mm via pads / 0.3 mm drills, 0.15 mm trace width, 0.1 mm pad clearance, and 0.3 mm board-edge clearance. Via-in-pad is false.
- All 108 final `pcb_via` records have `outer_diameter=0.6`, `hole_diameter=0.3`.
- All 111 via points embedded in the trace routes also explicitly have `via_diameter=0.6`, `via_hole_diameter=0.3`. Embedded instances can repeat a physical via; these counts need not match.
- Every final wire point has width 0.15 mm.
- The installed capacity-router `getViaDimensions` prefers the explicit pad/drill fields and the Pipeline9 constructor assigns those values to `viaDiameter`/`viaHoleDiameter`. No evidence supports an unrequested via-size override.

Installed versions inspected: core 0.0.2196, capacity-autorouter 0.0.999, CLI 0.1.2400. The cache key says core 0.0.2195, but the recorded baseline was a cache miss. That version-label mismatch does not explain the concrete overlap geometry.

## Independent geometric witnesses

An elementary Python segment-intersection and point-to-rectangle audit is saved in `independent-geometry-audit.py`; complete numeric witnesses are in `independent-geometry-audit.json`. Its calculations do not invoke the tscircuit DRC or bitmap checker.

### Different-net via pads physically overlap

`pcb_via_3` belongs to `source_net_34_0`, D10_MOSI. Its center is (-4.8486163522, -2.7420965414) mm. `pcb_via_12` belongs to `source_net_30_0`, D6_TX, at (-5.2551118949, -2.4938602978) mm.

Center distance is **0.4762980777 mm**. Both pads have 0.3 mm radius, so their copper edge gap is **-0.1237019223 mm**: a 0.1237 mm physical overlap. This exactly agrees with core's `pcb_via_clearance_error_0`. Even a zero-clearance rule cannot accept this geometry. The drill-to-drill edge gap is positive; copper-pad legality must not be inferred from drill clearance alone.

### Via crosses unrelated MCU pads that were present in the input

`pcb_via_5` belongs to D9_MISO at (-3.9717909848, -2.4744718149) mm with a 0.6 mm copper diameter. It overlaps these top-layer RP2040 pads:

| Pad | Signal | Center mm | Size mm | Independently calculated copper gap |
|---|---|---|---|---:|
| pcb_smtpad_49 | GPIO6 / D4_SDA | (-3.424936, -2.700025) | 0.850011 x 0.1999996 | -0.125040 mm |
| pcb_smtpad_50 | GPIO5, intentionally unused | (-3.424936, -2.299975) | 0.850011 x 0.1999996 | -0.157182 mm |

The SRJ includes both obstacles at exactly these positions/sizes, on top copper. Their `connectedTo` aliases do not contain D9_MISO / `source_net_33`. Therefore these examples are not caused by missing pad obstacles, a footprint translation mismatch, or an accidental same-net alias.

### Centerlines of different nets cross on the same copper layer

| Trace pair | Layer | Exact intersection mm | Route segment indices |
|---|---|---|---|
| D10_MOSI `source_net_34_0` / D7_RX `source_net_31_0` | bottom | (-4.0771058932, -1.7860311483) | 27 / 103 |
| D10_MOSI `source_net_34_0` / D0_A0 `source_net_24_0` | bottom | (-2.1757765961, -2.3589180427) | 173 / 46 |
| D7_RX `source_net_31_0` / D6_TX `source_net_30_0` | top | (-4.1397683561, -1.0268224901) | 3 / 20 |

These are mathematical centerline crossings, so a 0.15 mm-wide trace gives real copper contact. They exactly match the core DRC's reported contact centers. Neither bitmap pixel size nor clearance convention is relevant to these witnesses.

### Configured board-edge margin is violated too

The audit finds 27 wire vertices violating the requested 0.3 mm copper-to-board-edge margin. For example D8_SCK at x=8.6809702885 mm on a board whose right edge is x=8.9 mm has only **0.1440297115 mm** copper-edge clearance after subtracting the 0.075 mm trace radius. This is another preserved output constraint failure.

## Why the log says errors=0

The baseline log records `routed_traces=106, jumpers=0, errors=0` after 189.6 seconds. The final Circuit JSON contains 295 error elements: 147 pcb_trace_error, 72 via-trace clearance, 49 pad-pad clearance, 15 via clearance, 11 pad-trace clearance, and 1 placement error. The separate bitmap check reports 163 shorts; the counts have different meanings and should not be compared as identical enumerations.

The CLI's installed `dist/cli/main.js:180748` calls `this.countErrors(outputSrj)` in `handleEnd`. At line 181155, `countErrors` is simply:

```js
const errors = simpleRouteJson?.errors
return Array.isArray(errors) ? errors.length : 0
```

Pipeline9's `getOutputSimpleRouteJson()` returns `{ ...originalSrj, traces }`, with no final DRC `errors` field added. Consequently a missing field displays as zero. That number does not establish copper validity.

The installed core `dist/index.js:140018` and `140055` publishes successful completion when the solver has `solved=true` and `failed=false`; it does not gate that event on final board DRC. Pipeline9's phase loop sets `solved=true` once there is no next stage. Its joint repair stage can finish while recording `regionalB01RepairRemainingDrcIssueCount` / `boundedRegionalRepairPublishedDrcIssueCount` in stats. Post-repair cleanup starts with a clone of its input as `bestRoutes`; it only accepts a changed candidate if valid, so invalid input can remain the unchanged best output when cleanup finishes. These are lifecycle/completion semantics, not a guarantee that all DRC issues are gone.

Relevant extracted package sources are preserved under `work/route-source-audit/`: 1682.ts (Pipeline9), 1679.ts (joint repair), 1624.ts (effort cleanup), 118.ts (via dimensions), and 1616.ts (output conversion).

## What is established and what still needs tracing

Established: requested via/trace dimensions reach the final board; unrelated input obstacles are present for the pad-short witnesses; final geometry is physically invalid; and the printed zero is an absent-array count rather than final validation.

Not established: whether each invalid segment first arises during high-density routing, force improvement, joint repair, or route conversion. The baseline's raw intermediate stage routes and repair stats were not preserved. The currently present `dist/autorouter-debug` metadata describes a different Pipeline7/timeout experiment, so it must not be attributed to this Pipeline9 baseline.

For a root-cause reproduction, retain this exact SRJ and compare immutable route snapshots immediately before/after each Pipeline9 stage plus the raw final simplified traces, running the same independent contact witnesses at each boundary. No new board configuration is needed to prove the existing failure, and reducing via/clearance requirements would not validate these actual same-layer crossings.

# Pipeline9 RP2040 routing failure evidence

This is the preserved **rejected** 17.8 × 21 mm, two-layer RP2040 board from 22 October 2026. It contains 295 DRC error records and 163 separate bitmap short detections. It is not fabrication output. These two counts must not be added or described as independent unique faults.

## Check the captured output without rerouting

```sh
python3 check-observed-geometry.py
python3 -c 'import collections,json; b=json.load(open("board.circuit.json")); c=collections.Counter(x["type"] for x in b if x["type"].endswith("_error")); print(dict(c)); print("DRC error records:",sum(c.values()))'
```

The first command asserts that the preserved invalid geometric witnesses exist. Successful execution means the **bug evidence was verified**, not that this PCB passes DRC. It uses Python standard library geometry, not the tscircuit DRC. It writes `verified-geometry.json` locally.

## Original board build configuration

`input.circuit.tsx`, `components.tsx`, and `imports/` preserve the original TSX project. Its original package.json is included without modification. The observed installed versions were tscircuit 0.0.3003, CLI 0.1.2400, core metadata 0.0.2196, capacity-autorouter 0.0.999. The routing cache key recorded core 0.0.2195; the run was a cache miss. No causal conclusion is drawn from that metadata discrepancy.

To attempt the original build in a disposable copy, install the recorded versions explicitly rather than resolving current latest packages:

```sh
npm install --save-dev --save-exact tscircuit@0.0.3003 @tscircuit/cli@0.1.2400 @tscircuit/core@0.0.2196 @tscircuit/capacity-autorouter@0.0.999
npx tsci build input.circuit.tsx --disable-parts-engine --svgs --pcb-png --autorouter-timeout 300s
```

The recorded run used native local `AutoroutingPipelineSolver9_PreloadedTraceGraph`: 35 connections, 173 obstacles, 106 output traces, 108 final via records. The routing phase took 189.6 seconds; total process duration was 193.822 seconds, exit code 1. A 300-second limit was explicitly selected, not the platform default. No fresh standalone or latest-upstream rerun is claimed by this report.

## Frozen input and provenance

`input.simple-route.json` is the captured same-layout/configuration request from the earlier timeout attempt, byte-identical to that preserved request. The subsequent 300-second baseline log records the same 35 connections, 173 obstacles and input hash fragment `8b6065d5`. Raw intermediate routes from that baseline were not preserved, so the exact first faulty routing/repair/conversion stage is not isolated.

The request contains no existing traces, copper pours, differential-pair or length-matching constraints. It requests 0.15 mm traces, 0.60/0.30 mm via pad/drill, 0.10 mm trace-to-pad clearance, and 0.30 mm board-edge clearance. The TSX and final board output also contain copper pours (24 `pcb_copper_pour` records in the output). The independent contact witnesses use via-pad geometry and trace centerlines, so they do not depend on interpreting those pours. Both trace width and via diameters are preserved in the failed output; the observed failures concern clearance and electrical isolation.

`board.circuit.json` is the original full rejected output (byte-identical to the original file also named `circuit.json`). `route.log`, `shorts.log`, and `time.json` are unchanged captured records. `routing-audit.json` and `independent-geometry-audit.json` hold the measurements. `independent-audit.md` is the unchanged historical audit and retains its original workspace-relative references; the runnable audit above uses the corresponding files in this bundle.

`pcb.png`/`pcb.svg` are the original generated board snapshots. The three PNG crops were made from that snapshot and enlarged with nearest-neighbor scaling; copper geometry was not edited. They are evidence images, not annotated DRC overlays. Checksums of the copied evidence are in `manifest.json`.

import { expect, test } from "bun:test"
import { getSvgFromGraphicsObject } from "graphics-debug"
import { TinyHypergraphPortPointPathingSolver } from "lib/solvers/PortPointPathingSolver/tinyhypergraph/TinyHypergraphPortPointPathingSolver"
import input from "../fixtures/features/portpointpathing/tinyhypergraph-port-bridge-repro-input.json"

type TinyHypergraphParams = ConstructorParameters<
  typeof TinyHypergraphPortPointPathingSolver
>[0]

test("TinyHypergraph port-point pathing reports active search progress", () => {
  const solver = new TinyHypergraphPortPointPathingSolver(
    structuredClone(input) as TinyHypergraphParams,
  )

  solver.step()
  solver.step()

  expect(solver.solved).toBe(false)
  expect(solver.progress).toBeGreaterThan(0)
  expect(solver.progress).toBeLessThan(1)
  expect(getSvgFromGraphicsObject(solver.visualize())).toMatchSvgSnapshot(
    import.meta.path,
  )
})

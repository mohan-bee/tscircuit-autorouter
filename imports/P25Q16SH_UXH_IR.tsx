import type { ChipProps } from "@tscircuit/props"

const pinLabels = {
  pin1: ["N_CS"],
  pin2: ["SO"],
  pin3: ["N_WP"],
  pin4: ["GND"],
  pin5: ["SI"],
  pin6: ["SCLK"],
  pin7: ["N_HOLD","N_RESET"],
  pin8: ["VCC"],
  pin9: ["EP"]
} as const

const pinAttributes = {
  pin4: {requiresGround: true},
  pin8: {requiresPower: true}
} as const

export const P25Q16SH_UXH_IR = (props: ChipProps<typeof pinLabels>) => {
  return (
    <chip
      pinLabels={pinLabels}
      pinAttributes={pinAttributes}
      supplierPartNumbers={{
  "jlcpcb": [
    "C7466821"
  ]
}}
      manufacturerPartNumber="P25Q16SH-UXH-IR"
      footprint={<footprint>
        <smtpad portHints={["pin1"]} pcbX="-0.750062mm" pcbY="-1.299972mm" width="0.2999994mm" height="0.5999988mm" shape="rect" />
<smtpad portHints={["pin2"]} pcbX="-0.249936mm" pcbY="-1.299972mm" width="0.2999994mm" height="0.5999988mm" shape="rect" />
<smtpad portHints={["pin3"]} pcbX="0.249936mm" pcbY="-1.299972mm" width="0.2999994mm" height="0.5999988mm" shape="rect" />
<smtpad portHints={["pin4"]} pcbX="0.750062mm" pcbY="-1.299972mm" width="0.2999994mm" height="0.5999988mm" shape="rect" />
<smtpad portHints={["pin5"]} pcbX="0.750062mm" pcbY="1.299972mm" width="0.2999994mm" height="0.5999988mm" shape="rect" />
<smtpad portHints={["pin6"]} pcbX="0.249936mm" pcbY="1.299972mm" width="0.2999994mm" height="0.5999988mm" shape="rect" />
<smtpad portHints={["pin7"]} pcbX="-0.249936mm" pcbY="1.299972mm" width="0.2999994mm" height="0.5999988mm" shape="rect" />
<smtpad portHints={["pin8"]} pcbX="-0.750062mm" pcbY="1.299972mm" width="0.2999994mm" height="0.5999988mm" shape="rect" />
<smtpad portHints={["pin9"]} pcbX="0mm" pcbY="0mm" width="1.7999964mm" height="0.3999992mm" shape="rect" />
<silkscreenpath route={[{"x":1.1506200000000035,"y":1.501139999999964},{"x":1.1506200000000035,"y":-1.5011399999998503}]} />
<silkscreenpath route={[{"x":-1.1404599999999618,"y":1.501139999999964},{"x":-1.1404599999999618,"y":-1.5011399999998503}]} />
<silkscreencircle pcbX="-0.78994mm" pcbY="-1.949958mm" radius="0.100076mm" />
<silkscreentext text="{NAME}" pcbX="0mm" pcbY="2.6002mm" anchorAlignment="center" fontSize="1mm" />
<courtyardoutline outline={[{"x":-1.249998000000005,"y":1.8499714000000722},{"x":1.2499979999998914,"y":1.8499714000000722},{"x":1.2499979999998914,"y":-1.8499714000000722},{"x":-1.249998000000005,"y":-1.8499714000000722},{"x":-1.249998000000005,"y":1.8499714000000722}]} />
      </footprint>}
      cadModel={{
        objUrl: "https://modelcdn.tscircuit.com/easyeda_models/assets/C7466821.obj?uuid=f1853caf7433458693a64b490278be69",
        stepUrl: "https://modelcdn.tscircuit.com/easyeda_models/assets/C7466821.step?uuid=f1853caf7433458693a64b490278be69",
        pcbRotationOffset: 90,
        modelOriginPosition: { x: 0, y: 0, z: 0 },
      }}
      {...props}
    />
  )
}
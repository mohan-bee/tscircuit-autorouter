import { RP2040 } from "./imports/RP2040"
import { P25Q16SH_UXH_IR } from "./imports/P25Q16SH_UXH_IR"
import { AP2112K_3_3TRG1 } from "./imports/AP2112K_3_3TRG1"
import { UsbC, Crystal12MHz, SmallButton, Schottky } from "./components"

const left = ["D0_A0", "D1_A1", "D2_A2", "D3_A3", "D4_SDA", "D5_SCL", "D6_TX"]
const right = ["SYS5V", "GND", "V3V3", "D10_MOSI", "D9_MISO", "D8_SCK", "D7_RX"]
const gpPins = [38, 39, 40, 41, 8, 9, 2, 3, 4, 6, 5]
const gpNets = [...left, "D7_RX", "D8_SCK", "D9_MISO", "D10_MOSI"]
const supply = [1, 10, 22, 33, 42, 43, 44, 48, 49]
const unused = [7, 11, 12, 13, 14, 15, 16, 17, 18, 27, 28, 29, 30, 31, 32, 34, 35, 36, 37] as const
// C9 may serve adjacent USB_VDD and IOVDD pins 48/49, per the hardware guide.
const bypass = [
  ["C1", -5.1, 0.6, 0, "V3V3", "100nF", "top"],
  ["C2", -5.1, -3.5, 180, "V3V3", "100nF", "top"],
  ["C3", 0.4, -5.4, 90, "V3V3", "100nF", "bottom"],
  ["C4", 5.1, -4, 0, "V3V3", "100nF", "bottom"],
  ["C5", 5.1, -1.4, 0, "V3V3", "100nF", "top"],
  ["C6", 5.1, -0.2, 0, "V3V3", "100nF", "top"],
  ["C7", 5.1, 1, 0, "V3V3", "1uF", "top"],
  ["C8", 1.7, 1.8, 90, "V1V1", "1uF", "bottom"],
  ["C9", 0.3, 1.8, 90, "V3V3", "100nF", "bottom"],
  ["C10", -0.2, -0.8, 90, "V1V1", "100nF", "bottom"],
  ["C11", 1.8, -5.4, 90, "V1V1", "100nF", "bottom"],
] as const
const nets: Record<string, string[]> = {
  V3V3: [...supply.map(p => `U1.pin${p}`), "U2.pin8", "U3.pin5", "C15.pin1", "C16.pin1", "R5.pin1", "R6.pin1", ...bypass.filter(c => c[4] === "V3V3").map(c => `${c[0]}.pin1`)],
  V1V1: ["U1.pin45", "U1.pin23", "U1.pin50", ...bypass.filter(c => c[4] === "V1V1").map(c => `${c[0]}.pin1`)],
  GND: ["U1.pin19", "U1.pin57", "U2.pin4", "U3.pin2", "Y1.pin2", "Y1.pin4", "SW1.pin2", "SW2.pin2", "TP3.pin1", "J1.GND1", "J1.GND2", "J1.SHELL1", "J1.SHELL2", "J1.SHELL3", "J1.SHELL4", "R1.pin2", "R2.pin2", ...[12, 13, 14, 15, 16, 17].map(i => `C${i}.pin2`), ...bypass.map(c => `${c[0]}.pin2`)],
  USB_VBUS: ["J1.VBUS1", "J1.VBUS2", "D1.pin2", "C14.pin1"],
  SYS5V: ["D1.pin1", "U3.pin1", "U3.pin3", "C17.pin1"],
  USB_DM: ["J1.DM1", "J1.DM2", "R3.pin1"],
  USB_DP: ["J1.DP1", "J1.DP2", "R4.pin1"],
  MCU_DM: ["R3.pin2", "U1.pin46"], MCU_DP: ["R4.pin2", "U1.pin47"],
  CC1: ["J1.CC1", "R1.pin1"], CC2: ["J1.CC2", "R2.pin1"],
  XIN: ["U1.pin20", "Y1.pin1", "C12.pin1"],
  XOUT: ["U1.pin21", "R7.pin1"], XTAL_OUT: ["R7.pin2", "Y1.pin3", "C13.pin1"],
  QSPI_CS: ["U1.pin56", "U2.pin1", "R5.pin2", "R8.pin1"],
  QSPI_SCLK: ["U1.pin52", "U2.pin6"], QSPI_SD0: ["U1.pin53", "U2.pin5"],
  QSPI_SD1: ["U1.pin55", "U2.pin2"], QSPI_SD2: ["U1.pin54", "U2.pin3"], QSPI_SD3: ["U1.pin51", "U2.pin7"],
  BOOTSEL: ["R8.pin2", "SW1.pin1"], RUN: ["U1.pin26", "R6.pin2", "SW2.pin1"],
  SWCLK: ["U1.pin24", "TP1.pin1"], SWDIO: ["U1.pin25", "TP2.pin1"],
}
gpPins.forEach((pin, i) => { nets[gpNets[i]] = [`U1.pin${pin}`] })
left.forEach((n, i) => nets[n].push(`J2.pin${i + 1}`))
right.forEach((n, i) => nets[n].push(`J3.pin${i + 1}`))

function Header({ name, pins, x, sx }: { name: string; pins: string[]; x: number; sx: number }) {
  return <chip name={name} pcbX={x} pcbY={0} schX={sx} schY={-5} schWidth={name === "J2" ? 1.67 : 1.86} schSectionName="io"
    pinLabels={Object.fromEntries(pins.map((p, i) => [`pin${i + 1}`, p]))}
    schPinArrangement={{ leftSide: { direction: "top-to-bottom", pins: pins.map((_, i) => i + 1) } }}
    footprint={<footprint>
      {pins.map((_, i) => <platedhole portHints={[`pin${i + 1}`]} pcbX={0} pcbY={7.62 - i * 2.54} holeDiameter={0.85} outerDiameter={1.5} shape="circle" />)}
      <courtyardrect width={1.8} height={17.04} pcbX={0} pcbY={0} />
    </footprint>} />
}

export default function XiaoBudget() {
  return <board width={17.8} height={21} layers={2} thickness={1} title="Pico Leaf RP2040 rev A"
    solderMaskColor="green" doubleSidedAssembly minTraceWidth={0.15} defaultTraceWidth={0.15} minTraceToPadEdgeClearance={0.1}
    minViaHoleDiameter={0.3} minViaPadDiameter={0.6} minBoardEdgeClearance={0.3} isViaInPadAllowed
    autorouter={{ local: true, traceClearance: 0.15, allowViaInPad: false }}
    schTraceAutoLabelEnabled schMaxTraceDistance={0.01} pcbStyle={{ silkscreenFontSize: 0.6, silkscreenTextVisibility: "hidden" }}>
    {[ ["usb", "USB-C device"], ["power", "5 V to 3.3 V"], ["mcu", "RP2040"], ["flash", "2 MB QSPI flash"], ["clock", "12 MHz clock"], ["controls", "Boot / reset / debug"], ["io", "XIAO pin mapping"], ["bypass", "Local supply decoupling"] ].map(([name, displayName]) => <schematicsection name={name} displayName={displayName} />)}
    <RP2040 name="U1" pcbX={0} pcbY={-2.5} schX={1} schY={-6} schHeight={6.4} schSectionName="mcu" noConnect={unused.map(p => `pin${p}` as const)} />
    <P25Q16SH_UXH_IR name="U2" pcbX={-2.4} pcbY={1.8} pcbRotation={90} layer="bottom" schX={20} schY={13} schHeight={1.2} schSectionName="flash" />
    <AP2112K_3_3TRG1 name="U3" pcbX={4.4} pcbY={-8.4} pcbRotation={90} schX={-2} schY={15} schSectionName="power" schHeight={0.8} />
    <UsbC name="J1" pcbX={0} pcbY={6} pcbRotation={180} allowOffBoard schX={-24} schY={14} schSectionName="usb" noConnect={["SBU1", "SBU2"]}  schWidth={1.771} />
    <Header name="J2" pins={left} x={-7.62} sx={19} /><Header name="J3" pins={right} x={7.62} sx={28} />
    <Crystal12MHz name="Y1" pcbX={-2} pcbY={-8.3} schX={-23} schY={-8} schSectionName="clock" />
    <SmallButton name="SW1" pcbX={-3.8} pcbY={-9} layer="bottom" schX={-25} schY={-20} schSectionName="controls" />
    <SmallButton name="SW2" pcbX={3.8} pcbY={-9} layer="bottom" schX={-17} schY={-20} schSectionName="controls" />
    <resistor name="R1" resistance="5.1k" footprint="0402" pcbX={-2.1} pcbY={6.2} pcbRotation={90} layer="bottom" schX={-18} schY={16} schSectionName="usb" schOrientation="vertical" />
    <resistor name="R2" resistance="5.1k" footprint="0402" pcbX={2.1} pcbY={6} pcbRotation={90} layer="bottom" schX={-13} schY={16} schSectionName="usb" schOrientation="vertical" />
    <resistor name="R3" resistance="27" footprint="0402" pcbX={-0.5} pcbY={2.25} schX={-18} schY={11.5} schSectionName="usb" />
    <resistor name="R4" resistance="27" footprint="0402" pcbX={2.1} pcbY={2.25} schX={-18} schY={10.1} schSectionName="usb" />
    <resistor name="R5" resistance="10k" footprint="0402" pcbX={-2.7} pcbY={4.2} pcbRotation={90} layer="bottom" schX={17} schY={19} schSectionName="flash"  schRotation={-90} />
    <resistor name="R6" resistance="10k" footprint="0402" pcbX={2.6} pcbY={-3.8} layer="bottom" schX={-9} schY={-20} schSectionName="controls"  schRotation={-90} />
    <resistor name="R7" resistance="1k" footprint="0402" pcbX={-1.3} pcbY={-6} pcbRotation={180} layer="bottom" schX={-17} schY={-8} schSectionName="clock" />
    <resistor name="R8" resistance="1k" footprint="0402" pcbX={-5.8} pcbY={1.1} pcbRotation={90} layer="bottom" schX={-25} schY={-16} schSectionName="controls" />
    <Schottky name="D1" pcbX={5.65} pcbY={1.6} pcbRotation={90} layer="bottom" schX={-6} schY={19} schSectionName="power" />
    {bypass.map((c, i) => <capacitor key={c[0]} name={c[0]} capacitance={c[5]} footprint="0402" pcbX={c[1]} pcbY={c[2]} pcbRotation={c[3]} layer={c[6]} schX={-8 + bypass.filter(b => b[4] === c[4]).findIndex(b => b[0] === c[0]) * 1.8} schY={c[4] === "V3V3" ? -29 : -34} schOrientation="vertical" schSectionName="bypass" />)}
    <capacitor name="C12" capacitance="15pF" footprint="0402" pcbX={-5.5} pcbY={-8.2} schX={-26} schY={-12} schOrientation="vertical" schSectionName="clock" />
    <capacitor name="C13" capacitance="15pF" footprint="0402" pcbX={0.9} pcbY={-7.8} pcbRotation={270} schX={-18} schY={-12} schOrientation="vertical" schSectionName="clock" />
    <capacitor name="C14" capacitance="1uF" footprint="0402" pcbX={0} pcbY={7.2} layer="bottom" schX={-13} schY={7} schOrientation="vertical" schSectionName="usb" />
    <capacitor name="C15" capacitance="4.7uF" footprint="0603" pcbX={5.4} pcbY={-4.4} pcbRotation={90} schX={6.4} schY={-29} schOrientation="vertical" schSectionName={"bypass"} />
    <capacitor name="C16" capacitance="100nF" footprint="0402" pcbX={-0.9} pcbY={4.4} pcbRotation={90} layer="bottom" schX={8.2} schY={-29} schOrientation="vertical" schSectionName={"bypass"} />
    <capacitor name="C17" capacitance="1uF" footprint="0402" pcbX={1.2} pcbY={-9.7} pcbRotation={180} schX={-6} schY={13} schOrientation="vertical" schSectionName="power" />
    {["TP1", "TP2", "TP3"].map((name, i) => <testpoint key={name} name={name} pcbX={-1.3 + i * 1.3} pcbY={-7.2} padDiameter={0.8} footprintVariant="pad" layer="bottom" schX={-25 + 8 * i} schY={-24} schSectionName="controls" />)}
    {Object.entries(nets).map(([name, endpoints]) => <group key={name} name={`N_${name}`}><net name={name} isPowerNet={["V3V3", "V1V1", "SYS5V", "USB_VBUS"].includes(name)} />{endpoints.map((ep, i) => <trace key={ep} name={`${name}_${i}`} from={ep} to={`net.${name}`} schDisplayLabel={name} />)}</group>)}
    {[-0.8, 0, 0.8].map((x, i) => <via name={`VG${i + 1}`} pcbX={x} pcbY={-2.5} fromLayer="top" toLayer="bottom" holeDiameter={0.3} outerDiameter={0.6} connectsTo="net.GND" tented="bottom_tented" />)}
    <copperpour name="GND_TOP" layer="top" connectsTo="net.GND" clearance={0.15} boardEdgeMargin={0.3} coveredWithSolderMask />
    <copperpour name="GND_BOTTOM" layer="bottom" connectsTo="net.GND" clearance={0.15} boardEdgeMargin={0.3} coveredWithSolderMask />
    <silkscreentext text="LEAF RP2040 A" pcbX={0} pcbY={8.8} layer="bottom" fontSize={0.6} />
  </board>
}

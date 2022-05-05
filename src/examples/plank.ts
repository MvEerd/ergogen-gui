import {ConfigExample} from "./index";

const Reviung41: ConfigExample = {
    label: "Plank (ortholinear, 2u space)",
    author: "cache.works",
    value: `units:
  visual_x: 17.5
  visual_y: 16.5
points:
  zones:
    matrix:
      columns:
        one:
          key:
            column_net: P1
            column_mark: 1
        two:
          spread: 1cx
          key:
            column_net: P0
            column_mark: 2
        three:
          spread: 1cx
          key:
            column_net: P14
            column_mark: 3
        four:
          spread: 1cx
          key:
            column_net: P20
            column_mark: 4
        five:
          spread:  1cx
          key:
            column_net: P2
            column_mark: 5
        six:
          spread:  1cx
          key:
            column_net: P3
            column_mark: 6
        seven:
          spread:  1cx
          key:
            column_net: P4
            column_mark: 7
          rows:
            2uspacebar:
              skip: false
              shift: [-0.5cx, 1cy]
              rotate: 180
        eight:
          spread:  1cx
          key:
            column_net: P5
            column_mark: 8
        nine:
          spread:  1cx
          key:
            column_net: P6
            column_mark: 9
        ten:
          spread:  1cx
          key:
            column_net: P7
            column_mark: 10
        eleven:
          spread:  1cx
          key:
            column_net: P8
            column_mark: 11
        twelve:
          spread:  1cx
          key:
            column_net: P9
            column_mark: 12
      rows:
        2uspacebar:
          padding: 1cy
          row_net: P19
          skip: true
        modrow:
          padding: 1cy
          row_net: P19
        bottom:
          padding: 1cy
          row_net: P18
        home:
          padding: 1cy
          row_net: P15
        top:
          padding: 1cy
          row_net: P21
  key:
    bind: 2
    footprints:
      choc:
        type: choc
        anchor:
        nets:
          from: =colrow
          to: =column_net
        params:
          keycaps: true
      diode:
        type: diode
        anchor:
          rotate: 0
          shift: [ 0, -4.5 ]
        nets:
          from: =colrow
          to: =row_net
        params:
          via_in_pad: true
          through_hole: false
outlines:
  exports:
    raw:
      - type: keys
        side: left
        size: [1cx,1cy]
        corner: 1
    panel:
      - type: outline
        name: raw
        fillet: 0.5
    switch_cutouts:
      - type: keys
        side: left
        size: 14
        bound: false
    switch_plate:
      main:
        type: outline
        name: panel
        fillet: 0.5
      keyholes:
        type: outline
        name: switch_cutouts
        operation: subtract
pcbs:
  plank:
    outlines:
      main:
        outline: panel
    footprints:
      promicro:
        type: promicro
        anchor:
          ref: matrix_seven_top
          shift: [-0.5cx, 1]
        params:
          orientation: down
      powerswitch:
        type: slider
        anchor:
          ref: matrix_four_top
          shift: [0.5cx, 8.95]
        nets:
          from: RAW
          to: BAT
        params:
          side: B
      jstph:
        type: jstph
        anchor:
          ref: matrix_four_top
          shift: [0.5cx, -1.5cy]
          rotate: 180
        nets:
          pos: BAT
          neg: GND
        params:
          side: B
`
};

export default Reviung41;
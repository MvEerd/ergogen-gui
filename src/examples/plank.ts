import {ConfigExample} from "./index";

const Reviung41: ConfigExample = {
    label: "Plank (ortholinear, 2u space)",
    author: "cache.works",
    value: `
units:
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
          key:
            spread: 1cx
            column_net: P0
            column_mark: 2
        three:
          key:
            spread: 1cx
            column_net: P14
            column_mark: 3
        four:
          key:
            spread: 1cx
            column_net: P20
            column_mark: 4
        five:
          key:
            spread:  1cx
            column_net: P2
            column_mark: 5
        six:
          key:
            spread:  1cx
            column_net: P3
            column_mark: 6
        seven:
          key:
            spread:  1cx
            column_net: P4
            column_mark: 7
          rows:
            2uspacebar:
              skip: false
              shift: [-0.5cx, 1cy]
              rotate: 180
            modrow:
              shift: [-0.5cx, -1cy]
              rotate: 180
        eight:
          key:
            spread:  1cx
            column_net: P5
            column_mark: 8
        nine:
          key:
            spread:  1cx
            column_net: P6
            column_mark: 9
        ten:
          key:
            spread:  1cx
            column_net: P7
            column_mark: 10
        eleven:
          key:
            spread:  1cx
            column_net: P8
            column_mark: 11
        twelve:
          key:
            spread:  1cx
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
outlines:
  raw:
    - what: rectangle
      where: true
      asym: left
      size: [1cx,1cy]
      corner: 1
  panel:
    - what: outline
      name: raw
      fillet: 0.5
  switch_cutouts:
    - what: rectangle
      where: true
      asym: left
      size: 14
      bound: false
  switch_plate:
    main:
      what: outline
      name: panel
      fillet: 0.5
    keyholes:
      what: outline
      name: switch_cutouts
      operation: subtract
pcbs:
  plank:
    outlines:
      main:
        outline: panel
    footprints:
      choc:
        what: choc
        where: true
        params:
          from: "{{colrow}}"
          to: "{{column_net}}"
          keycaps: true
      diode:
        what: diode
        where: true
        adjust:
          rotate: 0
          shift: [ 0, -4.5 ]
        params:
          from: "{{colrow}}"
          to: "{{row_net}}"
          # via_in_pad: true
          # through_hole: false
      promicro:
        what: promicro
        where:
          ref: matrix_seven_top
          shift: [-0.5cx, 1]
        params:
          orientation: down
      powerswitch:
        what: slider
        where:
          ref: matrix_four_top
          shift: [0.5cx, 8.95]
        params:
          from: RAW
          to: BAT
          side: B
      jstph:
        what: jstph
        where:
          ref: matrix_four_top
          shift: [0.5cx, -1.5cy]
          rotate: 180
        params:
          pos: BAT
          neg: GND
          side: B
`
};

export default Reviung41;

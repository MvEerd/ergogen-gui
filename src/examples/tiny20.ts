import {ConfigExample} from "./index";

const Tiny20: ConfigExample = {
    label: "Tiny20",
    author: "enzocoralc",
    value: `
points:
  zones:
    matrix:
      anchor:
        rotate: 5
      columns:
        pinky:
          key:
            spread: 18
            rows:
              bottom:
                column_net: P21
              home:
                column_net: P20
        ring:
          key:
            spread: 18
            splay: -5
            origin: [-12, -19]
            stagger: 16
            rows:
              bottom:
                column_net: P19
              home:
                column_net: P18
        middle:
          key:
            spread: 18
            stagger: 5
            rows:
              bottom:
                column_net: P15
              home:
                column_net: P14
        index:
          key:
            spread: 18
            stagger: -6
            rows:
              bottom:
                column_net: P26
              home:
                column_net: P10
      rows:
        bottom:
          padding: 17
        home:
          padding: 17
    thumb:
      anchor:
        ref: matrix_index_bottom
        shift: [2, -20]
        rotate: 90
      columns:
        near:
          key:
            splay: -90
            origin: [0,0]
          rows:
            home:
              rotate: -90
              column_net: P8
        home:
          key:
            spread: 17
            rotate: 90
            origin: [0,0]
          rows:
            home:
              column_net: P9
  key:
    footprints:
      choc:
        type: choc
        nets:
          from: GND
          to: =column_net
        params:
          keycaps: true
          reverse: true
          hotswap: false

outlines:
  plate:
    - what: rectangle
      where: true
      asym: source
      size: 18
      corner: 3
    - what: rectangle
      where: true
      asym: source
      size: 14
      bound: false
      operation: subtract
  pcb_perimeter_raw:
    - what: rectangle
      where: true
      asym: source
      size: 18
      corner: 1
  polygon:
    - what: polygon # all borders
      operation: stack
      points:
        - ref: matrix_pinky_bottom
          shift: [-9,-9]
        - ref: matrix_pinky_home
          shift: [-9,1.3u]
        - ref: matrix_middle_home
          shift: [-9,9]
        - ref: matrix_middle_home
          shift: [9,9]
        - ref: matrix_index_home
          shift: [1.45u,9]
        - ref: thumb_home_home
          shift: [8,-9]
        - ref: thumb_near_home
          shift: [9,-9]
  pcb_perimeter:
    - what: outline # keys
      name: pcb_perimeter_raw
    - what: outline
      name: polygon
      operation: add

pcbs:
  tiny20:
    outlines:
      main:
        outline: pcb_perimeter
    footprints:
      keys:
        what: choc
        where: true
        params:
          from: GND
          to: =column_net
          keycaps: true
          reverse: true
          hotswap: false
      promicro:
        what: promicro
        where:
          ref: matrix_index_home
          shift: [0.95u, -0.5u]
          rotate: -90
        params:
          orientation: down
      trrs:
        what: trrs
        where:
          ref: matrix_pinky_home
          shift: [2, 1.1u]
          rotate: 0
        params:
          A: GND
          B: GND
          C: P1
          D: VCC
          reverse: true
          symmetric: true
      reset:
        what: button
        where:
          ref:
            - matrix_ring_home
          shift: [-0.7u, 0]
          rotate: 90
        params:
          from: RST
          to: GND
      resetbottom:
        what: button
        where:
          ref:
            - matrix_ring_home
          shift: [-0.7u, 0]
          rotate: 90
        params:
          from: RST
          to: GND
          side: B
`
};

export default Tiny20;

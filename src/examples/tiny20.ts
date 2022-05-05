import {ConfigExample} from "./index";

const Tiny20: ConfigExample = {
    label: "Tiny20",
    author: "enzocoralc",
    value: `points:
  zones:
    matrix:
      anchor:
        rotate: 5
      columns:
        pinky:
          spread: 18
          rows:
            bottom:
              column_net: P21
            home:
              column_net: P20
        ring:
          spread: 18
          rotate: -5
          origin: [-12, -19]
          stagger: 16
          rows:
            bottom:
              column_net: P19
            home:
              column_net: P18
        middle:
          spread: 18
          stagger: 5
          rows:
            bottom:
              column_net: P15
            home:
              column_net: P14
        index:
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
          rotate: -90
          origin: [0,0]
          rows:
            home:
              rotate: -90
              column_net: P8
        home:
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
  exports:
    plate:
      - type: keys
        side: left
        size: 18
        corner: 3
      - type: keys
        side: left
        size: 14
        bound: false
        operation: subtract
    pcb_perimeter_raw:
      - type: keys
        side: left
        size: 18
        corner: 1
    polygon:
      - type: polygon # all borders
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
      - type: outline # keys
        name: pcb_perimeter_raw
      - type: outline
        name: polygon
        operation: add
pcbs:
  tiny20:
    outlines:
      main:
        outline: pcb_perimeter
    footprints:
      promicro:
        type: promicro
        anchor:
          ref: matrix_index_home
          shift: [0.95u, -0.5u]
          rotate: -90
        params:
          orientation: down
      trrs:
        type: trrs
        nets:
          A: GND
          B: GND
          C: P1
          D: VCC
        anchor:
          ref: matrix_pinky_home
          shift: [2, 1.1u]
          rotate: 0
        params:
          reverse: true
          symmetric: true
      reset:
        type: button
        anchor:
          ref:
            - matrix_ring_home
          shift: [-0.7u, 0]
          rotate: 90
        nets:
          from: RST
          to: GND
      resetbottom:
        type: button
        anchor:
          ref:
            - matrix_ring_home
          shift: [-0.7u, 0]
          rotate: 90
        nets:
          from: RST
          to: GND
        params:
          side: B`
};

export default Tiny20;
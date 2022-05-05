import {ConfigExample} from "./index";

const Reviung41: ConfigExample = {
    label: "Reviung41 (simplified)",
    author: "jcmkk3",
    value: `units:
  # \`U\` is a predefined unit of measure that means 19.05mm, which is MX spacing
  angle: -8
points:
  zones:
    matrix:
      rotate: angle
      mirror: &mirror
        ref: matrix_inner_bottom
        shift: [0, -U]
        distance: 2.25U
      columns:
        outer:
          key:
            column_net: P4
            mirror.column_net: P9
        pinky:
          stagger: 0.25U
          key:
            column_net: P5
            mirror.column_net: P8
        ring:
          stagger: 0.25U
          key:
            column_net: P6
            mirror.column_net: P7
        middle:
          stagger: 0.25U
          key:
            column_net: P7
            mirror.column_net: P6
        index:
          stagger: -0.25U
          key:
            column_net: P8
            mirror.column_net: P5
        inner:
          stagger: -0.25U
          key:
            column_net: P9
            mirror.column_net: P4
      rows:
        bottom:
          padding: U
          row_net: P21
          mirror.row_net: P18
        home:
          padding: U
          row_net: P20
          mirror.row_net: P15
        top:
          padding: U
          row_net: P19
          mirror.row_net: P14
    thumb_middle:
      anchor:
        ref: [matrix_inner_bottom, mirror_matrix_inner_bottom]
        shift: [0, -1.15U]
      key:
        name: thumb_middle
        width: 2.25
        row_net: P16
        column_net: P6
    thumb_reachy:
      mirror: *mirror
      anchor:
        ref: thumb_middle
        shift: [-3.5U / 2 - 2 , 0.12U]
        rotate: angle
      key:
        name: thumb_reachy
        width: 1.25
        row_net: P16
        column_net: P20
        mirror.column_net: P15 
    thumb_tucky:
      mirror: *mirror
      anchor:
        ref: thumb_reachy
        shift: [-1.25U - 2, 0.4U]
        rotate: -angle
      key:
        name: thumb_tucky
        width: 1.25
        row_net: P16
        column_net: P21
        mirror.column_net: P14
  key:
    footprints:
      - type: mx
        nets:
          from: =row_net
          to: =column_net
        params.keycaps: true
      - type: diode
        anchor:
          shift: [0, -4.7]
        nets:
          from: =row_net
          to: =colrow
pcbs:
  simple_reviung41:
    footprints:
      - type: promicro
        anchor:
          - ref: [matrix_inner_top, mirror_matrix_inner_top]
            shift: [0, 22]
            rotate: angle`
};

export default Reviung41;
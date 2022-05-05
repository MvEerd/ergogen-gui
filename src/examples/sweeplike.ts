import {ConfigExample} from "./index";

const Sweeplike: ConfigExample = {
    label: "Sweep-like (minimal)",
    author: "jcmkk3",
    value: `# \`U\` is a predefined unit of measure that means 19.05mm, which is MX spacing
points:
  zones:
    matrix:
      columns:
        pinky:
        ring.stagger: 0.66U
        middle.stagger: 0.25U
        index.stagger: -0.25U
        inner.stagger: -0.15U
      rows:
        bottom.padding: U
        home.padding: U
        top.padding: U
    thumb:
      anchor:
        ref: matrix_index_bottom
        shift: [0.66U, -1.25U]
        rotate: -10
      columns:
        tucky:
          key.name: thumb_tucky
        reachy:
          spread: U
          rotate: -15
          origin: [-0.5U, -0.5U]
          key.name: thumb_reachy
  key:
    footprints:
      - type: mx
        nets:
          from: GND
          to: =name
        params:
          reverse: true
          keycaps: true
pcbs:
  simple_split:
    footprints:
      - type: promicro
        anchor:
          - ref: matrix_inner_home
            shift: [1U, 0.5U]
            rotate: -90
        nets:
          P7: matrix_pinky_top
          P18: matrix_ring_top
          P19: matrix_middle_top
          P20: matrix_index_top
          P21: matrix_inner_top
          P15: matrix_pinky_home
          P14: matrix_ring_home
          P16: matrix_middle_home
          P10: matrix_index_home
          P1: matrix_inner_home
          P2: matrix_pinky_bottom
          P3: matrix_ring_bottom
          P4: matrix_middle_bottom
          P5: matrix_index_bottom
          P6: matrix_inner_bottom
          P8: thumb_tucky
          P9: thumb_reachy
`
};

export default Sweeplike;
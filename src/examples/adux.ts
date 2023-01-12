import {ConfigExample} from "./index";

const ADux: ConfigExample = {
    label: "A. dux",
    author: "tapioki",
    value: `
points:
  zones:
    matrix:
      columns:
        pinky:
          key:
            spread: 18
            splay: 15
            origin: [0, -17]
          rows:
            bottom:
              bind: [5, 0, 0, 0]
              column_net: P7
            home:
              bind: [0, 12, 0, 0]
              column_net: P6
            top:
              bind: [0, 8, 5, 0]
              column_net: P5 
        ring:
          key:
            spread: 18
            stagger: 17
            splay: -10
            origin: [0, -17]
          rows:
            bottom:
              bind: [0, 0, 2, 10]
              column_net: P4
            home:
              bind: [5, 0, 5, 0]
              column_net: P3
            top:
              bind: [0, 6, 0, 0]
              column_net: P0
        middle:
          key:
            shift: [0.2, 0]
            spread: 18
            stagger: 17/3
            splay: -5
            origin: [0, -17]
          rows:
            bottom:
              bind: [0, 10, 0, 5]
              column_net: P1
            home:
              bind: 5
              column_net: P19
            top:
              bind: [0, 0, 0, 0]
              column_net: P18
        index:
          key:
            spread: 18
            stagger: -17/3
            splay: -5
            origin: [0, -17]
          rows:
            bottom:
              bind: [0, 5, 0, 0]
              column_net: P15
            home:
              bind: [5, 0, 5, 0]
              column_net: P14
            top:
              bind: [0, 0, 0, 6]
              column_net: P16
        inner:
          key:
            spread: 18
            stagger: -17/6
            origin: [0, -17]
          rows: 
            bottom:
              bind: [5, 19, 20, 2]
              column_net: P10
            home:
              bind: [0, 27, 0, 5]
              column_net: P20
            top:
              bind: [0, 0, 5, 5]
              column_net: P21
      rows:
        bottom:
          padding: 17
        home:
          padding: 17
        top:
    thumb:
      anchor:
        ref: matrix_inner_bottom
        shift: [0,-24]
      columns:
        first:
          key:
            splay: -15
          rows:
            only:
              column_net: P8
              bind: [10, 1, 0, 70]
        second:
          key:
            spread: 18
            splay: -10
            origin: [-9, -9.5]
          rows:
            only:
              column_net: P9
              bind: [0, 0, 0, 5]
      rows:
        only:
          padding: 17
      key:
        footprints:
outlines:
  raw:
    - what: rectangle
      where: true
      bound: true
      asym: left
      size: [18,17]
      corner: 1
  first:
    - what: outline
      name: raw
      fillet: 3
  second:
    - what: outline
      name: first
      fillet: 2
  third:
    - what: outline
      name: second
      fillet: 1
  panel:
    - what: outline
      name: third
      fillet: 0.5
pcbs:
  architeuthis_dux:
    outlines:
      main:
        outline: panel
    footprints:
      choc_hotswap:
        what: choc
        where: true
        params:
          from: =column_net
          to: GND
          keycaps: true
          reverse: true
          hotswap: true
      choc:
        what: choc
        where: true
        adjust:
          rotate: 180
        params:
          from: =column_net
          to: GND
          keycaps: true
          reverse: true
      promicro:
        what: promicro
        where:
          ref: matrix_inner_home
          shift: [19, -8.5]
          rotate: -90
        params:
          orientation: down
      trrs:
        what: trrs
        where:
          ref: matrix_inner_home
          shift: [34.75, 6.5]
        params:
          A: GND
          B: GND
          C: P2
          D: VCC
          reverse: true
          symmetric: true
`
};

export default ADux;

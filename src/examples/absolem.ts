import {ConfigExample} from "./index";

const Absolem: ConfigExample = {
    label: "Absolem (simplified)",
    author: "MrZealot",
    value: `points:
  zones:
    matrix:
      anchor:
        rotate: 5
      columns:
        pinky:
        ring:
          rotate: -5
          origin: [-12, -19]
          stagger: 12
        middle:
          stagger: 5
        index:
          stagger: -6
        inner:
          stagger: -2
      rows:
        bottom:
        home:
        top:
    thumbfan:
      anchor:
        ref: matrix_inner_bottom
        shift: [-7, -19]
      columns:
        near:
        home:
          spread: 21.25
          rotate: -28
          origin: [-11.75, -9]
        far:
          spread: 21.25
          rotate: -28
          origin: [-9.5, -9]
      rows:
        thumb:
  rotate: -20
  mirror:
    ref: matrix_pinky_home
    distance: 223.7529778`
};

export default Absolem;
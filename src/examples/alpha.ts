import {ConfigExample} from "./index";

const Alpha: ConfigExample = {
    label: "Alpha (staggered bottom row)",
    author: "jcmkk3",
    value: `points:
  mirror:
    ref: ortho_inner_home
    distance: 1U
  zones:
    ortho:
      columns:
        pinky:
        ring:
        middle:
        index:
        inner:
      rows:
        home.padding: 1U
        top.padding: 1U
    stagger:
      anchor:
        ref: ortho_pinky_home
        shift: [0.5U, -1U]
      columns:
        pinky:
        ring:
        middle:
        index:
          key.asym: left
        space:
          spread: 0.5U
          key:
            asym: right
            width: 2
      rows:
        bottom.padding: 1U`
};

export default Alpha;
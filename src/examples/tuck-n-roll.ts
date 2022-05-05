const TuckNRoll: string = `points:
  rotate: 0
  zones:
    matrix:
      columns:
        pinky:
          origin: [ 0, -1cy ]
          rotate: 19  # 19 degrees cumulative
          stagger: 0 # affects distance to previous column so useless for a left pinky column
          spread: 0 # affects distance to previous column so useless for a left pinky column
          key:
            column_net: P4
            column_mark: P
        ring:
          origin: [ 0, -1cy ]
          rotate: -4 # 15 degrees cumulative
          stagger: 10
          spread: 23
          key:
            column_net: P5
            column_mark: R
        middle:
          origin: [ 0, -1cy ]
          rotate: -10 # 5 degrees cumulative
          stagger: -1
          spread: 18
          key:
            column_net: P6
            column_mark: M
        index:
          origin: [ 0, -1cy ]
          rotate: -5 # 0 degrees cumulative
          stagger: -3
          spread: 20
          key:
            column_net: P21
            column_mark: IN
        inner:
          origin: [ 0, -1cy ]
          rotate: 0
          stagger: -1
          key:
            column_net: P20
            column_mark: I
      rows:
        bottom:
          padding: 1cy
          row_net: P16
        home:
          padding: 1cy
          row_net: P10
        top:
          padding: 1cy
          row_net: P18
    thumbfan:
      anchor:
        ref: matrix_inner_bottom
        shift: [ -3, -22 ]
      columns:
        near:
          rotate: -15
          key:
            column_net: P6
            column_mark: M
        home:
          spread: 19
          rotate: -10 # -25 degrees cumulative
          origin: [-9.5, -9]
          key:
            column_net: P5
            column_mark: R
        far:
          spread: 19
          rotate: -10 # 35 degrees cumulative
          origin: [-9.5, -9]
          key:
            column_net: P4
            column_mark: P
      rows:
        thumb:
          padding: 0
          row_net: P7`;

export default TuckNRoll;
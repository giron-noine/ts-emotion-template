// 垂線の足の座標を求める
// polygon内で利用

type Props = {
  line_point_dict1: {
    x: number;
    y: number;
  };
  line_point_dict2: {
    x: number;
    y: number;
  };
  point_dict: {
    x: number;
    y: number;
  };
};

const CalculateLineSegmentLeg = ({
  line_point_dict1,
  line_point_dict2,
  point_dict,
}: Props) => {
  let C_num =
    (point_dict.x - line_point_dict1.x) *
      (line_point_dict2.x - line_point_dict1.x) +
    (point_dict.y - line_point_dict1.y) *
      (line_point_dict2.y - line_point_dict1.y);
  let C_den =
    (line_point_dict2.x - line_point_dict1.x) ** 2 +
    (line_point_dict2.y - line_point_dict1.y) ** 2;
  let leg_x =
    line_point_dict1.x +
    (C_num / C_den) * (line_point_dict2.x - line_point_dict1.x);
  let leg_y =
    line_point_dict1.y +
    (C_num / C_den) * (line_point_dict2.y - line_point_dict1.y);
  return { x: leg_x, y: leg_y };
};

export default CalculateLineSegmentLeg;

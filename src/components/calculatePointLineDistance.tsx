// 二点を通る直線とある点の距離
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

const CalculatePointLineDistance = ({
  line_point_dict1,
  line_point_dict2,
  point_dict,
}: Props) => {
  let num = Math.abs(
    (line_point_dict1.x - point_dict.x) * (line_point_dict2.y - point_dict.y) +
      (line_point_dict2.x - point_dict.x) * (line_point_dict1.y - point_dict.y)
  );
  let den = Math.sqrt(
    (line_point_dict2.x - line_point_dict1.x) ** 2 +
      (line_point_dict2.y - line_point_dict1.y) ** 2
  );
  return num / den;
};

export default CalculatePointLineDistance;

// 二点の距離計算
// polygon内で利用

type Props = {
  point_dict1: {
    x: number;
    y: number;
  };
  point_dict2: {
    x: number;
    y: number;
  };
};

const CalculatePointDistance = ({ point_dict1, point_dict2 }: Props) => {
  return Math.sqrt(
    (point_dict1.x - point_dict2.x) ** 2 + (point_dict1.y - point_dict2.y) ** 2
  );
};

export default CalculatePointDistance;

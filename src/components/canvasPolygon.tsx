import CalculateLineSegmentLeg from "./calculateLineSegmentLeg";
import CalculatePointDistance from "./calculatePointDistance";
import CalculatePointLineDistance from "./calculatePointLineDistance";

class CanvasPolygon {
  canvas: any;
  ctx: any;
  roi_polygon_pos_list: { x: number; y: number }[];
  is_roi_polygon_closed: boolean;
  roi_point_index: number | null;
  clicked: boolean;
  pixel_ratio_display_over_true_x: number;
  pixel_ratio_display_over_true_y: number;
  is_active: boolean;
  text: string;

  constructor(canvas, ctx) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.roi_polygon_pos_list = []; //　多角形の点のリスト XY座標のオブジェクトを配列として格納
    this.is_roi_polygon_closed = false; //多角形が閉じているかどうか
    this.roi_point_index = null; // 現在選択している点のインデックス
    this.clicked = false; //　ダブルクリックの判定に使う

    this.pixel_ratio_display_over_true_x = 1.0;
    this.pixel_ratio_display_over_true_y = 1.0;
    this.is_active = true;
    this.text = "1";
  }

  initialize() {
    // 各プロパティの初期化
    this.roi_polygon_pos_list = [];
    this.is_roi_polygon_closed = false;
    this.roi_point_index = null;
    this.clicked = false;
  }

  // 左クリックをしたときの挙動
  // ポリゴンが閉じているか判定
  // 閉じている場合の挙動と閉じていないときの挙動

  onSingleLeftClick(e: MouseEvent) {
    console.log("left single clicked");
    console.log(this.roi_point_index);
    let offsetX = e.offsetX; // =>canvas要素の左上からのx座標
    let offsetY = e.offsetY; // =>canvas要素の左上からのy座標

    if (this.is_roi_polygon_closed) {
      // ポリゴンが閉じていた場合，新しいポリゴンの始点を選択する．
      if (this.roi_point_index == null) {
        // 既存の点が選択されていない場合は新しく座標をリストに追加する
        this.is_roi_polygon_closed = false; // ポリゴンの開放
        this.roi_polygon_pos_list = []; // リストの初期化
        this.roi_polygon_pos_list.push({
          x: Math.round(offsetX / this.pixel_ratio_display_over_true_x),
          y: Math.round(offsetY / this.pixel_ratio_display_over_true_y),
        });
      } else {
        // 既存の点が選択されている場合はその座標を取得して上書きして動かす
        this.roi_polygon_pos_list[this.roi_point_index].x = Math.round(
          offsetX / this.pixel_ratio_display_over_true_x
        );
        this.roi_polygon_pos_list[this.roi_point_index].y = Math.round(
          offsetY / this.pixel_ratio_display_over_true_y
        );
        this.roi_point_index = null; // 選択が終了
      }
    } else {
      // 閉じていなかった場合，クリックした座標をリストに追加していく
      this.roi_polygon_pos_list.push({
        x: Math.round(offsetX / this.pixel_ratio_display_over_true_x),
        y: Math.round(offsetY / this.pixel_ratio_display_over_true_y),
      });
    }
  }

  // 右クリックをしたときの挙動
  _onRightClick(e: MouseEvent) {
    console.log("right clicked");
    let offsetX = e.offsetX; // =>要素左上からのx座標
    let offsetY = e.offsetY; // =>要素左上からのy座標

    let point_dict1 = {
      x: Math.round(offsetX / this.pixel_ratio_display_over_true_x),
      y: Math.round(offsetY / this.pixel_ratio_display_over_true_y),
    };
    let min_distance: number | null = null;
    let min_distance_index: number | null = null;

    // 距離の最小となる点を求める
    for (let index = 0; index < this.roi_polygon_pos_list.length; index++) {
      let point_dict2 = this.roi_polygon_pos_list[index];
      if (index == 0) {
        min_distance = CalculatePointDistance({ point_dict1, point_dict2 });
        min_distance_index = 0;
      } else {
        var distance = CalculatePointDistance({ point_dict1, point_dict2 });
        // null回避のif
        if (min_distance) {
          if (distance < min_distance) {
            min_distance = distance;
            min_distance_index = index;
          }
        }
      }
    }

    this.roi_point_index = null; // ここで一応初期化

    if (this.is_roi_polygon_closed) {
      // ポリゴンが閉じていた場合
      if (min_distance_index != null) {
        // 距離の最小な点が存在する場合
        this.roi_point_index = min_distance_index; // ここでのみ点を選択(このメソッド内で)
      }
    } else {
      // ポリゴンが閉じていない場合
      if (min_distance_index == 0) {
        // 距離の最小な点が開始点の場合，ポリゴンがうまくとじるように調整
        this.roi_polygon_pos_list.push(this.roi_polygon_pos_list[0]); // 最後の点==最初の点
        this.is_roi_polygon_closed = true; // ここでのみポリゴンを閉じる
      }
    }
  }

  onRightClick(e: MouseEvent) {
    if (this.is_active) {
      this._onRightClick(e);
    }
    return false; // 右クリック特有の処理
  }

  _onDoubleLeftClick(e: MouseEvent) {
    console.log("left double clicked");
    let offsetX = e.offsetX; // =>要素左上からのx座標
    let offsetY = e.offsetY; // =>要素左上からのy座標

    let point_dict = {
      x: Math.round(offsetX / this.pixel_ratio_display_over_true_x),
      y: Math.round(offsetY / this.pixel_ratio_display_over_true_y),
    };
    let point_dict2 = point_dict;
    let min_point_line_distance = null;
    let min_point_line_distance_index = null;
    // 距離の計算
    for (let index = 0; index < this.roi_polygon_pos_list.length; index++) {
      if (index == 0) {
        // 最初の場合
        let line_point_dict1 = this.roi_polygon_pos_list[index];
        let line_point_dict2 = this.roi_polygon_pos_list[index + 1];
        // 垂線の足を求める
        let leg_point = CalculateLineSegmentLeg({
          line_point_dict1,
          line_point_dict2,
          point_dict,
        });
        if (
          Math.min(line_point_dict1.x, line_point_dict1.x) <= leg_point["x"] &&
          Math.min(line_point_dict1["y"], line_point_dict1["y"]) <=
            leg_point["y"] &&
          leg_point["x"] <=
            Math.max(line_point_dict1["x"], line_point_dict1["x"]) &&
          leg_point["y"] <=
            Math.max(line_point_dict1["y"], line_point_dict1["y"])
        ) {
          // 垂線の足が線分内にある時
          min_point_line_distance = CalculatePointLineDistance({
            line_point_dict1,
            line_point_dict2,
            point_dict,
          }); // 点と直線の距離
        } else {
          var point_dict1 = {
            x: (line_point_dict1["x"] + line_point_dict2["x"]) / 2,
            y: (line_point_dict1["y"] + line_point_dict2["y"]) / 2,
          }; // 辺の中心点
          min_point_line_distance = CalculatePointDistance({
            point_dict1,
            point_dict2,
          }); // 点と辺の中心点との距離
        }
        min_point_line_distance_index = 0;
      } else if (index != this.roi_polygon_pos_list.length - 1) {
        var line_point_dict1 = this.roi_polygon_pos_list[index];
        var line_point_dict2 = this.roi_polygon_pos_list[index + 1];
        // 垂線の足を求める
        var leg_point = CalculateLineSegmentLeg({
          line_point_dict1,
          line_point_dict2,
          point_dict,
        });
        if (
          Math.min(line_point_dict1["x"], line_point_dict1["x"]) <=
            leg_point["x"] &&
          Math.min(line_point_dict1["y"], line_point_dict1["y"]) <=
            leg_point["y"] &&
          leg_point["x"] <=
            Math.max(line_point_dict1["x"], line_point_dict1["x"]) &&
          leg_point["y"] <=
            Math.max(line_point_dict1["y"], line_point_dict1["y"])
        ) {
          // 垂線の足が線分内にある時
          var point_line_distance = CalculatePointLineDistance({
            line_point_dict1,
            line_point_dict2,
            point_dict,
          }); // 点と直線の距離
        } else {
          var point_dict1 = {
            x: (line_point_dict1["x"] + line_point_dict2["x"]) / 2,
            y: (line_point_dict1["y"] + line_point_dict2["y"]) / 2,
          }; // 辺の中心点
          var point_line_distance = CalculatePointDistance({
            point_dict1,
            point_dict2,
          }); // 点と辺の中心点との距離
        }
        if (min_point_line_distance) {
          if (point_line_distance < min_point_line_distance) {
            min_point_line_distance = point_line_distance;
            min_point_line_distance_index = index;
          }
        }
      }
    }

    if (this.is_roi_polygon_closed) {
      // ポリゴンが閉じている場合
      if (min_point_line_distance_index != null) {
        this.roi_polygon_pos_list.splice(
          min_point_line_distance_index + 1,
          0,
          point_dict
        ); // insertする
        this.roi_point_index = min_point_line_distance_index + 1;
      }
    }
  }

  onDoubleLeftClick(e: MouseEvent) {
    if (this.is_active) {
      this._onDoubleLeftClick(e);
    }
  }

  _onLeftClick(e: MouseEvent) {
    if (this.is_roi_polygon_closed) {
      // ポリゴンが閉じている場合
      // クリックされている場合にさらにクリック
      if (this.clicked) {
        this.clicked = false;
        this.onDoubleLeftClick(e);
        return;
      }
      // シングルクリック
      this.clicked = true;
      let time_outed_func = () => {
        // クリックされていない場合　-> シングルクリック
        if (this.clicked) {
          this.onSingleLeftClick(e);
        }
        this.clicked = false;
      };
      setTimeout(time_outed_func, 200);
    } else {
      //  ポリゴンが閉じていない場合
      this.onSingleLeftClick(e);
      this.clicked = false;
    }
  }

  onLeftClick(e: MouseEvent) {
    if (this.is_active) {
      this._onLeftClick(e);
    }
  }

  clearCanvas() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  _drawPolygon(offsetX: number | null, offsetY: number | null) {
    if (this.is_roi_polygon_closed) {
      // ポリゴンが閉じている場合
      var counter = 0;
      this.ctx.beginPath();
      for (let index = 0; index < this.roi_polygon_pos_list.length; index++) {
        var point_dict = this.roi_polygon_pos_list[index];
        if (counter == 0) {
          // 最初の点のみ
          if (
            counter == this.roi_point_index &&
            offsetX != null &&
            offsetY != null
          ) {
            // 選択している点だった場合
            this.ctx.moveTo(offsetX, offsetY);
          } else {
            this.ctx.moveTo(
              Math.round(
                this.pixel_ratio_display_over_true_x * point_dict["x"]
              ),
              Math.round(this.pixel_ratio_display_over_true_y * point_dict["y"])
            );
          }
        } else if (counter != this.roi_polygon_pos_list.length - 1) {
          // 最初の点・最後の点(最初の点と同じ)以外
          if (
            counter == this.roi_point_index &&
            offsetX != null &&
            offsetY != null
          ) {
            // 選択している点だった場合
            this.ctx.lineTo(offsetX, offsetY);
          } else {
            this.ctx.lineTo(
              Math.round(
                this.pixel_ratio_display_over_true_x * point_dict["x"]
              ),
              Math.round(this.pixel_ratio_display_over_true_y * point_dict["y"])
            );
          }
        }
        counter++;
      }
      this.ctx.closePath();
      if (this.roi_point_index == null) {
        // ポリゴンが確定している場合のみfill描画
        this.ctx.fillStyle = "red";
        this.ctx.globalAlpha = 0.5;
        this.ctx.fill();

        this.ctx.fillText(
          this.text,
          Math.round(
            this.pixel_ratio_display_over_true_x *
              this.roi_polygon_pos_list[0]["x"]
          ),
          Math.round(
            this.pixel_ratio_display_over_true_y *
              this.roi_polygon_pos_list[0]["y"]
          )
        );
      } else {
        this.ctx.strokeStyle = "orange";
        this.ctx.stroke();

        this.ctx.fillStyle = "orange";
        this.ctx.fillText(
          this.text,
          Math.round(
            this.pixel_ratio_display_over_true_x *
              this.roi_polygon_pos_list[0]["x"]
          ),
          Math.round(
            this.pixel_ratio_display_over_true_y *
              this.roi_polygon_pos_list[0]["y"]
          )
        );
      }
    } else {
      // ポリゴンが閉じていない場合
      let counter = 0;
      this.ctx.beginPath();
      for (let index = 0; index < this.roi_polygon_pos_list.length; index++) {
        let point_dict = this.roi_polygon_pos_list[index];
        if (counter == 0) {
          // 最初の点のみ
          this.ctx.moveTo(
            Math.round(this.pixel_ratio_display_over_true_x * point_dict.x),
            Math.round(this.pixel_ratio_display_over_true_y * point_dict.y)
          );
        } else {
          // 最初の点・最後の点以外
          this.ctx.lineTo(
            Math.round(this.pixel_ratio_display_over_true_x * point_dict["x"]),
            Math.round(this.pixel_ratio_display_over_true_y * point_dict["y"])
          );
        }
        counter++;
      }
      this.ctx.lineTo(offsetX, offsetY);
      this.ctx.strokeStyle = "blue";
      this.ctx.stroke();
      if (this.roi_polygon_pos_list.length > 0) {
        this.ctx.fillStyle = "blue";
        this.ctx.fillText(
          this.text,
          Math.round(
            this.pixel_ratio_display_over_true_x *
              this.roi_polygon_pos_list[0]["x"]
          ),
          Math.round(
            this.pixel_ratio_display_over_true_y *
              this.roi_polygon_pos_list[0]["y"]
          )
        );
      }
    }
  }

  drawPolygon(offsetX: number | null, offsetY: number | null) {
    if (this.is_active) {
      this._drawPolygon(offsetX, offsetY);
    }
  }

  _drawPoints(offsetX: number | null, offsetY: number | null) {
    if (this.is_roi_polygon_closed) {
      // ポリゴンが閉じている場合
      for (let index = 0; index < this.roi_polygon_pos_list.length; index++) {
        var point_dict = this.roi_polygon_pos_list[index];
        if (
          index == this.roi_point_index &&
          offsetX != null &&
          offsetY != null
        ) {
          this.ctx.beginPath();
          this.ctx.arc(offsetX, offsetY, 2, 0, 2 * Math.PI, false);
          this.ctx.fillStyle = "red";
          this.ctx.fill();
        } else if (index != this.roi_polygon_pos_list.length - 1) {
          // 最初の点・最後の点(最初の点と同じ)以外
          this.ctx.beginPath();
          this.ctx.arc(
            point_dict["x"],
            point_dict["y"],
            2,
            0,
            2 * Math.PI,
            false
          );
          this.ctx.fillStyle = "red";
          this.ctx.fill();
        }
      }
    } else {
      // ポリゴンが閉じていない場合
      for (let index = 0; index < this.roi_polygon_pos_list.length; index++) {
        let point_dict = this.roi_polygon_pos_list[index];
        this.ctx.beginPath();
        this.ctx.arc(
          point_dict["x"],
          point_dict["y"],
          2,
          0,
          2 * Math.PI,
          false
        );
        this.ctx.fillStyle = "blue";
        this.ctx.fill();
      }
      if (offsetX != null && offsetY != null) {
        this.ctx.beginPath();
        this.ctx.arc(offsetX, offsetY, 2, 0, 2 * Math.PI, false);
        this.ctx.fillStyle = "blue";
        this.ctx.fill();
      }
    }
  }

  drawPoints(offsetX: number | null, offsetY: number | null) {
    if (this.is_active) {
      this._drawPoints(offsetX, offsetY);
    }
  }

  activate() {
    this.is_active = true;
  }

  deactivate() {
    this.is_active = false;
  }
}

export default CanvasPolygon;

<!DOCTYPE html>
<html>
  <head>
    <title>canvas polygon tutorial</title>
    <style>
      #canvas {
        background: #666;
      }
    </style>
  </head>
  <body>
    <canvas id="canvas" width="640" height="480"></canvas>
    <script>

{/* component化した */}
      function calculate_point_distance(point_dict1, point_dict2) { // 二点の距離計算
        // polygon内で利用
        return Math.sqrt((point_dict1["x"]-point_dict2["x"])**2+(point_dict1["y"]-point_dict2["y"])**2)
      }

{/* component化した */}
      function calculate_point_line_distance(line_point_dict1, line_point_dict2, point_dict) { // 二点を通る直線とある点の距離
        // polygon内で利用
        var num = Math.abs(
          (line_point_dict1["x"]-point_dict["x"]) * (line_point_dict2["y"]-point_dict["y"]) +
          (line_point_dict2["x"]-point_dict["x"]) * (line_point_dict1["y"]-point_dict["y"])
        )
        var den = Math.sqrt((line_point_dict2["x"]-line_point_dict1["x"])**2+(line_point_dict2["y"]-line_point_dict1["y"])**2)
        return num/den
      }

{/* component化した */}
      function calculate_line_segment_leg(line_point_dict1, line_point_dict2, point_dict) {// 垂線の足の座標を求める
        // polygon内で利用
        var C_num = (point_dict["x"]-line_point_dict1["x"])*(line_point_dict2["x"]-line_point_dict1["x"]) 
        + (point_dict["y"]-line_point_dict1["y"])*(line_point_dict2["y"]-line_point_dict1["y"]);
        var C_den = (line_point_dict2["x"]-line_point_dict1["x"])**2 + (line_point_dict2["y"]-line_point_dict1["y"])**2
        var leg_x = line_point_dict1["x"] + C_num/C_den*(line_point_dict2["x"]-line_point_dict1["x"])
        var leg_y = line_point_dict1["y"] + C_num/C_den*(line_point_dict2["y"]-line_point_dict1["y"])
        return {"x":leg_x, "y":leg_y}
      }

      class CanvasPolygon{
        constructor (canvas, ctx) {
          this.canvas = canvas;
          this.ctx = ctx;
          this.roi_polygon_pos_list = []; //　多角形の点のリスト
          this.is_roi_polygon_closed = null; //多角形が閉じているかどうか
          this.roi_point_index = null; // 現在選択している点のインデックス
          this.clicked = false; //　ダブルクリックの判定に使う

          this.pixel_ratio_display_over_true_x = 1.0;
          this.pixel_ratio_display_over_true_y = 1.0;
          this.is_active = true;
          this.text = "1"
        }

        initialize() {
          // 各プロパティの初期化
          this.roi_polygon_pos_list = []; //　多角形の点のリスト
          this.is_roi_polygon_closed = null; //多角形が閉じているかどうか
          this.roi_point_index = null; // 現在選択している点のインデックス
          this.clicked = false; //　ダブルクリックの判定に使う
        }

        onSingleLeftClick (e) {
          console.log("left single clicked")
          var offsetX = e.offsetX; // =>要素左上からのx座標
          var offsetY = e.offsetY; // =>要素左上からのy座標

          if (this.is_roi_polygon_closed) {  // ポリゴンが閉じていた場合，新しいポリゴンの始点を選択する．
            if (this.roi_point_index==null) { // 既存の点が選択されていない場合
              this.is_roi_polygon_closed = false;  // ポリゴンの開放
              this.roi_polygon_pos_list = []; // リストの初期化
              this.roi_polygon_pos_list.push(
                {"x":Math.round(offsetX/this.pixel_ratio_display_over_true_x),
                 "y":Math.round(offsetY/this.pixel_ratio_display_over_true_y)}
              )
            } else { // 既存の点が選択されている場合
              this.roi_polygon_pos_list[this.roi_point_index]["x"] = Math.round(offsetX/this.pixel_ratio_display_over_true_x)
              this.roi_polygon_pos_list[this.roi_point_index]["y"] = Math.round(offsetY/this.pixel_ratio_display_over_true_y)
              this.roi_point_index = null; // 選択が終了
            }
          } else { // 閉じていなかった場合，新しく点を追加
            this.roi_polygon_pos_list.push(
              {"x":Math.round(offsetX/this.pixel_ratio_display_over_true_x), "y":Math.round(offsetY/this.pixel_ratio_display_over_true_y)}
            )
          }
        }

        _onRightClick(e){
          console.log("right clicked")
          var offsetX = e.offsetX; // =>要素左上からのx座標
          var offsetY = e.offsetY; // =>要素左上からのy座標

          var pos_dict = {"x":Math.round(offsetX/this.pixel_ratio_display_over_true_x), "y":Math.round(offsetY/this.pixel_ratio_display_over_true_y)}
          var min_distance = null;
          var min_distance_index = null;

          // 距離の最小となる点を求める
          for (let index=0; index<this.roi_polygon_pos_list.length; index++) {
            var one_point = this.roi_polygon_pos_list[index]
            if (index==0) {
              min_distance = calculate_point_distance(pos_dict, one_point);
              min_distance_index = 0;
            } else {
              var distance = calculate_point_distance(pos_dict, one_point);
              if (distance<min_distance) {
                min_distance = distance
                min_distance_index = index
              }
            }
          }

          this.roi_point_index = null; // ここで一応初期化

          if (this.is_roi_polygon_closed) { // ポリゴンが閉じていた場合
            if (min_distance_index!=null) { // 距離の最小な点が存在する場合
              this.roi_point_index = min_distance_index // ここでのみ点を選択(このメソッド内で)
            } 
          } else { // ポリゴンが閉じていない場合
            if (min_distance_index==0) {  // 距離の最小な点が開始点の場合，ポリゴンがうまくとじるように調整
              this.roi_polygon_pos_list.push(this.roi_polygon_pos_list[0]) // 最後の点==最初の点
              this.is_roi_polygon_closed = true; // ここでのみポリゴンを閉じる
            } 
          }
        }

        onRightClick(e) {
          if (this.is_active) {
            this._onRightClick(e)
          }
          return false; // 右クリック特有の処理
        }

        _onDoubleLeftClick(e) {
          console.log("left double clicked")
          var offsetX = e.offsetX; // =>要素左上からのx座標
          var offsetY = e.offsetY; // =>要素左上からのy座標

          var pos_dict = {"x":Math.round(offsetX/this.pixel_ratio_display_over_true_x), "y":Math.round(offsetY/this.pixel_ratio_display_over_true_y)}
          var min_point_line_distance = null;
          var min_point_line_distance_index = null; 
          // 距離の計算
          for (let index=0; index<this.roi_polygon_pos_list.length; index++) {
            if (index==0) { // 最初の場合
              var one_point = this.roi_polygon_pos_list[index]
              var two_point = this.roi_polygon_pos_list[index+1]
              // 垂線の足を求める
              var leg_point = calculate_line_segment_leg(one_point, two_point, pos_dict);
              if ( 
                (Math.min(one_point["x"],one_point["x"]) <= leg_point["x"] && Math.min(one_point["y"],one_point["y"]) <= leg_point["y"]) &&
                (leg_point["x"] <= Math.max(one_point["x"],one_point["x"])  && leg_point["y"] <= Math.max(one_point["y"],one_point["y"]))
              ) { // 垂線の足が線分内にある時
                min_point_line_distance = calculate_point_line_distance(one_point, two_point, pos_dict); // 点と直線の距離
              } else {
                var half_point = {"x":(one_point["x"]+two_point["x"])/2, "y":(one_point["y"]+two_point["y"])/2}; // 辺の中心点
                min_point_line_distance = calculate_point_distance(half_point, pos_dict); // 点と辺の中心点との距離
              }
              min_point_line_distance_index = 0;
            } else　if (index!=(this.roi_polygon_pos_list.length-1)) {
                var one_point = this.roi_polygon_pos_list[index]
                var two_point = this.roi_polygon_pos_list[index+1]
                // 垂線の足を求める
                var leg_point = calculate_line_segment_leg(one_point, two_point, pos_dict);
                if ( 
                  (Math.min(one_point["x"],one_point["x"]) <= leg_point["x"] && Math.min(one_point["y"],one_point["y"]) <= leg_point["y"]) &&
                  (leg_point["x"] <= Math.max(one_point["x"],one_point["x"])  && leg_point["y"] <= Math.max(one_point["y"],one_point["y"]))
                ) { // 垂線の足が線分内にある時
                  var point_line_distance = calculate_point_line_distance(one_point, two_point, pos_dict); // 点と直線の距離
                } else {
                  var half_point = {"x":(one_point["x"]+two_point["x"])/2, "y":(one_point["y"]+two_point["y"])/2}; // 辺の中心点
                  var point_line_distance = calculate_point_distance(half_point, pos_dict);// 点と辺の中心点との距離
                } 

                if (point_line_distance<min_point_line_distance) {
                  min_point_line_distance = point_line_distance
                  min_point_line_distance_index = index
                }
            }
          }

          if (this.is_roi_polygon_closed) { // ポリゴンが閉じている場合
            if (min_point_line_distance_index!=null) {
              this.roi_polygon_pos_list.splice(min_point_line_distance_index+1, 0, pos_dict) // insertする
              this.roi_point_index = min_point_line_distance_index+1
            }
          }
        }

        onDoubleLeftClick(e) {
          if (this.is_active) {
            this._onDoubleLeftClick(e)
          }
        }  

        _onLeftClick(e) {
          if (this.is_roi_polygon_closed) { // ポリゴンが閉じている場合
            // クリックされている場合にさらにクリック
            if (this.clicked) {
              this.clicked = false;
              this.onDoubleLeftClick(e);
              return;
            }
            // シングルクリック
            this.clicked = true;
            var time_outed_func = () => {
              // クリックされていない場合　-> シングルクリック
              if (this.clicked) {
                  this.onSingleLeftClick(e);
              }
              this.clicked = false;
            }
            setTimeout(time_outed_func, 200);

          } else { //  ポリゴンが閉じていない場合
            this.onSingleLeftClick(e);
            this.clicked=false;
          }
        }

        onLeftClick(e) {
          if (this.is_active) {
            this._onLeftClick(e);
          }
        }

        clearCanvas() {
          this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
        }

        _drawPolygon(offsetX, offsetY){
          if (this.is_roi_polygon_closed) { // ポリゴンが閉じている場合
            var counter = 0
            this.ctx.beginPath();
            for (let index=0; index<this.roi_polygon_pos_list.length; index++) {
              var point_dict = this.roi_polygon_pos_list[index]
              if (counter==0){  // 最初の点のみ
                if (counter==this.roi_point_index && offsetX!=null && offsetY!=null) { // 選択している点だった場合
                  this.ctx.moveTo(
                    offsetX,
                    offsetY,
                  );
                } else {
                  this.ctx.moveTo(
                    Math.round(this.pixel_ratio_display_over_true_x*point_dict["x"]),
                    Math.round(this.pixel_ratio_display_over_true_y*point_dict["y"])
                  );
                }
              } else if(counter!=(this.roi_polygon_pos_list.length-1)) {  // 最初の点・最後の点(最初の点と同じ)以外
                if (counter==this.roi_point_index && offsetX!=null && offsetY!=null) { // 選択している点だった場合
                  this.ctx.lineTo(
                    offsetX,
                    offsetY,
                  );
                } else {
                  this.ctx.lineTo(
                    Math.round(this.pixel_ratio_display_over_true_x*point_dict["x"]),
                    Math.round(this.pixel_ratio_display_over_true_y*point_dict["y"])
                  );
                }
              }
              counter ++;
            }
            this.ctx.closePath();
            if (this.roi_point_index==null) { // ポリゴンが確定している場合のみfill描画
              this.ctx.fillStyle = "red";
              this.ctx.globalAlpha = 0.5;
              this.ctx.fill();

              this.ctx.fillText(
                this.text,
                Math.round(this.pixel_ratio_display_over_true_x*this.roi_polygon_pos_list[0]["x"]),
                Math.round(this.pixel_ratio_display_over_true_y*this.roi_polygon_pos_list[0]["y"])
              );

            } else {
              this.ctx.strokeStyle = "orange";
              this.ctx.stroke();

              this.ctx.fillStyle = "orange";
              this.ctx.fillText(
                this.text,
                Math.round(this.pixel_ratio_display_over_true_x*this.roi_polygon_pos_list[0]["x"]),
                Math.round(this.pixel_ratio_display_over_true_y*this.roi_polygon_pos_list[0]["y"])
              );
            }
          } else { // ポリゴンが閉じていない場合
            var counter = 0
            this.ctx.beginPath();
            for (let index=0; index<this.roi_polygon_pos_list.length; index++) {
              var point_dict = this.roi_polygon_pos_list[index]
              if (counter==0) {  // 最初の点のみ
                this.ctx.moveTo(
                  Math.round(this.pixel_ratio_display_over_true_x*point_dict["x"]),
                  Math.round(this.pixel_ratio_display_over_true_y*point_dict["y"])
                );
              } else {  // 最初の点・最後の点以外
                this.ctx.lineTo(
                  Math.round(this.pixel_ratio_display_over_true_x*point_dict["x"]),
                  Math.round(this.pixel_ratio_display_over_true_y*point_dict["y"])
                );
              } 
              counter ++;
            }
            this.ctx.lineTo(
              offsetX,
              offsetY
              );
            this.ctx.strokeStyle = "blue";
            this.ctx.stroke();
            if (this.roi_polygon_pos_list.length > 0) {
              this.ctx.fillStyle = "blue";
              this.ctx.fillText(
                this.text,
                Math.round(this.pixel_ratio_display_over_true_x*this.roi_polygon_pos_list[0]["x"]),
                Math.round(this.pixel_ratio_display_over_true_y*this.roi_polygon_pos_list[0]["y"])
              );
            }
          }
        }

        drawPolygon(offsetX, offsetY) {
          if (this.is_active) {
            this._drawPolygon(offsetX, offsetY);
          }
        }

        _drawPoints(offsetX, offsetY) {
          if (this.is_roi_polygon_closed) { // ポリゴンが閉じている場合
            for (let index=0; index<this.roi_polygon_pos_list.length; index++) {
              var point_dict = this.roi_polygon_pos_list[index];
              if (index==this.roi_point_index && offsetX!=null && offsetY!=null) {
                this.ctx.beginPath();
                this.ctx.arc(offsetX, offsetY, 2, 0, 2*Math.PI, false);
                this.ctx.fillStyle = "red";
                this.ctx.fill();
              } else if (index!=(this.roi_polygon_pos_list.length-1)) {  // 最初の点・最後の点(最初の点と同じ)以外
                this.ctx.beginPath();
                this.ctx.arc(point_dict["x"], point_dict["y"], 2, 0, 2*Math.PI, false);
                this.ctx.fillStyle = "red";
                this.ctx.fill();
              }
            }
          } else { // ポリゴンが閉じていない場合
            for (let index=0; index<this.roi_polygon_pos_list.length; index++) {
              var point_dict = this.roi_polygon_pos_list[index];
              this.ctx.beginPath();
              this.ctx.arc(point_dict["x"], point_dict["y"], 2, 0, 2*Math.PI, false);
              this.ctx.fillStyle = "blue";
              this.ctx.fill();
            }
            if (offsetX!=null && offsetY!=null){
              this.ctx.beginPath();
              this.ctx.arc(offsetX, offsetY, 2, 0, 2*Math.PI, false);
              this.ctx.fillStyle = "blue";
              this.ctx.fill();    
            }
          }
        }

        drawPoints(offsetX, offsetY) {
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


      var canvas = document.getElementById("canvas");
      var ctx = canvas.getContext("2d")

      // ポリゴンクラスのコンストラクト
      var roi_polygon = new CanvasPolygon(canvas, ctx)

      onMove = (e) => {
        var offsetX = e.offsetX; // =>要素左上からのx座標
        var offsetY = e.offsetY; // =>要素左上からのy座標
        roi_polygon.clearCanvas();
        roi_polygon.drawPolygon(offsetX, offsetY);
        roi_polygon.drawPoints(offsetX, offsetY);
      }

      // canvasへのイベントの追加
      canvas.onclick = (e) => {
        roi_polygon.onLeftClick(e); // クラスで定義するため
        onMove(e);
      }
      canvas.oncontextmenu = (e) => {
        roi_polygon.onRightClick(e);
        onMove(e);
        return false;
      }
      canvas.onmousemove = onMove


    </script>
  </body>
</html>
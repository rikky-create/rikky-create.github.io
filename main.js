//デバッグフラグ
const DEBUG = false;

var drawCount = 0;
var fps = 0;
var lastTime = Date.now();

//スムージング
const SMOOTHING = false;

//ゲームスピード(ms)
const GAME_SPEED = 1000/60;

//画面サイズ
const SCREEN_W = 320;
const SCREEN_H = 320;

//キャンバスサイズ
const CANVAS_W = SCREEN_W * 2;
const CANVAS_H = SCREEN_H * 2;

//フィールドサイズ
const FIELD_W = SCREEN_W +120;
const FIELD_H = SCREEN_H +40;

//星の数
const STAR_MAX = 300;

//キャンバス
var can = document.getElementById("can");
var con = can.getContext("2d");
can.width  = CANVAS_W;
can.height = CANVAS_H;
con.mozimageSmoothingEnagbled   = SMOOTHING;
con.webkitimageSmoothingEnabled = SMOOTHING;
con.msimageSmoothingEnabled     = SMOOTHING;
con.imageSmoothingEnabled       = SMOOTHING;
con.font = "20px 'Impact'";

//フィールド
var vcan = document.createElement("canvas");
var vcon = vcan.getContext("2d");
vcan.width  = CANVAS_W;
vcan.height = CANVAS_H;
vcon.font = "12px 'Impact'";

//カメラの座標
var camera_x = 0;
var camera_y = 0;

//ゲームオーバーフラグ
var gameOver = false;
var score = 0;

//ボスのHP
var bossHP = 0;
var bossMHP = 0;

//星の実体
var star = [];

//キーボードの状態
var key = [];

//オブジェクト
var teki = [];
var teta = [];
var tama = [];
var expl = [];
var jiki = new Jiki();

//ファイルを読み込み
var spriteImage = new Image();
spriteImage.src = "sprite.png";

//ゲーム初期化
function gameInit(){
    for(var i=0; i<STAR_MAX;i++) star[i] = new Star();
    setInterval( gameLoop , GAME_SPEED );
    // requestAnimationFrame
}

//オブジェクトをアップデート
function updateObj( obj ){
    for(var i=obj.length-1; i>=0;i--){
        obj[i].update();
        if(obj[i].kill) obj.splice(i,1);
    }
}

//オブジェクトを描画
function drawObj( obj ){
    for(var i=0; i<obj.length;i++) obj[i].draw();
}

//移動の処理
function updateAll(){
    updateObj(star);
    updateObj(tama);
    updateObj(teta);
    updateObj(teki);
    updateObj(expl);
    jiki.update();
}

//描画の処理
function drawAll(){
    vcon.fillStyle = (jiki.damage)?"red":"black";
    vcon.fillRect(camera_x,camera_y,SCREEN_W,SCREEN_H);

    drawObj(star);
    if(!gameOver) drawObj(tama);
    if(!gameOver) jiki.draw();
    drawObj(teki);
    drawObj(expl);
    drawObj(teta);

    //自機の範囲 0 ～ FIELD_W
    //カメラの範囲 0 ～ (FILED_W-SCREEN_W)
    camera_x = Math.floor((jiki.x>>8)/FIELD_W * (FIELD_W-SCREEN_W));
    camera_y = Math.floor((jiki.y>>8)/FIELD_H * (FIELD_H-SCREEN_H));

    //ボスのHP表示
    if( bossHP > 0){
        var sz = (SCREEN_W-20)*bossHP/bossMHP;
        var sz2 = (SCREEN_W-20);
        vcon.fillStyle="rgba(255,0,0,0.5)";
        vcon.fillRect(camera_x+10,camera_y+10,sz,10);
        vcon.strokeStyle="rgba(255,0,0,0.9)";
        vcon.strokeRect(camera_x+10,camera_y+10,sz2,10);
    }

    //自機のHP表示
    if( jiki.hp > 0){
        var sz = (SCREEN_W-20)*jiki.hp/jiki.mhp;
        var sz2 = (SCREEN_W-20);
        vcon.fillStyle="rgba(0,0,255,0.5)";
        vcon.fillRect(camera_x+10,camera_y+SCREEN_H-14,sz,10);
        vcon.strokeStyle="rgba(0,0,255,0.9)";
        vcon.strokeRect(camera_x+10,camera_y+SCREEN_H-14,sz2,10);
    }

    //スコア表示
    vcon.fillStyle="white";
    vcon.fillText("SCORE" + score,camera_x+10,camera_y+14);

    //仮想画面から実際のキャンバスにコピー
    con.drawImage( vcan , camera_x,camera_y,SCREEN_W,SCREEN_H, 0,0,CANVAS_W,CANVAS_H);

}

//情報の処理
function putInfo(){
    con.fillStyle = "white";

    if( gameOver ){
        var s = "GAME OVER";
        var w = con.measureText(s).width;
        var x = CANVAS_W/2 - w/2;
        var y = CANVAS_H/2 - 40;
        con.fillText(s,x,y)

        var s = "Push 'R' key to restart !";
        var w = con.measureText(s).width;
        var x = CANVAS_W/2 - w/2;
        var y = CANVAS_H/2 - 20;
        con.fillText(s,x,y)
    }

    if(DEBUG){
        drawCount++;
        if(lastTime + 1000 <= Date.now() ){
            fps = drawCount;
            drawCount = 0;
            lastTime = Date.now();
        }

        con.font = "20px 'Impact'";
        con.fillStyle = "white";
        con.fillText("FPS :"+fps,20,20);
        con.fillText("Tama:"+tama.length,20,40);
        con.fillText("Teki:"+teki.length,20,60);
        con.fillText("ETema:"+teta.length,20,80);
        con.fillText("Expl:"+expl.length,20,100);
        con.fillText("X:"+jiki.x,20,120);
        con.fillText("Y:"+jiki.y,20,140);
        con.fillText("HP:"+jiki.hp,20,160);
        con.fillText("SCORE:"+score,20,180);
        con.fillText("COUNT:"+gameCount,20,200);
        con.fillText("WAVE:"+gameWave,20,220);

    }
}

var gameCount = 0;
var gameWave = 0;
var gameRound = 0;

var starSpeed = 100;
var starSpeedReq = 100;

//ゲームループ
function gameLoop(){
    gameCount++;
    if(starSpeedReq>starSpeed)starSpeed++;
    if(starSpeedReq<starSpeed)starSpeed--;

    if(gameWave == 0){
        if( rand(0,15)==1 ){
            teki.push( new Teki( 0,rand(0,FIELD_W)<<8,0,0, rand(300,1200)));
        }
        if( gameCount > 60*20){
            gameWave++;
            gameCount=0;
            starSpeedReq=100;
        }
    }

    if(gameWave == 1){
        if( rand(0,15)==1 ){
            teki.push( new Teki( 1,rand(0,FIELD_W)<<8,0,0, rand(300,1200)));
        }
        if( gameCount > 60*20){
            gameWave++;
            gameCount=0;
            starSpeedReq=200;
        }
    }

    if(gameWave == 2){
        if( rand(0,10)==1 ){
            var r = rand(0,1);
            teki.push( new Teki( r,rand(0,FIELD_W)<<8,0,0, rand(300,1200)));
        }
        if( gameCount > 60*20){
            gameWave++;
            gameCount=0;
            starSpeedReq=600;
            teki.push( new Teki( 2,(FIELD_W/2)<<8,-(70<<8),0,200));
        }
    }

    if(gameWave == 3){
        if( teki.length==0){
            gameWave=0;
            gameCount=0;
            gameRound=1;
            starSpeedReq=100;
        }
    }

    updateAll();
    drawAll();
    putInfo();
}

//オンロードでゲーム開始
window.onload=function(){
    this.gameInit();
    
}

//
//misc.js その他、共通処理
//

//星クラス
class Star{
    constructor(){
        this.x = rand(0,FIELD_W)<<8;
        this.y = rand(0,FIELD_H)<<8;
        this.vx = 0;
        this.vy = rand(100,300);
        this.sz = rand(1,2);
    }

    draw(){
        var x = this.x>>8;
        var y = this.y>>8;
        if( x<camera_x || x>=camera_x+SCREEN_W
            || y<camera_y || y>=camera_y+SCREEN_H) return;

        vcon.fillStyle = (rand(0,2)!=0)?"#66f":"#aef";
        vcon.fillRect(this.x>>8,this.y>>8,this.sz,this.sz);
    }

    update(){
        this.x += this.vx * starSpeed/100;
        this.y += this.vy * starSpeed/100;
        if( this.y > FIELD_H<<8){
            this.y = 0;
            this.x = rand(0,FIELD_W)<<8;
        }
    }
}

//キャラクターベースクラス
class CharaBase{
    constructor(snum,x,y,vx,vy){
        this.sn = snum;
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy =vy;
        this.kill = false;
        this.count = 0;
    }

    update(){
        this.count++;
        
        this.x += this.vx;
        this.y += this.vy;

        if( this.x+(100<<8)<0 || this.x-(100<<8)>FIELD_W<<8 || this.y+(100<<8)<0 || this.y-(100<<8)>FIELD_H<<8 ){
            this.kill = true;
        }
    }

    draw(){
        drawSprite(this.sn, this.x, this.y);
    } 
}

//爆発クラス
class Expl extends CharaBase{
    constructor(c,x,y,vx,vy){
        super(0,x,y,vx,vy);
        this.timer = c;
    }

    update(){
        if(this.timer){
            this.timer--;
            return;
        }
        super.update();
    }

    draw(){
        if(this.timer)return;
        this.sn = 16 + (this.count>>2);
        if( this.sn==27 ){
            this.kill = true;
            return;
        }
        super.draw();
    }
}

//派手な爆発
function explosion(x,y,vx,vy){
    expl.push(new Expl(0,x,y,evx,evy));
    for(var i=0; i<10; i++){
        var evx = vx+(rand(-10,10)<<5);
        var evy = vy+(rand(-10,10)<<5);
        expl.push(new Expl(i,x,y,evx,evy));
        }
}

//キーボードが押されたとき
document.onkeydown = function(e){
    key[ e.keyCode ] = true;
    if(gameOver && e.keyCode==82){
        delete jiki;
        jiki = new Jiki();
        gameOver = false;
        score = 0;
    }
}

//キーボードが離されたとき
document.onkeyup = function(e){
    key[ e.keyCode ] = false;
}

//スプライトを描画する
function drawSprite(snum, x, y){
    var sx = sprite[snum].x;
    var sy = sprite[snum].y;
    var sw = sprite[snum].w;
    var sh = sprite[snum].h;

    var px = (x>>8) - sw/2;
    var py = (y>>8) - sh/2;

    if( px+sw <camera_x || px >=camera_x+SCREEN_W
        || py+sh <camera_y || py >=camera_y+SCREEN_H) return;

    vcon.drawImage( spriteImage, sx,sy,sw,sh, px,py,sw,sh);
}

//整数のランダムを作る
function rand(min,max){
    return Math.floor( Math.random() * (max-min+1) ) + min;
}

//当たり判定
function checkHit(x1,y1,r1, x2,y2,r2){
    //円同士の当たり判定（考察の余地あり）
    var a = (x2-x1)>>8;
    var b = (y2-y1)>>8;
    var r = r1+r2;
    
    return r*r >= a*a + b*b;
}
/*--------------------------------------------------------
// function checkHit(x1,y1,w1,h1, x2,y2,w2,h2){
//     //矩形同士の当たり判定（考察の余地あり）
//     var left1   = x1>>8;
// 	var right1  = left1+w1;
// 	var top1    = y1>>8;
// 	var bottom1 = top1 +h1;
	
// 	var left2   = x2>>8;
// 	var right2  = left2+w2;
// 	var top2    = y2>>8;
// 	var bottom2 = top2 +h2;
	
// 	return( left1 <= right2  &&
// 		   right1 >= left2   &&
// 			 top1 <= bottom2 &&
// 		  bottom1 >= top2      );
// }
--------------------------------------------------------*/
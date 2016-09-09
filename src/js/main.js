(function(){
    var getEl = document.getElementById.bind(document),
        bel = document.body.addEventListener,
        canvas = getEl("c"),
        scrEl = getEl("score"),
        timeEl = getEl("time"),
        ctx = canvas.getContext('2d'),
        M = Math,
        fireInterval,
        rand = M.random,
        t=0,
        cfg = {
            w:0,
            h:0,
            fps:60,
            fireT:200,
            bgLimit:40,
            bgv:10, //velocity
            bgS:3, //size
            boundFactor:2,
            bulletV:15,
            enemyV:1,
            kmode:false,
            scrHit:20
        },
        ship = {
            s:10, //size
            x: -100,
            y: -100,
            f: false //firing
        },
        score = 0,
        bounds={max:0, min:0},
        bullets = [],
        enemies = [],
        bg = [];

function init(){

    cfg.w = document.body.offsetWidth;
    cfg.h = document.body.offsetHeight;

    canvas.width = cfg.w;
    canvas.height = cfg.h;

    ship.x = cfg.w / 2;
    ship.y = cfg.h * 0.9;

    bounds.max = cfg.h * cfg.boundFactor - (cfg.h / cfg.boundFactor);
    bounds.min = -(cfg.h / cfg.boundFactor);

    bel("touchstart", tstart);
    bel("touchmove", tmove);
    bel("touchend", tend);
    bel("mousedown", mdown);
    bel("mousemove", mmove);
    bel("mouseup", mup);
    bel("keydown", kdown);
    bel("keyup", kup);

    //Background
    for(i=0;i<cfg.bgLimit;i++) {
        bg.push({
            x: cfg.w * rand(),
            y: cfg.boundFactor * cfg.h * rand() - (cfg.h/cfg.boundFactor),
            z: rand()
        })
    }

    setInterval(function () {
        t += 0.5;
        if(rand() > 0.3){
            enemies.push({
                x:rand()*cfg.w,
                y: -20
            });
        }
    },500);


    setInterval(function(){
        window.requestAnimationFrame(renderLoop);
    }, 1000/cfg.fps);
}

function mdown(e){
    tstart()
}
function tstart(e){
    ship.f = true;
    fireInterval = setInterval(fire, cfg.fireT);
}
function kdown(e){
    if(e.keyCode===32){
        ship.f = true;
        fire();
    }
    if(e.keyCode===37){
        cfg.kmode = true;
        ship.x -= 15;
    }
    if(e.keyCode===38){
        cfg.kmode = true;
        ship.y -= 15;
    }
    if(e.keyCode===39){
        cfg.kmode = true;
        ship.x += 15;
    }
    if(e.keyCode===40){
        cfg.kmode = true;
        ship.y += 15;
    }
}
function mmove(e){
    if(!ship.f) return;
    tmove({
        touches:[{pageX:e.pageX, pageY:e.pageY}]
    })
}
function tmove(e){
    ship.x = e.touches[0].pageX;
    ship.y = e.touches[0].pageY;
}
function mup(e){
    tend()
}

function kup(e){
    if(e.keyCode===32 || (e.keyCode >=37 && e.keyCode <=40)){
        tend();
    }
}
function tend(e){
    ship.f = false;
    clearInterval(fireInterval);
}

function fire(){
    bullets.push({
        x:ship.x,
        y:ship.y - 20
    })
}
function renderLoop() {
    ctx.clearRect(0, 0, cfg.w, cfg.h);

    fs(0.4);
    for(i=0;i<bg.length;i++) {

        bg[i].y = bg[i].y + cfg.bgv * bg[i].z;
        ctx.beginPath();
        ctx.arc(bg[i].x, bg[i].y, bg[i].z * cfg.bgS, 0, 2 * M.PI);
        ctx.fill();

        if(bg[i].y > bounds.max){
            bg[i].y = bounds.min;
        }
    }

    //Ship
    ls(1, 4);
    ctx.beginPath();
    ctx.moveTo(ship.x, ship.y+10);
    ctx.lineTo(ship.x+10, ship.y+15);
    ctx.lineTo(ship.x, ship.y-10);
    ctx.lineTo(ship.x-10, ship.y+15);
    ctx.lineTo(ship.x, ship.y+10);
    ctx.stroke();

    //Bullets
    ls(1, 4);
    for(i=0;i<bullets.length;i++) {
        ctx.beginPath();
        ctx.moveTo(bullets[i].x, bullets[i].y);
        ctx.lineTo(bullets[i].x, bullets[i].y-20);
        ctx.stroke();

        bullets[i].y -= cfg.bulletV;
        if(bullets[i].y < bounds.min){
            bullets.splice(i, 1);
            continue;
        }

        //hit
        for(j=0;j<enemies.length;j++) {
            if(M.sqrt(M.pow(bullets[i].x - enemies[j].x,2) + M.pow(bullets[i].y - enemies[j].y,2)) < 20){
                bullets.splice(i, 1);
                enemies.splice(j, 1);
                incScore(cfg.scrHit);
                break;
            }
        }
    }
    //Enemies
    ls(1, 4, "255,0,0");
    for(i=0;i<enemies.length;i++) {
        ctx.beginPath();
        ctx.moveTo(enemies[i].x, enemies[i].y-10);
        ctx.lineTo(enemies[i].x+10, enemies[i].y-15);
        ctx.lineTo(enemies[i].x, enemies[i].y+10);
        ctx.lineTo(enemies[i].x-10, enemies[i].y-15);
        ctx.lineTo(enemies[i].x, enemies[i].y-10);
        ctx.stroke();

        enemies[i].y += cfg.enemyV;
        if(enemies[i].y > bounds.max){
            enemies.splice(i, 1);
        }
    }

    //Slowly move ship back to center
    if(!ship.f && !cfg.kmode){
        ship.x = ship.x - 0.03 *(ship.x - cfg.w / 2);
        ship.y = ship.y - 0.03 *(ship.y - cfg.h * 0.9);
    }

    scrEl.textContent = "Score: " + score;
    timeEl.textContent = M.round(t) + 's';
}

function fs(a){
    ctx.fillStyle = "rgba(255,255,255,"+a+")";
}
function ls(a,b,c){
    ctx.strokeStyle = "rgba("+(c || "255,255,255")+","+a+")";
    ctx.lineWidth = b || 1;
}
function incScore(a){
    score += a;
}

//GO!
init();

})();
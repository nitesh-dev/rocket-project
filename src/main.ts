
import './style.css'
import * as PIXI from 'pixi.js'
import { sound } from '@pixi/sound';


/* How to use

1) setup(spaceImageUrl, rocketImageUrl, blastImageUrls, flameImageUrls)
  this function is used to setup canvas. it will do all image loading task.

2) restart(endTime)
  this function reset the ship to start position

3) startRocket()
  this function will make your rocket to move

4) destroyRocket()
  this function will destroy the ship

Note: you have to call setup() only once,
      use restart() to reset the ship


*/


// temp - this will be in html page

const progressContainer = document.querySelector('#canvas-container .game-loading')
const progressBars = document.querySelectorAll('#canvas-container .loader span')
const gameStatusContainer = document.querySelector('#canvas-container .game-status')
const gameStatusText = document.querySelector('#canvas-container .game-status h3')

let isProgressing = false;
toggleContainer()
let progressCount = 0;
let backgroundTimeout = 0;

(document.querySelector('#restart') as HTMLButtonElement).addEventListener('click', function () {
  score = 0
  scoreUpdateSpeed = 0.4
  isProgressing = true
  progressCount = 0
  isUpdateAllowed = false
  isRocketDestroyed = false
  gameStatusText!!.className = ''
  gameStatusText!!.innerHTML = ''
  toggleContainer()
  restart(20)
  playIgnitionSound()

  //clear previous playing music
  playBackgroundSound(false)
  clearTimeout(backgroundTimeout)

  //playing background sound after 9 seconds
  backgroundTimeout = setTimeout(() => { playBackgroundSound(true) }, 9000);
});


(document.querySelector('#destroy') as HTMLButtonElement).addEventListener('click', function () {
  isUpdateAllowed = false
  playExplosionSound()
  playBackgroundSound(false)
  destroyRocket()

  // show game over after some delay
  setTimeout(() => {
    isRocketDestroyed = true
    playGameOverSound()
  }, 1000)
});

setInterval(updateScore, 250);
setInterval(updateProgress, 1000)

function updateProgress() {
  if (isProgressing == false) return

  // disabling all progress item
  progressBars.forEach(element => {
    element.className = ''
  });

  // enabling progress item
  for (let index = 0; index < progressCount; index++) {
    progressBars[index].className = 'visible'

  }

  progressCount += 1
  if (progressCount > 10) {
    isProgressing = false
    toggleContainer()
    startRocket()
    isUpdateAllowed = true

    // disabling all progress item
    progressBars.forEach(element => {
      element.className = ''
    });
  }

}

function toggleContainer() {
  if (isProgressing) {
    progressContainer?.classList.remove('hide')
    gameStatusContainer?.classList.add('hide')
  } else {
    progressContainer?.classList.add('hide')
    gameStatusContainer?.classList.remove('hide')
  }

}

let scoreUpdateSpeed = 0.4
let score = 0
let isUpdateAllowed = false
let isRocketDestroyed = false
const scoreElement = document.querySelector('#canvas-container h2 .left') as HTMLElement


// hype words
const hypeValue = [3, 5, 8, 10, 15, 20, 25, 35, 50, 75, 100, 300, 500, 750, 1000]
const hypeNames = ['NOT BAD', 'WOW', 'EXCELLENT', 'IMPRESSIVE', 'MARVELOUS', 'INCREDIBLE', 'SENSATIONAL', 'UNSTOPPABLE', 'DIVINE', 'STELLAR', 'REVOLUTIONARY', 'LEGENDARY', 'PHENOMENAL', 'OUT OF THE WORLD', 'GODLIKE']

let activeHype = ''

function updateScore() {

  if (isUpdateAllowed == true) {
    score += Math.random() * scoreUpdateSpeed
    score = Math.round(score * 100) / 100       // rounding
  }

  scoreElement.innerText = score.toString()

  for (let index = 0; index < hypeValue.length - 1; index++) {
    if (hypeValue[index] <= score && score < hypeValue[index + 1]) {

      if (activeHype != hypeNames[index]) {

        // increase score update speed
        if (index == 3) scoreUpdateSpeed = 0.5
        if (index == 5) scoreUpdateSpeed = 0.7
        if (index == 7) scoreUpdateSpeed = 1.5
        if (index == 9) scoreUpdateSpeed = 2.5
        if (index == 11) scoreUpdateSpeed = 5
        if (index == 12) scoreUpdateSpeed = 10

        activeHype = hypeNames[index]
        gameStatusText!!.innerHTML = hypeNames[index]
        gameStatusText!!.classList.add('animation')

        // remove scale animation after completed
        setTimeout(() => {
          gameStatusText!!.classList.remove('animation')
        }, 1600)

      }

      break
    }

    if (score > 1000) {
      const last = hypeNames[hypeNames.length - 1]
      if (activeHype != last) {
        activeHype = last
        gameStatusText!!.innerHTML = last
        gameStatusText!!.classList.add('animation')

        // remove scale animation after completed
        setTimeout(() => {
          gameStatusText!!.classList.remove('animation')
        }, 1600)

      }
    }

  }

  if (isRocketDestroyed && isUpdateAllowed == false) {
    gameStatusText!!.innerHTML = 'GAME OVER'
    gameStatusText!!.className = 'visible'
  }

}


window.addEventListener('resize', updateCanvasSize)

// function showScaleAnimation() {
//   scoreParent.classList.remove('scale')
//   setTimeout(() => {
//     scoreParent.classList.add('scale')
//   }, 100)
// }



















const canvasContainer = document.querySelector('#canvas-container') as HTMLDivElement
const audioButton = document.querySelector('#canvas-container input') as HTMLInputElement;

audioButton.addEventListener('change', function () {
  playBackgroundSound()
})

const app = new PIXI.Application({
  antialias: true,
  width: canvasContainer.clientWidth,
  height: canvasContainer.clientHeight,
  backgroundAlpha: 0
});

(app.view as HTMLCanvasElement).style.backgroundColor = "transparent"

canvasContainer.appendChild(app.view as any);


let duration = 10
let time = 0

const backgroundSpeed = 80
let backgroundHeight = 0
let offset = 170
let start = new PIXI.Point(offset, app.screen.bottom - offset)
let control = new PIXI.Point(app.screen.right - offset, app.screen.bottom - offset)
let end = new PIXI.Point(app.screen.right - offset, offset)

let rocket: PIXI.Container<PIXI.DisplayObject> | null = null
let blast: PIXI.AnimatedSprite | null = null
let flame: PIXI.AnimatedSprite | null = null
let isRocketMoving = false
let background: PIXI.Container<PIXI.DisplayObject> | null = null
let trail: PIXI.Container<PIXI.DisplayObject> | null = null

//loading all textures
let backgroundTexture: any = null
const flameTextures = Array<PIXI.Texture<PIXI.Resource>>();
const blastTextures = Array<PIXI.Texture<PIXI.Resource>>();



//  -------------------------------------------- Media query in js ------------------------------------
let isSmallerDevice = false
function onMediaQuery(x: any) {
  if (x.matches) { // If media query matches
    isSmallerDevice = true
  } else {
    isSmallerDevice = false
  }
}

var media = window.matchMedia("(max-width: 800px)")
onMediaQuery(media)
media.addEventListener('change', onMediaQuery)









function updateCanvasSize() {

  resize()
  start = new PIXI.Point(offset, app.screen.bottom - offset)
  control = new PIXI.Point(app.screen.right - offset, app.screen.bottom - offset)
  end = new PIXI.Point(app.screen.right - offset, offset)

  // redraw trail

  if (trail == null) return
  app.stage.removeChild(trail)     // remove previous trail
  trail = trailContainer()
  app.stage.addChildAt(trail, 1)
}

function resize() {
  app.renderer.resize(canvasContainer.clientWidth, canvasContainer.clientHeight);
}

// sounds
var constraints = { audio: true } // add video constraints if required

let isPermissionAllowed = false
navigator.mediaDevices.getUserMedia(constraints)
  .then(() => {
    isPermissionAllowed = true;
    addAudios()
  })


function addAudios() {
  sound.add('ignition', {
    url: './audio/ignition.mp3',
    preload: true
  })
  sound.add('explosion', {
    url: './audio/explosion.mp3',
    preload: true
  })
  sound.add('gameover', {
    url: './audio/gameover.mp3',
    preload: true
  })
  sound.add('background', {
    url: './audio/background.mp3',
    preload: true
  })

}

function playBackgroundSound(isPlaying = true) {
  if (isPermissionAllowed == false) return

  if (isRocketDestroyed) isPlaying = false
  sound.stop('background')

  if (isPlaying && audioButton.checked) {
    sound.play('background', { loop: true, volume: 0.1 })
  }

}


function playExplosionSound() {
  if (isPermissionAllowed == false) return
  if (audioButton.checked == false) return
  sound.play('explosion')
}


function playGameOverSound() {
  if (isPermissionAllowed == false) return
  if (audioButton.checked == false) return
  sound.play('gameover', { volume: 0.05 })
}

function playIgnitionSound() {
  if (isPermissionAllowed == false) return
  sound.stop('ignition')
  if (audioButton.checked == false) return
  sound.play('ignition', { volume: 0.1 })
}



// const rocketAnimation = 1
// const rocketAnimationMaxDis = 30
let rocketImage = ''
let blastImages = Array<string>()
let flameImages = Array<string>()

setup('./space.jpg', './rocket.png', [
  './blast/blast1.png',
  './blast/blast2.png',
  './blast/blast3.png',
  './blast/blast4.png',
], [
  './flame/flame1.png',
  './flame/flame2.png',
  './flame/flame3.png',
  './flame/flame4.png',
  './flame/flame5.png',
  './flame/flame6.png',
  './flame/flame7.png',
])


async function setup(spaceImageUrl: string, rocketImageUrl: string, blastImagesUrl: Array<string>, flameImagesUrl: Array<string>) {

  // loading all textures
  rocketImage = rocketImageUrl
  blastImages = blastImagesUrl
  flameImages = flameImagesUrl
  await loadAllTextures(spaceImageUrl)

  background = await createBackground()


  // skip if trail already rendered
  if (trail != null) return
  trail = trailContainer()
  app.stage.addChild(trail);

  if (isSmallerDevice) {
    offset = 60
  } else {
    offset = 170
  }

  updateCanvasSize()
}



async function loadAllTextures(spaceImage: string) {

  backgroundTexture = await PIXI.Assets.load(spaceImage)

  for (const url of flameImages) {
    const texture = await PIXI.Assets.load(url)
    flameTextures.push(texture)
  }

  for (const url of blastImages) {
    const texture = await PIXI.Assets.load(url)
    blastTextures.push(texture)
  }

}




async function restart(animationDuration: number = 10) {

  // remove previous blast object if found
  if (blast != null) {
    app.stage.removeChild(blast)
  }

  if (rocket != null) {
    app.stage.removeChild(rocket)
  }

  duration = animationDuration
  time = 0
  isRocketMoving = false
  rocket = await createRocket(rocketImage)
  app.stage.addChild(rocket)

  rocket.angle = tangentToDegree(mapToOne(time, duration))
  let pos = getCurvePoint(mapToOne(time, duration))

  rocket.x = pos.x
  rocket.y = pos.y

  // setTimeout(startRocket, 2000)
  // setTimeout(destroyRocket, 6000)
}

function startRocket() {
  isRocketMoving = true
}



async function createRocket(image: string) {
  const container = new PIXI.Container();
  const gameObject = PIXI.Sprite.from(image)

  if (isSmallerDevice) {
    flame = await rocketFlame(0.4)
    gameObject.scale.x = 0.2
    gameObject.scale.y = 0.2
  } else {
    flame = await rocketFlame(0.7)
    gameObject.scale.x = 0.3
    gameObject.scale.y = 0.3
  }

  // center the sprite's anchor point
  gameObject.anchor.set(0.5)
  container.addChild(flame)
  container.addChild(gameObject)

  return container
}

async function destroyRocket() {
  if (rocket == null) return
  blast = await createBlast()
  blast.x = rocket.x
  blast.y = rocket.y
  app.stage.addChild(blast)

  // remove rocket
  app.stage.removeChild(rocket)
  rocket = null
}

async function createBlast() {
  let scale = 0
  if (isSmallerDevice) {
    scale = 0.35
  } else {
    scale = 0.5
  }


  const animatedSprite = new PIXI.AnimatedSprite(blastTextures)

  // Set animation properties
  animatedSprite.animationSpeed = 0.1;
  animatedSprite.loop = false;

  animatedSprite.anchor.set(0.5)
  // Start the animation
  animatedSprite.play();

  // Optionally, you can position and scale the sprite
  // animatedSprite.position.set(x, y); // Set the desired position
  animatedSprite.scale.set(scale, scale);

  return animatedSprite
}


function drawRocketTail(width: number, color: number, alpha: number) {

  const graphics = new PIXI.Graphics();

  graphics.lineStyle(width, color, alpha);

  graphics.moveTo(start.x, start.y);

  graphics.quadraticCurveTo(control.x, control.y, end.x, end.y);

  return graphics

}


async function createBackground() {

  const container = new PIXI.Container();
  const background1 = PIXI.Sprite.from(backgroundTexture!!);
  const background2 = PIXI.Sprite.from(backgroundTexture!!);

  container.addChild(background1);
  container.addChild(background2)
  background2.y = background1.height


  // calculating scale factor
  let scale = 1

  if (app.screen.width > app.screen.height) {
    scale = app.screen.width / container.width
  } else {
    scale = app.screen.height / container.width
  }

  container.scale.set(scale)
  backgroundHeight = container.height
  app.stage.addChild(container)

  return container
}

function trailContainer() {
  const container = new PIXI.Container();
  if (isSmallerDevice) {
    container.addChild(drawRocketTail(15, 0xf3e300, 0.15))
    container.addChild(drawRocketTail(2, 0xf3e300, 1))
  } else {
    container.addChild(drawRocketTail(20, 0xf3e300, 0.15))
    container.addChild(drawRocketTail(4, 0xf3e300, 1))
  }

  return container
}


async function rocketFlame(scale: number) {

  const animatedSprite = new PIXI.AnimatedSprite(flameTextures);

  // Set animation properties
  animatedSprite.animationSpeed = 0.2;
  animatedSprite.loop = true;

  if (isSmallerDevice) {
    animatedSprite.anchor.set(1.23, 0.5)
  } else {
    animatedSprite.anchor.set(1.19, 0.5)
  }


  // Start the animation
  animatedSprite.play();

  animatedSprite.scale.set(scale, scale);

  return animatedSprite
}


// update every frame
function main(delta: number) {
  if (rocket == null || isRocketMoving == false) {

    // update train mask
    if (trail != null) {
      trail.mask = new PIXI.Graphics()
        .beginFill(0x000000)
        .drawRect(offset, offset, 0, app.screen.bottom)
        .endFill();
    }
  }

  delta = delta / 60

  // animate the rocket if it is ideal
  if (rocket != null && isRocketMoving == false) {

  }

  if (isRocketMoving == false || rocket == null) return

  time += delta
  if (time > duration) time = duration

  // move background if rocket reach the limit

  if (background != null) {
    background.y += backgroundSpeed * delta
    if (background.y > 0) {
      background.y = -backgroundHeight / 2
    }
  }

  rocket.angle = tangentToDegree(mapToOne(time, duration))
  let pos = getCurvePoint(mapToOne(time, duration))

  rocket.x = pos.x
  rocket.y = pos.y

  // update train mask
  if (trail != null) {

    if (isSmallerDevice) {
      trail.mask = new PIXI.Graphics()
        .beginFill(0x000000)
        .drawRect(offset, rocket.y - 15, rocket.x - rocket.width / 4, app.screen.bottom)
        .endFill();
    } else {
      trail.mask = new PIXI.Graphics()
        .beginFill(0x000000)
        .drawRect(offset, rocket.y - 15, rocket.x - rocket.width / 2, app.screen.bottom)
        .endFill();
    }

  }
}


// function easingFunction(progress: number) {
//   return Math.sin(progress * Math.PI * 2);
// }

function getCurvePoint(t: number) {
  const x = (1 - t) * (1 - t) * start.x + 2 * (1 - t) * t * control.x + t * t * end.x;
  const y = (1 - t) * (1 - t) * start.y + 2 * (1 - t) * t * control.y + t * t * end.y;
  return { x: x, y: y }
}


// map the value between 0 to 1
function mapToOne(value: number, max: number) {
  return value / max
}


function tangentToDegree(t: number) {
  const tangent = new PIXI.Point();

  // Calculate the direction vector at t
  tangent.x = 2 * (1 - t) * (control.x - start.x) + 2 * t * (end.x - control.x);
  tangent.y = 2 * (1 - t) * (control.y - start.y) + 2 * t * (end.y - control.y);

  // Calculate the angle in radians
  const angleRadians = Math.atan2(tangent.y, tangent.x);

  // Convert the angle to degrees
  const angleDegrees = angleRadians * (180 / Math.PI);

  return angleDegrees;
}



// Listen for animate update
app.ticker.add(main);
